import { Request, Response } from "express";
import { getPublicIssues } from "../services/issue.service";

export async function getPublicIssuesController(
  _req: Request,
  res: Response
) {
  try {
    const issues = await getPublicIssues();

    return res.status(200).json({
      issues,
    });
  } catch (error) {
    console.error("Get public issues error:", error);

    return res.status(500).json({
      message: "Something went wrong while fetching issues",
    });
  }
}