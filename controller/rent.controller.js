import errorHandler from "../utility/errorHandler.utility.js";
import uploadImages from "../utility/cloudinary.upload.js";
import uploadImagesToCloudinary from "../utility/cloudinary.upload.js";
import Rent from "../models/rental.model.js";

const createRentProperty = async (req, res, next) => {
  // console.log("body", req.body);
  // console.log("files", req.files);
  //   return res.json({msg:"testing...."})

  const {
    apartmentName,
    apartmentType,
    BHKType,
    propertyArea,
    propertyFacing,
    propertyFloor,
    propertyAge,
    totalFloor,
    availableFrom,
    depositAmount,
    description,
    furnishing,
    maintenanceAmount,
    monthlyMaintenance,
    parking,
    propertyAvailableFor,
    rentAmount,
    preferedTenats,
    city,
    localAddress,
    state,
    bedroom,
    balcony,
    bathroom,
    guest,
    availableAmenities,
    electricity,
    waterSupply,
  } = req.body;

  console.log(typeof electricity, typeof waterSupply);
  console.log(electricity, waterSupply);

  try {
    if (bedroom == 0) {
      return next(errorHandler(403, "bedroom is required field"));
    }
    if (balcony == 0) {
      return next(errorHandler(403, "balcony is required field"));
    }
    if (guest == 0) {
      return next(errorHandler(403, "guest is required field"));
    }
    if (bathroom == 0) {
      return next(errorHandler(403, "bathroom is required field"));
    }

    if (apartmentType.trim().toLocaleLowerCase() === "undefined".trim()) {
      return next(errorHandler(403, "apartment type ie required field"));
    }
    if (BHKType.trim().toLocaleLowerCase() === "undefined".trim()) {
      return next(errorHandler(403, "BHKType type ie required field"));
    }

    if (monthlyMaintenance.trim().toLocaleLowerCase() === "undefined".trim()) {
      return next(errorHandler(403, "monthly maintenance  is required field"));
    }
    if (
      monthlyMaintenance.trim().toLowerCase() ===
      "extraMaintenance".trim().toLocaleLowerCase()
    ) {
      if (maintenanceAmount.trim().toLocaleLowerCase() === "undefined".trim()) {
        return next(errorHandler(403, "maintenance ammount is required field"));
      }
    }

    if (propertyArea.trim().toLocaleLowerCase() === "undefined".trim()) {
      return next(errorHandler(403, "build up area is required field"));
    }
    if (propertyFloor.trim().toLocaleLowerCase() === "undefined".trim()) {
      return next(errorHandler(403, "property floor is required field"));
    }

    if (totalFloor.trim().toLocaleLowerCase() === "undefined".trim()) {
      return next(errorHandler(403, "total floor is required field"));
    }

    if (propertyAge.trim().toLocaleLowerCase() === "undefined".trim()) {
      return next(errorHandler(403, "property age is required field"));
    }

    if (availableFrom.trim().toLocaleLowerCase() === "undefined".trim()) {
      return next(errorHandler(403, "available from is required field"));
    }
    if (depositAmount.trim().toLocaleLowerCase() === "undefined".trim()) {
      return next(errorHandler(403, "expected deposit is required field"));
    }
    if (description.trim().toLocaleLowerCase() === "undefined".trim()) {
      return next(errorHandler(403, "description is required field"));
    }

    if (
      propertyAvailableFor.trim().toLocaleLowerCase() === "undefined".trim()
    ) {
      return next(
        errorHandler(403, "property available for is required field")
      );
    }
    if (rentAmount.trim().toLocaleLowerCase() === "undefined".trim()) {
      return next(errorHandler(403, "expected rent is required field"));
    }
    if (!preferedTenats) {
      return next(errorHandler(403, "prefered tenet is required field"));
    }
    if (state.trim().toLocaleLowerCase() === "undefined".trim()) {
      return next(errorHandler(403, "state is required field"));
    }
    if (city.trim().toLocaleLowerCase() === "undefined".trim()) {
      return next(errorHandler(403, "city is required field"));
    }
    if (localAddress.trim().toLocaleLowerCase() === "undefined".trim()) {
      return next(errorHandler(403, "local Address is required field"));
    }

    if (electricity.trim().toLocaleLowerCase() === "undefined".trim()) {
      return next(errorHandler(403, "electricity is required field"));
    }
    if (waterSupply.trim().toLocaleLowerCase() === "undefined".trim()) {
      return next(errorHandler(403, "water Supply is required field"));
    }

    //
    // change string field into number
    const propertyFloorNumber = parseInt(propertyFloor);
    let maintenanceAmountNumber;
    if (maintenanceAmount) {
      maintenanceAmountNumber = parseInt(maintenanceAmount);
    }

    const totalFloorNumber = parseInt(totalFloor);
    const rentAmountNUmber = parseInt(rentAmount);
    const depositAMountNumber = parseInt(depositAmount);
    const bedroomCount = parseInt(bedroom);
    const balconyCount = parseInt(balcony);
    const guestCount = parseInt(guest);
    const bathroomCount = parseInt(bathroom);

    if (propertyFloorNumber > totalFloorNumber) {
      return next(
        errorHandler(403, "property floor must be less than total floor")
      );
    }

    if (req.files.length <= 4) {
      return next(errorHandler(403, "please upload images at least five"));
    }

    const imageUrls = await uploadImagesToCloudinary(
      req.files,
      req.user.userId
    );

    // console.log(imageUrls);
    if (!imageUrls.length > 0) {
      return next(errorHandler(500, "image upload failed"));
    }
    const createNewProperty = new Rent({
      owner: req.user.userId,

      location: {
        city,
        state,
        localAddress,
      },
      apartmentType: apartmentType,
      BHKType: BHKType,
      propertyAge: propertyAge,
      facing: propertyFacing,
      totalFloor: totalFloorNumber,
      floor: propertyFloorNumber,
      builtUpArea: propertyArea,
      apartmentName,
      propertyAvailableFor: propertyAvailableFor,
      preferedTenats: preferedTenats,
      rentAmount: rentAmountNUmber,
      depositAmount: depositAMountNumber,
      monthlyMaintenance: monthlyMaintenance,
      maintenanceAmount: maintenanceAmount ? maintenanceAmountNumber : 0,

      availableFrom: availableFrom,
      furnishing: furnishing,
      parking: parking,
      description: description,

      bedroom: bedroomCount,
      bathroom: bathroomCount,
      balcony: balconyCount,
      guest: guestCount,
      electricity: electricity,
      waterSupply: waterSupply,
      availableAmenities: availableAmenities,
      images: imageUrls,
    });

    const saveProperty = await createNewProperty.save();

    res
      .status(201)
      .json({ msg: "rent property created.", success: true, saveProperty });
  } catch (error) {
    next(errorHandler(500, "internal server error"));
    console.log("rent property creating failed", error);
  }
};

const getRentalProperty = async (req, res, next) => {
  // Extract query parameters from the request
  const { bhktype, location, price, tenet, isFurnished } = req.query;
  // console.log(req.query)

  try {
    let rentAmounts;

    // Check if price parameter is provided
    if (price) {
      rentAmounts = price.split(",").map(Number);
    }

    // Construct the query object based on provided parameters
    const query = {
      isPropertyActive: true, // Ensure only active properties are queried
      ...(bhktype && { BHKType: bhktype }),
      ...(location && { "location.city": location }),
      ...(rentAmounts &&
        rentAmounts.length === 2 && {
          rentAmount: {
            $gte: rentAmounts[0],
            $lte: rentAmounts[1],
          },
        }),
      ...(tenet && { preferedTenats: { $in: [tenet] } }),
      ...(isFurnished && { furnishing: isFurnished }),
    };

    // Pagination: Calculate skip value based on page number

    let page = req.query.page || 1;
    // console.log(page)
    const pageSize = 2; // Number of items per page
    const skip = (page - 1) * pageSize;

    // Fetch rental properties with pagination
    const properties = await Rent.find(query).skip(skip).limit(pageSize).exec();

    // Check if properties are found
    if (!properties || properties.length === 0) {
      return next(errorHandler(404, "No properties found"));
    }

    // Get the total count of properties to calculate total pages
    const totalCount = await Rent.countDocuments(query).exec();
    // console.log(totalCount)

    // Calculate total pages based on total count and page size
    const totalPages = Math.ceil(totalCount / pageSize);
    // console.log(totalPages)

    // Return response with rental properties, total pages, and current page
    return res.json({
      success: true,
      msg: "Properties found",
      properties,
      totalPages,
      currentPage: parseInt(page),
    });
  } catch (error) {
    console.error("Error in fetching rental properties:", error.message);
    next(errorHandler(500, "Internal Server Error"));
  }
};

const getSinglePropertyById = async (req, res, next) => {
  const { id } = req.params;
  try {
    if (!id) {
      return next(errorHandler(403, "bad request"));
    }

    // Find the property by ID and populate the owner field, excluding the password
    const findProperty = await Rent.findById(id).populate("owner", "-password");

    if (!findProperty) {
      return next(errorHandler(403, "property not found"));
    }

    res.json({ success: true, msg: "property found", findProperty });
  } catch (error) {
    next(errorHandler(500, "internal server error"));
    console.log("failed fetahcing sibgle property", error.message);
  }
};

const getAllproperty = async (req, res, next) => {
  try {
    const { type } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = 5;
    const skip = (page - 1) * limit;

    let rentListings;
    let totalLength;

    if (type) {
      rentListings = await Rent.find({
        propertyAvailableFor: type.trim().toLocaleLowerCase(),
        isPropertyActive: true, // Ensure only active properties are queried
      })
        .skip(skip)
        .limit(limit)
        .populate("owner");

      totalLength = await Rent.countDocuments({
        propertyAvailableFor: type.trim().toLocaleLowerCase(),
        isPropertyActive: true, // Ensure only active properties are queried
      });
    } else {
      rentListings = await Rent.find({ isPropertyActive: true}) // Ensure only active properties are queried})
        .skip(skip)
        .limit(limit)
        .populate("owner");

      totalLength = await Rent.countDocuments({isPropertyActive: true});
    }

    const totalPages = Math.ceil(totalLength / limit);

    res.json({ success: true, msg: "Property found", rentListings, totalPages, totalLength });
  } catch (error) {
    console.error("Get all property failed", error.message);
    next(errorHandler(500, "Internal server error"));
  }
};

const getUserProperty=async(req,res,next)=>{
  const {userid}=req.params;
  const{type}=req.query
  try {
    if(userid!==req.user.userId){
      next(errorHandler(403,'bad request! you need to send corret user'))
    }
    let property;
    let totalDocument;

    if(type){
      property=await Rent.find({owner:userid,propertyAvailableFor:type})
      totalDocument=await Rent.countDocuments({owner:userid,propertyAvailableFor:type})
    }else{
      property=await Rent.find({owner:userid})
      totalDocument=await Rent.countDocuments()

    }

     
    if(!property || !property.length>0){
      next(errorHandler(404,'property not found'))
    }

    res.json({success:true,msg:"property found",property,totalDocument})
    
  } catch (error) {
    next(errorHandler(500,'internal server error'))
    console.log('get user property failed',error)
  }

}

const updateProperty=async(req,res,next)=>{
  const{id,userid}=req.params
 
  const {
    apartmentName,
  apartmentType,
  BHKType,
  propertyArea,
  propertyFacing,
  propertyFloor,
  propertyAge,
  totalFloor,
  availableFrom,
  depositAmount,
  description,
  furnishing,
  maintenanceAmount,
  monthlyMaintenance,
  parking,
  propertyAvailableFor,
  rentAmount,
  city,
  localAddress,
  state,
  bedroom,
  balcony,
  guest,
  bathroom,
  electricity,
  waterSupply,
  preferedTenats,
  availableAmenities,
  images
  } = req.body;

  // console.log(bathroom)

  try {
    if(userid!==req.user.userId){
      next(errorHandler(403,'bad request'))
    }

  
    let imageUrls = [];
    if (req.files && req.files.length > 0) {
      imageUrls = await uploadImagesToCloudinary(req.files, req.user.userId);
      if (imageUrls.length === 0) {
        return next(errorHandler(500, 'Image upload failed'));
      }
    }


    // console.log(imageUrls);
    

    const combineAllImages = [...(images || []), ...imageUrls];


    const updateData = await Rent.findByIdAndUpdate(id, {
      $set: {
        apartmentType,
        BHKType,
        propertyAge,
        facing: propertyFacing,
        totalFloor: parseInt(totalFloor, 10),
        floor: parseInt(propertyFloor, 10),
        builtUpArea: parseInt(propertyArea, 10),
        apartmentName,
        propertyAvailableFor,
        preferedTenats,
        rentAmount: parseInt(rentAmount, 10),
        depositAmount: parseInt(depositAmount, 10),
        monthlyMaintenance,
        maintenanceAmount: parseInt(maintenanceAmount, 10),
        availableFrom,
        furnishing,
        parking,
        description,
        location: {
          state,
          city,
          localAddress
        },
        bedroom: parseInt(bedroom, 10),
        balcony: parseInt(balcony, 10),
        guest: parseInt(guest, 10),
        bathroom: bathroom === undefined ? 0 : isNaN(parseInt(bathroom, 10)) ? 0 : parseInt(bathroom, 10),
        electricity,
        waterSupply,
        availableAmenities,
        images: combineAllImages
      }
    }, { new: true });
    res.json({msg:'update successfully',success:true,property:updateData})
    
  } catch (error) {
    next(errorHandler(500,'internal server error'))
    console.log('property updating failed',error)
  }
}

const handleDeleteProperty=async(req,res,next)=>{
  const {id,userid}=req.params;

  try {
    if(userid!==req.user.userId){
      next(errorHandler(403,'user unauthenticated'))
    }

    const deleteProperty=await Rent.findByIdAndDelete(id) 

    if (!deleteProperty) {
      // Property not found or already deleted
      return next(errorHandler(404,'property not found'))
   
    }

    // Property successfully deleted
    res.json({msg:'delete successfully',success:true,})



    
  } catch (error) {
    next(errorHandler(500,'internal server error'))
    console.log('property deleting failed')
  }

}
const handleActivationProperty = async (req, res, next) => {
  const { propertyId, userid } = req.params;

  try {
    // Check if the user ID from the params matches the authenticated user ID
    if (userid !== req.user.userId) {
      return next(errorHandler(403, 'User unauthenticated'));
    }

    // Find the property by ID
    const findProperty = await Rent.findById(propertyId);

    // Check if the property exists
    if (!findProperty) {
      return next(errorHandler(404, 'Property not found'));
    }

    // Toggle the property's active state
    findProperty.isPropertyActive = !findProperty.isPropertyActive;

     // Save the property
   const updatedProperty= await findProperty.save();
   console.log(updatedProperty)

   if(updatedProperty.isPropertyActive){
// Respond with success message
return res.json({ msg: 'Activated successfully', success: true });
   }

   res.json({msg:'Deactivated successfully',success:true})


    // Respond with success message
    return res.json({ msg: 'Activated successfully', success: true });
  } catch (error) {
    console.log('Property activation failed', error.message);
    return next(errorHandler(500, 'Internal server error'));
  }
};



export { createRentProperty, getRentalProperty, getSinglePropertyById,getAllproperty,getUserProperty,updateProperty,handleDeleteProperty,handleActivationProperty };
