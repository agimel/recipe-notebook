# UI View: Recipe Edit

## View Information
**View Name**: Edit Recipe  
**View Path**: `/recipes/:id/edit`  
**Primary Purpose**: Modify existing recipes with pre-populated data and same validation as creation

---

## Related User Stories (from PRD)

### US-2.3: Edit Recipe
**Story**: As a user, I want to edit my recipes so I can update them as I refine them  

**Acceptance Criteria**:
- User can access edit mode from recipe detail view
- All existing recipe data pre-populates the form
- User can modify any field following creation validation rules
- Changes overwrite existing recipe (no draft state)
- Confirmation dialog appears if user attempts to navigate away with unsaved changes
- Success toast notification appears after save

---

## Related API Endpoints (from API Plan)

### GET /api/v1/recipes/{id}
**Purpose**: Get detailed recipe information for pre-populating the edit form

**Authentication**: Required (JWT)

**Path Parameters**:
- `id` (long, required): Recipe ID

**Success Response** (HTTP 200):
```json
{
  "status": "success",
  "message": "Recipe retrieved successfully",
  "data": {
    "id": 1,
    "title": "Classic Chocolate Chip Cookies",
    "difficulty": "EASY",
    "cookingTimeMinutes": 25,
    "categories": [
      { "id": 4, "name": "Dessert" },
      { "id": 5, "name": "Snacks" }
    ],
    "ingredients": [
      {
        "id": 1,
        "quantity": "2 1/4",
        "unit": "cups",
        "name": "all-purpose flour",
        "sortOrder": 1
      }
    ],
    "steps": [
      {
        "id": 1,
        "stepNumber": 1,
        "instruction": "Preheat your oven to 375°F (190°C)."
      }
    ],
    "createdAt": "2025-12-15T10:30:00Z",
    "updatedAt": "2025-12-15T10:30:00Z"
  }
}
```

### PUT /api/v1/recipes/{id}
**Purpose**: Update an existing recipe (full replacement)

**Authentication**: Required (JWT)

**Path Parameters**:
- `id` (long, required): Recipe ID

**Request Body**: Same as POST /api/v1/recipes
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

**Validation Rules**: Same as POST /api/v1/recipes

**Success Response** (HTTP 200):
```json
{
  "status": "success",
  "message": "Recipe updated successfully",
  "data": {
    "recipeId": 42
  }
}
```

**Error Responses**: Same as POST, plus:

*HTTP 404 - Not Found*:
```json
{
  "status": "error",
  "message": "Recipe not found",
  "data": null
}
```

*HTTP 403 - Forbidden*:
```json
{
  "status": "error",
  "message": "Access denied",
  "data": null
}
```

**Side Effects**:
1. All existing ingredients replaced with new set
2. All existing steps replaced with new set
3. Recipe-category associations updated
4. `updatedAt` timestamp updated automatically

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
- Form title: "Edit Recipe: [recipe title]"
- All fields pre-populated with existing recipe data
- Same sections as creation: basic info, categories, ingredients, steps
- Visual count feedback
- Update and Cancel buttons
- Real-time validation messages
- Unsaved changes warning on navigation
- Concurrent edit detection notification

### Key View Components
- Same form structure as Recipe Creation View
- Pre-populated text inputs, dropdowns, and selections
- Existing ingredients and steps loaded into dynamic rows
- Same add/remove/reorder controls
- Update button (instead of Save)
- Cancel button returns to recipe detail
- Confirmation dialog for unsaved changes
- Toast notification for concurrent edits
- Loading skeleton while fetching recipe data

### UX, Accessibility, and Security Considerations
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
