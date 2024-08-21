
import { Router} from "express";
import { signup , login, logout, changePassword, requestPasswordReset, resetPassword, verifyOtp, generateOtp } from "../controllers/userController";
import { authenticateToken,} from "../middleware/auth";

const router = Router();
router.post('/signup',signup);
router.post('/login',login);
router.post('/logout',logout);
router.post('/otp',generateOtp)
router.post('/verify',verifyOtp)
router.post('/changepassword',authenticateToken,changePassword);
router.post('/forgetpassword',requestPasswordReset);
router.post('/reset-password',resetPassword)

export default router