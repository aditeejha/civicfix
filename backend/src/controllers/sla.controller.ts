import { Request, Response } from "express";
import {
  createSLA,
  checkSLABreaches,
} from "../services/sla.service";

export async function createSLAController(
  req: Request,
  res: Response
) {
  try {
    const { issueId, durationMin } = req.body;

    if (!issueId || durationMin === undefined) {
      return res.status(400).json({
        message: "Issue ID and duration are required",
      });
    }

    const sla = await createSLA({
      issueId,
      durationMin: Number(durationMin),
    });

    return res.status(201).json({
      message: "SLA created successfully",
      sla,
    });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "ISSUE_NOT_FOUND") {
        return res.status(404).json({
          message: "Issue not found",
        });
      }

      if (error.message === "SLA_ALREADY_EXISTS") {
        return res.status(409).json({
          message: "An SLA already exists for this issue",
        });
      }

      if (error.message === "INVALID_DURATION") {
        return res.status(400).json({
          message: "Duration must be a positive whole number",
        });
      }
    }

    console.error("Create SLA error:", error);

    return res.status(500).json({
      message: "Something went wrong while creating the SLA",
    });
  }
}

export async function checkSLABreachesController(
  _req: Request,
  res: Response
) {
  try {
    const results = await checkSLABreaches();

    return res.status(200).json({
      message: "SLA breach check completed",
      breachedCount: results.length,
      results,
    });
  } catch (error) {
    console.error("Check SLA breaches error:", error);

    return res.status(500).json({
      message: "Something went wrong while checking SLA breaches",
    });
  }
}