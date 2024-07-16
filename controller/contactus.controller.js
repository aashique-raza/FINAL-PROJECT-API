import errorHandler from "../utility/errorHandler.utility.js";
import ContactUs from '../models/contactus.model.js'



const handleInquiryMessage = async (req, res, next) => {
    const { email, message, name, phone } = req.body;
  
    try {
      if (!email || !message || !name || !phone) {
        return next(errorHandler(403, 'All fields are required.'));
      }
  
      if (phone.length < 10 || phone.length > 15) {
        return next(errorHandler(403, 'Invalid phone number. It should be between 10 and 15 digits.'));
      }
  
      const inquiry = new ContactUs({
        name,
        email,
        message,
        mobile:phone
      });
  
      const result = await inquiry.save();
  
      res.status(201).json({ msg: 'Your message has been sent successfully. Thank you!', success: true });
    } catch (error) {
      console.log('Failed to receive inquiry message', error);
      next(errorHandler(500, 'Internal server error. Please try again later.'));
    }
  };
  

  

export {handleInquiryMessage}