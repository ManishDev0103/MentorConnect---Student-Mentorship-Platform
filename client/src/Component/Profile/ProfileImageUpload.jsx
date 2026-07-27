import React, { useState, useEffect } from "react";
import { uploadProfileImage, getMyProfileImage } from "../../service/userService";
import "./Profile.css";

const ProfileImageUpload = ({ onImageUpdated }) => {
  const [imagePreview, setImagePreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [hasImage, setHasImage] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfileImage();
  }, []);

  const loadProfileImage = async () => {
    try {
      setLoading(true);
      const response = await getMyProfileImage();
      
      if (response.data && response.data.size > 0) {
        const imageUrl = URL.createObjectURL(response.data);
        setImagePreview(imageUrl);
        setHasImage(true);
      } else {
        setHasImage(false);
      }
    } catch (error) {
      // No image uploaded yet or error fetching
      setHasImage(false);
      console.log("No profile image found or error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setMessageType("error");
      setMessage("Please select an image file");
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      setMessageType("error");
      setMessage("Image size must be less than 2MB");
      return;
    }

    // Show preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);

    // Upload immediately
    handleUpload(file);
  };

  const handleUpload = async (file) => {
    try {
      setUploading(true);
      setMessage("");
      
      await uploadProfileImage(file);
      
      setMessageType("success");
      setMessage("Profile image uploaded successfully! ✓");
      setHasImage(true);
      
      // Clear message after 3 seconds
      setTimeout(() => {
        setMessage("");
      }, 3000);

      // Notify parent component
      if (onImageUpdated) {
        onImageUpdated();
      }
    } catch (error) {
      console.error("Image upload error:", error);
      setMessageType("error");
      const errorMsg =
        error.response?.data?.message ||
        error.response?.data ||
        "Failed to upload image. Please try again.";
      setMessage(errorMsg);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="profile-image-upload-card">
      <div className="image-upload-header">
        <h4>Profile Picture</h4>
        {!hasImage && (
          <p className="image-hint">
            📸 Upload your photo to improve visibility and build trust with students/mentors
          </p>
        )}
      </div>

      <div className="image-upload-content">
        <div className="image-preview-section">
          {loading ? (
            <div className="image-placeholder">
              <span className="loading-spinner-icon">⏳</span>
              <p>Loading...</p>
            </div>
          ) : imagePreview ? (
            <div className="image-preview">
              <img src={imagePreview} alt="Profile" />
              <div className="image-overlay">
                <label htmlFor="image-input" className="change-image-btn">
                  Change Photo
                </label>
              </div>
            </div>
          ) : (
            <div className="image-placeholder">
              <span className="placeholder-icon">👤</span>
              <p>No image uploaded</p>
              <label htmlFor="image-input" className="upload-image-btn">
                Upload Photo
              </label>
            </div>
          )}
          
          <input
            id="image-input"
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            disabled={uploading}
            style={{ display: "none" }}
          />
        </div>

        <div className="image-info-section">
          <div className="info-box">
            <h5>Why upload a profile picture?</h5>
            <ul>
              <li>✓ Increases profile visibility by 70%</li>
              <li>✓ Builds trust and credibility</li>
              <li>✓ Makes your profile more personable</li>
              <li>✓ Helps others recognize you easily</li>
            </ul>
          </div>
          
          <div className="upload-requirements">
            <p><strong>Requirements:</strong></p>
            <ul>
              <li>Format: JPG, PNG, or GIF</li>
              <li>Max size: 2MB</li>
              <li>Recommended: Square image (1:1 ratio)</li>
            </ul>
          </div>
        </div>
      </div>

      {message && (
        <div className={`alert alert-${messageType} image-message`}>
          {message}
        </div>
      )}

      {uploading && (
        <div className="upload-progress">
          <div className="progress-bar">
            <div className="progress-fill"></div>
          </div>
          <p>Uploading image...</p>
        </div>
      )}
    </div>
  );
};

export default ProfileImageUpload;
