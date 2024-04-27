
import {Router} from 'express'
import verifyUser from '../utility/verifyUser.utility.js'
import checkEmailVerification from '../middlewares/mailVerified.middleware.js'
import { addPgProperty } from '../controller/pg.controller.js'
import multer from 'multer'

const router=Router()
// Multer Configuration


/* Configuration Multer for File Upload */
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, "public/uploads/"); // Store uploaded files in the 'uploads' folder
    },
    filename: function (req, file, cb) {
      cb(null, file.originalname); // Use the original file name
    },
  });
  const upload = multer({ storage });


router.post('/create-listing',verifyUser,checkEmailVerification,upload.array('listingPhotos'),addPgProperty)


export default router