import { Response } from "express";
import { AuthenticatedRequest } from "../middleware/auth.middleware";
import {
  createComplaint,
  getMyComplaints,
  getComplaintById,
} from "../services/complaint.service";
import { uploadImage } from "../services/image.service";


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

    const imageUrl = await uploadImage(req.file.buffer);

    const complaint = await createComplaint({
      citizenId: req.user.userId,
      imageUrl,
      description,
      latitude: Number(latitude),
      longitude: Number(longitude),
    });

    return res.status(201).json({
      message: "Complaint submitted successfully",
      complaint,
    });
  } catch (error) {
    console.error("Create complaint error:", error);

    return res.status(500).json({
      message: "Something went wrong while creating the complaint",
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

    const complaints = await getMyComplaints(req.user.userId);

    return res.status(200).json({
      complaints,
    });
  } catch (error) {
    console.error("Get complaints error:", error);

    return res.status(500).json({
      message: "Something went wrong while fetching complaints",
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
      message: "Something went wrong while fetching the complaint",
    });
  }
}