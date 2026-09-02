import { prisma } from "../lib/prisma";

export async function createNotification(
  userId: string,
  title: string,
  message: string
) {
  return prisma.notification.create({
    data: {
      userId,
      title,
      message,
    },
  });
}

export async function getUserNotifications(userId: string) {
  return prisma.notification.findMany({
    where: {
      userId,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

export async function markNotificationAsRead(
  notificationId: string,
  userId: string
) {
  const notification = await prisma.notification.findFirst({
    where: {
      id: notificationId,
      userId,
    },
  });

  if (!notification) {
    throw new Error("NOTIFICATION_NOT_FOUND");
  }

  return prisma.notification.update({
    where: {
      id: notificationId,
    },
    data: {
      isRead: true,
    },
  });
}

export async function markAllNotificationsAsRead(userId: string) {
  return prisma.notification.updateMany({
    where: {
      userId,
      isRead: false,
    },
    data: {
      isRead: true,
    },
  });
}