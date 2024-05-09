
import { Router } from "express";
import { createAccount,loginAccount,google,forgotPassword,resetPassword } from "../controller/auth.controller.js";

const router=Router()

router.post('/create-account',createAccount)
router.post('/login-account',loginAccount)

router.post('/googlelogin',google)
router.post('/forgot-paasword',forgotPassword)
router.put('/reset-password',resetPassword)


export default router