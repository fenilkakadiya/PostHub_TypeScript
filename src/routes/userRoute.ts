
import { Router} from "express";
import { signup , login, logout, changePassword, requestPasswordReset, resetPassword } from "../controllers/userController";
import { authenticateToken } from "../middleware/auth";

const router = Router();
router.post('/signup',signup);
router.post('/login',login);
router.post('/logout',logout);
router.post('/changepassword',authenticateToken,changePassword);
router.post('/forgetpassword',requestPasswordReset);
router.post('/resetpassword',resetPassword)

export default router