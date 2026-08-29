import { Response } from "express";
import { AuthenticatedRequest } from "../middleware/auth.middleware";
import {
  createAssignment,
  acceptAssignment,
  startAssignment,
  resolveAssignment,
  getMyAssignments,
} from "../services/assignment.service";
export async function createAssignmentController(
  req: AuthenticatedRequest,
  res: Response
) {
  try {
    if (!req.user) {
      return res.status(401).json({
        message: "Authentication required",
      });
    }

    const {
      issueId,
      authorityId,
      departmentId,
      wardId,
    } = req.body;

    if (!issueId || !authorityId) {
      return res.status(400).json({
        message: "Issue ID and authority ID are required",
      });
    }

    const assignment = await createAssignment({
      issueId,
      authorityId,
      departmentId,
      wardId,
    });

    return res.status(201).json({
      message: "Issue assigned successfully",
      assignment,
    });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "ISSUE_NOT_FOUND") {
        return res.status(404).json({
          message: "Issue not found",
        });
      }

      if (error.message === "INVALID_AUTHORITY") {
        return res.status(400).json({
          message: "Invalid authority",
        });
      }

      if (error.message === "DEPARTMENT_NOT_FOUND") {
        return res.status(404).json({
          message: "Department not found",
        });
      }

      if (error.message === "WARD_NOT_FOUND") {
        return res.status(404).json({
          message: "Ward not found",
        });
      }
    }

    console.error("Create assignment error:", error);

    return res.status(500).json({
      message: "Something went wrong while assigning the issue",
    });
  }
}

export async function acceptAssignmentController(
  req: AuthenticatedRequest,
  res: Response
) {
  try {
    if (!req.user) {
      return res.status(401).json({
        message: "Authentication required",
      });
    }

    const { assignmentId } = req.params;

    if (!assignmentId) {
      return res.status(400).json({
        message: "Assignment ID is required",
      });
    }

    const assignment = await acceptAssignment(
      assignmentId,
      req.user.userId
    );

    return res.status(200).json({
      message: "Assignment accepted successfully",
      assignment,
    });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "ASSIGNMENT_NOT_FOUND") {
        return res.status(404).json({
          message: "Assignment not found",
        });
      }

      if (error.message === "NOT_ASSIGNED_AUTHORITY") {
        return res.status(403).json({
          message: "You are not assigned to this issue",
        });
      }

      if (error.message === "ALREADY_ACCEPTED") {
        return res.status(409).json({
          message: "Assignment has already been accepted",
        });
      }
    }

    console.error("Accept assignment error:", error);

    return res.status(500).json({
      message: "Something went wrong while accepting the assignment",
    });
  }
}

export async function startAssignmentController(
  req: AuthenticatedRequest,
  res: Response
) {
  try {
    if (!req.user) {
      return res.status(401).json({
        message: "Authentication required",
      });
    }

    const { assignmentId } = req.params;

    if (!assignmentId) {
      return res.status(400).json({
        message: "Assignment ID is required",
      });
    }

    const issue = await startAssignment(
      assignmentId,
      req.user.userId
    );

    return res.status(200).json({
      message: "Work started successfully",
      issue,
    });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "ASSIGNMENT_NOT_FOUND") {
        return res.status(404).json({
          message: "Assignment not found",
        });
      }

      if (error.message === "NOT_ASSIGNED_AUTHORITY") {
        return res.status(403).json({
          message: "You are not assigned to this issue",
        });
      }

      if (error.message === "ASSIGNMENT_NOT_ACCEPTED") {
        return res.status(400).json({
          message: "Assignment must be accepted before work can start",
        });
      }

      if (error.message === "INVALID_STATUS") {
        return res.status(409).json({
          message: "Issue is not in a valid state to start work",
        });
      }
    }

    console.error("Start assignment error:", error);

    return res.status(500).json({
      message: "Something went wrong while starting the work",
    });
  }
}

export async function resolveAssignmentController(
  req: AuthenticatedRequest,
  res: Response
) {
  try {
    if (!req.user) {
      return res.status(401).json({
        message: "Authentication required",
      });
    }

    const { assignmentId } = req.params;
    const { note } = req.body;

    if (!assignmentId) {
      return res.status(400).json({
        message: "Assignment ID is required",
      });
    }

    const assignment = await resolveAssignment(
      assignmentId,
      req.user.userId,
      note
    );

    return res.status(200).json({
      message: "Issue resolved successfully",
      assignment,
    });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "ASSIGNMENT_NOT_FOUND") {
        return res.status(404).json({
          message: "Assignment not found",
        });
      }

      if (error.message === "NOT_ASSIGNED_AUTHORITY") {
        return res.status(403).json({
          message: "You are not assigned to this issue",
        });
      }

      if (error.message === "ASSIGNMENT_NOT_ACCEPTED") {
        return res.status(400).json({
          message: "Assignment must be accepted before resolution",
        });
      }

      if (error.message === "INVALID_STATUS") {
        return res.status(409).json({
          message: "Issue is not in a valid state to be resolved",
        });
      }
    }

    console.error("Resolve assignment error:", error);

    return res.status(500).json({
      message: "Something went wrong while resolving the issue",
    });
  }
}

export async function getMyAssignmentsController(
  req: AuthenticatedRequest,
  res: Response
) {
  try {
    if (!req.user) {
      return res.status(401).json({
        message: "Authentication required",
      });
    }

    const assignments = await getMyAssignments(req.user.userId);

    return res.status(200).json({
      assignments,
    });
  } catch (error) {
    console.error("Get my assignments error:", error);

    return res.status(500).json({
      message: "Something went wrong while fetching assignments",
    });
  }
}