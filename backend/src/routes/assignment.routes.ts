import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware";
import { authorizeRoles } from "../middleware/role.middleware";
import {
  createAssignmentController,
  acceptAssignmentController,
  startAssignmentController,
} from "../controllers/assignment.controller";

const router = Router();

router.post(
  "/",
  authenticate,
  authorizeRoles("AUTHORITY", "ADMIN"),
  createAssignmentController
);

router.patch(
  "/:assignmentId/accept",
  authenticate,
  authorizeRoles("AUTHORITY", "ADMIN"),
  acceptAssignmentController
);

router.patch(
  "/:assignmentId/start",
  authenticate,
  authorizeRoles("AUTHORITY", "ADMIN"),
  startAssignmentController
);

export default router;