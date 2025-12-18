# View Implementation Plan: Registration

## 1. Overview

The Registration view provides a form-based interface for new users to create an account in the Recipe Notebook application. Upon successful registration, the system automatically creates 6 default categories and 1 sample recipe for the user, then redirects them to the sample recipe detail view with a welcome message. The view emphasizes real-time validation feedback, accessibility, and a streamlined user experience optimized for both mobile and desktop browsers.

## 2. View Routing

**Path**: `/register`

**Access**: Public (unauthenticated users only)

**Navigation**:
- From: Login view (`/login`) via "Don't have an account? Register" link
- To: Sample recipe detail view (e.g., `/recipes/:sampleRecipeId`) after successful registration

## 3. Component Structure

```
RegistrationView (Container)
└── RegistrationForm (Form Component)
    ├── UsernameInput (FormInput with CharacterCounter)
    ├── PasswordInput (FormInput)
    ├── SubmitButton (Primary Action Button)
    └── LoginLink (Navigation Link)
```

**Component Hierarchy**:
- `RegistrationView`: Page container with branding and layout
- `RegistrationForm`: Core form logic with React Hook Form integration
- `UsernameInput`: Text input with character counter and validation
- `PasswordInput`: Password input with visibility toggle and validation
- `SubmitButton`: Submit button with loading state
- `LoginLink`: Navigation link to login page

## 4. Component Details

### 4.1 RegistrationView (Container Component)

**Purpose**: Main page container that provides layout structure, branding, and accessibility context for the registration flow.

**Main Elements**:
- `<div>` with centered layout (flex or grid)
- Application logo/branding element
- `<h1>` heading: "Create Your Account"
- `<RegistrationForm>` child component
- ARIA live region for dynamic announcements

**Handled Events**: None (stateless container)

**Validation**: None (validation handled by child form)

**Required Types**:
- None (presentational component)

**Props**: None (top-level route component)

**File**: `frontend/src/views/RegistrationView.jsx` or `frontend/src/pages/RegistrationView.jsx`

---

### 4.2 RegistrationForm (Form Component)

**Purpose**: Core form component that manages registration state, validation logic, API integration, and user interactions using React Hook Form.

**Main Elements**:
- `<form>` element with `onSubmit` handler
- `<UsernameInput>` component
- `<PasswordInput>` component
- `<SubmitButton>` component
- `<LoginLink>` component
- Error message display area (for server-side errors)

**Handled Events**:
- `onSubmit`: Validates form, calls registration API, handles success/error responses
- `onBlur` (delegated to inputs): Triggers validation after first interaction
- `onChange` (delegated to inputs): Updates character counter, triggers validation if field was previously touched

**Validation Conditions**:
- **Username**:
  - Required: "Username is required"
  - Min length 3 characters: "Username must be between 3 and 50 characters"
  - Max length 50 characters: "Username must be between 3 and 50 characters"
  - Pattern `^[a-zA-Z0-9_]+$`: "Username can only contain letters, numbers, and underscores"
- **Password**:
  - Required: "Password is required"
  - Min length 6 characters: "Password must be at least 6 characters"

**Required Types**:
- `RegisterRequest` (DTO)
- `RegisterResponse` (DTO)
- `ApiResponse<RegisterResponse>` (DTO)
- `ValidationErrorResponse` (DTO)
- `FormState` (ViewModel)

**Props**: None (standalone form component)

**State Management**:
- React Hook Form: `useForm` hook manages form state
- Custom hook: `useRegistration` for API call logic (optional abstraction)

**File**: `frontend/src/components/RegistrationForm.jsx`

---

### 4.3 UsernameInput (FormInput Component)

**Purpose**: Controlled text input for username with real-time character counter and validation feedback.

**Main Elements**:
- `<label>` for accessibility: "Username"
- `<input type="text">` with placeholder "Enter username (3-50 characters)"
- `<CharacterCounter>`: Displays current/max characters (e.g., "5/50")
- `<span>` for validation error message (conditional render)
- ARIA attributes: `aria-invalid`, `aria-describedby`

**Handled Events**:
- `onChange`: Updates form value and character counter
- `onBlur`: Marks field as touched, triggers validation

**Validation**: Same as RegistrationForm username validation

**Required Types**:
- `FormInputProps` (component props)

**Props**:
- `name: string` - Form field name ("username")
- `label: string` - Display label
- `placeholder: string` - Input placeholder
- `register: UseFormRegister` - React Hook Form register function
- `error: FieldError | undefined` - Validation error object
- `value: string` - Current input value (for character counter)
- `maxLength: number` - Maximum character count (50)

**File**: `frontend/src/components/FormInput.jsx` (reusable component with character counter variant)

---

### 4.4 PasswordInput (FormInput Component)

**Purpose**: Controlled password input with visibility toggle and validation feedback.

**Main Elements**:
- `<label>` for accessibility: "Password"
- `<input type="password">` with placeholder "Enter password (minimum 6 characters)"
- Toggle button/icon to show/hide password
- `<span>` for validation error message (conditional render)
- ARIA attributes: `aria-invalid`, `aria-describedby`

**Handled Events**:
- `onChange`: Updates form value
- `onBlur`: Marks field as touched, triggers validation
- `onToggleVisibility`: Toggles password visibility (type="password" ↔ type="text")

**Validation**: Same as RegistrationForm password validation

**Required Types**:
- `FormInputProps` (component props)

**Props**:
- `name: string` - Form field name ("password")
- `label: string` - Display label
- `placeholder: string` - Input placeholder
- `register: UseFormRegister` - React Hook Form register function
- `error: FieldError | undefined` - Validation error object
- `type: "password" | "text"` - Input type (toggleable)

**File**: `frontend/src/components/FormInput.jsx` (reusable component with password variant)

---

### 4.5 SubmitButton (Button Component)

**Purpose**: Primary action button that submits the registration form with loading state feedback.

**Main Elements**:
- `<button type="submit">` with disabled state during submission
- Button text: "Create Account" (or "Creating..." when loading)
- Loading spinner/icon (conditional render)

**Handled Events**:
- `onClick`: Implicit form submission (handled by form's `onSubmit`)

**Validation**: Button disabled when `isSubmitting` is true

**Required Types**:
- `ButtonProps` (component props)

**Props**:
- `isLoading: boolean` - Loading state from form submission
- `disabled: boolean` - Disabled state (derived from isLoading)
- `children: ReactNode` - Button text

**File**: `frontend/src/components/Button.jsx` (reusable button component)

---

### 4.6 LoginLink (Link Component)

**Purpose**: Navigation link that directs existing users to the login page.

**Main Elements**:
- `<p>` or `<div>` wrapper
- Text: "Already have an account?"
- `<Link to="/login">` component: "Log in"

**Handled Events**:
- `onClick`: Navigate to `/login` route

**Validation**: None

**Required Types**: None

**Props**: None

**File**: Inline in `RegistrationForm.jsx` or extracted to `frontend/src/components/LoginLink.jsx`

---

## 5. Types

### 5.1 DTOs (Data Transfer Objects)

**RegisterRequest.ts**
```typescript
export interface RegisterRequest {
  username: string; // 3-50 characters, alphanumeric + underscore
  password: string; // Minimum 6 characters
}
```

**RegisterResponse.ts**
```typescript
export interface RegisterResponse {
  userId: number;
  username: string;
}
```

**ApiResponse.ts** (Generic wrapper)
```typescript
export interface ApiResponse<T> {
  status: 'success' | 'error';
  message: string;
  data: T | null;
}
```

**ValidationErrorResponse.ts**
```typescript
export interface ValidationErrorResponse {
  errors: Record<string, string>; // Field name → error message
}
```

**Example API Responses:**

Success (HTTP 201):
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

Validation Error (HTTP 400):
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

Username Conflict (HTTP 409):
```json
{
  "status": "error",
  "message": "Username already exists",
  "data": null
}
```

---

### 5.2 ViewModels (Component-Specific Types)

**FormState.ts** (React Hook Form state)
```typescript
export interface FormState {
  username: string;
  password: string;
}
```

**FormInputProps.ts**
```typescript
import { FieldError, UseFormRegister } from 'react-hook-form';

export interface FormInputProps {
  name: string;
  label: string;
  placeholder: string;
  type?: 'text' | 'password';
  register: UseFormRegister<FormState>;
  error?: FieldError;
  value?: string; // For character counter
  maxLength?: number; // For character counter
  showCharacterCounter?: boolean;
}
```

**ButtonProps.ts**
```typescript
import { ReactNode } from 'react';

export interface ButtonProps {
  type?: 'button' | 'submit' | 'reset';
  isLoading?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'danger';
}
```

---

## 6. State Management

### 6.1 Form State

**Managed by**: React Hook Form (`useForm` hook)

**State Variables**:
- `formState.errors`: Field-level validation errors
- `formState.isSubmitting`: Loading state during API call
- `formState.touchedFields`: Tracks which fields user has interacted with
- `watch()`: Monitors input values for character counter

**Validation Strategy**:
- Mode: `onBlur` (validate on blur after first interaction)
- RevalidateMode: `onChange` (revalidate on every change after first blur)
- Client-side validation rules defined in React Hook Form schema

**Example Usage**:
```typescript
const {
  register,
  handleSubmit,
  watch,
  setError,
  formState: { errors, isSubmitting, touchedFields }
} = useForm<FormState>({
  mode: 'onBlur',
  revalidateMode: 'onChange'
});
```

---

### 6.2 Custom Hook: useRegistration

**Purpose**: Encapsulates registration API logic, error handling, and post-registration navigation.

**Responsibilities**:
1. Call POST /api/v1/auth/register with form data
2. Handle success: show toast, fetch sample recipe ID, navigate to recipe detail
3. Handle errors: map server errors to form fields or show toast
4. Manage loading state

**Interface**:
```typescript
interface UseRegistrationReturn {
  register: (data: RegisterRequest) => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

export function useRegistration(): UseRegistrationReturn {
  // Implementation
}
```

**Implementation Details**:
- Uses Axios for HTTP requests
- Maps HTTP 400 validation errors to React Hook Form `setError`
- Maps HTTP 409 username conflict to username field error
- Shows generic toast for HTTP 500 errors
- On success: 
  1. Display toast: "Welcome! Here's a sample recipe to get started. Try creating your own!"
  2. Fetch user's recipes to identify sample recipe ID
  3. Navigate to `/recipes/:sampleRecipeId`

**File**: `frontend/src/hooks/useRegistration.ts`

---

## 7. API Integration

### 7.1 Registration Endpoint

**Endpoint**: `POST /api/v1/auth/register`

**Request Headers**:
- `Content-Type: application/json`

**Request Body**:
```typescript
const requestBody: RegisterRequest = {
  username: formData.username,
  password: formData.password
};
```

**Response Handling**:

**Success (HTTP 201)**:
```typescript
const response: ApiResponse<RegisterResponse> = {
  status: 'success',
  message: 'User registered successfully',
  data: {
    userId: 123,
    username: 'johndoe'
  }
};

// Actions:
// 1. Show success toast
toast.success('Welcome! Here's a sample recipe to get started. Try creating your own!');

// 2. Fetch user's recipes to find sample recipe ID
const recipesResponse = await axios.get('/api/v1/recipes');
const sampleRecipe = recipesResponse.data.data.recipes[0]; // Sample recipe

// 3. Navigate to sample recipe detail
navigate(`/recipes/${sampleRecipe.id}`);
```

**Error (HTTP 400 - Validation)**:
```typescript
const errorResponse: ApiResponse<ValidationErrorResponse> = {
  status: 'error',
  message: 'Validation failed',
  data: {
    errors: {
      username: 'Username must be between 3 and 50 characters',
      password: 'Password must be at least 6 characters'
    }
  }
};

// Map errors to form fields
Object.entries(errorResponse.data.errors).forEach(([field, message]) => {
  setError(field as keyof FormState, { type: 'server', message });
});
```

**Error (HTTP 409 - Conflict)**:
```typescript
const conflictResponse: ApiResponse<null> = {
  status: 'error',
  message: 'Username already exists',
  data: null
};

// Set username field error
setError('username', { type: 'server', message: 'Username already exists' });
```

**Error (HTTP 500 - Server Error)**:
```typescript
// Show generic error toast
toast.error('An error occurred. Please try again later.');
```

---

### 7.2 Axios Service

**File**: `frontend/src/services/api.ts`

**Configuration**:
```typescript
import axios from 'axios';

const apiClient = axios.create({
  baseURL: '/api/v1',
  headers: {
    'Content-Type': 'application/json'
  }
});

export const authApi = {
  register: (data: RegisterRequest): Promise<ApiResponse<RegisterResponse>> => {
    return apiClient.post('/auth/register', data);
  }
};
```

---

## 8. User Interactions

### 8.1 Username Input Interaction

**Interaction**: User types in username field

**Flow**:
1. User focuses on username input
2. User types characters → character counter updates in real-time (e.g., "5/50")
3. User blurs (loses focus) → validation triggers
4. If invalid → error message appears below input, field highlighted (red border), ARIA live region announces error
5. If valid → no error message, field appears normal (green border or default)
6. User continues typing → validation re-triggers on every keystroke (after first blur)

**Expected Outcomes**:
- Character counter always reflects current length
- Validation errors appear immediately after blur
- Errors clear when input becomes valid
- ARIA announcements for screen readers

---

### 8.2 Password Input Interaction

**Interaction**: User types in password field

**Flow**:
1. User focuses on password input
2. User types characters (masked by default)
3. User clicks "show/hide password" icon → password toggles between masked and visible
4. User blurs → validation triggers
5. If invalid → error message appears below input
6. If valid → no error message

**Expected Outcomes**:
- Password visibility toggles on icon click
- Validation errors appear after blur
- Errors clear when password meets minimum length

---

### 8.3 Form Submission Interaction

**Interaction**: User clicks "Create Account" button

**Flow**:
1. User clicks submit button (or presses Enter in form)
2. React Hook Form validates all fields client-side
3. If validation fails → errors displayed, submission aborted
4. If validation passes:
   - Submit button shows loading state (disabled, spinner, text: "Creating...")
   - API request sent to POST /api/v1/auth/register
   - **Success Path**:
     - Success toast appears: "Welcome! Here's a sample recipe to get started. Try creating your own!"
     - Fetch user's recipes to find sample recipe ID
     - Navigate to `/recipes/:sampleRecipeId`
   - **Error Path (400)**:
     - Server validation errors mapped to form fields
     - Submit button returns to normal state
     - User can correct errors and resubmit
   - **Error Path (409)**:
     - Username field shows "Username already exists" error
     - Submit button returns to normal state
   - **Error Path (500)**:
     - Generic error toast appears
     - Submit button returns to normal state

**Expected Outcomes**:
- Clear loading feedback during submission
- Field-level error display for validation failures
- Success toast and redirect on successful registration
- Error toast for unexpected server errors

---

### 8.4 Navigation to Login

**Interaction**: User clicks "Log in" link

**Flow**:
1. User clicks "Log in" link in "Already have an account? Log in" text
2. Navigate to `/login` route
3. Current form state is discarded (user leaves page)

**Expected Outcomes**:
- Immediate navigation to login page
- No confirmation dialog (form is not dirty/critical)

---

## 9. Conditions and Validation

### 9.1 Client-Side Validation Rules

**Username Field**:
| Condition | Validation Rule | Error Message | When Triggered |
|-----------|----------------|---------------|----------------|
| Required | `required: true` | "Username is required" | On blur if empty |
| Min Length | `minLength: 3` | "Username must be between 3 and 50 characters" | On blur/change if < 3 chars |
| Max Length | `maxLength: 50` | "Username must be between 3 and 50 characters" | On blur/change if > 50 chars |
| Pattern | `pattern: /^[a-zA-Z0-9_]+$/` | "Username can only contain letters, numbers, and underscores" | On blur/change if invalid chars |

**Password Field**:
| Condition | Validation Rule | Error Message | When Triggered |
|-----------|----------------|---------------|----------------|
| Required | `required: true` | "Password is required" | On blur if empty |
| Min Length | `minLength: 6` | "Password must be at least 6 characters" | On blur/change if < 6 chars |

**React Hook Form Configuration**:
```typescript
const usernameRules = {
  required: 'Username is required',
  minLength: {
    value: 3,
    message: 'Username must be between 3 and 50 characters'
  },
  maxLength: {
    value: 50,
    message: 'Username must be between 3 and 50 characters'
  },
  pattern: {
    value: /^[a-zA-Z0-9_]+$/,
    message: 'Username can only contain letters, numbers, and underscores'
  }
};

const passwordRules = {
  required: 'Password is required',
  minLength: {
    value: 6,
    message: 'Password must be at least 6 characters'
  }
};
```

---

### 9.2 Server-Side Validation Rules

**Username Uniqueness**:
| Condition | HTTP Status | Error Response | UI Behavior |
|-----------|-------------|----------------|-------------|
| Username already exists | 409 Conflict | `{ status: 'error', message: 'Username already exists', data: null }` | Set error on username field: "Username already exists" |

**Server Validation Errors**:
| Condition | HTTP Status | Error Response | UI Behavior |
|-----------|-------------|----------------|-------------|
| Multiple validation failures | 400 Bad Request | `{ status: 'error', message: 'Validation failed', data: { errors: { username: '...', password: '...' } } }` | Map errors to respective form fields |

---

### 9.3 UI State Changes Based on Validation

**Input Field States**:
- **Default**: Neutral border color, no error message
- **Focused**: Highlighted border (blue/accent color)
- **Valid (after blur)**: Green border (optional), no error message
- **Invalid (after blur)**: Red border, error message displayed below, ARIA `aria-invalid="true"`
- **Server Error**: Red border, server error message displayed below

**Submit Button States**:
- **Enabled**: Default button styling, clickable
- **Disabled (validation failed)**: Grayed out, not clickable (optional based on validation strategy)
- **Loading (submitting)**: Disabled, spinner icon, text changes to "Creating..."

**Character Counter States**:
- **Within limit**: Neutral color (gray)
- **At limit**: Warning color (orange) - when count = 50
- **Over limit**: Error color (red) - should not occur due to maxLength attribute

---

## 10. Error Handling

### 10.1 Client-Side Validation Errors

**Scenario**: User submits form with invalid data

**Handling**:
1. React Hook Form prevents submission
2. Display field-level errors below respective inputs
3. Focus first invalid field
4. Announce errors via ARIA live region

**User Recovery**: Correct invalid fields and resubmit

---

### 10.2 Server-Side Validation Errors (HTTP 400)

**Scenario**: Server rejects request due to validation failures (e.g., additional server-side rules)

**Handling**:
1. Parse `data.errors` object from response
2. Map each error to corresponding form field using `setError`
3. Display errors below respective inputs
4. Return submit button to normal state

**User Recovery**: Correct invalid fields based on server feedback and resubmit

**Example**:
```typescript
if (error.response?.status === 400) {
  const validationErrors = error.response.data.data.errors;
  Object.entries(validationErrors).forEach(([field, message]) => {
    setError(field as keyof FormState, {
      type: 'server',
      message: message as string
    });
  });
}
```

---

### 10.3 Username Conflict Error (HTTP 409)

**Scenario**: User attempts to register with an existing username

**Handling**:
1. Display error message on username field: "Username already exists"
2. Focus username input
3. Return submit button to normal state

**User Recovery**: Choose a different username and resubmit

**Example**:
```typescript
if (error.response?.status === 409) {
  setError('username', {
    type: 'server',
    message: 'Username already exists'
  });
}
```

---

### 10.4 Network Errors

**Scenario**: Network request fails (timeout, no internet, CORS issue)

**Handling**:
1. Catch Axios error
2. Display generic error toast: "An error occurred. Please try again later."
3. Return submit button to normal state
4. Log error to console for debugging

**User Recovery**: Check internet connection and retry

**Example**:
```typescript
if (!error.response) {
  toast.error('Network error. Please check your connection.');
  console.error('Network error:', error);
}
```

---

### 10.5 Server Errors (HTTP 500)

**Scenario**: Server encounters internal error during registration

**Handling**:
1. Display generic error toast: "An error occurred. Please try again later."
2. Return submit button to normal state
3. Log error details to console

**User Recovery**: Retry submission or contact support if issue persists

---

### 10.6 Sample Recipe Fetch Error

**Scenario**: Registration succeeds but fetching sample recipe ID fails

**Handling**:
1. Show success toast for registration
2. If recipe fetch fails: navigate to `/recipes` (recipe list) instead of specific recipe
3. Log error to console

**User Recovery**: User can manually navigate to sample recipe from recipe list

**Example**:
```typescript
try {
  const recipesResponse = await axios.get('/api/v1/recipes');
  const sampleRecipe = recipesResponse.data.data.recipes[0];
  navigate(`/recipes/${sampleRecipe.id}`);
} catch (error) {
  console.error('Failed to fetch sample recipe:', error);
  navigate('/recipes'); // Fallback to recipe list
}
```

---

## 11. Implementation Steps

### Step 1: Set Up Project Structure
1. Create `frontend/src/views/RegistrationView.jsx` (or `.tsx` if using TypeScript)
2. Create `frontend/src/components/RegistrationForm.jsx`
3. Create `frontend/src/components/FormInput.jsx` (reusable input component)
4. Create `frontend/src/components/Button.jsx` (reusable button component)
5. Create `frontend/src/hooks/useRegistration.ts` (custom hook for API logic)
6. Create `frontend/src/types/auth.ts` (type definitions)
7. Update `frontend/src/services/api.ts` (add registration endpoint)

---

### Step 2: Define Type Definitions
1. Create DTOs in `frontend/src/types/auth.ts`:
   - `RegisterRequest`
   - `RegisterResponse`
   - `ApiResponse<T>`
   - `ValidationErrorResponse`
2. Create ViewModels:
   - `FormState`
   - `FormInputProps`
   - `ButtonProps`

---

### Step 3: Implement API Service
1. Configure Axios client in `frontend/src/services/api.ts`:
   - Set base URL to `/api/v1`
   - Configure default headers
2. Create `authApi.register` method:
   - Accepts `RegisterRequest`
   - Returns `Promise<ApiResponse<RegisterResponse>>`
   - Handles POST request to `/auth/register`

---

### Step 4: Create Reusable Components
1. Implement `FormInput` component:
   - Accepts `FormInputProps`
   - Renders label, input, error message
   - Supports character counter variant (conditional)
   - Supports password visibility toggle (conditional)
   - Implements ARIA attributes (`aria-invalid`, `aria-describedby`)
2. Implement `Button` component:
   - Accepts `ButtonProps`
   - Supports loading state with spinner
   - Supports disabled state
   - Implements accessible button semantics

---

### Step 5: Implement Custom Hook (useRegistration)
1. Create `useRegistration` hook:
   - Accept `setError` function from React Hook Form
   - Implement `register` function:
     - Call `authApi.register` with form data
     - Handle success: show toast, fetch recipes, navigate
     - Handle errors: map to form fields or show toast
   - Return `{ register, isLoading, error }`

---

### Step 6: Implement RegistrationForm Component
1. Initialize React Hook Form:
   - Configure validation mode: `onBlur`, revalidateMode: `onChange`
   - Define form state type: `FormState`
2. Integrate `useRegistration` hook:
   - Pass `setError` function to hook
   - Extract `register` function for submission
3. Implement form submit handler:
   - Use `handleSubmit` from React Hook Form
   - Call `useRegistration.register` with form data
4. Render form elements:
   - `UsernameInput` with character counter (watch username value)
   - `PasswordInput` with visibility toggle
   - `SubmitButton` with loading state
   - `LoginLink` to `/login`
5. Implement validation rules:
   - Username: required, minLength, maxLength, pattern
   - Password: required, minLength

---

### Step 7: Implement RegistrationView Container
1. Create page layout:
   - Centered container (flex or grid)
   - Application logo/branding
   - Page heading: "Create Your Account"
   - `<RegistrationForm>` component
2. Add ARIA live region:
   - `<div role="status" aria-live="polite" aria-atomic="true">` for dynamic announcements
3. Style with mobile-first approach:
   - Responsive width (max-width: 400px on desktop)
   - Adequate padding and spacing
   - Touch-friendly tap targets (min 44x44px)

---

### Step 8: Implement Routing
1. Add route in `frontend/src/App.jsx` (or routing configuration):
   ```jsx
   <Route path="/register" element={<RegistrationView />} />
   ```
2. Add navigation link in `LoginView`:
   ```jsx
   <Link to="/register">Don't have an account? Register</Link>
   ```

---

### Step 9: Implement Character Counter
1. In `FormInput` component, add character counter logic:
   - Accept `value` and `maxLength` props
   - Render counter: `{value.length}/{maxLength}`
   - Apply conditional styling (neutral, warning, error)
2. In `RegistrationForm`, watch username value:
   ```jsx
   const username = watch('username');
   ```
3. Pass `value={username}` to `UsernameInput`

---

### Step 10: Implement Accessibility Features
1. Add ARIA attributes to form inputs:
   - `aria-invalid={!!error}` on invalid fields
   - `aria-describedby={error ? `${name}-error` : undefined}`
2. Add `id` to error messages:
   - `<span id={`${name}-error`}>{error.message}</span>`
3. Implement ARIA live region announcements:
   - Announce validation errors when they appear
   - Announce success message before redirect
4. Ensure proper tab order:
   - Username → Password → Submit → Login link
5. Add focus management:
   - Focus first invalid field on validation error
   - Focus username field on component mount (optional)

---

### Step 11: Implement Toast Notifications
1. Install React Hot Toast (if not already installed):
   ```bash
   npm install react-hot-toast
   ```
2. Add `<Toaster />` component in `App.jsx`:
   ```jsx
   import { Toaster } from 'react-hot-toast';
   
   function App() {
     return (
       <>
         <Toaster position="top-right" />
         {/* Routes */}
       </>
     );
   }
   ```
3. Use toast in `useRegistration` hook:
   - Success: `toast.success('Welcome! Here's a sample recipe to get started. Try creating your own!')`
   - Error: `toast.error('An error occurred. Please try again later.')`

---

### Step 12: Style Components
1. Apply Material-UI or Ant Design components (per tech stack):
   - Use `TextField` (MUI) or `Input` (Ant Design) for inputs
   - Use `Button` component for submit button
   - Apply theme colors for validation states
2. Implement responsive styles:
   - Mobile: Full-width inputs, stacked layout
   - Desktop: Max-width container, centered layout
3. Style validation states:
   - Red border for invalid fields
   - Green border for valid fields (optional)
   - Error message in red below field
4. Style loading state:
   - Spinner icon in submit button
   - Disabled button styling

---

### Step 13: Test Registration Flow
1. Manual testing:
   - Test empty form submission → validation errors appear
   - Test invalid username (too short, invalid characters) → errors appear
   - Test invalid password (too short) → errors appear
   - Test valid form submission → loading state, API call, redirect
   - Test username conflict (409) → error on username field
   - Test server error (500) → generic error toast
2. Accessibility testing:
   - Test keyboard navigation (Tab key through form)
   - Test screen reader announcements (ARIA live regions)
   - Test focus management on errors
3. Responsive testing:
   - Test on mobile viewport (320px, 375px, 414px)
   - Test on tablet viewport (768px, 1024px)
   - Test on desktop viewport (1280px+)
4. Cross-browser testing:
   - Test on Chrome, Firefox, Safari
   - Test on mobile browsers (iOS Safari, Android Chrome)

---

### Step 14: Implement Post-Registration Navigation
1. In `useRegistration` hook, after successful registration:
   - Fetch user's recipes: `GET /api/v1/recipes`
   - Extract first recipe (sample recipe): `recipes[0]`
   - Navigate to recipe detail: `navigate(\`/recipes/\${sampleRecipe.id}\`)`
2. Handle edge case where recipe fetch fails:
   - Navigate to recipe list: `navigate('/recipes')`
   - Log error to console

---

### Step 15: Add Loading State and Error Feedback
1. Implement loading skeleton/spinner during form submission
2. Disable all form inputs during submission (optional)
3. Show specific error messages for each field
4. Implement retry logic (user can resubmit after fixing errors)

---

### Step 16: Final Polish
1. Review code for consistency and best practices
2. Add PropTypes or TypeScript types for all components
3. Add comments for complex logic (per self-explanatory code guidelines)
4. Test all user flows end-to-end
5. Verify mobile responsiveness
6. Verify accessibility compliance (WCAG AA)
7. Update README with registration view documentation

---

### Step 17: Integration Testing
1. Test with backend API (ensure backend is running)
2. Verify successful user creation in database
3. Verify default categories are created
4. Verify sample recipe is created
5. Test JWT token storage (if applicable)
6. Test navigation to sample recipe detail view

---

### Step 18: Deploy and Verify
1. Build frontend: `npm run build`
2. Serve static build from Spring Boot (if deploying together)
3. Test production build in browser
4. Verify all functionality works in production environment
5. Monitor browser console for errors
6. Verify CORS configuration allows frontend-backend communication

---

**Completion Checklist**:
- [ ] Type definitions created
- [ ] API service implemented
- [ ] Reusable components created
- [ ] Custom hook implemented
- [ ] Form validation configured
- [ ] Registration form implemented
- [ ] Container view implemented
- [ ] Routing configured
- [ ] Character counter working
- [ ] Accessibility features implemented
- [ ] Toast notifications working
- [ ] Styles applied (responsive)
- [ ] Manual testing complete
- [ ] Cross-browser testing complete
- [ ] Post-registration navigation working
- [ ] Error handling verified
- [ ] Integration testing complete
- [ ] Production deployment verified
