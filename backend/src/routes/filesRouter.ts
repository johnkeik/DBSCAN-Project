import { Router } from "express";
import {
  deleteTempFiles,
  downloadPlotImage,
  fetchPlotImage,
} from "../controllers/filesController";

const router = Router();

router.get("/fetchPlotImage", fetchPlotImage);
router.delete("/deleteTempFiles", deleteTempFiles);
router.get("/downloadPlotImage", downloadPlotImage);

export default router;
