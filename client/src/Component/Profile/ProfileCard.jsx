import React, { useState, useEffect } from "react";
import { getMyProfileImage } from "../../service/userService";
import "./Profile.css";

const ProfileCard = ({ user, onEdit, onAvatarClick, imageRefresh }) => {
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [loadingImage, setLoadingImage] = useState(true);

  useEffect(() => {
    loadProfileImage();
  }, [imageRefresh]);

  const loadProfileImage = async () => {
    try {
      setLoadingImage(true);
      // Revoke old object URL to free memory
      if (avatarUrl) {
        URL.revokeObjectURL(avatarUrl);
      }
      
      const response = await getMyProfileImage();
      console.log("ProfileCard - Image response:", response);
      console.log("ProfileCard - Image size:", response.data?.size);
      
      if (response.data && response.data.size > 0) {
        const imageUrl = URL.createObjectURL(response.data);
        console.log("ProfileCard - Created image URL:", imageUrl);
        setAvatarUrl(imageUrl);
      } else {
        console.log("ProfileCard - No image data");
        setAvatarUrl(null);
      }
    } catch (error) {
      // No image uploaded, use default
      console.error("ProfileCard - Error loading image:", error);
      setAvatarUrl(null);
    } finally {
      setLoadingImage(false);
    }
  };

  return (
    <div className="profile-card">
      <div className="profile-header">
        <h4>My Profile</h4>
        {onEdit && (
          <button 
            className="btn btn-outline-secondary btn-sm"
            onClick={onEdit}
          >
            Edit Profile
          </button>
        )}
      </div>

      <div className="profile-body">
        {/* Avatar */}
        <div className="profile-avatar-section">
          <div 
            className="profile-avatar-wrapper"
            onClick={onAvatarClick}
            style={{ cursor: 'pointer' }}
          >
            {loadingImage ? (
              <div className="profile-avatar loading">
                <span>⏳</span>
              </div>
            ) : (
              <img
                src={avatarUrl || user.avatar}
                alt={user.fullName}
                className="profile-avatar"
              />
            )}
            <div className="avatar-edit-overlay">
              <span className="camera-icon">📷</span>
            </div>
          </div>
          <span className={`role-badge ${user.role}`}>
            {user.role.toUpperCase()}
          </span>
        </div>

        {/* Details */}
        <div className="profile-details">
          <div>
            <label>Full Name</label>
            <p>{user.fullName}</p>
          </div>

          <div>
            <label>Email Address</label>
            <p>{user.email}</p>
          </div>

          {user.phone && (
            <div>
              <label>Phone Number</label>
              <p>{user.phone}</p>
            </div>
          )}

          {user.location && (
            <div>
              <label>Location</label>
              <p>{user.location}</p>
            </div>
          )}

          {/* Mentor/Admin specific */}
          {user.education && (
            <div>
              <label>Education</label>
              <p>{user.education}</p>
            </div>
          )}

          {user.specialization && (
            <div>
              <label>Specialization</label>
              <p>{user.specialization}</p>
            </div>
          )}

          {/* Student specific */}
          {user.grade && (
            <div>
              <label>Grade / Level</label>
              <p>{user.grade}</p>
            </div>
          )}
        </div>

        {user.bio && (
          <div className="profile-bio">
            <label>Bio</label>
            <p>{user.bio}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileCard;
