import { prisma } from "../lib/prisma";

interface CreateComplaintData {
  citizenId: string;
  imageUrl: string;
  description?: string;
  latitude: number;
  longitude: number;
}

export async function createComplaint(data: CreateComplaintData) {
  const issue = await prisma.issue.create({
    data: {
      title: "Civic Issue",
      description: data.description,
      category: "OTHER",
      severity: "MEDIUM",
      latitude: data.latitude,
      longitude: data.longitude,
      status: "REPORTED",
    },
  });

  const complaint = await prisma.complaint.create({
    data: {
      citizenId: data.citizenId,
      issueId: issue.id,
      imageUrl: data.imageUrl,
      description: data.description,
      latitude: data.latitude,
      longitude: data.longitude,
    },
    include: {
      issue: true,
    },
  });

  return complaint;
}