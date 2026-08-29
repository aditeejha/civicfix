import { prisma } from "../lib/prisma";

interface CreateAssignmentData {
  issueId: string;
  authorityId: string;
  departmentId?: string;
  wardId?: string;
}

export async function createAssignment(
  data: CreateAssignmentData
) {
  const issue = await prisma.issue.findUnique({
    where: {
      id: data.issueId,
    },
  });

  if (!issue) {
    throw new Error("ISSUE_NOT_FOUND");
  }

  const authority = await prisma.user.findUnique({
    where: {
      id: data.authorityId,
    },
  });

  if (!authority || authority.role !== "AUTHORITY") {
    throw new Error("INVALID_AUTHORITY");
  }

  if (data.departmentId) {
    const department = await prisma.department.findUnique({
      where: {
        id: data.departmentId,
      },
    });

    if (!department) {
      throw new Error("DEPARTMENT_NOT_FOUND");
    }
  }

  if (data.wardId) {
    const ward = await prisma.ward.findUnique({
      where: {
        id: data.wardId,
      },
    });

    if (!ward) {
      throw new Error("WARD_NOT_FOUND");
    }
  }

  const assignment = await prisma.assignment.create({
    data: {
      issueId: data.issueId,
      authorityId: data.authorityId,
      departmentId: data.departmentId,
      wardId: data.wardId,
    },
    include: {
      authority: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      },
      department: true,
      ward: true,
      issue: true,
    },
  });

  return assignment;
}

export async function acceptAssignment(
  assignmentId: string,
  authorityId: string
) {
  const assignment = await prisma.assignment.findUnique({
    where: {
      id: assignmentId,
    },
    include: {
      issue: true,
    },
  });

  if (!assignment) {
    throw new Error("ASSIGNMENT_NOT_FOUND");
  }

  if (assignment.authorityId !== authorityId) {
    throw new Error("NOT_ASSIGNED_AUTHORITY");
  }

  if (assignment.acceptedAt) {
    throw new Error("ALREADY_ACCEPTED");
  }

  const result = await prisma.$transaction(async (tx) => {
    const updatedAssignment = await tx.assignment.update({
      where: {
        id: assignmentId,
      },
      data: {
        acceptedAt: new Date(),
      },
      include: {
        authority: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
        department: true,
        ward: true,
        issue: true,
      },
    });

    await tx.issue.update({
      where: {
        id: assignment.issueId,
      },
      data: {
        status: "ACKNOWLEDGED",
      },
    });

    await tx.statusHistory.create({
      data: {
        issueId: assignment.issueId,
        changedBy: authorityId,
        status: "ACKNOWLEDGED",
        note: "Authority accepted the assignment",
      },
    });

    return updatedAssignment;
  });

  return result;
}

export async function startAssignment(
  assignmentId: string,
  authorityId: string
) {
  const assignment = await prisma.assignment.findUnique({
    where: {
      id: assignmentId,
    },
    include: {
      issue: true,
    },
  });

  if (!assignment) {
    throw new Error("ASSIGNMENT_NOT_FOUND");
  }

  if (assignment.authorityId !== authorityId) {
    throw new Error("NOT_ASSIGNED_AUTHORITY");
  }

  if (!assignment.acceptedAt) {
    throw new Error("ASSIGNMENT_NOT_ACCEPTED");
  }

  if (assignment.issue.status !== "ACKNOWLEDGED") {
    throw new Error("INVALID_STATUS");
  }

  const result = await prisma.$transaction(async (tx) => {
    const updatedIssue = await tx.issue.update({
      where: {
        id: assignment.issueId,
      },
      data: {
        status: "IN_PROGRESS",
      },
    });

    await tx.statusHistory.create({
      data: {
        issueId: assignment.issueId,
        changedBy: authorityId,
        status: "IN_PROGRESS",
        note: "Authority started working on the issue",
      },
    });

    return updatedIssue;
  });

  return result;
}

export async function resolveAssignment(
  assignmentId: string,
  authorityId: string,
  note?: string
) {
  const assignment = await prisma.assignment.findUnique({
    where: {
      id: assignmentId,
    },
    include: {
      issue: true,
    },
  });

  if (!assignment) {
    throw new Error("ASSIGNMENT_NOT_FOUND");
  }

  if (assignment.authorityId !== authorityId) {
    throw new Error("NOT_ASSIGNED_AUTHORITY");
  }

  if (!assignment.acceptedAt) {
    throw new Error("ASSIGNMENT_NOT_ACCEPTED");
  }

  if (assignment.issue.status !== "IN_PROGRESS") {
    throw new Error("INVALID_STATUS");
  }

  const result = await prisma.$transaction(async (tx) => {
    const updatedAssignment = await tx.assignment.update({
      where: {
        id: assignmentId,
      },
      data: {
        completedAt: new Date(),
      },
    });

    await tx.issue.update({
      where: {
        id: assignment.issueId,
      },
      data: {
        status: "RESOLVED",
      },
    });

    await tx.statusHistory.create({
      data: {
        issueId: assignment.issueId,
        changedBy: authorityId,
        status: "RESOLVED",
        note: note ?? "Authority resolved the issue",
      },
    });

    return updatedAssignment;
  });

  return result;
}

export async function getMyAssignments(authorityId: string) {
  return prisma.assignment.findMany({
    where: {
      authorityId,
    },
    include: {
      issue: {
        include: {
          department: true,
          ward: true,
          sla: true,
          statusHistory: {
            orderBy: {
              createdAt: "asc",
            },
          },
        },
      },
      department: true,
      ward: true,
    },
    orderBy: {
      assignedAt: "desc",
    },
  });
}