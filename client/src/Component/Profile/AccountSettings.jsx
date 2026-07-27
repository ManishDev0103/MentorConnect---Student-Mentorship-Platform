import React, { useState } from "react";
import api from "../../API/api";
import "./Profile.css";
import ChangePasswordModal from "./ChangePasswordModal";

const AccountSettings = () => {
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);

  const handleDeleteAccount = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to delete your account? This action cannot be undone."
    );

    if (!confirmed) return;

    try {
      await api.delete("/api/users/me");
      localStorage.removeItem("token");
      window.location.href = "/login";
    } catch (error) {
      console.error("Failed to delete account:", error);
      alert(error.message || "Unable to delete account. Please try again.");
    }
  };

  return (
    <>
      <div className="profile-card">
        <h4>Account Settings</h4>

        <div className="settings-item">
          <div>
            <strong>Password</strong>
            <p className="muted-text">Last changed 3 months ago</p>
          </div>
          <button 
            className="btn btn-outline-secondary btn-sm"
            onClick={() => setIsChangePasswordOpen(true)}
          >
            Change Password
          </button>
        </div>

        <div className="settings-item">
          <div>
            <strong>Notifications</strong>
            <p className="muted-text">Manage your email preferences</p>
          </div>
          <button className="btn btn-outline-secondary btn-sm">
            Configure
          </button>
        </div>

        <div className="settings-item danger">
          <div>
            <strong>Danger Zone</strong>
            <p className="muted-text">Delete account and all data</p>
          </div>
          <button
            className="btn btn-danger btn-sm"
            onClick={handleDeleteAccount}
          >
            Delete Account
          </button>
        </div>
      </div>
      <ChangePasswordModal 
        isOpen={isChangePasswordOpen}
        onClose={() => setIsChangePasswordOpen(false)}
      />
    </>
  );
};

export default AccountSettings;
