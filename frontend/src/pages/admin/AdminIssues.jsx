import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api/axios";

export default function AdminIssues() {
  const [issues, setIssues] = useState([]);
  const [authorities, setAuthorities] =
    useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [assigningIssue, setAssigningIssue] =
    useState(null);

  const [selectedAuthority, setSelectedAuthority] =
    useState("");

  const [actionLoading, setActionLoading] =
    useState(false);

  const [actionMessage, setActionMessage] =
    useState("");

  async function fetchData() {
    try {
      setLoading(true);
      setError("");

      const [issuesResponse, authoritiesResponse] =
        await Promise.all([
          api.get("/issues/admin/all"),
          api.get(
            "/organization/authorities"
          ),
        ]);

      setIssues(
        issuesResponse.data.issues || []
      );

      setAuthorities(
        authoritiesResponse.data.authorities ||
          []
      );
    } catch (error) {
      console.error(
        "Fetch admin issues error:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Unable to load admin issue data."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchData();
  }, []);

  function formatLabel(value) {
    if (!value) {
      return "";
    }

    return value
      .replace(/_/g, " ")
      .toLowerCase()
      .replace(/\b\w/g, (char) =>
        char.toUpperCase()
      );
  }

  function formatDate(date) {
    if (!date) {
      return "—";
    }

    return new Date(date).toLocaleDateString(
      "en-IN",
      {
        day: "numeric",
        month: "short",
        year: "numeric",
      }
    );
  }

  function getActiveAssignment(issue) {
    if (!issue.assignments?.length) {
      return null;
    }

    return (
      issue.assignments.find(
        (assignment) =>
          !assignment.completedAt
      ) ||
      issue.assignments[
        issue.assignments.length - 1
      ]
    );
  }

  function openAssignment(issue) {
    setAssigningIssue(issue);
    setSelectedAuthority("");
    setActionMessage("");
  }

  function closeAssignment() {
    if (actionLoading) {
      return;
    }

    setAssigningIssue(null);
    setSelectedAuthority("");
    setActionMessage("");
  }

  async function handleAssign(event) {
    event.preventDefault();

    if (!assigningIssue) {
      return;
    }

    if (!selectedAuthority) {
      setActionMessage(
        "Please select an authority."
      );
      return;
    }

    setActionLoading(true);
    setActionMessage("");

    try {
      const response = await api.post(
        "/assignments",
        {
          issueId: assigningIssue.id,
          authorityId: selectedAuthority,
        }
      );

      setActionMessage(
        response.data.message ||
          "Issue assigned successfully."
      );

      await fetchData();

      setTimeout(() => {
        setAssigningIssue(null);
        setSelectedAuthority("");
        setActionMessage("");
      }, 700);
    } catch (error) {
      console.error(
        "Assign issue error:",
        error
      );

      setActionMessage(
        error.response?.data?.message ||
          "Unable to assign the issue."
      );
    } finally {
      setActionLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="page">
        <Link to="/admin">
          ← Back to Admin Dashboard
        </Link>

        <h1>Manage Issues</h1>

        <p>Loading issues...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page">
        <Link to="/admin">
          ← Back to Admin Dashboard
        </Link>

        <h1>Manage Issues</h1>

        <div className="form-error">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      {/* Header */}

      <div className="page-header">
        <Link to="/admin">
          ← Back to Admin Dashboard
        </Link>

        <p className="eyebrow">
          ADMINISTRATION
        </p>

        <h1>Manage Issues</h1>

        <p>
          Review CivicFix issues and assign
          them to authorities.
        </p>
      </div>

      {/* Issue count */}

      <div className="details-card">
        <p className="eyebrow">
          OVERVIEW
        </p>

        <h2>
          {issues.length}{" "}
          {issues.length === 1
            ? "Issue"
            : "Issues"}
        </h2>
      </div>

      {/* Issues */}

      {issues.length === 0 ? (
        <div className="details-card">
          <p>
            No issues found.
          </p>
        </div>
      ) : (
        <div className="issue-list">
          {issues.map((issue) => {
            const assignment =
              getActiveAssignment(issue);

            return (
              <article
                className="issue-card"
                key={issue.id}
              >
                <div className="issue-card-header">
                  <div>
                    <p className="eyebrow">
                      CIVIC ISSUE
                    </p>

                    <h2>
                      {issue.title ||
                        "Untitled Issue"}
                    </h2>
                  </div>

                  <span className="status-badge">
                    {formatLabel(
                      issue.status
                    )}
                  </span>
                </div>

                <div className="issue-meta">
                  <span>
                    Category:{" "}
                    {formatLabel(
                      issue.category
                    )}
                  </span>

                  <span>
                    Severity:{" "}
                    {formatLabel(
                      issue.severity
                    )}
                  </span>

                  <span>
                    Reported:{" "}
                    {formatDate(
                      issue.createdAt
                    )}
                  </span>
                </div>

                {issue.description && (
                  <p className="issue-description">
                    {issue.description}
                  </p>
                )}

                <div className="issue-assignment">
                  <strong>
                    Assigned Authority
                  </strong>

                  {assignment?.authority ? (
                    <p>
                      {assignment.authority.name}
                      {" — "}
                      {
                        assignment.authority
                          .email
                      }
                    </p>
                  ) : (
                    <p>
                      Not assigned
                    </p>
                  )}
                </div>

                <div className="issue-card-actions">
                  <Link
                    to={`/admin/issues/${issue.id}`}
                  >
                    <button type="button">
                      View Details
                    </button>
                  </Link>

                  {!assignment &&
                    issue.status !==
                      "CLOSED" &&
                    issue.status !==
                      "DUPLICATE" && (
                      <button
                        type="button"
                        onClick={() =>
                          openAssignment(
                            issue
                          )
                        }
                      >
                        Assign Authority
                      </button>
                    )}
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* Assignment Modal */}

      {assigningIssue && (
        <div className="modal-backdrop">
          <div className="modal">
            <div className="modal-header">
              <div>
                <p className="eyebrow">
                  ASSIGN ISSUE
                </p>

                <h2>
                  {assigningIssue.title ||
                    "Civic Issue"}
                </h2>
              </div>

              <button
                type="button"
                onClick={closeAssignment}
                disabled={actionLoading}
              >
                ✕
              </button>
            </div>

            <form
              onSubmit={handleAssign}
            >
              <div className="form-group">
                <label htmlFor="authority">
                  Select Authority
                </label>

                <select
                  id="authority"
                  value={
                    selectedAuthority
                  }
                  onChange={(event) =>
                    setSelectedAuthority(
                      event.target.value
                    )
                  }
                  disabled={actionLoading}
                >
                  <option value="">
                    Select an authority
                  </option>

                  {authorities.map(
                    (authority) => (
                      <option
                        key={authority.id}
                        value={
                          authority.id
                        }
                      >
                        {authority.name} —{" "}
                        {authority.email}
                      </option>
                    )
                  )}
                </select>
              </div>

              {actionMessage && (
                <div
                  className={
                    actionMessage.includes(
                      "successfully"
                    )
                      ? "form-success"
                      : "form-error"
                  }
                >
                  {actionMessage}
                </div>
              )}

              <div className="modal-actions">
                <button
                  type="button"
                  onClick={
                    closeAssignment
                  }
                  disabled={actionLoading}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={
                    actionLoading ||
                    !selectedAuthority
                  }
                >
                  {actionLoading
                    ? "Assigning..."
                    : "Assign Issue"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}