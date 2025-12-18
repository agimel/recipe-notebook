# Recipe Creation View - Testing Guide

## Test Checklist

### 1. Navigation Tests
- [x] Navigate to `/recipes/new` from RecipeListView using "Create Recipe" button
- [ ] Verify page loads with all sections visible
- [ ] Verify categories load successfully

### 2. Form Field Validation Tests

#### Title Field
- [ ] Leave empty and blur - should show "Title is required"
- [ ] Enter 101 characters - character counter should turn red
- [ ] Character counter should update in real-time

#### Difficulty Field
- [ ] Leave unselected and blur - should show "Difficulty is required"
- [ ] Select each option (Easy, Medium, Hard) - should update correctly

#### Cooking Time Field
- [ ] Leave empty and blur - should show "Cooking time is required"
- [ ] Enter 0 or negative number - should show error
- [ ] Enter valid number - should accept

#### Categories
- [ ] Verify categories load from API
- [ ] Click chips to select/deselect
- [ ] Count indicator should show valid (green) when >= 1 selected
- [ ] Count indicator should show invalid (red) when 0 selected

### 3. Ingredients Section Tests
- [ ] Initially shows 1 empty ingredient row
- [ ] "Add Ingredient" button adds new row
- [ ] Delete button disabled when only 1 row exists
- [ ] Delete button removes row when > 1 rows exist
- [ ] Validation shows errors for incomplete rows
- [ ] Count indicator shows valid when >= 1 complete ingredient

### 4. Steps Section Tests
- [ ] Initially shows 2 empty step rows
- [ ] "Add Step" button adds new row
- [ ] Delete button disabled when only 2 rows exist
- [ ] Step numbers auto-update when reordering
- [ ] Up arrow disabled on first step
- [ ] Down arrow disabled on last step
- [ ] Character counter updates in real-time (max 500)
- [ ] Count indicator shows valid when >= 2 complete steps

### 5. Form Submission Tests

#### Valid Submission
- [ ] Fill all required fields correctly
- [ ] Click "Save Recipe"
- [ ] Success toast appears
- [ ] Redirects to recipe detail page

#### Invalid Submission
- [ ] Click "Save Recipe" with empty form
- [ ] All field errors appear
- [ ] Error toast appears
- [ ] Focus moves to first invalid field

#### Server Error Handling
- [ ] Test 400 error (validation failure)
- [ ] Test 401 error (unauthorized - should redirect to login)
- [ ] Test 404 error (invalid category)
- [ ] Test 500 error (server error)

### 6. Unsaved Changes Tests
- [ ] Make changes to form
- [ ] Click "Cancel" button - dialog should appear
- [ ] Click "Stay" - should remain on page
- [ ] Click "Leave" - should navigate to recipe list
- [ ] Try browser back button with unsaved changes
- [ ] Try browser refresh with unsaved changes

### 7. Responsive Design Tests
- [ ] Test on desktop (> 768px)
- [ ] Test on tablet (768px)
- [ ] Test on mobile (< 480px)
- [ ] All buttons should be touch-friendly (min 44x44px)
- [ ] Forms should stack vertically on mobile

### 8. Accessibility Tests
- [ ] Tab through all form fields
- [ ] Labels associated with inputs
- [ ] ARIA labels on icon buttons
- [ ] Error messages announced
- [ ] Modal keyboard accessible (Escape to close)

## Known Issues to Fix
None identified yet.

## Test Data

### Valid Recipe Example
```json
{
  "title": "Chocolate Chip Cookies",
  "difficulty": "EASY",
  "cookingTimeMinutes": 25,
  "categoryIds": [1],
  "ingredients": [
    { "quantity": "2", "unit": "cups", "name": "flour" },
    { "quantity": "1", "unit": "cup", "name": "chocolate chips" }
  ],
  "steps": [
    { "instruction": "Mix dry ingredients" },
    { "instruction": "Bake at 350°F for 12 minutes" }
  ]
}
```

### Edge Cases
- Very long title (100 characters)
- Fractional quantities ("1/2", "2.5")
- Special characters in ingredient names
- Maximum step instruction (500 characters)
- Many categories selected (10+)
- Many ingredients (20+)
- Many steps (30+)
