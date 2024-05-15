
import {Router} from 'express'
import verifyUser from '../utility/verifyUser.utility.js'
import { createRentProperty } from '../controller/rent.controller.js'
import multer from 'multer'



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


const router=Router()

// create rent 
router.post('/create',verifyUser,upload.array('listingPhotos'),createRentProperty)



export default router