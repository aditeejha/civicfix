import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function CitizenDashboard() {
  const { user, logout } = useAuth();

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div>
          <h1>CivicFix</h1>
          <p>Citizen Portal</p>
        </div>

        <div className="dashboard-user">
          <span>
            {user?.name || "Citizen"}
          </span>

          <button onClick={logout}>
            Logout
          </button>
        </div>
      </header>

      <main className="dashboard-content">
        <section className="welcome-section">
          <p className="eyebrow">
            CITIZEN DASHBOARD
          </p>

          <h2>
            Welcome back,{" "}
            {user?.name || "Citizen"} 👋
          </h2>

          <p>
            Report civic problems and help make
            your community better.
          </p>
        </section>

        <section className="dashboard-actions">
          <Link
            to="/citizen/report"
            className="dashboard-card"
          >
            <span className="card-icon">
              +
            </span>

            <div>
              <h3>Report an Issue</h3>
              <p>
                Report a civic problem with a
                photo and location.
              </p>
            </div>
          </Link>

          <Link
            to="/citizen/complaints"
            className="dashboard-card"
          >
            <span className="card-icon">
              ✓
            </span>

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
            <span className="card-icon">
              ◉
            </span>

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
              <p className="eyebrow">
                ACTIVITY
              </p>

              <h2>
                Recent complaints
              </h2>
            </div>

            <Link to="/citizen/complaints">
              View all
            </Link>
          </div>

          <div className="empty-state">
            <h3>No complaints yet</h3>

            <p>
              Your submitted complaints will
              appear here.
            </p>

            <Link
              to="/citizen/report"
              className="primary-button"
            >
              Report your first issue
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}