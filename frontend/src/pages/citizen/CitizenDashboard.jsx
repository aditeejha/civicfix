import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import api from "../../api/axios";

export default function CitizenDashboard() {
  const { user, logout } = useAuth();

  const [complaints, setComplaints] = useState([]);
  const [loadingComplaints, setLoadingComplaints] = useState(true);
  const [complaintError, setComplaintError] = useState("");

  useEffect(() => {
    async function fetchComplaints() {
      try {
        const response = await api.get("/complaints/my");

        setComplaints(response.data.complaints || []);
      } catch (error) {
        console.error("Fetch complaints error:", error);

        setComplaintError(
          error.response?.data?.message ||
            "Unable to load your recent complaints."
        );
      } finally {
        setLoadingComplaints(false);
      }
    }

    fetchComplaints();
  }, []);

  function formatDate(date) {
    return new Date(date).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }

  function formatStatus(status) {
    return (
      status
        ?.replace(/_/g, " ")
        .toLowerCase()
        .replace(/\b\w/g, (char) => char.toUpperCase()) ||
      "Unknown"
    );
  }

  function getStatusClass(status) {
    return `status-badge status-${status
      ?.toLowerCase()
      .replace(/_/g, "-")}`;
  }

  const recentComplaints = complaints.slice(0, 3);

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div>
          <h1>CivicFix</h1>
          <p>Citizen Portal</p>
        </div>

        <div className="dashboard-user">
          <span>{user?.name || "Citizen"}</span>

          <button onClick={logout}>Logout</button>
        </div>
      </header>

      <main className="dashboard-content">
        <section className="welcome-section">
          <p className="eyebrow">CITIZEN DASHBOARD</p>

          <h2>
            Welcome back, {user?.name || "Citizen"} 👋
          </h2>

          <p>
            Report civic problems and help make your
            community better.
          </p>
        </section>

        <section className="dashboard-actions">
          <Link
            to="/citizen/report"
            className="dashboard-card"
          >
            <span className="card-icon">+</span>

            <div>
              <h3>Report an Issue</h3>
              <p>
                Report a civic problem with a photo and
                location.
              </p>
            </div>
          </Link>

          <Link
            to="/citizen/complaints"
            className="dashboard-card"
          >
            <span className="card-icon">✓</span>

            <div>
              <h3>My Complaints</h3>
              <p>
                Track complaints you have submitted.
              </p>
            </div>
          </Link>

          <Link
            to="/issues"
            className="dashboard-card"
          >
            <span className="card-icon">◉</span>

            <div>
              <h3>Public Issues</h3>
              <p>
                See civic issues reported by the
                community.
              </p>
            </div>
          </Link>
        </section>

        <section className="recent-section">
          <div className="section-header">
            <div>
              <p className="eyebrow">ACTIVITY</p>

              <h2>Recent complaints</h2>
            </div>

            <Link to="/citizen/complaints">
              View all
            </Link>
          </div>

          {loadingComplaints && (
            <div className="empty-state">
              <p>Loading your recent complaints...</p>
            </div>
          )}

          {!loadingComplaints && complaintError && (
            <div className="form-error">
              {complaintError}
            </div>
          )}

          {!loadingComplaints &&
            !complaintError &&
            recentComplaints.length === 0 && (
              <div className="empty-state">
                <h3>No complaints yet</h3>

                <p>
                  Your submitted complaints will appear
                  here.
                </p>

                <Link
                  to="/citizen/report"
                  className="primary-button"
                >
                  Report your first issue
                </Link>
              </div>
            )}

          {!loadingComplaints &&
            !complaintError &&
            recentComplaints.length > 0 && (
              <div className="complaints-list">
                {recentComplaints.map((complaint) => {
                  const issue = complaint.issue;

                  return (
                    <Link
                      key={complaint.id}
                      to={`/citizen/complaints/${complaint.id}`}
                      className="complaint-card"
                    >
                      <div className="complaint-card-header">
                        <div>
                          <h2>
                            {issue?.title ||
                              "Civic Issue"}
                          </h2>

                          <p>
                            {formatStatus(
                              issue?.category
                            )}
                          </p>
                        </div>

                        <span
                          className={getStatusClass(
                            issue?.status
                          )}
                        >
                          {formatStatus(
                            issue?.status
                          )}
                        </span>
                      </div>

                      <p className="complaint-description">
                        {complaint.description ||
                          issue?.description ||
                          "No description provided."}
                      </p>

                      <div className="complaint-meta">
                        <span>
                          Severity:{" "}
                          {formatStatus(
                            issue?.severity
                          )}
                        </span>

                        <span>
                          {formatDate(
                            complaint.createdAt
                          )}
                        </span>
                      </div>

                      {issue?.address && (
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
      </main>
    </div>
  );
}