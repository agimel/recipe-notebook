# Manual Testing Guide: Login View

## Test Environment Setup
1. Ensure backend is running on `http://localhost:8080`
2. Ensure frontend is running on `http://localhost:5173` (or configured port)
3. Have at least one registered user account for testing

## Test Scenarios

### 1. Page Load and Initial State
**Steps:**
1. Navigate to `http://localhost:5173/login`

**Expected:**
- Login form is displayed with empty username and password fields
- Username field is auto-focused (cursor appears in username field)
- Submit button shows "Log In" text
- "Don't have an account? Sign up" link is visible
- No validation errors are shown

**Status:** ✅ Pass / ❌ Fail

---

### 2. Already Authenticated User
**Steps:**
1. Log in successfully (complete test scenario 5 first)
2. Navigate to `http://localhost:5173/login`

**Expected:**
- Immediately redirected to `/recipes` page
- Login form is not displayed

**Status:** ✅ Pass / ❌ Fail

---

### 3. Client-Side Validation - Empty Fields
**Steps:**
1. Navigate to `/login`
2. Click the "Log In" button without entering any data

**Expected:**
- Username field shows error: "Username is required"
- Password field shows error: "Password is required"
- Both fields have red border
- No API request is made
- Form remains on the page

**Status:** ✅ Pass / ❌ Fail

---

### 4. Client-Side Validation - Individual Field Blur
**Steps:**
1. Navigate to `/login`
2. Click in the username field
3. Click outside the username field (blur) without entering text
4. Click in the password field
5. Click outside the password field (blur) without entering text

**Expected:**
- Error "Username is required" appears below username field after blur
- Error "Password is required" appears below password field after blur
- Errors appear only after blur, not while typing

**Status:** ✅ Pass / ❌ Fail

---

### 5. Successful Login
**Steps:**
1. Navigate to `/login`
2. Enter valid username (e.g., "testuser123")
3. Enter valid password (e.g., "password123")
4. Click "Log In" button

**Expected:**
- Button changes to "Logging in..." with loading spinner
- Form fields become disabled
- Success toast notification: "Login successful!"
- Redirected to `/recipes` page
- sessionStorage contains "auth" key with token, username, and expiresAt
- Check in browser DevTools: Application → Session Storage → auth

**Status:** ✅ Pass / ❌ Fail

---

### 6. Invalid Credentials - Wrong Username
**Steps:**
1. Navigate to `/login`
2. Enter non-existent username (e.g., "wronguser999")
3. Enter any password
4. Click "Log In" button

**Expected:**
- Button shows loading state briefly
- Error toast notification: "Invalid username or password"
- Form fields become enabled again
- User remains on login page
- No data stored in sessionStorage

**Status:** ✅ Pass / ❌ Fail

---

### 7. Invalid Credentials - Wrong Password
**Steps:**
1. Navigate to `/login`
2. Enter valid username
3. Enter wrong password (e.g., "wrongpassword")
4. Click "Log In" button

**Expected:**
- Button shows loading state briefly
- Error toast notification: "Invalid username or password"
- Form fields become enabled again
- User remains on login page
- No data stored in sessionStorage

**Status:** ✅ Pass / ❌ Fail

---

### 8. Password Visibility Toggle
**Steps:**
1. Navigate to `/login`
2. Enter password in password field
3. Observe that characters appear as dots/asterisks
4. Click the eye icon (👁️) button
5. Click the eye icon again

**Expected:**
- Initially: Password characters hidden (type="password")
- After first click: Password visible as plain text (icon changes to 🙈)
- After second click: Password hidden again (icon back to 👁️)
- Cursor position maintained in field

**Status:** ✅ Pass / ❌ Fail

---

### 9. Enter Key Submission
**Steps:**
1. Navigate to `/login`
2. Enter valid username
3. Enter valid password
4. Press Enter key while focused on password field

**Expected:**
- Form submits (same as clicking "Log In" button)
- Login process initiates with loading state
- User is logged in and redirected to `/recipes`

**Status:** ✅ Pass / ❌ Fail

---

### 10. Registration Link Navigation
**Steps:**
1. Navigate to `/login`
2. Click the "Sign up" link

**Expected:**
- Navigated to `/register` page
- Login view is unmounted
- Registration form is displayed

**Status:** ✅ Pass / ❌ Fail

---

### 11. Network Error Handling
**Steps:**
1. Stop the backend server
2. Navigate to `/login`
3. Enter any username and password
4. Click "Log In" button

**Expected:**
- Button shows loading state briefly
- Error toast: "Unable to connect to server. Please check your internet connection."
- Form becomes enabled again
- User remains on login page

**Status:** ✅ Pass / ❌ Fail

**Cleanup:** Restart the backend server

---

### 12. Token Expiration Check
**Steps:**
1. Log in successfully
2. Open browser DevTools → Application → Session Storage
3. Find the "auth" entry
4. Edit the `expiresAt` value to a past date (e.g., "2024-01-01T00:00:00Z")
5. Navigate to `/login`

**Expected:**
- Login form is displayed (not redirected)
- sessionStorage "auth" entry is cleared
- User can log in again

**Status:** ✅ Pass / ❌ Fail

---

### 13. Mobile Responsiveness
**Steps:**
1. Open browser DevTools
2. Toggle device toolbar (Ctrl+Shift+M or Cmd+Shift+M)
3. Select "iPhone 12" or similar mobile device
4. Navigate to `/login`

**Expected:**
- Form is responsive and fits within viewport
- Text is readable (minimum 16px to prevent zoom)
- Touch targets are at least 44x44px
- Layout remains centered and functional

**Status:** ✅ Pass / ❌ Fail

---

### 14. Keyboard Navigation
**Steps:**
1. Navigate to `/login`
2. Press Tab key repeatedly to navigate through form

**Expected Tab Order:**
1. Username field (auto-focused on load)
2. Password field
3. Password visibility toggle button
4. Submit button
5. "Sign up" link

**Expected:**
- Each element shows visible focus indicator
- All interactive elements are reachable via keyboard
- Focus indicators are clearly visible

**Status:** ✅ Pass / ❌ Fail

---

### 15. Session Persistence
**Steps:**
1. Log in successfully
2. Verify redirection to `/recipes`
3. Manually navigate to `/login` in address bar

**Expected:**
- Immediately redirected back to `/recipes`
- Session remains active
- User is not logged out

**Status:** ✅ Pass / ❌ Fail

---

## Summary
- Total Tests: 15
- Passed: ___
- Failed: ___
- Blocked: ___

## Notes
- Use browser DevTools Network tab to verify API requests
- Check Console for any JavaScript errors
- Verify sessionStorage structure matches specification
- Test on multiple browsers (Chrome, Firefox, Safari, Edge)
