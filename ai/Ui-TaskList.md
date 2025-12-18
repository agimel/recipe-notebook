# UI Implementation Task List

**Version**: 1.0  
**Date**: December 18, 2025  
**Status**: Ready for Implementation

---

## Overview

This document lists all UI views that need to be created for the Recipe Notebook MVP. Each view has a corresponding detailed specification file in the `ai/` folder.

---

## Views to be Created

### 1. Login View
**File**: `ai/ui-login-view.md`  
**Path**: `/login`  
**Priority**: High (Phase 1 - Foundation)

**Main Functionalities**:
- User authentication with username and password
- JWT token generation and storage in sessionStorage
- Form validation with real-time feedback
- Redirect to recipe list on successful login
- Link to registration page for new users
- Error handling for invalid credentials

---

### 2. Registration View
**File**: `ai/ui-registration-view.md`  
**Path**: `/register`  
**Priority**: High (Phase 1 - Foundation)

**Main Functionalities**:
- New user account creation
- Real-time validation (username: 3-50 chars, password: min 6 chars)
- Character counters for input fields
- Automatic creation of 6 default categories on backend
- Automatic creation of sample recipe on backend
- Welcome message and redirect to recipe list
- Link to login page for existing users

---

### 3. Recipe List View
**File**: `ai/ui-recipe-list-view.md`  
**Path**: `/recipes`  
**Priority**: High (Phase 2 - Core Features)

**Main Functionalities**:
- Display all user recipes in alphabetical order
- Recipe cards showing title, difficulty badge, cooking time, categories
- Search recipes by title (debounced, case-insensitive)
- Filter by one or more categories
- Filter by difficulty level (Easy, Medium, Hard)
- Combined filtering (category + difficulty + search)
- Infinite scroll pagination (20 recipes per page)
- Empty state for new users
- Navigation to recipe detail view
- Back-to-top floating action button
- Mobile-responsive design with touch-friendly targets

---

### 4. Recipe Detail View
**File**: `ai/ui-recipe-detail-view.md`  
**Path**: `/recipes/:id`  
**Priority**: High (Phase 2 - Core Features)

**Main Functionalities**:
- Display complete recipe information
- Show title, difficulty badge, cooking time, categories
- List ingredients with quantity, unit, and name
- Display numbered cooking steps
- Edit button (navigates to edit view)
- Delete button with confirmation dialog
- Optimistic deletion with rollback on error
- Mobile-optimized layout for cooking
- Welcome banner for sample recipe (first-time users)
- Loading states and error handling

---

### 5. Recipe Creation View
**File**: `ai/ui-recipe-creation-view.md`  
**Path**: `/recipes/new`  
**Priority**: High (Phase 3 - CRUD Operations)

**Main Functionalities**:
- Single-page form for creating new recipes
- Title input with character counter (max 100)
- Difficulty selection (Easy, Medium, Hard)
- Cooking time input (minutes)
- Category multi-select (minimum 1 required)
- Dynamic ingredient rows (add/remove, minimum 1 required)
- Dynamic step text areas (add/remove/reorder, minimum 2 required)
- Real-time field-level validation
- Visual count feedback for ingredients and steps
- Character counters for steps (max 500 per step)
- Unsaved changes warning
- Success toast and redirect to recipe detail
- Cancel button returns to recipe list

---

### 6. Recipe Edit View
**File**: `ai/ui-recipe-edit-view.md`  
**Path**: `/recipes/:id/edit`  
**Priority**: High (Phase 3 - CRUD Operations)

**Main Functionalities**:
- Pre-populate form with existing recipe data
- Same form structure and validation as creation view
- Update recipe with full replacement (not merge)
- Loading skeleton while fetching recipe data
- Concurrent edit detection (localStorage events)
- Unsaved changes warning
- Success toast and redirect to recipe detail
- Cancel button returns to recipe detail
- Cache invalidation on successful update
- Error handling for 404 and 403 responses

---

## Implementation Phases

### Phase 1: Foundation (Day 1)
- Login View
- Registration View
- Project setup (React, Vite, Material-UI, React Router)
- Authentication context and JWT management
- Axios instance with interceptors
- Protected route wrapper

### Phase 2: Core Features (Day 2)
- Recipe List View
- Recipe Detail View
- AppShell component (navigation, drawer)
- Client-side caching
- Scroll position restoration

### Phase 3: CRUD Operations (Day 3)
- Recipe Creation View
- Recipe Edit View
- Shared RecipeForm component
- Dynamic ingredient and step components
- Confirmation dialogs

### Phase 4: Search, Filters, Polish (Day 4)
- Search functionality (debounced)
- Category and difficulty filters
- Filter chips with clear functionality
- Toast notifications refinement
- Loading states and skeletons
- Mobile responsiveness verification
- Accessibility review and testing
- Cross-browser testing
- Bug fixes and final polish

---

## Shared Components Required

Based on the view specifications, the following shared/reusable components will be needed:

1. **Layout Components**:
   - AppShell (with AppBar and Drawer)
   - ProtectedRoute wrapper

2. **Form Components**:
   - RecipeForm (shared between Create and Edit)
   - IngredientRow
   - StepRow
   - CategorySelector
   - ConfirmDialog

3. **Recipe Display Components**:
   - RecipeCard
   - DifficultyBadge
   - RecipeMetadata
   - IngredientList
   - StepList

4. **Filter and Search Components**:
   - SearchBar
   - CategoryFilter
   - DifficultyFilter
   - FilterChips

5. **Feedback Components**:
   - ToastNotification (wrapper for React Hot Toast)
   - LoadingSpinner
   - LoadingSkeleton
   - EmptyState
   - ErrorState

6. **Utility Components**:
   - BackToTopFab
   - OfflineIndicator
   - WelcomeBanner

7. **Authentication Components**:
   - LoginForm
   - RegisterForm
   - UserMenu

---

## Testing Checklist

For each view, ensure:
- ✓ Mobile responsiveness (320px to 1920px+)
- ✓ Touch-friendly tap targets (minimum 44x44px)
- ✓ Keyboard navigation works correctly
- ✓ ARIA labels and landmarks present
- ✓ Focus management on modals and route changes
- ✓ Loading states display appropriately
- ✓ Error states handle all scenarios
- ✓ Form validation (client-side mirrors server-side)
- ✓ Success/error toast notifications
- ✓ JWT authentication and authorization
- ✓ Cross-browser compatibility (Chrome, Firefox, Safari)
- ✓ Screen reader compatibility (basic testing)

---

**END OF TASK LIST**
