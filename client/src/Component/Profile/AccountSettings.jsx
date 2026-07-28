import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { getMyProfileDetails, updateEmailPreferences, deleteAccount } from "../../service/userService";
import "./Profile.css";
import ChangePasswordModal from "./ChangePasswordModal";

const AccountSettings = () => {
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const [emailNotificationsEnabled, setEmailNotificationsEnabled] = useState(true);
  const [loadingPref, setLoadingPref] = useState(false);

  useEffect(() => {
    fetchPreferences();
  }, []);

  const fetchPreferences = async () => {
    try {
      const res = await getMyProfileDetails();
      setEmailNotificationsEnabled(
        res.data.emailNotificationsEnabled !== false
      );
    } catch (error) {
      console.error("Failed to load notification preferences:", error);
    }
  };

  const handleNotificationToggle = async () => {
    setLoadingPref(true);
    try {
      const newValue = !emailNotificationsEnabled;
      await updateEmailPreferences(newValue);
      setEmailNotificationsEnabled(newValue);
      toast.success(
        `Email notifications ${newValue ? "enabled" : "disabled"}`
      );
    } catch (error) {
      console.error("Failed to update preferences:", error);
      toast.error("Unable to update email preferences. Please try again.");
    } finally {
      setLoadingPref(false);
    }
  };

  const handleDeleteAccount = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to delete your account? This action cannot be undone."
    );

    if (!confirmed) return;

    try {
      await deleteAccount();
      localStorage.removeItem("token");
      window.location.href = "/login";
    } catch (error) {
      console.error("Failed to delete account:", error);
      alert(error.response?.data?.message || error.message || "Unable to delete account. Please try again.");
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

        <div className="settings-item notification-item">
          <div>
            <strong>Notifications</strong>
            <p className="muted-text">Manage your email preferences</p>
          </div>
          <div className="form-check form-switch">
            <input
              className="form-check-input"
              type="checkbox"
              role="switch"
              id="emailNotificationsToggle"
              checked={emailNotificationsEnabled}
              onChange={handleNotificationToggle}
              disabled={loadingPref}
            />
            <label
              className="form-check-label"
              htmlFor="emailNotificationsToggle"
            >
              {emailNotificationsEnabled ? "Enabled" : "Disabled"}
            </label>
          </div>
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
