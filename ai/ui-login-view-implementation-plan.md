# View Implementation Plan: Login

## 1. Overview

The Login View is a public-facing authentication page that allows registered users to access their recipe collection. It provides a simple form with username and password fields, handles authentication via the `/api/v1/auth/login` endpoint, stores the JWT token in sessionStorage upon successful login, and redirects users to the recipe list view. The view includes real-time validation, loading states, and clear error messaging to guide users through the authentication process.

## 2. View Routing

**Route Path**: `/login`  
**Authentication**: Public (no authentication required)  
**Redirect Logic**:
- **On successful login**: Redirect to `/recipes` (recipe list view)
- **If already authenticated**: Redirect to `/recipes` (prevent authenticated users from accessing login page)

## 3. Component Structure

```
LoginView (page component)
├── LoginForm
│   ├── TextField (username)
│   ├── PasswordField (password with visibility toggle)
│   ├── SubmitButton
│   └── RegistrationLink
└── ToastNotification (error messages)
```

**Component Hierarchy**:
- **LoginView**: Top-level page component that manages authentication state and API integration
- **LoginForm**: Presentational component containing form fields, validation, and submission logic
- **TextField**: Reusable text input component from Material-UI or Ant Design
- **PasswordField**: Password input with show/hide toggle button
- **SubmitButton**: Primary action button with loading state
- **RegistrationLink**: Navigation link to registration page

## 4. Component Details

### 4.1 LoginView (Page Component)

**Purpose**: Top-level container that manages authentication state, API calls, token storage, and navigation logic.

**Main Elements**:
- Container `<div>` with centered layout
- Application logo or branding
- `<LoginForm>` child component
- Toast notification container

**Handled Events**:
- **onLoginSubmit**: Triggered when user submits the login form
  - Calls `/api/v1/auth/login` endpoint
  - On success: stores JWT in sessionStorage, redirects to `/recipes`
  - On error: displays error toast notification

**Validation Conditions**:
- None at this level (validation handled in LoginForm component)

**Required Types**:
- `LoginRequestDTO`: Request payload for API call
- `LoginResponseDTO`: Response data from API
- `ApiResponse<LoginResponseDTO>`: Wrapped API response

**Props**: None (top-level route component)

**State Variables**:
- `isLoading: boolean` - Tracks API request status
- `error: string | null` - Stores error message for toast display

**Responsibilities**:
- Check if user is already authenticated (redirect if true)
- Handle form submission callback
- Make API call to authentication endpoint
- Store JWT token and user data in sessionStorage
- Navigate to recipe list on success
- Display error notifications on failure

---

### 4.2 LoginForm (Form Component)

**Purpose**: Manages form state, validation, and user input collection for the login credentials.

**Main Elements**:
- `<form>` element with `onSubmit` handler
- Username `<TextField>` component
- Password `<PasswordField>` component
- Submit `<Button>` component (primary style, full width)
- "Don't have an account?" text with `<Link to="/register">` component

**Handled Events**:
- **onSubmit**: Prevents default form submission, validates fields, calls parent `onLoginSubmit` callback
- **onChange (username)**: Updates username field value, triggers validation
- **onChange (password)**: Updates password field value, triggers validation
- **onKeyDown (Enter key)**: Triggers form submission

**Validation Conditions** (client-side, real-time):
1. **Username**:
   - Required: "Username is required"
   - Triggered: onBlur or onSubmit
2. **Password**:
   - Required: "Password is required"
   - Triggered: onBlur or onSubmit

**Required Types**:
- `LoginFormData`: Internal form state type (matches `LoginRequestDTO`)

**Props (Component Interface)**:
```typescript
interface LoginFormProps {
  onSubmit: (credentials: LoginRequestDTO) => Promise<void>;
  isLoading: boolean;
}
```

**State Variables** (using React Hook Form):
- `formState.errors` - Field-level validation errors
- `formState.isValid` - Overall form validity
- `formState.isSubmitting` - Tracks submission status (used in conjunction with parent `isLoading`)

**Responsibilities**:
- Collect username and password input
- Validate input fields on blur and submit
- Disable submit button when form is invalid or loading
- Call parent submit handler with form data
- Auto-focus username field on mount
- Display field-level error messages

---

### 4.3 TextField (Username Input)

**Purpose**: Text input field for username with validation error display.

**Main Elements**:
- `<input type="text">` or Material-UI/Ant Design TextField
- Label: "Username"
- Placeholder: "Enter your username"
- Error message display below input

**Handled Events**:
- **onChange**: Updates username value
- **onBlur**: Triggers validation

**Validation Conditions**:
- Required field validation (see LoginForm section)

**Required Types**:
- `string` (controlled component value)

**Props (Component Interface)**:
```typescript
interface TextFieldProps {
  value: string;
  onChange: (value: string) => void;
  onBlur: () => void;
  error?: string;
  label: string;
  placeholder?: string;
  autoFocus?: boolean;
  disabled?: boolean;
}
```

---

### 4.4 PasswordField (Password Input with Toggle)

**Purpose**: Password input field with show/hide toggle button and validation error display.

**Main Elements**:
- `<input type="password" | "text">` (toggles based on visibility state)
- Label: "Password"
- Placeholder: "Enter your password"
- Eye icon button (toggles password visibility)
- Error message display below input

**Handled Events**:
- **onChange**: Updates password value
- **onBlur**: Triggers validation
- **onToggleVisibility**: Toggles password visibility (type="text" vs type="password")

**Validation Conditions**:
- Required field validation (see LoginForm section)

**Required Types**:
- `string` (controlled component value)

**Props (Component Interface)**:
```typescript
interface PasswordFieldProps {
  value: string;
  onChange: (value: string) => void;
  onBlur: () => void;
  error?: string;
  label: string;
  placeholder?: string;
  disabled?: boolean;
}
```

**Internal State**:
- `showPassword: boolean` - Controls password visibility toggle

---

### 4.5 SubmitButton

**Purpose**: Primary action button that triggers form submission with loading state.

**Main Elements**:
- `<button type="submit">` or Material-UI/Ant Design Button
- Button text: "Log In"
- Loading spinner (replaces text when `isLoading` is true)
- Full-width style

**Handled Events**:
- **onClick**: Triggers form submission (handled by form's onSubmit)

**Validation Conditions**:
- Disabled when form is invalid or API request is in progress

**Required Types**:
- None (standard button props)

**Props (Component Interface)**:
```typescript
interface SubmitButtonProps {
  isLoading: boolean;
  disabled: boolean;
  onClick?: () => void;
}
```

---

### 4.6 RegistrationLink

**Purpose**: Navigation link to redirect new users to the registration page.

**Main Elements**:
- Text: "Don't have an account? "
- `<Link to="/register">Sign up</Link>` (styled as link)

**Handled Events**:
- **onClick**: Navigates to `/register` route (handled by React Router)

**Validation Conditions**: None

**Required Types**: None

**Props**: None

---

## 5. Types

### 5.1 DTOs (API Contract Types)

**LoginRequestDTO**:
```typescript
interface LoginRequestDTO {
  username: string;  // Required, will be validated on backend
  password: string;  // Required, will be validated on backend
}
```

**LoginResponseDTO**:
```typescript
interface LoginResponseDTO {
  token: string;          // JWT token for authentication
  username: string;       // Authenticated username
  expiresAt: string;      // ISO-8601 timestamp (e.g., "2025-12-18T15:30:00Z")
}
```

**ApiResponse<T>** (Generic wrapper):
```typescript
interface ApiResponse<T> {
  status: 'success' | 'error';
  message: string;
  data: T | null;
}
```

**ValidationErrorDetails** (for 400 responses):
```typescript
interface ValidationErrorDetails {
  errors: Record<string, string>;  // Field name → error message mapping
}
```

---

### 5.2 ViewModels and Internal Types

**LoginFormData** (Internal form state):
```typescript
interface LoginFormData {
  username: string;
  password: string;
}
```
- **Purpose**: Manages form state before submission
- **Fields**: Identical to `LoginRequestDTO` but used for local state management
- **Usage**: React Hook Form register and validation

**AuthState** (SessionStorage structure):
```typescript
interface AuthState {
  token: string;
  username: string;
  expiresAt: string;
}
```
- **Purpose**: Stores authentication data in sessionStorage after successful login
- **Fields**: Matches `LoginResponseDTO` structure
- **Storage Key**: `'auth'` or `'authToken'`
- **Usage**: Retrieved by protected routes to verify authentication

**LoginViewState** (Component state):
```typescript
interface LoginViewState {
  isLoading: boolean;
  error: string | null;
}
```
- **Purpose**: Manages view-level state for loading and error handling
- **Fields**:
  - `isLoading`: Indicates active API request (disables form during submission)
  - `error`: Error message to display in toast notification
- **Usage**: Controls UI feedback during authentication flow

---

## 6. State Management

### 6.1 Component State (React useState)

**Local State in LoginView**:
- `isLoading: boolean` - Tracks API request status
- `error: string | null` - Stores error message for toast display

**Local State in LoginForm**:
- Managed by React Hook Form (`useForm` hook)
- `formState.errors` - Validation errors per field
- `formState.isValid` - Overall form validity

**Local State in PasswordField**:
- `showPassword: boolean` - Controls password visibility toggle

### 6.2 Custom Hooks

**useAuth** (Authentication management hook):
```typescript
interface UseAuthReturn {
  isAuthenticated: boolean;
  login: (token: string, username: string, expiresAt: string) => void;
  logout: () => void;
  getToken: () => string | null;
  getUsername: () => string | null;
}

function useAuth(): UseAuthReturn
```

**Purpose**: Centralize authentication state management and sessionStorage operations.

**Responsibilities**:
- Check if user is authenticated (token exists and not expired)
- Store authentication data in sessionStorage
- Retrieve authentication data from sessionStorage
- Clear authentication data on logout
- Provide authentication status for protected routes

**Implementation Details**:
- Uses `sessionStorage` API for token persistence
- Validates token expiration before returning `isAuthenticated`
- Provides consistent interface for authentication operations across views

**Usage in LoginView**:
```typescript
const { isAuthenticated, login } = useAuth();

// Check authentication on mount
useEffect(() => {
  if (isAuthenticated) {
    navigate('/recipes');
  }
}, [isAuthenticated]);

// Call on successful login
const handleLoginSuccess = (data: LoginResponseDTO) => {
  login(data.token, data.username, data.expiresAt);
  navigate('/recipes');
};
```

---

### 6.3 Form State Management

**Using React Hook Form**:
```typescript
const {
  register,
  handleSubmit,
  formState: { errors, isValid }
} = useForm<LoginFormData>({
  mode: 'onBlur',  // Validate on blur
  defaultValues: {
    username: '',
    password: ''
  }
});
```

**Validation Schema** (using React Hook Form validations):
```typescript
{
  username: {
    required: 'Username is required'
  },
  password: {
    required: 'Password is required'
  }
}
```

---

## 7. API Integration

### 7.1 Endpoint Details

**Endpoint**: `POST /api/v1/auth/login`  
**Base URL**: `http://localhost:8080` (development)  
**Content-Type**: `application/json`  
**Authentication**: None required (public endpoint)

### 7.2 Request Format

**Type**: `LoginRequestDTO`

**Example Request Body**:
```json
{
  "username": "johndoe",
  "password": "mypassword123"
}
```

### 7.3 Response Formats

**Success Response (HTTP 200)**:
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

**Error Response (HTTP 401)** - Invalid credentials:
```json
{
  "status": "error",
  "message": "Invalid username or password",
  "data": null
}
```

**Error Response (HTTP 400)** - Validation error:
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

### 7.4 API Service Implementation

**Create dedicated service** (`authService.ts`):
```typescript
import axios, { AxiosError } from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

export const authService = {
  login: async (credentials: LoginRequestDTO): Promise<LoginResponseDTO> => {
    const response = await axios.post<ApiResponse<LoginResponseDTO>>(
      `${API_BASE_URL}/api/v1/auth/login`,
      credentials
    );
    
    if (response.data.status === 'success' && response.data.data) {
      return response.data.data;
    }
    
    throw new Error(response.data.message || 'Login failed');
  }
};
```

**Error Handling Strategy**:
- Axios automatically throws on 4xx/5xx responses
- Extract error message from API response or use generic fallback
- Display user-friendly error messages in toast notification

### 7.5 Integration in LoginView

```typescript
const handleLogin = async (credentials: LoginRequestDTO) => {
  setIsLoading(true);
  setError(null);
  
  try {
    const data = await authService.login(credentials);
    login(data.token, data.username, data.expiresAt);
    navigate('/recipes');
  } catch (err) {
    const errorMessage = extractErrorMessage(err);
    setError(errorMessage);
    toast.error(errorMessage);
  } finally {
    setIsLoading(false);
  }
};
```

---

## 8. User Interactions

### 8.1 Page Load
- **Action**: User navigates to `/login`
- **Expected Behavior**:
  - If already authenticated: Redirect to `/recipes`
  - If not authenticated: Display login form
  - Auto-focus on username field
  - Form fields are empty
  - Submit button is enabled (but validation will prevent submission of empty form)

### 8.2 Username Input
- **Action**: User types in username field
- **Expected Behavior**:
  - Characters appear in field
  - No real-time validation (validation triggers on blur)
  - Error message clears if previously shown

### 8.3 Username Blur
- **Action**: User leaves username field (blur event)
- **Expected Behavior**:
  - If empty: Display error "Username is required" below field
  - If not empty: No error shown

### 8.4 Password Input
- **Action**: User types in password field
- **Expected Behavior**:
  - Characters appear as dots/asterisks (type="password")
  - No real-time validation (validation triggers on blur)
  - Error message clears if previously shown

### 8.5 Password Blur
- **Action**: User leaves password field (blur event)
- **Expected Behavior**:
  - If empty: Display error "Password is required" below field
  - If not empty: No error shown

### 8.6 Password Visibility Toggle
- **Action**: User clicks eye icon button
- **Expected Behavior**:
  - Password switches between visible text and hidden dots
  - Icon changes (e.g., eye-open ↔ eye-closed)
  - Cursor position maintained in input field

### 8.7 Form Submission (Valid Data)
- **Action**: User clicks "Log In" button or presses Enter with valid form data
- **Expected Behavior**:
  1. Submit button shows loading spinner
  2. Form fields become disabled
  3. API request sent to `/api/v1/auth/login`
  4. On success:
     - JWT token stored in sessionStorage
     - Username and expiresAt stored in sessionStorage
     - User redirected to `/recipes`
  5. On error:
     - Loading state cleared
     - Form fields re-enabled
     - Error toast appears with message "Invalid username or password" (or specific message from API)

### 8.8 Form Submission (Invalid Data)
- **Action**: User clicks "Log In" button with empty fields
- **Expected Behavior**:
  - Form submission prevented
  - Validation errors displayed below respective fields
  - No API request made
  - Focus moved to first invalid field

### 8.9 Registration Link Click
- **Action**: User clicks "Sign up" link
- **Expected Behavior**:
  - User navigated to `/register` route
  - Login form is unmounted

### 8.10 Enter Key Press
- **Action**: User presses Enter while focused on any form field
- **Expected Behavior**:
  - Form submission triggered (same as clicking submit button)
  - Follows validation rules before submission

---

## 9. Conditions and Validation

### 9.1 Client-Side Validation (LoginForm Component)

**Field: Username**
- **Condition**: `required`
- **Error Message**: "Username is required"
- **Trigger**: onBlur, onSubmit
- **UI Effect**: Red border on input field, error text below field, submit button remains enabled but submission prevented

**Field: Password**
- **Condition**: `required`
- **Error Message**: "Password is required"
- **Trigger**: onBlur, onSubmit
- **UI Effect**: Red border on input field, error text below field, submit button remains enabled but submission prevented

**Note**: No length validation on client side. Backend will validate username length (3-50 characters) and password length (minimum 6 characters), but these are enforced at registration, not login.

### 9.2 Submit Button State

**Enabled State**:
- Default state (even if form is invalid)
- Allows user to attempt submission and see validation errors

**Disabled State**:
- During API request (`isLoading === true`)
- Visual feedback: Loading spinner replaces button text

**Rationale**: Button remains enabled to allow validation feedback. Form submission logic prevents API call if validation fails.

### 9.3 API Validation (Backend)

**Backend validates**:
- Username: `@NotBlank` (not blank)
- Password: `@NotBlank` (not blank)
- Credentials: Username exists and password matches hash

**Error Responses Handled**:
1. **HTTP 400** (Validation error):
   - Extract field errors from `data.errors` object
   - Display inline errors below respective fields
   - Display toast notification: "Please correct the errors in the form"

2. **HTTP 401** (Invalid credentials):
   - Display toast notification: "Invalid username or password"
   - Do not display inline field errors (security: don't reveal which field is wrong)

3. **HTTP 500** (Server error):
   - Display toast notification: "An unexpected error occurred. Please try again."

### 9.4 Authentication Check (LoginView Component)

**Condition**: User is already authenticated
- **Check**: `useAuth().isAuthenticated` returns `true`
- **Trigger**: Component mount (`useEffect` on page load)
- **UI Effect**: Immediate redirect to `/recipes` without showing login form

---

## 10. Error Handling

### 10.1 Network Errors

**Scenario**: API request fails due to network issues (server down, no internet, timeout)

**Handling**:
- Catch Axios error in `try-catch` block
- Display toast notification: "Unable to connect to server. Please check your internet connection."
- Log error to console for debugging
- Clear loading state
- Re-enable form for retry

**Code Example**:
```typescript
catch (error) {
  if (axios.isAxiosError(error) && !error.response) {
    toast.error('Unable to connect to server. Please check your internet connection.');
  } else {
    // Handle other errors
  }
}
```

### 10.2 Invalid Credentials (HTTP 401)

**Scenario**: User enters incorrect username or password

**Handling**:
- Display toast notification: "Invalid username or password"
- Do not display field-level errors (prevents username enumeration)
- Clear password field (optional, UX decision)
- Clear loading state
- Re-enable form for retry
- Log failed attempt (optional, for analytics)

### 10.3 Validation Errors (HTTP 400)

**Scenario**: Backend validation fails (empty fields sent to API)

**Handling**:
- Extract field errors from `response.data.data.errors`
- Display inline errors below respective fields using React Hook Form's `setError` method
- Display toast notification: "Validation failed" with specific field errors
- Clear loading state
- Re-enable form for correction

**Code Example**:
```typescript
if (error.response?.status === 400) {
  const validationErrors = error.response.data.data?.errors;
  if (validationErrors) {
    Object.entries(validationErrors).forEach(([field, message]) => {
      setError(field as keyof LoginFormData, {
        type: 'server',
        message: message as string
      });
    });
  }
  toast.error('Validation failed. Please check the form.');
}
```

### 10.4 Server Errors (HTTP 500)

**Scenario**: Unexpected server error during authentication

**Handling**:
- Display toast notification: "An unexpected error occurred. Please try again later."
- Log full error to console for debugging
- Clear loading state
- Re-enable form for retry
- Do not expose technical error details to user

### 10.5 Token Expiration Edge Case

**Scenario**: User is already logged in but token is expired

**Handling**:
- `useAuth` hook checks token expiration on mount
- If expired: Clear sessionStorage and show login form
- Display toast notification: "Your session has expired. Please log in again."

### 10.6 Empty State

**Scenario**: N/A for login view (no empty state, form is always displayed)

### 10.7 Malformed API Response

**Scenario**: API returns unexpected response structure

**Handling**:
- Check for expected `data` structure before accessing nested properties
- Use optional chaining (`response.data?.data?.token`)
- Display generic error if structure is invalid: "An unexpected error occurred."
- Log malformed response to console for debugging

---

## 11. Implementation Steps

### Step 1: Create Project Structure and Types
1. Create directory: `src/views/LoginView/`
2. Create directory: `src/services/`
3. Create directory: `src/hooks/`
4. Create directory: `src/types/`
5. Create `src/types/auth.ts` with DTOs and ViewModels:
   - `LoginRequestDTO`
   - `LoginResponseDTO`
   - `ApiResponse<T>`
   - `ValidationErrorDetails`
   - `AuthState`
6. Create `src/types/common.ts` with shared types

### Step 2: Implement useAuth Custom Hook
1. Create `src/hooks/useAuth.ts`
2. Implement `useAuth` function with:
   - `isAuthenticated` - Check token existence and expiration
   - `login(token, username, expiresAt)` - Store auth data in sessionStorage
   - `logout()` - Clear sessionStorage
   - `getToken()` - Retrieve token from sessionStorage
   - `getUsername()` - Retrieve username from sessionStorage
3. Add token expiration validation logic
4. Export hook

### Step 3: Implement Auth Service
1. Create `src/services/authService.ts`
2. Configure Axios base URL using environment variables
3. Implement `login(credentials)` method:
   - Make POST request to `/api/v1/auth/login`
   - Extract data from `ApiResponse` wrapper
   - Return `LoginResponseDTO`
   - Throw error with message on failure
4. Create error extraction utility function
5. Export service

### Step 4: Create LoginForm Component
1. Create `src/views/LoginView/LoginForm.tsx`
2. Set up React Hook Form with `useForm`:
   - Define validation schema (required fields)
   - Set mode to `'onBlur'`
3. Implement username TextField:
   - Use `register('username')` for form binding
   - Add auto-focus attribute
   - Display error from `formState.errors.username`
4. Implement password PasswordField:
   - Use `register('password')` for form binding
   - Add password visibility toggle state
   - Display error from `formState.errors.password`
5. Implement submit button:
   - Disable when `isLoading` prop is true
   - Show loading spinner during submission
6. Implement registration link:
   - Use React Router `<Link to="/register">`
7. Add form submit handler:
   - Call `handleSubmit` from React Hook Form
   - Invoke parent `onSubmit` callback with form data
8. Add Enter key submit functionality
9. Export component

### Step 5: Create LoginView Page Component
1. Create `src/views/LoginView/LoginView.tsx`
2. Import dependencies:
   - React hooks (useState, useEffect)
   - useAuth custom hook
   - useNavigate from React Router
   - authService
   - LoginForm component
   - Toast library (react-hot-toast)
3. Set up component state:
   - `isLoading` (boolean)
   - `error` (string | null)
4. Implement authentication check on mount:
   - Use `useEffect` to check `isAuthenticated`
   - Redirect to `/recipes` if already authenticated
5. Implement `handleLogin` function:
   - Set loading state
   - Call `authService.login(credentials)`
   - On success: call `useAuth().login()` and navigate to `/recipes`
   - On error: extract error message, set error state, display toast
   - Always clear loading state in `finally` block
6. Render LoginForm with props:
   - Pass `onSubmit={handleLogin}`
   - Pass `isLoading` state
7. Add toast notification container
8. Export component

### Step 6: Configure Routing
1. Open `src/App.tsx` or routing configuration file
2. Add route for LoginView:
   ```typescript
   <Route path="/login" element={<LoginView />} />
   ```
3. Ensure `/login` is a public route (no authentication guard)

### Step 7: Configure Environment Variables
1. Create `.env.development` file
2. Add `VITE_API_BASE_URL=http://localhost:8080`
3. Create `.env.production` file
4. Add production API URL (if different)
5. Update `authService.ts` to use `import.meta.env.VITE_API_BASE_URL`

### Step 8: Styling and UX Polish
1. Apply centered layout to LoginView container:
   - Vertical and horizontal centering
   - Max-width for form (e.g., 400px)
2. Style form fields:
   - Consistent spacing between fields
   - Clear label typography
   - Error message styling (red color, small font)
3. Style submit button:
   - Full-width button
   - Primary color
   - Loading spinner animation
4. Add application logo or branding above form
5. Ensure mobile responsiveness:
   - Touch-friendly input fields (minimum 44x44px)
   - Readable font sizes (minimum 16px to prevent iOS zoom)
6. Test tab order:
   - Username → Password → Submit → Registration Link

### Step 9: Testing
1. **Unit Tests** (if applicable):
   - Test `useAuth` hook logic (token storage, expiration validation)
   - Test `authService.login()` with mocked Axios responses
2. **Manual Testing**:
   - **Valid login**: Enter correct credentials, verify redirect to `/recipes`
   - **Invalid username**: Verify 401 error toast appears
   - **Invalid password**: Verify 401 error toast appears
   - **Empty fields**: Submit form, verify validation errors appear
   - **Network error**: Disconnect internet, verify network error toast
   - **Already authenticated**: Navigate to `/login` while logged in, verify redirect
   - **Password visibility toggle**: Click eye icon, verify password visibility changes
   - **Enter key submission**: Press Enter in username/password field, verify form submits
   - **Mobile responsiveness**: Test on mobile device, verify layout and tap targets
   - **Tab navigation**: Use keyboard to navigate form, verify tab order

### Step 10: Integration Testing
1. Start backend server on `http://localhost:8080`
2. Start frontend dev server on `http://localhost:3000`
3. Test full authentication flow:
   - Register new user (if not already done)
   - Log out (clear sessionStorage)
   - Navigate to `/login`
   - Enter credentials and submit
   - Verify JWT token stored in sessionStorage
   - Verify redirect to `/recipes`
   - Verify recipes page loads with authentication header
4. Test error scenarios:
   - Enter invalid credentials, verify 401 error handling
   - Shut down backend, verify network error handling
5. Test token expiration:
   - Manually modify `expiresAt` in sessionStorage to past date
   - Refresh page, verify redirect to `/login` with expiration message

### Step 11: Documentation
1. Add JSDoc comments to `useAuth` hook
2. Add JSDoc comments to `authService` methods
3. Document component props interfaces
4. Create README section for authentication flow
5. Document sessionStorage structure and keys
6. Update API integration documentation

### Step 12: Accessibility Enhancements
1. Add ARIA labels to form fields:
   - `aria-label` or `aria-labelledby` for inputs
   - `aria-describedby` for error messages
2. Add `role="alert"` to error message containers
3. Ensure focus management:
   - Auto-focus on username field on mount
   - Focus on first invalid field after validation error
4. Test with screen reader (NVDA/JAWS)
5. Ensure sufficient color contrast for text and error messages
6. Add visible focus indicators for keyboard navigation

### Step 13: Security Enhancements
1. Ensure password field uses `type="password"` by default
2. Verify XSS protection (React's automatic escaping)
3. Add `autocomplete="username"` to username field
4. Add `autocomplete="current-password"` to password field
5. Ensure HTTPS is used in production (environment variable check)
6. Validate that JWT is stored in sessionStorage (cleared on browser close)

### Step 14: Final Code Review and Cleanup
1. Remove console.log statements
2. Ensure all TypeScript types are properly defined (no `any` types)
3. Remove unused imports
4. Format code with Prettier
5. Lint code with ESLint
6. Verify all error messages are user-friendly and clear
7. Ensure loading states are consistent across components
8. Review component naming conventions
9. Ensure file and folder structure matches project conventions

---

## Implementation Notes

- **Authentication Persistence**: JWT is stored in sessionStorage (cleared on browser close). For longer persistence, consider localStorage with proper security considerations.
- **Error Messages**: Backend returns generic "Invalid username or password" for security (prevents username enumeration). Frontend should display this exact message without modification.
- **Password Recovery**: Out of scope for MVP. No "Forgot Password" link needed.
- **Auto-logout**: Token expiration is checked on page load. For real-time expiration, consider implementing a timer that checks expiration every minute.
- **CORS Configuration**: Backend must be configured to accept requests from `http://localhost:3000` during development.
- **Environment Variables**: Use Vite's `import.meta.env` for environment-specific configuration.
- **Form Library**: React Hook Form is recommended for performant form management with minimal re-renders.
- **UI Library**: Use Material-UI or Ant Design for consistent component styling and accessibility features.
- **Toast Library**: React Hot Toast is recommended for lightweight, customizable notifications.
