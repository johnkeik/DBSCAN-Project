import { Router } from "express";
import {
  applyDBSCAN,
  fetchParallelPlot,
  findEpsilonAsGuest,
} from "../controllers/dbscanController";

const router = Router();

router.get("/findEpsilonAsGuest", findEpsilonAsGuest);
router.get("/applyDBSCAN", applyDBSCAN);
router.get("/fetchParallelPlot", fetchParallelPlot);

export default router;
