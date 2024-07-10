import {Router} from 'express'
import { testing,verifyGuestUserEmail } from '../controller/guestUser.controller.js'


const router=Router()


router.get('/test',testing)
router.post('/sendMailVerificationOtp',verifyGuestUserEmail)




export default router