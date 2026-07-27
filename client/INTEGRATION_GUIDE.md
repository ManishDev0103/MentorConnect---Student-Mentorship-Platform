# Frontend-Backend Login Integration Guide

## Overview

This document describes the integration of the frontend login page with the backend security API endpoints.

## Backend Endpoints

### 1. Sign In Endpoint

- **URL**: `POST /users/signin`
- **Authentication**: None (public endpoint)
- **Request Body**:
  ```json
  {
    "email": "user@example.com",
    "password": "password123"
  }
  ```
- **Response**:
  ```json
  {
    "message": "Successful login !",
    "jwt": "eyJhbGciOiJIUzI1NiJ9..."
  }
  ```
- **Error Handling**:
  - 401: Invalid credentials
  - 400: Validation errors

### 2. Sign Up Endpoints

- **Student Registration**: `POST /users/signup/student`
- **Mentor Registration**: `POST /users/signup/mentor`
- Both require validation as per backend DTOs

---

## Frontend Implementation

### API Service (`authService.js`)

The auth service module provides wrapper functions for all authentication API calls:

```javascript
import {
  loginUser,
  registerStudent,
  registerMentor,
  logout,
  decodeToken,
} from "../../API/authService";
```

#### Available Functions:

1. **`loginUser(email, password)`** - Authenticates user
2. **`registerStudent(studentData)`** - Registers a student
3. **`registerMentor(mentorData)`** - Registers a mentor
4. **`logout()`** - Clears auth data
5. **`decodeToken(token)`** - Decodes JWT payload
6. **`getUserRole()`** - Returns user role from token
7. **`isAuthenticated()`** - Checks if user is logged in

### Authentication Context (`AuthContext.jsx`)

Provides centralized auth state management using React Context API.

#### Usage:

```javascript
import { useAuth } from "../../API/AuthContext";

function MyComponent() {
  const { isAuthenticated, user, logout, hasRole } = useAuth();

  if (hasRole("student")) {
    // Show student content
  }
}
```

#### Provided Context Values:

- `user` - Decoded JWT payload with user info
- `token` - JWT token string
- `loading` - Loading state during initialization
- `isAuthenticated` - Boolean flag for auth state
- `setAuthToken(token)` - Manually set token after login
- `logout()` - Clear auth state
- `getUserRole()` - Get user's role
- `hasRole(role)` - Check if user has specific role

### Protected Routes (`ProtectedRoute.jsx`)

Route wrapper components for access control:

```javascript
import { ProtectedRoute, PublicRoute } from "../../API/ProtectedRoute";

// In App.jsx or routing setup:
<Route path="/student-dashboard" element={<ProtectedRoute element={<StudentDashboard />} requiredRole="student" />} />
<Route path="/login" element={<PublicRoute element={<Login />} />} />
```

### Updated Login Component (`Login.jsx`)

Key improvements:

1. **Uses `authService`** instead of direct axios calls
2. **Loading state** with disabled inputs during submission
3. **Better error handling** with specific error messages
4. **Enter key support** for form submission
5. **Input validation** before API call
6. **Automatic role-based routing** using JWT authorities

---

## Security Features

### JWT Token Storage

- JWT tokens are stored in `localStorage`
- Automatically sent with all API requests via axios interceptor
- Cleared on logout

### Token Validation

- Tokens are decoded to extract user authorities
- Role-based redirection after login
- Invalid tokens are automatically cleared

### API Interceptor (`api.js`)

- Automatically attaches JWT token to all requests
- Format: `Authorization: Bearer <token>`

---

## Setup Instructions

### 1. Install Dependencies (if not already installed)

```bash
npm install axios
```

### 2. Wrap App with AuthProvider

In your main App.jsx or index.jsx:

```javascript
import { AuthProvider } from "./API/AuthContext";

function App() {
  return <AuthProvider>{/* Your routes */}</AuthProvider>;
}
```

### 3. Update Routing

Replace direct route imports with ProtectedRoute:

```javascript
import { ProtectedRoute, PublicRoute } from "./API/ProtectedRoute";

<Routes>
  <Route path="/login" element={<PublicRoute element={<Login />} />} />
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

---

## Testing the Integration

### Test Credentials (adjust with your backend data)

- **Email**: test@example.com
- **Password**: password123

### Manual Testing Steps

1. Start backend server on `http://localhost:8080`
2. Start frontend dev server
3. Navigate to login page
4. Enter credentials and submit
5. Verify redirect based on user role
6. Check browser DevTools > Application > Local Storage for JWT token

### Expected Behavior

| User Role | Expected Redirect    |
| --------- | -------------------- |
| STUDENT   | `/student-dashboard` |
| MENTOR    | `/mentor/dashboard`  |
| ADMIN     | `/admin-dashboard`   |

---

## Error Handling

### Common Errors

1. **"Invalid email or password"** - Wrong credentials
2. **"Please enter both email and password"** - Empty fields
3. **"Your account does not have a valid role assigned"** - User has no authorities
4. **Network errors** - Backend not running or connection issues

### Error Debugging

1. Check browser Console for detailed error logs
2. Check Network tab in DevTools for API responses
3. Verify CORS is properly configured in backend
4. Ensure backend is running on correct port

---

## Backend Configuration Requirements

### CORS Setup

Backend should allow requests from frontend origin (typically `http://localhost:5173` or `http://localhost:3000`)

### JWT Configuration

- JWT token generation in `JwtUtils.java`
- Token includes user authorities/roles
- Token should be included in `AuthResponse` DTO

### Security Filter Chain

- `/users/signin` and `/users/signup/**` should be public endpoints
- Other endpoints should require valid JWT token
- Configure in `SecurityConfiguration.java`

---

## Files Created/Modified

### Created Files:

1. **`src/API/authService.js`** - Authentication API service
2. **`src/API/AuthContext.jsx`** - React Context for auth state
3. **`src/API/ProtectedRoute.jsx`** - Route protection components

### Modified Files:

1. **`src/pages/Login/Login.jsx`** - Integrated with auth service

---

## Next Steps

1. ✅ Wrap app with AuthProvider
2. ✅ Update routes with ProtectedRoute
3. ✅ Test login functionality
4. ✅ Implement registration pages with same auth service
5. ✅ Add logout functionality to navbar
6. ✅ Handle token refresh for long-lived sessions
7. ✅ Add error boundary for auth failures

---

## Troubleshooting

### Login Not Working

- Verify backend is running
- Check browser DevTools Network tab
- Ensure correct API endpoint URLs
- Verify CORS configuration

### JWT Token Not Stored

- Check localStorage in DevTools
- Verify `response.jwt` is being returned correctly

### Role-Based Redirect Not Working

- Decode token at https://jwt.io
- Verify authorities are in JWT payload
- Check role names match ROLE\_\* format

### Protected Routes Showing Blank

- Verify AuthProvider is wrapping entire app
- Check if loading state is being displayed
- Verify useAuth hook is being used correctly
