import { Router } from "express";

import { authenticate } from "../middleware/auth.middleware";
import { authorizeRoles } from "../middleware/role.middleware";

import {
  getPublicIssuesController,
  getIssueByIdController,
  getAllIssuesController,
  updateIssueStatusController,
} from "../controllers/issue.controller";

const router = Router();

// ─────────────────────────────────────────────
// PUBLIC ISSUES
// ─────────────────────────────────────────────

router.get(
  "/",
  getPublicIssuesController
);

// ─────────────────────────────────────────────
// ADMIN — ALL ISSUES
// IMPORTANT: This must come BEFORE /:issueId
// ─────────────────────────────────────────────

router.get(
  "/admin/all",
  authenticate,
  authorizeRoles("ADMIN"),
  getAllIssuesController
);

// ─────────────────────────────────────────────
// ISSUE BY ID
// ─────────────────────────────────────────────

router.get(
  "/:issueId",
  getIssueByIdController
);

// ─────────────────────────────────────────────
// UPDATE ISSUE STATUS
// ─────────────────────────────────────────────

router.patch(
  "/:issueId/status",
  authenticate,
  authorizeRoles("AUTHORITY", "ADMIN"),
  updateIssueStatusController
);

export default router;