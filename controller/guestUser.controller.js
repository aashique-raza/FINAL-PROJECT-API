import errorHandler from "../utility/errorHandler.utility.js";
import GuestUser from "../models/gusetUser.model.js";
import nodemailer from "nodemailer";
import Rent from "../models/rental.model.js";
import PG from '../models/pg.model.js'

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

    const otp = generateOTP();

    console.log(parseInt(otp));

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
    // next(err(500, "internal server error"));
    console.log("sending owner details failed", error);
  }
}

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

const getOwnerDetails = async (req, res, next) => {
  const { email, mobile } = req.body;
  const { propertyId, category } = req.params;

  console.log(req.body);
  console.log(req.params);

  try {
    let findProperty;
    // return res.json({msg:'data aa rha hau'})

    // Find property based on category
    if (category === 'rental') {
      findProperty = await Rent.findById(propertyId).populate('owner');
    } else if (category === 'pg') {
      findProperty = await PG.findById(propertyId).populate('owner');
    } else {
      return next(errorHandler(400, 'Invalid category'));
    }

    if (!findProperty) {
      return next(errorHandler(403, 'Property not found'));
    }

    // Find guest user by email
    let findUser = await GuestUser.findOne({ email: email });

    if (findUser) {
      // Update guest user with property ID
      findUser.contactedProperty.push(findProperty._id);
    } else {
      // Create new guest user
      findUser = new GuestUser({
        email: email,
        phoneNumber: parseInt(mobile),
        contactedProperty: [findProperty._id],
        contactedPropertyModel: category === 'rental' ? 'Rent' : 'PG'
      });
    }

    await findUser.save();

    // Update property with guest user ID
    findProperty.contactByUser.push(findUser._id);
    await findProperty.save();

    let {owner}=findProperty
    console.log('owner details',owner)


   
   let sendingStatus=await senOwnerDetailsOnMail(findUser.email,owner)

   if(!sendingStatus.response){
    next(errorHandler(501,'server error please try again later'))
   }

   res.json({msg:'send owner details successfully',success:true})


    // return res.json({ owner: findProperty.owner });
  } catch (error) {
    next(errorHandler(500, 'Internal server error'));
    console.log('Get owner details failed:', error.message);
  }
};




export { testing, verifyGuestUserEmail,getOwnerDetails };


