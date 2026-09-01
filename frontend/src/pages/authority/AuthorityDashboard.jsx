import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api/axios";

export default function AuthorityDashboard() {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchAssignments() {
      try {
        const response = await api.get(
          "/assignments/my"
        );

        setAssignments(
          response.data.assignments || []
        );
      } catch (error) {
        console.error(error);

        setError(
          error.response?.data?.message ||
            "Unable to load assignments."
        );
      } finally {
        setLoading(false);
      }
    }

    fetchAssignments();
  }, []);

  function formatStatus(status) {
    return status
      ?.replace(/_/g, " ")
      .toLowerCase()
      .replace(/\b\w/g, (char) =>
        char.toUpperCase()
      );
  }

  function formatDate(date) {
    return new Date(date).toLocaleDateString(
      "en-IN",
      {
        day: "numeric",
        month: "short",
        year: "numeric",
      }
    );
  }

  const pending = assignments.filter(
    (a) => !a.acceptedAt
  ).length;

  const active = assignments.filter(
    (a) =>
      a.issue?.status === "ACKNOWLEDGED" ||
      a.issue?.status === "IN_PROGRESS"
  ).length;

  const resolved = assignments.filter(
    (a) =>
      a.issue?.status === "RESOLVED"
  ).length;

  if (loading) {
    return (
      <div className="page">
        <h1>Authority Dashboard</h1>
        <p>Loading assignments...</p>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="page-header">
        <h1>Authority Dashboard</h1>

        <p>
          Manage your assigned civic issues.
        </p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <h2>{assignments.length}</h2>
          <p>Total Assigned</p>
        </div>

        <div className="stat-card">
          <h2>{pending}</h2>
          <p>Pending Acceptance</p>
        </div>

        <div className="stat-card">
          <h2>{active}</h2>
          <p>Active Issues</p>
        </div>

        <div className="stat-card">
          <h2>{resolved}</h2>
          <p>Resolved</p>
        </div>
      </div>

      {error && (
        <div className="form-error">
          {error}
        </div>
      )}

      {!error &&
        assignments.length === 0 && (
          <div className="empty-state">
            <h2>
              No assignments yet
            </h2>

            <p>
              Issues assigned to you will
              appear here.
            </p>
          </div>
        )}

      {assignments.length > 0 && (
        <div className="complaints-list">
          {assignments.map(
            (assignment) => (
              <Link
                key={assignment.id}
                to={`/authority/issues/${assignment.issue.id}`}
                className="complaint-card"
              >
                <div className="complaint-card-header">
                  <div>
                    <h2>
                      {assignment.issue.title}
                    </h2>

                    <p>
                      {formatStatus(
                        assignment.issue
                          .category
                      )}
                    </p>
                  </div>

                  <span
                    className={`status-badge status-${assignment.issue.status
                      .toLowerCase()
                      .replace(
                        /_/g,
                        "-"
                      )}`}
                  >
                    {formatStatus(
                      assignment.issue
                        .status
                    )}
                  </span>
                </div>

                <p className="complaint-description">
                  {assignment.issue
                    .description ||
                    "No description"}
                </p>

                <div className="complaint-meta">
                  <span>
                    Assigned{" "}
                    {formatDate(
                      assignment.assignedAt
                    )}
                  </span>

                  <span>
                    {assignment.acceptedAt
                      ? "Accepted"
                      : "Pending"}
                  </span>
                </div>

                {assignment.issue
                  .address && (
                  <p className="complaint-address">
                    📍{" "}
                    {
                      assignment.issue
                        .address
                    }
                  </p>
                )}
              </Link>
            )
          )}
        </div>
      )}
    </div>
  );
}