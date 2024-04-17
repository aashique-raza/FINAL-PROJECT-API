import mongoose from 'mongoose'
import User from './user.model.js'

const locationSchema = new mongoose.Schema({
    city: {
        type: String,
        required: true
    },
    pincode: {
        type: String,
        required: true
    },
    street: {
        type: String,
        required: true
    },
    flatName: String,
    colony: String
});

const propertySchema = new mongoose.Schema({
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: User,
        required: true
    },
    type: {
        type: String,
        enum: ['house', 'flat', 'PG'],
        required: true
    },
    location: {
        type: locationSchema,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    rentAmount: {
        type: Number,
        required: true
    },
    securityDeposit: {
        type: Number,
        required: true
    },
    bedrooms: {
        type: Number,
        required: true
    },
    bathrooms: {
        type: Number,
        required: true
    },
    guest:{
        type:Number,
        required:true
    },
    furnished: {
        type: Boolean,
        default: false
    },
    amenities: [String], // Array of strings for amenities
    availability: {
        type: Date,
        required: true
    },
     // Optional field for property highlights
     highlights: [String],
     // Array of image URLs for the property
    images: [String]
});

const Property = mongoose.model('Property', propertySchema);

export default Property;
