# App.jsx Integration Template

Copy and use this template to integrate authentication into your App.jsx file.

---

## ✅ Complete App.jsx Example

```jsx
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./API/AuthContext";
import { ProtectedRoute, PublicRoute } from "./API/ProtectedRoute";

// Import your page components
import Login from "./pages/Login/Login";
import Home from "./pages/Home/Home";
import StudentDashboard from "./pages/StudentDashboard/Main/Main"; // Adjust path
import MentorDashboard from "./pages/MentorDashBoard/Dashboard/Dashboard"; // Adjust path
import AdminDashboard from "./pages/AdminDashBoard/Overview/Overview"; // Adjust path
import MentorListing from "./pages/MentorListing/MentorListing";
import Register from "./pages/Register/Registration"; // or separate Student/Mentor registers

// Other components
import Navbar from "./Component/Navbar/Navbar";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Navbar />
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<PublicRoute element={<Login />} />} />
          <Route path="/mentor-listing" element={<MentorListing />} />
          <Route
            path="/register/student"
            element={<PublicRoute element={<Register />} />}
          />
          <Route
            path="/register/mentor"
            element={<PublicRoute element={<Register />} />}
          />

          {/* Protected Routes - Student */}
          <Route
            path="/student-dashboard"
            element={
              <ProtectedRoute
                element={<StudentDashboard />}
                requiredRole="student"
              />
            }
          />

          {/* Protected Routes - Mentor */}
          <Route
            path="/mentor/dashboard"
            element={
              <ProtectedRoute
                element={<MentorDashboard />}
                requiredRole="mentor"
              />
            }
          />

          {/* Protected Routes - Admin */}
          <Route
            path="/admin-dashboard"
            element={
              <ProtectedRoute
                element={<AdminDashboard />}
                requiredRole="admin"
              />
            }
          />

          {/* Catch-all - Not Found */}
          <Route path="*" element={<Home />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
```

---

## 🔧 Navbar Integration (with Logout)

```jsx
import React from "react";
import { useAuth } from "../API/AuthContext";
import { useNavigate } from "react-router-dom";
import "./Navbar.css";

const Navbar = () => {
  const { isAuthenticated, user, logout, hasRole } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleLogoClick = () => {
    if (isAuthenticated) {
      if (hasRole("student")) {
        navigate("/student-dashboard");
      } else if (hasRole("mentor")) {
        navigate("/mentor/dashboard");
      } else if (hasRole("admin")) {
        navigate("/admin-dashboard");
      }
    } else {
      navigate("/");
    }
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand" onClick={handleLogoClick}>
        🎓 Mentorship Personalized
      </div>

      <div className="navbar-links">
        {!isAuthenticated ? (
          <>
            <a href="/mentor-listing">Browse Mentors</a>
            <a href="/login" className="btn-login">
              Login
            </a>
            <a href="/register/student" className="btn-register">
              Register
            </a>
          </>
        ) : (
          <>
            <span className="user-email">{user?.email}</span>
            {hasRole("student") && <a href="/student-dashboard">Dashboard</a>}
            {hasRole("mentor") && <a href="/mentor/dashboard">Dashboard</a>}
            {hasRole("admin") && <a href="/admin-dashboard">Dashboard</a>}
            <button onClick={handleLogout} className="btn-logout">
              Logout
            </button>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
```

---

## 💻 Using Auth in Any Component

```jsx
// Example: StudentProfile.jsx
import { useAuth } from "../API/AuthContext";

function StudentProfile() {
  const { user, isAuthenticated, hasRole, logout } = useAuth();

  if (!isAuthenticated) {
    return <p>Please log in to view your profile</p>;
  }

  return (
    <div>
      <h1>Welcome, {user?.email}</h1>

      {hasRole("student") && (
        <>
          <p>You are logged in as a Student</p>
          {/* Student-specific content */}
        </>
      )}

      {hasRole("mentor") && (
        <>
          <p>You are logged in as a Mentor</p>
          {/* Mentor-specific content */}
        </>
      )}

      {hasRole("admin") && (
        <>
          <p>You are logged in as an Admin</p>
          {/* Admin-specific content */}
        </>
      )}

      <button onClick={logout}>Logout</button>
    </div>
  );
}

export default StudentProfile;
```

---

## 🔒 Conditional Rendering Based on Auth

```jsx
// Example: Header.jsx
import { useAuth } from "../API/AuthContext";

function Header() {
  const { isAuthenticated, user, hasRole, logout } = useAuth();

  return (
    <header>
      <h1>Mentorship Platform</h1>

      {isAuthenticated ? (
        <div className="auth-section">
          <p>Hello, {user?.email}!</p>

          {hasRole("mentor") && (
            <button className="btn-primary">View My Students</button>
          )}

          {hasRole("student") && (
            <button className="btn-primary">Find a Mentor</button>
          )}

          {hasRole("admin") && (
            <button className="btn-primary">Admin Panel</button>
          )}

          <button onClick={logout} className="btn-danger">
            Logout
          </button>
        </div>
      ) : (
        <div className="no-auth-section">
          <a href="/login">Login</a>
          <a href="/register/student">Register as Student</a>
          <a href="/register/mentor">Register as Mentor</a>
        </div>
      )}
    </header>
  );
}

export default Header;
```

---

## 🎯 Role-Based Component Rendering

```jsx
// Example: Dashboard.jsx
import { useAuth } from "../API/AuthContext";
import StudentDash from "./StudentDash";
import MentorDash from "./MentorDash";
import AdminDash from "./AdminDash";

function Dashboard() {
  const { hasRole } = useAuth();

  if (hasRole("student")) {
    return <StudentDash />;
  }

  if (hasRole("mentor")) {
    return <MentorDash />;
  }

  if (hasRole("admin")) {
    return <AdminDash />;
  }

  return <p>Loading...</p>;
}

export default Dashboard;
```

---

## 📝 Protected API Call Example

```jsx
// Example: FetchStudentData.jsx
import { useEffect, useState } from "react";
import { useAuth } from "../API/AuthContext";
import api from "../API/api"; // Your axios instance with interceptor

function FetchStudentData() {
  const { isAuthenticated } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        // Token is automatically added by api.js interceptor
        const response = await api.get("/students");
        setData(response.data);
      } catch (error) {
        console.error("Failed to fetch:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isAuthenticated]);

  if (!isAuthenticated) return <p>Not authenticated</p>;
  if (loading) return <p>Loading...</p>;
  if (!data) return <p>No data</p>;

  return <pre>{JSON.stringify(data, null, 2)}</pre>;
}

export default FetchStudentData;
```

---

## ⚙️ Configuration Steps

### 1. Update imports in App.jsx

```jsx
import { AuthProvider } from "./API/AuthContext";
import { ProtectedRoute, PublicRoute } from "./API/ProtectedRoute";
```

### 2. Wrap Router with AuthProvider

```jsx
<AuthProvider>
  <Router>{/* routes */}</Router>
</AuthProvider>
```

### 3. Update route imports

- Check your actual file paths in your project
- Adjust import paths accordingly

### 4. Test the integration

- Start backend: `java -jar MentorshipBackend.jar`
- Start frontend: `npm run dev`
- Navigate to `/login`
- Test login flow

---

## ✅ Quick Verification

After setup, verify:

```javascript
// Open browser console and run:
console.log(localStorage.getItem("token")); // Should show JWT
console.log(JSON.parse(atob(localStorage.getItem("token").split(".")[1]))); // Should show payload
```

---

## 🆘 Common Issues & Fixes

### Issue: "useAuth must be used within AuthProvider"

**Fix:** Ensure AuthProvider wraps your entire app

```jsx
<AuthProvider>
  <Router>...</Router>
</AuthProvider>
```

### Issue: Routes not protecting

**Fix:** Check ProtectedRoute is being used correctly

```jsx
element={<ProtectedRoute element={<Component />} requiredRole="student" />}
```

### Issue: Login not redirecting

**Fix:** Verify JWT payload contains authorities

```javascript
const payload = JSON.parse(atob(token.split(".")[1]));
console.log(payload.authorities); // Should be ["ROLE_STUDENT"] etc.
```

### Issue: Token not persisting

**Fix:** Check localStorage isn't being cleared

```javascript
// In AuthContext.jsx useEffect, verify:
const token = localStorage.getItem("token");
```

---

## 📚 Need Help?

- **Quick Start**: See `QUICK_START.md`
- **Detailed Guide**: See `INTEGRATION_GUIDE.md`
- **Architecture**: See `ARCHITECTURE.md`
- **Checklist**: See `INTEGRATION_CHECKLIST.md`

---

**Copy the relevant code above into your project and you're done! 🚀**
