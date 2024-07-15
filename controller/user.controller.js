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
  try {
    // Clear the token cookie
    res.clearCookie("access_token");

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
    // console.log(updatedUser)

    //   const { password: pass, ...user } = updatedUser._doc;

    res
      .status(200)
      .json({ success: true, msg: "user successfully updated", updatedUser });
  } catch (error) {
    console.log(error);
    next(errorHandler(500, " server error"));
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
      return res
        .status(200)
        .json({ success: false, msg: "please try again later" });
    }
  } catch (error) {
    console.error("Error sending verification email:", error);
    res.status(500).json({ success: false, message: "Internal server error." });
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
      return next(errorHandler(403, "unauthorized request"));
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
      return next(errorHandler(403, "Property not found"));
    }


     // Find guest user by email
  let findUser = await User.findById(userid);
  findUser.contactedProperty.push(findProperty._id);
  findUser.contactedPropertyModel=category === "rental" ? "Rent" : "PG"
  await findUser.save();
  // Update property with guest user ID
  findProperty.contactByUser.push(findUser._id);
  await findProperty.save();
  
  let { owner } = findProperty;
  console.log("owner details", owner);

  let sendingStatus = await senOwnerDetailsOnMail(findUser.email, owner);

  if (!sendingStatus.response) {
    next(errorHandler(501, "server error please try again later"));
  }

  res.json({ msg: "check your mail,owner details sent successfully", success: true });


  } catch (error) {
    next(errorHandler(500,'internal server error'))
    console.log('user get owner details failed',error)
  }
};

const addFavoriteProperty = async (req, res, next) => {
  const { userId } = req.params;
  const { propertyId, category } = req.body; // propertyType should be 'Rent' or 'PG'
  console.log(req.body)
  console.log(userId)

  try {
    if (req.user.userId !== userId) {
      return next(errorHandler(403, "unauthorized request"));
    }
    const user = await User.findById(userId);

    if (!user) {
      return next(errorHandler(404, 'User not found'));
    }

    user.userFavorites.push({
      propertyId,
      propertyType: category === 'rental' ? 'Rent' : 'PG'
    });

    
    const model = category === 'rental' ? Rent : PG;
   const updatedProperty= await model.findByIdAndUpdate(propertyId, { 
      isPropertyFavorite: true,
      $addToSet: { addFavoritesByUser: userId } // Prevents duplicates
    },{new:true});

    console.log(updatedProperty)

    await user.save();
    


    res.json({ msg: 'Property added to favorites', user, success: true,updatedProperty });
  } catch (error) {
    next(errorHandler(500, 'Internal server error'));
    console.log('Add to favorite failed', error);
  }
};


const getFavoritesProperty = async (req, res, next) => {
  const { userId } = req.params;
  console.log(userId)

  try {
    if (req.user.userId !== userId) {
      return next(errorHandler(403, "unauthorized request"));
    }

    const user = await User.findById(userId);

    if (!user) {
      return next(errorHandler(404, 'User not found'));
    }

    // Fetch all favorite properties
    const favoriteProperties = await Promise.all(user.userFavorites.map(async (favorite) => {
      const model = favorite.propertyType === 'Rent' ? Rent : PG;
      const property = await model.findById(favorite.propertyId);
      return property ? { ...property.toObject(), propertyType: favorite.propertyType } : null;
    }));
    console.log(favoriteProperties)

    res.json({ msg: 'All properties fetched', favorites: favoriteProperties.filter(fav => fav !== null), success: true });
  } catch (error) {
    next(errorHandler(500, 'Internal server error'));
    console.log('Getting favorite property failed', error);
  }
};

const removeFavoriteProperty = async (req, res, next) => {
  const { userId } = req.params;
  const { propertyId, category } = req.body; // propertyType should be 'Rent' or 'PG'
  console.log(req.body)

  try {
    if (req.user.userId !== userId) {
      return next(errorHandler(403, "unauthorized request"));
    }
    const user = await User.findById(userId);

    if (!user) {
      return next(errorHandler(404, 'User not found'));
    }

    // Remove the property from the user's favorites
    user.userFavorites = user.userFavorites.filter(favorite => favorite.propertyId.toString() !== propertyId);

    // Determine the model to use based on propertyType
    const model = category === 'rental' ? Rent : PG;

    // Find the property and update its isPropertyFavorite field and remove the user from addFavoritesByUser
    const property = await model.findById(propertyId);
    console.log('property',property)
    if (property) {
      property.isPropertyFavorite = false;
      property.addFavoritesByUser = property.addFavoritesByUser.filter(favUserId => favUserId.toString() !== userId);
      await property.save();
    }

    await user.save();
    const newproperty = await model.findById(propertyId);
    console.log('new property',newproperty)

    res.json({ msg: 'Property removed from favorites', user, success: true });
  } catch (error) {
    next(errorHandler(500, 'Internal server error'));
    console.log('Remove from favorite failed', error);
  }
};







export {
  updateAccount,
  logOut,
  changePassword,
  sendVerifivationMail,
  verifyMail,
  deleteAccount,
  userGetOwnerDetails,
  addFavoriteProperty,
  getFavoritesProperty,
  removeFavoriteProperty
};
