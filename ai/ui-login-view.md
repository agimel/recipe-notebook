# UI View: Login

## View Information
**View Name**: Login  
**View Path**: `/login`  
**Primary Purpose**: Authenticate existing users and provide access to their recipe collection

---

## Related User Stories (from PRD)

### US-1.2: User Login
**Story**: As a registered user, I want to log in so I can access my saved recipes  

**Acceptance Criteria**:
- User can log in with username and password
- JWT token is generated and stored in sessionStorage
- Session lasts 24 hours
- User is redirected to recipe list upon successful login

---

## Related API Endpoints (from API Plan)

### POST /api/v1/auth/login
**Purpose**: Authenticate user and receive JWT token

**Authentication**: None required

**Request Body**:
```json
{
  "username": "string (required)",
  "password": "string (required)"
}
```

**Success Response** (HTTP 200):
```json
{
  "status": "success",
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "username": "johndoe",
    "expiresAt": "2025-12-18T15:30:00Z"
  }
}
```

**Error Responses**:

*HTTP 401 - Unauthorized*:
```json
{
  "status": "error",
  "message": "Invalid username or password",
  "data": null
}
```

*HTTP 400 - Validation Error*:
```json
{
  "status": "error",
  "message": "Validation failed",
  "data": {
    "errors": {
      "username": "Username is required",
      "password": "Password is required"
    }
  }
}
```

---

## View Design Details

### Key Information to Display
- Application branding/logo
- Username input field
- Password input field
- Login button
- Link to registration page
- Error messages for invalid credentials

### Key View Components
- Centered form layout
- Text input fields with validation
- Primary action button
- Text link to registration
- Toast notification for errors

### UX, Accessibility, and Security Considerations
- Auto-focus on username field on page load
- Enter key submits form
- Clear, specific error messages ("Invalid username or password")
- Password field type="password" with visibility toggle
- Disabled submit button while request is pending (loading state)
- ARIA labels for screen readers
- Tab order: username → password → submit → register link
- XSS protection via React's automatic escaping
- JWT stored in sessionStorage (cleared on logout)
- No password recovery in MVP (out of scope)
