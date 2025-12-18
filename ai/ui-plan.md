# UI Architecture for Recipe Notebook MVP

**Version**: 1.0  
**Date**: December 18, 2025  
**Status**: Ready for Implementation

---

## 1. UI Framework Overview

Recipe Notebook is a single-page React application (SPA) with client-side routing, designed mobile-first to optimize the user experience while cooking. The architecture prioritizes simplicity, performance, and accessibility within a 3-4 day development timeline.

### Core Technologies
- **React 18+** with functional components and hooks
- **Vite** for fast development and optimized production builds
- **Material-UI (MUI)** for consistent, accessible component library
- **React Router v6** for client-side routing with scroll restoration
- **React Hook Form** for efficient form management and validation
- **Axios** for HTTP requests with centralized interceptors
- **React Hot Toast** for user feedback notifications
- **React Context API** for global state management (authentication, user data)

### Architectural Principles
1. **Mobile-First**: Design starts with mobile (320px+), progressively enhances for tablet and desktop
2. **Component Reusability**: Shared components for ingredients, steps, filters, and forms
3. **Protected Routes**: Authentication wrapper ensures JWT validity before accessing recipe features
4. **Optimistic Updates**: Immediate UI feedback with rollback on API errors
5. **Client-Side Caching**: Recipe list cached with 5-minute TTL, invalidated on mutations
6. **Accessibility-First**: Semantic HTML, ARIA labels, keyboard navigation, WCAG 2.1 AA compliance

---

## 2. List of Views

### 2.1 Login View

**View Name**: Login  
**View Path**: `/login`  
**Primary Purpose**: Authenticate existing users and provide access to their recipe collection

**Key Information to Display**:
- Application branding/logo
- Username input field
- Password input field
- Login button
- Link to registration page
- Error messages for invalid credentials

**Key View Components**:
- Centered form layout
- Text input fields with validation
- Primary action button
- Text link to registration
- Toast notification for errors

**UX, Accessibility, and Security Considerations**:
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

---

### 2.2 Registration View

**View Name**: Registration  
**View Path**: `/register`  
**Primary Purpose**: Create new user accounts with automatic sample data initialization

**Key Information to Display**:
- Application branding/logo
- Username input (3-50 characters, alphanumeric + underscore)
- Password input (minimum 6 characters)
- Real-time validation feedback
- Register button
- Link to login page
- Success confirmation before redirect

**Key View Components**:
- Centered form layout
- Text input fields with character counters
- Real-time validation messages
- Primary action button
- Text link to login
- Toast notification for success/errors

**UX, Accessibility, and Security Considerations**:
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

---

### 2.3 Recipe List View

**View Name**: Recipe List  
**View Path**: `/recipes`  
**Primary Purpose**: Browse, search, and filter user's recipe collection with quick access to details

**Key Information to Display**:
- Top navigation bar with search, filters, and user menu
- Recipe cards in grid/list layout
- Each card: title, difficulty badge (color-coded), cooking time, up to 2 categories with "...and X more" expansion
- Active filter chips showing current selections
- Loading spinner during data fetch
- Empty state for no recipes or no results
- Back-to-top floating action button (appears after scrolling)

**Key View Components**:
- Application shell with navigation (desktop: top bar, mobile: hamburger menu)
- Search input with debounce (300-500ms)
- Category filter (chip-based multi-select with "Select All")
- Difficulty filter (dropdown or chips)
- "Clear All Filters" button (visible when any filter active)
- Recipe card component (clickable, 44x44px minimum tap target)
- Infinite scroll pagination (triggers at 80-90% scroll position)
- Loading spinner at bottom during pagination fetch
- Empty state component with "Create your first recipe" call-to-action
- Floating action button (FAB) for back-to-top

**UX, Accessibility, and Security Considerations**:
- Entire recipe card clickable (semantic link wrapper)
- Touch-friendly tap targets (minimum 44x44px)
- Difficulty badges color-coded: Green (Easy), Yellow (Medium), Red (Hard)
- Category chips expandable inline (click "...and 2 more" to show all)
- Search debounced to prevent excessive API calls
- Infinite scroll with loading spinner (no page numbers)
- Scroll position saved in sessionStorage, restored on back navigation
- Empty state variations: "No recipes yet", "No results for 'search term'", "No recipes match these filters"
- ARIA live region announces search results count
- Keyboard navigation: Tab through cards, Enter to navigate
- Client-side cache with 5-minute TTL
- Cache invalidated on create/update/delete operations
- JWT automatically attached to API requests via Axios interceptor
- 401 responses trigger automatic logout and redirect to login
- Skip to main content link as first focusable element

---

### 2.4 Recipe Detail View

**View Name**: Recipe Detail  
**View Path**: `/recipes/:id`  
**Primary Purpose**: Display full recipe information optimized for reading while cooking

**Key Information to Display**:
- Recipe title (prominent heading)
- Difficulty badge (color-coded)
- Cooking time with clock icon
- All assigned categories as chips
- Ingredients list (quantity, unit, name) with clear visual separation
- Numbered steps list with readable typography
- Edit button (navigates to edit view)
- Delete button (shows confirmation dialog)
- Optional: Welcome banner for sample recipe (first-time users)

**Key View Components**:
- Page header with title and metadata
- Category chips (read-only, not clickable in detail view)
- Ingredients section with clear list formatting
- Steps section with auto-numbered list
- Action buttons (Edit, Delete)
- Confirmation dialog for deletion
- Loading skeleton while fetching
- Error state for recipe not found
- Toast notifications for actions

**UX, Accessibility, and Security Considerations**:
- Mobile-optimized layout for arm's length reading
- Readable font sizes (minimum 18px for body text on mobile)
- Clear visual hierarchy: title → metadata → ingredients → steps
- Ingredients and steps well-spaced for easy scanning
- Welcome banner for post-registration sample recipe (dismissible)
- Delete confirmation: "Are you sure you want to delete '[recipe title]'? This action cannot be undone."
- Optimistic deletion: immediate navigation to list, rollback and error toast on failure
- Edit button prominent and accessible
- ARIA landmarks: main, navigation
- Semantic HTML: h1 for title, ul/ol for lists
- Focus management: on load, focus on main heading
- Ingredient and step lists properly marked up for screen readers
- Recipe ownership validated server-side (403 Forbidden if not owner)
- 404 handling for non-existent or unauthorized recipes

---

### 2.5 Recipe Creation View

**View Name**: Create Recipe  
**View Path**: `/recipes/new`  
**Primary Purpose**: Add new recipes with ingredients and steps through a single-page form

**Key Information to Display**:
- Form title: "Create New Recipe"
- Basic info section: title, difficulty, cooking time
- Category selection (chip-based, multi-select, minimum 1)
- Ingredients section with dynamic rows (minimum 1)
- Steps section with dynamic text areas (minimum 2)
- Visual count feedback with color coding (e.g., "1 ingredient added (minimum 1 required)" - green when valid, red when below minimum)
- Save and Cancel buttons
- Real-time validation messages
- Unsaved changes warning on navigation

**Key View Components**:
- Single-page form (not wizard/multi-step)
- Text input with character counter (title max 100 chars)
- Dropdown for difficulty (Easy, Medium, Hard)
- Number input for cooking time (minutes)
- Chip-based category selector with "Select All" option
- Reusable ingredient row component (quantity, unit, name inputs with delete button)
- "+ Add Ingredient" button
- Reusable step component (text area with character counter max 500, up/down arrows for reordering)
- "+ Add Step" button
- Form action buttons (Cancel, Save)
- Confirmation dialog for unsaved changes
- Toast notification on success
- Field-level error messages

**UX, Accessibility, and Security Considerations**:
- Real-time validation on blur, revalidate onChange after first blur
- Character counters: "25/100" for title, "150/500" for each step
- Visual count feedback: "2 ingredients added (minimum 1 required)" in green
- Minimum requirements: title (1-100 chars), difficulty, cooking time (positive integer), 1+ ingredient, 2+ steps, 1+ category
- Dynamic ingredient rows: always show at least 1 empty row
- Ingredient delete button: X icon on right side of row, disabled if only 1 row
- Dynamic step rows: always show at least 2 empty text areas
- Step reordering: simple up/down arrow buttons (no drag-and-drop for MVP)
- Step auto-numbering displayed visually (not user-editable)
- Cancel button returns to recipe list with unsaved changes confirmation
- Save triggers validation, shows inline errors if invalid
- On success: toast "Recipe created successfully", redirect to recipe detail view
- Unsaved changes warning: "You have unsaved changes. Are you sure you want to leave?"
- ARIA live regions announce validation errors
- Form labels associated with inputs (for attribute)
- Keyboard navigation: Tab through all fields, Enter does not submit (prevents accidental submission while adding steps)
- Focus management: on error, focus first invalid field
- Client-side validation mirrors server-side rules exactly
- Optimistic update: show success toast immediately, rollback on API error
- JWT attached via Axios interceptor
- Validation errors from server mapped to field-level messages

---

### 2.6 Recipe Edit View

**View Name**: Edit Recipe  
**View Path**: `/recipes/:id/edit`  
**Primary Purpose**: Modify existing recipes with pre-populated data and same validation as creation

**Key Information to Display**:
- Form title: "Edit Recipe: [recipe title]"
- All fields pre-populated with existing recipe data
- Same sections as creation: basic info, categories, ingredients, steps
- Visual count feedback
- Update and Cancel buttons
- Real-time validation messages
- Unsaved changes warning on navigation
- Concurrent edit detection notification

**Key View Components**:
- Same form structure as Recipe Creation View
- Pre-populated text inputs, dropdowns, and selections
- Existing ingredients and steps loaded into dynamic rows
- Same add/remove/reorder controls
- Update button (instead of Save)
- Cancel button returns to recipe detail
- Confirmation dialog for unsaved changes
- Toast notification for concurrent edits
- Loading skeleton while fetching recipe data

**UX, Accessibility, and Security Considerations**:
- All creation view UX considerations apply
- Pre-populate all fields on component mount (loading state while fetching)
- Loading skeleton shows form structure while fetching data
- Edit form as separate route (`/recipes/:id/edit`) for clear URL state
- Update button: "Update Recipe" (vs "Save Recipe" in creation)
- On success: toast "Recipe updated successfully", redirect to recipe detail view
- Concurrent edit detection via localStorage events
- If another tab edits same recipe: toast "This recipe was modified in another tab. Refresh to see latest changes." with refresh button
- Unsaved changes warning same as creation view
- 404 handling if recipe not found or unauthorized
- Full replacement update (all ingredients/steps replaced, not merged)
- Optimistic update with rollback on error
- Cache invalidation on successful update
- Same accessibility considerations as creation view

---

## 3. User Journey Map

### 3.1 New User Registration Journey

```
1. User lands on Login page
   ↓
2. Clicks "Register" link
   ↓
3. Fills Registration form with username and password
   ↓ (real-time validation feedback)
4. Submits form
   ↓ (backend creates account + 6 categories + sample recipe)
5. Auto-redirected to Sample Recipe Detail view
   ↓ (welcome banner appears)
6. Reads sample recipe "Classic Chocolate Chip Cookies"
   ↓ (welcome message: "Welcome! Here's a sample recipe to get started. Try creating your own!")
7. Clicks navigation to Recipe List or "Add Recipe"
   ↓
8. Sees list with 1 sample recipe
   ↓
9. Clicks "Add Recipe" → Create Recipe view
```

---

### 3.2 Recipe Creation Journey

```
1. User on Recipe List view
   ↓
2. Clicks "Add Recipe" button (prominent, top-right or FAB)
   ↓
3. Navigates to /recipes/new (Create Recipe view)
   ↓
4. Fills title, selects difficulty, enters cooking time
   ↓ (real-time validation on blur)
5. Adds ingredients (min 1): clicks "+ Add Ingredient", fills quantity/unit/name
   ↓ (visual count feedback: "2 ingredients added (minimum 1 required)" in green)
6. Adds steps (min 2): fills text areas, uses ↑↓ arrows to reorder
   ↓ (character counter per step: "150/500")
7. Selects categories (min 1): clicks category chips
   ↓ (visual selection state)
8. Reviews form, clicks "Save Recipe"
   ↓ (client-side validation, show errors if invalid)
9. On valid submission → optimistic UI update
   ↓ (success toast appears immediately)
10. Redirects to Recipe Detail view for new recipe
    ↓ (cache invalidated)
11. User sees new recipe in detail view
```

---

### 3.3 Recipe Discovery Journey

```
1. User on Recipe List view with multiple recipes
   ↓
2. Enters search query in search bar (e.g., "chocolate")
   ↓ (300-500ms debounce delay)
3. Results filter in real-time, showing matching recipes
   ↓ (ARIA announces: "Showing 5 recipes")
4. Applies category filter: selects "Dessert" chip
   ↓ (results update immediately)
5. Applies difficulty filter: selects "Easy"
   ↓ (combined filters applied with AND logic)
6. Active filters shown as chips with X remove buttons
   ↓
7. Scrolls down to see more results
   ↓ (at 80-90% scroll threshold, triggers next page load)
8. Loading spinner appears at bottom
   ↓ (next 20 recipes loaded and appended)
9. Clicks recipe card
   ↓ (scroll position saved to sessionStorage)
10. Navigates to Recipe Detail view
    ↓
11. Clicks back button or breadcrumb
    ↓ (scroll position restored from sessionStorage)
12. Sees same list position, filters still active
```

---

### 3.4 Recipe Edit Journey

```
1. User viewing Recipe Detail
   ↓
2. Clicks "Edit" button
   ↓
3. Navigates to /recipes/:id/edit (Edit Recipe view)
   ↓ (loading skeleton while fetching)
4. Form pre-populated with existing data
   ↓
5. User modifies ingredients (adds, removes, or edits)
   ↓
6. User reorders steps with ↑↓ arrows
   ↓
7. User changes category selections
   ↓ (real-time validation feedback)
8. If concurrent edit detected in another tab:
   ↓ (localStorage event listener triggers)
   → Toast: "This recipe was modified in another tab. Refresh to see latest changes."
   → User clicks "Refresh" in toast → page reloads with latest data
9. User clicks "Update Recipe"
   ↓ (client-side validation)
10. On valid submission → optimistic UI update
    ↓ (success toast appears)
11. Redirects to Recipe Detail view
    ↓ (cache invalidated)
12. User sees updated recipe
```

---

### 3.5 Recipe Deletion Journey

```
1. User viewing Recipe Detail
   ↓
2. Clicks "Delete" button (with trash icon)
   ↓
3. Confirmation dialog appears
   → Message: "Are you sure you want to delete '[Recipe Title]'? This action cannot be undone."
   → Actions: [Cancel] [Delete]
   ↓
4. User clicks "Delete" button in dialog
   ↓ (optimistic deletion)
5. Immediately navigates to Recipe List
   ↓ (success toast appears: "Recipe deleted successfully")
6. Recipe removed from list
   ↓ (cache invalidated)
7. If deletion fails on backend:
   → Rollback: recipe restored in list
   → Error toast: "Failed to delete recipe. Please try again." with [Retry] button
```

---

### 3.6 Session Management Journey

```
1. User logs in
   ↓ (JWT stored in sessionStorage with 24-hour expiration)
2. JWT attached to all API requests via Axios interceptor
   ↓
3. Every API call checks token expiration
   ↓
4. 5-10 minutes before expiration:
   → Background silent token refresh triggered via setTimeout
   → New JWT stored in sessionStorage
   ↓
5. If token expires or refresh fails:
   → Automatic logout
   → sessionStorage cleared
   → Redirected to Login page
   → Toast: "Your session has expired. Please log in again."
   ↓
6. If 401 Unauthorized response received:
   → Axios response interceptor triggers logout
   → Same logout flow as above
```

---

## 4. Navigation Layout and Structure

### 4.1 Desktop Navigation (≥960px)

**Top App Bar** (fixed position, always visible)
- **Left Section**: Application logo/brand (links to `/recipes`)
- **Center Section**: Search input (always visible, full-width with max constraint)
  - Placeholder: "Search recipes..."
  - Debounced input (300-500ms)
  - Clear button (X) appears when text entered
- **Right Section**: 
  - User menu icon/avatar (dropdown with username and "Logout" option)

**Content Area**
- Filter bar (on Recipe List view only)
  - Category chips (multi-select)
  - Difficulty dropdown
  - "Clear All Filters" button (when filters active)
- Main content (recipe list, detail, forms)
- Back-to-top FAB (bottom-right, appears after scrolling >1 viewport height)

---

### 4.2 Mobile Navigation (0-959px)

**Top App Bar** (fixed position, always visible)
- **Left Section**: Hamburger menu icon (opens overlay drawer)
- **Center Section**: Application logo/brand
- **Right Section**: User icon (shows username, triggers user menu)

**Hamburger Menu** (Drawer overlay)
- Opens from left side with slide-in animation
- Semi-transparent backdrop (click to close)
- Close button (X) in top-right of drawer
- **Menu Contents**:
  - Search input (full-width within drawer)
  - Navigation links:
    - "My Recipes" (links to `/recipes`)
    - "Add Recipe" (links to `/recipes/new`)
  - Username display
  - "Logout" button at bottom

**Drawer Behavior**:
- Auto-closes on navigation to new route
- Explicit close via backdrop click or X button
- Swipe gesture to close (nice-to-have)
- Focus trap: Tab cycles through menu items
- Escape key closes drawer
- ARIA label: "Main navigation menu"

**Content Area**
- Same filter bar as desktop (on Recipe List view)
- Main content
- Back-to-top FAB (bottom-right, positioned for thumb access)

---

### 4.3 Global Navigation Elements

**Skip to Main Content Link**
- First focusable element on every page
- Visually hidden by default (visible on focus for keyboard users)
- Jumps focus to main content area
- ARIA label: "Skip to main content"

**Offline Indicator Banner**
- Persistent banner at top of page (below app bar)
- Appears when network goes offline
- Distinct background color (amber/orange)
- Message: "You're offline. Some features may not be available."
- Icon: WiFi off icon
- Dismissible (X button) but reappears on page navigation while still offline
- ARIA live region (polite)

**Toast Notification Container**
- Positioned top-right on desktop, top-center on mobile
- Stacks multiple toasts vertically
- Success toasts: Green background, checkmark icon, auto-dismiss 4-5 seconds
- Error toasts: Red background, error icon, manual dismiss for critical errors
- Info toasts: Blue background, info icon, auto-dismiss 4-5 seconds
- Action toasts: Include button (e.g., "Retry", "Refresh")
- ARIA live region (assertive for errors, polite for success)

---

### 4.4 Routing Structure

**Public Routes** (unauthenticated users)
- `/login` → Login View
- `/register` → Registration View
- Redirect: Any other route → `/login` if not authenticated

**Protected Routes** (authenticated users, require valid JWT)
- `/recipes` → Recipe List View (default landing page after login)
- `/recipes/new` → Recipe Creation View
- `/recipes/:id` → Recipe Detail View
- `/recipes/:id/edit` → Recipe Edit View
- Redirect: `/login` or `/register` → `/recipes` if already authenticated

**Global Route**
- `/` → Redirect to `/recipes` if authenticated, `/login` if not

**Route Protection Implementation**
- Protected route wrapper component checks JWT presence and expiration
- If invalid/missing: clear sessionStorage, redirect to `/login` with returnUrl query param
- On successful login: redirect to returnUrl or default `/recipes`

**Scroll Restoration**
- React Router's scroll restoration enabled
- Custom scroll position tracking for Recipe List → Detail → back to List
- Position saved in sessionStorage as `{path: '/recipes', scrollY: 1234}`
- On mount, check for saved position and restore via `window.scrollTo()`

---

## 5. Key Components

### 5.1 Layout Components

#### **AppShell**
- Wraps all views with consistent navigation structure
- Renders AppBar (desktop or mobile variant based on breakpoint)
- Renders main content area with proper ARIA landmarks
- Manages drawer state (open/close) for mobile
- Provides authentication context to children
- Displays offline indicator banner when network offline
- Renders toast notification container

#### **ProtectedRoute**
- Higher-order component wrapping protected views
- Checks JWT token presence and expiration
- Redirects to login if unauthenticated
- Extracts user info from JWT and provides via context
- Handles 401 responses globally via Axios interceptor

#### **AppBar (Desktop)**
- Fixed top navigation bar
- Logo, search input, user menu
- Material-UI AppBar and Toolbar components
- Sticky positioning

#### **AppBar (Mobile)**
- Hamburger icon, logo, user icon
- Triggers drawer open/close
- Compact layout

#### **Drawer (Mobile)**
- Overlay menu with backdrop
- Search, navigation links, logout
- Material-UI Drawer component
- Slide-in animation
- Focus trap
- Accessible close methods (backdrop, X, Escape)

---

### 5.2 Form Components

#### **RecipeForm**
- Shared between Create and Edit views
- Props: `initialValues` (empty for create, pre-populated for edit), `onSubmit`, `mode` (create/edit)
- React Hook Form integration
- Sections: Basic Info, Categories, Ingredients, Steps
- Dynamic ingredient and step arrays with validation
- Character counters and visual count feedback
- Unsaved changes detection
- Loading state prop for pre-population

#### **IngredientRow**
- Reusable component for single ingredient input
- Fields: quantity (text), unit (text), name (text)
- Delete button (X icon, disabled if only 1 row)
- Validation: all fields required, max lengths
- Props: `index`, `register`, `errors`, `onRemove`, `canRemove`

#### **StepRow**
- Reusable component for single step input
- Text area with character counter (max 500)
- Auto-numbered label (not editable)
- Up/down arrow buttons for reordering
- Delete button (disabled if only 2 steps)
- Props: `index`, `stepNumber`, `register`, `errors`, `onMoveUp`, `onMoveDown`, `onRemove`, `canMoveUp`, `canMoveDown`, `canRemove`

#### **CategorySelector**
- Chip-based multi-select component
- Displays all available categories as chips
- Selected state visually distinct (filled vs outlined)
- "Select All" / "Clear All" toggle
- Minimum 1 selection enforced
- Props: `categories`, `selectedIds`, `onChange`, `error`

#### **ConfirmDialog**
- Reusable confirmation modal
- Props: `open`, `title`, `message`, `onConfirm`, `onCancel`, `confirmText`, `cancelText`, `danger` (boolean for destructive actions)
- Material-UI Dialog component
- Focus management: focus on Cancel by default, Confirm for dangerous actions
- Escape key closes dialog (calls onCancel)
- Backdrop click closes dialog

---

### 5.3 Recipe Display Components

#### **RecipeCard**
- Displays recipe summary in list view
- Shows: title (h3), difficulty badge, cooking time, up to 2 categories with "...and X more"
- Entire card clickable (Link wrapper)
- Minimum 44x44px tap target
- Hover state on desktop, active state on mobile
- Expandable category section (inline expansion on click/tap)
- Props: `recipe` (id, title, difficulty, cookingTimeMinutes, categories array)

#### **DifficultyBadge**
- Color-coded badge: Green (Easy), Yellow (Medium), Red (Hard)
- Material-UI Chip component
- Props: `difficulty` (EASY, MEDIUM, HARD)
- ARIA label: "Difficulty: Easy" for screen readers

#### **RecipeMetadata**
- Displays difficulty badge, cooking time, categories
- Used in detail view
- Cooking time with clock icon
- Categories as read-only chips
- Props: `difficulty`, `cookingTimeMinutes`, `categories`

#### **IngredientList**
- Displays ingredients in detail view
- Formatted list: "quantity unit name" (e.g., "2 cups all-purpose flour")
- Semantic ul/li structure
- Props: `ingredients` (array with quantity, unit, name, sortOrder)

#### **StepList**
- Displays numbered steps in detail view
- Auto-numbered ol/li structure
- Clear typography for readability
- Props: `steps` (array with stepNumber, instruction)

---

### 5.4 Filter and Search Components

#### **SearchBar**
- Text input with debounce (300-500ms)
- Clear button (X) when text present
- Search icon
- Placeholder: "Search recipes..."
- Props: `value`, `onChange`, `placeholder`
- Debounce implemented with custom hook or lodash.debounce

#### **CategoryFilter**
- Chip-based multi-select for filtering
- Same UI as CategorySelector but allows 0 selections
- "Select All" / "Clear All" toggle
- Props: `categories`, `selectedIds`, `onChange`

#### **DifficultyFilter**
- Dropdown or chip-based single select
- Options: All, Easy, Medium, Hard
- Props: `value`, `onChange`

#### **FilterChips**
- Displays active filters as removable chips
- Each chip shows filter type and value (e.g., "Category: Dessert")
- X button on each chip to remove individual filter
- "Clear All Filters" button when any filter active
- Props: `activeFilters` (array), `onRemoveFilter`, `onClearAll`

---

### 5.5 Feedback Components

#### **ToastNotification**
- Wrapper around React Hot Toast
- Pre-configured success, error, info, and custom toast functions
- Auto-dismiss timing: 4-5 seconds for success/info, manual dismiss for critical errors
- Action button support for retry/refresh actions
- ARIA live region integration

#### **LoadingSpinner**
- Material-UI CircularProgress component
- Used during API calls and page loads
- Centered in container
- ARIA label: "Loading"

#### **LoadingSkeleton**
- Displays placeholder content during data fetch
- Variants for recipe list, recipe detail, form
- Material-UI Skeleton component
- Preserves layout to prevent content shift

#### **EmptyState**
- Displays when no content available
- Variants: "No recipes yet", "No search results", "No filtered results"
- Includes call-to-action button (e.g., "Create your first recipe")
- Illustrative icon (optional)
- Props: `variant`, `message`, `actionText`, `onAction`

#### **ErrorState**
- Displays on error (recipe not found, network error, etc.)
- Shows error message and retry button
- Props: `message`, `onRetry`

---

### 5.6 Utility Components

#### **BackToTopFab**
- Floating action button (FAB) positioned bottom-right
- Appears when scrolled down >1 viewport height
- Smooth scroll to top on click
- Material-UI Fab component with up arrow icon
- ARIA label: "Scroll to top"
- Positioned for mobile thumb access

#### **OfflineIndicator**
- Banner displayed at top when offline
- Amber/orange background, WiFi off icon
- Message: "You're offline. Some features may not be available."
- Dismissible with X button
- Reappears on navigation while offline
- ARIA live region (polite)

#### **WelcomeBanner**
- Displayed on sample recipe detail view for new users
- Message: "Welcome! Here's a sample recipe to get started. Try creating your own!"
- Dismissible
- Material-UI Alert component
- Stored in localStorage to not show again after dismissal

---

### 5.7 Authentication Components

#### **LoginForm**
- Username and password inputs
- Submit button
- Link to registration
- Form validation
- Loading state during submission
- Error display (toast or inline)

#### **RegisterForm**
- Username input with character counter (3-50)
- Password input with character counter (min 6)
- Real-time validation feedback
- Submit button
- Link to login
- Loading state during submission

#### **UserMenu**
- Dropdown menu from user icon/avatar
- Displays username
- "Logout" option
- Material-UI Menu component
- Opens on click, closes on selection or outside click

---

## 6. Data Flow and State Management

### 6.1 Global State (React Context)

**AuthContext**
- Provides: `user` (userId, username), `token`, `isAuthenticated`, `login()`, `logout()`, `register()`
- Stored in sessionStorage: JWT token
- Persisted across page refreshes
- Cleared on logout or token expiration

**API State**
- No global state for recipe data (fetched per-view)
- Client-side cache: recipe list cached with timestamp
- Cache invalidation on mutations (create, update, delete)

### 6.2 Local Component State

**Recipe List View**
- `recipes` (array)
- `searchQuery` (string)
- `categoryFilters` (array of IDs)
- `difficultyFilter` (EASY | MEDIUM | HARD | null)
- `currentPage` (number)
- `hasMore` (boolean)
- `loading` (boolean)
- `error` (string | null)

**Recipe Detail View**
- `recipe` (object)
- `loading` (boolean)
- `error` (string | null)

**Recipe Form (Create/Edit)**
- Managed by React Hook Form
- `formState` (values, errors, isDirty, isSubmitting)
- `unsavedChanges` (boolean, derived from isDirty)

### 6.3 API Client Architecture

**Axios Instance** (centralized)
- Base URL: `http://localhost:8080/api/v1`
- Request interceptor: attach JWT token from sessionStorage
- Response interceptor: handle 401 (logout), standardize error format
- Timeout: 10 seconds

**Error Handling**
- Network errors: show offline indicator + error toast
- 401 Unauthorized: automatic logout, redirect to login
- 400 Validation: map errors to form fields
- 403 Forbidden: error toast "Access denied"
- 404 Not Found: error state component
- 500 Server Error: error toast with retry button

### 6.4 Optimistic Updates Pattern

1. User triggers action (create, update, delete)
2. Update UI immediately (optimistic)
3. Make API call in background
4. On success: confirm update, show success toast, invalidate cache
5. On failure: rollback UI to previous state, show error toast with retry button

**Example: Delete Recipe**
```javascript
const handleDelete = async (recipeId) => {
  // 1. Show confirmation dialog
  const confirmed = await confirmDialog("Delete this recipe?");
  if (!confirmed) return;

  // 2. Optimistic deletion
  navigate('/recipes'); // immediate navigation
  showToast('success', 'Recipe deleted successfully');

  // 3. API call
  try {
    await deleteRecipe(recipeId);
    invalidateCache(); // cache cleared
  } catch (error) {
    // 4. Rollback on error
    navigate(`/recipes/${recipeId}`); // back to detail
    showToast('error', 'Failed to delete recipe', { 
      action: { label: 'Retry', onClick: () => handleDelete(recipeId) }
    });
  }
};
```

---

## 7. Responsive Design Strategy

### 7.1 Breakpoints (Material-UI defaults)

- **xs (extra-small)**: 0-599px (mobile)
- **sm (small)**: 600-959px (large mobile / small tablet)
- **md (medium)**: 960-1279px (tablet / small desktop)
- **lg (large)**: 1280-1919px (desktop)
- **xl (extra-large)**: 1920px+ (large desktop)

### 7.2 Mobile Optimizations (0-599px)

**Navigation**
- Hamburger menu with drawer
- Search collapsed into drawer
- Compact app bar

**Recipe List**
- Single column layout
- Full-width recipe cards
- Larger tap targets (minimum 44x44px)
- Filters stacked vertically
- Back-to-top FAB positioned for thumb (bottom-right)

**Recipe Detail**
- Single column layout
- Larger, readable font sizes (18px+ body text)
- Ingredients and steps well-spaced
- Action buttons full-width or large enough for easy tapping

**Forms**
- Single column layout
- Full-width inputs
- Larger touch targets for buttons and chips
- Ingredient/step rows stack fields vertically if needed
- On-screen keyboard considerations (input types: text, number)

### 7.3 Tablet Optimizations (600-959px)

**Navigation**
- May use drawer or full top bar depending on design
- Search may be visible in top bar

**Recipe List**
- 2-column grid for recipe cards
- Filters in horizontal row

**Forms**
- 2-column layout for some sections (e.g., quantity/unit side by side)
- Ingredients row: quantity | unit | name in single row

### 7.4 Desktop Enhancements (960px+)

**Navigation**
- Full top bar with search always visible
- User menu in top-right
- No hamburger menu

**Recipe List**
- 3-4 column grid for recipe cards
- Filters in horizontal row with more spacing
- Hover states on cards

**Recipe Detail**
- 2-column layout possible: ingredients on left, steps on right (optional)
- Sidebar for metadata (optional)

**Forms**
- 2-column layout for basic info section
- Ingredients row: all fields in single row
- Steps side by side (optional)

### 7.5 Responsive Patterns

- **CSS Grid / Flexbox** for layouts
- **Mobile-first media queries**: start with mobile styles, enhance for larger screens
- **Fluid typography**: clamp() or responsive units for scaling text
- **Component library responsive components**: Material-UI handles most responsive behavior
- **Conditional rendering**: use MediaQuery hooks to show/hide components based on screen size

---

## 8. Accessibility Requirements (WCAG 2.1 Level AA)

### 8.1 Semantic HTML
- Use proper heading hierarchy (h1 → h2 → h3)
- nav, main, article, section landmarks
- ul/ol for lists (ingredients, steps, recipe cards)
- button for actions, a for links
- form, label, input proper associations

### 8.2 ARIA Labels and Roles
- ARIA landmarks: `role="navigation"`, `role="main"`, `role="search"`
- ARIA labels for icon-only buttons: `aria-label="Delete recipe"`
- ARIA live regions for dynamic content: search results count, toast notifications
- ARIA expanded/collapsed for hamburger menu and expandable categories
- ARIA hidden for decorative icons

### 8.3 Keyboard Navigation
- Tab order logical and intuitive
- All interactive elements keyboard-accessible
- Enter/Space to activate buttons and links
- Escape to close modals, dialogs, drawer
- Arrow keys for menu navigation (nice-to-have)
- Form submission via Enter in text inputs
- Skip to main content link (first focusable)

### 8.4 Focus Management
- Visible focus indicators (outline or ring)
- Focus trap in modals and dialogs
- Focus returns to trigger element on modal close
- Focus moves to main heading on route change
- Focus on first invalid field on form error

### 8.5 Color Contrast
- Text: minimum 4.5:1 contrast ratio
- Large text (18px+): minimum 3:1
- UI components: minimum 3:1
- Difficulty badges: ensure text readable on colored backgrounds

### 8.6 Screen Reader Support
- All images have alt text (when images added in future)
- Form validation errors announced via ARIA live regions
- Loading states announced: "Loading recipes"
- Toast notifications announced: aria-live="assertive" for errors, "polite" for success
- Recipe count announced: "Showing 20 recipes"
- State changes announced: "Filter applied: Category Dessert"

### 8.7 Accessible Form Design
- Labels associated with inputs (for attribute)
- Required fields marked (visually and programmatically)
- Error messages clear and specific
- Field-level errors associated with inputs (aria-describedby)
- Instructions and help text associated with fields

---

## 9. Security Considerations

### 9.1 Authentication Security
- JWT stored in sessionStorage (XSS risk mitigated by React's escaping)
- Token expiration enforced (24 hours)
- Automatic logout on expiration or 401 response
- Automatic token refresh 5-10 minutes before expiration
- No sensitive data in JWT payload (only userId and username)

### 9.2 Client-Side Input Security
- React's automatic XSS protection via escaping
- No use of `dangerouslySetInnerHTML`
- Client-side validation matches server-side rules
- User-generated content (recipe text) automatically escaped

### 9.3 API Security
- JWT attached to all protected API requests
- CORS configured: allow localhost:3000 (dev) or specific origin (prod)
- HTTPS in production (not applicable for local MVP)
- Protected routes enforce JWT validation
- 401 responses trigger immediate logout

### 9.4 CSRF Protection
- JWT in Authorization header (not cookie) provides CSRF protection
- Stateless authentication (no session cookies)

### 9.5 Content Security
- No third-party scripts or CDNs (all dependencies bundled)
- No external API calls (fully self-contained)
- No user-uploaded files in MVP (XSS risk eliminated)

---

## 10. Performance Optimizations

### 10.1 Loading Performance
- Code splitting by route (React.lazy + Suspense)
- Lazy load non-critical components (e.g., ConfirmDialog)
- Simple loading spinners (no heavy animations)
- Vite for fast builds and hot module replacement

### 10.2 Runtime Performance
- Debounced search (300-500ms) reduces API calls
- Optimistic UI updates for perceived speed
- React.memo for expensive components (RecipeCard)
- useMemo for expensive computations (filtered recipe lists)
- useCallback for event handlers passed to children
- Infinite scroll with pagination (load 20 at a time)
- Client-side caching with 5-minute TTL

### 10.3 Network Performance
- Axios request cancellation for stale requests (search)
- Cache invalidation strategy prevents unnecessary fetches
- Token refresh in background (non-blocking)
- Gzip compression (handled by server)

### 10.4 Bundle Size Optimization
- Tree shaking via Vite
- Import only needed Material-UI components
- Avoid large dependencies (no drag-and-drop libraries in MVP)
- Lazy load routes

---

## 11. Error Handling Strategy

### 11.1 Error Categories and Display

**Network Errors** (offline, timeout)
- Display: Offline indicator banner + error toast
- Recovery: Retry button in toast
- Persistence: Banner persists until online

**Validation Errors** (400 Bad Request)
- Display: Field-level inline messages (red text below input) + toast for form-level errors
- Recovery: User corrects input, real-time revalidation
- Persistence: Manual dismiss for toast, inline clears on correction

**Authentication Errors** (401 Unauthorized)
- Display: Automatic logout, redirect to login, toast "Session expired"
- Recovery: User logs in again
- Persistence: Toast auto-dismiss after redirect

**Authorization Errors** (403 Forbidden)
- Display: Error toast "Access denied"
- Recovery: Navigate to recipe list
- Persistence: Manual dismiss

**Not Found Errors** (404)
- Display: Error state component in view "Recipe not found"
- Recovery: Link/button to return to recipe list
- Persistence: Remains until navigation

**Server Errors** (500 Internal Server Error)
- Display: Error toast with message and retry button
- Recovery: Retry action or manual refresh
- Persistence: Manual dismiss

**Client Errors** (React errors)
- Display: Error boundary catches, shows friendly fallback UI
- Recovery: "Return to homepage" button, or automatic retry
- Persistence: Until page reload or navigation

### 11.2 Error Recovery Patterns

**Retry Button**
- Available on: Network errors, server errors, failed optimistic updates
- Action: Re-attempt the failed API call
- Feedback: Show loading state during retry, success/error toast on result

**Rollback on Failure**
- Used in optimistic updates
- Revert UI to previous state
- Show error toast with explanation and retry option

**Automatic Retry**
- Token refresh: max 3 attempts with exponential backoff
- Other operations: no automatic retry (user-initiated only)

**Cache Invalidation**
- On error: retain cached data, show error indicator
- On success: invalidate cache for fresh data

### 11.3 Error Message Guidelines

- **Clear and specific**: "Failed to delete recipe" not "An error occurred"
- **Actionable**: "Check your connection and try again"
- **Non-technical**: Avoid error codes or stack traces in user-facing messages
- **Consistent tone**: Friendly, helpful, professional
- **Examples**:
  - Success: "Recipe created successfully"
  - Error: "Failed to create recipe. Please check all required fields."
  - Network: "No internet connection. Please check your network and try again."
  - Auth: "Your session has expired. Please log in again."

---

## 12. Testing Strategy (MVP Scope)

### 12.1 Manual Testing Focus

**Critical User Flows**
1. Register new account → see welcome + sample recipe
2. Login with existing account → see recipe list
3. Create recipe with multiple ingredients and steps → success
4. Search for recipe by title → results filter correctly
5. Filter by category and difficulty → combined filters work
6. View recipe detail → all data displayed correctly
7. Edit recipe → changes saved correctly
8. Delete recipe → confirmation + removal
9. Logout → session cleared, redirect to login
10. Token expiration → automatic logout

**Cross-Browser Testing**
- Chrome (latest) - primary
- Firefox (latest)
- Safari (latest)
- Mobile Safari (iOS) - critical
- Chrome Mobile (Android) - critical

**Responsive Testing**
- Mobile: iPhone SE (320px), iPhone 12 (390px), Pixel 5 (393px)
- Tablet: iPad (768px), iPad Pro (1024px)
- Desktop: 1280px, 1920px

**Accessibility Testing**
- Keyboard navigation (Tab, Enter, Escape)
- Screen reader basics (VoiceOver on Mac/iOS, NVDA on Windows)
- Focus indicators visible
- Color contrast checks (browser DevTools)

### 12.2 Automated Testing (Minimal for MVP)

**Unit Tests** (if time permits)
- API client utility functions (Axios interceptors)
- Form validation logic (custom validators)
- Authentication helpers (JWT decode, expiration check)
- Custom hooks (useDebounce, useLocalStorage, etc.)

**Component Tests** (deferred to post-MVP)
- RecipeCard rendering
- Form components (IngredientRow, StepRow)
- Filters (CategoryFilter, DifficultyFilter)
- Toast notifications

**E2E Tests** (deferred to post-MVP)
- Full user journeys with Cypress or Playwright

### 12.3 Post-MVP Testing Expansion
- Comprehensive component testing with React Testing Library
- E2E testing for critical flows
- Visual regression testing
- Accessibility audits with axe-core
- Performance testing with Lighthouse
- Load testing (when scaling beyond 5 users)

---

## 13. Implementation Roadmap

### Phase 1: Foundation (Day 1)
**Goal**: Project setup, authentication, routing, API client

- Vite + React project setup
- Material-UI installation and theme configuration
- React Router setup with protected routes
- Axios instance with interceptors
- AuthContext implementation
- Login and Registration views (UI + functionality)
- sessionStorage integration for JWT
- Protected route wrapper component
- Toast notification setup

**Deliverable**: Working login/registration with JWT authentication

---

### Phase 2: Core Features (Day 2)
**Goal**: Recipe list, detail, navigation

- AppShell component (AppBar, Drawer for mobile)
- Recipe List view
  - Fetch recipes API call
  - RecipeCard component
  - Infinite scroll pagination
  - Loading states and empty state
- Recipe Detail view
  - Fetch single recipe API call
  - Display ingredients and steps
  - Edit and Delete buttons (non-functional)
- Navigation between list and detail
- Scroll position restoration
- Client-side caching implementation

**Deliverable**: Browse recipes, view details, navigate smoothly

---

### Phase 3: CRUD Operations (Day 3)
**Goal**: Create, edit, delete recipes with forms

- RecipeForm component (shared for create/edit)
- React Hook Form integration
- IngredientRow and StepRow components
- CategorySelector component
- Recipe Creation view
  - Form validation
  - API integration (POST /recipes)
  - Redirect to detail on success
- Recipe Edit view
  - Pre-populate form
  - API integration (PUT /recipes/:id)
  - Unsaved changes warning
- Recipe Deletion
  - ConfirmDialog component
  - API integration (DELETE /recipes/:id)
  - Optimistic update + rollback

**Deliverable**: Full CRUD functionality for recipes

---

### Phase 4: Search, Filters, Polish (Day 4)
**Goal**: Discovery features, final polish, testing

- SearchBar component with debounce
- Category and Difficulty filters
- Filter chips with remove functionality
- "Clear All Filters" button
- Combined filter logic (API integration)
- Toast notifications for all actions
- Loading states refinement
- Mobile responsiveness verification
- Back-to-top FAB
- Accessibility review (keyboard nav, focus management, ARIA labels)
- Manual testing of all user flows
- Cross-browser testing
- Bug fixes and polish

**Deliverable**: Complete MVP ready for deployment

---

## 14. Post-MVP Enhancements (Future Considerations)

### 14.1 Feature Enhancements
1. Recipe images (upload, display)
2. Drag-and-drop step/ingredient reordering
3. Custom category creation
4. Recipe sharing and public recipes
5. Favorites/bookmarking
6. Recipe duplication
7. Advanced search (by ingredients, cooking time range)
8. Recipe collections/folders
9. Print-friendly view
10. Dark mode theme
11. Nutritional information
12. Serving size scaling
13. Shopping list generation
14. Recipe import/export (JSON, RecipeML)
15. Meal planning calendar

### 14.2 Technical Improvements
1. Comprehensive test coverage (80%+ for components)
2. E2E testing with Cypress
3. Performance monitoring and optimization
4. Analytics integration (Google Analytics, Mixpanel)
5. Error logging (Sentry, LogRocket)
6. Progressive Web App (PWA) features
7. Service worker for offline caching
8. Backend pagination performance analysis
9. Security audit and penetration testing
10. WCAG 2.1 AAA compliance review

---

**END OF DOCUMENT**
