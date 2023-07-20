import { Router } from "express";
import {
  downloadDataset,
  fetchPublicDataset,
  fetchPrivateDatasets,
  fetchPublicDatasets,
  uploadDataset,
  fetchPrivateDataset,
  deleteDataset,
} from "../controllers/datasetController";
import auth from "../middleware/auth";

const router = Router();

router.get("/fetchPublicDatasets", fetchPublicDatasets);
router.get("/fetchPublicDataset", fetchPublicDataset);

router.get("/downloadDataset", downloadDataset);
router.post("/uploadDataset", auth, uploadDataset);
router.delete("/deleteDataset", auth, deleteDataset);

router.get("/fetchPrivateDatasets", auth, fetchPrivateDatasets);
router.get("/fetchPrivateDataset", auth, fetchPrivateDataset);

export default router;
