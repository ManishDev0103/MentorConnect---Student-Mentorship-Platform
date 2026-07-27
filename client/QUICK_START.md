# Quick Start Guide - Login Integration

## 🎯 What Was Done

Your frontend login page is now fully integrated with the backend security API. Here's the quick-start:

---

## ⚡ Quick Setup (2 Steps)

### Step 1: Update Your App.jsx

Wrap your app with AuthProvider:

```jsx
import { AuthProvider } from "./API/AuthContext";

function App() {
  return <AuthProvider>{/* Your existing routes */}</AuthProvider>;
}
```

### Step 2: Update Your Routes

Use ProtectedRoute for protected pages:

```jsx
import { ProtectedRoute, PublicRoute } from "./API/ProtectedRoute";
import Login from "./pages/Login/Login";
import StudentDashboard from "./pages/StudentDashboard/Dashboard";
import MentorDashboard from "./pages/MentorDashBoard/Dashboard/Dashboard";
import AdminDashboard from "./pages/AdminDashBoard/Overview/Overview";

<Routes>
  {/* Public Routes */}
  <Route path="/login" element={<PublicRoute element={<Login />} />} />

  {/* Protected Routes */}
  <Route
    path="/student-dashboard"
    element={
      <ProtectedRoute element={<StudentDashboard />} requiredRole="student" />
    }
  />
  <Route
    path="/mentor/dashboard"
    element={
      <ProtectedRoute element={<MentorDashboard />} requiredRole="mentor" />
    }
  />
  <Route
    path="/admin-dashboard"
    element={
      <ProtectedRoute element={<AdminDashboard />} requiredRole="admin" />
    }
  />
</Routes>;
```

That's it! Your login integration is complete.

---

## 📦 New Files Available

| File                         | Purpose            |
| ---------------------------- | ------------------ |
| `src/API/authService.js`     | API calls for auth |
| `src/API/AuthContext.jsx`    | Global auth state  |
| `src/API/ProtectedRoute.jsx` | Route protection   |
| `src/pages/Login/Login.jsx`  | Updated login form |

---

## 💻 Using Auth in Components

### Check if User is Logged In

```javascript
import { useAuth } from "./API/AuthContext";

function Header() {
  const { isAuthenticated, logout } = useAuth();

  if (isAuthenticated) {
    return <button onClick={logout}>Logout</button>;
  }
  return <a href="/login">Login</a>;
}
```

### Check User Role

```javascript
const { hasRole } = useAuth();

if (hasRole("mentor")) {
  return <MentorPanel />;
}
```

### Get User Info

```javascript
const { user } = useAuth();

// user.email, user.authorities, user.iat, user.exp, etc.
console.log("Logged in as:", user.email);
```

---

## 🧪 Test It

### Credentials (for testing)

Use any valid credentials from your backend. The JWT token will automatically:

- ✅ Be stored in localStorage
- ✅ Be sent with every API request
- ✅ Redirect you to the correct dashboard
- ✅ Protect routes from unauthorized access

### Test Steps

1. Visit `/login`
2. Enter email & password
3. Should redirect to your dashboard based on role
4. Check browser DevTools → Application → Local Storage → `token`

---

## 🔒 Security Highlights

✅ JWT tokens stored securely
✅ Auto-attached to all API requests
✅ Role-based access control
✅ Automatic logout on invalid token
✅ Protected routes system
✅ Proper error handling

---

## 🐛 Troubleshooting

| Problem                    | Solution                                        |
| -------------------------- | ----------------------------------------------- |
| Login button not working   | Check if backend is running on `localhost:8080` |
| Always redirected to login | AuthProvider might not be wrapping app          |
| Token not stored           | Check browser console for errors                |
| Wrong dashboard shown      | Verify user roles in backend                    |

---

## 📚 Full Documentation

See `INTEGRATION_GUIDE.md` for complete documentation.

---

## ✨ Next: Add Logout

Add this to your Navbar:

```javascript
import { useAuth } from "../API/AuthContext";

function Navbar() {
  const { logout } = useAuth();

  return <button onClick={logout}>Logout</button>;
}
```

---

**Ready to go! 🚀 Test your login now.**
