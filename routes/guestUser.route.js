import {Router} from 'express'
import { testing } from '../controller/guestUser.controller.js'

const router=Router()


router.get('/test',testing)



export default router