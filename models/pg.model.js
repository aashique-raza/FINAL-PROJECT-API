import mongoose, { mongo } from "mongoose";
import User from "./user.model.js";

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

const pgSchema = mongoose.Schema({
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: User,
    required: true
},
  roomSharing: {
    required: true,
    type: String,
  },
  location: {
    type: locationSchema,
    required: true,
  },
  balcony: {
    required: true,
    type: Boolean,
  },
  kitchen: {
    required: true,
    type: Boolean,
  },
  depositAmount: {
    required: true,
    type: Number,
  },
  rentAmount: {
    required: true,
    type: Number,
  },
  pgOrHostelName: {
    required: true,
    type: String,
  },
  placeAvaibility: {
    required: true,
    type: String,
  },
  roomCleaning: {
    required: true,
    type: Boolean,
  },
  warden: {
    required: true,
    type: Boolean,
  },
  roomFacilities: {
    required: true,
    type: Array,
    default:[]
  },
  ameinites: {
    required: true,
    type: Array,
    default:[]
  },
  images: {
    required: true,
    type: Array,
    default:[]
  },
  pgRules: {
    required: true,
    type: Array,
    default:[]
  },
  doorClosingTime: {
    required: true,
    type: String,
  },
  foodAvaibility: {
    required: true,
    type: Boolean,
  },
  foodType: {
    required: false,
    type: String,
    default:'veg'
  },
  laundary: {
    required: true,
    type: Boolean,
    
  },
availableFor:{
    required: true,
    type: String,
    default:'anyone'
  },
  description:{
    required: true,
    type: String,
    default:' '
  },

});


const PG=mongoose.model('pg',pgSchema)


export default PG

