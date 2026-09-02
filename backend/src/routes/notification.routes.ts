import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware";
import {
  getNotificationsController,
  markNotificationAsReadController,
  markAllNotificationsAsReadController,
} from "../controllers/notification.controller";

const router = Router();

router.get("/", authenticate, getNotificationsController);

router.patch(
  "/read-all",
  authenticate,
  markAllNotificationsAsReadController
);

router.patch(
  "/:notificationId/read",
  authenticate,
  markNotificationAsReadController
);

export default router;