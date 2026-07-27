import React, { useState, useEffect } from "react";
import { getMyProfileImage } from "../../service/userService";
import "./Profile.css";

const ProfileSetupBanner = ({ user, onTaskClick }) => {
  const [showTasks, setShowTasks] = useState(false);
  const [tasks, setTasks] = useState({
    profileImage: false,
    profileDetails: false,
    additionalInfo: false,
  });

  useEffect(() => {
    checkProfileCompletion();
  }, [user]);

  const checkProfileCompletion = async () => {
    // Check if profile image is uploaded
    try {
      const response = await getMyProfileImage();
      if (response.data && response.data.size > 0) {
        setTasks(prev => ({ ...prev, profileImage: true }));
      }
    } catch (error) {
      setTasks(prev => ({ ...prev, profileImage: false }));
    }

    // Check if basic profile details are filled
    if (user.role === "mentor") {
      const hasDetails = user.specialization && user.experience && user.education;
      setTasks(prev => ({ ...prev, profileDetails: !!hasDetails }));
      
      const hasAdditionalInfo = user.bio && user.bio.length > 50;
      setTasks(prev => ({ ...prev, additionalInfo: !!hasAdditionalInfo }));
    } else if (user.role === "student") {
      const hasDetails = user.fullName && user.email && user.grade;
      setTasks(prev => ({ ...prev, profileDetails: !!hasDetails }));
      
      const hasAdditionalInfo = user.education || user.bio;
      setTasks(prev => ({ ...prev, additionalInfo: !!hasAdditionalInfo }));
    }
  };

  const allTasksCompleted = Object.values(tasks).every(task => task);
  const completedCount = Object.values(tasks).filter(task => task).length;
  const totalTasks = Object.keys(tasks).length;

  if (allTasksCompleted) {
    return null; // Don't show banner if profile is complete
  }

  return (
    <>
      <div 
        className="profile-setup-banner"
        onClick={() => setShowTasks(!showTasks)}
      >
        <div className="banner-content">
          <div className="banner-icon">⚠️</div>
          <div className="banner-text">
            <strong>Complete your profile setup</strong>
            <p>
              {completedCount} of {totalTasks} tasks completed - 
              Complete your profile to increase visibility and build trust
            </p>
          </div>
          <button className="banner-toggle">
            {showTasks ? "Hide Tasks ▲" : "Show Tasks ▼"}
          </button>
        </div>
      </div>

      {showTasks && (
        <div className="profile-tasks-card">
          <h4>Profile Setup Tasks</h4>
          <div className="tasks-list">
            <div 
              className={`task-item ${tasks.profileImage ? 'completed' : ''}`}
              onClick={() => !tasks.profileImage && onTaskClick('uploadImage')}
            >
              <div className="task-checkbox">
                {tasks.profileImage ? '✓' : '○'}
              </div>
              <div className="task-content">
                <h5>Upload Profile Picture</h5>
                <p>Add a photo to make your profile more personable</p>
              </div>
            </div>

            <div 
              className={`task-item ${tasks.profileDetails ? 'completed' : ''}`}
              onClick={() => !tasks.profileDetails && onTaskClick('editProfile')}
            >
              <div className="task-checkbox">
                {tasks.profileDetails ? '✓' : '○'}
              </div>
              <div className="task-content">
                <h5>Edit Your Profile</h5>
                <p>Add your {user.role === 'mentor' ? 'specialization, experience, and education' : 'personal information and interests'}</p>
              </div>
            </div>

            <div 
              className={`task-item ${tasks.additionalInfo ? 'completed' : ''}`}
              onClick={() => !tasks.additionalInfo && onTaskClick('addDetails')}
            >
              <div className="task-checkbox">
                {tasks.additionalInfo ? '✓' : '○'}
              </div>
              <div className="task-content">
                <h5>Add Additional Details</h5>
                <p>
                  {user.role === 'mentor' 
                    ? 'Write a professional bio (min 50 characters)'
                    : 'Add your target domain and qualifications'
                  }
                </p>
              </div>
            </div>
          </div>

          <div className="progress-section">
            <div className="progress-bar-container">
              <div 
                className="progress-bar-fill" 
                style={{ width: `${(completedCount / totalTasks) * 100}%` }}
              ></div>
            </div>
            <p className="progress-text">
              {completedCount} of {totalTasks} tasks completed ({Math.round((completedCount / totalTasks) * 100)}%)
            </p>
          </div>
        </div>
      )}
    </>
  );
};

export default ProfileSetupBanner;
