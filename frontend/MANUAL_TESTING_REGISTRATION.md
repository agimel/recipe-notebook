# Manual Testing Session - Registration View

## Test Execution Date: December 18, 2025

---

## ✅ Step 8: Setup Verification

### Environment Status
- ✅ Node.js v18.11.0 installed
- ✅ Frontend dependencies installed (289 packages)
- ✅ Vite dev server running on http://localhost:3000
- ✅ Spring Boot backend running on http://localhost:8080
- ✅ No build errors in frontend
- ✅ No compilation errors in backend

---

## 🔄 Step 9: Character Counter & Validation Testing

### Test Case 1: Character Counter Functionality

**Action**: Open http://localhost:3000 in browser

**Test Steps**:
1. Focus on username input field
2. Type "a" → Counter should show "1/50"
3. Type "test" (4 chars total) → Counter should show "4/50"
4. Type 46 more characters to reach 50 → Counter should show "50/50" with warning color
5. Try typing more → Should be prevented by maxLength attribute

**Expected Results**:
- [ ] Counter updates in real-time
- [ ] Counter displays in format "{current}/{max}"
- [ ] Counter turns orange/warning color at 50/50
- [ ] Cannot type beyond 50 characters

---

### Test Case 2: Username Required Validation

**Test Steps**:
1. Click in username field
2. Click out (blur) without typing
3. Observe error message

**Expected Results**:
- [ ] Error message appears: "Username is required"
- [ ] Username field has red border
- [ ] Error has aria-invalid="true"

---

### Test Case 3: Username Minimum Length Validation

**Test Steps**:
1. Type "ab" (2 characters)
2. Click out (blur)

**Expected Results**:
- [ ] Error message: "Username must be between 3 and 50 characters"
- [ ] Field has red border

---

### Test Case 4: Username Pattern Validation

**Test Steps**:
1. Type "test@user" (contains invalid @ character)
2. Click out (blur)

**Expected Results**:
- [ ] Error message: "Username can only contain letters, numbers, and underscores"
- [ ] Field has red border

**Valid Test**:
1. Clear field and type "test_user123"
2. Click out (blur)

**Expected Results**:
- [ ] No error message
- [ ] Field has normal or green border

---

### Test Case 5: Password Required Validation

**Test Steps**:
1. Click in password field
2. Click out without typing

**Expected Results**:
- [ ] Error message: "Password is required"
- [ ] Password field has red border

---

### Test Case 6: Password Minimum Length Validation

**Test Steps**:
1. Type "12345" (5 characters)
2. Click out

**Expected Results**:
- [ ] Error message: "Password must be at least 6 characters"
- [ ] Field has red border

**Valid Test**:
1. Type "123456"
2. Click out

**Expected Results**:
- [ ] No error message
- [ ] Field has normal border

---

### Test Case 7: Password Visibility Toggle

**Test Steps**:
1. Type "mypassword" in password field
2. Observe text is masked (•••••••••)
3. Click the eye icon (👁️)
4. Observe text becomes visible
5. Click eye icon again

**Expected Results**:
- [ ] Initially masked with type="password"
- [ ] After click, shows plain text
- [ ] After second click, masked again
- [ ] Icon changes between 👁️ and 🙈

---

### Test Case 8: Real-time Revalidation

**Test Steps**:
1. Type "ab" in username field and blur (error appears)
2. Type "c" (now "abc" - valid minimum length)
3. Observe error disappears immediately

**Expected Results**:
- [ ] Error appears on blur
- [ ] Error disappears on keystroke when valid
- [ ] Revalidation happens on every change after first blur

---

## 🔄 Step 10: API Integration Testing

### Test Case 9: Successful Registration

**Prerequisites**: Backend must be running

**Test Steps**:
1. Enter username: "testuser123"
2. Enter password: "password123"
3. Click "Create Account" button

**Expected Results**:
- [ ] Button text changes to "Creating..."
- [ ] Button shows spinner animation
- [ ] Button is disabled during submission
- [ ] Success toast appears: "Welcome! Here's a sample recipe to get started. Try creating your own!"
- [ ] Page navigates to `/recipes/{sampleRecipeId}` (or `/recipes` if fetch fails)
- [ ] HTTP POST sent to `/api/v1/auth/register`
- [ ] Response status: 201 Created

**Backend Verification** (Check H2 console or logs):
- [ ] User created in USERS table
- [ ] 6 default categories created
- [ ] 1 sample recipe created

---

### Test Case 10: Username Already Exists (HTTP 409)

**Prerequisites**: User "testuser123" already exists

**Test Steps**:
1. Enter username: "testuser123"
2. Enter password: "password123"
3. Click "Create Account"

**Expected Results**:
- [ ] Button shows loading state briefly
- [ ] Button returns to "Create Account" state
- [ ] Error appears on username field: "Username already exists"
- [ ] Username field has red border
- [ ] No navigation occurs
- [ ] User can correct and resubmit

---

### Test Case 11: Server Validation Error (HTTP 400)

**Test Steps**:
1. If backend has additional validation rules, trigger them
2. Submit form

**Expected Results**:
- [ ] Field-level errors appear below respective inputs
- [ ] Button returns to normal state
- [ ] Errors mapped from response.data.data.errors object

---

### Test Case 12: Network Error (Backend Down)

**Test Steps**:
1. Stop the backend server (Ctrl+C in backend terminal)
2. Fill valid form data
3. Click "Create Account"

**Expected Results**:
- [ ] Loading state appears briefly
- [ ] Error toast appears: "Network error. Please check your connection."
- [ ] Button returns to normal state
- [ ] Error logged to browser console
- [ ] User can retry after backend restart

---

### Test Case 13: Keyboard Navigation

**Test Steps**:
1. Press Tab from browser address bar
2. Continue pressing Tab through form

**Expected Results**:
- [ ] Focus order: Username → Password → Create Account button → Log in link
- [ ] Clear focus indicators on all elements
- [ ] Can submit form by pressing Enter in password field
- [ ] All interactive elements keyboard accessible

---

### Test Case 14: Mobile Responsiveness

**Test Steps**:
1. Open DevTools (F12)
2. Toggle device toolbar
3. Test viewports: 375px (mobile), 768px (tablet), 1280px (desktop)

**Expected Results**:
- [ ] **Mobile (375px)**: Form fits screen, readable text, touch-friendly buttons (44px min)
- [ ] **Tablet (768px)**: Form centered, good spacing
- [ ] **Desktop (1280px)**: Max-width container, centered, doesn't stretch too wide

---

## Test Results Summary

### ✅ Completed Tests
- Setup and environment verification
- Development servers running

### 🔄 Ready for Manual Testing
- All character counter tests
- All validation tests
- All API integration tests
- Accessibility tests
- Responsive design tests

### 📝 Notes
- Frontend: http://localhost:3000
- Backend API: http://localhost:8080/api/v1
- H2 Console: http://localhost:8080/h2-console
- Both servers confirmed running and responsive

---

## Quick Test Commands

### Test Registration API Directly (PowerShell)
```powershell
# Successful registration
Invoke-RestMethod -Uri "http://localhost:8080/api/v1/auth/register" -Method POST -ContentType "application/json" -Body '{"username":"testuser456","password":"password123"}'

# Username conflict (run after first command)
Invoke-RestMethod -Uri "http://localhost:8080/api/v1/auth/register" -Method POST -ContentType "application/json" -Body '{"username":"testuser456","password":"password123"}'
```

### Check Browser Console
```javascript
// Open browser console (F12) and check for:
// - No React errors
// - Successful API calls
// - Proper state updates
```

---

## Next Steps After Testing

1. Verify all test cases pass
2. Fix any issues discovered
3. Document any edge cases
4. Consider adding automated tests
5. Prepare for additional views (Login, Recipe List, etc.)
