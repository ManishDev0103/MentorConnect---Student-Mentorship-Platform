import React, { useState, useEffect } from "react";
import "./VerificationContent.css";
import { adminDashboardService } from "../../../service/adminDashboardService";

const buildMentorAvatarUrl = (userId, name) => {
  if (!userId) {
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random&size=128`;
  }

  return `http://localhost:8080/api/users/image/${userId}`;
};

const VerificationContent = ({ onDataRefresh }) => {
  const [pendingVerifications, setPendingVerifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    fetchPendingVerifications();
  }, []);

  const fetchPendingVerifications = async () => {
    try {
      setLoading(true);
      const data = await adminDashboardService.getPendingVerifications();
      setPendingVerifications(data);
      setError(null);
    } catch (err) {
      console.error("Error fetching pending verifications:", err);
      setError("Failed to load pending verifications");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (mentorId) => {
    try {
      await adminDashboardService.approveMentor(mentorId);
      setSuccessMessage("Mentor approved successfully!");
      fetchPendingVerifications();
      if (onDataRefresh) onDataRefresh(); // Refresh overview data
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      console.error("Error approving mentor:", err);
      setError(err?.message || "Failed to approve mentor");
    }
  };

  const handleReject = async (mentorId) => {
    try {
      await adminDashboardService.rejectMentor(mentorId);
      setSuccessMessage("Mentor rejected successfully!");
      fetchPendingVerifications();
      if (onDataRefresh) onDataRefresh(); // Refresh overview data
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      console.error("Error rejecting mentor:", err);
      setError(err?.message || "Failed to reject mentor");
    }
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4">
        <h2 className="page-title mb-1">Verification</h2>
        <p className="page-subtitle">
          Review and approve pending verifications
        </p>
      </div>

      {successMessage && (
        <div
          className="alert alert-success alert-dismissible fade show"
          role="alert"
        >
          {successMessage}
          <button
            type="button"
            className="btn-close"
            onClick={() => setSuccessMessage("")}
          ></button>
        </div>
      )}

      {error && (
        <div
          className="alert alert-danger alert-dismissible fade show"
          role="alert"
        >
          {error}
          <button
            type="button"
            className="btn-close"
            onClick={() => setError("")}
          ></button>
        </div>
      )}

      <div className="card-box">
        <h5 className="card-header-title mb-3">Pending Verifications</h5>

        {pendingVerifications.length === 0 ? (
          <div className="alert alert-info">No pending verifications</div>
        ) : (
          <div className="table-responsive">
            <table className="table table-hover align-middle">
              <thead>
                <tr>
                  <th>Mentor</th>
                  <th>Type</th>
                  <th>Submitted</th>
                  <th>Status</th>
                  <th>CV</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {pendingVerifications.map((item) => {
                  const avatarFallback = `https://ui-avatars.com/api/?name=${encodeURIComponent(item.name || "Mentor")}&background=random&size=128`;
                  const avatarUrl = buildMentorAvatarUrl(item.userId, item.name);

                  return (
                    <tr key={item.mentorId ?? item.userId ?? item.email}>
                      <td>
                        <div className="d-flex align-items-center gap-3">
                          <img
                            src={avatarUrl}
                            alt={item.name}
                            className="rounded-circle border"
                            style={{ width: 42, height: 42, objectFit: "cover" }}
                            onError={(e) => {
                              e.currentTarget.src = avatarFallback;
                            }}
                          />
                          <span className="fw-semibold">{item.name}</span>
                        </div>
                      </td>
                      <td>
                      <span
                        className={
                          "badge-type " +
                          (item.type === "MENTOR"
                            ? "badge-type-mentor"
                            : "badge-type-student")
                        }
                      >
                        {item.type}
                      </span>
                    </td>
                    <td className="text-muted">
                      {new Date(item.submittedAt).toLocaleDateString()}
                    </td>
                    <td>
                      <span className="badge-pending">{item.status}</span>
                    </td>
                    <td>
                      {item.type === "MENTOR" && (
                        <button
                          className="btn btn-sm btn-outline-primary"
                          onClick={async () => {
                            try {
                              const token = localStorage.getItem("token");
                              const response = await fetch(
                                `http://localhost:8080/mentors/${item.userId}/resume`,
                                {
                                  headers: {
                                    Authorization: `Bearer ${token}`,
                                  },
                                }
                              );

                              if (!response.ok) {
                                throw new Error("Failed to fetch CV");
                              }

                              const blob = await response.blob();
                              const url = window.URL.createObjectURL(blob);
                              window.open(url, "_blank");
                            } catch (error) {
                              console.error("Error viewing CV:", error);
                              alert("Failed to load CV. The mentor may not have uploaded one yet.");
                            }
                          }}
                          title="View CV"
                        >
                          📄 CV
                        </button>
                      )}
                    </td>
                    <td>
                      <button
                        className="btn btn-sm btn-success me-2"
                        onClick={() => handleApprove(item.mentorId ?? item.userId)}
                      >
                        Approve
                      </button>
                      <button
                        className="btn btn-sm btn-danger"
                        onClick={() => handleReject(item.mentorId ?? item.userId)}
                      >
                        Reject
                      </button>
                    </td>
                  </tr>
                );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default VerificationContent;
