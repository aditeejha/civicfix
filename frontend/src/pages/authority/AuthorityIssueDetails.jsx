import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../../api/axios";

export default function AuthorityIssueDetails() {
  const { id } = useParams();

  const [issue, setIssue] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [actionLoading, setActionLoading] =
    useState(false);

  const [actionError, setActionError] =
    useState("");

  const [success, setSuccess] = useState("");

  const [resolveNote, setResolveNote] =
    useState("");

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

  const assignment =
    issue?.assignments?.[0] || null;

  async function performAssignmentAction(
    action,
    successMessage,
    body
  ) {
    if (!assignment) {
      setActionError(
        "No assignment found for this issue."
      );
      return;
    }

    setActionLoading(true);
    setActionError("");
    setSuccess("");

    try {
      const response = await api.patch(
        `/assignments/${assignment.id}/${action}`,
        body
      );

      setSuccess(
        response.data.message ||
          successMessage
      );

      await fetchIssue();
    } catch (error) {
      console.error(
        `${action} assignment error:`,
        error
      );

      setActionError(
        error.response?.data?.message ||
          `Unable to ${action} assignment.`
      );
    } finally {
      setActionLoading(false);
    }
  }

  function handleAccept() {
    performAssignmentAction(
      "accept",
      "Assignment accepted successfully."
    );
  }

  function handleStart() {
    performAssignmentAction(
      "start",
      "Work started successfully."
    );
  }

  function handleResolve(event) {
    event.preventDefault();

    performAssignmentAction(
      "resolve",
      "Issue resolved successfully.",
      {
        note:
          resolveNote.trim() ||
          undefined,
      }
    );

    setResolveNote("");
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

  const isAccepted =
    !!assignment?.acceptedAt;

  const isCompleted =
    !!assignment?.completedAt;

  const issueStatus = issue.status;

  const canAccept =
    assignment &&
    !isAccepted &&
    !isCompleted;

  const canStart =
    assignment &&
    isAccepted &&
    !isCompleted &&
    issueStatus === "ACKNOWLEDGED";

  const canResolve =
    assignment &&
    isAccepted &&
    !isCompleted &&
    issueStatus === "IN_PROGRESS";

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

      {actionError && (
        <div className="form-error">
          {actionError}
        </div>
      )}

      {/* Assignment actions */}

      {assignment && (
        <section className="details-card">
          <p className="eyebrow">
            ASSIGNMENT
          </p>

          <h2>
            {assignment.authority?.name ||
              "Assigned Authority"}
          </h2>

          <p>
            {assignment.authority?.email ||
              ""}
          </p>

          <div className="details-grid">
            <div>
              <span className="detail-label">
                Assigned
              </span>

              <strong>
                {formatDate(
                  assignment.assignedAt
                )}
              </strong>
            </div>

            <div>
              <span className="detail-label">
                Acceptance
              </span>

              <strong>
                {isAccepted
                  ? "Accepted"
                  : "Pending"}
              </strong>
            </div>

            {assignment.acceptedAt && (
              <div>
                <span className="detail-label">
                  Accepted At
                </span>

                <strong>
                  {formatDate(
                    assignment.acceptedAt
                  )}
                </strong>
              </div>
            )}

            {assignment.completedAt && (
              <div>
                <span className="detail-label">
                  Completed At
                </span>

                <strong>
                  {formatDate(
                    assignment.completedAt
                  )}
                </strong>
              </div>
            )}
          </div>

          <div className="assignment-actions">
            {canAccept && (
              <button
                type="button"
                onClick={handleAccept}
                disabled={actionLoading}
              >
                {actionLoading
                  ? "Processing..."
                  : "Accept Assignment"}
              </button>
            )}

            {canStart && (
              <button
                type="button"
                onClick={handleStart}
                disabled={actionLoading}
              >
                {actionLoading
                  ? "Starting..."
                  : "Start Work"}
              </button>
            )}

            {canResolve && (
              <form
                onSubmit={handleResolve}
              >
                <div className="form-group">
                  <label htmlFor="resolve-note">
                    Resolution Note
                  </label>

                  <textarea
                    id="resolve-note"
                    value={resolveNote}
                    onChange={(event) =>
                      setResolveNote(
                        event.target.value
                      )
                    }
                    placeholder="Describe the work completed..."
                    rows={4}
                    disabled={
                      actionLoading
                    }
                  />
                </div>

                <button
                  type="submit"
                  disabled={actionLoading}
                >
                  {actionLoading
                    ? "Resolving..."
                    : "Resolve Issue"}
                </button>
              </form>
            )}

            {!canAccept &&
              !canStart &&
              !canResolve &&
              !isCompleted && (
                <p>
                  No assignment action is
                  currently available.
                </p>
              )}

            {isCompleted && (
              <p>
                ✓ This assignment has been
                completed.
              </p>
            )}
          </div>
        </section>
      )}

      {!assignment && (
        <section className="details-card">
          <p className="eyebrow">
            ASSIGNMENT
          </p>

          <p>
            This issue has not been assigned
            yet.
          </p>
        </section>
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
    </div>
  );
}