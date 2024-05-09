import {
  hashPassword,
  validateEmail,
  validatePassword,
  generateRandomPassword,
} from "../utility/user.utility.js";

import errorHandler from "../utility/errorHandler.utility.js";

import User from "../models/user.model.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import sendMail from "../utility/mail.utility.js";

const createAccount = async (req, res, next) => {
  const { firstName, lastName, email, phoneNumber, password } = req.body;

  if (!firstName || !lastName || !email || !phoneNumber || !password) {
    return next(errorHandler(500, "All fields are required"));
  }

  try {
    const mobileNumber = parseInt(phoneNumber);

    // Check if user already exists
    const existsEmail = await User.findOne({ email: email });
    if (existsEmail) {
      return next(errorHandler(403, "user already exists"));
    }

    //   check phoneNumber--
    const existPhone = await User.findOne({ phoneNumber: mobileNumber });
    if (existPhone) {
      return next(errorHandler(403, "use another mobile number"));
    }

    // Validate password
    const verificationResult = validatePassword(password);
    if (!verificationResult) {
      return next(
        errorHandler(
          403,
          "Invalid password! Password must be 8 characters long including one capital letter, special character, and number"
        )
      );
    }

    // Hash password
    const hashedPassword = hashPassword(password);
    if (!hashedPassword) {
      // return next(errorHandler(500, 'Something went wrong, please try again later'));
      return next(errorHandler(501,'something went wrong'))
    }

    // Create new user
    const newUser = new User({
      firstName,
      lastName,
      email,
      phoneNumber: mobileNumber,
      password: hashedPassword,
    });

    // Save user to database
    const user = await newUser.save();

    res.status(201).json({ success: true, msg: "user created", user });
  } catch (error) {
    // Handle errors
    console.log(`User signup failed ${error}`);
    return next(errorHandler(500, "server error please try later "));
  }
};

const loginAccount = async (req, res, next) => {
  const { email, password } = req.body;
  console.log(email,password)
  let number;
  try {
    if (!email || !password) {
      return next(errorHandler(403, "fill the empty fileds"));
    }

    // check if email is actually a number
    if (typeof email === "number") {
      number = email;
    }
    const userExists = await User.findOne({
      $or: [{ email: email }, { phoneNumber: number }],
    });

    if (!userExists) {
      return next(errorHandler(401, "user not found"));
    }

    // password verify

    const checkPassword = await bcrypt.compare(password, userExists.password);
    console.log(checkPassword);
    if (!checkPassword) {
      return next(errorHandler(401, "username or password invalid"));
    }

    // Generate JWT token with user data and expiration time of 1 day
    const token = jwt.sign(
      { userId: userExists._id },
      process.env.JWT_SECRET_KEY,
      
    );
    // console.log(token)
    // const minutesInMilliseconds = 1 * 60 * 1000; // 1 minute in milliseconds
    const minutesInMilliseconds = 3 * 24 * 60 * 60 * 1000; // 3 days in milliseconds

    res.cookie("access_token", token, {
      httpOnly: true,
      maxAge: minutesInMilliseconds,
      secure: true
    });

    const { password: pass, ...user } = userExists._doc;

    res
      .status(201)
      .json({ success: true, msg: "login seccessfully", user, token });
  } catch (error) {
    console.log(`failed login ${error}`);
    next(errorHandler(500, "internal server error"));
  }
};

const google = async (req, res, next) => {
  const { email, firstName, profileImage } = req.body;
  try {
    const userexists = await User.findOne({ email });
    if (userexists) {
      const token = jwt.sign(
        { userId: userexists._id },
        process.env.JWT_SECRET_KEY
      );
      const { password, ...user } = userexists._doc;
      // Set cookie with HTTPOnly flag
      res.cookie("token", token, { httpOnly: true });
      res.json({ success: true, msg: "login successfull", user });
    } else {
      const generatedPassword = generateRandomPassword();

      const hashedPassword = hashPassword(generatedPassword);
      const newUser = new User({
        firstName: firstName,
        email,
        password: hashedPassword,
        profilePicture: profileImage,
      });
      const savedUser = await newUser.save();
      const token = jwt.sign(
        { userId: savedUser._id },
        process.env.JWT_SECRET_KEY
      );
      // Set cookie with HTTPOnly flag
      res.cookie("token", token, { httpOnly: true });
      const { password, ...user } = savedUser._doc;
      res.json({ success: true, msg: "login successfull", user });
    }
  } catch (error) {
    console.log(`google auth failed ${error}`);
    next(errorHandler(500, "internal server error"));
  }
};

const forgotPassword = async (req, res, next) => {
  const { email } = req.body;
  try {
    if (!email) {
      return next(errorHandler(403, "email required"));
    }

    const findUser = await User.findOne({ email: email });
    if (!findUser) {
      return next(errorHandler(403, "email does not exist"));
    }

    const token = jwt.sign({ userId: findUser._id }, process.env.SECRET_KEY, {
      expiresIn: "15m",
    });

    const mailResult = await sendMail(findUser, token);
    // console.log(mailResult);

    if (mailResult.response) {
      return res
        .status(200)
        .json({
          success: true,
          mailrespons: mailResult.response,
          msg: "reset link sent successfully",
          id: findUser._id,
          token: token,
        });
    } else {
      return res
        .status(200)
        .json({ success: false, msg: "please try again later" });
    }
  } catch (error) {
    console.log(`forgot password failed ${error.message}`);
    next(errorHandler(500, " server error"));
  }
};

const resetPassword = async (req, res, next) => {
  try {
    // console.log(req.query)
    const { id, reset } = req.query;
    // console.log(id,reset)

    const tokenVerify = jwt.verify(reset, process.env.SECRET_KEY);

    if (!tokenVerify) return next(errorHandler(404, "link expired"));

    // console.log(`token id ${tokenVerify}`)

    const { password } = req.body;

    if (!password) return next(errorHandler(403, "password field empty"));

    // Validate password
    const verificationResult = validatePassword(password);
    if (!verificationResult) {
      return next(
        errorHandler(
          403,
          "Invalid password! Password must be 8 characters long including one capital letter, special character, and number"
        )
      );
    }

    // Hash password
    const hashedPassword = hashPassword(password);
    if (!hashedPassword) {
      // return next(errorHandler(500, 'Something went wrong, please try again later'));
      return next(errorHandler(501,'something went wrong'))
    }

    const updateUserPass = await User.findOneAndUpdate(
      { _id: id },
      { $set: { password: hashedPassword } },
      { new: true }
    );
    // console.log(`update user ${updateUserPass}`);

    res
      .status(200)
      .json({ success: true, msg: "password change successfully" });
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

export { createAccount, loginAccount, google, forgotPassword, resetPassword };
