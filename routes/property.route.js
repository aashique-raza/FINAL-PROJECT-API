
import {Router} from 'express'
import verifyUser from '../utility/verifyUser.utility.js'
import checkEmailVerification from '../middlewares/mailVerified.middleware.js'
import { addProperty } from '../controller/property.controller.js'

const router=Router()


router.post('/add-property',verifyUser,checkEmailVerification,addProperty)


export default router