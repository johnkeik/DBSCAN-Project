import { Router } from "express";
import {
  applyDBSCAN,
  findEpsilonAsGuest,
} from "../controllers/dbscanController";

const router = Router();

router.get("/findEpsilonAsGuest", findEpsilonAsGuest);
router.get("/applyDBSCAN", applyDBSCAN);

export default router;
