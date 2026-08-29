import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware";
import { authorizeRoles } from "../middleware/role.middleware";
import {
  getPublicIssuesController,
  updateIssueStatusController,
} from "../controllers/issue.controller";

const router = Router();

router.get("/", getPublicIssuesController);

router.patch(
  "/:issueId/status",
  authenticate,
  authorizeRoles("AUTHORITY", "ADMIN"),
  updateIssueStatusController
);

export default router;