
import {Router} from 'express'
import verifyUser from '../utility/verifyUser.utility.js'
import checkEmailVerification from '../middlewares/mailVerified.middleware.js'
import { addPgProperty,getAllproperty,getSinglePropertyById,getProperty,getUserProperty,updateProperty ,handleDeleteProperty} from '../controller/pg.controller.js'
import multer from 'multer'

const router=Router()
// Multer Configuration


/* Configuration Multer for File Upload */
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, "public/uploads/pg"); // Store uploaded files in the 'uploads' folder
    },
    filename: function (req, file, cb) {
      cb(null, file.originalname); // Use the original file name
    },
  });
  const upload = multer({ storage });



router.get('/getPgProperty',getAllproperty)
router.get('/getSingleProperty/:id',getSinglePropertyById)
router.get('/allProperty',getProperty)

// proetected route
router.post('/create-listing',verifyUser,checkEmailVerification,upload.array('listingPhotos'),addPgProperty)
router.get('/getUserProperty/:userid',verifyUser,getUserProperty)
router.put('/propertyUpdate/:id/:userid',verifyUser,upload.array('editPhotos'),updateProperty)
router.delete('/propertyDelete/:id/:userid',verifyUser,handleDeleteProperty)


export default router