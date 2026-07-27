# Login Integration Architecture

## 📐 System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     FRONTEND (React)                        │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  App.jsx (with AuthProvider)                        │  │
│  │  - Wraps entire app with auth context               │  │
│  └─────────────┬────────────────────────────────────────┘  │
│                │                                             │
│  ┌─────────────▼────────────────────────────────────────┐  │
│  │  Routes with ProtectedRoute                         │  │
│  │  - /login (PublicRoute)                             │  │
│  │  - /student-dashboard (Protected)                   │  │
│  │  - /mentor/dashboard (Protected)                    │  │
│  │  - /admin-dashboard (Protected)                     │  │
│  └──────────────────────────────────────────────────────┘  │
│                │                                             │
│  ┌─────────────▼────────────────────────────────────────┐  │
│  │  Login Component (src/pages/Login/Login.jsx)        │  │
│  │  - Email input                                       │  │
│  │  - Password input                                    │  │
│  │  - Submit button                                     │  │
│  │  - Error display                                     │  │
│  └──────────────┬───────────────────────────────────────┘  │
│                 │                                            │
│  ┌──────────────▼───────────────────────────────────────┐  │
│  │  authService.loginUser(email, password)             │  │
│  │  - src/API/authService.js                           │  │
│  │  - Validates inputs                                 │  │
│  │  - Calls API                                         │  │
│  │  - Handles errors                                   │  │
│  │  - Returns JWT token                                │  │
│  └──────────────┬───────────────────────────────────────┘  │
│                 │                                            │
│  ┌──────────────▼───────────────────────────────────────┐  │
│  │  Axios API Client (src/API/api.js)                  │  │
│  │  - baseURL: http://localhost:8080                   │  │
│  │  - Request Interceptor:                             │  │
│  │    • Adds Authorization header                      │  │
│  │    • Format: Bearer <JWT>                           │  │
│  └──────────────┬───────────────────────────────────────┘  │
│                 │                                            │
└─────────────────┼────────────────────────────────────────────┘
                  │ HTTP POST /users/signin
                  │ { email, password }
                  ▼
┌─────────────────────────────────────────────────────────────┐
│                   BACKEND (Spring Boot)                     │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  AuthController                                      │  │
│  │  - @PostMapping(/users/signin)                      │  │
│  └─────────────┬────────────────────────────────────────┘  │
│                │                                             │
│  ┌─────────────▼────────────────────────────────────────┐  │
│  │  AuthenticationManager                              │  │
│  │  - Validates credentials                            │  │
│  │  - Authenticates user                               │  │
│  └─────────────┬────────────────────────────────────────┘  │
│                │                                             │
│  ┌─────────────▼────────────────────────────────────────┐  │
│  │  JwtUtils                                            │  │
│  │  - Generates JWT token                              │  │
│  │  - Includes user authorities/roles                  │  │
│  └─────────────┬────────────────────────────────────────┘  │
│                │                                             │
│  ┌─────────────▼────────────────────────────────────────┐  │
│  │  AuthResponse                                        │  │
│  │  - message: "Successful login !"                    │  │
│  │  - jwt: "eyJhbGc..."                                │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
└──────────────────────────────────────────────────────────────┘
                  ▲
                  │ HTTP 201 Created
                  │ { message, jwt }
                  │
┌─────────────────┴──────────────────────────────────────────┐
│                   FRONTEND (React) - Response              │
├───────────────────────────────────────────────────────────┤
│                                                           │
│  ┌─────────────────────────────────────────────────────┐ │
│  │  Store JWT in localStorage                        │ │
│  │  - localStorage.setItem('token', response.jwt)   │ │
│  └────────────────┬──────────────────────────────────┘ │
│                   │                                      │
│  ┌────────────────▼──────────────────────────────────┐ │
│  │  Decode JWT                                       │ │
│  │  - Extract authorities from payload               │ │
│  │  - e.g., ["ROLE_STUDENT"]                        │ │
│  └────────────────┬──────────────────────────────────┘ │
│                   │                                      │
│  ┌────────────────▼──────────────────────────────────┐ │
│  │  Role-Based Redirect                             │ │
│  │  - ROLE_STUDENT → /student-dashboard             │ │
│  │  - ROLE_MENTOR → /mentor/dashboard               │ │
│  │  - ROLE_ADMIN → /admin-dashboard                 │ │
│  └────────────────┬──────────────────────────────────┘ │
│                   │                                      │
│  ┌────────────────▼──────────────────────────────────┐ │
│  │  AuthContext Updated                             │ │
│  │  - user = decoded JWT payload                     │ │
│  │  - token = JWT string                             │ │
│  │  - isAuthenticated = true                         │ │
│  └────────────────┬──────────────────────────────────┘ │
│                   │                                      │
│  ┌────────────────▼──────────────────────────────────┐ │
│  │  Navigate to Dashboard                           │ │
│  │  - ProtectedRoute verifies auth                  │ │
│  │  - Displays appropriate dashboard                │ │
│  └────────────────────────────────────────────────────┘ │
│                                                           │
└───────────────────────────────────────────────────────────┘
```

---

## 🔄 Data Flow Sequence

### Login Flow (Successful)

```
1. User enters email & password
                ↓
2. Frontend validates inputs
                ↓
3. Call authService.loginUser(email, password)
                ↓
4. Axios makes POST to /users/signin with interceptor
                ↓
5. Backend validates credentials
                ↓
6. Backend generates JWT with user authorities
                ↓
7. Backend returns { message, jwt }
                ↓
8. Frontend receives response
                ↓
9. Store JWT in localStorage
                ↓
10. Decode JWT to extract authorities
                ↓
11. Update AuthContext with user data
                ↓
12. Redirect based on role (STUDENT/MENTOR/ADMIN)
                ↓
13. Dashboard renders with ProtectedRoute verification
```

### Login Flow (Error)

```
1. User enters email & password
                ↓
2. Frontend validates inputs
                ↓
3. Call authService.loginUser()
                ↓
4. Backend receives request
                ↓
5. Credentials invalid OR validation error
                ↓
6. Backend returns error response
                ↓
7. Frontend catches error
                ↓
8. Display error message to user
                ↓
9. Token not stored
                ↓
10. User stays on login page
```

---

## 🗂️ File Structure

```
client/
├── src/
│   ├── API/
│   │   ├── api.js (existing - with interceptor)
│   │   ├── authService.js (NEW)
│   │   ├── AuthContext.jsx (NEW)
│   │   └── ProtectedRoute.jsx (NEW)
│   │
│   ├── pages/
│   │   ├── Login/
│   │   │   ├── Login.jsx (UPDATED)
│   │   │   └── Login.css
│   │   ├── StudentDashboard/
│   │   ├── MentorDashBoard/
│   │   └── AdminDashBoard/
│   │
│   ├── App.jsx (TO UPDATE)
│   └── main.jsx
│
├── QUICK_START.md (NEW - This file)
├── INTEGRATION_GUIDE.md (NEW - Detailed guide)
└── LOGIN_INTEGRATION_SUMMARY.md (NEW - Summary)
```

---

## 📊 State Management

### AuthContext State

```javascript
{
  user: {
    email: "student@example.com",
    authorities: ["ROLE_STUDENT"],
    iat: 1234567890,
    exp: 1234654290,
    // ... other JWT claims
  },
  token: "eyJhbGciOiJIUzI1NiJ9...",
  loading: false,
  isAuthenticated: true
}
```

### Component Usage

```javascript
const { user, token, loading, isAuthenticated } = useAuth();
```

---

## 🔐 Security Flow

```
LocalStorage: { token: "JWT..." }
       │
       ├─→ Axios Interceptor
       │   ├─→ Gets token from localStorage
       │   └─→ Adds to every API request
       │       (Authorization: Bearer JWT)
       │
       ├─→ Every API Call
       │   ├─→ Includes JWT in headers
       │   ├─→ Backend validates JWT
       │   ├─→ Grants/denies access
       │   └─→ If invalid, user logs out
       │
       └─→ Protected Routes
           ├─→ Checks isAuthenticated
           ├─→ Checks required role
           └─→ Redirects if unauthorized
```

---

## 🎯 Component Relationships

```
App.jsx
├── AuthProvider (wraps entire app)
│   └── Router
│       ├── PublicRoute
│       │   └── Login
│       │       └── Uses: authService.loginUser()
│       │
│       ├── ProtectedRoute
│       │   └── StudentDashboard
│       │       └── Uses: useAuth() hook
│       │
│       ├── ProtectedRoute
│       │   └── MentorDashboard
│       │       └── Uses: useAuth() hook
│       │
│       └── ProtectedRoute
│           └── AdminDashboard
│               └── Uses: useAuth() hook
│
└── Any Component Can Access
    └── useAuth() Hook
        ├── Check isAuthenticated
        ├── Get user info
        ├── Check hasRole()
        └── Call logout()
```

---

## 🚀 Request/Response Examples

### Request: Login

```http
POST /users/signin HTTP/1.1
Host: localhost:8080
Content-Type: application/json

{
  "email": "student@example.com",
  "password": "password123"
}
```

### Response: Login Success (201 Created)

```json
{
  "message": "Successful login !",
  "jwt": "eyJhbGciOiJIUzI1NiJ9.eyJlbWFpbCI6InN0dWRlbnRAZXhhbXBsZS5jb20iLCJhdXRob3JpdGllcyI6WyJST0xFX1NUREVOVESKU..."
}
```

### Response: Login Failure (401 Unauthorized)

```json
{
  "error": "Unauthorized",
  "message": "Invalid email or password"
}
```

### Request: Protected Resource (with JWT)

```http
GET /students HTTP/1.1
Host: localhost:8080
Authorization: Bearer eyJhbGciOiJIUzI1NiJ9...
```

---

## 🔄 Logout Flow

```
User clicks Logout
       │
       ├─→ logout() from useAuth()
       │   ├─→ localStorage.removeItem('token')
       │   ├─→ Clear AuthContext state
       │   └─→ Set isAuthenticated = false
       │
       └─→ ProtectedRoute checks auth
           └─→ Redirects to /login (no token)
```

---

## ✅ Integration Checklist

- [x] Create authService.js
- [x] Create AuthContext.jsx with useAuth hook
- [x] Create ProtectedRoute.jsx
- [x] Update Login.jsx with service integration
- [ ] Update App.jsx with AuthProvider
- [ ] Update routing with ProtectedRoute
- [ ] Add logout to Navbar
- [ ] Test complete flow
- [ ] Handle token refresh (optional)
- [ ] Add error boundary (optional)

---

**This architecture provides:**

- ✅ Centralized auth state
- ✅ Secure token management
- ✅ Role-based access control
- ✅ Protected routes
- ✅ Global auth context
- ✅ Automatic request interception
- ✅ Proper error handling
