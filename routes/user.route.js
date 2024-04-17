import { Router } from "express";
import verifyUser from "../utility/verifyUser.utility.js";
import { updateAccount,logOut ,changePassword,sendVerifivationMail,verifyMail, deleteAccount} from "../controller/user.controller.js";


const router=Router()

router.post('/logout-account',verifyUser,logOut)
router.put('/update-account/:userID',verifyUser,updateAccount)
router.patch('/change-password/:userID',verifyUser,changePassword)

// verify user email
router.post('/send-verification-mail/:userID',verifyUser,sendVerifivationMail)
router.post('/verify-mail',verifyUser,verifyMail)

// delete account
router.delete('/delete-account/:userID',verifyUser,deleteAccount)



export default router