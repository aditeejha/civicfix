import { prisma } from "../lib/prisma";

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