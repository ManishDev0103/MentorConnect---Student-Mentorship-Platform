import { Route, Routes } from "react-router-dom";
import "./App.css";
import Login from "./pages/Login/Login";
import AdminLogin from "./pages/AdminLogin/AdminLogin";
import ResetPasswordPage from "./pages/ResetPassword/ResetPasswordPage";
import Overview from "./pages/AdminDashBoard/Overview/Overview";
import MentorRegister from "./pages/Register/MentorRegister";
import StudentRegister from "./pages/Register/StudentRegister";
import MentorListing from "./pages/MentorListing/MentorListing";
import MentorPublicProfile from "./pages/MentorPublicProfile/MentorPublicProfile";
import Home from "./pages/Home/Home";
import Testimonials from "./pages/Testimonials/Testimonials";
import ComplaintPage from "./pages/Complaint/ComplaintPage";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Dashboard from "./pages/MentorDashBoard/Dashboard/Dashboard";
import StudentDashboard from "./pages/StudentDashboard/Main/StudentDashboard";
import { ProtectedRoute, PublicRoute } from "./API/ProtectedRoute";
import Footer from "./Component/Footer/Footer";
import { useDarkMode } from "./context/DarkModeContext";

function App() {
  const { isDarkMode, toggleDarkMode } = useDarkMode();

  return (
    <div className="app-shell">
      <div className="dark-mode-notice" role="status">
        <span>Dark Mode is under development</span>
        <button
          type="button"
          className="dark-mode-toggle"
          onClick={toggleDarkMode}
          aria-pressed={isDarkMode}
          aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
        >
          {isDarkMode ? "Light mode" : "Dark mode"}
        </button>
      </div>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<PublicRoute element={<Login />} />} />
        <Route path="/admin-login" element={<PublicRoute element={<AdminLogin />} />} />
        <Route path="/reset-password" element={<PublicRoute element={<ResetPasswordPage />} />} />
        <Route path="/mentors" element={<MentorListing />} />
        <Route path="/mentor-profile/:mentorId" element={<MentorPublicProfile />} />
        <Route path="/register/mentor" element={<PublicRoute element={<MentorRegister />} />} />
        <Route path="/register/student" element={<PublicRoute element={<StudentRegister />} />} />
        <Route path="/testimonials" element={<Testimonials />} />

        {/* Protected Routes - Student */}
        <Route
          path="/student-dashboard"
          element={<ProtectedRoute element={<StudentDashboard />} requiredRole="student" />}
        />

        {/* Protected Routes - Mentor */}
        <Route
          path="/mentor/*"
          element={<ProtectedRoute element={<Dashboard />} requiredRole="mentor" />}
        />

        {/* Protected Routes - Admin */}
        <Route
          path="/admin-dashboard"
          element={<ProtectedRoute element={<Overview />} requiredRole="admin" />}
        />
        <Route
          path="/complaint"
          element={<ProtectedRoute element={<ComplaintPage />} />}
        />
      </Routes>
      <Footer />
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={true}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </div>
  );
}

export default App;
