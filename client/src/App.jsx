import { Route, Routes } from "react-router-dom";
import "./App.css";
import Login from "./pages/Login/Login";
import AdminLogin from "./pages/AdminLogin/AdminLogin";
import ResetPasswordPage from "./pages/ResetPassword/ResetPasswordPage";
import Overview from "./pages/AdminDashBoard/Overview/Overview";
import MentorRegister from "./pages/Register/MentorRegister";
import StudentRegister from "./pages/Register/StudentRegister";
import MentorListing from "./pages/MentorListing/MentorListing";
import Home from "./pages/Home/Home";
import Testimonials from "./pages/Testimonials/Testimonials";
import { ToastContainer } from "react-toastify";
import Dashboard from "./pages/MentorDashBoard/Dashboard/Dashboard";
import StudentDashboard from "./pages/StudentDashboard/Main/StudentDashboard";
import { ProtectedRoute, PublicRoute } from "./API/ProtectedRoute";

function App() {
  return (
    <div className="app-shell">
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<PublicRoute element={<Login />} />} />
        <Route path="/admin-login" element={<PublicRoute element={<AdminLogin />} />} />
        <Route path="/reset-password" element={<PublicRoute element={<ResetPasswordPage />} />} />
        <Route path="/mentors" element={<MentorListing />} />
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
      </Routes>
      <ToastContainer />
    </div>
  );
}

export default App;
