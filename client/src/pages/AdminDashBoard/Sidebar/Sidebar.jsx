import React from "react";
import "./Sidebar.css";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../API/AuthContext";

const Sidebar = ({ activeTab, onTabChange }) => {
  const navigation = useNavigate();
  const { logout } = useAuth();

  const onLogout = () => {
    logout();
    navigation("/");
  };
  return (
    <div className="sidebar d-flex flex-column h-100">
      {/* Logo */}
      <div className="sidebar-logo d-flex align-items-center">
        <div className="logo-box">
          <div className="logo-circle">
            <div className="logo-dot" />
          </div>
        </div>
        <div>
          <div className="logo-title">Mentorship</div>
          <div className="logo-subtitle text-muted">Personalized</div>
        </div>
      </div>

      <nav className="sidebar-menu d-flex flex-row flex-lg-column gap-2 overflow-auto pb-2 pb-lg-0">
        <SidebarItem
          label="Overview"
          icon="🏠"
          isActive={activeTab === "overview"}
          onClick={() => onTabChange("overview")}
        />
        <SidebarItem
          label="Verification"
          icon="🛡️"
          isActive={activeTab === "verification"}
          onClick={() => onTabChange("verification")}
        />
        <SidebarItem
          label="Complaints"
          icon="🎫"
          isActive={activeTab === "complaints"}
          onClick={() => onTabChange("complaints")}
        />
        <SidebarItem
          label="Profile"
          icon="👤"
          isActive={activeTab === "profile"}
          onClick={() => onTabChange("profile")}
        />
        <SidebarItem
          label="User Management"
          icon="👥"
          isActive={activeTab === "users"}
          onClick={() => onTabChange("users")}
        />
        <SidebarItem
          label="Revenue"
          icon="💲"
          isActive={activeTab === "revenue"}
          onClick={() => onTabChange("revenue")}
        />
        <SidebarItem
          label="Leaderboards"
          icon="🏆"
          isActive={activeTab === "leaderboards"}
          onClick={() => onTabChange("leaderboards")}
        />
        <SidebarItem
          label="Retention & Churn"
          icon="📊"
          isActive={activeTab === "retention"}
          onClick={() => onTabChange("retention")}
        />
      </nav>

      <div className="sidebar-logout mt-auto d-none d-lg-block">
        <button className="btn btn-light w-100" onClick={onLogout}>
          Logout
        </button>
      </div>
    </div>
  );
};

const SidebarItem = ({ label, icon, isActive, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className={
      "sidebar-item btn text-start d-inline-flex align-items-center" +
      (isActive ? " active" : "")
    }
  >
    <span className="me-2">{icon}</span>
    <span>{label}</span>
  </button>
);

export default Sidebar;
