import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api/axios";

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchStats() {
      try {
        const response = await api.get(
          "/dashboard/stats"
        );

        setStats(response.data.stats);
      } catch (error) {
        console.error(
          "Fetch dashboard stats error:",
          error
        );

        setError(
          error.response?.data?.message ||
            "Unable to load dashboard statistics."
        );
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, []);

  function formatLabel(value) {
    return value
      ?.replace(/([A-Z])/g, " $1")
      .replace(/^./, (char) =>
        char.toUpperCase()
      )
      .replace(/_/g, " ");
  }

  if (loading) {
    return (
      <div className="page">
        <h1>Admin Dashboard</h1>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page">
        <h1>Admin Dashboard</h1>

        <div className="form-error">
          {error}
        </div>
      </div>
    );
  }

  const status = stats?.status || {};

  return (
    <div className="page">
      <div className="page-header">
        <p className="eyebrow">
          ADMINISTRATION
        </p>

        <h1>Admin Dashboard</h1>

        <p>
          Monitor CivicFix issues and overall
          platform activity.
        </p>
      </div>

      {/* Main statistics */}

      <section className="stats-grid">
        <div className="stat-card">
          <h2>
            {stats?.totalIssues || 0}
          </h2>
          <p>Total Issues</p>
        </div>

        <div className="stat-card">
          <h2>
            {status.reported || 0}
          </h2>
          <p>Reported</p>
        </div>

        <div className="stat-card">
          <h2>
            {status.acknowledged || 0}
          </h2>
          <p>Acknowledged</p>
        </div>

        <div className="stat-card">
          <h2>
            {status.inProgress || 0}
          </h2>
          <p>In Progress</p>
        </div>

        <div className="stat-card">
          <h2>
            {status.resolved || 0}
          </h2>
          <p>Resolved</p>
        </div>

        <div className="stat-card">
          <h2>
            {status.closed || 0}
          </h2>
          <p>Closed</p>
        </div>

        <div className="stat-card">
          <h2>
            {status.reopened || 0}
          </h2>
          <p>Reopened</p>
        </div>

        <div className="stat-card">
          <h2>
            {status.escalated || 0}
          </h2>
          <p>Escalated</p>
        </div>

        <div className="stat-card">
          <h2>
            {status.slaBreached || 0}
          </h2>
          <p>SLA Breached</p>
        </div>

        <div className="stat-card">
          <h2>
            {status.duplicate || 0}
          </h2>
          <p>Duplicate</p>
        </div>
      </section>

      {/* Category statistics */}

      <section className="details-card">
        <p className="eyebrow">
          ISSUE CATEGORIES
        </p>

        <h2>Issues by Category</h2>

        {stats?.category?.length > 0 ? (
          <div className="stats-list">
            {stats.category.map(
              (item) => (
                <div
                  className="stats-list-item"
                  key={item.category}
                >
                  <span>
                    {formatLabel(
                      item.category
                    )}
                  </span>

                  <strong>
                    {item._count?.id ||
                      0}
                  </strong>
                </div>
              )
            )}
          </div>
        ) : (
          <p>No category data available.</p>
        )}
      </section>

      {/* Severity statistics */}

      <section className="details-card">
        <p className="eyebrow">
          ISSUE SEVERITY
        </p>

        <h2>Issues by Severity</h2>

        {stats?.severity?.length > 0 ? (
          <div className="stats-list">
            {stats.severity.map(
              (item) => (
                <div
                  className="stats-list-item"
                  key={item.severity}
                >
                  <span>
                    {formatLabel(
                      item.severity
                    )}
                  </span>

                  <strong>
                    {item._count?.id ||
                      0}
                  </strong>
                </div>
              )
            )}
          </div>
        ) : (
          <p>No severity data available.</p>
        )}
      </section>

      {/* Admin actions */}

      <section className="details-card">
        <p className="eyebrow">
          MANAGEMENT
        </p>

        <h2>Admin Tools</h2>

        <div className="admin-actions">
          <Link to="/admin/issues">
            <button type="button">
              Manage Issues
            </button>
          </Link>

          <Link to="/admin/assignments">
            <button type="button">
              Manage Assignments
            </button>
          </Link>

          <Link to="/admin/organization">
            <button type="button">
              Departments & Wards
            </button>
          </Link>

          <Link to="/admin/sla">
            <button type="button">
              SLA Management
            </button>
          </Link>
        </div>
      </section>
    </div>
  );
}