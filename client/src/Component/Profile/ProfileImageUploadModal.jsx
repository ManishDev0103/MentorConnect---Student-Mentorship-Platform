import React, { useState, useEffect } from "react";
import { uploadProfileImage, getMyProfileImage } from "../../service/userService";
import "../Modal.css";
import "./Profile.css";

const ProfileImageUploadModal = ({ isOpen, onClose, onImageUpdated }) => {
  const [imagePreview, setImagePreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [hasImage, setHasImage] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      loadProfileImage();
    }
  }, [isOpen]);

  const loadProfileImage = async () => {
    try {
      setLoading(true);
      const response = await getMyProfileImage();
      
      console.log("Image response:", response);
      console.log("Image size:", response.data?.size);
      
      if (response.data && response.data.size > 0) {
        const imageUrl = URL.createObjectURL(response.data);
        setImagePreview(imageUrl);
        setHasImage(true);
      } else {
        setHasImage(false);
        setImagePreview(null);
      }
    } catch (error) {
      console.error("Error loading image:", error);
      setHasImage(false);
      setImagePreview(null);
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setMessageType("error");
      setMessage("Please select an image file");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setMessageType("error");
      setMessage("Image size must be less than 2MB");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);

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
      
      setTimeout(() => {
        if (onImageUpdated) {
          onImageUpdated();
        }
        onClose();
      }, 1500);
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

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Upload Profile Picture</h3>
          <button className="modal-close" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="modal-body">
          <div className="image-upload-modal-content">
            <div className="modal-image-preview-section">
              {loading ? (
                <div className="modal-image-placeholder">
                  <span className="loading-spinner-icon">⏳</span>
                  <p>Loading...</p>
                </div>
              ) : imagePreview ? (
                <div className="modal-image-preview">
                  <img src={imagePreview} alt="Profile" />
                </div>
              ) : (
                <div className="modal-image-placeholder">
                  <span className="placeholder-icon">👤</span>
                  <p>No image uploaded</p>
                </div>
              )}
            </div>

            <div className="modal-upload-section">
              <label htmlFor="modal-image-input" className="modal-upload-btn">
                {hasImage ? "Change Photo" : "Upload Photo"}
              </label>
              <input
                id="modal-image-input"
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                disabled={uploading}
                style={{ display: "none" }}
              />
            </div>

            <div className="modal-info-box">
              <p><strong>Requirements:</strong></p>
              <ul>
                <li>Format: JPG, PNG, or GIF</li>
                <li>Max size: 2MB</li>
                <li>Recommended: Square image (1:1 ratio)</li>
              </ul>
            </div>

            {message && (
              <div className={`alert alert-${messageType}`}>
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
        </div>
      </div>
    </div>
  );
};

export default ProfileImageUploadModal;
