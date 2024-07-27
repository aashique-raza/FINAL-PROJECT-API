import {
  validateEmail,
  validatePassword,
  hashPassword,
} from "../utility/user.utility.js";
import errorHandler from "../utility/errorHandler.utility.js";
import User from "../models/user.model.js";
import sendMail from "../utility/mail.utility.js";
import jwt from "jsonwebtoken";
import Rent from "../models/rental.model.js";
import PG from "../models/pg.model.js";
import nodemailer from "nodemailer";


async function senOwnerDetailsOnMail(email,owner){
  try {
    // Create a nodemailer transporter using your email service credentials
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      requireTLS: true,
      auth: {
        // TODO: replace `user` and `pass` values from <https://forwardemail.net>
        user: process.env.AUTH_USER,
        pass: process.env.AUTH_PASSWORD,
      },
    });

  

    let mailOptions = {
      from: process.env.AUTH_USER,
      to: email,
      subject: "your Request For - Owner details", // Email subject
      html: `This is the property owner details, contact as soon as possible. Thank you. <br><br>
             <b> Name:</b> ${owner.firstName}   ${owner.lastName}<br>
            
             <b>Email:</b> ${owner.email} <br>
             <b>Phone Number:</b> ${owner.phoneNumber}`
    };
    

    // Send the email
    const result = await transporter.sendMail(mailOptions);
    return result
   
  } catch (error) {
    
    console.log("sending owner details failed", error);
  }
}


const logOut = async (req, res) => {
  const userId=req.user.userId
  try {

    const user=await User.findById(userId)
    user.refreshToken=null;
    await user.save()
    // Clear the token cookie
    res.clearCookie("access_token");
    res.clearCookie("refresh_token");

    res.status(200).json({ success: true, msg: "Logged out successfully" });
  } catch (error) {
    console.log(`Failed logout ${error}`);
    next(errorHandler(500, "Internal server error"));
  }
};

const updateAccount = async (req, res, next) => {
  const { firstName, lastName, email, phoneNumber, profileImage } = req.body;

  
  const { userID } = req.params;

  try {
    if (req.user.userId !== userID) {
      return next(errorHandler(400, "you are not authenticated"));
    }

    const user = await User.findOne({ _id: userID });

    if (email) {
      const checkValidEmail = validateEmail(email);
      if (!checkValidEmail) {
        return next(errorHandler(403, "please enter valid email"));
      }
    }

    //  update user--

    const updatedUser = await User.findByIdAndUpdate(
      userID,
      {
        $set: {
          firstName: firstName,
          lastName: lastName,
          email: email,
          phoneNumber: phoneNumber,
          profileImage: profileImage,
        },
      },
      { new: true }
    );
 

    res
      .status(200)
      .json({ success: true, msg: "user successfully updated", updatedUser });
  } catch (error) {
    console.log(error);
    next(errorHandler(500, "internal server error"));
  }
};

const changePassword = async (req, res, next) => {
  const { userID } = req.params;
  const { newPassword } = req.body;
  try {
    if (req.user.userId.trim() !== userID.trim()) {
      return next(errorHandler(403, "unauthorized request"));
    }
    if (!newPassword) {
      return next(errorHandler(402, "password field empty"));
    }

    // Validate password
    const verificationResult = validatePassword(newPassword);
    if (!verificationResult) {
      return next(
        errorHandler(
          403,
          "Invalid password! Password must be 8 characters long including one capital letter, special character, and number"
        )
      );
    }

    // Hash password
    const hashedPassword = hashPassword(newPassword);
    if (!hashedPassword) {
      // return next(errorHandler(500, 'Something went wrong, please try again later'));
      return res.json({ success: false, msg: "something went wrong" });
    }

    const updateUserPass = await User.findOneAndUpdate(
      { _id: userID.trim() },
      { $set: { password: hashedPassword } },
      { new: true }
    );

    res
      .status(200)
      .json({ success: true, msg: "password changed successfully" });
  } catch (error) {
    console.log(`change password failed ${error.message}`);
    next(errorHandler(500, "internal server error"));
  }
};

const sendVerifivationMail = async (req, res, next) => {
  const { email } = req.body;
  const { userID } = req.params;
  // console.log(email, userID);

  try {
    if (req.user.userId.trim() !== userID.trim()) {
      return next(errorHandler(403, "unauthorized request"));
    }
    const findUser = await User.findOne({ email: email });
    // verify-email?token=${verificationToken}

    const token = jwt.sign(
      { userId: findUser._id },
      process.env.VERIFICATION_SECRET_KEY,
      {
        expiresIn: "15m",
      }
    );

    const mailResult = await sendMail(findUser, token, true);

    if (mailResult.response) {
      return res.status(200).json({
        success: true,
        mailrespons: mailResult.response,
        msg: "verification link sent successfully",
        id: findUser._id,
        token: token,
      });
    } else {
      return next(errorHandler(500,'internal server error'))
    }
  } catch (error) {
    console.error("Error sending verification email:", error);
    next(errorHandler(500,'internal server error'))
    
  }
};

const verifyMail = async (req, res, next) => {
  try {
    // console.log(req.query)
    const { user, verificationToken } = req.query;
    // console.log(id,reset)

    if (user.trim() !== req.user.userId.trim()) {
      return next(errorHandler(403, "bad request"));
    }

    const tokenVerify = jwt.verify(
      verificationToken,
      process.env.VERIFICATION_SECRET_KEY
    );

    if (!tokenVerify)
      return next(errorHandler(404, "invalid link please try again"));

    const findUser = await User.findOne({ _id: user.trim() });

    if (!findUser) {
      next(errorHandler(404, "user not found"));
    }

    // Update isEmailVerified field to true
    findUser.isEmailVerified = true;
    await findUser.save();

    const verifiedUser = await User.findOne({ _id: user.trim() });

    res
      .status(200)
      .json({ success: true, msg: "mail verified!", verifiedUser });
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      // Token has expired
      return next(errorHandler(500, "link has expired"));
    } else if (error instanceof jwt.JsonWebTokenError) {
      // Invalid token
      return next(errorHandler(500, "inavlid token"));
    } else {
      // Other error occurred
      console.error("Token verification failed:", error);
      return next(errorHandler(500, "internal server error"));
    }
  }
};

const deleteAccount = async (req, res, next) => {
  const { userID } = req.params;
  try {
    if (req.user.userId.trim() !== userID.trim()) {
      return next(errorHandler(403, "unauthorized request"));
    }

    // Find the user by ID and delete it
    const deletedUser = await User.findByIdAndDelete(userID);

    res.status(200).json({ success: true, msg: "acccount deleted!" });
  } catch (error) {
    console.log(`delete account failed ${error.message}`);
    next(errorHandler(500, "internal server error"));
  }
};

const userGetOwnerDetails = async (req, res, next) => {
  const { userid, propertyid, category } = req.params;

  try {
    if (req.user.userId !== userid) {
      return next(errorHandler(403, "Unauthorized request"));
    }

    let findProperty;
    // Find property based on category
    if (category === "rental") {
      findProperty = await Rent.findById(propertyid).populate("owner");
    } else if (category === "pg") {
      findProperty = await PG.findById(propertyid).populate("owner");
    } else {
      return next(errorHandler(400, "Invalid category"));
    }

    if (!findProperty) {
      return next(errorHandler(404, "Property not found"));
    }

    // Update User model with contacted property details
    const user = await User.findById(userid);
    if (!user) {
      return next(errorHandler(404, "User not found"));
    }

    // Check if the property already exists in contactedProperty array
    const alreadyContacted = user.contactedProperty.some(cp => cp.propertyId.equals(propertyid));
    if (!alreadyContacted) {
      user.contactedProperty.push({
        propertyId: propertyid,
        propertyType: category === "rental" ? "Rent" : "PG"
      });
      await user.save();
    }

    // Update Property model with user details
    findProperty.contactByUser.push(userid);
    await findProperty.save();

    // Send owner details to user via email
    const sendingStatus = await senOwnerDetailsOnMail(user.email, findProperty.owner);
    if (!sendingStatus.response) {
      return next(errorHandler(501, "Failed to send owner details. Please try again later."));
    }

    res.json({ msg: "Check your mail, owner details sent successfully", success: true });

  } catch (error) {
    console.error('User get owner details failed', error);
    return next(errorHandler(500, 'Internal server error'));
  }
};

const addFavoriteProperty = async (req, res, next) => {
  const { userId } = req.params;
  const { propertyId, category } = req.body;

  try {
    if (req.user.userId !== userId) {
      return next(errorHandler(403, "unauthorized request"));
    }

    const user = await User.findById(userId);

    if (!user) {
      return next(errorHandler(404, 'User not found'));
    }

    const favoriteExists = user.userFavorites.some(favorite => favorite.propertyId.toString() === propertyId);

    if (!favoriteExists) {
      user.userFavorites.push({
        propertyId,
        propertyType: category === 'rental' ? 'Rent' : 'PG',
        isFavorite: true
      });

      await user.save();

      const updatedProperty = await (category === 'rental' ? Rent : PG).findByIdAndUpdate(propertyId, {
        isPropertyFavorite: true,
        $addToSet: { addFavoritesByUser: userId }
      }, { new: true });

      res.json({ msg: 'Property added to favorites', updatedProperty, success: true });
    } else {
      res.status(400).json({ msg: 'Property already in favorites' });
    }
  } catch (error) {
    next(errorHandler(500, 'Internal server error'));
    console.log('Add to favorite failed', error);
  }
};


const removeFavoriteProperty = async (req, res, next) => {
  const { userId } = req.params;
  const { propertyId, category } = req.body;
console.log(category)
  try {
    if (req.user.userId !== userId) {
      return next(errorHandler(403, "unauthorized request"));
    }

    const user = await User.findById(userId);

    if (!user) {
      return next(errorHandler(404, 'User not found'));
    }

    // Remove property from user's favorites
    user.userFavorites = user.userFavorites.filter(favorite => favorite.propertyId.toString() !== propertyId);

    await user.save();

    // Check property type and update accordingly
    const propertyModel = category === 'rental' ? Rent : PG;
    const updatedProperty = await propertyModel.findByIdAndUpdate(propertyId, {
      $pull: { addFavoritesByUser: userId }
    }, { new: true });

    if (!updatedProperty) {
      return next(errorHandler(404, 'Property not found'));
    }

    res.json({ msg: 'Property removed from favorites', updatedProperty, success: true });
  } catch (error) {
    next(errorHandler(500, 'Internal server error'));
    console.log('Remove from favorite failed', error);
  }
};






const getFavoritesProperty = async (req, res, next) => {
  const { userId } = req.params;

  try {
    if (req.user.userId !== userId) {
      return next(errorHandler(403, "Unauthorized request"));
    }

    const user = await User.findById(userId);

    if (!user) {
      return next(errorHandler(404, 'User not found'));
    }

    let allFavouriteData = [];

    const populatedFavorites = await Promise.all(user.userFavorites.map(async (favorite) => {
      let data = null;

      if (favorite.propertyType === 'Rent') {
        data = await Rent.findById(favorite.propertyId);
      } else if (favorite.propertyType === 'PG') {
        data = await PG.findById(favorite.propertyId);
      }

      if (!data) {
        // If the property is not found, throw an error
        next(errorHandler(404,'favourite property not found'))
        return
        
      }

      allFavouriteData.push(data);
      return favorite;
    }));

    // console.log('All favorite properties:', allFavouriteData);

    res.json({ favorites: allFavouriteData ,success:true,msg:'property found'});
  } catch (error) {
    if (error.message.startsWith('Property not found')) {
      return next(errorHandler(404, error.message));
    } else {
      next(errorHandler(500, 'Internal server error'));
    }
    console.log('Get favorites failed', error);
  }
};



const userContactProperty=async(req,res,next)=>{
  const{userId}=req.params 
  
  try {
    if (req.user.userId !== userId) {
      return next(errorHandler(403, "unauthorized request"));
    }
    const user = await User.findById(userId).populate('contactedProperty.propertyId');

    if (!user) {
      return next(errorHandler(404, 'User not found'));
    }

    // Manually populate contacted properties
    const contactedProperty = await Promise.all(user.contactedProperty.map(async (contact) => {
      const propertyModel = contact.propertyType === 'PG' ? PG : Rent;
      const propertyDetails = await propertyModel.findById(contact.propertyId);
      return {
        ...contact.toObject(),
        propertyDetails
      };
    }));

    console.log('property',contactedProperty)


    res.json({ msg: 'user contact property found', contactedProperty, success: true });
  } catch (error) {
    next(errorHandler(500, 'Internal server error'));
    console.log('user contact property failed', error);
  }
}


const accessRefreshToken=async (req,res,next)=>{
  // console.log('token checkinhg...',req.body)
  const  incomingRefreshToken  = req.body.refreshToken || req.cookie.refreshToken;
  // console.log('incomingRefreshToken',incomingRefreshToken)
  if (!incomingRefreshToken) {
    return next(errorHandler(403, "No refresh token provided"));
  }

  try {
    const decoded =await jwt.verify(incomingRefreshToken, process.env.JWT_REFRESH_SECRET_KEY);
    if(!decoded){
      return next(errorHandler(403,'token expire or token used'))
    }
    const userId = decoded.userId;
    const user=await User.findById(userId)

    if(!user){
      return next(errorHandler(403,'token expire or token used'))
    }

    if(incomingRefreshToken !== user?.refreshToken){
      return next(errorHandler(403,'token expire or token used'))
    }

    const newAccessToken = jwt.sign(
      { userId },
      process.env.JWT_SECRET_KEY,
      { expiresIn: '30m' }
    );

    const minutesInMilliseconds = 30 * 60 * 1000; // 3 days in milliseconds
    res.cookie("access_token", newAccessToken, {
      httpOnly: true,
      maxAge: minutesInMilliseconds,
      secure: true
    });

    res.status(200).json({ accessToken: newAccessToken,success:true,msg:'sucessfully genrated new access token' });
  } catch (error) {
    console.log(`Failed to refresh token ${error}`);
    next(errorHandler(403, "Invalid refresh token"));
  }
}







export {
  userContactProperty,
  updateAccount,
  logOut,
  changePassword,
  sendVerifivationMail,
  verifyMail,
  deleteAccount,
  userGetOwnerDetails,
  addFavoriteProperty,
  getFavoritesProperty,
  removeFavoriteProperty,
  accessRefreshToken
};
