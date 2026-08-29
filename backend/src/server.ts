import "dotenv/config";
import express from "express";
import cors from "cors";
import { prisma } from "./lib/prisma";
import { startSLABreachJob } from "./jobs/sla.job";
import authRoutes from "./routes/auth.routes";
import complaintRoutes from "./routes/complaint.routes";
import issueRoutes from "./routes/issue.routes";
import upvoteRoutes from "./routes/upvote.routes";
import assignmentRoutes from "./routes/assignment.routes";
import organizationRoutes from "./routes/organization.routes";
import slaRoutes from "./routes/sla.routes";
import dashboardRoutes from "./routes/dashboard.routes";

import {
  authenticate,
  AuthenticatedRequest,
} from "./middleware/auth.middleware";

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

// ─────────────────────────────────────────────
// API ROUTES
// ─────────────────────────────────────────────

app.use("/api/auth", authRoutes);
app.use("/api/complaints", complaintRoutes);
app.use("/api/issues", issueRoutes);
app.use("/api/issues", upvoteRoutes);
app.use("/api/assignments", assignmentRoutes);
app.use("/api/organization", organizationRoutes);
app.use("/api/sla", slaRoutes);
app.use("/api/dashboard", dashboardRoutes);

// ─────────────────────────────────────────────
// HEALTH CHECK
// ─────────────────────────────────────────────

app.get("/", (_req, res) => {
  res.json({
    message: "CivicFix backend is running",
  });
});

app.get("/api/health/db", async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;

    res.json({
      status: "ok",
      database: "connected",
    });
  } catch (error) {
    console.error("Database connection failed:", error);

    res.status(500).json({
      status: "error",
      database: "disconnected",
    });
  }
});

// ─────────────────────────────────────────────
// CURRENT USER
// ─────────────────────────────────────────────

app.get(
  "/api/auth/me",
  authenticate,
  async (req: AuthenticatedRequest, res) => {
    try {
      const user = await prisma.user.findUnique({
        where: {
          id: req.user!.userId,
        },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true,
        },
      });

      if (!user) {
        return res.status(404).json({
          message: "User not found",
        });
      }

      return res.json({
        user,
      });
    } catch (error) {
      console.error("Fetch user error:", error);

      return res.status(500).json({
        message: "Something went wrong",
      });
    }
  }
);

startSLABreachJob();

// ─────────────────────────────────────────────
// START SERVER
// ─────────────────────────────────────────────

app.listen(PORT, () => {
  console.log(
    `CivicFix backend running on http://localhost:${PORT}`
  );
});