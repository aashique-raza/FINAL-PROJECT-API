import mongoose from "mongoose";
import User from "./user.model.js";
// import GuestUser from "./guestUser.model.js";  // Make sure the filename is correct

const locationSchema = new mongoose.Schema({
  city: {
    type: String,
    required: true,
  },
  localAddress: {
    type: String,
    required: true,
  },
  state: {
    type: String,
    required: true,
  },
});

const rentSchema = new mongoose.Schema({
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',  // Use the model name as a string
    required: true
  },
  apartmentType: {
    type: String,
    required: true,
  },
  BHKType: {
    type: String,
    required: true,
  },
  propertyAge: {
    type: String,
    required: true,
  },
  facing: {
    type: String,
    required: false,
  },
  totalFloor: {
    type: Number,
    required: true,
  },
  floor: {
    type: Number,
    required: true,
  },
  builtUpArea: {
    type: Number,
    required: true,
  },
  apartmentName: {
    type: String,
    required: false,
  },
  propertyAvailableFor: {
    type: String,
    required: true,
  },
  preferedTenats: {
    type: Array,
    required: true,
  },
  rentAmount: {
    type: Number,
    required: true,
  },
  depositAmount: {
    type: Number,
    required: true,
  },
  monthlyMaintenance: {
    type: String,
    required: true,
  },
  maintenanceAmount: {
    type: Number,
    required: false,
    default: 0
  },
  availableFrom: {
    type: Date,
    required: true,
  },
  furnishing: {
    type: String,
    required: false,
  },
  parking: {
    type: String,
    required: false,
  },
  description: {
    type: String,
    required: true,
  },
  location: {
    type: locationSchema,
    required: true,
  },
  bedroom: {
    type: Number,
    required: true
  },
  balcony: {
    type: Number,
    required: true
  },
  guest: {
    type: Number,
    required: true
  },
  bathroom: {
    type: Number,
    required: false
  },
  electricity: {
    type: String,
    required: true
  },
  waterSupply: {
    type: String,
    required: true
  },
  availableAmenities: {
    type: Array,
    required: false
  },
  images: {
    type: Array,
    required: true
  },
  isPropertyActive: {
    type: Boolean,
    default: false
  },
  contactByUser: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'GuestUser',  // Use the model name as a string
    required: true
  }],
  isPropertyFavorite: {
    type: Boolean,
    default: false
  },
  addFavoritesByUser: [{
    type:mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }]
});

const Rent = mongoose.model('Rent', rentSchema);
export default Rent;
