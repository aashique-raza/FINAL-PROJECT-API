import PG from "../models/pg.model.js";
import errorHandler from "../utility/errorHandler.utility.js";
import uploadImages from "../utility/cloudinary.upload.js";
import uploadImagesToCloudinary from "../utility/cloudinary.upload.js";
import { type } from "os";

// next(errorHandler(403,'please fill all required field'))

const addPgProperty = async (req, res, next) => {
 
  const {
    roomSharing,
    balcony,
    availableFor,
    rentAmount,
    depositAmount,
    city,
    state,
    localAddress,
    laundary,
    description,
    doorClosingTime,
    kitchen,
    pgOrHostelName,
    placeAvaibility,
    roomCleaning,
    warden,
    foodAvaibility,
    foodType,
    ameinites,
    pgRules,
    roomFacilities,
  } = req.body;

console.log(rentAmount,depositAmount,typeof rentAmount, typeof depositAmount)

  try {
    
  
    let rentAMountNumber;
    let depositAmountNumber;
    if(rentAmount){
      rentAMountNumber=parseInt(rentAmount)
    }
    if(depositAmount){
      depositAmountNumber=parseInt(depositAmount)
    }

    console.log(rentAMountNumber,depositAmountNumber)
    if(!roomSharing){
      // later on you can make a middleware an there you check all required filed
      return next(errorHandler(403,'room sharing field is required'))
    }
    if(!balcony){
      return next(errorHandler(403,'balcony field is required'))
    }
    if(!availableFor){
      return next(errorHandler(403,'available for field is required'))
    }
    if(!state){
      return next(errorHandler(403,'state field is required'))
    }
    if(!city){
      return next(errorHandler(403,'city field is required'))
    }
   
    if(!localAddress){
      return next(errorHandler(403,'local addresss field is required'))
    }
    if(!roomFacilities){
      return next(errorHandler(403,'room facility field is required'))
    }
    if(!warden){
      return next(errorHandler(403,'warden field is required'))
    }
    if(!description ){
      return next(errorHandler(403,'dexcription field is required'))
    }
    if(!rentAMountNumber>0){
      return next(errorHandler(403,'rent field is required'))
    }
    if(!depositAmountNumber>0){
      return next(errorHandler(403,'deposit field is required'))
    }
    if(rentAMountNumber<!depositAmountNumber){
      return next(errorHandler(403,'deposit  can not be less than rent '))
    }
    if(!laundary){
      return next(errorHandler(403,'laundary field is required'))
    }
    if(!doorClosingTime){
      return next(errorHandler(403,'door closing field is required'))
    }
    if(!kitchen){
      return next(errorHandler(403,'kitchen field is required'))
    }
    if(!pgOrHostelName){
      return next(errorHandler(403,'pg/hostel name field is required'))
    }
    if(!roomCleaning){
      return next(errorHandler(403,'room cleaning field is required'))
    }
    if(!foodAvaibility){
      return next(errorHandler(403,'food avaibility field is required'))
    }

    if (!req.files.length > 0) {
      return next(errorHandler(403, "please upload images"));
    }
    const imageUrls = await uploadImagesToCloudinary(
      req.files,
      req.user.userId
    );

    // console.log(imageUrls);
    if (!imageUrls.length > 0) {
      return next(errorHandler(500,'internal server error'));
    }

    const newListing = new PG({
      owner: req.user.userId,
      roomSharing,
      location: {
        city,
        state,
        localAddress,
      },
      balcony,
      availableFor,
      rentAmount,
      depositAmount,
      laundary,
      description,
      doorClosingTime,
      kitchen,
      pgOrHostelName,
      placeAvaibility,
      roomCleaning,
      warden,
      foodAvaibility,
      foodType,
      ameinites,
      pgRules,
      roomFacilities,
      images: imageUrls,
    });

    const lsiting=await newListing.save()

    res.json({success:true, msg: "create listing successfull" ,lsiting});
  } catch (error) {
    console.log(error.message);
    next(errorHandler(500,'internal server error'))
  }
};

export { addPgProperty };
