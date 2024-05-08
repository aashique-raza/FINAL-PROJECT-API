import errorHandler from "../utility/errorHandler.utility.js";
import uploadImages from "../utility/cloudinary.upload.js";
import uploadImagesToCloudinary from "../utility/cloudinary.upload.js";
import Rent from "../models/rental.model.js";

const createRentProperty = async (req, res, next) => {
  console.log("body", req.body);
  console.log("files", req.files);
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

  //   change type number here----

  // console.log(typeof propertyFloorNumber, typeof totalFloorNumber)
  console.log(typeof maintenanceAmount, maintenanceAmount)

  try {
    if (!apartmentType) {
      return next(errorHandler(403, "apartment type ie required field"));
    }
    if (!BHKType) {
      return next(errorHandler(403, "BHKType type ie required field"));
    }
    if (!monthlyMaintenance) {
      return next(errorHandler(403, "monthly maintenance  is required field"));
    }
    // if (
    //   monthlyMaintenance.trim().toLowerCase() ===
    //   "extraMaintenance".trim().toLocaleLowerCase()
    // ) {
    //   if (!maintenanceAmount) {
    //     return next(errorHandler(403, "maintenance ammount is required field"));
    //   }
    // }

    if (!propertyArea) {
      return next(errorHandler(403, "build up area is required field"));
    }
    if (!propertyFloor) {
      return next(errorHandler(403, "property floor is required field"));
    }

    if (!totalFloor) {
      return next(errorHandler(403, "total floor is required field"));
    }

    if (!propertyAge) {
      return next(errorHandler(403, "property age is required field"));
    }
    if (!availableFrom) {
      return next(errorHandler(403, "available from is required field"));
    }
    if (!depositAmount) {
      return next(errorHandler(403, "expected deposit is required field"));
    }
    if (!description) {
      return next(errorHandler(403, "description is required field"));
    }

    if (!propertyAvailableFor) {
      return next(
        errorHandler(403, "property available for is required field")
      );
    }
    if (!rentAmount) {
      return next(errorHandler(403, "expected rent is required field"));
    }
    if (preferedTenats.length <= 0) {
      return next(errorHandler(403, "prefered tenet is required field"));
    }
    if (!city) {
      return next(errorHandler(403, "city is required field"));
    }
    if (!localAddress) {
      return next(errorHandler(403, "local Address is required field"));
    }
    if (!state) {
      return next(errorHandler(403, "state is required field"));
    }
    if (!bedroom) {
      return next(errorHandler(403, "bedroom ie required field"));
    }
    if (!balcony) {
      return next(errorHandler(403, "balcony is required field"));
    }
    if (!guest) {
      return next(errorHandler(403, "guest is required field"));
    }

    if (!electricity) {
      return next(errorHandler(403, "electricity is required field"));
    }
    if (!waterSupply) {
      return next(errorHandler(403, "water Supply is required field"));
    }

    // change string field into number
    const propertyFloorNumber = parseInt(propertyFloor);
    // let maintenanceAmountNumber;
    // if (maintenanceAmount) {
    //   maintenanceAmountNumber = parseInt(maintenanceAmount);
    // }

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

    if (!req.files.length > 4) {
      return next(errorHandler(403, "please upload images at least five"));
    }
    const imageUrls = await uploadImagesToCloudinary(
      req.files,
      req.user.userId
    );

    // console.log(imageUrls);
    if (!imageUrls.length > 0) {
      return next(errorHandler(500, "internal server error"));
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
      apartmentName: apartmentName,
      propertyAvailableFor: propertyAvailableFor,
      preferedTenats: preferedTenats,
      rentAmount: rentAmountNUmber,
      depositAmount: depositAMountNumber,
      monthlyMaintenance: monthlyMaintenance,
    //   maintenanceAmount: maintenanceAmount !== undefined ? parseInt(maintenanceAmount) : null,

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

export { createRentProperty };
//
