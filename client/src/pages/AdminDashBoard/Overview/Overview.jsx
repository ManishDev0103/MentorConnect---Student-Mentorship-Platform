import React, { useState, useMemo } from "react";
import "./Overview.css";

import Sidebar from "../Sidebar/Sidebar";
import OverviewContent from "../OverviewContent/OverviewContent";
import VerificationContent from "../Verification/VerificationContent";
import UserManagementContent from "../UserManagement/UserManagementContent";
import ComplaintsContent from "../Complaints/ComplaintsContent";
import RevenueContent from "../Revenue/RevenueContent";
import PerformanceLeaderboards from "../PerformanceLeaderBoard/PerformanceLeaderBoard";
import RetentionChurn from "../RetentionChurn/RetentionChurn";
import AdminProfile from "../AdminProfile";

const Overview = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleDataRefresh = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  const chartData = useMemo(
    () => [
      { month: "Apr", students: 150, mentors: 12 },
      { month: "May", students: 200, mentors: 20 },
      { month: "Jun", students: 270, mentors: 30 },
      { month: "Jul", students: 340, mentors: 38 },
      { month: "Aug", students: 460, mentors: 42 },
      { month: "Sep", students: 580, mentors: 50 },
    ],
    [],
  );

  const activities = useMemo(
    () => [
      {
        icon: "👤",
        title: "New mentor approved",
        subtitle: "Dr. Sarah Mitchell joined",
        time: "2h ago",
        bg: "#3b5998",
      },
      {
        icon: "👥",
        title: "15 new student registrations",
        subtitle: "Today's signups",
        time: "5h ago",
        bg: "#17a2b8",
      },
      {
        icon: "₹",
        title: "Revenue milestone reached",
        subtitle: "₹40K monthly revenue",
        time: "1d ago",
        bg: "#fd7e14",
      },
    ],
    [],
  );

  const renderContent = () => {
    switch (activeTab) {
      case "overview":
        return (
          <OverviewContent
            chartData={chartData}
            activities={activities}
            refreshTrigger={refreshTrigger}
            onNavigate={setActiveTab}
          />
        );
      case "verification":
        return <VerificationContent onDataRefresh={handleDataRefresh} />;
      case "complaints":
        return <ComplaintsContent />;
      case "users":
        return <UserManagementContent />;
      case "revenue":
        return <RevenueContent />;
      case "leaderboards":
        return <PerformanceLeaderboards />;
      case "retention":
        return <RetentionChurn />;
      case "profile":
        return <AdminProfile />;
      default:
        return (
          <OverviewContent
            chartData={chartData}
            activities={activities}
            refreshTrigger={refreshTrigger}
            onNavigate={setActiveTab}
          />
        );
    }
  };

  return (
    <div className="admin-dashboard bg-light">
      <div className="container-fluid p-0">
        <div className="row g-0 admin-dashboard-row">
          <div className="col-12 col-lg-3 col-xl-2 p-0">
            <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
          </div>

          <div className="col-12 col-lg-9 col-xl-10">
            <main className="main-content py-3 py-md-4 px-2 px-md-4">
              {renderContent()}
            </main>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Overview;
