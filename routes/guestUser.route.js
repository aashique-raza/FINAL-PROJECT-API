import {Router} from 'express'
import { testing,verifyGuestUserEmail,getOwnerDetails } from '../controller/guestUser.controller.js'


const router=Router()


router.get('/test',testing)
router.post('/sendMailVerificationOtp',verifyGuestUserEmail)
router.post('/getOwnerDetails/:propertyId/:category',getOwnerDetails)



export default router