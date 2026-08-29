import { prisma } from "../lib/prisma";

export async function getDashboardStats() {
  const [
    totalIssues,
    reported,
    acknowledged,
    inProgress,
    resolved,
    closed,
    slaBreached,
    escalated,
    reopened,
    duplicate,
  ] = await Promise.all([
    prisma.issue.count(),

    prisma.issue.count({
      where: {
        status: "REPORTED",
      },
    }),

    prisma.issue.count({
      where: {
        status: "ACKNOWLEDGED",
      },
    }),

    prisma.issue.count({
      where: {
        status: "IN_PROGRESS",
      },
    }),

    prisma.issue.count({
      where: {
        status: "RESOLVED",
      },
    }),

    prisma.issue.count({
      where: {
        status: "CLOSED",
      },
    }),

    prisma.issue.count({
      where: {
        status: "SLA_BREACHED",
      },
    }),

    prisma.issue.count({
      where: {
        status: "ESCALATED",
      },
    }),

    prisma.issue.count({
      where: {
        status: "REOPENED",
      },
    }),

    prisma.issue.count({
      where: {
        status: "DUPLICATE",
      },
    }),
  ]);

  const categoryStats = await prisma.issue.groupBy({
    by: ["category"],
    _count: {
      id: true,
    },
  });

  const severityStats = await prisma.issue.groupBy({
    by: ["severity"],
    _count: {
      id: true,
    },
  });

  return {
    totalIssues,
    status: {
      reported,
      acknowledged,
      inProgress,
      resolved,
      closed,
      slaBreached,
      escalated,
      reopened,
      duplicate,
    },
    category: categoryStats,
    severity: severityStats,
  };
}