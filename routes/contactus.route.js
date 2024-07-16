import {Router} from 'express'
import { handleInquiryMessage } from '../controller/contactus.controller.js'

const router=Router()


router.post('/sendmessage',handleInquiryMessage)

export default router