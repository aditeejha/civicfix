import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware";
import { authorizeRoles } from "../middleware/role.middleware";
import { getDashboardStatsController } from "../controllers/dashboard.controller";

const router = Router();

router.get(
  "/stats",
  authenticate,
  authorizeRoles("ADMIN", "AUTHORITY"),
  getDashboardStatsController
);

export default router;