import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware";
import { upvoteIssueController } from "../controllers/upvote.controller";

const router = Router();

router.post(
  "/:issueId/upvote",
  authenticate,
  upvoteIssueController
);

export default router;