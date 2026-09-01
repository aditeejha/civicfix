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

function Home() {
  return (
    <div className="page">
      <h1>CivicFix</h1>

      <p>
        Smart civic issue reporting platform.
      </p>

      <div>
        <Link to="/login">
          <button type="button">
            Login
          </button>
        </Link>

        <Link to="/register">
          <button type="button">
            Register
          </button>
        </Link>
      </div>
    </div>
  );
}

function AdminDashboard() {
  return (
    <div className="page">
      <h1>Admin Dashboard</h1>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}

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

        {/* Citizen routes */}

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

        {/* Authority routes */}

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
            element={
              <AuthorityIssueDetails />
            }
          />
        </Route>

        {/* Admin routes */}

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
        </Route>

        {/* Unknown routes */}

        <Route
          path="*"
          element={
            <Navigate
              to="/"
              replace
            />
          }
        />
      </Routes>
    </BrowserRouter>
  );
}