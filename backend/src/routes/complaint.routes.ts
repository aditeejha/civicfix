import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware";
import upload from "../middleware/upload.middleware";
import {
  createComplaintController,
  getMyComplaintsController,
  getComplaintByIdController,
  verifyComplaintResolutionController,
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

router.patch(
  "/:complaintId/verify",
  authenticate,
  verifyComplaintResolutionController
);

export default router;