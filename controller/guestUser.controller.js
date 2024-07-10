import errorHandler from "../utility/errorHandler.utility.js";
import GuestUser from "../models/gusetUser.model.js";
import nodemailer from "nodemailer";

const testing = (req, res) => {
  res.json({ msg: "working....." });
};

const generateOTP = () => {
  let otpLength = 6;
  let otpCharacters = "1234567890";
  let otp = "";

  for (let i = 0; i < otpLength; i++) {
    let index = Math.floor(Math.random() * otpCharacters.length);
    otp += otpCharacters[index];
  }

  return otp;
};

const verifyGuestUserEmail = async (req, res, next) => {
  const { email } = req.body;
  console.log(req.body)
  console.log(email)

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

    const otp = generateOTP();

    console.log(parseInt(otp));

    let mailOptions = {
      from: process.env.AUTH_USER,
      to: email,
      subject: "Verify your email address", // Email subject
      html: `this is your email verification otp ${otp}
                `,
    };

    // Send the email
    const result = await transporter.sendMail(mailOptions);
    if (!result.response) {
      return next(errorHandler(403, "email verification failed!"));
    }
    res.json({ msg: "mail sending successuly", result, success: true,otp });
  } catch (error) {
    next(errorHandler(500, "internal server error"));
    console.log("verify guest user failed", error);
  }
};

export { testing, verifyGuestUserEmail };
