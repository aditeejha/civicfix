import { Request, Response } from "express";
import {
  createDepartment,
  getDepartments,
  createWard,
  getWards,
  getAuthorities,
} from "../services/organization.service";

// ─────────────────────────────────────────────
// DEPARTMENTS
// ─────────────────────────────────────────────

export async function createDepartmentController(
  req: Request,
  res: Response
) {
  try {
    const { name } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        message: "Department name is required",
      });
    }

    const department = await createDepartment(name.trim());

    return res.status(201).json({
      message: "Department created successfully",
      department,
    });
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "DEPARTMENT_ALREADY_EXISTS"
    ) {
      return res.status(409).json({
        message: "A department with this name already exists",
      });
    }

    console.error("Create department error:", error);

    return res.status(500).json({
      message: "Something went wrong while creating the department",
    });
  }
}

export async function getDepartmentsController(
  _req: Request,
  res: Response
) {
  try {
    const departments = await getDepartments();

    return res.status(200).json({
      departments,
    });
  } catch (error) {
    console.error("Get departments error:", error);

    return res.status(500).json({
      message: "Something went wrong while fetching departments",
    });
  }
}

// ─────────────────────────────────────────────
// WARDS
// ─────────────────────────────────────────────

export async function createWardController(
  req: Request,
  res: Response
) {
  try {
    const { name, code } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        message: "Ward name is required",
      });
    }

    if (!code || !code.trim()) {
      return res.status(400).json({
        message: "Ward code is required",
      });
    }

    const ward = await createWard(
      name.trim(),
      code.trim()
    );

    return res.status(201).json({
      message: "Ward created successfully",
      ward,
    });
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "WARD_ALREADY_EXISTS"
    ) {
      return res.status(409).json({
        message: "A ward with this code already exists",
      });
    }

    console.error("Create ward error:", error);

    return res.status(500).json({
      message: "Something went wrong while creating the ward",
    });
  }
}

export async function getWardsController(
  _req: Request,
  res: Response
) {
  try {
    const wards = await getWards();

    return res.status(200).json({
      wards,
    });
  } catch (error) {
    console.error("Get wards error:", error);

    return res.status(500).json({
      message: "Something went wrong while fetching wards",
    });
  }
}

export async function getAuthoritiesController(
  _req: Request,
  res: Response
) {
  try {
    const authorities =
      await getAuthorities();

    return res.status(200).json({
      authorities,
    });
  } catch (error) {
    console.error(
      "Get authorities error:",
      error
    );

    return res.status(500).json({
      message:
        "Something went wrong while fetching authorities",
    });
  }
}