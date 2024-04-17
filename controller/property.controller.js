import Property from '../models/property.model.js'
import errorHandler from '../utility/errorHandler.utility.js';

const addProperty = async (req, res, next) => {
    try {
        // Extract property details from request body
        const {
            owner,
            type,
            location: { city, pincode, street, colony },
            description,
            rentAmount,
            securityDeposit,
            bedrooms,
            bathrooms,
            guest,
            furnished,
            amenities,
            availability,
            highlights,
            images
        } = req.body;

        if(!owner || !type || !location || !description || !rentAmount || !securityDeposit || !bedrooms || !bathrooms || !guest || !availability ){
            return next(errorHandler(403,'please fill all required field'))
        }

        // Create a new property document
        const newProperty = new Property({
            owner,
            type,
            location: { city, pincode, street, colony },
            description,
            rentAmount,
            securityDeposit,
            bedrooms,
            bathrooms,
            guest,
            furnished,
            amenities,
            availability,
            highlights,
            images
        });

        // Save the property to the database
        await newProperty.save();

        // Send success response
        res.status(201).json({ success: true, message: 'Property added successfully.' });
    } catch (error) {
        // Handle errors
        console.error('Error adding property:', error);
        // Pass the error to the error handler utility
        next(errorHandler(500, 'Internal server error'));
    }
};

export {addProperty}