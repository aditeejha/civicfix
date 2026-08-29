import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware";
import { authorizeRoles } from "../middleware/role.middleware";
import {
  createDepartmentController,
  getDepartmentsController,
  createWardController,
  getWardsController,
} from "../controllers/organization.controller";

const router = Router();

// Departments

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

// Wards

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

export default router;