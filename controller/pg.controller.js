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

  // console.log(rentAmount,depositAmount,typeof rentAmount, typeof depositAmount)

  try {
    let rentAMountNumber;
    let depositAmountNumber;
    if (rentAmount) {
      rentAMountNumber = parseInt(rentAmount);
    }
    if (depositAmount) {
      depositAmountNumber = parseInt(depositAmount);
    }

    // console.log(rentAMountNumber,depositAmountNumber)
    if (!roomSharing) {
      // later on you can make a middleware an there you check all required filed
      return next(errorHandler(403, "room sharing field is required"));
    }
    if (!balcony) {
      return next(errorHandler(403, "balcony field is required"));
    }
    if (!availableFor) {
      return next(errorHandler(403, "available for field is required"));
    }
    if (!state) {
      return next(errorHandler(403, "state field is required"));
    }
    if (!city) {
      return next(errorHandler(403, "city field is required"));
    }

    if (!localAddress) {
      return next(errorHandler(403, "local addresss field is required"));
    }
    if (!roomFacilities) {
      return next(errorHandler(403, "room facility field is required"));
    }
    if (!warden) {
      return next(errorHandler(403, "warden field is required"));
    }
    if (!description) {
      return next(errorHandler(403, "dexcription field is required"));
    }
    if (!rentAMountNumber > 0) {
      return next(errorHandler(403, "rent field is required"));
    }
    if (!depositAmountNumber > 0) {
      return next(errorHandler(403, "deposit field is required"));
    }
    if (rentAMountNumber < !depositAmountNumber) {
      return next(errorHandler(403, "deposit  can not be less than rent "));
    }
    if (!laundary) {
      return next(errorHandler(403, "laundary field is required"));
    }
    if (!doorClosingTime) {
      return next(errorHandler(403, "door closing field is required"));
    }
    if (!kitchen) {
      return next(errorHandler(403, "kitchen field is required"));
    }
    if (!pgOrHostelName) {
      return next(errorHandler(403, "pg/hostel name field is required"));
    }
    if (!roomCleaning) {
      return next(errorHandler(403, "room cleaning field is required"));
    }
    if (!foodAvaibility) {
      return next(errorHandler(403, "food avaibility field is required"));
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
      return next(errorHandler(500, "internal server error"));
    }

    const newListing = new PG({
      owner: req.user.userId,
      roomSharing,
      location: {
        city,
        state,
        localAddress,
      },
      balcony: balcony === "yes" ? true : false,
      availableFor,
      rentAmount,
      depositAmount,
      laundary: laundary === "yes" ? true : false,
      description,
      doorClosingTime,
      kitchen: kitchen === "yes" ? true : false,
      pgOrHostelName,
      placeAvaibility,
      roomCleaning: roomCleaning === "yes" ? true : false,
      warden: warden === "yes" ? true : false,
      foodAvaibility: foodAvaibility === "true" ? true : false,
      foodType,
      ameinites,
      pgRules,
      roomFacilities,
      images: imageUrls,
    });

    const lsiting = await newListing.save();

    res.json({ success: true, msg: "create listing successfull", lsiting });
  } catch (error) {
    console.log(error.message);
    next(errorHandler(500, "internal server error"));
  }
};

const getAllproperty = async (req, res, next) => {
  const {
    room_sharing,
    available_for,
    pg_avaibility,
    pg_rent_amount,
    food_avaibility,
    food_type,
    location,
    page
  } = req.query;
  console.log(food_type);

  try {
    let pg_rent;

    // Check if price parameter is provided
    if (pg_rent_amount) {
      pg_rent = pg_rent_amount.split(",").map(Number);
    }

    // Construct the query object based on provided parameters
    const query = {
      ...(room_sharing && { roomSharing: room_sharing }),
      ...(location && { "location.city": location }),
      ...(available_for && { availableFor: available_for }),
      ...(pg_avaibility && { placeAvaibility: pg_avaibility }),
      ...(pg_rent &&
        pg_rent.length === 2 && {
          rentAmount: {
            $gte: pg_rent[0],
            $lte: pg_rent[1],
          },
        }),
      ...(food_avaibility && { foodAvaibility: food_avaibility }),
      ...(food_type && { foodType: food_type }),
    };

    // Pagination: Calculate skip value based on page number

    let page = req.query.page || 1;
    // console.log(page)
    const pageSize = 2; // Number of items per page
    const skip = (page - 1) * pageSize;

    // Fetch rental properties with pagination
    const pgProperties = await PG.find(query).skip(skip).limit(pageSize).exec();

    // Check if properties are found
    if (!pgProperties || pgProperties.length === 0) {
      return next(errorHandler(404, "No properties found"));
    }
    // Get the total count of properties to calculate total pages
    const totalCount = await PG.countDocuments(query).exec();
    // console.log(totalCount)

    // Calculate total pages based on total count and page size
    const totalPages = Math.ceil(totalCount / pageSize);
    // console.log(totalPages)

    // Return response with rental properties, total pages, and current page
    return res.json({
      success: true,
      msg: "Properties found",
      pgProperties,
      totalPages,
      currentPage: parseInt(page),
    });
  } catch (error) {
    console.log("get all pg property failed", error.message);
    next(errorHandler(500, "internal server error"));
  }
};

export { addPgProperty, getAllproperty };
