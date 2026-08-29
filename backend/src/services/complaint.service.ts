import { prisma } from "../lib/prisma";
import { reverseGeocode } from "./geocoding.service";

interface CreateComplaintData {
  citizenId: string;
  imageUrl: string;
  description?: string;
  latitude: number;
  longitude: number;
}

export async function getMyComplaints(citizenId: string) {
  return prisma.complaint.findMany({
    where: {
      citizenId,
    },
    include: {
      issue: {
        include: {
          department: true,
          ward: true,
          sla: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

export async function getComplaintById(
  complaintId: string,
  citizenId: string
) {
  return prisma.complaint.findFirst({
    where: {
      id: complaintId,
      citizenId,
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
        },
      },
    },
  });
}

export async function createComplaint(data: CreateComplaintData) {
  const address = await reverseGeocode(
    data.latitude,
    data.longitude
  );

  const issue = await prisma.issue.create({
    data: {
      title: "Civic Issue",
      description: data.description,
      category: "OTHER",
      severity: "MEDIUM",
      latitude: data.latitude,
      longitude: data.longitude,
      address,
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