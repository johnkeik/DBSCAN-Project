import { Router } from "express";
import {
  applyDBSCAN,
  deleteTempFiles,
  downloadDataset,
  fetchPublicDataset,
  fetchPlotImage,
  fetchPrivateDatasets,
  fetchPublicDatasets,
  findEpsilonAsGuest,
  uploadDataset,
  fetchPrivateDataset,
  deleteDataset,
} from "../controllers/datasetController";
import auth from "../middleware/auth";

const router = Router();

router.get("/fetchPublicDatasets", fetchPublicDatasets);
router.get("/fetchPublicDataset", fetchPublicDataset);
router.get("/findEpsilonAsGuest", findEpsilonAsGuest);
router.get("/fetchPlotImage", fetchPlotImage);
router.get("/applyDBSCAN", applyDBSCAN);
router.delete("/deleteTempFiles", deleteTempFiles);
router.get("/downloadDataset", downloadDataset);

router.post("/uploadDataset", auth, uploadDataset);
router.get("/fetchPrivateDatasets", auth, fetchPrivateDatasets);
router.get("/fetchPrivateDataset", auth, fetchPrivateDataset);
router.delete("/deleteDataset", auth, deleteDataset);

export default router;
