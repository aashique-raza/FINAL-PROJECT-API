import { Router } from "express";
import verifyUser from "../utility/verifyUser.utility.js";
import {
  createRentProperty,
  getRentalProperty,
  getSinglePropertyById,
  getAllproperty,
  getUserProperty,
  updateProperty,
  handleDeleteProperty,
  handleActivationProperty,
} from "../controller/rent.controller.js";
import multer from "multer";
// import { getUserProperty } from '../controller/pg.controller.js';
// import { getAllproperty } from '../controller/pg.controller.js';

/* Configuration Multer for File Upload */
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/uploads/rent"); // Store uploaded files in the 'uploads' folder
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname); // Use the original file name
  },
});
const upload = multer({ storage });

const router = Router();

// create rent

router.get("/getRentalProperty", getRentalProperty);
router.get("/getSingleProperty/:id", getSinglePropertyById);
router.get("/property", getAllproperty);

// protected route---
router.post(
  "/create/:userId",
  verifyUser,
  upload.array("listingPhotos"),
  createRentProperty
);
router.get("/getUserProperty/:userid", verifyUser, getUserProperty);
router.put(
  "/propertyUpdate/:id/:userid",
  verifyUser,
  upload.array("editPhotos"),
  updateProperty
);
router.delete("/propertyDelete/:id/:userid", verifyUser, handleDeleteProperty);
router.patch(
  "/activateProperty/:propertyId/:userid",
  verifyUser,
  handleActivationProperty
);

export default router;
