import { prisma } from "../lib/prisma";
import { IssueStatus } from "../generated/prisma/client";

// ─────────────────────────────────────────────
// PUBLIC ISSUES
// ─────────────────────────────────────────────

export async function getPublicIssues() {
  return prisma.issue.findMany({
    where: {
      status: {
        notIn: ["CLOSED", "DUPLICATE"],
      },
    },
    include: {
      department: true,
      ward: true,
      sla: true,
      statusHistory: {
        orderBy: {
          createdAt: "asc",
        },
      },
      assignments: {
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
        },
      },
      _count: {
        select: {
          upvotes: true,
          complaints: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

// ─────────────────────────────────────────────
// ADMIN — ALL ISSUES
// ─────────────────────────────────────────────

export async function getAllIssues() {
  return prisma.issue.findMany({
    include: {
      department: true,
      ward: true,
      sla: true,
      statusHistory: {
        orderBy: {
          createdAt: "asc",
        },
      },
      assignments: {
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
        },
      },
      _count: {
        select: {
          upvotes: true,
          complaints: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

// ─────────────────────────────────────────────
// ISSUE BY ID
// ─────────────────────────────────────────────

export async function getIssueById(
  issueId: string
) {
  return prisma.issue.findUnique({
    where: {
      id: issueId,
    },
    include: {
      department: true,
      ward: true,
      sla: true,
      statusHistory: {
        orderBy: {
          createdAt: "asc",
        },
      },
      assignments: {
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
        },
      },
      _count: {
        select: {
          upvotes: true,
          complaints: true,
        },
      },
    },
  });
}

// ─────────────────────────────────────────────
// UPDATE ISSUE STATUS
// ─────────────────────────────────────────────

export async function updateIssueStatus(
  issueId: string,
  userId: string,
  status: IssueStatus,
  note?: string
) {
  const issue = await prisma.issue.findUnique({
    where: {
      id: issueId,
    },
  });

  if (!issue) {
    throw new Error("ISSUE_NOT_FOUND");
  }

  const result = await prisma.$transaction(
    async (tx) => {
      const updatedIssue =
        await tx.issue.update({
          where: {
            id: issueId,
          },
          data: {
            status,
          },
        });

      await tx.statusHistory.create({
        data: {
          issueId,
          changedBy: userId,
          status,
          note,
        },
      });

      return updatedIssue;
    }
  );

  return result;
}