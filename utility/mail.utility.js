import nodemailer from "nodemailer";

const sendMail = async (user, token, flag = false) => {
  // console.log(email)
  // console.log(user.email,user._id)
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

    let mailOptions;

    if (flag) {
      // http://localhost:5173
      // https://rental-wave.vercel.app
      // /
      const verificationLink = `http://localhost:5173/mail-verification/?user=${user._id}&&verificationToken=${token}`;
      console.log('verification link',verificationLink)
      // Set up email data
      mailOptions = {
        from: process.env.AUTH_USER,
        to: user.email,
        subject: "Verify your email address", // Email subject
        html: `
                <p>Hi,</p>
                <p>Thank you for signing up. Please click the following link to verify your email address:</p>
                <a href="${verificationLink}">Verify Email Address</a>
                <p>If you didn't sign up for our service, please ignore this email.</p>`,
      };
    } else {
      // https://rental-wave.vercel.app/
      const link = `http://localhost:5173/reset-password/?id=${user._id}&&reset=${token}`;
      const linkExpirationDescription = "Please note that this link will expire after 15 minutes.";
      // Set up email data
       mailOptions = {
        from: process.env.AUTH_USER,
        to: user.email,
        subject: "Password Reset Request",
        html: `
            <p>${linkExpirationDescription}</p>
            <p><a href=${link}>Click here to reset your password</a></p>
        `,
    }
    }

    // Send the email
    const result = await transporter.sendMail(mailOptions);

    //   console.log('Email sent:', result);
    return result;
  } catch (error) {
    console.log(`email sending failed: ${error}`);
  }
};

export default sendMail;
