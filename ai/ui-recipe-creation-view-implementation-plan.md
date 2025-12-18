# View Implementation Plan: Recipe Creation View

## 1. Overview

The Recipe Creation View is a single-page form that allows authenticated users to create new recipes. Users enter recipe details including title, difficulty level, cooking time, ingredients (minimum 1), steps (minimum 2), and category assignments (minimum 1). The form provides real-time validation, dynamic ingredient/step management, and displays success/error feedback. Upon successful creation, users are redirected to the recipe detail view.

## 2. View Routing

**Path**: `/recipes/new`  
**Authentication**: Required (JWT token must be present)  
**Navigation**: Accessible from the recipe list view via "Create Recipe" or "Add Recipe" button

## 3. Component Structure

```
CreateRecipeView
├── PageHeader
│   └── Title: "Create New Recipe"
├── RecipeForm
│   ├── BasicInfoSection
│   │   ├── TitleInput (with character counter)
│   │   ├── DifficultySelect (dropdown)
│   │   └── CookingTimeInput (number input)
│   ├── CategorySection
│   │   └── CategorySelector (multi-select with chips)
│   ├── IngredientsSection
│   │   ├── SectionHeader (with count indicator)
│   │   ├── IngredientRow[] (dynamic list, minimum 1)
│   │   └── AddIngredientButton
│   ├── StepsSection
│   │   ├── SectionHeader (with count indicator)
│   │   ├── StepItem[] (dynamic list, minimum 2)
│   │   └── AddStepButton
│   └── FormActions
│       ├── CancelButton
│       └── SaveButton
├── UnsavedChangesDialog
└── ToastNotifications
```

## 4. Component Details

### 4.1 CreateRecipeView (Main Container)

**Description**: Root component that orchestrates the entire recipe creation flow. Manages overall form state, handles API integration, navigation guards, and success/error handling.

**Main Elements**:
- Container div with responsive layout
- PageHeader component
- RecipeForm component
- UnsavedChangesDialog component

**Handled Events**:
- Form submission (Save button click)
- Navigation attempts with unsaved changes
- Form cancellation (Cancel button click)

**Validation Conditions**:
- Form-level validation before submission
- Ensures all required fields meet API constraints
- Validates minimum ingredient count (1)
- Validates minimum step count (2)
- Validates minimum category count (1)

**Required Types**:
- `CreateRecipeFormData` (ViewModel)
- `CreateRecipeRequest` (DTO)
- `ApiResponse<RecipeIdResponse>` (DTO)
- `CategoryDTO` (DTO)

**Props**: None (root component)

### 4.2 BasicInfoSection

**Description**: Groups basic recipe information fields including title, difficulty, and cooking time. Provides real-time validation feedback for each field.

**Main Elements**:
- Section wrapper div
- TitleInput component (text input with character counter)
- DifficultySelect component (dropdown/select)
- CookingTimeInput component (number input with "minutes" label)

**Handled Events**:
- Input blur (triggers validation)
- Input change (updates form state, revalidates if previously touched)

**Validation Conditions**:
- Title: Required, 1-100 characters
- Difficulty: Required, must be one of EASY|MEDIUM|HARD
- Cooking Time: Required, positive integer (minimum 1)

**Required Types**:
- `CreateRecipeFormData` (subset: title, difficulty, cookingTimeMinutes)

**Props**:
```typescript
interface BasicInfoSectionProps {
  title: string;
  difficulty: string;
  cookingTimeMinutes: number | null;
  errors: {
    title?: string;
    difficulty?: string;
    cookingTimeMinutes?: string;
  };
  touched: {
    title?: boolean;
    difficulty?: boolean;
    cookingTimeMinutes?: boolean;
  };
  onFieldChange: (field: string, value: any) => void;
  onFieldBlur: (field: string) => void;
}
```

### 4.3 CategorySection

**Description**: Allows users to select one or more categories for the recipe using a multi-select chip interface. Displays all available categories fetched from the API.

**Main Elements**:
- Section wrapper div
- Section label "Categories" with required indicator
- CategorySelector component (chips or checkboxes)
- Error message display
- Count indicator showing selected categories vs minimum requirement

**Handled Events**:
- Category selection/deselection
- "Select All" toggle (if implemented)

**Validation Conditions**:
- At least 1 category must be selected
- All selected category IDs must exist in the database

**Required Types**:
- `CategoryDTO[]` (list of available categories)
- `CreateRecipeFormData` (subset: categoryIds)

**Props**:
```typescript
interface CategorySectionProps {
  categories: CategoryDTO[];
  selectedCategoryIds: number[];
  error?: string;
  touched?: boolean;
  onCategoryToggle: (categoryId: number) => void;
}
```

### 4.4 IngredientsSection

**Description**: Manages dynamic list of ingredient rows. Ensures at least one ingredient row is always visible. Provides visual feedback on ingredient count and minimum requirement status.

**Main Elements**:
- Section wrapper div
- Section header with title "Ingredients" and count indicator
- List of IngredientRow components
- "Add Ingredient" button
- Error message for minimum requirement

**Handled Events**:
- Add ingredient button click
- Remove ingredient (from child IngredientRow)
- Ingredient field changes (from child IngredientRow)

**Validation Conditions**:
- Minimum 1 ingredient required
- Count indicator shows green when >= 1, red when 0

**Required Types**:
- `IngredientFormData[]`
- `CreateRecipeFormData` (subset: ingredients)

**Props**:
```typescript
interface IngredientsSectionProps {
  ingredients: IngredientFormData[];
  errors: {
    [index: number]: {
      quantity?: string;
      unit?: string;
      name?: string;
    };
  };
  touched: {
    [index: number]: {
      quantity?: boolean;
      unit?: boolean;
      name?: boolean;
    };
  };
  onAddIngredient: () => void;
  onRemoveIngredient: (index: number) => void;
  onIngredientChange: (index: number, field: string, value: string) => void;
  onIngredientBlur: (index: number, field: string) => void;
}
```

### 4.5 IngredientRow

**Description**: Represents a single ingredient with quantity, unit, and name fields. Includes a delete button that is disabled when it's the only row.

**Main Elements**:
- Row wrapper div (flex layout)
- Quantity input (max 20 chars, supports fractions)
- Unit input (max 20 chars)
- Name input (max 50 chars)
- Delete button (X icon or trash icon)

**Handled Events**:
- Input changes (quantity, unit, name)
- Input blur (triggers validation)
- Delete button click

**Validation Conditions**:
- Quantity: Required, max 20 characters
- Unit: Required, max 20 characters
- Name: Required, max 50 characters

**Required Types**:
- `IngredientFormData`

**Props**:
```typescript
interface IngredientRowProps {
  index: number;
  ingredient: IngredientFormData;
  errors?: {
    quantity?: string;
    unit?: string;
    name?: string;
  };
  touched?: {
    quantity?: boolean;
    unit?: boolean;
    name?: boolean;
  };
  isOnlyRow: boolean;
  onIngredientChange: (field: string, value: string) => void;
  onIngredientBlur: (field: string) => void;
  onRemove: () => void;
}
```

### 4.6 StepsSection

**Description**: Manages dynamic list of step items. Ensures at least two steps are always visible. Provides auto-numbering and optional reordering functionality.

**Main Elements**:
- Section wrapper div
- Section header with title "Steps" and count indicator
- List of StepItem components
- "Add Step" button
- Error message for minimum requirement

**Handled Events**:
- Add step button click
- Remove step (from child StepItem)
- Step reordering (up/down arrows)
- Step text changes (from child StepItem)

**Validation Conditions**:
- Minimum 2 steps required
- Count indicator shows green when >= 2, red when < 2

**Required Types**:
- `StepFormData[]`
- `CreateRecipeFormData` (subset: steps)

**Props**:
```typescript
interface StepsSectionProps {
  steps: StepFormData[];
  errors: {
    [index: number]: string;
  };
  touched: {
    [index: number]: boolean;
  };
  onAddStep: () => void;
  onRemoveStep: (index: number) => void;
  onStepChange: (index: number, value: string) => void;
  onStepBlur: (index: number) => void;
  onMoveStepUp: (index: number) => void;
  onMoveStepDown: (index: number) => void;
}
```

### 4.7 StepItem

**Description**: Represents a single recipe step with auto-numbering, text area, character counter, and reordering controls.

**Main Elements**:
- Row wrapper div
- Step number display (auto-generated, read-only)
- Text area (max 500 chars)
- Character counter ("150/500")
- Up arrow button (disabled for first item)
- Down arrow button (disabled for last item)
- Delete button (disabled when only 2 steps exist)

**Handled Events**:
- Text area changes
- Text area blur
- Up arrow click
- Down arrow click
- Delete button click

**Validation Conditions**:
- Instruction: Required, 1-500 characters

**Required Types**:
- `StepFormData`

**Props**:
```typescript
interface StepItemProps {
  index: number;
  step: StepFormData;
  error?: string;
  touched?: boolean;
  isFirst: boolean;
  isLast: boolean;
  canDelete: boolean;
  onStepChange: (value: string) => void;
  onStepBlur: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onRemove: () => void;
}
```

### 4.8 FormActions

**Description**: Provides Cancel and Save buttons for form submission and cancellation.

**Main Elements**:
- Button group wrapper div
- Cancel button (secondary style)
- Save button (primary style)

**Handled Events**:
- Cancel button click (triggers navigation with unsaved changes check)
- Save button click (triggers form validation and submission)

**Validation Conditions**: None (validation handled by parent)

**Required Types**: None

**Props**:
```typescript
interface FormActionsProps {
  isSubmitting: boolean;
  onCancel: () => void;
  onSave: () => void;
}
```

### 4.9 UnsavedChangesDialog

**Description**: Confirmation dialog that appears when user attempts to navigate away with unsaved changes.

**Main Elements**:
- Modal overlay
- Dialog container
- Warning message: "You have unsaved changes. Are you sure you want to leave?"
- Cancel button (stays on page)
- Confirm button (navigates away, discards changes)

**Handled Events**:
- Cancel button click
- Confirm button click
- Modal backdrop click (closes dialog)

**Validation Conditions**: None

**Required Types**: None

**Props**:
```typescript
interface UnsavedChangesDialogProps {
  isOpen: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}
```

## 5. Types

### 5.1 DTOs (Data Transfer Objects - API Communication)

**CreateRecipeRequest** - Request body for POST /api/v1/recipes
```typescript
interface CreateRecipeRequest {
  title: string;                    // 1-100 characters, required
  difficulty: 'EASY' | 'MEDIUM' | 'HARD'; // required
  cookingTimeMinutes: number;       // positive integer, required
  categoryIds: number[];            // min 1, required
  ingredients: IngredientRequest[]; // min 1, required
  steps: StepRequest[];             // min 2, required
}
```

**IngredientRequest** - Nested DTO for ingredients
```typescript
interface IngredientRequest {
  quantity: string; // max 20 chars, supports fractions (e.g., "1/2")
  unit: string;     // max 20 chars
  name: string;     // max 50 chars
}
```

**StepRequest** - Nested DTO for steps
```typescript
interface StepRequest {
  instruction: string; // 1-500 chars
}
```

**RecipeIdResponse** - Response data on success
```typescript
interface RecipeIdResponse {
  recipeId: number;
}
```

**ApiResponse<T>** - Generic API response wrapper
```typescript
interface ApiResponse<T> {
  status: 'success' | 'error';
  message: string;
  data: T | null;
}
```

**ErrorDetails** - Error response data
```typescript
interface ErrorDetails {
  errors: {
    [fieldName: string]: string;
  };
}
```

**CategoryDTO** - Category data from GET /api/v1/categories
```typescript
interface CategoryDTO {
  id: number;
  name: string;
}
```

### 5.2 ViewModels (Client-Side State Management)

**CreateRecipeFormData** - Complete form state
```typescript
interface CreateRecipeFormData {
  title: string;
  difficulty: string;               // '' initially, 'EASY'|'MEDIUM'|'HARD' after selection
  cookingTimeMinutes: number | null;
  categoryIds: number[];
  ingredients: IngredientFormData[];
  steps: StepFormData[];
}
```

**IngredientFormData** - Individual ingredient state
```typescript
interface IngredientFormData {
  quantity: string;
  unit: string;
  name: string;
}
```

**StepFormData** - Individual step state
```typescript
interface StepFormData {
  instruction: string;
}
```

**FormErrors** - Validation error state
```typescript
interface FormErrors {
  title?: string;
  difficulty?: string;
  cookingTimeMinutes?: string;
  categoryIds?: string;
  ingredients?: {
    [index: number]: {
      quantity?: string;
      unit?: string;
      name?: string;
    };
  };
  steps?: {
    [index: number]: string;
  };
}
```

**FormTouched** - Tracks which fields have been interacted with
```typescript
interface FormTouched {
  title?: boolean;
  difficulty?: boolean;
  cookingTimeMinutes?: boolean;
  categoryIds?: boolean;
  ingredients?: {
    [index: number]: {
      quantity?: boolean;
      unit?: boolean;
      name?: boolean;
    };
  };
  steps?: {
    [index: number]: boolean;
  };
}
```

## 6. State Management

### 6.1 Custom Hook: useRecipeForm

A custom hook to encapsulate form state management, validation logic, and form operations.

**Purpose**: Centralize form logic, reduce component complexity, enable reusability for edit view.

**State Variables**:
```typescript
const useRecipeForm = (initialData?: CreateRecipeFormData) => {
  const [formData, setFormData] = useState<CreateRecipeFormData>(initialData || getInitialFormData());
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<FormTouched>({});
  const [isDirty, setIsDirty] = useState<boolean>(false);
  
  // Functions returned:
  // - updateField(field, value)
  // - handleBlur(field)
  // - addIngredient()
  // - removeIngredient(index)
  // - updateIngredient(index, field, value)
  // - addStep()
  // - removeStep(index)
  // - updateStep(index, value)
  // - moveStepUp(index)
  // - moveStepDown(index)
  // - validateForm()
  // - resetForm()
  // - getFormData()
};
```

**Helper Function**:
```typescript
const getInitialFormData = (): CreateRecipeFormData => ({
  title: '',
  difficulty: '',
  cookingTimeMinutes: null,
  categoryIds: [],
  ingredients: [{ quantity: '', unit: '', name: '' }], // 1 empty row
  steps: [
    { instruction: '' },
    { instruction: '' }
  ] // 2 empty rows
});
```

**Validation Logic**:
```typescript
const validateForm = (data: CreateRecipeFormData): FormErrors => {
  const errors: FormErrors = {};
  
  // Title validation
  if (!data.title || data.title.trim() === '') {
    errors.title = 'Title is required';
  } else if (data.title.length > 100) {
    errors.title = 'Title must not exceed 100 characters';
  }
  
  // Difficulty validation
  if (!data.difficulty) {
    errors.difficulty = 'Difficulty is required';
  } else if (!['EASY', 'MEDIUM', 'HARD'].includes(data.difficulty)) {
    errors.difficulty = 'Difficulty must be EASY, MEDIUM, or HARD';
  }
  
  // Cooking time validation
  if (!data.cookingTimeMinutes) {
    errors.cookingTimeMinutes = 'Cooking time is required';
  } else if (data.cookingTimeMinutes < 1) {
    errors.cookingTimeMinutes = 'Cooking time must be at least 1 minute';
  }
  
  // Category validation
  if (!data.categoryIds || data.categoryIds.length === 0) {
    errors.categoryIds = 'At least one category is required';
  }
  
  // Ingredients validation
  const validIngredients = data.ingredients.filter(
    ing => ing.quantity || ing.unit || ing.name
  );
  
  if (validIngredients.length === 0) {
    errors.ingredients = { 0: { name: 'At least one ingredient is required' } };
  } else {
    const ingredientErrors: FormErrors['ingredients'] = {};
    validIngredients.forEach((ing, idx) => {
      const ingErrors: any = {};
      
      if (!ing.quantity) ingErrors.quantity = 'Quantity is required';
      else if (ing.quantity.length > 20) ingErrors.quantity = 'Quantity must not exceed 20 characters';
      
      if (!ing.unit) ingErrors.unit = 'Unit is required';
      else if (ing.unit.length > 20) ingErrors.unit = 'Unit must not exceed 20 characters';
      
      if (!ing.name) ingErrors.name = 'Name is required';
      else if (ing.name.length > 50) ingErrors.name = 'Name must not exceed 50 characters';
      
      if (Object.keys(ingErrors).length > 0) {
        ingredientErrors[idx] = ingErrors;
      }
    });
    
    if (Object.keys(ingredientErrors).length > 0) {
      errors.ingredients = ingredientErrors;
    }
  }
  
  // Steps validation
  const validSteps = data.steps.filter(step => step.instruction.trim());
  
  if (validSteps.length < 2) {
    errors.steps = { 0: 'At least two steps are required' };
  } else {
    const stepErrors: FormErrors['steps'] = {};
    validSteps.forEach((step, idx) => {
      if (!step.instruction || step.instruction.trim() === '') {
        stepErrors[idx] = 'Instruction is required';
      } else if (step.instruction.length > 500) {
        stepErrors[idx] = 'Instruction must not exceed 500 characters';
      }
    });
    
    if (Object.keys(stepErrors).length > 0) {
      errors.steps = stepErrors;
    }
  }
  
  return errors;
};
```

### 6.2 Component State

**CreateRecipeView State**:
```typescript
const [categories, setCategories] = useState<CategoryDTO[]>([]);
const [isLoadingCategories, setIsLoadingCategories] = useState<boolean>(true);
const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
const [showUnsavedDialog, setShowUnsavedDialog] = useState<boolean>(false);
const [pendingNavigation, setPendingNavigation] = useState<string | null>(null);
```

## 7. API Integration

### 7.1 API Calls

**Fetch Categories (on component mount)**:
```typescript
// GET /api/v1/categories
const fetchCategories = async () => {
  try {
    setIsLoadingCategories(true);
    const response = await axios.get<ApiResponse<{ categories: CategoryDTO[] }>>(
      '/api/v1/categories'
    );
    
    if (response.data.status === 'success' && response.data.data) {
      setCategories(response.data.data.categories);
    }
  } catch (error) {
    toast.error('Failed to load categories');
    console.error('Category fetch error:', error);
  } finally {
    setIsLoadingCategories(false);
  }
};

useEffect(() => {
  fetchCategories();
}, []);
```

**Create Recipe (on form submission)**:
```typescript
// POST /api/v1/recipes
const handleSubmit = async () => {
  const validationErrors = validateForm(formData);
  
  if (Object.keys(validationErrors).length > 0) {
    setErrors(validationErrors);
    // Focus first invalid field
    const firstErrorField = Object.keys(validationErrors)[0];
    document.querySelector(`[name="${firstErrorField}"]`)?.focus();
    toast.error('Please fix validation errors');
    return;
  }
  
  try {
    setIsSubmitting(true);
    
    // Transform form data to API request format
    const request: CreateRecipeRequest = {
      title: formData.title.trim(),
      difficulty: formData.difficulty as 'EASY' | 'MEDIUM' | 'HARD',
      cookingTimeMinutes: formData.cookingTimeMinutes!,
      categoryIds: formData.categoryIds,
      ingredients: formData.ingredients
        .filter(ing => ing.quantity && ing.unit && ing.name)
        .map(ing => ({
          quantity: ing.quantity.trim(),
          unit: ing.unit.trim(),
          name: ing.name.trim()
        })),
      steps: formData.steps
        .filter(step => step.instruction.trim())
        .map(step => ({
          instruction: step.instruction.trim()
        }))
    };
    
    const response = await axios.post<ApiResponse<RecipeIdResponse>>(
      '/api/v1/recipes',
      request
    );
    
    if (response.data.status === 'success' && response.data.data) {
      toast.success('Recipe created successfully');
      setIsDirty(false);
      // Redirect to recipe detail view
      navigate(`/recipes/${response.data.data.recipeId}`);
    }
  } catch (error: any) {
    if (error.response?.status === 400 && error.response?.data?.data?.errors) {
      // Map server validation errors to form fields
      const serverErrors = error.response.data.data.errors;
      setErrors(serverErrors);
      toast.error('Validation failed. Please check the form.');
    } else if (error.response?.status === 404) {
      toast.error('Invalid category selected');
    } else {
      toast.error('Failed to create recipe. Please try again.');
    }
    console.error('Recipe creation error:', error);
  } finally {
    setIsSubmitting(false);
  }
};
```

### 7.2 Request/Response Flow

**Request Type**: `CreateRecipeRequest`
- Sent via `axios.post('/api/v1/recipes', request)`
- JWT token automatically attached via Axios interceptor
- Content-Type: application/json

**Success Response Type**: `ApiResponse<RecipeIdResponse>`
- HTTP 201 Created
- Extract `recipeId` from `response.data.data.recipeId`
- Navigate to `/recipes/{recipeId}`

**Error Response Type**: `ApiResponse<ErrorDetails>`
- HTTP 400: Validation errors → map to form fields
- HTTP 404: Invalid category ID → show toast error
- HTTP 401: Unauthorized → redirect to login
- HTTP 500: Server error → show generic error toast

## 8. User Interactions

### 8.1 Form Field Interactions

**Title Input**:
- User types → `onChange` updates formData.title
- User navigates away → `onBlur` marks field as touched, triggers validation
- Character counter updates in real-time: "{currentLength}/100"
- Error message appears below field if validation fails and field is touched

**Difficulty Dropdown**:
- User clicks → dropdown opens with options: Easy, Medium, Hard
- User selects option → `onChange` updates formData.difficulty
- User clicks outside → `onBlur` marks field as touched

**Cooking Time Input**:
- User types number → `onChange` updates formData.cookingTimeMinutes
- User navigates away → `onBlur` validates positive integer
- Label displays "Cooking Time (minutes)"

**Category Selection**:
- User clicks category chip/checkbox → `onCategoryToggle(categoryId)`
- Selected categories highlighted with primary color
- Unselected categories shown with default styling
- Count indicator updates: "{count} selected (minimum 1 required)"
- Color coding: green when >= 1, red when 0

### 8.2 Dynamic List Interactions

**Add Ingredient**:
- User clicks "+ Add Ingredient" button
- New empty ingredient row added to ingredients array
- Focus automatically set to quantity field of new row

**Remove Ingredient**:
- User clicks X/trash icon on ingredient row
- Row is removed from ingredients array
- Button disabled if only 1 ingredient row exists
- Validation re-runs to check minimum requirement

**Add Step**:
- User clicks "+ Add Step" button
- New empty step added to steps array
- Step numbers automatically recalculated
- Focus set to new step's text area

**Remove Step**:
- User clicks delete icon on step
- Step removed from steps array
- Remaining steps automatically renumbered
- Button disabled if only 2 steps exist

**Reorder Steps**:
- User clicks up arrow → step swaps position with previous step
- User clicks down arrow → step swaps position with next step
- Up arrow disabled on first step
- Down arrow disabled on last step
- Auto-numbering updates immediately

### 8.3 Form Actions

**Save Button Click**:
1. Validate entire form
2. If errors exist:
   - Display inline error messages
   - Focus first invalid field
   - Show error toast
   - Prevent submission
3. If valid:
   - Disable Save button (show loading state)
   - Submit API request
   - On success: Show success toast, navigate to recipe detail
   - On error: Show error toast, re-enable Save button

**Cancel Button Click**:
1. Check if form is dirty (has unsaved changes)
2. If dirty:
   - Show UnsavedChangesDialog
   - Wait for user confirmation
   - If confirmed: Navigate to recipe list
   - If cancelled: Close dialog, stay on page
3. If not dirty:
   - Navigate directly to recipe list

**Browser Back/Navigation**:
1. Navigation guard intercepts navigation attempt
2. If form is dirty: Show UnsavedChangesDialog
3. If not dirty: Allow navigation

### 8.4 Visual Feedback

**Real-time Validation**:
- Field-level errors appear on blur
- Error messages display below fields in red text
- Invalid fields have red border
- Valid fields return to default border

**Count Indicators**:
- Ingredients: "2 ingredients added (minimum 1 required)" - green when >= 1
- Steps: "3 steps added (minimum 2 required)" - green when >= 2
- Categories: "2 selected (minimum 1 required)" - green when >= 1

**Character Counters**:
- Title: "42/100" - changes to red when > 100
- Each step: "245/500" - changes to red when > 500

**Loading States**:
- Categories loading: Skeleton or spinner in category section
- Form submitting: Save button shows spinner, text changes to "Saving..."

**Toast Notifications**:
- Success: Green toast, "Recipe created successfully", 4s duration
- Error: Red toast, specific error message, 4s duration

## 9. Conditions and Validation

### 9.1 Client-Side Validation (Mirrors API Rules)

**Title Field**:
- **Condition**: Required, 1-100 characters
- **Component**: TitleInput in BasicInfoSection
- **Effect**: Red border + error message if invalid and touched
- **Message**: "Title is required" or "Title must not exceed 100 characters"

**Difficulty Field**:
- **Condition**: Required, must be 'EASY', 'MEDIUM', or 'HARD'
- **Component**: DifficultySelect in BasicInfoSection
- **Effect**: Red border + error message if not selected
- **Message**: "Difficulty is required"

**Cooking Time Field**:
- **Condition**: Required, positive integer (>= 1)
- **Component**: CookingTimeInput in BasicInfoSection
- **Effect**: Red border + error message if invalid
- **Message**: "Cooking time is required" or "Cooking time must be at least 1 minute"

**Category Selection**:
- **Condition**: At least 1 category required
- **Component**: CategorySection
- **Effect**: Error message below section, red count indicator
- **Message**: "At least one category is required"

**Ingredients (Minimum Count)**:
- **Condition**: At least 1 ingredient with all fields filled
- **Component**: IngredientsSection
- **Effect**: Error message at section level, red count indicator
- **Message**: "At least one ingredient is required"

**Ingredient - Quantity**:
- **Condition**: Required if row has any data, max 20 characters
- **Component**: IngredientRow
- **Effect**: Red border + error message below field
- **Message**: "Quantity is required" or "Quantity must not exceed 20 characters"

**Ingredient - Unit**:
- **Condition**: Required if row has any data, max 20 characters
- **Component**: IngredientRow
- **Effect**: Red border + error message below field
- **Message**: "Unit is required" or "Unit must not exceed 20 characters"

**Ingredient - Name**:
- **Condition**: Required if row has any data, max 50 characters
- **Component**: IngredientRow
- **Effect**: Red border + error message below field
- **Message**: "Name is required" or "Name must not exceed 50 characters"

**Steps (Minimum Count)**:
- **Condition**: At least 2 steps with instructions
- **Component**: StepsSection
- **Effect**: Error message at section level, red count indicator
- **Message**: "At least two steps are required"

**Step - Instruction**:
- **Condition**: Required, 1-500 characters
- **Component**: StepItem
- **Effect**: Red border + error message below text area
- **Message**: "Instruction is required" or "Instruction must not exceed 500 characters"

### 9.2 Server-Side Validation Handling

When server returns HTTP 400 with validation errors:
1. Extract `errors` object from response.data.data.errors
2. Map server errors to client-side FormErrors structure
3. Update errors state with server-provided messages
4. Display error messages next to corresponding fields
5. Focus first invalid field

**Example Server Error Mapping**:
```typescript
// Server response
{
  "status": "error",
  "message": "Validation failed",
  "data": {
    "errors": {
      "title": "Title is required",
      "categoryIds": "At least one category is required"
    }
  }
}

// Mapped to FormErrors
setErrors({
  title: "Title is required",
  categoryIds: "At least one category is required"
});
```

## 10. Error Handling

### 10.1 API Error Scenarios

**Network Error (No Response)**:
- **Cause**: No internet connection, server down
- **Handling**: Show toast "Network error. Please check your connection."
- **Recovery**: User can retry submission

**401 Unauthorized**:
- **Cause**: JWT token expired or invalid
- **Handling**: Clear session storage, redirect to login page
- **Message**: Toast "Session expired. Please log in again."

**400 Validation Error**:
- **Cause**: Request body fails server-side validation
- **Handling**: Map errors to form fields, display inline messages
- **Message**: Toast "Validation failed. Please check the form."

**404 Category Not Found**:
- **Cause**: Selected category ID doesn't exist in database
- **Handling**: Show toast error, highlight categoryIds field
- **Message**: "Invalid category selected. Please refresh and try again."

**500 Internal Server Error**:
- **Cause**: Unexpected server error
- **Handling**: Show generic error toast, log error to console
- **Message**: "An unexpected error occurred. Please try again later."

### 10.2 Client-Side Error Scenarios

**Empty Form Submission**:
- **Cause**: User clicks Save without entering data
- **Handling**: Validate all fields, show all error messages
- **Message**: Individual field errors + toast "Please fix validation errors"

**Incomplete Ingredients/Steps**:
- **Cause**: User adds rows but doesn't fill all fields
- **Handling**: Filter out empty rows before submission, validate remaining rows
- **Effect**: Only complete rows are sent to API

**Browser Navigation with Unsaved Changes**:
- **Cause**: User clicks browser back or navigates to another route
- **Handling**: Show UnsavedChangesDialog
- **Options**: "Stay" (cancel navigation) or "Leave" (discard changes)

**Category Loading Failure**:
- **Cause**: GET /api/v1/categories fails
- **Handling**: Show error message in category section
- **Message**: "Failed to load categories. Please refresh the page."
- **Effect**: Form submission disabled until categories load

### 10.3 Edge Cases

**All Ingredients Deleted**:
- **Prevention**: Disable delete button on last ingredient row
- **Fallback**: If state somehow has 0 ingredients, show error on save

**Only 1 Step Remaining**:
- **Prevention**: Disable delete button when only 2 steps exist
- **Fallback**: Validation prevents submission with < 2 steps

**Very Long Recipe Title**:
- **Prevention**: Client-side max length validation (100 chars)
- **Fallback**: Server validation returns 400 with error message

**Special Characters in Ingredients/Steps**:
- **Handling**: No sanitization on client (accept all characters)
- **Server Responsibility**: Backend handles XSS prevention

**Concurrent Category Changes**:
- **Scenario**: Admin deletes category while user is creating recipe
- **Handling**: Server returns 404, user receives error message
- **Recovery**: User refreshes page to reload categories

## 11. Implementation Steps

### Step 1: Project Setup
1. Create route `/recipes/new` in React Router configuration
2. Create `CreateRecipeView.jsx` component file
3. Create `components/recipe-form/` directory for form components
4. Set up Axios base URL and JWT interceptor (if not already configured)

### Step 2: Define Types
1. Create `types/recipe.types.ts` file
2. Define all DTO interfaces (CreateRecipeRequest, IngredientRequest, StepRequest, RecipeIdResponse, ApiResponse, ErrorDetails, CategoryDTO)
3. Define all ViewModel interfaces (CreateRecipeFormData, IngredientFormData, StepFormData, FormErrors, FormTouched)
4. Export all types for use across components

### Step 3: Create Custom Hook (useRecipeForm)
1. Create `hooks/useRecipeForm.ts` file
2. Implement state management for form data, errors, touched fields, isDirty flag
3. Implement helper functions:
   - `getInitialFormData()` - returns empty form structure
   - `updateField()` - updates top-level fields
   - `handleBlur()` - marks field as touched
   - `addIngredient()` - adds empty ingredient row
   - `removeIngredient()` - removes ingredient by index
   - `updateIngredient()` - updates ingredient field
   - `addStep()` - adds empty step
   - `removeStep()` - removes step by index
   - `updateStep()` - updates step instruction
   - `moveStepUp()` - swaps step with previous
   - `moveStepDown()` - swaps step with next
   - `validateForm()` - returns FormErrors object
   - `resetForm()` - resets to initial state
   - `getFormData()` - returns current form data
4. Implement complete validation logic mirroring API requirements

### Step 4: Build UI Components (Bottom-Up)

**4a. IngredientRow Component**
1. Create `components/recipe-form/IngredientRow.jsx`
2. Implement three input fields (quantity, unit, name) with max length attributes
3. Add delete button with conditional disabled state
4. Handle onChange, onBlur events
5. Display inline error messages below each field
6. Style with flex layout for horizontal arrangement

**4b. StepItem Component**
1. Create `components/recipe-form/StepItem.jsx`
2. Implement step number display (read-only)
3. Add text area with maxLength="500"
4. Add character counter below text area
5. Add up/down arrow buttons with conditional disabled states
6. Add delete button with conditional disabled state
7. Handle onChange, onBlur, move, delete events
8. Display inline error message below text area

**4c. BasicInfoSection Component**
1. Create `components/recipe-form/BasicInfoSection.jsx`
2. Implement title input with character counter
3. Implement difficulty dropdown/select with options (Easy, Medium, Hard)
4. Implement cooking time number input with "minutes" label
5. Add error display for each field
6. Handle onChange and onBlur for all fields

**4d. CategorySection Component**
1. Create `components/recipe-form/CategorySection.jsx`
2. Implement category loading state (skeleton or spinner)
3. Render category chips/checkboxes from categories array
4. Implement multi-select toggle logic
5. Add count indicator with color coding (green >= 1, red < 1)
6. Display section-level error message
7. Handle category selection/deselection

**4e. IngredientsSection Component**
1. Create `components/recipe-form/IngredientsSection.jsx`
2. Render section header with title and count indicator
3. Map ingredients array to IngredientRow components
4. Implement "+ Add Ingredient" button
5. Pass error and touched state to child IngredientRow components
6. Handle add/remove/change events from child components
7. Display section-level error if minimum not met

**4f. StepsSection Component**
1. Create `components/recipe-form/StepsSection.jsx`
2. Render section header with title and count indicator
3. Map steps array to StepItem components
4. Implement "+ Add Step" button
5. Pass error and touched state to child StepItem components
6. Handle add/remove/change/move events from child components
7. Display section-level error if minimum not met

**4g. FormActions Component**
1. Create `components/recipe-form/FormActions.jsx`
2. Implement Cancel button (secondary style)
3. Implement Save button (primary style) with loading state
4. Disable Save button when isSubmitting is true
5. Handle onClick events

**4h. UnsavedChangesDialog Component**
1. Create `components/UnsavedChangesDialog.jsx` (reusable)
2. Implement modal overlay with dialog box
3. Display warning message
4. Implement Cancel and Confirm buttons
5. Handle backdrop click to close
6. Make dialog accessible (ARIA roles, focus management)

### Step 5: Implement Main View (CreateRecipeView)
1. Import all child components and custom hook
2. Initialize useRecipeForm hook
3. Set up categories state and loading state
4. Implement fetchCategories on component mount
5. Set up navigation guard (useEffect with beforeunload or React Router's useBlocker)
6. Implement handleSubmit function:
   - Validate form
   - Transform form data to CreateRecipeRequest
   - Call API with Axios
   - Handle success (toast, navigate)
   - Handle errors (map to form fields, show toast)
7. Implement handleCancel function:
   - Check isDirty flag
   - Show dialog if dirty, navigate if not
8. Render PageHeader, BasicInfoSection, CategorySection, IngredientsSection, StepsSection, FormActions
9. Conditionally render UnsavedChangesDialog
10. Add loading state for categories (disable form or show skeleton)

### Step 6: API Integration
1. Create `services/recipeService.ts` file (if not exists)
2. Implement `createRecipe(request: CreateRecipeRequest): Promise<ApiResponse<RecipeIdResponse>>`
3. Create `services/categoryService.ts` file (if not exists)
4. Implement `getCategories(): Promise<ApiResponse<{ categories: CategoryDTO[] }>>`
5. Ensure Axios interceptor attaches JWT token from sessionStorage
6. Configure Axios base URL (e.g., 'http://localhost:8080/api/v1')

### Step 7: Styling and Responsiveness
1. Style all components with chosen UI library (Material-UI or Ant Design)
2. Ensure mobile-responsive layout:
   - Single column on mobile
   - Appropriate spacing and padding
   - Touch-friendly buttons (min 44x44px)
   - Readable font sizes (min 16px)
3. Implement color coding for count indicators (green/red)
4. Style error messages (red text, small font)
5. Add loading spinners and skeleton screens

### Step 8: Accessibility Enhancements
1. Add proper ARIA labels to all form fields
2. Associate labels with inputs using `htmlFor` and `id`
3. Implement keyboard navigation (Tab through fields)
4. Add ARIA live regions for dynamic error announcements
5. Ensure focus management (focus first error on validation failure)
6. Make modals keyboard-accessible (Escape to close, Tab trapping)
7. Add descriptive button labels (not just icons)

### Step 9: Testing
1. Test all validation rules with valid/invalid inputs
2. Test dynamic ingredient/step addition and removal
3. Test edge cases (all ingredients deleted, only 2 steps)
4. Test API error handling (401, 400, 404, 500)
5. Test unsaved changes dialog on navigation
6. Test form submission with valid data
7. Test mobile responsiveness on various devices
8. Test keyboard navigation and accessibility
9. Test character counters and count indicators
10. Verify toast notifications appear and dismiss correctly

### Step 10: Integration and Cleanup
1. Add navigation link from recipe list to "Create Recipe"
2. Verify JWT authentication works (redirect to login if not authenticated)
3. Test end-to-end flow: Login → Create Recipe → Redirect to Detail View
4. Remove any console.log statements
5. Refactor any duplicate code
6. Add JSDoc comments to complex functions
7. Verify all TypeScript types are correctly applied
8. Run linter and fix any issues
9. Commit code with descriptive commit message
