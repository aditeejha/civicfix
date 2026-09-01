import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api/axios";

export default function AuthorityDashboard() {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchIssues() {
      try {
        const response = await api.get("/issues");

        setIssues(
          response.data.issues || []
        );
      } catch (error) {
        console.error(
          "Fetch authority issues error:",
          error
        );

        setError(
          error.response?.data?.message ||
            "Unable to load issues."
        );
      } finally {
        setLoading(false);
      }
    }

    fetchIssues();
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

  if (loading) {
    return (
      <div className="page">
        <h1>Authority Dashboard</h1>
        <p>Loading issues...</p>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="page-header">
        <h1>Authority Dashboard</h1>

        <p>
          Manage and resolve civic issues
          reported by citizens.
        </p>
      </div>

      {error && (
        <div className="form-error">
          {error}
        </div>
      )}

      {!error && issues.length === 0 && (
        <div className="empty-state">
          <h2>No issues found</h2>

          <p>
            There are currently no issues
            available for your authority account.
          </p>
        </div>
      )}

      {issues.length > 0 && (
        <div className="complaints-list">
          {issues.map((issue) => (
            <Link
              key={issue.id}
              to={`/authority/issues/${issue.id}`}
              className="complaint-card"
            >
              <div className="complaint-card-header">
                <div>
                  <h2>
                    {issue.title ||
                      "Civic Issue"}
                  </h2>

                  <p>
                    {formatStatus(
                      issue.category ||
                        "OTHER"
                    )}
                  </p>
                </div>

                <span
                  className={`status-badge status-${issue.status
                    ?.toLowerCase()
                    .replace(/_/g, "-")}`}
                >
                  {formatStatus(
                    issue.status
                  )}
                </span>
              </div>

              <p className="complaint-description">
                {issue.description ||
                  "No description provided."}
              </p>

              <div className="complaint-meta">
                <span>
                  Severity:{" "}
                  {formatStatus(
                    issue.severity ||
                      "MEDIUM"
                  )}
                </span>

                <span>
                  {formatDate(
                    issue.createdAt
                  )}
                </span>
              </div>

              {issue.address && (
                <p className="complaint-address">
                  📍 {issue.address}
                </p>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}