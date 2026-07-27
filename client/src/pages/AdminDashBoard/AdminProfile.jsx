import React, { useState, useEffect, useRef } from "react";
import ProfileCard from "../../Component/Profile/ProfileCard";
import AccountSettings from "../../Component/Profile/AccountSettings";
import { getMyProfileDetails, uploadProfileImage } from "../../service/userService";
import { toast } from "react-toastify";

const AdminProfile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [imageRefresh, setImageRefresh] = useState(0);
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await getMyProfileDetails();
      const data = res.data;

      setUser({
        role: data.userRole?.toLowerCase() || "admin",
        fullName: `${data.firstName || ""} ${data.lastName || ""}`.trim(),
        email: data.email,
        phone: data.phoneNo || "Not provided",
        location: data.address || "Not provided",
        specialization: "Platform Administration",
        bio: "Administrator",
        avatar: null
      });
    } catch (error) {
      console.error("Failed to fetch admin profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      await uploadProfileImage(file);
      toast.success("Profile image updated successfully!");
      setImageRefresh(prev => prev + 1); // Trigger refresh in ProfileCard
    } catch (error) {
      console.error("Error uploading image:", error);
      toast.error("Failed to upload image.");
    }
  };

  if (loading) return <div>Loading profile...</div>;

  return (
    <>
      <input
        type="file"
        ref={fileInputRef}
        style={{ display: "none" }}
        onChange={handleFileChange}
        accept="image/*"
      />
      {user && (
        <ProfileCard
          user={user}
          onAvatarClick={handleAvatarClick}
          imageRefresh={imageRefresh}
        />
      )}
      <AccountSettings />
    </>
  );
};

export default AdminProfile;
