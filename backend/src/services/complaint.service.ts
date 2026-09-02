import { prisma } from "../lib/prisma";
import { reverseGeocode } from "./geocoding.service";
import { createNotification } from "./notification.service";

interface CreateComplaintData {
  citizenId: string;
  imageUrl: string;
  description?: string;
  latitude: number;
  longitude: number;

  // Gemini AI results
  title: string;
  category: string;
  severity: string;
  aiConfidence: number;
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

export async function createComplaint(
  data: CreateComplaintData
) {
  const address = await reverseGeocode(
    data.latitude,
    data.longitude
  );

  const issue = await prisma.issue.create({
    data: {
      title: data.title,
      description: data.description,
      category: data.category as any,
      severity: data.severity as any,
      latitude: data.latitude,
      longitude: data.longitude,
      address,
      aiConfidence: data.aiConfidence,
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

export async function verifyComplaintResolution(
  complaintId: string,
  citizenId: string,
  approved: boolean,
  note?: string
) {
  const complaint = await prisma.complaint.findFirst({
    where: {
      id: complaintId,
      citizenId,
    },
    include: {
      issue: {
        include: {
          assignments: {
            orderBy: {
              assignedAt: "desc",
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
            },
          },
        },
      },
    },
  });

  if (!complaint) {
    throw new Error("COMPLAINT_NOT_FOUND");
  }

  if (complaint.issue.status !== "RESOLVED") {
    throw new Error("INVALID_STATUS");
  }

  const newStatus = approved ? "CLOSED" : "REOPENED";

  const result = await prisma.$transaction(
    async (tx) => {
      const updatedIssue = await tx.issue.update({
        where: {
          id: complaint.issueId,
        },
        data: {
          status: newStatus,
        },
      });

      await tx.statusHistory.create({
        data: {
          issueId: complaint.issueId,
          changedBy: citizenId,
          status: newStatus,
          note:
            note ??
            (approved
              ? "Citizen verified the resolution"
              : "Citizen rejected the resolution"),
        },
      });

      // When the citizen rejects the resolution,
      // reactivate the most recent assignment so
      // the authority can continue working on the issue.
      if (!approved) {
        const assignment = complaint.issue.assignments[0];

        if (assignment) {
          await tx.assignment.update({
            where: {
              id: assignment.id,
            },
            data: {
              acceptedAt: null,
              completedAt: null,
              assignedAt: new Date(),
            },
          });
        }
      }

      return updatedIssue;
    }
  );

  // Notify the authority when the citizen reopens the issue.
  if (!approved) {
    const assignment = complaint.issue.assignments[0];

    if (assignment) {
      await createNotification(
        assignment.authority.id,
        "Issue Reopened",
        `The citizen has rejected the resolution of "${complaint.issue.title}" and reopened the issue.${
          note ? ` Reason: ${note}` : ""
        }`
      );
    }
  }

  return result;
}