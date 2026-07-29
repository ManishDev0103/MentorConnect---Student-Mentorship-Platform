import "./DashboardHome.css";
import "../../../styles/common.css";
import { useState, useEffect } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import StatCard from "../../../Component/MentorComponents/StatCard/StatCard";
import DemoUpload from "../../../Component/MentorComponents/DemoUpload";
import PriceSettings from "../../../Component/MentorComponents/PriceSettings";
import SessionItem from "../../../Component/MentorComponents/SessionItem/SessionItem";
import StudentCard from "../../../Component/MentorComponents/StudentCard/StudentCard";
import EarningsChart from "../../../Component/MentorComponents/EarningsChart/EarningsChart";
import ChatModal from "../../../Component/MentorComponents/ChatModal/ChatModal";
import {
  getDashboardStats,
  getTodaySessions,
  getMyStudents,
} from "../../../service/mentorService";
import { handleApiError } from "../../../utils/toast";
import { getMentorId } from "../../../service/authService";

function DashboardHome() {
  const [date, setDate] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatStudentId, setChatStudentId] = useState(null);
  const [stats, setStats] = useState({
    activeStudents: 0,
    totalSessions: 0,
    totalEarnings: 0,
    monthlyEarnings: 0,
    averageRating: 0,
  });
  const [sessions, setSessions] = useState([]);
  const [students, setStudents] = useState([]);

  // Get mentor ID from localStorage (set during login)
  const mentorId = getMentorId();

  console.log("DashboardHome - Using mentorId:", mentorId);

  useEffect(() => {
    console.log("Current Mentor ID:", mentorId);
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch all data in parallel
      const [statsData, todaySessionsData, studentsData] = await Promise.all([
        getDashboardStats(mentorId),
        getTodaySessions(mentorId),
        getMyStudents(mentorId),
      ]);

      if (statsData.success) {
        setStats({
          activeStudents: statsData.data.activeStudents || 0,
          totalSessions: statsData.data.totalSessions || 0,
          totalEarnings: statsData.data.totalEarnings || 0,
          monthlyEarnings: statsData.data.thisMonthEarnings || 0,
          averageRating: statsData.data.averageRating || 0,
        });
      }

      if (todaySessionsData.success) {
        setSessions(todaySessionsData.data || []);
      }

      if (studentsData.success) {
        setStudents(studentsData.data || []);
      }
      // Fallbacks if data empty or offline
      if (!statsData?.success || !statsData?.data) {
        setStats({
          activeStudents: 18,
          totalSessions: 42,
          totalEarnings: 21000,
          monthlyEarnings: 8500,
          averageRating: 4.9,
        });
      }

      // If no sessions or students data, leave lists empty instead of pre-filled demo entries
      if (!todaySessionsData?.success || !todaySessionsData?.data?.length) {
        setSessions([]);
      }

      if (!studentsData?.success || !studentsData?.data?.length) {
        setStudents([]);
      }
    } catch (error) {
      console.warn("Using mentor dashboard demo fallback state:", error);
      setStats({
        activeStudents: 18,
        totalSessions: 42,
        totalEarnings: 21000,
        monthlyEarnings: 8500,
        averageRating: 4.9,
      });
      // Do not pre-populate sessions or students with demo entries
      setSessions([]);
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };

  const UsersIcon = () => (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );

  const CalendarIcon = () => (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );

  const DollarIcon = () => (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="6" x2="12" y2="18" />
      <path d="M9 10a2 2 0 0 1 2-2h2a2 2 0 0 1 0 4h-2a2 2 0 0 0 0 4h2a2 2 0 0 0 2-2" />
    </svg>
  );

  const StarIcon = () => (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#f97316"
      strokeWidth="2"
    >
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );

  const isPastDate = (selectedDate) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const checkDate = new Date(selectedDate);
    checkDate.setHours(0, 0, 0, 0);
    return checkDate < today;
  };

  const handleDateChange = (newDate) => {
    if (!isPastDate(newDate)) {
      setDate(newDate);
    }
  };

  return (
    <div className="dashboard-home">
      <div className="page-header">
        <h1 className="page-title">Mentor Dashboard</h1>
        <p className="page-subtitle">Manage your students and sessions</p>
      </div>

      {loading ? (
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading dashboard...</p>
        </div>
      ) : (
        <>
          <div className="row">
            <StatCard
              title="Active Students"
              value={stats.activeStudents.toString()}
              icon={<UsersIcon />}
              iconBg="bg-teal"
            />
            <StatCard
              title="Total Sessions"
              value={stats.totalSessions.toString()}
              icon={<CalendarIcon />}
              iconBg="bg-teal"
            />
            <StatCard
              title="This Month Earnings"
              value={`₹${stats.monthlyEarnings.toLocaleString("en-IN")}`}
              icon={<DollarIcon />}
              iconBg="bg-green"
            />
            <StatCard
              title="Average Rating"
              value={stats.averageRating.toFixed(1)}
              icon={<StarIcon />}
              iconBg="bg-orange"
            />
          </div>

          <div className="row mt-4">
            <div className="col-12">
              <div className="section-card">
                <h5 className="section-title">Upload Demo Video</h5>
                <DemoUpload />
              </div>
            </div>
          </div>

          <div className="row mt-4">
            <div className="col-12">
              <PriceSettings />
            </div>
          </div>

          <div className="row mt-4">
            <div className="col-lg-5 mb-4">
              <div className="section-card">
                <h5 className="section-title">Availability Calendar</h5>
                <div className="calendar-wrapper">
                  <Calendar
                    value={date}
                    onChange={handleDateChange}
                    minDate={new Date()}
                    tileDisabled={({ date: tileDate }) => isPastDate(tileDate)}
                    selectRange={false}
                  />
                </div>
              </div>

              <div className="section-card mt-4">
                <h5 className="section-title">Today's Sessions</h5>
                {sessions.length === 0 ? (
                  <p className="text-muted">No sessions scheduled for today</p>
                ) : (
                  sessions.map((session, index) => (
                    <SessionItem
                      key={index}
                      time={session.startTime}
                      student={session.studentName}
                      topic={session.topic}
                    />
                  ))
                )}
              </div>
            </div>

            <div className="col-lg-7 mb-4">
              <div className="section-card">
                <h5 className="section-title">Earnings Overview</h5>
                <EarningsChart mentorId={mentorId} />
              </div>

              <div className="section-card earnings-summary-row mt-4">
                <div className="earnings-mini-card">
                  <span className="earnings-mini-label">Total Earned</span>
                  <span className="earnings-mini-value">
                    ₹{stats.totalEarnings.toLocaleString("en-IN")}
                  </span>
                </div>
                <div className="earnings-mini-card">
                  <span className="earnings-mini-label">This Month</span>
                  <span className="earnings-mini-value">
                    ₹{stats.monthlyEarnings.toLocaleString("en-IN")}
                  </span>
                </div>
                <div className="earnings-mini-card">
                  <span className="earnings-mini-label">Avg/Session</span>
                  <span className="earnings-mini-value">
                    ₹
                    {stats.totalSessions > 0
                      ? Math.round(
                          stats.totalEarnings / stats.totalSessions,
                        ).toLocaleString("en-IN")
                      : 0}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="section-card">
            <h5 className="section-title mb-4">Assigned Students</h5>
            {students.length === 0 ? (
              <p className="text-muted">No students assigned yet</p>
            ) : (
              <div className="row">
                {students.map((student, index) => (
                  <StudentCard
                    key={index}
                    data={student}
                    onChatClick={() => {
                      setChatStudentId(student.studentId);
                      setIsChatOpen(true);
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        </>
      )}

      <ChatModal
        isOpen={isChatOpen}
        onClose={() => {
          setIsChatOpen(false);
          setChatStudentId(null);
        }}
        userId={mentorId}
        mentorId={mentorId}
        initialStudentId={chatStudentId}
      />
    </div>
  );
}

export default DashboardHome;
