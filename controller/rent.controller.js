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
    guest,
    availableAmenities,
    electricity,
    waterSupply,
  } = req.body;


  console.log(typeof electricity, typeof waterSupply)
  console.log(electricity,waterSupply)

 
  try {

    if (bedroom==0) {
      return next(errorHandler(403, "bedroom is required field"));
    }
    if (balcony==0) {
      return next(errorHandler(403, "balcony is required field"));
    }
    if (guest==0) {
      return next(errorHandler(403, "guest is required field"));
    }

   

    if (apartmentType.trim().toLocaleLowerCase()==='undefined'.trim()) {
      return next(errorHandler(403, "apartment type ie required field"));
    }
    if (BHKType.trim().toLocaleLowerCase()==='undefined'.trim()) {
      return next(errorHandler(403, "BHKType type ie required field"));
    }
   
    if (monthlyMaintenance.trim().toLocaleLowerCase()==='undefined'.trim()) {
      return next(errorHandler(403, "monthly maintenance  is required field"));
    }
    if (
      monthlyMaintenance.trim().toLowerCase() ===
      "extraMaintenance".trim().toLocaleLowerCase()
    ) {
      if (maintenanceAmount.trim().toLocaleLowerCase()==='undefined'.trim()) {
        return next(errorHandler(403, "maintenance ammount is required field"));
      }
    }

     
    if (propertyArea.trim().toLocaleLowerCase()==='undefined'.trim()) {
      return next(errorHandler(403, "build up area is required field"));
    }
    if (propertyFloor.trim().toLocaleLowerCase()==='undefined'.trim()) {
      return next(errorHandler(403, "property floor is required field"));
    }

    if (totalFloor.trim().toLocaleLowerCase()==='undefined'.trim()) {
      return next(errorHandler(403, "total floor is required field"));
    }

    if (propertyAge.trim().toLocaleLowerCase()==='undefined'.trim()) {
      return next(errorHandler(403, "property age is required field"));
    }
  

    if (availableFrom.trim().toLocaleLowerCase()==='undefined'.trim()) {
      return next(errorHandler(403, "available from is required field"));
    }
    if (depositAmount.trim().toLocaleLowerCase()==='undefined'.trim()) {
      return next(errorHandler(403, "expected deposit is required field"));
    }
    if (description.trim().toLocaleLowerCase()==='undefined'.trim()) {
      return next(errorHandler(403, "description is required field"));
    }

    

    if (propertyAvailableFor.trim().toLocaleLowerCase()==='undefined'.trim()) {
      return next(
        errorHandler(403, "property available for is required field")
      );
    }
    if (rentAmount.trim().toLocaleLowerCase()==='undefined'.trim()) {
      return next(errorHandler(403, "expected rent is required field"));
    }
    if (!preferedTenats ) {
      return next(errorHandler(403, "prefered tenet is required field"));
    }
    if (state.trim().toLocaleLowerCase()==='undefined'.trim()) {
      return next(errorHandler(403, "state is required field"));
    }
    if (city.trim().toLocaleLowerCase()==='undefined'.trim()) {
      return next(errorHandler(403, "city is required field"));
    }
    if (localAddress.trim().toLocaleLowerCase()==='undefined'.trim()) {
      return next(errorHandler(403, "local Address is required field"));
    }
   
   
    
    if (electricity.trim().toLocaleLowerCase()==='undefined'.trim()) {
      return next(errorHandler(403, "electricity is required field"));
    }
    if (waterSupply.trim().toLocaleLowerCase()==='undefined'.trim()) {
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



export {createRentProperty}
