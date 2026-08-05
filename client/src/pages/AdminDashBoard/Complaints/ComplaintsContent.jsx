import React, { useEffect, useState } from "react";
import { adminDashboardService } from "../../../service/adminDashboardService";
import { showError, showSuccess } from "../../../utils/toast";
import "./ComplaintsContent.css";

const ComplaintsContent = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [statusUpdate, setStatusUpdate] = useState({ status: "IN_PROGRESS", response: "" });
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    loadComplaints();
  }, []);

  const loadComplaints = async () => {
    try {
      setLoading(true);
      const data = await adminDashboardService.getAllComplaints();
      setComplaints(data || []);
      setError(null);
    } catch (err) {
      console.error("Failed to load complaints", err);
      setError("Unable to load complaints.");
    } finally {
      setLoading(false);
    }
  };

  const openComplaint = (complaint) => {
    setSelectedComplaint(complaint);
    setStatusUpdate({
      status: complaint.status === "OPEN" ? "IN_PROGRESS" : complaint.status,
      response: complaint.response || "",
    });
  };

  const closeComplaint = () => {
    setSelectedComplaint(null);
    setStatusUpdate({ status: "IN_PROGRESS", response: "" });
  };

  const handleSaveStatus = async (event) => {
    event.preventDefault();
    if (!selectedComplaint) return;

    try {
      await adminDashboardService.updateComplaintStatus(selectedComplaint.complaintId, statusUpdate);
      showSuccess("Complaint updated successfully.");
      setSuccessMessage("Complaint updated successfully.");
      closeComplaint();
      loadComplaints();
    } catch (err) {
      console.error("Error updating complaint status", err);
      const errorMessage = err?.response?.data?.error || err?.message || "Failed to update complaint.";
      showError(errorMessage);
      setError(errorMessage);
    }
  };

  return (
    <div>
      <div className="mb-4">
        <h2 className="page-title mb-1">Complaints</h2>
        <p className="page-subtitle">Review reported issues and manage complaint status.</p>
      </div>

      {error && (
        <div className="alert alert-danger alert-dismissible fade show" role="alert">
          {error}
          <button type="button" className="btn-close" onClick={() => setError(null)}></button>
        </div>
      )}

      {successMessage && (
        <div className="alert alert-success alert-dismissible fade show" role="alert">
          {successMessage}
          <button type="button" className="btn-close" onClick={() => setSuccessMessage("")}></button>
        </div>
      )}

      <div className="card-box">
        <div className="table-responsive">
          <table className="table table-hover align-middle">
            <thead>
              <tr>
                <th>Title</th>
                <th>Reporter</th>
                <th>Target</th>
                <th>Status</th>
                <th>Submitted</th>
                <th>Response</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" className="text-center py-4">
                    <div className="spinner-border" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                  </td>
                </tr>
              ) : complaints.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-4 text-muted">
                    No complaints submitted yet.
                  </td>
                </tr>
              ) : (
                complaints.map((complaint) => (
                  <tr key={complaint.complaintId}>
                    <td>{complaint.title}</td>
                    <td>{complaint.reporterName || complaint.reporterId}</td>
                    <td>{complaint.targetUserName || complaint.targetUserId || "-"}</td>
                    <td>{complaint.status}</td>
                    <td>{complaint.createdAt ? new Date(complaint.createdAt).toLocaleDateString() : "-"}</td>
                    <td>{complaint.response || "Awaiting response"}</td>
                    <td>
                      <button
                        className="btn btn-sm btn-outline-primary"
                        onClick={() => openComplaint(complaint)}
                      >
                        Review
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedComplaint && (
        <div className="modal-overlay" onClick={closeComplaint}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h5 className="modal-title">Update Complaint</h5>
              <button type="button" className="close-button" onClick={closeComplaint}>
                &times;
              </button>
            </div>
            <form onSubmit={handleSaveStatus}>
              <div className="modal-body">
                <div className="mb-3">
                  <strong>Title:</strong> {selectedComplaint.title}
                </div>
                <div className="mb-3">
                  <strong>Description:</strong>
                  <p>{selectedComplaint.description}</p>
                </div>
                <div className="form-group">
                  <label>Status</label>
                  <select
                    className="form-control"
                    value={statusUpdate.status}
                    onChange={(e) =>
                      setStatusUpdate((prev) => ({ ...prev, status: e.target.value }))
                    }
                  >
                    <option value="OPEN">Open</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="RESOLVED">Resolved</option>
                    <option value="CLOSED">Closed</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Admin Response</label>
                  <textarea
                    className="form-control"
                    rows={4}
                    value={statusUpdate.response}
                    onChange={(e) =>
                      setStatusUpdate((prev) => ({ ...prev, response: e.target.value }))
                    }
                    placeholder="Add a response or resolution note"
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={closeComplaint}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ComplaintsContent;
