import mongoose from "mongoose";
import Rental from './rental.model.js'

const guestUser=mongoose.Schema({
    email:{
        type:String,
        required:true
    },
    phoneNumber:{
        type:Number,
        required:true
    },
    contactedProperty:[{
        type: mongoose.Schema.Types.ObjectId,
        ref:Rental,
        required:true
    }]
    

})


const GuestUser=mongoose.model('guestuser',guestUser)

export default GuestUser