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

    console.log("STEP 1: Request validated");

    const {
      description,
      latitude,
      longitude,
    } = req.body;

    if (
      latitude === undefined ||
      longitude === undefined
    ) {
      return res.status(400).json({
        message:
          "Latitude and longitude are required",
      });
    }

    // ─────────────────────────────────────────
    // IMAGE UPLOAD
    // ─────────────────────────────────────────

    console.log("STEP 2: Uploading image");

    const imageUrl = await uploadImage(
      req.file.buffer
    );

    console.log(
      "STEP 3: Image uploaded:",
      imageUrl
    );

    // ─────────────────────────────────────────
    // GEMINI AI ANALYSIS
    // ─────────────────────────────────────────

    console.log(
      "STEP 4: Starting Gemini analysis"
    );

    let aiResult = {
      title: "Civic Issue",
      category: "OTHER",
      severity: "MEDIUM",
      confidence: 0,
    };

    try {
      aiResult = await analyzeCivicIssue(
        req.file.buffer,
        req.file.mimetype,
        description
      );

      console.log(
        "Gemini analysis successful:",
        aiResult
      );
    } catch (error) {
      console.error(
        "Gemini analysis failed. Using fallback classification:",
        error
      );
    }

    console.log(
      "STEP 5: Gemini finished"
    );

    // ─────────────────────────────────────────
    // CREATE COMPLAINT
    // ─────────────────────────────────────────

    console.log(
      "STEP 6: Creating complaint in database"
    );

    const complaint = await createComplaint({
      citizenId: req.user.userId,
      imageUrl,
      description,
      latitude: Number(latitude),
      longitude: Number(longitude),

      title: aiResult.title,
      category: aiResult.category,
      severity: aiResult.severity,
      aiConfidence: aiResult.confidence,
    });

    console.log(
      "STEP 7: Complaint created:",
      complaint.id
    );

    return res.status(201).json({
      message:
        "Complaint submitted successfully",
      complaint,
      ai: aiResult,
    });
  } catch (error) {
    console.error(
      "========== CREATE COMPLAINT FAILED =========="
    );

    console.error(error);

    if (error instanceof Error) {
      console.error(
        "Message:",
        error.message
      );

      console.error(
        "Stack:",
        error.stack
      );
    }

    console.error(
      "=============================================="
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
    console.error(
      "Get complaints error:",
      error
    );

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
    console.error(
      "Get complaint error:",
      error
    );

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
        message:
          "Approved must be true or false",
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
      if (
        error.message ===
        "COMPLAINT_NOT_FOUND"
      ) {
        return res.status(404).json({
          message: "Complaint not found",
        });
      }

      if (
        error.message ===
        "INVALID_STATUS"
      ) {
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