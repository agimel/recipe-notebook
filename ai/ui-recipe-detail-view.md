# UI View: Recipe Detail

## View Information
**View Name**: Recipe Detail  
**View Path**: `/recipes/:id`  
**Primary Purpose**: Display full recipe information optimized for reading while cooking

---

## Related User Stories (from PRD)

### US-2.2: View Recipe Details
**Story**: As a user, I want to view my recipe details so I can follow the instructions while cooking  

**Acceptance Criteria**:
- Recipe displays title, difficulty badge, cooking time
- All assigned categories are visible
- Ingredients are listed with quantity, unit, and name
- Steps are displayed with automatic numbering
- View is mobile-responsive and easy to read on small screens

### US-2.3: Edit Recipe (Access Point)
**Story**: As a user, I want to edit my recipes so I can update them as I refine them  

**Acceptance Criteria**:
- User can access edit mode from recipe detail view
- All existing recipe data pre-populates the form
- User can modify any field following creation validation rules
- Changes overwrite existing recipe (no draft state)
- Confirmation dialog appears if user attempts to navigate away with unsaved changes
- Success toast notification appears after save

### US-2.4: Delete Recipe
**Story**: As a user, I want to delete recipes so I can remove ones I no longer use  

**Acceptance Criteria**:
- Delete button/icon is available on recipe detail view
- Confirmation dialog appears before deletion
- Recipe and associated ingredients/steps are permanently deleted
- User is redirected to recipe list after deletion
- Success toast notification confirms deletion

---

## Related API Endpoints (from API Plan)

### GET /api/v1/recipes/{id}
**Purpose**: Get detailed recipe information including ingredients and steps

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
      },
      {
        "id": 2,
        "quantity": "1",
        "unit": "tsp",
        "name": "baking soda",
        "sortOrder": 2
      }
    ],
    "steps": [
      {
        "id": 1,
        "stepNumber": 1,
        "instruction": "Preheat your oven to 375°F (190°C)."
      },
      {
        "id": 2,
        "stepNumber": 2,
        "instruction": "Combine flour, baking soda, and salt in a small bowl."
      }
    ],
    "createdAt": "2025-12-15T10:30:00Z",
    "updatedAt": "2025-12-15T10:30:00Z"
  }
}
```

**Error Responses**:

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

**Notes**:
- Ingredients returned in `sortOrder` ascending
- Steps returned in `stepNumber` ascending
- Returns 404 if recipe doesn't exist OR belongs to different user (security through obscurity)

### DELETE /api/v1/recipes/{id}
**Purpose**: Delete a recipe

**Authentication**: Required (JWT)

**Path Parameters**:
- `id` (long, required): Recipe ID

**Success Response** (HTTP 200):
```json
{
  "status": "success",
  "message": "Recipe deleted successfully",
  "data": null
}
```

**Error Responses**: Same as GET endpoint (404, 403)

**Side Effects**:
- Recipe, ingredients, and steps cascade-deleted
- Related recipe-category associations deleted

---

## View Design Details

### Key Information to Display
- Recipe title (prominent heading)
- Difficulty badge (color-coded)
- Cooking time with clock icon
- All assigned categories as chips
- Ingredients list (quantity, unit, name) with clear visual separation
- Numbered steps list with readable typography
- Edit button (navigates to edit view)
- Delete button (shows confirmation dialog)
- Optional: Welcome banner for sample recipe (first-time users)

### Key View Components
- Page header with title and metadata
- Category chips (read-only, not clickable in detail view)
- Ingredients section with clear list formatting
- Steps section with auto-numbered list
- Action buttons (Edit, Delete)
- Confirmation dialog for deletion
- Loading skeleton while fetching
- Error state for recipe not found
- Toast notifications for actions

### UX, Accessibility, and Security Considerations
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
