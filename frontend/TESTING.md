# Registration View Testing Guide

## Manual Testing Checklist

### Step 9: Character Counter & Validation Testing

#### Character Counter Tests
- [ ] **Initial state**: Character counter shows "0/50"
- [ ] **Type characters**: Counter updates in real-time (e.g., "5/50")
- [ ] **At limit**: Counter shows "50/50" with warning color
- [ ] **Cannot exceed**: Input prevents typing more than 50 characters

#### Username Validation Tests
- [ ] **Empty submission**: "Username is required" error appears on blur
- [ ] **Too short (< 3 chars)**: "Username must be between 3 and 50 characters"
- [ ] **Invalid characters**: Type "test@user" → "Username can only contain letters, numbers, and underscores"
- [ ] **Valid username**: Type "test_user123" → No error, green border (optional)
- [ ] **Server error (409)**: Submit existing username → "Username already exists"

#### Password Validation Tests
- [ ] **Empty submission**: "Password is required" error appears on blur
- [ ] **Too short (< 6 chars)**: "Password must be at least 6 characters"
- [ ] **Valid password**: Type "password123" → No error
- [ ] **Visibility toggle**: Click eye icon → password becomes visible/hidden

#### Form Behavior Tests
- [ ] **Validation mode**: Errors appear on blur (first interaction)
- [ ] **Revalidation mode**: After first blur, errors update on every keystroke
- [ ] **Focus management**: First invalid field gets focus on submission error

### Step 10: API Integration Testing

#### Backend Setup
1. Ensure backend is running on http://localhost:8080
2. Verify H2 console is accessible (if enabled)

#### Successful Registration Flow
1. Fill valid username (e.g., "johndoe")
2. Fill valid password (e.g., "password123")
3. Click "Create Account"
4. **Expected**:
   - Button shows "Creating..." with spinner
   - Button is disabled during submission
   - Success toast appears: "Welcome! Here's a sample recipe to get started..."
   - Navigates to `/recipes/{sampleRecipeId}`

#### Error Handling Tests

**Validation Error (HTTP 400)**
1. Submit form with invalid data (if server has additional rules)
2. **Expected**: Field-level errors appear below inputs

**Username Conflict (HTTP 409)**
1. Register user "johndoe"
2. Try to register "johndoe" again
3. **Expected**: "Username already exists" error on username field

**Server Error (HTTP 500)**
1. Stop backend server
2. Submit registration form
3. **Expected**: 
   - Network error toast: "Network error. Please check your connection."
   - Button returns to normal state

**Sample Recipe Fetch Error**
1. Register successfully
2. If recipe fetch fails: Navigate to `/recipes` instead
3. **Expected**: Error logged to console, user redirected to recipe list

### Accessibility Tests
- [ ] **Keyboard navigation**: Tab through form (username → password → button → link)
- [ ] **Screen reader**: ARIA announcements for validation errors
- [ ] **Focus indicators**: Clear visual focus on all interactive elements
- [ ] **Touch targets**: All buttons/inputs are at least 44x44px

### Responsive Tests
- [ ] **Mobile (375px)**: Form is full-width, readable
- [ ] **Tablet (768px)**: Form centered, good spacing
- [ ] **Desktop (1280px)**: Max-width container, centered layout

## Current Test Results

### ✅ Completed
- Frontend build successful
- Development server running on http://localhost:3000
- No build errors or warnings (except deprecation notices)

### 🔄 In Progress
- Backend server starting
- Awaiting API integration tests

### ⏳ Pending
- Full registration flow with backend
- Error handling verification
- Cross-browser testing
