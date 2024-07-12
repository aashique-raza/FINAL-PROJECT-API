
import mongoose from "mongoose";
import Rent from "./rental.model.js";
import PG from "./pg.model.js";

const userSchema=mongoose.Schema({
    firstName:{
        type:String,
        required:true,
        
    },
    lastName:{
        type:String,
        required:true,
        
    },
    email:{
        type:String,
        required:true,
        unique:true,
    },
    phoneNumber:{
        type:Number,
        required:true,
        unique:true,
    },
    password:{
        type:String,
        required:true,
        
    },
    profileImage:{
        type:String,
        default:'https://www.pngall.com/wp-content/uploads/12/Avatar-Profile-Vector-PNG-File.png'
        
    },
    isEmailVerified: {
        type: Boolean,
        default: false
    },
    contactedProperty: [{
        type: mongoose.Schema.Types.ObjectId,
        refPath: 'contactedPropertyModel',
        required: false
    }],
    contactedPropertyModel: {
        type: String,
        required: false,
        enum: ['Rent', 'PG']
    },
    userFavorites: [
        {
          propertyId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true
          },
          propertyType: {
            type: String,
            required: true,
            enum: ['Rent', 'PG']
          }
        }
      ]
   
})

const User=mongoose.model('user',userSchema)

export default User