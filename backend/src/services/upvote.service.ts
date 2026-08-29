import { prisma } from "../lib/prisma";

export async function upvoteIssue(
  userId: string,
  issueId: string
) {
  const issue = await prisma.issue.findUnique({
    where: {
      id: issueId,
    },
  });

  if (!issue) {
    throw new Error("ISSUE_NOT_FOUND");
  }

  const existingUpvote = await prisma.upvote.findUnique({
    where: {
      userId_issueId: {
        userId,
        issueId,
      },
    },
  });

  if (existingUpvote) {
    throw new Error("ALREADY_UPVOTED");
  }

  return prisma.upvote.create({
    data: {
      userId,
      issueId,
    },
  });
}