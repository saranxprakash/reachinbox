import { Router } from "express";
import multer from "multer";
import fs from "fs";
import {
  getQueueStats,
  uploadAndSchedule,
  getEmailStatus,
} from "../controllers/campaignController";

// Ensure the uploads directory exists
const uploadDir = "uploads/";
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// Configure multer
const upload = multer({ dest: uploadDir });
const router = Router();

// Your active routes
router.get("/stats", getQueueStats);
router.post("/upload", upload.single("file"), uploadAndSchedule);
router.get("/status/:userId", getEmailStatus);

export default router;
