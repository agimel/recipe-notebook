# UI View: Recipe Creation

## View Information
**View Name**: Create Recipe  
**View Path**: `/recipes/new`  
**Primary Purpose**: Add new recipes with ingredients and steps through a single-page form

---

## Related User Stories (from PRD)

### US-2.1: Add New Recipe
**Story**: As a user, I want to add a new recipe with ingredients and steps so I can save my favorite dishes  

**Acceptance Criteria**:
- User can enter recipe title (required, max 100 chars)
- User can select difficulty level (Easy/Medium/Hard)
- User can enter cooking time in minutes
- User can add multiple ingredients with quantity, unit, and name
- Minimum 1 ingredient required
- User can add multiple numbered steps (minimum 2 required)
- Each step supports up to 500 characters
- User can assign one or more categories (at least 1 required)
- Form validates in real-time with field-level error messages
- Success toast notification appears after save
- User is redirected to recipe detail view after save

---

## Related API Endpoints (from API Plan)

### POST /api/v1/recipes
**Purpose**: Create a new recipe

**Authentication**: Required (JWT)

**Request Body**:
```json
{
  "title": "string (1-100 chars, required)",
  "difficulty": "EASY|MEDIUM|HARD (required)",
  "cookingTimeMinutes": "integer (positive, required)",
  "categoryIds": [1, 4],
  "ingredients": [
    {
      "quantity": "string (max 20 chars, required)",
      "unit": "string (max 20 chars, required)",
      "name": "string (max 50 chars, required)"
    }
  ],
  "steps": [
    {
      "instruction": "string (1-500 chars, required)"
    }
  ]
}
```

**Validation Rules**:
- `title`: 1-100 characters, required
- `difficulty`: Must be EASY, MEDIUM, or HARD
- `cookingTimeMinutes`: Positive integer, required
- `categoryIds`: At least 1 category required, must exist in database
- `ingredients`: Minimum 1 required
  - `quantity`: Max 20 characters, supports fractions (e.g., "1/2")
  - `unit`: Max 20 characters
  - `name`: Max 50 characters
- `steps`: Minimum 2 required
  - `instruction`: 1-500 characters

**Success Response** (HTTP 201):
```json
{
  "status": "success",
  "message": "Recipe created successfully",
  "data": {
    "recipeId": 42
  }
}
```

**Error Responses**:

*HTTP 400 - Validation Error*:
```json
{
  "status": "error",
  "message": "Validation failed",
  "data": {
    "errors": {
      "title": "Title is required",
      "ingredients": "At least one ingredient is required",
      "steps": "At least two steps are required",
      "categoryIds": "At least one category is required"
    }
  }
}
```

*HTTP 404 - Category Not Found*:
```json
{
  "status": "error",
  "message": "Invalid category ID",
  "data": {
    "errors": {
      "categoryIds": "Category with ID 99 does not exist"
    }
  }
}
```

**Side Effects**:
1. Recipe created with `userId` from JWT
2. Ingredients assigned sequential `sortOrder` (1, 2, 3...)
3. Steps assigned sequential `stepNumber` (1, 2, 3...)
4. `createdAt` and `updatedAt` timestamps set automatically

### GET /api/v1/categories
**Purpose**: List all categories (for category selector)

**Authentication**: Required (JWT)

**Success Response** (HTTP 200):
```json
{
  "status": "success",
  "message": "Categories retrieved successfully",
  "data": {
    "categories": [
      { "id": 1, "name": "Breakfast" },
      { "id": 2, "name": "Lunch" },
      { "id": 3, "name": "Dinner" },
      { "id": 4, "name": "Dessert" },
      { "id": 5, "name": "Snacks" },
      { "id": 6, "name": "Drinks" }
    ]
  }
}
```

---

## View Design Details

### Key Information to Display
- Form title: "Create New Recipe"
- Basic info section: title, difficulty, cooking time
- Category selection (chip-based, multi-select, minimum 1)
- Ingredients section with dynamic rows (minimum 1)
- Steps section with dynamic text areas (minimum 2)
- Visual count feedback with color coding (e.g., "1 ingredient added (minimum 1 required)" - green when valid, red when below minimum)
- Save and Cancel buttons
- Real-time validation messages
- Unsaved changes warning on navigation

### Key View Components
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

### UX, Accessibility, and Security Considerations
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
