import {
  validateEmail,
  validatePassword,
  hashPassword,
} from "../utility/user.utility.js";
import errorHandler from "../utility/errorHandler.utility.js";
import User from "../models/user.model.js";
import sendMail from "../utility/mail.utility.js";
import jwt from "jsonwebtoken";

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
      return res
        .status(200)
        .json({
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

    const verifiedUser=await User.findOne({_id:user.trim()})

    res.status(200).json({ success: true, msg: "mail verified!" ,verifiedUser});
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

export {
  updateAccount,
  logOut,
  changePassword,
  sendVerifivationMail,
  verifyMail,
  deleteAccount,
};
