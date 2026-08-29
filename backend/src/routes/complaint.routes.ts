import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware";
import upload from "../middleware/upload.middleware";
import {
  createComplaintController,
  getMyComplaintsController,
  getComplaintByIdController,
} from "../controllers/complaint.controller";

const router = Router();

router.post(
  "/",
  authenticate,
  upload.single("image"),
  createComplaintController
);

router.get(
  "/my",
  authenticate,
  getMyComplaintsController
);

router.get(
  "/:id",
  authenticate,
  getComplaintByIdController
);

export default router;