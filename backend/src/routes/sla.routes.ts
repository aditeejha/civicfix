import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware";
import { authorizeRoles } from "../middleware/role.middleware";
import {
  createSLAController,
  checkSLABreachesController,
} from "../controllers/sla.controller";

const router = Router();

router.post(
  "/",
  authenticate,
  authorizeRoles("ADMIN"),
  createSLAController
);

router.post(
  "/check-breaches",
  authenticate,
  authorizeRoles("ADMIN"),
  checkSLABreachesController
);

export default router;