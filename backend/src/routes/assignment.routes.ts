import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware";
import { authorizeRoles } from "../middleware/role.middleware";
import {
  createAssignmentController,
  acceptAssignmentController,
  startAssignmentController,
  resolveAssignmentController,
  getMyAssignmentsController,
} from "../controllers/assignment.controller";

const router = Router();

router.post(
  "/",
  authenticate,
  authorizeRoles("AUTHORITY", "ADMIN"),
  createAssignmentController
);

router.get(
  "/my",
  authenticate,
  authorizeRoles("AUTHORITY", "ADMIN"),
  getMyAssignmentsController
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

router.patch(
  "/:assignmentId/resolve",
  authenticate,
  authorizeRoles("AUTHORITY", "ADMIN"),
  resolveAssignmentController
);

export default router;