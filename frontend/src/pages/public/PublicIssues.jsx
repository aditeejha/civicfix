import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api/axios";

export default function PublicIssues() {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchIssues() {
      try {
        const response = await api.get("/issues");

        setIssues(response.data.issues || response.data || []);
      } catch (error) {
        console.error("Fetch public issues error:", error);

        setError(
          error.response?.data?.message ||
            "Unable to load public issues."
        );
      } finally {
        setLoading(false);
      }
    }

    fetchIssues();
  }, []);

  function formatStatus(status) {
    return (
      status
        ?.replace(/_/g, " ")
        .toLowerCase()
        .replace(/\b\w/g, (char) => char.toUpperCase()) ||
      "Unknown"
    );
  }

  function formatDate(date) {
    return new Date(date).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }

  function getStatusClass(status) {
    return `status-badge status-${status
      ?.toLowerCase()
      .replace(/_/g, "-")}`;
  }

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div>
          <h1>CivicFix</h1>
          <p>Public Issues</p>
        </div>

        <div className="dashboard-user">
          <Link to="/citizen">
            Dashboard
          </Link>

          <Link to="/citizen/report">
            Report Issue
          </Link>
        </div>
      </header>

      <main className="dashboard-content">
        <section className="welcome-section">
          <p className="eyebrow">COMMUNITY</p>

          <h2>Public Civic Issues</h2>

          <p>
            View civic issues reported by the community
            and track their progress.
          </p>
        </section>

        {loading && (
          <div className="empty-state">
            <p>Loading public issues...</p>
          </div>
        )}

        {!loading && error && (
          <div className="form-error">
            {error}
          </div>
        )}

        {!loading &&
          !error &&
          issues.length === 0 && (
            <div className="empty-state">
              <h3>No public issues yet</h3>

              <p>
                Civic issues reported by the community
                will appear here.
              </p>

              <Link
                to="/citizen/report"
                className="primary-button"
              >
                Report an Issue
              </Link>
            </div>
          )}

        {!loading &&
          !error &&
          issues.length > 0 && (
            <section className="complaints-list">
              {issues.map((issue) => (
                <Link
                  key={issue.id}
                  to={`/issues/${issue.id}`}
                  className="complaint-card"
                >
                  <div className="complaint-card-header">
                    <div>
                      <h2>
                        {issue.title || "Civic Issue"}
                      </h2>

                      <p>
                        {formatStatus(issue.category)}
                      </p>
                    </div>

                    <span
                      className={getStatusClass(
                        issue.status
                      )}
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
                      Severity:{" "}
                      {formatStatus(issue.severity)}
                    </span>

                    <span>
                      {formatDate(issue.createdAt)}
                    </span>

                    <span>
                      👍 {issue._count?.upvotes || 0}
                    </span>
                  </div>

                  {issue.address && (
                    <p className="complaint-address">
                      📍 {issue.address}
                    </p>
                  )}
                </Link>
              ))}
            </section>
          )}
      </main>
    </div>
  );
}