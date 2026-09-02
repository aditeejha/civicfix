import { useEffect, useState } from "react";
import api from "../api/axios";

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function fetchNotifications() {
    try {
      setError("");

      const response = await api.get("/notifications");

      setNotifications(response.data.notifications || []);
    } catch (error) {
      console.error("Fetch notifications error:", error);

      setError(
        error.response?.data?.message ||
          "Unable to load notifications."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchNotifications();
  }, []);

  async function markAsRead(notificationId) {
    try {
      await api.patch(
        `/notifications/${notificationId}/read`
      );

      setNotifications((current) =>
        current.map((notification) =>
          notification.id === notificationId
            ? { ...notification, isRead: true }
            : notification
        )
      );
    } catch (error) {
      console.error("Mark notification as read error:", error);
    }
  }

  async function markAllAsRead() {
    try {
      await api.patch("/notifications/read-all");

      setNotifications((current) =>
        current.map((notification) => ({
          ...notification,
          isRead: true,
        }))
      );
    } catch (error) {
      console.error(
        "Mark all notifications as read error:",
        error
      );
    }
  }

  function formatDate(date) {
    if (!date) return "";

    return new Date(date).toLocaleString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  }

  const unreadCount = notifications.filter(
    (notification) => !notification.isRead
  ).length;

  if (loading) {
    return (
      <section className="notifications-section">
        <div className="details-card">
          <p>Loading notifications...</p>
        </div>
      </section>
    );
  }

  return (
    <section className="notifications-section">
      <div className="notifications-header">
        <div>
          <p className="eyebrow">UPDATES</p>

          <h2>Notifications</h2>

          <p className="notifications-subtitle">
            Stay updated about your CivicFix issues.
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            type="button"
            className="secondary-button"
            onClick={markAllAsRead}
          >
            Mark all as read
          </button>
        )}
      </div>

      {error && (
        <div className="form-error">
          {error}
        </div>
      )}

      {!error && notifications.length === 0 && (
        <div className="empty-state">
          <h3>No notifications yet</h3>

          <p>
            Important updates about your civic issues
            will appear here.
          </p>
        </div>
      )}

      {!error && notifications.length > 0 && (
        <div className="notifications-list">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className={`notification-card ${
                notification.isRead
                  ? "notification-read"
                  : "notification-unread"
              }`}
              onClick={() =>
                !notification.isRead &&
                markAsRead(notification.id)
              }
            >
              <div className="notification-icon">
                {notification.isRead ? "✓" : "!"}
              </div>

              <div className="notification-content">
                <div className="notification-title-row">
                  <h3>{notification.title}</h3>

                  {!notification.isRead && (
                    <span className="notification-new">
                      New
                    </span>
                  )}
                </div>

                <p>{notification.message}</p>

                <small>
                  {formatDate(notification.createdAt)}
                </small>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}