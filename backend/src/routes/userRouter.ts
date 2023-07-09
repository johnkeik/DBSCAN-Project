import { Router } from "express";
import {
  register,
  getAllUsers,
  loginUser,
  fetchUserInfo,
} from "../controllers/userController";
import auth from "../middleware/auth";

const router = Router();

router.post("/login", loginUser);
router.post("/register", register);
router.get("/fetchUserInfo", auth, fetchUserInfo);
router.get("/fetchUsers", auth, getAllUsers);

export default router;
