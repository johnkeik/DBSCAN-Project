import { Router } from "express";
import {
  deleteTempFiles,
  fetchPlotImage,
} from "../controllers/filesController";

const router = Router();

router.get("/fetchPlotImage", fetchPlotImage);
router.delete("/deleteTempFiles", deleteTempFiles);

export default router;
