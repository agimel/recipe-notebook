# Recipe Detail View - Manual Testing Guide

## Prerequisites
- Backend server running on port 8080
- User account registered and logged in
- At least one recipe created

## Test Scenarios

### 1. Happy Path - View Recipe
**Steps:**
1. Log in to the application
2. Navigate to recipe list
3. Click on a recipe card
4. Verify recipe detail page loads

**Expected Results:**
- ✅ Loading skeleton appears briefly
- ✅ Recipe details display correctly:
  - Title is visible and focused
  - Difficulty badge shows with appropriate color (green/yellow/red)
  - Cooking time displays with clock icon
  - Categories show as chips
  - Ingredients list is readable (16px minimum font)
  - Steps are numbered and readable (18px minimum font)
- ✅ Edit and Delete buttons are visible
- ✅ Page is responsive on mobile (test at 375px, 414px, 768px widths)

### 2. Welcome Banner (Recipe ID 1)
**Steps:**
1. Navigate to recipe with ID 1
2. Observe welcome banner at top

**Expected Results:**
- ✅ Banner displays with blue background
- ✅ Welcome message is clear
- ✅ X button is clickable
- ✅ Clicking X dismisses banner
- ✅ Refresh page - banner stays dismissed
- ✅ Banner doesn't show on other recipes

### 3. Edit Recipe
**Steps:**
1. View a recipe
2. Click "Edit Recipe" button

**Expected Results:**
- ✅ Navigates to edit view (if implemented)
- ✅ Or shows "not implemented" error

### 4. Delete Recipe - Cancel
**Steps:**
1. View a recipe
2. Click "Delete Recipe" button
3. Click "Cancel" in dialog

**Expected Results:**
- ✅ Confirmation dialog appears
- ✅ Dialog shows recipe title in message
- ✅ Focus is on Cancel button
- ✅ Clicking Cancel closes dialog
- ✅ Recipe is NOT deleted

### 5. Delete Recipe - Confirm
**Steps:**
1. View a recipe (not your only recipe)
2. Click "Delete Recipe" button
3. Click "Delete" in confirmation dialog

**Expected Results:**
- ✅ Confirmation dialog appears
- ✅ Delete button shows loading spinner
- ✅ Both buttons are disabled during deletion
- ✅ Success toast appears: "Recipe deleted successfully"
- ✅ Navigates to recipe list
- ✅ Recipe is removed from list

### 6. Delete Recipe - Error
**Steps:**
1. Stop backend server
2. View a recipe
3. Click "Delete Recipe" → "Delete"

**Expected Results:**
- ✅ Error toast appears
- ✅ Dialog closes
- ✅ User stays on detail page
- ✅ Can retry deletion

### 7. Recipe Not Found (404)
**Steps:**
1. Navigate to `/recipes/99999` (non-existent ID)

**Expected Results:**
- ✅ Error display shows
- ✅ Title: "Recipe Not Found"
- ✅ Message: "This recipe doesn't exist..."
- ✅ "Back to Recipes" button visible
- ✅ No "Try Again" button
- ✅ Clicking "Back to Recipes" navigates to list

### 8. Network Error
**Steps:**
1. Open browser DevTools
2. Set Network to "Offline"
3. Navigate to a recipe detail page
4. Set Network back to "Online"
5. Click "Try Again"

**Expected Results:**
- ✅ Error display shows
- ✅ Title: "Something Went Wrong"
- ✅ "Try Again" button visible
- ✅ "Back to Recipes" button visible
- ✅ Clicking "Try Again" refetches recipe
- ✅ Recipe loads successfully

### 9. Unauthorized Access (401)
**Steps:**
1. Clear sessionStorage in browser DevTools
2. Navigate to `/recipes/1`

**Expected Results:**
- ✅ Redirects to login page
- ✅ Toast message: "Please log in to view recipes"
- ✅ After login, redirects back to recipe (optional)

### 10. Mobile Responsiveness
**Steps:**
1. Open browser DevTools
2. Switch to mobile device view (iPhone 12, 375x667)
3. View a recipe

**Expected Results:**
- ✅ Title font size appropriate (24-32px)
- ✅ Ingredients font size ≥ 16px
- ✅ Steps font size ≥ 18px
- ✅ Action buttons stack vertically
- ✅ Action buttons are full width
- ✅ Touch targets ≥ 44x44px
- ✅ No horizontal scrolling
- ✅ Content is easy to read at arm's length

### 11. Keyboard Navigation
**Steps:**
1. View a recipe
2. Press Tab repeatedly
3. Navigate using keyboard only

**Expected Results:**
- ✅ Focus indicator visible on all interactive elements
- ✅ Tab order is logical
- ✅ Can open delete dialog with Enter/Space
- ✅ Can navigate dialog with Tab
- ✅ Can close dialog with Escape
- ✅ Focus returns to appropriate element after dialog closes

### 12. Screen Reader (Accessibility)
**Steps:**
1. Enable screen reader (NVDA, JAWS, or VoiceOver)
2. Navigate recipe detail page

**Expected Results:**
- ✅ Main landmark announced
- ✅ Recipe title announced as heading level 1
- ✅ Section headings announced as heading level 2
- ✅ Ingredients announced as list
- ✅ Steps announced as ordered list with numbers
- ✅ Buttons have descriptive labels
- ✅ Dialog role announced
- ✅ Loading state announced

## Browser Compatibility
Test on:
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Mobile Safari (iOS)
- [ ] Mobile Chrome (Android)

## Performance
- [ ] Recipe loads in < 1 second (local network)
- [ ] No console errors
- [ ] No unnecessary re-renders
- [ ] Smooth animations

## Known Issues
Document any issues found during testing:

1. 
2. 
3. 
