import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware";
import upload from "../middleware/upload.middleware";
import { createComplaintController } from "../controllers/complaint.controller";

const router = Router();

router.post(
  "/",
  authenticate,
  upload.single("image"),
  createComplaintController
);

export default router;