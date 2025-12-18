# View Implementation Plan: Recipe Detail

## 1. Overview

The Recipe Detail view displays comprehensive recipe information optimized for reading, particularly on mobile devices while cooking. It shows the recipe title, difficulty badge, cooking time, assigned categories, ingredients list, and numbered cooking steps. Users can navigate to edit mode or delete the recipe from this view. The view handles authentication, loading states, error scenarios (404, 401), and provides confirmation dialogs for destructive actions.

## 2. View Routing

**Route Path**: `/recipes/:id`

**Route Parameters**:
- `id` (string): Recipe ID from URL path parameter

**Route Protection**: Requires authentication (JWT token in sessionStorage). Redirect to `/login` if token is missing or invalid.

**Example Routes**:
- `/recipes/1` - View recipe with ID 1
- `/recipes/42` - View recipe with ID 42

## 3. Component Structure

```
RecipeDetailPage (Container)
├── LoadingSkeleton (conditional: viewState === 'loading')
├── ErrorDisplay (conditional: viewState === 'error' | 'notFound')
└── RecipeContent (conditional: viewState === 'success')
    ├── WelcomeBanner (conditional: sample recipe detection)
    ├── RecipeHeader
    │   ├── Title (h1)
    │   ├── Metadata
    │   │   ├── DifficultyBadge
    │   │   └── CookingTime
    │   └── CategoryChips
    ├── IngredientsSection
    │   ├── SectionHeading (h2)
    │   └── IngredientsList
    │       └── IngredientItem[] (li elements)
    ├── StepsSection
    │   ├── SectionHeading (h2)
    │   └── StepsList
    │       └── StepItem[] (li elements with auto-numbering)
    ├── ActionButtons
    │   ├── EditButton
    │   └── DeleteButton
    └── DeleteConfirmationDialog (conditional: deleteDialogOpen)
        ├── DialogTitle
        ├── DialogContent
        └── DialogActions
            ├── CancelButton
            └── ConfirmButton
```

## 4. Component Details

### 4.1 RecipeDetailPage (Main Container)

**Description**: Top-level route component that orchestrates data fetching, state management, and conditional rendering based on view state. Handles authentication, API calls, navigation, and error handling.

**Main HTML Elements**:
- `<main>` with ARIA landmark role
- Conditional rendering wrapper for LoadingSkeleton, ErrorDisplay, or RecipeContent

**Child Components**:
- `LoadingSkeleton` (when loading)
- `ErrorDisplay` (when error or not found)
- `RecipeContent` (when recipe loaded successfully)

**Handled Events**:
- `useEffect` on mount: Fetch recipe data via GET /api/v1/recipes/{id}
- `handleDelete`: Triggered by delete confirmation, calls DELETE /api/v1/recipes/{id}
- `handleDeleteCancel`: Closes delete confirmation dialog
- `handleDeleteConfirm`: Opens delete confirmation dialog
- `handleEdit`: Navigates to `/recipes/{id}/edit`

**Validation Conditions**: N/A (read-only view, validation on backend)

**Required Types**:
- `RecipeDetailDTO`
- `ViewState`: 'loading' | 'success' | 'error' | 'notFound'
- `DeleteDialogState`: {isOpen: boolean, isDeleting: boolean}

**Props**: None (route component, gets `id` from URL params via `useParams()`)

**State Variables**:
- `recipe: RecipeDetailDTO | null` - Fetched recipe data
- `viewState: ViewState` - Current view state
- `errorMessage: string | null` - Error message for display
- `deleteDialogOpen: boolean` - Delete dialog visibility
- `isDeleting: boolean` - Delete operation in progress

### 4.2 RecipeHeader

**Description**: Displays recipe title, difficulty badge, cooking time, and category chips. Provides visual hierarchy with prominent title and metadata.

**Main HTML Elements**:
- `<header>` container
- `<h1>` for recipe title
- `<div>` for metadata row containing difficulty and cooking time
- Category chips container

**Child Components**:
- `DifficultyBadge`
- `CookingTime` (with clock icon)
- `CategoryChips`

**Handled Events**: None (presentational)

**Validation Conditions**: N/A

**Required Types**:
- `RecipeDetailDTO` (partial: title, difficulty, cookingTimeMinutes, categories)

**Props**:
```typescript
interface RecipeHeaderProps {
  title: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  cookingTimeMinutes: number;
  categories: CategoryDTO[];
}
```

### 4.3 DifficultyBadge

**Description**: Color-coded badge displaying recipe difficulty level. Uses semantic colors: green for Easy, yellow for Medium, red for Hard.

**Main HTML Elements**:
- `<span>` or Material-UI `<Chip>` with appropriate color variant

**Child Components**: None

**Handled Events**: None

**Validation Conditions**: N/A

**Required Types**: None (inline type)

**Props**:
```typescript
interface DifficultyBadgeProps {
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
}
```

**Implementation Notes**:
- EASY: Green background (success color)
- MEDIUM: Yellow/orange background (warning color)
- HARD: Red background (error color)

### 4.4 CookingTime

**Description**: Displays cooking time in minutes with a clock icon for visual recognition.

**Main HTML Elements**:
- `<div>` or `<span>` container
- Clock icon (from Material-UI icons or similar)
- Time text

**Child Components**: None

**Handled Events**: None

**Validation Conditions**: N/A

**Required Types**: None

**Props**:
```typescript
interface CookingTimeProps {
  minutes: number;
}
```

**Implementation Notes**:
- Format: "{minutes} min" or "{minutes} minutes"
- Include accessible label for screen readers

### 4.5 CategoryChips

**Description**: Displays assigned categories as read-only chips/badges. Not clickable in detail view (unlike list view filters).

**Main HTML Elements**:
- Container `<div>` with flex layout
- Multiple `<Chip>` or `<span>` elements for each category

**Child Components**: Material-UI Chip components (or similar)

**Handled Events**: None (read-only, not clickable)

**Validation Conditions**: N/A

**Required Types**:
- `CategoryDTO[]`

**Props**:
```typescript
interface CategoryChipsProps {
  categories: CategoryDTO[];
}
```

**Implementation Notes**:
- Use neutral color scheme (not color-coded like difficulty)
- Wrap chips to multiple lines on small screens
- Include ARIA label indicating these are category tags

### 4.6 IngredientsSection

**Description**: Section container for ingredients heading and list. Provides visual separation from other recipe sections.

**Main HTML Elements**:
- `<section>` with ARIA label
- `<h2>` section heading ("Ingredients")
- `IngredientsList` component

**Child Components**:
- `IngredientsList`

**Handled Events**: None

**Validation Conditions**: N/A

**Required Types**:
- `IngredientDTO[]`

**Props**:
```typescript
interface IngredientsSectionProps {
  ingredients: IngredientDTO[];
}
```

### 4.7 IngredientsList

**Description**: Unordered list of ingredients, each showing quantity, unit, and name in a readable format. Already sorted by sortOrder from API.

**Main HTML Elements**:
- `<ul>` unordered list with appropriate ARIA role
- Multiple `<li>` elements for each ingredient

**Child Components**: None (or simple `IngredientItem` component)

**Handled Events**: None

**Validation Conditions**: N/A

**Required Types**:
- `IngredientDTO`

**Props**:
```typescript
interface IngredientsListProps {
  ingredients: IngredientDTO[];
}
```

**Implementation Notes**:
- Format each ingredient as: "{quantity} {unit} {name}"
- Example: "2 1/4 cups all-purpose flour"
- Use minimum 16px font size on mobile
- Adequate line spacing for easy scanning
- No need to re-sort (API returns sorted by sortOrder)

### 4.8 StepsSection

**Description**: Section container for cooking steps heading and numbered list. Optimized for reading while cooking.

**Main HTML Elements**:
- `<section>` with ARIA label
- `<h2>` section heading ("Instructions" or "Steps")
- `StepsList` component

**Child Components**:
- `StepsList`

**Handled Events**: None

**Validation Conditions**: N/A

**Required Types**:
- `StepDTO[]`

**Props**:
```typescript
interface StepsSectionProps {
  steps: StepDTO[];
}
```

### 4.9 StepsList

**Description**: Ordered list of cooking steps with automatic numbering. Already sorted by stepNumber from API. Optimized for readability with large font and adequate spacing.

**Main HTML Elements**:
- `<ol>` ordered list (browser provides automatic numbering)
- Multiple `<li>` elements for each step

**Child Components**: None (or simple `StepItem` component)

**Handled Events**: None

**Validation Conditions**: N/A

**Required Types**:
- `StepDTO`

**Props**:
```typescript
interface StepsListProps {
  steps: StepDTO[];
}
```

**Implementation Notes**:
- Use native `<ol>` numbering (don't manually number)
- Minimum 18px font size on mobile for readability
- Generous line height (1.6-1.8) for easy reading
- Consider larger spacing between steps (margin-bottom)
- No need to re-sort (API returns sorted by stepNumber)

### 4.10 ActionButtons

**Description**: Container for Edit and Delete action buttons. Positioned prominently for easy access.

**Main HTML Elements**:
- `<div>` container with flex layout
- Two `<button>` elements (Edit and Delete) or Material-UI Button components

**Child Components**: Button components from UI library

**Handled Events**:
- `onClick` for Edit button → navigate to edit view
- `onClick` for Delete button → open confirmation dialog

**Validation Conditions**: N/A

**Required Types**: None

**Props**:
```typescript
interface ActionButtonsProps {
  onEdit: () => void;
  onDelete: () => void;
  isDeleting: boolean; // Disable buttons during delete operation
}
```

**Implementation Notes**:
- Edit button: Primary color, prominent
- Delete button: Danger/error color (red)
- Minimum 44x44px tap target for mobile
- Disable both buttons when `isDeleting` is true
- Include appropriate ARIA labels

### 4.11 DeleteConfirmationDialog

**Description**: Modal dialog that confirms recipe deletion before proceeding. Displays recipe title in confirmation message. Prevents accidental deletion.

**Main HTML Elements**:
- Material-UI `<Dialog>` (or similar modal component)
- `<DialogTitle>`: "Delete Recipe?"
- `<DialogContent>`: Confirmation message with recipe title
- `<DialogActions>`: Cancel and Confirm buttons

**Child Components**: Dialog components from UI library (Dialog, DialogTitle, DialogContent, DialogActions, Button)

**Handled Events**:
- `onCancel`: Closes dialog without action
- `onConfirm`: Executes delete operation
- `onClose`: Handles backdrop click or ESC key

**Validation Conditions**: N/A

**Required Types**: None

**Props**:
```typescript
interface DeleteConfirmationDialogProps {
  open: boolean;
  recipeTitle: string;
  isDeleting: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}
```

**Implementation Notes**:
- Message format: "Are you sure you want to delete '{recipeTitle}'? This action cannot be undone."
- Cancel button: Secondary color, no background
- Confirm button: Danger color (red), shows loading spinner when `isDeleting`
- Focus management: Focus on Cancel button by default
- Trap focus within dialog
- Close on ESC key press (unless deleting)
- Prevent closing during delete operation

### 4.12 LoadingSkeleton

**Description**: Placeholder UI displayed while recipe data is being fetched. Mimics the layout of the actual content to reduce layout shift.

**Main HTML Elements**:
- Material-UI `<Skeleton>` components (or similar)
- Skeleton placeholders for title, metadata, categories, ingredients, steps

**Child Components**: Skeleton components from UI library

**Handled Events**: None

**Validation Conditions**: N/A

**Required Types**: None

**Props**: None

**Implementation Notes**:
- Match the general layout structure of RecipeContent
- Skeleton for h1 title (full width, 32px height)
- Skeletons for difficulty badge and cooking time
- 2-3 skeleton chips for categories
- 5-7 skeleton lines for ingredients
- 3-5 skeleton blocks for steps
- Animated pulse effect for visual feedback

### 4.13 ErrorDisplay

**Description**: Error message component displayed when recipe cannot be loaded. Handles 404 (not found) and general errors differently.

**Main HTML Elements**:
- `<div>` container with centered layout
- Error icon
- Error heading
- Error message text
- Retry button or Back to List button

**Child Components**: Icon, Button components

**Handled Events**:
- `onRetry`: Refetch recipe data (for network errors)
- `onBackToList`: Navigate to `/recipes`

**Validation Conditions**: N/A

**Required Types**: None

**Props**:
```typescript
interface ErrorDisplayProps {
  errorType: 'notFound' | 'unauthorized' | 'error';
  errorMessage?: string;
  onRetry?: () => void;
}
```

**Implementation Notes**:
- For 404: "Recipe not found" heading, "This recipe doesn't exist or you don't have permission to view it." message
- For general errors: "Something went wrong" heading, error message from API or generic message
- For 401: Redirect to login immediately (no display component)
- Include "Back to Recipes" button for all error types
- Include "Try Again" button for network errors only

### 4.14 WelcomeBanner (Optional)

**Description**: Dismissible banner displayed for the sample recipe created during registration. Welcomes new users and explains the sample recipe.

**Main HTML Elements**:
- `<div>` banner with info background color
- Welcome message text
- Dismiss button (X icon)

**Child Components**: Icon button for dismiss

**Handled Events**:
- `onDismiss`: Hides banner and stores preference in localStorage

**Validation Conditions**: N/A

**Required Types**: None

**Props**:
```typescript
interface WelcomeBannerProps {
  onDismiss: () => void;
}
```

**Implementation Notes**:
- Message: "Welcome to Recipe Notebook! This is a sample recipe to help you get started. Feel free to edit or delete it."
- Info/primary color background
- Position at top of recipe content
- Store dismissed state in localStorage with key like `recipe-{id}-banner-dismissed`
- Only show if recipe is identified as sample recipe (detection logic TBD - possibly check recipe ID, title, or specific flag)

## 5. Types

### 5.1 API DTOs (from backend response)

```typescript
interface RecipeDetailDTO {
  id: number;
  title: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  cookingTimeMinutes: number;
  categories: CategoryDTO[];
  ingredients: IngredientDTO[];
  steps: StepDTO[];
  createdAt: string; // ISO 8601 datetime string
  updatedAt: string; // ISO 8601 datetime string
}

interface CategoryDTO {
  id: number;
  name: string;
}

interface IngredientDTO {
  id: number;
  quantity: string;
  unit: string;
  name: string;
  sortOrder: number;
}

interface StepDTO {
  id: number;
  stepNumber: number;
  instruction: string;
}
```

### 5.2 API Response Wrapper

```typescript
interface ApiResponse<T> {
  status: 'success' | 'error';
  message: string;
  data: T | null;
}
```

### 5.3 View-Specific Types

```typescript
type ViewState = 'loading' | 'success' | 'error' | 'notFound';

interface DeleteDialogState {
  isOpen: boolean;
  isDeleting: boolean;
}

interface RecipeDetailViewState {
  recipe: RecipeDetailDTO | null;
  viewState: ViewState;
  errorMessage: string | null;
  deleteDialogOpen: boolean;
  isDeleting: boolean;
}
```

## 6. State Management

### 6.1 State Approach

Use React local state (`useState`) within `RecipeDetailPage` component. No global state management (Redux, Context) required for this view as recipe data is not shared across views.

### 6.2 State Variables

```typescript
const [recipe, setRecipe] = useState<RecipeDetailDTO | null>(null);
const [viewState, setViewState] = useState<ViewState>('loading');
const [errorMessage, setErrorMessage] = useState<string | null>(null);
const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
const [isDeleting, setIsDeleting] = useState(false);
```

### 6.3 Custom Hook (Optional)

Consider creating `useRecipeDetail(id: string)` hook to encapsulate fetch logic and state management. This improves reusability and testing.

```typescript
interface UseRecipeDetailResult {
  recipe: RecipeDetailDTO | null;
  viewState: ViewState;
  errorMessage: string | null;
  refetch: () => Promise<void>;
}

function useRecipeDetail(id: string): UseRecipeDetailResult {
  // State declarations
  // useEffect for initial fetch
  // Fetch logic with error handling
  // Return state and refetch function
}
```

**Hook Responsibilities**:
- Extract JWT token from sessionStorage
- Call GET /api/v1/recipes/{id} with Authorization header
- Handle response status codes (200, 404, 401)
- Update viewState based on response
- Set recipe data on success
- Set error message on failure
- Provide refetch function for retry scenarios
- Redirect to login on 401

## 7. API Integration

### 7.1 GET Recipe Details

**Endpoint**: `GET /api/v1/recipes/{id}`

**Request**:
```typescript
const token = sessionStorage.getItem('jwt_token');
const response = await axios.get(`/api/v1/recipes/${id}`, {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
```

**Success Response** (HTTP 200):
```typescript
{
  status: 'success',
  message: 'Recipe retrieved successfully',
  data: RecipeDetailDTO
}
```

**Error Responses**:
- **404**: Recipe not found or unauthorized
  ```typescript
  {
    status: 'error',
    message: 'Recipe not found',
    data: null
  }
  ```
- **401**: Invalid/expired token
  ```typescript
  {
    status: 'error',
    message: 'Unauthorized access',
    data: null
  }
  ```

**Error Handling**:
- 200: Set `viewState` to 'success', store recipe data
- 404: Set `viewState` to 'notFound'
- 401: Redirect to `/login`
- Network error: Set `viewState` to 'error', display error message

### 7.2 DELETE Recipe

**Endpoint**: `DELETE /api/v1/recipes/{id}`

**Request**:
```typescript
const token = sessionStorage.getItem('jwt_token');
const response = await axios.delete(`/api/v1/recipes/${id}`, {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
```

**Success Response** (HTTP 200):
```typescript
{
  status: 'success',
  message: 'Recipe deleted successfully',
  data: null
}
```

**Error Responses**: Same as GET endpoint (404, 401)

**Flow**:
1. User clicks Delete button → open confirmation dialog
2. User confirms → set `isDeleting` to true, disable buttons
3. Call DELETE API
4. On success:
   - Show success toast: "Recipe deleted successfully"
   - Navigate to `/recipes` (recipe list)
5. On error:
   - Show error toast with message from API or generic "Failed to delete recipe"
   - Close dialog, reset `isDeleting` to false
   - Keep user on detail page

**Optimistic Update**: NOT recommended for delete operation due to navigation. Delete happens optimistically only during navigation (user sees immediate navigation, rollback not needed because they can't see the old page).

## 8. User Interactions

### 8.1 View Load

**Trigger**: Component mounts, route parameter changes

**Flow**:
1. Extract `id` from URL params
2. Set `viewState` to 'loading'
3. Fetch recipe data via GET API
4. Update state based on response
5. Focus on h1 title element when recipe loads (accessibility)

**UI Feedback**:
- Display LoadingSkeleton during fetch
- Transition to RecipeContent on success
- Display ErrorDisplay on failure

### 8.2 Edit Recipe

**Trigger**: User clicks Edit button

**Flow**:
1. Navigate to `/recipes/{id}/edit` using React Router
2. Pass recipe data via route state (optional, edit view will refetch if needed)

**UI Feedback**:
- Immediate navigation (no loading state)
- Edit button disabled during delete operation

### 8.3 Delete Recipe

**Trigger**: User clicks Delete button

**Flow**:
1. Open delete confirmation dialog
2. User reviews confirmation message with recipe title
3. User clicks Cancel → close dialog, no further action
4. User clicks Confirm → execute delete flow:
   - Set `isDeleting` to true
   - Disable dialog buttons
   - Call DELETE API
   - On success: Show success toast, navigate to `/recipes`
   - On error: Show error toast, close dialog, reset `isDeleting`

**UI Feedback**:
- Confirmation dialog with recipe title in message
- Loading spinner on Confirm button during deletion
- Disabled buttons during deletion
- Toast notification for success/error
- Immediate navigation on success

### 8.4 Dismiss Welcome Banner

**Trigger**: User clicks X icon on welcome banner

**Flow**:
1. Hide banner immediately
2. Store dismissed state in localStorage: `localStorage.setItem('recipe-{id}-banner-dismissed', 'true')`

**UI Feedback**:
- Banner slides out or fades out (animation)
- Banner does not reappear on page reload

## 9. Conditions and Validation

### 9.1 Authentication Validation

**Condition**: Valid JWT token must exist in sessionStorage

**Components Affected**: RecipeDetailPage (entire view)

**Effect on Interface**:
- If token missing: Redirect to `/login` before rendering
- If token invalid/expired (401 from API): Clear sessionStorage, redirect to `/login`

### 9.2 Recipe Ownership Validation

**Condition**: Recipe must belong to authenticated user (enforced by backend)

**Components Affected**: RecipeDetailPage

**Effect on Interface**:
- Backend returns 404 for unauthorized recipes (security through obscurity)
- Frontend displays "Recipe not found" error message
- No distinction made between non-existent and unauthorized recipes

### 9.3 Recipe Existence Validation

**Condition**: Recipe ID must exist in database

**Components Affected**: RecipeDetailPage

**Effect on Interface**:
- Backend returns 404 for non-existent recipes
- Frontend displays "Recipe not found" error message
- Provide "Back to Recipes" button for navigation

### 9.4 Delete Operation Validation

**Condition**: Delete operation must complete successfully

**Components Affected**: DeleteConfirmationDialog, ActionButtons

**Effect on Interface**:
- During deletion: Disable all buttons, show loading spinner on Confirm button
- On success: Show success toast, navigate away
- On failure: Show error toast, re-enable buttons, keep dialog open

### 9.5 Sample Recipe Detection (Optional)

**Condition**: Recipe is the sample recipe created during registration

**Components Affected**: WelcomeBanner

**Effect on Interface**:
- Show dismissible welcome banner at top of content
- Banner explains this is a sample recipe
- Banner dismissed state stored in localStorage per recipe ID

## 10. Error Handling

### 10.1 Network Errors

**Scenario**: API request fails due to network issues (no internet, server down, timeout)

**Handling**:
- Catch axios network errors
- Set `viewState` to 'error'
- Display ErrorDisplay component with retry button
- Show generic error message: "Unable to load recipe. Please check your connection and try again."
- Log error to console for debugging

### 10.2 Recipe Not Found (404)

**Scenario**: Recipe doesn't exist or user doesn't have permission to view it

**Handling**:
- Set `viewState` to 'notFound'
- Display ErrorDisplay component with specialized message
- Message: "Recipe not found. This recipe doesn't exist or you don't have permission to view it."
- Provide "Back to Recipes" button
- No retry option (404 won't resolve with retry)

### 10.3 Unauthorized Access (401)

**Scenario**: JWT token is invalid, expired, or missing

**Handling**:
- Clear sessionStorage (remove invalid token)
- Show error toast: "Session expired. Please log in again."
- Redirect to `/login` with return URL parameter: `/login?returnTo=/recipes/{id}`
- After successful login, redirect back to recipe detail view

### 10.4 Delete Operation Failure

**Scenario**: DELETE API call fails (network error, 404, 401, 500)

**Handling**:
- Do NOT navigate away from page
- Keep delete dialog open
- Reset `isDeleting` to false
- Re-enable dialog buttons
- Show error toast with specific message from API or generic: "Failed to delete recipe. Please try again."
- Log error to console

### 10.5 Invalid Recipe ID Format

**Scenario**: URL contains non-numeric recipe ID (e.g., `/recipes/abc`)

**Handling**:
- Backend returns 400 Bad Request
- Frontend displays ErrorDisplay with 404-like message
- Alternatively, validate ID format in frontend before API call
- Navigate to 404 page or recipe list

### 10.6 Missing JWT Token

**Scenario**: User navigates to recipe detail without being logged in

**Handling**:
- Check for token in sessionStorage before rendering
- If missing, immediately redirect to `/login?returnTo=/recipes/{id}`
- Show toast message: "Please log in to view recipes"
- No loading state or API call attempted

### 10.7 Empty Recipe Data

**Scenario**: API returns 200 but data is null or malformed

**Handling**:
- Validate response structure before setting state
- If data is invalid, set `viewState` to 'error'
- Show generic error message
- Log detailed error to console for debugging
- Provide retry option

## 11. Implementation Steps

### Step 1: Create Type Definitions
1. Create `src/types/recipe.types.ts` file
2. Define `RecipeDetailDTO`, `CategoryDTO`, `IngredientDTO`, `StepDTO` interfaces
3. Define `ApiResponse<T>` generic interface
4. Define `ViewState` type and view-specific state interfaces
5. Export all types for use across components

### Step 2: Create API Service Module
1. Create `src/services/recipeApi.ts` file
2. Implement `getRecipeById(id: number): Promise<ApiResponse<RecipeDetailDTO>>` function
3. Implement `deleteRecipeById(id: number): Promise<ApiResponse<null>>` function
4. Both functions should:
   - Extract JWT token from sessionStorage
   - Set Authorization header
   - Handle axios errors and transform to consistent format
   - Return typed responses

### Step 3: Create Custom Hook (Optional)
1. Create `src/hooks/useRecipeDetail.ts` file
2. Implement `useRecipeDetail(id: string)` hook
3. Hook manages:
   - Recipe state
   - Loading state
   - Error state
   - Initial fetch on mount
   - Refetch function
   - 401 redirect logic
4. Return object with state and refetch function
5. Add comprehensive error handling

### Step 4: Create Presentational Components
1. Create `src/components/recipe/DifficultyBadge.tsx`
   - Implement color mapping: EASY=green, MEDIUM=yellow, HARD=red
   - Use Material-UI Chip or similar
2. Create `src/components/recipe/CookingTime.tsx`
   - Include clock icon
   - Format minutes display
3. Create `src/components/recipe/CategoryChips.tsx`
   - Map over categories array
   - Render read-only chips
4. Create `src/components/recipe/IngredientsList.tsx`
   - Render unordered list
   - Format: "{quantity} {unit} {name}"
5. Create `src/components/recipe/StepsList.tsx`
   - Render ordered list (automatic numbering)
   - Large font, generous spacing
6. Create `src/components/recipe/RecipeHeader.tsx`
   - Compose title, DifficultyBadge, CookingTime, CategoryChips
   - Implement mobile-responsive layout

### Step 5: Create Section Components
1. Create `src/components/recipe/IngredientsSection.tsx`
   - Section heading
   - Include IngredientsList component
   - ARIA landmarks
2. Create `src/components/recipe/StepsSection.tsx`
   - Section heading
   - Include StepsList component
   - ARIA landmarks

### Step 6: Create Action Components
1. Create `src/components/recipe/ActionButtons.tsx`
   - Edit button (primary color)
   - Delete button (danger color)
   - Accept onClick handlers as props
   - Handle disabled state
2. Create `src/components/recipe/DeleteConfirmationDialog.tsx`
   - Use Material-UI Dialog
   - Display recipe title in message
   - Cancel and Confirm buttons
   - Handle loading state during deletion
   - Focus management (default to Cancel)

### Step 7: Create State Components
1. Create `src/components/recipe/LoadingSkeleton.tsx`
   - Use Material-UI Skeleton components
   - Match layout structure of actual content
   - Animated pulse effect
2. Create `src/components/recipe/ErrorDisplay.tsx`
   - Accept errorType and errorMessage props
   - Different messages for 404 vs general errors
   - Include retry button (conditional)
   - Include "Back to Recipes" button
3. Create `src/components/recipe/WelcomeBanner.tsx` (optional)
   - Dismissible banner component
   - Info background color
   - Welcome message
   - X button to dismiss

### Step 8: Create RecipeContent Component
1. Create `src/components/recipe/RecipeContent.tsx`
2. Compose all sections:
   - WelcomeBanner (conditional)
   - RecipeHeader
   - IngredientsSection
   - StepsSection
   - ActionButtons
3. Accept full recipe and handler props
4. Implement responsive layout (mobile-first)
5. Apply proper spacing and typography

### Step 9: Implement RecipeDetailPage Container
1. Create `src/pages/RecipeDetailPage.tsx`
2. Use React Router's `useParams()` to extract recipe ID
3. Use `useNavigate()` for programmatic navigation
4. Implement state management (use custom hook or inline useState)
5. Implement data fetching on mount
6. Implement delete operation flow
7. Implement edit navigation
8. Implement authentication check
9. Conditional rendering based on viewState:
   - 'loading' → LoadingSkeleton
   - 'success' → RecipeContent
   - 'error' | 'notFound' → ErrorDisplay
10. Focus management: Focus h1 on successful load
11. Add `<main>` semantic wrapper with ARIA landmark

### Step 10: Configure Routing
1. Open `src/App.tsx` or routing configuration file
2. Add protected route for `/recipes/:id`:
   ```tsx
   <Route 
     path="/recipes/:id" 
     element={<ProtectedRoute><RecipeDetailPage /></ProtectedRoute>} 
   />
   ```
3. Ensure ProtectedRoute wrapper checks for JWT token
4. Redirect to login if unauthenticated

### Step 11: Implement Toast Notifications
1. Ensure React Hot Toast provider is configured in App.tsx
2. In RecipeDetailPage, import toast functions
3. Add toast notifications:
   - Delete success: `toast.success('Recipe deleted successfully')`
   - Delete error: `toast.error(errorMessage || 'Failed to delete recipe')`
   - Session expired: `toast.error('Session expired. Please log in again.')`

### Step 12: Add Mobile Responsive Styles
1. Use Material-UI responsive breakpoints or custom media queries
2. Ensure minimum font sizes:
   - Body text: 16px minimum on mobile
   - Recipe title: 24-32px on mobile
   - Steps: 18px minimum on mobile
3. Ensure touch targets: 44x44px minimum
4. Test on mobile viewport sizes (375px, 414px widths)
5. Adjust spacing for readability while cooking
6. Ensure ingredients and steps are easy to scan

### Step 13: Implement Accessibility Features
1. Add ARIA landmarks:
   - `<main>` for RecipeDetailPage
   - `<section>` for IngredientsSection and StepsSection
2. Semantic HTML:
   - `<h1>` for recipe title
   - `<h2>` for section headings
   - `<ul>` for ingredients
   - `<ol>` for steps
3. Focus management:
   - Focus on h1 after recipe loads
   - Focus trap in delete dialog
   - Default focus on Cancel button in dialog
4. Ensure all buttons have descriptive labels
5. Add alt text to icons
6. Test keyboard navigation
7. Validate with screen reader

### Step 14: Test Error Scenarios
1. Test 404 scenario:
   - Navigate to non-existent recipe ID
   - Verify ErrorDisplay shows correct message
   - Verify "Back to Recipes" button works
2. Test 401 scenario:
   - Clear sessionStorage token
   - Verify redirect to login
   - Verify returnTo parameter is set
3. Test network error:
   - Simulate network failure (browser DevTools offline mode)
   - Verify error message and retry button
4. Test delete failure:
   - Mock DELETE API to return error
   - Verify error toast, dialog remains open
5. Test missing token:
   - Navigate without token
   - Verify immediate redirect to login

### Step 15: Test Happy Path
1. Log in with valid user account
2. Navigate to existing recipe detail page
3. Verify all sections render correctly:
   - Title, difficulty, cooking time
   - Categories display
   - Ingredients list (check formatting)
   - Steps list (check numbering)
4. Click Edit button → verify navigation to edit page
5. Click Delete button → verify confirmation dialog opens
6. Cancel delete → verify dialog closes
7. Confirm delete → verify:
   - Loading state during deletion
   - Success toast appears
   - Navigation to recipe list occurs

### Step 16: Test Welcome Banner (if implemented)
1. Identify sample recipe (first recipe created during registration)
2. Navigate to sample recipe
3. Verify banner displays
4. Click dismiss → verify banner hides
5. Reload page → verify banner stays dismissed
6. Test on different recipe → verify banner doesn't show

### Step 17: Mobile Testing
1. Test on mobile device or browser DevTools mobile emulation
2. Verify layout adapts to narrow screens
3. Verify font sizes are readable at arm's length
4. Verify touch targets are adequate (44x44px)
5. Test delete confirmation dialog on mobile
6. Test ingredients and steps readability
7. Verify horizontal scrolling is not needed

### Step 18: Accessibility Testing
1. Navigate using keyboard only
2. Verify all interactive elements are focusable
3. Verify delete dialog focus trap works
4. Test with screen reader (NVDA, JAWS, or VoiceOver)
5. Verify semantic structure is announced correctly
6. Verify buttons have descriptive labels
7. Run automated accessibility audit (Lighthouse, axe DevTools)

### Step 19: Code Cleanup and Review
1. Remove console.log statements (or guard with environment check)
2. Ensure all TypeScript types are properly used
3. Verify no unused imports
4. Ensure consistent code formatting
5. Add JSDoc comments to complex functions
6. Review error handling completeness
7. Verify all TODOs are resolved or documented

### Step 20: Integration with Recipe List
1. Ensure RecipeListPage links to detail pages correctly
2. Verify clicking recipe card navigates to `/recipes/{id}`
3. Verify "Back to Recipes" button in ErrorDisplay navigates correctly
4. Test navigation flow: List → Detail → Edit → List
5. Test navigation flow: List → Detail → Delete → List (with success)
6. Verify browser back button works correctly

### Step 21: Performance Optimization
1. Code-split RecipeDetailPage using React.lazy if needed
2. Memoize expensive computations (if any)
3. Ensure no unnecessary re-renders (use React DevTools Profiler)
4. Optimize images (if recipe images added in future)
5. Test loading performance on 3G network simulation
6. Verify API response times are acceptable

### Step 22: Final Manual Testing
1. Complete end-to-end test of all user flows
2. Test with multiple recipes (different data variations)
3. Test recipes with many ingredients (20+)
4. Test recipes with many steps (15+)
5. Test recipes with multiple categories (6+)
6. Test recipes with minimal data (1 ingredient, 2 steps)
7. Verify sorting (ingredients by sortOrder, steps by stepNumber)
8. Verify all edge cases handled gracefully

### Step 23: Documentation
1. Update README.md with recipe detail view description
2. Document component hierarchy and responsibilities
3. Document API integration details
4. Document error handling strategy
5. Add usage examples for key components
6. Document accessibility features implemented
7. Note any known issues or limitations
8. Document testing procedures

### Step 24: Deployment Preparation
1. Build production bundle (`npm run build`)
2. Verify build completes without errors
3. Test production build locally
4. Verify environment variables are correctly configured
5. Verify API endpoint URLs are correct for production
6. Verify authentication flow works in production build
7. Prepare deployment checklist

### Step 25: Post-Deployment Verification
1. Deploy to production environment
2. Test recipe detail view in production
3. Verify all functionality works with production API
4. Test on actual mobile devices (iOS Safari, Android Chrome)
5. Monitor for errors in browser console
6. Verify analytics tracking (if implemented)
7. Collect initial user feedback
8. Monitor API error rates and response times
