import { Response } from "express";
import { AuthenticatedRequest } from "../middleware/auth.middleware";
import { getDashboardStats } from "../services/dashboard.service";

export async function getDashboardStatsController(
  req: AuthenticatedRequest,
  res: Response
) {
  try {
    if (!req.user) {
      return res.status(401).json({
        message: "Authentication required",
      });
    }

    const stats = await getDashboardStats();

    return res.status(200).json({
      stats,
    });
  } catch (error) {
    console.error("Get dashboard stats error:", error);

    return res.status(500).json({
      message: "Something went wrong while fetching dashboard statistics",
    });
  }
}