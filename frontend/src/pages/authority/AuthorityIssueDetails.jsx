import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../../api/axios";

const STATUS_OPTIONS = [
  "ACKNOWLEDGED",
  "IN_PROGRESS",
  "RESOLVED",
];

export default function AuthorityIssueDetails() {
  const { id } = useParams();

  const [issue, setIssue] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedStatus, setSelectedStatus] =
    useState("");
  const [note, setNote] = useState("");
  const [updating, setUpdating] = useState(false);
  const [updateError, setUpdateError] =
    useState("");
  const [success, setSuccess] = useState("");

  async function fetchIssue() {
    try {
      const response = await api.get(
        `/issues/${id}`
      );

      setIssue(response.data.issue);
    } catch (error) {
      console.error(
        "Fetch issue error:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Unable to load issue."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (id) {
      fetchIssue();
    }
  }, [id]);

  function formatStatus(status) {
    return status
      ?.replace(/_/g, " ")
      .toLowerCase()
      .replace(/\b\w/g, (char) =>
        char.toUpperCase()
      );
  }

  function formatDate(date) {
    return new Date(date).toLocaleString(
      "en-IN",
      {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
      }
    );
  }

  async function handleStatusUpdate(event) {
    event.preventDefault();

    if (!selectedStatus) {
      setUpdateError(
        "Please select a status."
      );
      return;
    }

    setUpdating(true);
    setUpdateError("");
    setSuccess("");

    try {
      const response = await api.patch(
        `/issues/${id}/status`,
        {
          status: selectedStatus,
          note: note.trim() || undefined,
        }
      );

      setSuccess(
        response.data.message ||
          "Issue status updated successfully."
      );

      setNote("");
      setSelectedStatus("");

      await fetchIssue();
    } catch (error) {
      console.error(
        "Update issue status error:",
        error
      );

      setUpdateError(
        error.response?.data?.message ||
          "Unable to update issue status."
      );
    } finally {
      setUpdating(false);
    }
  }

  if (loading) {
    return (
      <div className="page">
        <p>Loading issue...</p>
      </div>
    );
  }

  if (error || !issue) {
    return (
      <div className="page">
        <Link to="/authority">
          ← Back to Authority Dashboard
        </Link>

        <h1>Issue</h1>

        <div className="form-error">
          {error || "Issue not found."}
        </div>
      </div>
    );
  }

  const canUpdate =
    ![
      "CLOSED",
      "DUPLICATE",
    ].includes(issue.status);

  return (
    <div className="page">
      <div className="page-header">
        <Link to="/authority">
          ← Back to Authority Dashboard
        </Link>

        <p className="eyebrow">
          AUTHORITY ISSUE
        </p>

        <h1>
          {issue.title || "Civic Issue"}
        </h1>

        <span
          className={`status-badge status-${issue.status
            ?.toLowerCase()
            .replace(/_/g, "-")}`}
        >
          {formatStatus(issue.status)}
        </span>
      </div>

      {success && (
        <div className="form-success">
          {success}
        </div>
      )}

      {/* Issue information */}

      <section className="details-card">
        <p className="eyebrow">
          ISSUE INFORMATION
        </p>

        <div className="details-grid">
          <div>
            <span className="detail-label">
              Category
            </span>

            <strong>
              {formatStatus(
                issue.category
              )}
            </strong>
          </div>

          <div>
            <span className="detail-label">
              Severity
            </span>

            <strong>
              {formatStatus(
                issue.severity
              )}
            </strong>
          </div>

          <div>
            <span className="detail-label">
              Reported
            </span>

            <strong>
              {formatDate(
                issue.createdAt
              )}
            </strong>
          </div>

          <div>
            <span className="detail-label">
              Complaints
            </span>

            <strong>
              {issue._count?.complaints ||
                0}
            </strong>
          </div>

          <div>
            <span className="detail-label">
              Upvotes
            </span>

            <strong>
              {issue._count?.upvotes || 0}
            </strong>
          </div>
        </div>
      </section>

      {/* Description */}

      <section className="details-card">
        <p className="eyebrow">
          DESCRIPTION
        </p>

        <p className="details-description">
          {issue.description ||
            "No description provided."}
        </p>
      </section>

      {/* Location */}

      <section className="details-card">
        <p className="eyebrow">
          LOCATION
        </p>

        <h3>
          📍{" "}
          {issue.address ||
            "Address unavailable"}
        </h3>

        <p>
          Coordinates: {issue.latitude},{" "}
          {issue.longitude}
        </p>
      </section>

      {/* Department */}

      {issue.department && (
        <section className="details-card">
          <p className="eyebrow">
            DEPARTMENT
          </p>

          <h3>
            {issue.department.name}
          </h3>
        </section>
      )}

      {/* Ward */}

      {issue.ward && (
        <section className="details-card">
          <p className="eyebrow">
            WARD
          </p>

          <h3>{issue.ward.name}</h3>

          {issue.ward.code && (
            <p>
              Ward Code: {issue.ward.code}
            </p>
          )}
        </section>
      )}

      {/* SLA */}

      {issue.sla && (
        <section className="details-card">
          <p className="eyebrow">
            SLA
          </p>

          <div className="details-grid">
            <div>
              <span className="detail-label">
                Resolution Time
              </span>

              <strong>
                {issue.sla.durationMin}{" "}
                minutes
              </strong>
            </div>

            <div>
              <span className="detail-label">
                Deadline
              </span>

              <strong>
                {formatDate(
                  issue.sla.deadline
                )}
              </strong>
            </div>

            <div>
              <span className="detail-label">
                SLA Status
              </span>

              <strong>
                {issue.sla.breached
                  ? "Breached"
                  : "Within SLA"}
              </strong>
            </div>
          </div>
        </section>
      )}

      {/* Assignments */}

      {issue.assignments?.length > 0 && (
        <section className="details-card">
          <p className="eyebrow">
            ASSIGNMENTS
          </p>

          {issue.assignments.map(
            (assignment) => (
              <div
                key={assignment.id}
                className="assignment-item"
              >
                <h3>
                  {assignment.authority
                    ?.name ||
                    "Authority"}
                </h3>

                <p>
                  {assignment.authority
                    ?.email || ""}
                </p>

                <p>
                  Assigned:{" "}
                  {formatDate(
                    assignment.assignedAt
                  )}
                </p>

                {assignment.acceptedAt && (
                  <p>
                    Accepted:{" "}
                    {formatDate(
                      assignment.acceptedAt
                    )}
                  </p>
                )}
              </div>
            )
          )}
        </section>
      )}

      {/* Status timeline */}

      <section className="details-card">
        <p className="eyebrow">
          PROGRESS
        </p>

        <h2>Status Timeline</h2>

        {issue.statusHistory?.length >
        0 ? (
          <div className="timeline">
            {issue.statusHistory.map(
              (history, index) => (
                <div
                  className="timeline-item"
                  key={history.id}
                >
                  <div className="timeline-marker">
                    {index ===
                    issue.statusHistory
                      .length -
                      1
                      ? "●"
                      : "✓"}
                  </div>

                  <div className="timeline-content">
                    <h3>
                      {formatStatus(
                        history.status
                      )}
                    </h3>

                    {history.note && (
                      <p>
                        {history.note}
                      </p>
                    )}

                    <small>
                      {formatDate(
                        history.createdAt
                      )}
                    </small>
                  </div>
                </div>
              )
            )}
          </div>
        ) : (
          <p>
            No status history available.
          </p>
        )}
      </section>

      {/* Status update */}

      {canUpdate && (
        <section className="details-card">
          <p className="eyebrow">
            UPDATE ISSUE
          </p>

          <h2>
            Change Issue Status
          </h2>

          <form
            onSubmit={handleStatusUpdate}
          >
            <div className="form-group">
              <label htmlFor="status">
                New Status
              </label>

              <select
                id="status"
                value={selectedStatus}
                onChange={(event) =>
                  setSelectedStatus(
                    event.target.value
                  )
                }
                disabled={updating}
              >
                <option value="">
                  Select status
                </option>

                {STATUS_OPTIONS.map(
                  (status) => (
                    <option
                      key={status}
                      value={status}
                    >
                      {formatStatus(status)}
                    </option>
                  )
                )}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="note">
                Note
              </label>

              <textarea
                id="note"
                value={note}
                onChange={(event) =>
                  setNote(
                    event.target.value
                  )
                }
                placeholder="Add an optional note about this status update..."
                rows={4}
                disabled={updating}
              />
            </div>

            {updateError && (
              <div className="form-error">
                {updateError}
              </div>
            )}

            <button
              type="submit"
              disabled={updating}
            >
              {updating
                ? "Updating..."
                : "Update Status"}
            </button>
          </form>
        </section>
      )}
    </div>
  );
}