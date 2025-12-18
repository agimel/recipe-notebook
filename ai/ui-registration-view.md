# UI View: Registration

## View Information
**View Name**: Registration  
**View Path**: `/register`  
**Primary Purpose**: Create new user accounts with automatic sample data initialization

---

## Related User Stories (from PRD)

### US-1.1: Account Creation
**Story**: As a new user, I want to create an account so I can securely store my recipes  

**Acceptance Criteria**:
- User can register with username and password (minimum 6 characters)
- Username must be 3-50 characters
- Successful registration automatically creates 6 default categories
- One sample recipe is created for new accounts
- User is redirected to recipe list after registration

---

## Related API Endpoints (from API Plan)

### POST /api/v1/auth/register
**Purpose**: Register a new user account

**Authentication**: None required

**Request Body**:
```json
{
  "username": "string (3-50 chars, required)",
  "password": "string (min 6 chars, required)"
}
```

**Validation Rules**:
- `username`: 3-50 characters, alphanumeric + underscore only, unique
- `password`: Minimum 6 characters

**Success Response** (HTTP 201):
```json
{
  "status": "success",
  "message": "User registered successfully",
  "data": {
    "userId": 123,
    "username": "johndoe"
  }
}
```

**Error Responses**:

*HTTP 400 - Validation Error*:
```json
{
  "status": "error",
  "message": "Validation failed",
  "data": {
    "errors": {
      "username": "Username must be between 3 and 50 characters",
      "password": "Password must be at least 6 characters"
    }
  }
}
```

*HTTP 409 - Conflict*:
```json
{
  "status": "error",
  "message": "Username already exists",
  "data": null
}
```

**Side Effects**:
1. Password hashed with BCrypt before storage
2. 6 default categories created for user
3. 1 sample recipe (Classic Chocolate Chip Cookies) created

---

## View Design Details

### Key Information to Display
- Application branding/logo
- Username input (3-50 characters, alphanumeric + underscore)
- Password input (minimum 6 characters)
- Real-time validation feedback
- Register button
- Link to login page
- Success confirmation before redirect

### Key View Components
- Centered form layout
- Text input fields with character counters
- Real-time validation messages
- Primary action button
- Text link to login
- Toast notification for success/errors

### UX, Accessibility, and Security Considerations
- Real-time validation on blur and onChange after first blur
- Character counter for username (show "3/50" as user types)
- Password strength indicator (optional, nice-to-have)
- Clear validation rules displayed near inputs
- Auto-redirect to sample recipe detail view on success
- Welcome toast: "Welcome! Here's a sample recipe to get started. Try creating your own!"
- ARIA live regions announce validation errors
- Tab order: username → password → submit → login link
- Username uniqueness validated server-side (409 Conflict response)
- BCrypt hashing handled server-side
- 6 default categories auto-created on backend
- Sample "Classic Chocolate Chip Cookies" recipe auto-created
