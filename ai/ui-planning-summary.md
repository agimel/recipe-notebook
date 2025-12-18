# UI Architecture Planning Summary

**Version**: 1.0  
**Date**: December 18, 2025  
**Status**: Ready for Implementation

---

## Conversation Summary

<conversation_summary>

### Decisions

1. **Authentication Flow**: Implement automatic JWT token refresh 5-10 minutes before expiration using a silent background refresh mechanism with setTimeout that checks token expiration on app load and after each successful API call

2. **Pagination Strategy**: Use infinite scroll triggered when user scrolls to 80-90% of current content, with loading spinner at bottom during fetch

3. **Category Filtering**: Chip-based selection with "Select All" option, showing selected state with individual X buttons to remove

4. **Search Placement**: Search input always visible in top navigation bar on desktop, collapsed into hamburger menu on mobile

5. **Mobile Navigation**: Hamburger menu that overlays content with semi-transparent backdrop, closing automatically on navigation but allowing explicit close via backdrop click or X button

6. **Toast Notifications**: Auto-dismiss after 4-5 seconds for success messages and non-critical errors; require manual dismissal for critical errors (validation failures, server errors)

7. **Scroll Restoration**: Use React Router's scroll restoration feature or implement custom scroll position tracking in sessionStorage to restore exact position when navigating back from recipe detail

8. **Optimistic UI**: Implement optimistic updates with rollback on failure - immediately show error toast with "Retry" action button while reverting UI to previous state

9. **Category Display**: Expandable category section as inline expansion within recipe card (add "...and 2 more" text that expands to show all categories)

10. **Form Validation**: Real-time revalidation on blur and onChange after initial blur event for immediate feedback when correcting errors

11. **Offline Indicator**: Minimalist persistent banner at top of page with distinct background color and icon

12. **Concurrent Edits**: Use localStorage events to detect concurrent edits across tabs, showing toast notification with "Refresh to see latest changes" message and refresh button

13. **Post-Registration Flow**: Redirect users to sample recipe detail view with highlighted welcome banner/toast: "Welcome! Here's a sample recipe to get started. Try creating your own!"

14. **Form Count Feedback**: Visual feedback showing count status (e.g., "1 ingredient added (minimum 1 required)") with color coding - red when below minimum, green when valid

15. **Step Reordering**: Skip drag-and-drop for MVP simplicity; use simple up/down arrow buttons for reordering steps

16. **Edit Mode**: Implement as separate `/recipes/:id/edit` route for simpler implementation with clear URL state

17. **Back to Top**: Add floating action button (FAB) appearing after scrolling down more than one viewport height, positioned bottom-right for mobile thumb access

18. **Client-Side Caching**: Implement recipe list caching with timestamps, invalidating cache after 5 minutes or after create/update/delete operations

19. **Difficulty Badges**: Color-coded badges throughout (green/Easy, yellow/Medium, red/Hard) for quick visual scanning

20. **Layout Simplicity**: No footer for MVP - maximize content area for recipes

21. **Filter Management**: Add "Clear All Filters" button when any filter is active, positioned prominently next to filter chips

22. **Creation Feedback**: Skip visual highlight/animation on newly created recipes - success toast + navigation provides sufficient feedback

23. **Search Simplicity**: No search history or recent searches - simple input with clear placeholder and X button

24. **Recipe Card Interaction**: Entire recipe card clickable for navigation using proper semantic HTML (minimum 44x44px tap target)

25. **Accessibility**: Implement visually-hidden "Skip to main content" link as first focusable element

### Matched Recommendations

1. **Protected Route Architecture**: Implement protected route wrapper component that checks JWT token in sessionStorage and redirects unauthenticated users to login

2. **Centralized API Client**: Create Axios instance with request/response interceptors to automatically attach JWT tokens, handle 401 errors, and standardize error handling

3. **State Management**: Use React Context API for global state (user info, JWT token) - avoid Redux overhead for MVP

4. **Mobile-First Design**: Design mobile-first responsive layout with touch-friendly tap targets (44x44px minimum) and readable typography, given PRD emphasis on mobile usage while cooking

5. **Consistent Toast System**: Use React Hot Toast for all success messages and non-critical errors as specified in PRD

6. **Reusable Form Components**: Create reusable components for ingredients and steps with dynamic addition/removal and validation

7. **Form Library**: Use React Hook Form with schema validation (Yup/Zod) to match backend Hibernate Validator rules

8. **Debounced Search**: Implement 300-500ms debounce delay to avoid excessive API calls while typing

9. **Routing Structure**: Match API endpoints logically: `/login`, `/register`, `/recipes`, `/recipes/:id`, `/recipes/new`, `/recipes/:id/edit`

10. **Error Boundaries**: Create consistent error boundary component to catch React errors and display user-friendly messages

11. **Filter Visual Design**: Design category and difficulty filters with visual indication of active state and clear affordance to remove them

12. **Loading States**: Implement proper loading states with simple spinners for all data fetching operations

13. **Component Library Consistency**: Use Material-UI or Ant Design consistently throughout for design coherence and accessible pre-built components

14. **Responsive Navigation**: Adapt navigation between desktop (top bar) and mobile (hamburger menu) to optimize screen real estate

15. **Semantic HTML & ARIA**: Implement proper semantic HTML and ARIA labels for screen reader compatibility and keyboard navigation

16. **Recipe Detail Layout**: Design with clear visual hierarchy - title/metadata at top, ingredients section, then steps section - optimized for scanning while cooking

17. **Readable Recipe Display**: Structure ingredients and steps with proper spacing and typography for readability at arm's length on mobile devices

18. **Client-Side Validation**: Match server-side validation rules exactly (character limits, required fields, minimum counts) for immediate feedback

19. **Unified Layout Component**: Create application shell/layout component handling authenticated state, navigation, and content area

20. **Empty States**: Plan for empty states in all list views with clear calls-to-action (no recipes, no search results, no filtered results)

### UI Architecture Planning Summary

#### Overview

The Recipe Notebook MVP UI will be a single-page React application with client-side routing, optimized for mobile-first usage while cooking. The architecture prioritizes simplicity, performance, and accessibility within a 3-4 day development timeline.

#### Key Views & Screens

**Public Views (Unauthenticated)**
1. **Login Page** (`/login`)
   - Username and password inputs with validation
   - Submit button and link to registration
   - Error messages for invalid credentials

2. **Registration Page** (`/register`)
   - Username (3-50 chars) and password (min 6 chars) inputs
   - Real-time validation feedback
   - Auto-redirect to sample recipe detail after successful registration

**Protected Views (Authenticated)**
3. **Recipe List Page** (`/recipes`)
   - Top navigation bar with search input (desktop) and hamburger menu (mobile)
   - Filter bar with chip-based category selection and difficulty dropdown
   - "Clear All Filters" button when filters active
   - Infinite scroll with loading spinner at 80-90% scroll threshold
   - Recipe cards showing: title, up to 2 categories with expandable "...and X more", difficulty badge (color-coded), cooking time
   - Empty state with call-to-action for new users
   - Back to top FAB appearing after scrolling down
   - Entire card clickable with minimum 44x44px tap target

4. **Recipe Detail Page** (`/recipes/:id`)
   - Title, color-coded difficulty badge, cooking time
   - All assigned categories displayed
   - Ingredients list with quantity, unit, and name
   - Numbered steps display (auto-numbered)
   - Edit button navigating to `/recipes/:id/edit`
   - Delete button with confirmation dialog
   - Optimized layout for reading while cooking (mobile)
   - Welcome banner/toast for sample recipe post-registration

5. **Recipe Creation Page** (`/recipes/new`)
   - Form with title input (max 100 chars)
   - Difficulty dropdown (Easy/Medium/Hard)
   - Cooking time input (minutes)
   - Reusable ingredient form component (add/remove, min 1)
   - Reusable step form component (add/remove/reorder with arrows, min 2)
   - Category selection (chip-based, min 1)
   - Visual count feedback with color coding (red/green)
   - Real-time validation on blur + onChange after blur
   - Confirmation dialog on unsaved changes
   - Success toast on save, redirect to detail view

6. **Recipe Edit Page** (`/recipes/:id/edit`)
   - Same form as creation, pre-populated with existing data
   - Same validation and interaction patterns
   - Success toast on save, redirect to detail view

#### Navigation Structure

**Desktop Navigation**
- Top app bar with:
  - Logo/brand on left
  - Search input in center (always visible)
  - User menu/logout on right
  - Links to main sections

**Mobile Navigation**
- Top app bar with:
  - Hamburger menu icon (left)
  - Logo/brand (center)
  - User icon (right)
- Hamburger opens overlay menu with:
  - Search input
  - Navigation links
  - Logout option
  - Semi-transparent backdrop
  - Auto-close on navigation
  - Explicit close via backdrop/X button

**Global Elements**
- Skip to main content link (visually hidden, first focusable)
- Offline indicator banner (when offline)
- Toast notification container (success/error messages)

#### User Flows

**New User Registration Flow**
1. Land on login page → click "Register"
2. Fill registration form with validation feedback
3. Submit → backend creates account + 6 categories + sample recipe
4. Auto-redirect to sample recipe detail view
5. See welcome banner: "Welcome! Here's a sample recipe to get started. Try creating your own!"
6. Explore sample recipe → click "Add Recipe" to create first recipe

**Recipe Creation Flow**
1. Click "Add Recipe" button from recipe list
2. Navigate to `/recipes/new`
3. Fill form with real-time validation
4. Add ingredients (min 1) with visual count feedback
5. Add steps (min 2) with reordering arrows
6. Select categories (min 1) via chips
7. Submit → optimistic UI update
8. Success toast appears
9. Redirect to recipe detail view
10. Cache invalidated, recipe list refreshed

**Recipe Discovery Flow**
1. View recipe list (paginated infinitely)
2. Enter search query (debounced 300-500ms)
3. Apply category filters (chip-based, multiple selection)
4. Apply difficulty filter (dropdown)
5. See filtered results with active filter chips
6. Click "Clear All Filters" to reset
7. Scroll down → auto-load more at 80-90% threshold
8. Click recipe card → navigate to detail view
9. Scroll position saved in sessionStorage
10. Navigate back → scroll position restored

**Recipe Edit Flow**
1. View recipe detail
2. Click "Edit" button
3. Navigate to `/recipes/:id/edit`
4. Form pre-populated with existing data
5. Make changes with validation
6. Submit → optimistic update
7. If concurrent edit detected (localStorage event) → show toast "Refresh to see latest changes"
8. Success toast + redirect to detail view
9. Cache invalidated

**Recipe Deletion Flow**
1. View recipe detail
2. Click "Delete" button
3. Confirmation dialog appears (custom UI component)
4. Confirm → optimistic update
5. Success toast + redirect to recipe list
6. Cache invalidated

#### API Integration Strategy

**Authentication Layer**
- JWT token stored in sessionStorage
- Axios interceptor attaches `Authorization: Bearer <token>` header to all requests
- Automatic token refresh 5-10 minutes before expiration
- setTimeout checks expiration on app load and after each API call
- 401 response triggers logout and redirect to login

**State Management**
- React Context API for global state:
  - Authenticated user info
  - JWT token and expiration
  - Loading states
  - Error states
- Local component state for form data and UI interactions
- Client-side cache for recipe list (timestamps, 5-minute TTL)
- Cache invalidation on create/update/delete operations

**API Client Architecture**
- Centralized Axios instance with base URL configuration
- Request interceptor: attach JWT, set content-type
- Response interceptor: handle 401 (logout), standardize errors
- Debounced search wrapper (300-500ms)
- Optimistic update pattern with rollback on error

**Data Flow**
1. Component triggers action (e.g., create recipe)
2. Optimistic UI update (instant feedback)
3. API call via centralized client
4. On success: confirm update, show success toast, invalidate cache
5. On failure: rollback UI, show error toast with "Retry" button
6. Cache refreshed on next list view

#### Responsiveness Strategy

**Breakpoints** (Material-UI/Ant Design defaults)
- Mobile: 0-600px
- Tablet: 600-960px
- Desktop: 960px+

**Mobile Optimizations**
- Touch-friendly tap targets (minimum 44x44px)
- Readable font sizes (minimum 16px for body text)
- Hamburger navigation with overlay
- Search collapsed into menu
- Larger form inputs for easier touch input
- Recipe detail optimized for arm's length reading
- Back to top FAB for easy navigation

**Tablet Adaptations**
- Hybrid navigation (may show full top bar)
- Optimized recipe card grid layout
- Form inputs adapt to available space

**Desktop Enhancements**
- Full top navigation bar with search always visible
- Multi-column recipe card grid
- Hover states for interactive elements
- Keyboard shortcuts support

**Responsive Patterns**
- CSS Grid/Flexbox for layout
- Mobile-first media queries
- Fluid typography (clamp or responsive units)
- Responsive images (if added later)
- Component library responsive components

#### Accessibility Requirements

**WCAG 2.1 Level AA Compliance**
- Semantic HTML5 elements (nav, main, section, article)
- ARIA labels for interactive elements without text
- Skip to main content link (first focusable)
- Keyboard navigation support (tab order, enter/space activation)
- Focus indicators visible on all interactive elements
- Color contrast ratio minimum 4.5:1 for text
- Form labels associated with inputs
- Error messages announced to screen readers
- Toast notifications with appropriate ARIA live regions

**Keyboard Navigation**
- Tab through all interactive elements
- Enter/Space to activate buttons/links
- Escape to close modals/dialogs
- Arrow keys for menu navigation (hamburger)
- Form submission via Enter key

**Screen Reader Support**
- All images have alt text (when added)
- Form validation errors announced
- Loading states announced
- Success/error toasts announced via ARIA live regions
- Recipe count announcements ("Showing 20 recipes")

**Focus Management**
- Focus trap in modals/dialogs
- Focus returns to trigger element on modal close
- Focus moved to main content on route change
- Visual focus indicators (outline/ring)

#### Security Considerations

**Client-Side Security**
- JWT stored in sessionStorage (XSS risk mitigated by React's escaping)
- Token expiration enforced (24 hours)
- Automatic logout on token expiration
- Sensitive data not stored in localStorage
- Input sanitization via React's built-in XSS protection
- Client-side validation matching server-side rules

**CORS Configuration**
- Development: Allow localhost:3000 (React) and localhost:8080 (Spring)
- Production: Restrict to specific origin

**Protected Routes**
- Route wrapper checks token presence and validity
- Redirect to login if unauthenticated
- 401 responses trigger automatic logout

**Form Security**
- Client-side validation prevents basic injection attempts
- Server-side validation as final authority
- CSRF protection via JWT (stateless)

**Content Security**
- React's automatic escaping prevents XSS
- No `dangerouslySetInnerHTML` usage
- User-generated content (recipe text) escaped automatically

#### Performance Optimizations

**Loading Performance**
- Code splitting by route (React.lazy + Suspense)
- Lazy load non-critical components
- Simple loading spinners (no heavy animations)
- Debounced search (300-500ms) reduces API calls
- Client-side caching with 5-minute TTL

**Runtime Performance**
- Infinite scroll with virtual scrolling (if list grows large)
- Optimistic UI updates for perceived speed
- Memoization of expensive computations (React.memo, useMemo)
- Throttled scroll listeners for back-to-top and infinite scroll

**Network Performance**
- Axios request cancellation for stale requests
- Cache invalidation strategy prevents unnecessary fetches
- Token refresh in background (no blocking)

**Bundle Size**
- Tree shaking via Vite
- Use only needed components from Material-UI/Ant Design
- Avoid large dependencies (no drag-and-drop libraries)

#### Error Handling Strategy

**Error Categories**
1. **Network Errors**: Offline indicator banner + toast notification
2. **Validation Errors**: Field-level inline messages + manual dismiss toast
3. **Authentication Errors**: Automatic logout + redirect to login
4. **Server Errors**: Toast with error message + retry option
5. **Client Errors**: Error boundary catches React errors

**Error Display Patterns**
- **Field Validation**: Inline below input, red text/border
- **Form Validation**: Toast notification (manual dismiss) + field-level
- **API Errors**: Toast notification with "Retry" button
- **Network Offline**: Persistent banner at top
- **Concurrent Edit**: Toast with "Refresh to see latest changes"
- **React Errors**: Error boundary shows friendly fallback UI

**Error Recovery**
- Retry buttons on recoverable errors
- Rollback optimistic updates on failure
- Clear error states on successful retry
- Automatic retry for token refresh failures (max 3 attempts)

#### Component Library Selection

**Recommended: Material-UI (MUI)**

**Rationale**
- Comprehensive component set for all UI needs
- Built-in accessibility (ARIA labels, keyboard nav)
- Excellent mobile responsiveness
- Customizable theming
- Active community and documentation
- Smaller learning curve than Ant Design

**Key Components to Use**
- AppBar, Toolbar (navigation)
- Drawer (hamburger menu)
- TextField (form inputs)
- Button, IconButton (actions)
- Chip (category filters)
- Select, MenuItem (dropdowns)
- Card, CardContent (recipe cards)
- Dialog (confirmations)
- Snackbar (can integrate with React Hot Toast)
- CircularProgress, LinearProgress (loading)
- Fab (floating action button for back to top)
- Badge (difficulty badges)

**Alternative: Ant Design**
- More opinionated design
- Rich component set
- Good for business applications
- Slightly larger bundle size

#### Testing Strategy (MVP Scope)

**Manual Testing Focus**
- Critical user flows (registration, login, CRUD operations)
- Cross-browser testing (Chrome, Firefox, Safari)
- Mobile responsiveness (iOS Safari, Chrome Android)
- Accessibility testing (keyboard navigation, screen reader basics)

**Automated Testing (Minimal for MVP)**
- API client utility functions
- Form validation logic
- Authentication helpers
- Custom hooks (if complex)

**Post-MVP Testing Expansion**
- Component testing with React Testing Library
- E2E testing with Cypress/Playwright
- Visual regression testing
- Comprehensive accessibility audits

### Unresolved Issues

**None** - All critical UI architecture decisions have been addressed through the planning conversation. The following items are deferred to post-MVP:

**Post-MVP Enhancements to Consider**
1. Drag-and-drop step/ingredient reordering
2. Rich text editor for recipe steps
3. Image upload for recipes
4. Recipe sharing functionality
5. Advanced search filters (by ingredient, cooking time range)
6. Recipe collections/folders
7. Print-friendly recipe view
8. Dark mode theme
9. Progressive Web App (PWA) features for offline usage
10. Recipe import/export functionality
11. Nutritional information tracking
12. Measurement unit conversion
13. Serving size scaling
14. Shopping list generation from recipes
15. Meal planning calendar integration

**Technical Debt to Address Post-MVP**
1. Comprehensive test coverage (target 80%+)
2. Performance monitoring and optimization
3. Analytics integration for success metrics tracking
4. Error logging and monitoring (Sentry, LogRocket)
5. A/B testing infrastructure for UX improvements
6. Advanced caching strategies (service worker)
7. Backend pagination vs infinite scroll performance analysis
8. Security audit and penetration testing
9. WCAG 2.1 AAA compliance review
10. Bundle size optimization analysis

</unresolved_issues>

</conversation_summary>

---

## Next Steps

1. **UI Wireframing**: Create low-fidelity wireframes for all 6 main views based on this architecture
2. **Component Structure**: Design React component hierarchy and folder structure
3. **Routing Configuration**: Set up React Router with protected routes and scroll restoration
4. **API Client Setup**: Implement centralized Axios instance with interceptors
5. **Context Providers**: Create authentication context and global state management
6. **Component Library Setup**: Install and configure Material-UI with custom theme
7. **Form Components**: Build reusable ingredient and step form components
8. **Implementation**: Begin with authentication flow, then recipe list, then CRUD operations

---

## Implementation Priority

**Phase 1: Foundation (Day 1)**
- Project setup (Vite, React, Material-UI)
- Routing structure
- API client configuration
- Authentication context
- Protected routes
- Login/Registration pages

**Phase 2: Core Features (Day 2)**
- Recipe list page with infinite scroll
- Recipe detail page
- Basic navigation and layout

**Phase 3: CRUD Operations (Day 3)**
- Recipe creation form
- Recipe edit form
- Recipe deletion
- Form validation and error handling

**Phase 4: Polish & Testing (Day 4)**
- Search and filtering
- Toast notifications
- Loading states
- Mobile responsiveness refinements
- Accessibility review
- Manual testing and bug fixes
