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
        const response = await api.get("/assignments/my");

        setAssignments(response.data.assignments || []);
      } catch (error) {
        console.error("Fetch assignments error:", error);

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
      .replace(/\b\w/g, (char) => char.toUpperCase());
  }

  function formatDate(date) {
    if (!date) return "Not available";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }

  function getAssignmentStage(assignment) {
    const status = assignment.issue?.status;

    if (assignment.completedAt || status === "RESOLVED") {
      return "Resolved";
    }

    if (status === "IN_PROGRESS") {
      return "In Progress";
    }

    if (assignment.acceptedAt || status === "ACKNOWLEDGED") {
      return "Accepted";
    }

    return "Pending Acceptance";
  }

  const pending = assignments.filter(
    (assignment) =>
      !assignment.acceptedAt &&
      !assignment.completedAt &&
      assignment.issue?.status !== "RESOLVED"
  ).length;

  const active = assignments.filter(
    (assignment) =>
      !assignment.completedAt &&
      (
        assignment.issue?.status === "ACKNOWLEDGED" ||
        assignment.issue?.status === "IN_PROGRESS"
      )
  ).length;

  const resolved = assignments.filter(
    (assignment) =>
      assignment.completedAt ||
      assignment.issue?.status === "RESOLVED"
  ).length;

  if (loading) {
    return (
      <div className="page">
        <div className="page-header">
          <p className="eyebrow">AUTHORITY</p>
          <h1>Authority Dashboard</h1>
          <p>Manage and track your assigned civic issues.</p>
        </div>

        <div className="empty-state">
          <h2>Loading assignments...</h2>
          <p>Please wait while we fetch your assigned issues.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="page-header">
        <p className="eyebrow">AUTHORITY</p>

        <h1>Authority Dashboard</h1>

        <p>
          Manage and track civic issues assigned to you.
        </p>
      </div>

      <section className="stats-grid">
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
      </section>

      {error && (
        <div className="form-error">
          {error}
        </div>
      )}

      {!error && assignments.length === 0 && (
        <div className="empty-state">
          <h2>No assignments yet</h2>

          <p>
            Issues assigned to you will appear here.
          </p>
        </div>
      )}

      {assignments.length > 0 && (
        <section>
          <div className="page-header">
            <p className="eyebrow">MY WORK</p>

            <h2>Assigned Issues</h2>

            <p>
              Select an issue to view its details and update its progress.
            </p>
          </div>

          <div className="complaints-list">
            {assignments.map((assignment) => {
              const issue = assignment.issue;

              if (!issue) {
                return null;
              }

              const stage = getAssignmentStage(assignment);

              return (
                <Link
                  key={assignment.id}
                  to={`/authority/issues/${issue.id}`}
                  className="complaint-card"
                >
                  <div className="complaint-card-header">
                    <div>
                      <h2>{issue.title}</h2>

                      <p>
                        {formatStatus(issue.category)}
                      </p>
                    </div>

                    <span
                      className={`status-badge status-${issue.status
                        ?.toLowerCase()
                        .replace(/_/g, "-")}`}
                    >
                      {formatStatus(issue.status)}
                    </span>
                  </div>

                  <p className="complaint-description">
                    {issue.description || "No description provided."}
                  </p>

                  <div className="complaint-meta">
                    <span>
                      Assigned {formatDate(assignment.assignedAt)}
                    </span>

                    <span>
                      {stage}
                    </span>
                  </div>

                  {(assignment.department || assignment.ward) && (
                    <div className="complaint-meta">
                      {assignment.department && (
                        <span>
                          Department: {assignment.department.name}
                        </span>
                      )}

                      {assignment.ward && (
                        <span>
                          Ward: {assignment.ward.name}
                          {assignment.ward.code
                            ? ` (${assignment.ward.code})`
                            : ""}
                        </span>
                      )}
                    </div>
                  )}

                  {issue.address && (
                    <p className="complaint-address">
                      📍 {issue.address}
                    </p>
                  )}
                </Link>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}