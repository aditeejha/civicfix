import { Request, Response } from "express";
import { IssueStatus } from "../generated/prisma/client";
import { AuthenticatedRequest } from "../middleware/auth.middleware";
import {
  getPublicIssues,
  getIssueById,
  updateIssueStatus,
} from "../services/issue.service";

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
    console.error(
      "Get public issues error:",
      error
    );

    return res.status(500).json({
      message:
        "Something went wrong while fetching issues",
    });
  }
}

export async function getIssueByIdController(
  req: Request,
  res: Response
) {
  try {
    const { issueId } = req.params;

    if (!issueId) {
      return res.status(400).json({
        message: "Issue ID is required",
      });
    }

    const issue = await getIssueById(
      issueId
    );

    if (!issue) {
      return res.status(404).json({
        message: "Issue not found",
      });
    }

    return res.status(200).json({
      issue,
    });
  } catch (error) {
    console.error(
      "Get issue error:",
      error
    );

    return res.status(500).json({
      message:
        "Something went wrong while fetching the issue",
    });
  }
}

export async function updateIssueStatusController(
  req: AuthenticatedRequest,
  res: Response
) {
  try {
    if (!req.user) {
      return res.status(401).json({
        message: "Authentication required",
      });
    }

    const { issueId } = req.params;
    const { status, note } = req.body;

    if (!issueId) {
      return res.status(400).json({
        message: "Issue ID is required",
      });
    }

    if (
      !status ||
      !Object.values(IssueStatus).includes(
        status
      )
    ) {
      return res.status(400).json({
        message: "Invalid issue status",
      });
    }

    const issue = await updateIssueStatus(
      issueId,
      req.user.userId,
      status,
      note
    );

    return res.status(200).json({
      message:
        "Issue status updated successfully",
      issue,
    });
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "ISSUE_NOT_FOUND"
    ) {
      return res.status(404).json({
        message: "Issue not found",
      });
    }

    console.error(
      "Update issue status error:",
      error
    );

    return res.status(500).json({
      message:
        "Something went wrong while updating the issue status",
    });
  }
}