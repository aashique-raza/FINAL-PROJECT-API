import mongoose from "mongoose";
import Rent from './rental.model.js'
import PG from "./pg.model.js";

const guestUserSchema = mongoose.Schema({
    email: {
        type: String,
        required: true
    },
    phoneNumber: {
        type: Number,
        required: true
    },
    contactedProperty: [{
        propertyId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true
          },
          propertyType: {
            type: String,
            required: true,
            enum: ['Rent', 'PG']
          }

    }],
   
});



const GuestUser=mongoose.model('guestuser',guestUserSchema)

export default GuestUser