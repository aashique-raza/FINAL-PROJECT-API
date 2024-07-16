import mongoose from 'mongoose';

const contactUsSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    match: [/\S+@\S+\.\S+/, 'is invalid'], // Email validation
    index: true, // Index for improved search performance
  },
  mobile: {
    type: String, // Changed to String to accommodate international formats
    required: true,
    minlength: 10,
    maxlength: 15,
    match: [/^\+\d{1,3}\d{10}$/, 'is invalid'], // Regex for international format
  },
  message: {
    type: String,
    required: true,
    maxlength: 1000, // Assuming a max length for the message
  },
}, { timestamps: true });

const ContactUs = mongoose.model('ContactUs', contactUsSchema);

export default ContactUs;
