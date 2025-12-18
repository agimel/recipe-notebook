# View Implementation Plan: Recipe Edit View

## 1. Overview

The Recipe Edit View enables users to modify existing recipes with pre-populated data. It reuses the recipe creation form structure while adding capabilities for loading existing recipe data, detecting concurrent edits, and handling unsaved changes warnings. The view performs full replacement updates, meaning all ingredients, steps, and category associations are deleted and recreated on save.

## 2. View Routing

**Path**: `/recipes/:id/edit`

**Access Control**: Requires authentication (JWT token). Redirects to login if not authenticated.

**Route Configuration**:
```javascript
<Route path="/recipes/:id/edit" element={<RecipeEditView />} />
```

## 3. Component Structure

```
RecipeEditView (container)
├── LoadingSkeleton (conditional - while fetching)
├── NotFoundMessage (conditional - 404 state)
└── RecipeForm (reusable form component)
    ├── FormHeader
    │   └── Title: "Edit Recipe: {recipe.title}"
    ├── BasicInfoSection
    │   ├── TitleInput (text field with character counter)
    │   ├── DifficultySelect (dropdown)
    │   └── CookingTimeInput (number input)
    ├── CategoriesSection
    │   └── CategoryCheckboxGroup (multi-select)
    ├── IngredientsSection
    │   ├── IngredientRow[] (dynamic array)
    │   │   ├── QuantityInput
    │   │   ├── UnitInput
    │   │   ├── NameInput
    │   │   └── RemoveButton
    │   └── AddIngredientButton
    ├── StepsSection
    │   ├── StepRow[] (dynamic array)
    │   │   ├── StepNumber (auto-numbered)
    │   │   ├── InstructionTextarea (with counter)
    │   │   └── RemoveButton
    │   └── AddStepButton
    ├── FormActions
    │   ├── UpdateButton ("Update Recipe")
    │   └── CancelButton ("Cancel")
    └── UnsavedChangesDialog (confirmation modal)
```

## 4. Component Details

### 4.1 RecipeEditView (Container Component)

**Description**: Main container that orchestrates data fetching, form initialization, and navigation handling.

**Main Elements**:
- Conditional LoadingSkeleton during data fetch
- Conditional NotFoundMessage for 404 errors
- RecipeForm component when data is loaded

**Handled Events**:
- `useEffect` on mount: fetch recipe data and categories
- `useEffect` on recipeId change: refetch data
- `localStorage` event: detect concurrent edits
- `beforeunload` event: warn about unsaved changes
- Form submit: update recipe via API
- Cancel: navigate back with confirmation

**Validation Conditions**: None (delegates to RecipeForm)

**Required Types**:
- `RecipeDetailDTO` (response from GET)
- `CategoryDTO[]`
- `CreateRecipeRequest` (for PUT)

**Props**: None (uses route params via `useParams()`)

**State Variables**:
```typescript
isLoading: boolean
recipe: RecipeDetailDTO | null
categories: CategoryDTO[]
recipeNotFound: boolean
hasUnsavedChanges: boolean
showUnsavedDialog: boolean
nextLocation: Location | null
```

### 4.2 RecipeForm (Reusable Form Component)

**Description**: Reusable form component shared between creation and edit views. Handles all form state, validation, and user interactions.

**Main Elements**:
- Form wrapper with `onSubmit` handler
- Section containers for logical grouping
- Dynamic arrays for ingredients and steps
- Action buttons (Update/Save, Cancel)

**Handled Events**:
- `onSubmit`: validate and submit form
- `onChange`: track field changes for unsaved detection
- Dynamic row additions and deletions

**Validation Conditions**:
- Title: 1-100 characters, required
- Difficulty: required, must be EASY|MEDIUM|HARD
- Cooking time: positive integer, required
- Categories: minimum 1 selected
- Ingredients: minimum 1 row, all fields required per row
- Steps: minimum 2 rows, instruction required per row

**Required Types**:
- `RecipeFormData` (internal form state)
- `RecipeDetailDTO` (for pre-population)
- `CategoryDTO[]`

**Props**:
```typescript
initialData?: RecipeDetailDTO
categories: CategoryDTO[]
onSubmit: (data: CreateRecipeRequest) => Promise<void>
onCancel: () => void
submitButtonText: string
isSubmitting: boolean
```

### 4.3 BasicInfoSection

**Description**: Groups basic recipe information fields (title, difficulty, cooking time).

**Main Elements**:
- TextField for title (with character counter showing "X/100")
- Select dropdown for difficulty with options: Easy, Medium, Hard
- Number input for cooking time (with "minutes" suffix label)

**Handled Events**:
- `onChange` for each field: update form state, trigger validation

**Validation Conditions**:
- Title: required, 1-100 characters
- Difficulty: required
- Cooking time: required, minimum 1

**Required Types**:
- `RecipeFormData.title: string`
- `RecipeFormData.difficulty: 'EASY' | 'MEDIUM' | 'HARD'`
- `RecipeFormData.cookingTimeMinutes: number`

**Props**:
```typescript
title: string
difficulty: string
cookingTimeMinutes: number
errors: Record<string, string>
onChange: (field: string, value: any) => void
```

### 4.4 CategoriesSection

**Description**: Multi-select category checkboxes for assigning recipes to categories.

**Main Elements**:
- Section heading: "Categories"
- Checkbox group with all available categories
- Error message if no category selected

**Handled Events**:
- `onChange` for checkboxes: update selected category IDs

**Validation Conditions**:
- Minimum 1 category must be selected

**Required Types**:
- `CategoryDTO: { id: number, name: string }`
- `RecipeFormData.categoryIds: number[]`

**Props**:
```typescript
categories: CategoryDTO[]
selectedCategoryIds: number[]
error: string | undefined
onChange: (categoryIds: number[]) => void
```

### 4.5 IngredientsSection

**Description**: Dynamic list of ingredient rows with add/remove capabilities.

**Main Elements**:
- Section heading: "Ingredients"
- Array of IngredientRow components
- "+ Add Ingredient" button
- Minimum row count enforcement (always show at least 1 row)

**Handled Events**:
- Add ingredient: append new empty row
- Remove ingredient: delete row (if > 1 row exists)
- Field change: update ingredient data

**Validation Conditions**:
- Minimum 1 ingredient required
- Each ingredient:
  - Quantity: required, max 20 characters
  - Unit: required, max 20 characters
  - Name: required, max 50 characters

**Required Types**:
- `IngredientViewModel: { id?: number, quantity: string, unit: string, name: string }`
- `RecipeFormData.ingredients: IngredientViewModel[]`

**Props**:
```typescript
ingredients: IngredientViewModel[]
errors: Record<number, Record<string, string>>
onAdd: () => void
onRemove: (index: number) => void
onChange: (index: number, field: string, value: string) => void
```

### 4.6 IngredientRow

**Description**: Single ingredient input row with three text fields and remove button.

**Main Elements**:
- TextField for quantity (max 20 chars)
- TextField for unit (max 20 chars)
- TextField for name (max 50 chars)
- IconButton with trash/X icon for removal

**Handled Events**:
- `onChange` for each field: update ingredient data
- `onClick` remove button: delete row

**Validation Conditions**:
- All fields required
- Character limits enforced

**Required Types**:
- `IngredientViewModel`

**Props**:
```typescript
ingredient: IngredientViewModel
index: number
errors: Record<string, string>
canRemove: boolean
onChange: (field: string, value: string) => void
onRemove: () => void
```

### 4.7 StepsSection

**Description**: Dynamic list of numbered step rows with add/remove capabilities.

**Main Elements**:
- Section heading: "Steps"
- Array of StepRow components (auto-numbered)
- "+ Add Step" button
- Minimum row count enforcement (always show at least 2 rows)

**Handled Events**:
- Add step: append new empty row
- Remove step: delete row (if > 2 rows exist)
- Field change: update step instruction

**Validation Conditions**:
- Minimum 2 steps required
- Each step:
  - Instruction: required, 1-500 characters

**Required Types**:
- `StepViewModel: { id?: number, instruction: string }`
- `RecipeFormData.steps: StepViewModel[]`

**Props**:
```typescript
steps: StepViewModel[]
errors: Record<number, string>
onAdd: () => void
onRemove: (index: number) => void
onChange: (index: number, value: string) => void
```

### 4.8 StepRow

**Description**: Single step input row with auto-numbering, textarea, and remove button.

**Main Elements**:
- Step number badge (display only, auto-calculated)
- Textarea for instruction (max 500 chars with counter)
- IconButton with trash/X icon for removal

**Handled Events**:
- `onChange` for textarea: update step instruction
- `onClick` remove button: delete row

**Validation Conditions**:
- Instruction: required, 1-500 characters

**Required Types**:
- `StepViewModel`

**Props**:
```typescript
step: StepViewModel
stepNumber: number
error: string | undefined
canRemove: boolean
onChange: (value: string) => void
onRemove: () => void
```

### 4.9 UnsavedChangesDialog

**Description**: Confirmation modal that appears when user attempts to navigate away with unsaved changes.

**Main Elements**:
- Modal overlay
- Message: "You have unsaved changes. Are you sure you want to leave?"
- "Stay" button (cancel)
- "Leave" button (confirm)

**Handled Events**:
- Stay button: close dialog, remain on page
- Leave button: confirm navigation, discard changes

**Required Types**: None

**Props**:
```typescript
isOpen: boolean
onStay: () => void
onLeave: () => void
```

### 4.10 LoadingSkeleton

**Description**: Skeleton placeholder displayed while fetching recipe data.

**Main Elements**:
- Skeleton for form title
- Skeleton for basic info fields
- Skeleton for category checkboxes
- Skeleton for ingredient rows
- Skeleton for step rows

**Props**: None

### 4.11 NotFoundMessage

**Description**: Error message displayed when recipe is not found or user is unauthorized.

**Main Elements**:
- Error icon
- Heading: "Recipe Not Found"
- Message: "This recipe doesn't exist or you don't have permission to edit it."
- Button: "Back to Recipes" (navigates to /recipes)

**Props**: None

## 5. Types

### 5.1 API Response DTOs

```typescript
// GET /api/v1/recipes/{id} response
interface RecipeDetailResponse {
  status: 'success' | 'error';
  message: string;
  data: RecipeDetailDTO;
}

interface RecipeDetailDTO {
  id: number;
  title: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  cookingTimeMinutes: number;
  categories: CategoryDTO[];
  ingredients: IngredientDetailDTO[];
  steps: StepDetailDTO[];
  createdAt: string;
  updatedAt: string;
}

interface CategoryDTO {
  id: number;
  name: string;
}

interface IngredientDetailDTO {
  id: number;
  quantity: string;
  unit: string;
  name: string;
  sortOrder: number;
}

interface StepDetailDTO {
  id: number;
  stepNumber: number;
  instruction: string;
}

// GET /api/v1/categories response
interface CategoriesResponse {
  status: 'success' | 'error';
  message: string;
  data: {
    categories: CategoryDTO[];
  };
}
```

### 5.2 API Request DTOs

```typescript
// PUT /api/v1/recipes/{id} request
interface CreateRecipeRequest {
  title: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  cookingTimeMinutes: number;
  categoryIds: number[];
  ingredients: IngredientDTO[];
  steps: StepDTO[];
}

interface IngredientDTO {
  quantity: string;
  unit: string;
  name: string;
}

interface StepDTO {
  instruction: string;
}

// PUT /api/v1/recipes/{id} response
interface UpdateRecipeResponse {
  status: 'success' | 'error';
  message: string;
  data: {
    recipeId: number;
  };
}
```

### 5.3 View Models (Internal Form State)

```typescript
// Internal form state with IDs preserved for tracking
interface RecipeFormData {
  title: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD' | '';
  cookingTimeMinutes: number | '';
  categoryIds: number[];
  ingredients: IngredientViewModel[];
  steps: StepViewModel[];
}

// ViewModel includes optional ID for tracking existing items
interface IngredientViewModel {
  id?: number;
  quantity: string;
  unit: string;
  name: string;
}

interface StepViewModel {
  id?: number;
  instruction: string;
}

// Form validation errors
interface FormErrors {
  title?: string;
  difficulty?: string;
  cookingTimeMinutes?: string;
  categoryIds?: string;
  ingredients?: Record<number, {
    quantity?: string;
    unit?: string;
    name?: string;
  }>;
  steps?: Record<number, string>;
}
```

### 5.4 Error Response DTOs

```typescript
interface ApiErrorResponse {
  status: 'error';
  message: string;
  data: {
    errors?: Record<string, string>;
  } | null;
}
```

## 6. State Management

### 6.1 Component State

The RecipeEditView uses React's `useState` for local state management:

```typescript
const [isLoading, setIsLoading] = useState(true);
const [recipe, setRecipe] = useState<RecipeDetailDTO | null>(null);
const [categories, setCategories] = useState<CategoryDTO[]>([]);
const [recipeNotFound, setRecipeNotFound] = useState(false);
const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
const [showUnsavedDialog, setShowUnsavedDialog] = useState(false);
const [nextLocation, setNextLocation] = useState<Location | null>(null);
const [isSubmitting, setIsSubmitting] = useState(false);
```

### 6.2 Custom Hooks

#### useRecipeForm

**Purpose**: Manages form state, validation, and transformations.

**Returns**:
```typescript
{
  formData: RecipeFormData;
  errors: FormErrors;
  setFieldValue: (field: string, value: any) => void;
  validateForm: () => boolean;
  resetForm: () => void;
  initializeForm: (recipe: RecipeDetailDTO) => void;
}
```

**Implementation Details**:
- Initializes form with empty state or pre-populated data
- Tracks field changes and marks form as dirty
- Validates individual fields on blur
- Validates entire form on submit
- Transforms RecipeDetailDTO to RecipeFormData (preserving IDs)
- Transforms RecipeFormData to CreateRecipeRequest (removing IDs)

#### useUnsavedChanges

**Purpose**: Tracks unsaved changes and prevents navigation with confirmation.

**Parameters**:
```typescript
{
  hasUnsavedChanges: boolean;
  shouldBlock?: boolean;
}
```

**Returns**:
```typescript
{
  showDialog: boolean;
  handleStay: () => void;
  handleLeave: () => void;
}
```

**Implementation Details**:
- Uses React Router's `useBlocker` to intercept navigation
- Listens to `beforeunload` event for browser navigation
- Displays UnsavedChangesDialog when navigation is blocked
- Allows navigation on "Leave" confirmation

#### useConcurrentEditDetection

**Purpose**: Detects when the same recipe is edited in another browser tab.

**Parameters**:
```typescript
{
  recipeId: number;
}
```

**Implementation Details**:
- Stores recipe edit timestamp in localStorage on mount
- Listens to `storage` event for changes from other tabs
- Shows toast notification when concurrent edit is detected
- Provides "Refresh" action to reload recipe data

**Usage**:
```typescript
useConcurrentEditDetection({ recipeId: recipe.id });
```

## 7. API Integration

### 7.1 Fetch Recipe Data (on mount)

**Endpoint**: `GET /api/v1/recipes/{id}`

**Request**:
- Method: GET
- Headers: `Authorization: Bearer {token}`
- Path: `/api/v1/recipes/{id}`

**Success Response** (200):
```typescript
RecipeDetailResponse
```

**Error Responses**:
- 404: Recipe not found or unauthorized
- 401: Authentication required

**Implementation**:
```typescript
useEffect(() => {
  const fetchRecipe = async () => {
    try {
      setIsLoading(true);
      const token = sessionStorage.getItem('authToken');
      
      const response = await axios.get(`/api/v1/recipes/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setRecipe(response.data.data);
      initializeForm(response.data.data);
    } catch (error) {
      if (error.response?.status === 404) {
        setRecipeNotFound(true);
      } else if (error.response?.status === 401) {
        navigate('/login');
      } else {
        toast.error('Failed to load recipe');
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  fetchRecipe();
}, [id]);
```

### 7.2 Fetch Categories (on mount)

**Endpoint**: `GET /api/v1/categories`

**Request**:
- Method: GET
- Headers: `Authorization: Bearer {token}`

**Success Response** (200):
```typescript
CategoriesResponse
```

**Implementation**:
```typescript
useEffect(() => {
  const fetchCategories = async () => {
    try {
      const token = sessionStorage.getItem('authToken');
      
      const response = await axios.get('/api/v1/categories', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setCategories(response.data.data.categories);
    } catch (error) {
      toast.error('Failed to load categories');
    }
  };
  
  fetchCategories();
}, []);
```

### 7.3 Update Recipe (on submit)

**Endpoint**: `PUT /api/v1/recipes/{id}`

**Request**:
- Method: PUT
- Headers: 
  - `Authorization: Bearer {token}`
  - `Content-Type: application/json`
- Body: `CreateRecipeRequest`

**Success Response** (200):
```typescript
UpdateRecipeResponse
```

**Error Responses**:
- 400: Validation errors
- 404: Recipe not found or unauthorized
- 401: Authentication required

**Implementation**:
```typescript
const handleSubmit = async (data: RecipeFormData) => {
  try {
    setIsSubmitting(true);
    
    if (!validateForm()) {
      return;
    }
    
    const token = sessionStorage.getItem('authToken');
    const requestData: CreateRecipeRequest = transformToRequest(data);
    
    const response = await axios.put(
      `/api/v1/recipes/${id}`,
      requestData,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    
    toast.success('Recipe updated successfully');
    setHasUnsavedChanges(false);
    navigate(`/recipes/${id}`);
  } catch (error) {
    if (error.response?.status === 400) {
      handleValidationErrors(error.response.data.data.errors);
    } else if (error.response?.status === 404) {
      toast.error('Recipe not found');
      navigate('/recipes');
    } else if (error.response?.status === 401) {
      navigate('/login');
    } else {
      toast.error('Failed to update recipe');
    }
  } finally {
    setIsSubmitting(false);
  }
};
```

## 8. User Interactions

### 8.1 Page Load Sequence

1. User navigates to `/recipes/{id}/edit`
2. Component mounts and shows LoadingSkeleton
3. Parallel API calls:
   - Fetch recipe data (GET /api/v1/recipes/{id})
   - Fetch categories (GET /api/v1/categories)
4. On success:
   - Hide LoadingSkeleton
   - Initialize form with recipe data
   - Render RecipeForm with pre-populated data
5. On error:
   - Show NotFoundMessage (404)
   - Redirect to login (401)
   - Show toast error (other errors)

### 8.2 Edit Field

1. User focuses on input field
2. User types/selects value
3. Field value updates in form state
4. Mark `hasUnsavedChanges = true`
5. On blur: validate field and show error if invalid

### 8.3 Add Ingredient/Step

1. User clicks "+ Add Ingredient" or "+ Add Step" button
2. Append new empty row to ingredients/steps array
3. Mark `hasUnsavedChanges = true`
4. Scroll to new row (optional UX enhancement)
5. Focus on first field of new row

### 8.4 Remove Ingredient/Step

1. User clicks remove (trash/X) button on row
2. If minimum count not violated:
   - Remove row from array
   - Mark `hasUnsavedChanges = true`
3. If minimum count would be violated:
   - Disable remove button
   - Show tooltip: "Minimum 1 ingredient required" or "Minimum 2 steps required"

### 8.5 Select/Deselect Category

1. User clicks category checkbox
2. Toggle category ID in `categoryIds` array
3. Mark `hasUnsavedChanges = true`
4. Validate: at least 1 category must be selected
5. Show error if no categories selected

### 8.6 Update Recipe (Submit)

1. User clicks "Update Recipe" button
2. Validate entire form
3. If validation fails:
   - Show error messages on invalid fields
   - Focus on first invalid field
   - Return without submitting
4. If validation passes:
   - Set `isSubmitting = true`
   - Disable submit button (show loading state)
   - Transform form data to CreateRecipeRequest
   - Call PUT /api/v1/recipes/{id}
5. On success:
   - Show toast: "Recipe updated successfully"
   - Set `hasUnsavedChanges = false`
   - Navigate to `/recipes/{id}`
6. On error:
   - Show field-level errors (400)
   - Show toast error message
   - Set `isSubmitting = false`

### 8.7 Cancel Edit

1. User clicks "Cancel" button
2. If `hasUnsavedChanges = true`:
   - Show UnsavedChangesDialog
   - Wait for user choice
3. If user confirms "Leave":
   - Navigate to `/recipes/{id}`
4. If user chooses "Stay":
   - Close dialog, remain on page

### 8.8 Navigate Away with Unsaved Changes

1. User attempts to navigate (clicks link, back button, etc.)
2. Navigation is blocked by `useBlocker`
3. Show UnsavedChangesDialog
4. If user confirms "Leave":
   - Allow navigation to proceed
5. If user chooses "Stay":
   - Cancel navigation, remain on page

### 8.9 Browser Navigation with Unsaved Changes

1. User attempts to close tab, refresh, or navigate away
2. `beforeunload` event listener is triggered
3. Browser shows native confirmation dialog
4. If user confirms:
   - Allow browser navigation
5. If user cancels:
   - Prevent browser navigation

### 8.10 Concurrent Edit Detection

1. User edits recipe in Tab A
2. User opens same recipe in Tab B
3. Tab A saves recipe, updates localStorage timestamp
4. Tab B detects `storage` event change
5. Tab B shows toast: "This recipe was modified in another tab. Refresh to see latest changes."
6. Toast includes "Refresh" button
7. User clicks "Refresh":
   - Refetch recipe data
   - Show warning: "Refreshing will discard your unsaved changes"
   - If confirmed: reload data and reset form

## 9. Conditions and Validation

### 9.1 Client-Side Validation Rules

All validation rules match the API requirements to provide immediate feedback:

**Title**:
- Condition: Required, 1-100 characters
- Component: BasicInfoSection → TitleInput
- Error messages:
  - Empty: "Title is required"
  - Too long: "Title must be 100 characters or less"
- When validated: On blur, on submit

**Difficulty**:
- Condition: Required, must be EASY, MEDIUM, or HARD
- Component: BasicInfoSection → DifficultySelect
- Error messages:
  - Empty: "Difficulty is required"
- When validated: On change, on submit

**Cooking Time**:
- Condition: Required, positive integer (minimum 1)
- Component: BasicInfoSection → CookingTimeInput
- Error messages:
  - Empty: "Cooking time is required"
  - Not positive: "Cooking time must be at least 1 minute"
- When validated: On blur, on submit

**Categories**:
- Condition: At least 1 category selected
- Component: CategoriesSection
- Error messages:
  - None selected: "At least one category is required"
- When validated: On change, on submit
- UI state: If no categories selected, show error below checkboxes

**Ingredients**:
- Condition: Minimum 1 ingredient
- Component: IngredientsSection
- Error messages:
  - None: "At least one ingredient is required"
- When validated: On remove, on submit
- UI state: Disable remove button when only 1 ingredient remains

**Each Ingredient**:
- Quantity:
  - Condition: Required, max 20 characters
  - Error messages:
    - Empty: "Quantity is required"
    - Too long: "Quantity must be 20 characters or less"
- Unit:
  - Condition: Required, max 20 characters
  - Error messages:
    - Empty: "Unit is required"
    - Too long: "Unit must be 20 characters or less"
- Name:
  - Condition: Required, max 50 characters
  - Error messages:
    - Empty: "Name is required"
    - Too long: "Name must be 50 characters or less"
- When validated: On blur, on submit

**Steps**:
- Condition: Minimum 2 steps
- Component: StepsSection
- Error messages:
  - Less than 2: "At least two steps are required"
- When validated: On remove, on submit
- UI state: Disable remove button when only 2 steps remain

**Each Step**:
- Instruction:
  - Condition: Required, 1-500 characters
  - Error messages:
    - Empty: "Instruction is required"
    - Too long: "Instruction must be 500 characters or less"
- When validated: On blur, on submit

### 9.2 Validation Timing

- **Real-time validation**: On field blur (not on every keystroke to avoid annoying users)
- **Array validation**: On add/remove operations
- **Complete validation**: On form submit
- **Character counters**: Update on every keystroke (non-blocking)

### 9.3 Validation Error Display

- **Field-level errors**: Red border around invalid field, error text below in red
- **Section-level errors**: Error message at top of section (e.g., categories)
- **Form-level errors**: Scroll to first invalid field on submit attempt
- **Error clearing**: Errors clear when field becomes valid

### 9.4 UI State Based on Validation

| Condition | UI State |
|-----------|----------|
| Form is valid | "Update Recipe" button enabled |
| Form has errors | "Update Recipe" button enabled (will show errors on click) |
| Form is submitting | "Update Recipe" button disabled with spinner |
| Only 1 ingredient | Remove button on ingredient disabled |
| Only 2 steps | Remove button on step disabled |
| No categories selected | Error message shown below checkboxes |
| Field invalid | Red border, error text below field |

## 10. Error Handling

### 10.1 API Error Scenarios

**Recipe Not Found (404)**:
- Scenario: Recipe doesn't exist or user doesn't own it
- UI Response:
  - Show NotFoundMessage component
  - Display: "Recipe Not Found" with explanation
  - Provide "Back to Recipes" button → `/recipes`

**Unauthorized (401)**:
- Scenario: JWT token missing, invalid, or expired
- UI Response:
  - Clear token from sessionStorage
  - Redirect to `/login`
  - Show toast: "Your session has expired. Please log in again."

**Validation Errors (400)**:
- Scenario: Server-side validation fails
- UI Response:
  - Parse error response
  - Map errors to form fields
  - Display field-level error messages
  - Focus first invalid field
  - Keep form data intact (don't reset)

**Category Not Found (404 with specific message)**:
- Scenario: Invalid category ID in request
- UI Response:
  - Show toast: "Invalid category selected"
  - Refetch categories list
  - Clear invalid category selection

**Network Error**:
- Scenario: No internet connection, server unreachable
- UI Response:
  - Show toast: "Network error. Please check your connection."
  - Keep form data intact
  - Allow user to retry

**Internal Server Error (500)**:
- Scenario: Unexpected server error
- UI Response:
  - Show toast: "An unexpected error occurred. Please try again later."
  - Keep form data intact
  - Log error to console for debugging

### 10.2 Client-Side Error Scenarios

**Invalid Recipe ID in URL**:
- Scenario: URL contains non-numeric ID (e.g., `/recipes/abc/edit`)
- UI Response:
  - Show NotFoundMessage
  - Provide "Back to Recipes" button

**Form Pre-population Failure**:
- Scenario: Recipe data malformed or missing required fields
- UI Response:
  - Show toast: "Failed to load recipe data"
  - Redirect to `/recipes`

**Concurrent Edit Conflict**:
- Scenario: Recipe edited in another tab during current edit session
- UI Response:
  - Show toast with warning icon
  - Message: "This recipe was modified in another tab. Refresh to see latest changes."
  - Action: "Refresh" button
  - On refresh: warn about losing unsaved changes

### 10.3 Edge Cases

**Empty Categories List**:
- Scenario: GET /api/v1/categories returns empty array
- UI Response:
  - Disable category selection
  - Show warning: "No categories available. Please contact support."

**Extremely Long Ingredient/Step Lists**:
- Scenario: Recipe has 50+ ingredients or steps
- UI Response:
  - Render all rows (no pagination in MVP)
  - May impact performance (acceptable for MVP)

**Browser Back Button During Edit**:
- Scenario: User clicks browser back with unsaved changes
- UI Response:
  - Block navigation with `useBlocker`
  - Show UnsavedChangesDialog

**Tab Close During Submit**:
- Scenario: User closes tab while form is submitting
- UI Response:
  - `beforeunload` event warns user
  - Request may or may not complete (no retry logic in MVP)

**Token Expiration During Edit**:
- Scenario: User starts editing, token expires (24 hours), then submits
- UI Response:
  - API returns 401
  - Redirect to login
  - Data is lost (no draft save in MVP)

## 11. Implementation Steps

### Step 1: Set Up Route and Basic Container

1. Add route to React Router configuration:
   ```javascript
   <Route path="/recipes/:id/edit" element={<RecipeEditView />} />
   ```
2. Create `RecipeEditView.jsx` component file
3. Implement basic container structure with loading state
4. Add `useParams()` to extract recipe ID from URL
5. Add `useNavigate()` for programmatic navigation

### Step 2: Create Type Definitions

1. Create `types/recipe.ts` file
2. Define all DTOs and ViewModels listed in Section 5
3. Export types for use across components:
   - RecipeDetailDTO
   - CategoryDTO
   - CreateRecipeRequest
   - RecipeFormData
   - IngredientViewModel
   - StepViewModel
   - FormErrors

### Step 3: Implement Data Fetching

1. Create `useEffect` hook in RecipeEditView for recipe fetch
2. Create `useEffect` hook for categories fetch
3. Implement parallel API calls using Promise.all (optional optimization)
4. Handle loading states with `isLoading` state variable
5. Handle error states (404, 401, network errors)
6. Implement error handling with toast notifications
7. Create LoadingSkeleton component for loading state
8. Create NotFoundMessage component for 404 state

### Step 4: Create RecipeForm Component (Reusable)

1. Create `RecipeForm.jsx` component file
2. Define component props interface:
   - initialData?: RecipeDetailDTO
   - categories: CategoryDTO[]
   - onSubmit: callback
   - onCancel: callback
   - submitButtonText: string
   - isSubmitting: boolean
3. Implement form initialization logic (empty vs pre-populated)
4. Set up form sections structure
5. Add form action buttons (submit, cancel)

### Step 5: Implement useRecipeForm Hook

1. Create `hooks/useRecipeForm.js` file
2. Implement form state management:
   - formData state
   - errors state
   - dirty tracking
3. Implement field change handlers
4. Implement validation functions:
   - validateField(field, value)
   - validateForm()
5. Implement form transformations:
   - initializeForm(recipe: RecipeDetailDTO)
   - transformToRequest(formData): CreateRecipeRequest
6. Return hook interface with necessary functions

### Step 6: Build Form Sections - Basic Info

1. Create `BasicInfoSection.jsx` component
2. Implement title input:
   - TextField with label "Title"
   - Character counter "X/100"
   - Error message display
3. Implement difficulty select:
   - Dropdown with options: Easy, Medium, Hard
   - Error message display
4. Implement cooking time input:
   - Number input with label "Cooking Time"
   - Suffix label "minutes"
   - Error message display
5. Wire up onChange handlers
6. Wire up validation on blur

### Step 7: Build Form Sections - Categories

1. Create `CategoriesSection.jsx` component
2. Implement checkbox group:
   - Render checkbox for each category
   - Track selected category IDs
   - Multi-select capability
3. Implement onChange handler for checkbox toggle
4. Implement validation: minimum 1 selected
5. Display error message when no categories selected

### Step 8: Build Form Sections - Ingredients

1. Create `IngredientsSection.jsx` component
2. Create `IngredientRow.jsx` component
3. Implement dynamic array rendering:
   - Map over ingredients array
   - Render IngredientRow for each
4. Implement IngredientRow:
   - Three text fields: quantity, unit, name
   - Remove button (trash icon)
   - Error messages for each field
5. Implement "+ Add Ingredient" button
6. Implement add handler: append empty row
7. Implement remove handler: delete row (if count > 1)
8. Disable remove button when only 1 ingredient
9. Wire up onChange handlers for each field

### Step 9: Build Form Sections - Steps

1. Create `StepsSection.jsx` component
2. Create `StepRow.jsx` component
3. Implement dynamic array rendering:
   - Map over steps array with index
   - Render StepRow for each
4. Implement StepRow:
   - Step number badge (index + 1)
   - Textarea for instruction
   - Character counter "X/500"
   - Remove button (trash icon)
   - Error message display
5. Implement "+ Add Step" button
6. Implement add handler: append empty row
7. Implement remove handler: delete row (if count > 2)
8. Disable remove button when only 2 steps
9. Wire up onChange handler for textarea

### Step 10: Implement Form Submission

1. In RecipeEditView, create handleSubmit function
2. Extract form data from RecipeForm
3. Validate form using useRecipeForm.validateForm()
4. Transform formData to CreateRecipeRequest
5. Make PUT request to `/api/v1/recipes/{id}`
6. Handle success:
   - Show toast: "Recipe updated successfully"
   - Reset unsaved changes flag
   - Navigate to recipe detail: `/recipes/{id}`
7. Handle errors:
   - 400: map validation errors to form fields
   - 404: show toast, navigate to /recipes
   - 401: redirect to login
   - Others: show generic error toast

### Step 11: Implement Unsaved Changes Detection

1. Create `hooks/useUnsavedChanges.js` hook
2. Implement dirty tracking:
   - Track when form data changes
   - Set hasUnsavedChanges flag
3. Implement React Router blocking:
   - Use `useBlocker` to intercept navigation
   - Show confirmation dialog when blocked
4. Implement browser navigation blocking:
   - Add `beforeunload` event listener
   - Show browser's native confirmation
5. Create UnsavedChangesDialog component:
   - Modal with confirmation message
   - "Stay" and "Leave" buttons
6. Wire up dialog to useUnsavedChanges hook
7. Clear unsaved flag on successful submit

### Step 12: Implement Concurrent Edit Detection

1. Create `hooks/useConcurrentEditDetection.js` hook
2. On component mount:
   - Store edit timestamp in localStorage key: `recipe_edit_{id}`
3. Add `storage` event listener:
   - Listen for changes to localStorage from other tabs
   - Check if timestamp for current recipe changed
4. On concurrent edit detected:
   - Show toast with warning icon
   - Message: "This recipe was modified in another tab. Refresh to see latest changes."
   - Add "Refresh" action button
5. Implement refresh action:
   - Warn about losing unsaved changes
   - If confirmed: refetch recipe data and reset form

### Step 13: Add Loading and Error States

1. Enhance LoadingSkeleton component:
   - Skeleton for page title
   - Skeleton for form sections
   - Use Material-UI Skeleton or custom shimmer
2. Enhance NotFoundMessage component:
   - Error icon
   - Clear heading and message
   - "Back to Recipes" button
3. Add loading spinner to submit button when isSubmitting
4. Add optimistic UI updates (optional enhancement):
   - Show success state immediately
   - Rollback on error

### Step 14: Form Validation Refinements

1. Add real-time character counters:
   - Title: show "X/100"
   - Each ingredient field: show count when approaching limit
   - Each step instruction: show "X/500"
2. Implement focus management:
   - Focus first invalid field on validation failure
   - Focus new row when added
3. Add helpful placeholder text:
   - Title: "e.g., Chocolate Chip Cookies"
   - Quantity: "e.g., 2"
   - Unit: "e.g., cups"
   - Name: "e.g., all-purpose flour"
   - Instruction: "Describe the step in detail..."
4. Ensure accessibility:
   - Proper labels for all inputs
   - aria-invalid on error states
   - aria-describedby linking to error messages

### Step 15: Handle Cancel Action

1. Implement cancel button onClick handler
2. Check if hasUnsavedChanges is true
3. If true: show UnsavedChangesDialog
4. If false: navigate directly to `/recipes/{id}`
5. On "Leave" confirmation: navigate to detail view
6. On "Stay": close dialog, remain on page

### Step 16: Styling and Responsive Design

1. Apply component library styles (Material-UI or Ant Design)
2. Ensure mobile responsiveness:
   - Stack form fields vertically on mobile
   - Full-width inputs on small screens
   - Touch-friendly button sizes (44x44px minimum)
3. Add section spacing and visual hierarchy
4. Style difficulty badges with colors:
   - EASY: green
   - MEDIUM: yellow
   - HARD: red
5. Style validation errors consistently:
   - Red border on invalid fields
   - Red text for error messages
6. Style toast notifications with icons

### Step 17: Integration Testing

1. Test full edit flow:
   - Navigate to /recipes/{id}/edit
   - Verify recipe data loads and pre-populates
   - Edit all fields
   - Submit and verify success
2. Test validation:
   - Clear required fields and verify errors
   - Exceed character limits and verify errors
   - Deselect all categories and verify error
   - Remove ingredients/steps to minimum and verify remove disabled
3. Test error scenarios:
   - Edit non-existent recipe (404)
   - Edit another user's recipe (404)
   - Submit with expired token (401)
   - Submit with network error
4. Test unsaved changes:
   - Edit form and navigate away (via link)
   - Edit form and close browser tab
   - Verify confirmation dialogs appear
5. Test concurrent edits:
   - Open recipe in two tabs
   - Edit and save in one tab
   - Verify toast appears in other tab
6. Test cancel action:
   - Cancel with unsaved changes
   - Cancel without changes

### Step 18: Error Handling Refinements

1. Add global error boundary for React errors
2. Add retry mechanism for network errors (optional)
3. Log errors to console for debugging
4. Ensure all error messages are user-friendly
5. Test all error paths end-to-end

### Step 19: Performance Optimization

1. Debounce validation on text inputs (optional)
2. Memoize heavy computations (if any)
3. Lazy load components (if bundle size is large)
4. Optimize re-renders with React.memo (if needed)
5. Test performance with large ingredient/step lists

### Step 20: Final Polish

1. Add smooth transitions for dialog appearance
2. Add loading animations for better UX
3. Ensure keyboard navigation works throughout form
4. Test on multiple browsers (Chrome, Firefox, Safari)
5. Test on mobile devices (iOS, Android)
6. Verify all toast messages are consistent
7. Code review and cleanup
8. Update documentation with any deviations from plan
