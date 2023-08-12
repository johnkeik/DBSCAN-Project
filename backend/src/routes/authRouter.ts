import { Router } from "express";
import {
  register,
  loginUser,
  fetchUserInfo,
  forgotPassword,
} from "../controllers/authController";
import auth from "../middleware/auth";

const router = Router();

router.post("/login", loginUser);
router.post("/register", register);
router.get("/fetchUserInfo", auth, fetchUserInfo);
router.post("/forgotPassword", forgotPassword);

export default router;
