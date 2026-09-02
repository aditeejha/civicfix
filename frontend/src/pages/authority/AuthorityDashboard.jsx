import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api/axios";
import Notifications from "../../components/Notifications";

export default function AuthorityDashboard() {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeFilter, setActiveFilter] = useState("ALL");

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

  const filteredAssignments = assignments.filter((assignment) => {
    const status = assignment.issue?.status;

    if (activeFilter === "PENDING") {
      return (
        !assignment.acceptedAt &&
        !assignment.completedAt &&
        status !== "RESOLVED"
      );
    }

    if (activeFilter === "ACTIVE") {
      return (
        !assignment.completedAt &&
        (
          status === "ACKNOWLEDGED" ||
          status === "IN_PROGRESS"
        )
      );
    }

    if (activeFilter === "RESOLVED") {
      return (
        assignment.completedAt ||
        status === "RESOLVED"
      );
    }

    return true;
  });

  function handleFilter(filter) {
    setActiveFilter(filter);
  }

  function getFilterTitle() {
    if (activeFilter === "PENDING") {
      return "Pending Acceptance";
    }

    if (activeFilter === "ACTIVE") {
      return "Active Issues";
    }

    if (activeFilter === "RESOLVED") {
      return "Resolved Issues";
    }

    return "Assigned Issues";
  }

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
        <button
          type="button"
          className={`stat-card stat-card-button ${
            activeFilter === "ALL" ? "stat-card-active" : ""
          }`}
          onClick={() => handleFilter("ALL")}
        >
          <h2>{assignments.length}</h2>
          <p>Total Assigned</p>
        </button>

        <button
          type="button"
          className={`stat-card stat-card-button ${
            activeFilter === "PENDING" ? "stat-card-active" : ""
          }`}
          onClick={() => handleFilter("PENDING")}
        >
          <h2>{pending}</h2>
          <p>Pending Acceptance</p>
        </button>

        <button
          type="button"
          className={`stat-card stat-card-button ${
            activeFilter === "ACTIVE" ? "stat-card-active" : ""
          }`}
          onClick={() => handleFilter("ACTIVE")}
        >
          <h2>{active}</h2>
          <p>Active Issues</p>
        </button>

        <button
          type="button"
          className={`stat-card stat-card-button ${
            activeFilter === "RESOLVED" ? "stat-card-active" : ""
          }`}
          onClick={() => handleFilter("RESOLVED")}
        >
          <h2>{resolved}</h2>
          <p>Resolved</p>
        </button>
      </section>

      {error && (
        <div className="form-error">
          {error}
        </div>
      )}

      <Notifications />

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
            <div>
              <p className="eyebrow">MY WORK</p>

              <h2>{getFilterTitle()}</h2>

              <p>
                {activeFilter === "ALL"
                  ? "Select an issue to view its details and update its progress."
                  : `Showing ${filteredAssignments.length} issue${
                      filteredAssignments.length === 1 ? "" : "s"
                    } in this category.`}
              </p>
            </div>

            {activeFilter !== "ALL" && (
              <button
                type="button"
                className="secondary-button"
                onClick={() => handleFilter("ALL")}
              >
                Show All Issues
              </button>
            )}
          </div>

          {filteredAssignments.length === 0 ? (
            <div className="empty-state">
              <h3>No {getFilterTitle().toLowerCase()}.</h3>

              <p>
                There are currently no issues in this category.
              </p>

              <button
                type="button"
                className="secondary-button"
                onClick={() => handleFilter("ALL")}
              >
                View All Assigned Issues
              </button>
            </div>
          ) : (
            <div className="complaints-list">
              {filteredAssignments.map((assignment) => {
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
                      {issue.description ||
                        "No description provided."}
                    </p>

                    <div className="complaint-meta">
                      <span>
                        Assigned{" "}
                        {formatDate(assignment.assignedAt)}
                      </span>

                      <span>
                        {stage}
                      </span>
                    </div>

                    {(assignment.department ||
                      assignment.ward) && (
                      <div className="complaint-meta">
                        {assignment.department && (
                          <span>
                            Department:{" "}
                            {assignment.department.name}
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
          )}
        </section>
      )}
    </div>
  );
}