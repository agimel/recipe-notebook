# UI View: Recipe List

## View Information
**View Name**: Recipe List  
**View Path**: `/recipes`  
**Primary Purpose**: Browse, search, and filter user's recipe collection with quick access to details

---

## Related User Stories (from PRD)

### US-3.1: View Recipe List
**Story**: As a user, I want to see all my recipes in a list so I can browse my collection  

**Acceptance Criteria**:
- Recipes are displayed in alphabetical order by title
- Each recipe card shows: title, up to 2 categories (+ count indicator if more), difficulty badge, cooking time
- List is paginated with 20 recipes per page
- "Load More" button or infinite scroll loads additional recipes
- Empty state displays call-to-action message for new users

### US-3.2: Filter by Category
**Story**: As a user, I want to filter recipes by category so I can find suitable recipes for specific meal types  

**Acceptance Criteria**:
- Category filter dropdown/chips displayed in top bar
- User can select one or more categories
- Recipe list updates in real-time to show only matching recipes
- Filter state is visible and clearable
- Works in combination with difficulty filter

### US-3.3: Filter by Difficulty
**Story**: As a user, I want to filter recipes by difficulty so I can choose appropriate recipes for my skill level  

**Acceptance Criteria**:
- Difficulty filter dropdown/chips displayed in top bar
- User can select Easy, Medium, or Hard
- Recipe list updates in real-time to show only matching recipes
- Filter state is visible and clearable
- Works in combination with category filter

### US-3.4: Search by Name
**Story**: As a user, I want to search for recipes by name so I can quickly find what I need  

**Acceptance Criteria**:
- Search bar is visible in top navigation
- Search performs partial match, case-insensitive
- Search is debounced (waits for user to stop typing)
- Results display mixed from all categories (not grouped)
- Clear search button allows easy reset
- Empty search results show helpful message

### US-3.5: Mobile Recipe Viewing
**Story**: As a user, I want to view my recipes on mobile while cooking so I can follow along easily  

**Acceptance Criteria**:
- All views are mobile-responsive
- Touch-friendly UI elements (minimum 44x44px tap targets)
- Readable font sizes on small screens
- Recipe detail view optimized for reading while cooking
- Works on mobile browsers and tablets

---

## Related API Endpoints (from API Plan)

### GET /api/v1/recipes
**Purpose**: List recipes with pagination, filtering, and sorting

**Authentication**: Required (JWT)

**Query Parameters**:
- `page` (integer, optional, default: 0): Page number (0-indexed)
- `size` (integer, optional, default: 20): Items per page (max: 100)
- `sort` (string, optional, default: "title"): Sort field (title, cookingTimeMinutes, createdAt)
- `direction` (string, optional, default: "asc"): Sort direction (asc, desc)
- `categoryIds` (array of long, optional): Filter by category IDs (comma-separated)
- `difficulty` (string, optional): Filter by difficulty (EASY, MEDIUM, HARD)
- `search` (string, optional): Search by recipe title (partial match, case-insensitive)

**Example Requests**:
```
GET /api/v1/recipes
GET /api/v1/recipes?page=0&size=20
GET /api/v1/recipes?categoryIds=1,2&difficulty=EASY
GET /api/v1/recipes?search=chocolate
GET /api/v1/recipes?categoryIds=4&difficulty=MEDIUM&search=cake
```

**Success Response** (HTTP 200):
```json
{
  "status": "success",
  "message": "Recipes retrieved successfully",
  "data": {
    "recipes": [
      {
        "id": 1,
        "title": "Classic Chocolate Chip Cookies",
        "difficulty": "EASY",
        "cookingTimeMinutes": 25,
        "categories": [
          { "id": 4, "name": "Dessert" },
          { "id": 5, "name": "Snacks" }
        ],
        "createdAt": "2025-12-15T10:30:00Z",
        "updatedAt": "2025-12-15T10:30:00Z"
      }
    ],
    "pagination": {
      "currentPage": 0,
      "totalPages": 5,
      "totalRecipes": 87,
      "pageSize": 20,
      "hasNext": true,
      "hasPrevious": false
    }
  }
}
```

**Notes**:
- Empty result returns empty array with pagination metadata
- Multiple category IDs are OR-ed (recipes matching ANY category)
- Search and filters are AND-ed together
- Results automatically filtered by authenticated user's ID

### GET /api/v1/categories
**Purpose**: List all categories (for filter dropdown)

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
- Top navigation bar with search, filters, and user menu
- Recipe cards in grid/list layout
- Each card: title, difficulty badge (color-coded), cooking time, up to 2 categories with "...and X more" expansion
- Active filter chips showing current selections
- Loading spinner during data fetch
- Empty state for no recipes or no results
- Back-to-top floating action button (appears after scrolling)

### Key View Components
- Application shell with navigation (desktop: top bar, mobile: hamburger menu)
- Search input with debounce (300-500ms)
- Category filter (chip-based multi-select with "Select All")
- Difficulty filter (dropdown or chips)
- "Clear All Filters" button (visible when any filter active)
- Recipe card component (clickable, 44x44px minimum tap target)
- Infinite scroll pagination (triggers at 80-90% scroll position)
- Loading spinner at bottom during pagination fetch
- Empty state component with "Create your first recipe" call-to-action
- Floating action button (FAB) for back-to-top

### UX, Accessibility, and Security Considerations
- Entire recipe card clickable (semantic link wrapper)
- Touch-friendly tap targets (minimum 44x44px)
- Difficulty badges color-coded: Green (Easy), Yellow (Medium), Red (Hard)
- Category chips expandable inline (click "...and 2 more" to show all)
- Search debounced to prevent excessive API calls
- Infinite scroll with loading spinner (no page numbers)
- Scroll position saved in sessionStorage, restored on back navigation
- Empty state variations: "No recipes yet", "No results for 'search term'", "No recipes match these filters"
- ARIA live region announces search results count
- Keyboard navigation: Tab through cards, Enter to navigate
- Client-side cache with 5-minute TTL
- Cache invalidated on create/update/delete operations
- JWT automatically attached to API requests via Axios interceptor
- 401 responses trigger automatic logout and redirect to login
- Skip to main content link as first focusable element
