import React, { useState, useEffect } from "react";
import "./UserManagement.css";
import { adminDashboardService } from "../../../service/adminDashboardService";

const UserManagementContent = () => {
  const [users, setUsers] = useState([]);
  const [userStats, setUserStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    newThisMonth: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [statusModal, setStatusModal] = useState({
    visible: false,
    user: null,
    status: "ACTIVE",
    reason: "",
    until: "",
  });
  const [filterRole, setFilterRole] = useState("ALL");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async (role = "ALL") => {
    try {
      setLoading(true);

      let allUsers = [];
      let stats = { totalUsers: 0, activeUsers: 0, newThisMonth: 0 };

      try {
        if (role === "ALL") {
          allUsers = await adminDashboardService.getAllUsers();
        } else {
          allUsers = await adminDashboardService.getUsersByRole(role);
        }
      } catch (err) {
        console.error("Error fetching users:", err);
      }

      try {
        stats = await adminDashboardService.getUserStats();
      } catch (err) {
        console.error("Error fetching user stats:", err);
      }

      setUsers(allUsers || []);
      setUserStats(stats || { totalUsers: 0, activeUsers: 0, newThisMonth: 0 });
      setError(null);
    } catch (err) {
      console.error("Error fetching user data:", err);
      setError("Failed to load user data");
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const selectedRole = e.target.value;
    setFilterRole(selectedRole);
    fetchUserData(selectedRole);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Add logic to save new mentor
    console.log("New Mentor:", formData);
    setShowModal(false);
    setFormData({ name: "", email: "", password: "" });
    fetchUserData();
  };

  const handleDeleteUser = async (userId, userRole) => {
    if (userRole === "STUDENT") {
      setError("Cannot delete student users");
      return;
    }

    const roleText = userRole === "MENTOR" ? "Mentor" : "Admin";
    if (
      window.confirm(
        `Are you sure you want to delete this ${roleText}? This action cannot be undone.`,
      )
    ) {
      try {
        await adminDashboardService.deleteUser(userId);
        setSuccessMessage(`${roleText} deleted successfully`);
        fetchUserData(filterRole);
        setTimeout(() => setSuccessMessage(""), 3000);
      } catch (err) {
        console.error("Error deleting user:", err);
        setError(err.response?.data?.error || `Failed to delete ${roleText}`);
      }
    }
  };

  const openStatusModal = (user) => {
    setStatusModal({
      visible: true,
      user,
      status: user.status || "ACTIVE",
      reason: user.restrictionReason || "",
      until: user.restrictionUntil ? new Date(user.restrictionUntil).toISOString().slice(0, 16) : "",
    });
  };

  const closeStatusModal = () => {
    setStatusModal({
      visible: false,
      user: null,
      status: "ACTIVE",
      reason: "",
      until: "",
    });
  };

  const handleStatusChange = async (event) => {
    event.preventDefault();
    if (!statusModal.user) return;

    try {
      await adminDashboardService.updateUserStatus(
        statusModal.user.userId,
        statusModal.status,
        statusModal.reason,
        statusModal.until ? new Date(statusModal.until).toISOString() : null,
      );
      setSuccessMessage("User status updated successfully");
      closeStatusModal();
      fetchUserData(filterRole);
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      console.error("Error updating user status:", err);
      setError(err.response?.data?.error || err?.message || "Failed to update user status");
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
        <h2 className="page-title mb-1">User Management</h2>
        <p className="page-subtitle">Manage all users on the platform</p>
      </div>

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

      {/* Summary cards */}
      <div className="row g-3 mb-4">
        <div className="col-12 col-md-4">
          <div className="summary-card h-100">
            <h6 className="text-muted mb-2 small">Total Users</h6>
            <h3 className="summary-value">{userStats.totalUsers}</h3>
          </div>
        </div>
        <div className="col-12 col-md-4">
          <div className="summary-card h-100">
            <h6 className="text-muted mb-2 small">Active Users</h6>
            <h3 className="summary-value">{userStats.activeUsers}</h3>
          </div>
        </div>
        <div className="col-12 col-md-4">
          <div className="summary-card h-100">
            <h6 className="text-muted mb-2 small">New This Month</h6>
            <h3 className="summary-value">{userStats.newThisMonth}</h3>
          </div>
        </div>
      </div>

      {/* Users table */}
      <div className="card-box">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h5 className="card-header-title mb-0">All Users</h5>
          <select
            className="form-select"
            style={{ maxWidth: "200px" }}
            value={filterRole}
            onChange={handleFilterChange}
          >
            <option value="ALL">All Users</option>
            <option value="STUDENT">Students</option>
            <option value="MENTOR">Mentors</option>
            <option value="ADMIN">Admins</option>
          </select>
        </div>

        <div className="table-responsive">
          <table className="table table-hover align-middle">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th>Restriction</th>
                <th>Reason</th>
                <th>Joined</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.userId}>
                  <td className="fw-semibold">{user.name}</td>
                  <td className="text-muted">{user.email}</td>
                  <td>
                    <span
                      className={
                        "role-badge " +
                        (user.role === "MENTOR"
                          ? "role-mentor"
                          : user.role === "ADMIN"
                            ? "role-admin"
                            : "role-student")
                      }
                    >
                      {user.role === "MENTOR"
                        ? "Mentor"
                        : user.role === "ADMIN"
                          ? "Admin"
                          : "Student"}
                    </span>
                  </td>
                  <td>
                    <span
                      className={
                        "status-badge " +
                        (user.status === "ACTIVE"
                          ? "status-active"
                          : user.status === "SUSPENDED"
                            ? "status-suspended"
                            : user.status === "BANNED"
                              ? "status-banned"
                              : "status-inactive")
                      }
                    >
                      {user.status}
                    </span>
                  </td>
                  <td className="text-muted">
                    {user.restrictionUntil ? new Date(user.restrictionUntil).toLocaleDateString() : "-"}
                  </td>
                  <td className="text-muted">
                    {user.restrictionReason || "-"}
                  </td>
                  <td className="text-muted">
                    {new Date(user.joinedDate).toLocaleDateString()}
                  </td>
                  <td>
                    <button
                      className="btn btn-sm btn-outline-secondary me-2"
                      onClick={() => openStatusModal(user)}
                    >
                      Manage
                    </button>
                    <button
                      className={`btn btn-sm ${user.role === "STUDENT" ? "btn-secondary disabled" : "btn-outline-danger"}`}
                      onClick={() => handleDeleteUser(user.userId, user.role)}
                      disabled={user.role === "STUDENT"}
                      title={
                        user.role === "STUDENT"
                          ? "Cannot delete students"
                          : "Delete user"
                      }
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Mentor Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h5 className="modal-title">Add New Mentor</h5>
              <button
                className="close-button"
                onClick={() => setShowModal(false)}
              >
                &times;
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label htmlFor="name">Full Name</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    className="form-control"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="email">Email Address</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    className="form-control"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="password">Password</label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    className="form-control"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Role</label>
                  <input
                    type="text"
                    className="form-control"
                    value="Mentor"
                    disabled
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Add Mentor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {statusModal.visible && (
        <div className="modal-overlay" onClick={closeStatusModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h5 className="modal-title">Manage User Status</h5>
              <button
                className="close-button"
                onClick={closeStatusModal}
              >
                &times;
              </button>
            </div>
            <form onSubmit={handleStatusChange}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Status</label>
                  <select
                    className="form-control"
                    value={statusModal.status}
                    onChange={(e) =>
                      setStatusModal((prev) => ({ ...prev, status: e.target.value }))
                    }
                  >
                    <option value="ACTIVE">Active</option>
                    <option value="SUSPENDED">Suspended</option>
                    <option value="BANNED">Banned</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Reason</label>
                  <textarea
                    className="form-control"
                    value={statusModal.reason}
                    onChange={(e) =>
                      setStatusModal((prev) => ({ ...prev, reason: e.target.value }))
                    }
                    rows={3}
                  />
                </div>
                {statusModal.status === "SUSPENDED" && (
                  <div className="form-group">
                    <label>Restriction Until</label>
                    <input
                      type="datetime-local"
                      className="form-control"
                      value={statusModal.until}
                      onChange={(e) =>
                        setStatusModal((prev) => ({ ...prev, until: e.target.value }))
                      }
                    />
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={closeStatusModal}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Status
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagementContent;
