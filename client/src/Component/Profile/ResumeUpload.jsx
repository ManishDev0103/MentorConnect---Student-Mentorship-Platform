import React, { useState } from "react";
import { uploadResume } from "../../service/mentorService";
import "./Profile.css";

const ResumeUpload = ({ onSuccess }) => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState(""); // "success" or "error"
  const [fileName, setFileName] = useState("");

  const handleFileChange = (e) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      // Validate file type (PDF, DOC, DOCX)
      const validTypes = [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      ];
      const validExtensions = [".pdf", ".doc", ".docx"];
      
      const hasValidType = validTypes.includes(selectedFile.type);
      const hasValidExtension = validExtensions.some(ext => 
        selectedFile.name.toLowerCase().endsWith(ext)
      );

      if (!hasValidType && !hasValidExtension) {
        setMessageType("error");
        setMessage("Please upload a PDF, DOC, or DOCX file");
        setFile(null);
        return;
      }

      // Validate file size (max 5MB)
      if (selectedFile.size > 5 * 1024 * 1024) {
        setMessageType("error");
        setMessage("File size must be less than 5MB");
        setFile(null);
        return;
      }

      setFile(selectedFile);
      setFileName(selectedFile.name);
      setMessage("");
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    
    if (!file) {
      setMessageType("error");
      setMessage("Please select a file first");
      return;
    }

    setUploading(true);
    try {
      await uploadResume(file);
      setMessageType("success");
      setMessage("Resume uploaded successfully! ✓");
      setFile(null);
      setFileName("");
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setMessage("");
      }, 3000);

      // Callback to parent if provided
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error("Resume upload error:", error);
      console.error("Error response:", error.response);
      setMessageType("error");
      let errorMsg = "Failed to upload resume. Please try again.";
      
      if (error.response) {
        // Server responded with an error status
        console.error("Status:", error.response.status);
        console.error("Data:", error.response.data);
        errorMsg = error.response.data?.message || 
                   error.response.data || 
                   `Server error: ${error.response.status}`;
      } else if (error.message) {
        errorMsg = error.message;
      }
      
      setMessage(errorMsg);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="profile-card resume-upload-card">
      <div className="resume-header">
        <div>
          <h4>Upload Your Resume</h4>
          <p className="resume-subtitle">
            Uploading a resume increases your chances of getting verified! 📄
          </p>
        </div>
      </div>

      <form onSubmit={handleUpload} className="resume-form">
        <div className="resume-upload-section">
          <label htmlFor="resume-input" className="resume-label">
            <div className="upload-box">
              <span className="upload-icon">📤</span>
              <p className="upload-text">
                {fileName ? `Selected: ${fileName}` : "Click to select PDF file"}
              </p>
              <p className="upload-hint">PDF, DOC, or DOCX files only, max 5MB</p>
            </div>
            <input
              id="resume-input"
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={handleFileChange}
              disabled={uploading}
              style={{ display: "none" }}
            />
          </label>
        </div>

        {message && (
          <div className={`alert alert-${messageType} resume-message`}>
            {message}
          </div>
        )}

        <button
          type="submit"
          className="btn btn-primary btn-upload"
          disabled={!file || uploading}
        >
          {uploading ? "Uploading..." : "Upload Resume"}
        </button>
      </form>

      <div className="resume-info">
        <p className="info-text">
          <strong>Why upload your resume?</strong>
        </p>
        <ul className="info-list">
          <li>Helps verify your qualifications and expertise</li>
          <li>Increases your visibility to potential students</li>
          <li>Enhances your profile credibility</li>
          <li>Speeds up the verification process</li>
        </ul>
      </div>
    </div>
  );
};

export default ResumeUpload;
