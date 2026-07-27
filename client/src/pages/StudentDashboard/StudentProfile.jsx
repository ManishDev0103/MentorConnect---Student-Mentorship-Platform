import React, { useEffect, useState } from "react";
import ProfileCard from "../../Component/Profile/ProfileCard";
import AccountSettings from "../../Component/Profile/AccountSettings";
import ProfileImageUploadModal from "../../Component/Profile/ProfileImageUploadModal";
import ProfileSetupBanner from "../../Component/Profile/ProfileSetupBanner";
import EditProfileModal from "./Main/EditProfileModal";
import { getStudentDetailsByUserId } from "../../service/studentservice";
import { useAuth } from "../../API/AuthContext";

const StudentProfile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [imageRefresh, setImageRefresh] = useState(0);
  const { user: authUser } = useAuth();

  useEffect(() => {
    loadProfile();
  }, [authUser]);

  const loadProfile = async () => {
    setLoading(true);
    try {
      if (authUser?.userId) {
        const resp = await getStudentDetailsByUserId(authUser.userId);
        const dto = resp.data;
        const mapped = {
          role: "student",
          fullName: `${dto.firstName || ""} ${dto.lastName || ""}`.trim() || authUser?.name,
          email: dto.email || authUser?.email,
          avatar: authUser?.avatar || "https://randomuser.me/api/portraits/men/45.jpg",
          grade: dto.qualification || dto.targetDomain || "",
          location: authUser?.location || "",
          bio: dto.targetDomain ? `Target: ${dto.targetDomain}` : "",
          phone: authUser?.phone || authUser?.phoneNo || "",
          education: dto.qualification || "",
        };
        setUser(mapped);
      } else if (authUser) {
        setUser({
          role: "student",
          fullName: authUser.name || authUser.email,
          email: authUser.email,
          avatar: authUser.avatar || "https://randomuser.me/api/portraits/men/45.jpg",
        });
      }
    } catch (err) {
      console.error("Failed to load student profile:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleProfileUpdated = () => {
    loadProfile();
    setImageRefresh(prev => prev + 1);
  };

  const handleTaskClick = (task) => {
    if (task === 'uploadImage') {
      setIsImageModalOpen(true);
    } else if (task === 'editProfile' || task === 'addDetails') {
      setIsEditModalOpen(true);
    }
  };

  if (loading) return <div>Loading profile...</div>;
  if (!user) return <div>No profile available</div>;

  return (
    <>
      <ProfileSetupBanner 
        user={user} 
        onTaskClick={handleTaskClick}
      />
      
      <ProfileCard 
        user={user} 
        onEdit={() => setIsEditModalOpen(true)}
        onAvatarClick={() => setIsImageModalOpen(true)}
        imageRefresh={imageRefresh}
      />
      <AccountSettings />
      
      <ProfileImageUploadModal
        isOpen={isImageModalOpen}
        onClose={() => setIsImageModalOpen(false)}
        onImageUpdated={handleProfileUpdated}
      />
      
      <EditProfileModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onProfileUpdated={handleProfileUpdated}
      />
    </>
  );
};

export default StudentProfile;
