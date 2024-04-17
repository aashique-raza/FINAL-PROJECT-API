
import mongoose from "mongoose";

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
   
})

const User=mongoose.model('user',userSchema)

export default User