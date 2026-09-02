import {
  BrowserRouter,
  Link,
  Navigate,
  Route,
  Routes,
} from "react-router-dom";

import ProtectedRoute from "./components/ProtectedRoute";

import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";

import CitizenDashboard from "./pages/citizen/CitizenDashboard";
import ReportIssue from "./pages/citizen/ReportIssue";
import MyComplaints from "./pages/citizen/MyComplaints";
import ComplaintDetails from "./pages/citizen/ComplaintDetails";

import AuthorityDashboard from "./pages/authority/AuthorityDashboard";
import AuthorityIssueDetails from "./pages/authority/AuthorityIssueDetails";

import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminIssues from "./pages/admin/AdminIssues";
import AdminOrganization from "./pages/admin/AdminOrganization";
import AdminSLA from "./pages/admin/AdminSLA";
import AdminAssignments from "./pages/admin/AdminAssignments";

function Home() {
  return (
    <div className="page">
      <h1>CivicFix</h1>

      <p>
        Smart civic issue reporting platform.
      </p>

      <div>
        <Link to="/login">
          <button type="button">Login</button>
        </Link>

        <Link to="/register">
          <button type="button">Register</button>
        </Link>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* PUBLIC */}
        <Route
          path="/"
          element={<Home />}
        />

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/register"
          element={<Register />}
        />

        {/* CITIZEN */}
        <Route
          element={
            <ProtectedRoute
              allowedRoles={["CITIZEN"]}
            />
          }
        >
          <Route
            path="/citizen"
            element={<CitizenDashboard />}
          />

          <Route
            path="/citizen/report"
            element={<ReportIssue />}
          />

          <Route
            path="/citizen/complaints"
            element={<MyComplaints />}
          />

          <Route
            path="/citizen/complaints/:id"
            element={<ComplaintDetails />}
          />
        </Route>

        {/* AUTHORITY */}
        <Route
          element={
            <ProtectedRoute
              allowedRoles={[
                "AUTHORITY",
                "ADMIN",
              ]}
            />
          }
        >
          <Route
            path="/authority"
            element={<AuthorityDashboard />}
          />

          <Route
            path="/authority/issues/:id"
            element={<AuthorityIssueDetails />}
          />
        </Route>

        {/* ADMIN */}
        <Route
          element={
            <ProtectedRoute
              allowedRoles={["ADMIN"]}
            />
          }
        >
          <Route
            path="/admin"
            element={<AdminDashboard />}
          />

          <Route
            path="/admin/issues"
            element={<AdminIssues />}
          />

          <Route
            path="/admin/assignments"
            element={<AdminAssignments />}
          />

          <Route
            path="/admin/organization"
            element={<AdminOrganization />}
          />

          <Route
            path="/admin/sla"
            element={<AdminSLA />}
          />
        </Route>

        {/* FALLBACK */}
        <Route
          path="*"
          element={<Navigate to="/" replace />}
        />
      </Routes>
    </BrowserRouter>
  );
}