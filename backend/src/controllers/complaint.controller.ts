import { Response } from "express";
import { AuthenticatedRequest } from "../middleware/auth.middleware";
import {
  createComplaint,
  getMyComplaints,
  getComplaintById,
  verifyComplaintResolution,
} from "../services/complaint.service";
import { uploadImage } from "../services/image.service";
import { analyzeCivicIssue } from "../services/gemini.service";

export async function createComplaintController(
  req: AuthenticatedRequest,
  res: Response
) {
  try {
    if (!req.user) {
      return res.status(401).json({
        message: "Authentication required",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        message: "Complaint image is required",
      });
    }

    const {
      description,
      latitude,
      longitude,
    } = req.body;

    if (latitude === undefined || longitude === undefined) {
      return res.status(400).json({
        message: "Latitude and longitude are required",
      });
    }

    // ─────────────────────────────────────────
    // GEMINI AI ANALYSIS
    // ─────────────────────────────────────────

    const aiResult = await analyzeCivicIssue(
      req.file.buffer,
      req.file.mimetype,
      description
    );

    // ─────────────────────────────────────────
    // IMAGE UPLOAD
    // ─────────────────────────────────────────

    const imageUrl = await uploadImage(
      req.file.buffer
    );

    // ─────────────────────────────────────────
    // CREATE COMPLAINT
    // ─────────────────────────────────────────

    const complaint = await createComplaint({
      citizenId: req.user.userId,
      imageUrl,
      description,
      latitude: Number(latitude),
      longitude: Number(longitude),

      // AI-generated information
      title: aiResult.title,
      category: aiResult.category,
      severity: aiResult.severity,
      aiConfidence: aiResult.confidence,
    });

    return res.status(201).json({
      message: "Complaint submitted successfully",
      complaint,
      ai: aiResult,
    });
  } catch (error) {
    if (error instanceof Error) {
      if (
        error.message ===
        "GEMINI_API_KEY_NOT_CONFIGURED"
      ) {
        return res.status(500).json({
          message: "Gemini API is not configured",
        });
      }

      if (
        error.message ===
        "GEMINI_EMPTY_RESPONSE"
      ) {
        return res.status(502).json({
          message: "Gemini returned an empty response",
        });
      }
    }

    console.error(
      "Create complaint error:",
      error
    );

    return res.status(500).json({
      message:
        "Something went wrong while creating the complaint",
    });
  }
}

export async function getMyComplaintsController(
  req: AuthenticatedRequest,
  res: Response
) {
  try {
    if (!req.user) {
      return res.status(401).json({
        message: "Authentication required",
      });
    }

    const complaints = await getMyComplaints(
      req.user.userId
    );

    return res.status(200).json({
      complaints,
    });
  } catch (error) {
    console.error("Get complaints error:", error);

    return res.status(500).json({
      message:
        "Something went wrong while fetching complaints",
    });
  }
}

export async function getComplaintByIdController(
  req: AuthenticatedRequest,
  res: Response
) {
  try {
    if (!req.user) {
      return res.status(401).json({
        message: "Authentication required",
      });
    }

    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        message: "Complaint ID is required",
      });
    }

    const complaint = await getComplaintById(
      id,
      req.user.userId
    );

    if (!complaint) {
      return res.status(404).json({
        message: "Complaint not found",
      });
    }

    return res.status(200).json({
      complaint,
    });
  } catch (error) {
    console.error("Get complaint error:", error);

    return res.status(500).json({
      message:
        "Something went wrong while fetching the complaint",
    });
  }
}

export async function verifyComplaintResolutionController(
  req: AuthenticatedRequest,
  res: Response
) {
  try {
    if (!req.user) {
      return res.status(401).json({
        message: "Authentication required",
      });
    }

    const { complaintId } = req.params;
    const { approved, note } = req.body;

    if (!complaintId) {
      return res.status(400).json({
        message: "Complaint ID is required",
      });
    }

    if (typeof approved !== "boolean") {
      return res.status(400).json({
        message: "Approved must be true or false",
      });
    }

    const issue = await verifyComplaintResolution(
      complaintId,
      req.user.userId,
      approved,
      note
    );

    return res.status(200).json({
      message: approved
        ? "Complaint resolution verified successfully"
        : "Complaint reopened successfully",
      issue,
    });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "COMPLAINT_NOT_FOUND") {
        return res.status(404).json({
          message: "Complaint not found",
        });
      }

      if (error.message === "INVALID_STATUS") {
        return res.status(409).json({
          message:
            "Complaint is not ready for verification",
        });
      }
    }

    console.error(
      "Verify complaint resolution error:",
      error
    );

    return res.status(500).json({
      message:
        "Something went wrong while verifying the resolution",
    });
  }
}