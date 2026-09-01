import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import api from "../../api/axios";

export default function ComplaintDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showVerification, setShowVerification] =
    useState(false);
  const [approved, setApproved] = useState(null);
  const [note, setNote] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [verificationError, setVerificationError] =
    useState("");
  const [verificationSuccess, setVerificationSuccess] =
    useState("");

  async function fetchComplaint() {
    try {
      const response = await api.get(
        `/complaints/${id}`
      );

      setComplaint(
        response.data.complaint
      );
    } catch (error) {
      console.error(
        "Fetch complaint error:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Unable to load complaint."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (id) {
      fetchComplaint();
    }
  }, [id]);

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

  function formatStatus(status) {
    return status
      ?.replace(/_/g, " ")
      .toLowerCase()
      .replace(/\b\w/g, (char) =>
        char.toUpperCase()
      );
  }

  function getStatusClass(status) {
    return `status-badge status-${status
      ?.toLowerCase()
      .replace(/_/g, "-")}`;
  }

  function startVerification(value) {
    setApproved(value);
    setNote("");
    setVerificationError("");
    setVerificationSuccess("");
    setShowVerification(true);
  }

  async function handleVerification(event) {
    event.preventDefault();

    if (approved === null) {
      return;
    }

    setVerifying(true);
    setVerificationError("");
    setVerificationSuccess("");

    try {
      const response = await api.patch(
        `/complaints/${id}/verify`,
        {
          approved,
          note,
        }
      );

      setVerificationSuccess(
        response.data.message ||
          "Complaint updated successfully."
      );

      setShowVerification(false);

      await fetchComplaint();
    } catch (error) {
      console.error(
        "Verification error:",
        error
      );

      setVerificationError(
        error.response?.data?.message ||
          "Unable to update the complaint."
      );
    } finally {
      setVerifying(false);
    }
  }

  if (loading) {
    return (
      <div className="page">
        <p>Loading complaint...</p>
      </div>
    );
  }

  if (error || !complaint) {
    return (
      <div className="page">
        <div className="page-header">
          <Link to="/citizen/complaints">
            ← Back to My Complaints
          </Link>

          <h1>Complaint</h1>
        </div>

        <div className="form-error">
          {error || "Complaint not found."}
        </div>
      </div>
    );
  }

  const issue = complaint.issue;

  return (
    <div className="page">
      <div className="page-header">
        <Link to="/citizen/complaints">
          ← Back to My Complaints
        </Link>
      </div>

      {verificationSuccess && (
        <div className="form-success">
          {verificationSuccess}
        </div>
      )}

      <div className="complaint-details">
        {/* Header */}

        <section className="details-header">
          <div>
            <p className="eyebrow">
              CIVIC COMPLAINT
            </p>

            <h1>
              {issue?.title || "Civic Issue"}
            </h1>

            <p>
              Submitted on{" "}
              {formatDate(
                complaint.createdAt
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
        </section>

        {/* Image */}

        {complaint.imageUrl && (
          <section className="complaint-image-section">
            <img
              src={complaint.imageUrl}
              alt="Reported civic issue"
              className="complaint-image"
            />
          </section>
        )}

        {/* Classification */}

        <section className="details-card">
          <div className="details-grid">
            <div>
              <span className="detail-label">
                Category
              </span>

              <strong>
                {formatStatus(
                  issue?.category ||
                    "OTHER"
                )}
              </strong>
            </div>

            <div>
              <span className="detail-label">
                Severity
              </span>

              <strong>
                {formatStatus(
                  issue?.severity ||
                    "MEDIUM"
                )}
              </strong>
            </div>

            {issue?.aiConfidence !==
              null &&
              issue?.aiConfidence !==
                undefined && (
                <div>
                  <span className="detail-label">
                    AI Confidence
                  </span>

                  <strong>
                    {Math.round(
                      issue.aiConfidence *
                        100
                    )}
                    %
                  </strong>
                </div>
              )}
          </div>
        </section>

        {/* Description */}

        <section className="details-card">
          <p className="eyebrow">
            DESCRIPTION
          </p>

          <p className="details-description">
            {complaint.description ||
              issue?.description ||
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
            {issue?.address ||
              "Address unavailable"}
          </h3>

          <p>
            Coordinates:{" "}
            {complaint.latitude},{" "}
            {complaint.longitude}
          </p>
        </section>

        {/* Department / Ward */}

        {(issue?.department ||
          issue?.ward) && (
          <section className="details-card">
            <p className="eyebrow">
              ASSIGNMENT
            </p>

            {issue.department && (
              <p>
                <strong>
                  Department:
                </strong>{" "}
                {issue.department.name}
              </p>
            )}

            {issue.ward && (
              <p>
                <strong>
                  Ward:
                </strong>{" "}
                {issue.ward.name}
              </p>
            )}
          </section>
        )}

        {/* SLA */}

        {issue?.sla && (
          <section className="details-card">
            <p className="eyebrow">
              SERVICE LEVEL
            </p>

            <div className="details-grid">
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
                  Status
                </span>

                <strong>
                  {issue.sla.breached
                    ? "SLA Breached"
                    : "Within SLA"}
                </strong>
              </div>
            </div>
          </section>
        )}

        {/* Status Timeline */}

        <section className="details-card">
          <p className="eyebrow">
            PROGRESS
          </p>

          <h2>Status Timeline</h2>

          {issue?.statusHistory?.length >
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

                      <p>
                        {history.note ||
                          "Status updated."}
                      </p>

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

        {/* Resolution Verification */}

        {issue?.status ===
          "RESOLVED" && (
          <section className="details-card verification-card">
            <p className="eyebrow">
              RESOLUTION
            </p>

            <h2>
              Has this issue been resolved?
            </h2>

            <p>
              Please verify whether the
              reported civic issue has actually
              been fixed.
            </p>

            {!showVerification && (
              <div className="verification-actions">
                <button
                  type="button"
                  onClick={() =>
                    startVerification(true)
                  }
                >
                  ✓ Yes, it's resolved
                </button>

                <button
                  type="button"
                  onClick={() =>
                    startVerification(false)
                  }
                >
                  ✕ No, reopen it
                </button>
              </div>
            )}

            {showVerification && (
              <form
                onSubmit={handleVerification}
                className="verification-form"
              >
                <h3>
                  {approved
                    ? "Confirm resolution"
                    : "Reopen complaint"}
                </h3>

                <p>
                  {approved
                    ? "Confirm that the civic issue has been properly resolved."
                    : "Tell the authority why the issue is still unresolved."}
                </p>

                <textarea
                  value={note}
                  onChange={(event) =>
                    setNote(
                      event.target.value
                    )
                  }
                  placeholder={
                    approved
                      ? "Optional note"
                      : "Please explain what is still wrong..."
                  }
                  rows={4}
                  required={!approved}
                />

                {verificationError && (
                  <div className="form-error">
                    {verificationError}
                  </div>
                )}

                <div className="verification-actions">
                  <button
                    type="button"
                    onClick={() =>
                      setShowVerification(false)
                    }
                    disabled={verifying}
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={verifying}
                  >
                    {verifying
                      ? "Updating..."
                      : approved
                      ? "Confirm Resolution"
                      : "Reopen Complaint"}
                  </button>
                </div>
              </form>
            )}
          </section>
        )}
      </div>
    </div>
  );
}