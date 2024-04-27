import PG from "../models/pg.model.js";
import errorHandler from "../utility/errorHandler.utility.js";
import uploadImages from "../utility/cloudinary.upload.js";
import uploadImagesToCloudinary from "../utility/cloudinary.upload.js";

// next(errorHandler(403,'please fill all required field'))

const addPgProperty = async (req, res, next) => {
  // console.log("ye body hai ", req.body);
  // console.log("yeh files hai ", req.files);
  // console.log('ye controller me hai',req.cookies.token);
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

  // const { images } = req.files;

  try {
    if (
      !roomSharing ||
      !balcony ||
      !availableFor ||
      !rentAmount > 0 ||
      !depositAmount ||
      !city ||
      !state ||
      !localAddress ||
      !laundary ||
      !description ||
      !doorClosingTime ||
      !kitchen ||
      !pgOrHostelName ||
      !placeAvaibility ||
      !roomCleaning ||
      !warden ||
      !foodAvaibility
    ) {
      return next(errorHandler(403, "please fill all required field"));
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

    const saveListing=await newListing.save()

    res.json({success:true, msg: "create listing successfull" });
  } catch (error) {
    console.log(error.message);
    next(errorHandler(500,'internal server error'))
  }
};

export { addPgProperty };
