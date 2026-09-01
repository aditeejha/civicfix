import { Router } from "express";

import { authenticate } from "../middleware/auth.middleware";

import { authorizeRoles } from "../middleware/role.middleware";

import {
  createDepartmentController,
  getDepartmentsController,
  createWardController,
  getWardsController,
  getAuthoritiesController,
} from "../controllers/organization.controller";

const router = Router();

// ─────────────────────────────────────────────
// DEPARTMENTS
// ─────────────────────────────────────────────

router.post(
  "/departments",
  authenticate,
  authorizeRoles("ADMIN"),
  createDepartmentController
);

router.get(
  "/departments",
  authenticate,
  authorizeRoles("ADMIN", "AUTHORITY"),
  getDepartmentsController
);

// ─────────────────────────────────────────────
// WARDS
// ─────────────────────────────────────────────

router.post(
  "/wards",
  authenticate,
  authorizeRoles("ADMIN"),
  createWardController
);

router.get(
  "/wards",
  authenticate,
  authorizeRoles("ADMIN", "AUTHORITY"),
  getWardsController
);

// ─────────────────────────────────────────────
// AUTHORITIES
// ─────────────────────────────────────────────

router.get(
  "/authorities",
  authenticate,
  authorizeRoles("ADMIN"),
  getAuthoritiesController
);

export default router;