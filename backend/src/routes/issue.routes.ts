import { Router } from "express";
import { getPublicIssuesController } from "../controllers/issue.controller";

const router = Router();

router.get("/", getPublicIssuesController);

export default router;