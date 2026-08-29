import { prisma } from "../lib/prisma";

interface CreateSLAData {
  issueId: string;
  durationMin: number;
}

export async function createSLA(
  data: CreateSLAData
) {
  const issue = await prisma.issue.findUnique({
    where: {
      id: data.issueId,
    },
  });

  if (!issue) {
    throw new Error("ISSUE_NOT_FOUND");
  }

  const existingSLA = await prisma.sLA.findUnique({
    where: {
      issueId: data.issueId,
    },
  });

  if (existingSLA) {
    throw new Error("SLA_ALREADY_EXISTS");
  }

  if (
    !Number.isInteger(data.durationMin) ||
    data.durationMin <= 0
  ) {
    throw new Error("INVALID_DURATION");
  }

  const deadline = new Date(
    issue.createdAt.getTime() +
      data.durationMin * 60 * 1000
  );

  return prisma.sLA.create({
    data: {
      issueId: data.issueId,
      durationMin: data.durationMin,
      deadline,
    },
    include: {
      issue: true,
    },
  });
}