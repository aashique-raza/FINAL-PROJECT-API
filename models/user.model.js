
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
    userProperty:[
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
    ],
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
      ],

      refreshToken:{
        type:String
      }
   
},{timestamps:true})

const User= mongoose.model('User',userSchema)

export default User