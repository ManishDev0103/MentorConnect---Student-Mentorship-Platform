import React, { useEffect, useState } from "react";
import ProfileCard from "../../Component/Profile/ProfileCard";
import AccountSettings from "../../Component/Profile/AccountSettings";
import ResumeUpload from "../../Component/Profile/ResumeUpload";
import ProfileImageUploadModal from "../../Component/Profile/ProfileImageUploadModal";
import ProfileSetupBanner from "../../Component/Profile/ProfileSetupBanner";
import EditMentorProfileModal from "../../Component/Profile/EditMentorProfileModal";
import { getMyMentorProfile } from "../../service/mentorService";
import { useAuth } from "../../API/AuthContext";

const MentorProfile = () => {
  const [mentor, setMentor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [imageRefresh, setImageRefresh] = useState(0);
  const { user: authUser, isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      load();
    }
  }, [authUser, isAuthenticated]);

  const load = async () => {
    setLoading(true);
    try {
      const resp = await getMyMentorProfile();
      const dto = resp.data;
      const mapped = {
        role: "mentor",
        fullName: dto.name || authUser?.name,
        email: dto.email || authUser?.email,
        avatar: authUser?.avatar || "https://randomuser.me/api/portraits/women/44.jpg",
        phone: authUser?.phone || authUser?.phoneNo || "",
        location: dto.location || "",
        education: dto.highestEducation || "",
        specialization: dto.specialization || "",
        experience: dto.experience || "",
        bio: dto.professionalBio || dto.about || "",
        verificationStatus: dto.verificationStatus || "PENDING",
      };
      setMentor(mapped);
    } catch (err) {
      console.error("Failed to load mentor profile:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleProfileUpdated = () => {
    load();
    setImageRefresh(prev => prev + 1);
  };

  const handleTaskClick = (task) => {
    if (task === 'uploadImage') {
      setIsImageModalOpen(true);
    } else if (task === 'editProfile' || task === 'addDetails') {
      setIsEditModalOpen(true);
    }
  };

  if (loading) return <div>Loading mentor profile...</div>;
  if (!mentor) return <div>No profile available</div>;

  return (
    <>
      {mentor.verificationStatus === "VERIFIED" ? (
        <div className="alert alert-success">Your account is verified.</div>
      ) : (
        <div className="alert alert-info">Your verification is pending.</div>
      )}
      
      <ProfileSetupBanner 
        user={mentor} 
        onTaskClick={handleTaskClick}
      />
      
      <ProfileCard 
        user={mentor} 
        onEdit={() => setIsEditModalOpen(true)}
        onAvatarClick={() => setIsImageModalOpen(true)}
        imageRefresh={imageRefresh}
      />
      <ResumeUpload />
      <AccountSettings />
      
      <ProfileImageUploadModal
        isOpen={isImageModalOpen}
        onClose={() => setIsImageModalOpen(false)}
        onImageUpdated={handleProfileUpdated}
      />
      
      <EditMentorProfileModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onProfileUpdated={handleProfileUpdated}
      />
    </>
  );
};

export default MentorProfile;
