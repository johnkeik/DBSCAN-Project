import { Router } from "express";
import {
  applyDBSCAN,
  deleteTempFiles,
  fetchDataset,
  fetchPlotImage,
  fetchPublicDatasets,
  findEpsilonAsGuest,
} from "../controllers/datasetController";
import auth from "../middleware/auth";

const router = Router();

router.get("/fetchPublicDatasets", fetchPublicDatasets);
router.get("/fetchDataset", fetchDataset);
router.get("/findEpsilonAsGuest", findEpsilonAsGuest);
router.get("/fetchPlotImage", fetchPlotImage);
router.get("/applyDBSCAN", applyDBSCAN);
router.delete("/deleteTempFiles", deleteTempFiles);

export default router;
