# View Implementation Plan: Recipe List View

## 1. Overview

The Recipe List View is the main browsing interface where authenticated users can view, search, and filter their recipe collection. It displays recipes as cards in a grid layout with pagination support (20 recipes per page using infinite scroll or Load More button). Users can filter by multiple categories (OR operation), single difficulty level, and search by recipe title with debounced input. The view is fully responsive, mobile-first, and includes empty states, loading indicators, and accessibility features.

## 2. View Routing

**Path**: `/recipes`

**Route Configuration**:
```javascript
<Route path="/recipes" element={<PrivateRoute><RecipeListPage /></PrivateRoute>} />
```

**Access Requirements**:
- Requires authentication (JWT token in sessionStorage)
- Redirects to `/login` if not authenticated
- Default landing page after successful login

## 3. Component Structure

```
RecipeListPage (Container Component)
├── AppLayout (Shared layout with navigation)
│   ├── TopNavigation
│   │   ├── Logo/Home Link
│   │   ├── SearchBar
│   │   └── UserMenu
│   └── MainContent
│       ├── FilterBar
│       │   ├── CategoryFilter (Multi-select)
│       │   ├── DifficultyFilter (Single-select)
│       │   └── ClearAllFiltersButton
│       ├── ActiveFilterChips (Removable chips)
│       ├── RecipeListHeader (Results count, sort options)
│       ├── RecipeGrid (Grid layout)
│       │   └── RecipeCard[] (Mapped from recipes array)
│       │       ├── RecipeCardImage (Placeholder or future image)
│       │       ├── RecipeTitle
│       │       ├── CategoryBadges (Max 2 visible + expansion)
│       │       ├── DifficultyBadge (Color-coded)
│       │       └── CookingTimeDisplay (Icon + minutes)
│       ├── LoadingSpinner (Initial load)
│       ├── SkeletonCards (During pagination load)
│       ├── EmptyState (Conditional: no recipes or no results)
│       ├── InfiniteScrollTrigger (Invisible trigger element)
│       │   OR
│       └── LoadMoreButton (Alternative to infinite scroll)
└── ScrollToTopFAB (Floating Action Button)
```

## 4. Component Details

### 4.1 RecipeListPage (Container)

**Description**: Main container component managing all state, API calls, and business logic for the recipe list view.

**Main Elements**:
- `<AppLayout>` wrapper with navigation
- `<FilterBar>` for search and filters
- `<RecipeGrid>` displaying recipe cards
- Conditional rendering for loading, empty, and error states
- `<ScrollToTopFAB>` floating action button

**Handled Events**:
- Component mount: Fetch categories and initial recipes
- Filter changes: Trigger API call with updated filters
- Search input: Debounced API call (300ms)
- Scroll to bottom: Load next page (infinite scroll)
- Click Load More: Load next page (button variant)
- Navigation: Save scroll position to sessionStorage

**Validation Conditions**: None (read-only view)

**Required Types**:
- `RecipeListState` (view model)
- `RecipeFilters` (view model)
- `RecipeSummaryDTO` (API DTO)
- `PaginationDTO` (API DTO)
- `CategoryDTO` (API DTO)

**Props**: None (root page component)

**State Management**: Uses custom hook `useRecipeList()`

---

### 4.2 SearchBar

**Description**: Debounced search input with clear button for filtering recipes by title.

**Main Elements**:
- `<TextField>` or `<Input>` with search icon
- Clear button (X icon) shown when input has value
- Placeholder text: "Search recipes..."

**Handled Events**:
- `onChange`: Captures input value, debounces for 300ms before triggering API call
- `onClear`: Clears search input and resets search filter

**Validation Conditions**: None

**Required Types**:
```typescript
interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onClear: () => void;
  disabled?: boolean;
}
```

**Props from Parent**:
- `value`: Current search query string
- `onChange`: Handler to update search filter
- `onClear`: Handler to clear search
- `disabled`: Boolean to disable during loading

---

### 4.3 FilterBar

**Description**: Container for category and difficulty filters with clear all functionality.

**Main Elements**:
- `<CategoryFilter>` component (multi-select)
- `<DifficultyFilter>` component (single-select)
- "Clear All Filters" button (conditional, shown when filters active)

**Handled Events**:
- `onCategoryChange`: Updates selected category IDs
- `onDifficultyChange`: Updates selected difficulty
- `onClearAll`: Resets all filters to default state

**Validation Conditions**: None

**Required Types**:
```typescript
interface FilterBarProps {
  categories: CategoryDTO[];
  selectedCategoryIds: number[];
  selectedDifficulty: 'EASY' | 'MEDIUM' | 'HARD' | null;
  onCategoryChange: (categoryIds: number[]) => void;
  onDifficultyChange: (difficulty: 'EASY' | 'MEDIUM' | 'HARD' | null) => void;
  onClearAll: () => void;
  hasActiveFilters: boolean;
}
```

**Props from Parent**:
- `categories`: Full list of available categories from API
- `selectedCategoryIds`: Currently selected category IDs
- `selectedDifficulty`: Currently selected difficulty or null
- `onCategoryChange`: Handler for category selection change
- `onDifficultyChange`: Handler for difficulty selection change
- `onClearAll`: Handler to clear all filters
- `hasActiveFilters`: Boolean indicating if any filters are active

---

### 4.4 CategoryFilter

**Description**: Multi-select filter for choosing one or more recipe categories.

**Main Elements**:
- Chip-based multi-select OR dropdown with checkboxes
- "Select All" option
- Visual indicator for selected categories

**Handled Events**:
- `onChange`: Updates selected category IDs array
- `onSelectAll`: Selects all available categories
- `onClearAll`: Deselects all categories

**Validation Conditions**: None

**Required Types**:
```typescript
interface CategoryFilterProps {
  categories: CategoryDTO[];
  selectedCategoryIds: number[];
  onChange: (categoryIds: number[]) => void;
}
```

**Props from Parent**:
- `categories`: Array of all available categories
- `selectedCategoryIds`: Array of currently selected category IDs
- `onChange`: Handler receiving updated array of selected IDs

---

### 4.5 DifficultyFilter

**Description**: Single-select filter for choosing recipe difficulty level.

**Main Elements**:
- Dropdown or chip group with three options: Easy, Medium, Hard
- "All" option to clear selection
- Color-coded visual indicators (Green=Easy, Yellow=Medium, Red=Hard)

**Handled Events**:
- `onChange`: Updates selected difficulty value

**Validation Conditions**: None

**Required Types**:
```typescript
interface DifficultyFilterProps {
  selectedDifficulty: 'EASY' | 'MEDIUM' | 'HARD' | null;
  onChange: (difficulty: 'EASY' | 'MEDIUM' | 'HARD' | null) => void;
}
```

**Props from Parent**:
- `selectedDifficulty`: Currently selected difficulty or null for "All"
- `onChange`: Handler receiving selected difficulty value

---

### 4.6 ActiveFilterChips

**Description**: Displays currently active filters as removable chips for clear visual feedback.

**Main Elements**:
- Chip for each selected category (with category name)
- Chip for selected difficulty (if any)
- Chip for search query (if any)
- Each chip has an X button to remove

**Handled Events**:
- `onRemoveCategory`: Removes specific category from filter
- `onRemoveDifficulty`: Clears difficulty filter
- `onRemoveSearch`: Clears search filter

**Validation Conditions**: None

**Required Types**:
```typescript
interface ActiveFilterChipsProps {
  selectedCategories: CategoryDTO[];
  selectedDifficulty: 'EASY' | 'MEDIUM' | 'HARD' | null;
  searchQuery: string;
  onRemoveCategory: (categoryId: number) => void;
  onRemoveDifficulty: () => void;
  onRemoveSearch: () => void;
}
```

**Props from Parent**:
- `selectedCategories`: Array of selected category objects
- `selectedDifficulty`: Current difficulty filter
- `searchQuery`: Current search query
- `onRemoveCategory`: Handler to remove specific category
- `onRemoveDifficulty`: Handler to clear difficulty
- `onRemoveSearch`: Handler to clear search

---

### 4.7 RecipeGrid

**Description**: Grid layout container displaying recipe cards in responsive columns.

**Main Elements**:
- CSS Grid or Material-UI Grid with responsive breakpoints
- Maps over recipes array to render RecipeCard components

**Handled Events**: None (presentational)

**Validation Conditions**: None

**Required Types**:
```typescript
interface RecipeGridProps {
  recipes: RecipeSummaryDTO[];
  loading: boolean;
}
```

**Props from Parent**:
- `recipes`: Array of recipe summary objects to display
- `loading`: Boolean to show skeleton cards during load

**Grid Breakpoints**:
- Mobile (< 600px): 1 column
- Tablet (600-960px): 2 columns
- Desktop (> 960px): 3-4 columns

---

### 4.8 RecipeCard

**Description**: Individual recipe card displaying summary information with click-to-view functionality.

**Main Elements**:
- Card wrapper (clickable link to recipe detail)
- Title (prominent typography)
- `<CategoryBadges>` component (max 2 visible)
- `<DifficultyBadge>` component (color-coded)
- Cooking time with clock icon
- Hover effect for interactivity

**Handled Events**:
- `onClick`: Navigate to `/recipes/:id` (recipe detail view)

**Validation Conditions**: None

**Required Types**:
```typescript
interface RecipeCardProps {
  recipe: RecipeSummaryDTO;
}
```

**Props from Parent**:
- `recipe`: Complete recipe summary object

**Accessibility**:
- Minimum tap target: 44x44px
- Semantic HTML: `<article>` with link wrapper
- ARIA label: Full recipe title
- Keyboard navigation: Tab to focus, Enter to activate

---

### 4.9 CategoryBadges

**Description**: Displays up to 2 category badges with expansion to show all categories.

**Main Elements**:
- First 2 category chips/badges
- "...and X more" text/button (if more than 2 categories)
- Expanded state showing all categories (inline or popover)

**Handled Events**:
- `onClick`: Toggle expansion to show all categories

**Validation Conditions**: None

**Required Types**:
```typescript
interface CategoryBadgesProps {
  categories: CategoryDTO[];
  maxVisible?: number; // Default: 2
}
```

**Props from Parent**:
- `categories`: Array of all categories for this recipe
- `maxVisible`: Number of categories to show before collapse (default 2)

**Behavior**:
- Show first 2 categories as chips
- If `categories.length > 2`, show "+X more" clickable text
- On click, expand inline to show all categories
- Option to collapse back to 2

---

### 4.10 DifficultyBadge

**Description**: Color-coded badge displaying recipe difficulty level.

**Main Elements**:
- Chip or badge with difficulty text
- Color-coded background: Green (Easy), Yellow (Medium), Red (Hard)
- Icon (optional): Simple/medium/complex icons

**Handled Events**: None

**Validation Conditions**: None

**Required Types**:
```typescript
interface DifficultyBadgeProps {
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  size?: 'small' | 'medium'; // Default: medium
}
```

**Props from Parent**:
- `difficulty`: Recipe difficulty level
- `size`: Badge size variant

**Color Mapping**:
- EASY: Green (#4CAF50)
- MEDIUM: Yellow/Orange (#FF9800)
- HARD: Red (#F44336)

---

### 4.11 LoadingSpinner

**Description**: Centered loading indicator for initial page load.

**Main Elements**:
- Circular spinner or skeleton component
- Optional loading text: "Loading recipes..."

**Handled Events**: None

**Validation Conditions**: None

**Required Types**:
```typescript
interface LoadingSpinnerProps {
  message?: string;
}
```

**Props from Parent**:
- `message`: Optional loading message text

---

### 4.12 SkeletonCards

**Description**: Skeleton placeholder cards shown during pagination loading.

**Main Elements**:
- Multiple skeleton cards matching RecipeCard layout
- Animated shimmer effect
- Same grid layout as actual recipe cards

**Handled Events**: None

**Validation Conditions**: None

**Required Types**:
```typescript
interface SkeletonCardsProps {
  count: number; // Number of skeleton cards to show
}
```

**Props from Parent**:
- `count`: Number of skeleton cards to render (typically page size: 20)

---

### 4.13 EmptyState

**Description**: Message and call-to-action displayed when no recipes exist or no results match filters.

**Main Elements**:
- Icon (empty box or search icon)
- Heading text (varies by scenario)
- Subtext with helpful message
- Call-to-action button (for "no recipes" scenario)

**Handled Events**:
- `onCreateRecipe`: Navigate to `/recipes/new` (only for "no recipes" variant)

**Validation Conditions**: None

**Required Types**:
```typescript
interface EmptyStateProps {
  variant: 'no-recipes' | 'no-results' | 'error';
  searchQuery?: string;
  onCreateRecipe?: () => void;
}
```

**Props from Parent**:
- `variant`: Type of empty state to display
- `searchQuery`: Search term (for "no results" message)
- `onCreateRecipe`: Handler to navigate to recipe creation (no-recipes variant only)

**Variants**:
1. **no-recipes**: "You haven't created any recipes yet" + "Create your first recipe" button
2. **no-results**: "No recipes found for '{searchQuery}'" or "No recipes match these filters" + "Try adjusting your filters" message
3. **error**: "Something went wrong" + "Try again" button

---

### 4.14 LoadMoreButton

**Description**: Button to manually trigger loading next page of recipes (alternative to infinite scroll).

**Main Elements**:
- Button with "Load More" text
- Loading spinner inside button when active
- Disabled state when loading or no more results

**Handled Events**:
- `onClick`: Increment page and fetch next batch of recipes

**Validation Conditions**: None

**Required Types**:
```typescript
interface LoadMoreButtonProps {
  onClick: () => void;
  hasMore: boolean;
  loading: boolean;
}
```

**Props from Parent**:
- `onClick`: Handler to load next page
- `hasMore`: Boolean from pagination.hasNext
- `loading`: Boolean indicating load in progress

---

### 4.15 InfiniteScrollTrigger

**Description**: Invisible element at bottom of recipe grid that triggers pagination when visible.

**Main Elements**:
- Div element with ref for Intersection Observer
- No visible content

**Handled Events**:
- Intersection Observer callback triggers `onLoadMore`

**Validation Conditions**: None

**Required Types**:
```typescript
interface InfiniteScrollTriggerProps {
  onLoadMore: () => void;
  hasMore: boolean;
  loading: boolean;
}
```

**Props from Parent**:
- `onLoadMore`: Handler to load next page when element becomes visible
- `hasMore`: Boolean to determine if observer should be active
- `loading`: Boolean to prevent multiple simultaneous loads

**Implementation**:
- Uses Intersection Observer API
- Triggers at 80-90% scroll position (root margin)
- Disabled when `loading` or `!hasMore`

---

### 4.16 ScrollToTopFAB

**Description**: Floating action button that appears after scrolling, returns user to top of page.

**Main Elements**:
- Circular FAB with up arrow icon
- Fixed position (bottom-right)
- Smooth scroll animation

**Handled Events**:
- `onClick`: Smooth scroll to top of page

**Validation Conditions**:
- Only visible when `scrollY > 300px`

**Required Types**:
```typescript
interface ScrollToTopFABProps {
  visible: boolean;
}
```

**Props from Parent**:
- `visible`: Boolean determining if FAB is shown

**Behavior**:
- Hidden by default
- Fades in when user scrolls down 300px
- On click, smoothly scrolls to top: `window.scrollTo({ top: 0, behavior: 'smooth' })`

---

## 5. Types

### 5.1 API DTOs

```typescript
/**
 * Recipe summary data returned by GET /api/v1/recipes
 */
interface RecipeSummaryDTO {
  id: number;
  title: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  cookingTimeMinutes: number;
  categories: CategoryDTO[];
  createdAt: string; // ISO 8601 format
  updatedAt: string; // ISO 8601 format
}

/**
 * Category data used in filters and recipe display
 */
interface CategoryDTO {
  id: number;
  name: string;
}

/**
 * Pagination metadata from API responses
 */
interface PaginationDTO {
  currentPage: number;
  totalPages: number;
  totalRecipes: number;
  pageSize: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

/**
 * Response wrapper for recipe list endpoint
 */
interface RecipeListResponseData {
  recipes: RecipeSummaryDTO[];
  pagination: PaginationDTO;
}

/**
 * Generic API response wrapper
 */
interface ApiResponse<T> {
  status: 'success' | 'error';
  message: string;
  data: T | null;
}

/**
 * Category list response from GET /api/v1/categories
 */
interface CategoryListResponseData {
  categories: CategoryDTO[];
}
```

### 5.2 ViewModels

```typescript
/**
 * Filter state for recipe list
 */
interface RecipeFilters {
  categoryIds: number[];
  difficulty: 'EASY' | 'MEDIUM' | 'HARD' | null;
  search: string;
}

/**
 * Complete state for recipe list view
 */
interface RecipeListState {
  recipes: RecipeSummaryDTO[];
  filters: RecipeFilters;
  pagination: PaginationDTO | null;
  loading: boolean;
  error: string | null;
  currentPage: number;
}

/**
 * Query parameters for API calls
 */
interface RecipeQueryParams {
  page: number;
  size: number;
  sort: 'title' | 'cookingTimeMinutes' | 'createdAt' | 'updatedAt';
  direction: 'asc' | 'desc';
  categoryIds?: string; // Comma-separated IDs
  difficulty?: 'EASY' | 'MEDIUM' | 'HARD';
  search?: string;
}

/**
 * Return type for useRecipeList custom hook
 */
interface UseRecipeListReturn {
  recipes: RecipeSummaryDTO[];
  filters: RecipeFilters;
  pagination: PaginationDTO | null;
  categories: CategoryDTO[];
  loading: boolean;
  error: string | null;
  handleSearch: (query: string) => void;
  handleCategoryChange: (categoryIds: number[]) => void;
  handleDifficultyChange: (difficulty: 'EASY' | 'MEDIUM' | 'HARD' | null) => void;
  handleClearFilters: () => void;
  handleLoadMore: () => void;
  hasActiveFilters: boolean;
}
```

## 6. State Management

### 6.1 Custom Hook: useRecipeList()

**Purpose**: Encapsulates all state management, API calls, and business logic for the recipe list view, providing a clean interface to the container component.

**State Variables**:
```typescript
const [recipes, setRecipes] = useState<RecipeSummaryDTO[]>([]);
const [filters, setFilters] = useState<RecipeFilters>({
  categoryIds: [],
  difficulty: null,
  search: ''
});
const [pagination, setPagination] = useState<PaginationDTO | null>(null);
const [categories, setCategories] = useState<CategoryDTO[]>([]);
const [loading, setLoading] = useState<boolean>(false);
const [error, setError] = useState<string | null>(null);
const [currentPage, setCurrentPage] = useState<number>(0);
const [searchInput, setSearchInput] = useState<string>('');
```

**Effects**:

1. **Fetch Categories on Mount**:
```typescript
useEffect(() => {
  const fetchCategories = async () => {
    try {
      const response = await recipeService.getCategories();
      setCategories(response.data.data.categories);
    } catch (err) {
      console.error('Failed to fetch categories:', err);
    }
  };
  fetchCategories();
}, []);
```

2. **Fetch Recipes on Filter/Page Change**:
```typescript
useEffect(() => {
  const fetchRecipes = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const params: RecipeQueryParams = {
        page: currentPage,
        size: 20,
        sort: 'title',
        direction: 'asc'
      };
      
      if (filters.categoryIds.length > 0) {
        params.categoryIds = filters.categoryIds.join(',');
      }
      if (filters.difficulty) {
        params.difficulty = filters.difficulty;
      }
      if (filters.search) {
        params.search = filters.search;
      }
      
      const response = await recipeService.getRecipes(params);
      const { recipes: newRecipes, pagination: newPagination } = response.data.data;
      
      // For infinite scroll: append recipes
      // For Load More: append recipes
      // For filter change: replace recipes (currentPage === 0)
      if (currentPage === 0) {
        setRecipes(newRecipes);
      } else {
        setRecipes(prev => [...prev, ...newRecipes]);
      }
      
      setPagination(newPagination);
    } catch (err) {
      setError('Failed to fetch recipes. Please try again.');
      console.error('Fetch recipes error:', err);
    } finally {
      setLoading(false);
    }
  };
  
  fetchRecipes();
}, [currentPage, filters]);
```

3. **Debounce Search Input**:
```typescript
useEffect(() => {
  const timer = setTimeout(() => {
    setFilters(prev => ({ ...prev, search: searchInput }));
    setCurrentPage(0); // Reset to first page on new search
  }, 300);
  
  return () => clearTimeout(timer);
}, [searchInput]);
```

4. **Restore Scroll Position on Mount**:
```typescript
useEffect(() => {
  const savedScrollY = sessionStorage.getItem('recipeListScrollY');
  if (savedScrollY) {
    window.scrollTo(0, parseInt(savedScrollY, 10));
    sessionStorage.removeItem('recipeListScrollY');
  }
}, []);
```

5. **Save Scroll Position on Unmount**:
```typescript
useEffect(() => {
  return () => {
    sessionStorage.setItem('recipeListScrollY', window.scrollY.toString());
  };
}, []);
```

**Handler Functions**:
```typescript
const handleSearch = useCallback((query: string) => {
  setSearchInput(query);
  // Actual search is debounced via useEffect
}, []);

const handleCategoryChange = useCallback((categoryIds: number[]) => {
  setFilters(prev => ({ ...prev, categoryIds }));
  setCurrentPage(0); // Reset to first page
}, []);

const handleDifficultyChange = useCallback((difficulty: 'EASY' | 'MEDIUM' | 'HARD' | null) => {
  setFilters(prev => ({ ...prev, difficulty }));
  setCurrentPage(0); // Reset to first page
}, []);

const handleClearFilters = useCallback(() => {
  setFilters({ categoryIds: [], difficulty: null, search: '' });
  setSearchInput('');
  setCurrentPage(0);
}, []);

const handleLoadMore = useCallback(() => {
  if (pagination?.hasNext && !loading) {
    setCurrentPage(prev => prev + 1);
  }
}, [pagination, loading]);
```

**Computed Values**:
```typescript
const hasActiveFilters = useMemo(() => {
  return filters.categoryIds.length > 0 || 
         filters.difficulty !== null || 
         filters.search !== '';
}, [filters]);
```

**Return Value**:
```typescript
return {
  recipes,
  filters,
  pagination,
  categories,
  loading,
  error,
  handleSearch,
  handleCategoryChange,
  handleDifficultyChange,
  handleClearFilters,
  handleLoadMore,
  hasActiveFilters
};
```

### 6.2 State Flow Diagram

```
User Action → Handler → State Update → useEffect → API Call → State Update → Re-render

Example: Category Filter
1. User selects category → handleCategoryChange(categoryIds)
2. setFilters({ ...prev, categoryIds }) + setCurrentPage(0)
3. useEffect([currentPage, filters]) triggers
4. API call with updated filters
5. setRecipes(newRecipes) + setPagination(newPagination)
6. Component re-renders with new data
```

## 7. API Integration

### 7.1 API Service Module

**File**: `src/services/recipeService.js`

```javascript
import axios from 'axios';

const API_BASE_URL = '/api/v1';

export const recipeService = {
  /**
   * Fetch recipes with filters and pagination
   * @param {RecipeQueryParams} params - Query parameters
   * @returns {Promise<ApiResponse<RecipeListResponseData>>}
   */
  getRecipes: (params) => {
    return axios.get(`${API_BASE_URL}/recipes`, { params });
  },
  
  /**
   * Fetch all categories
   * @returns {Promise<ApiResponse<CategoryListResponseData>>}
   */
  getCategories: () => {
    return axios.get(`${API_BASE_URL}/categories`);
  }
};
```

### 7.2 Axios Configuration

**File**: `src/services/axiosConfig.js`

```javascript
import axios from 'axios';

// Set base URL
axios.defaults.baseURL = 'http://localhost:8080';

// Add JWT token to all requests
axios.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem('jwtToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle 401 responses (expired/invalid token)
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      sessionStorage.removeItem('jwtToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default axios;
```

### 7.3 API Call Examples

**Initial Load (No Filters)**:
```
GET /api/v1/recipes?page=0&size=20&sort=title&direction=asc
```

**With Category Filter**:
```
GET /api/v1/recipes?page=0&size=20&sort=title&direction=asc&categoryIds=1,4
```

**With All Filters**:
```
GET /api/v1/recipes?page=0&size=20&sort=title&direction=asc&categoryIds=2,3&difficulty=EASY&search=chicken
```

**Load More (Page 2)**:
```
GET /api/v1/recipes?page=1&size=20&sort=title&direction=asc
```

### 7.4 Response Handling

**Success Response**:
```typescript
{
  status: "success",
  message: "Recipes retrieved successfully",
  data: {
    recipes: [
      {
        id: 1,
        title: "Classic Chocolate Chip Cookies",
        difficulty: "EASY",
        cookingTimeMinutes: 25,
        categories: [
          { id: 4, name: "Dessert" },
          { id: 5, name: "Snacks" }
        ],
        createdAt: "2025-12-15T10:30:00Z",
        updatedAt: "2025-12-15T10:30:00Z"
      }
      // ... more recipes
    ],
    pagination: {
      currentPage: 0,
      totalPages: 5,
      totalRecipes: 87,
      pageSize: 20,
      hasNext: true,
      hasPrevious: false
    }
  }
}
```

**Error Response Handling**:
```typescript
try {
  const response = await recipeService.getRecipes(params);
  // Handle success
} catch (error) {
  if (error.response?.status === 401) {
    // Handled by axios interceptor - redirects to login
  } else if (error.response?.status === 400) {
    setError('Invalid search parameters. Please try again.');
  } else if (error.response?.status === 500) {
    setError('Server error. Please try again later.');
  } else {
    setError('Network error. Please check your connection.');
  }
}
```

## 8. User Interactions

### 8.1 Search Interaction

**Flow**:
1. User types in search input
2. `handleSearch(query)` updates `searchInput` state
3. Debounced useEffect (300ms) updates `filters.search`
4. Filter change triggers API call with search parameter
5. Recipes update with search results
6. Result count displayed: "Found X recipes for 'query'"

**Edge Cases**:
- Empty search: Clears filter, shows all recipes
- Search with no results: Shows "No recipes found" empty state
- Search cleared via X button: `handleSearch('')` resets search

### 8.2 Category Filter Interaction

**Flow**:
1. User clicks category chip or checkbox
2. `handleCategoryChange(updatedCategoryIds)` called
3. State updates: `filters.categoryIds` and `currentPage` reset to 0
4. API call with `categoryIds=1,2,4` parameter
5. Recipes update with filtered results
6. Active filter chips display selected categories

**Multi-Select Behavior**:
- Selecting multiple categories: OR operation (recipes matching ANY selected category)
- Removing category: Click X on chip or uncheck in filter
- Clear all: Click "Clear All Filters" button

### 8.3 Difficulty Filter Interaction

**Flow**:
1. User selects difficulty from dropdown or chips
2. `handleDifficultyChange(difficulty)` called
3. State updates: `filters.difficulty` and `currentPage` reset to 0
4. API call with `difficulty=EASY` parameter
5. Recipes update with filtered results
6. Active filter chip shows selected difficulty

**Clearing**:
- Select "All" option to clear difficulty filter
- Click X on difficulty chip
- Click "Clear All Filters" button

### 8.4 Combined Filter Interaction

**Flow**:
1. User applies multiple filters: Categories + Difficulty + Search
2. Each filter change triggers separate state update
3. API call includes all active filters: `categoryIds=1,2&difficulty=MEDIUM&search=pasta`
4. Filters are AND-ed together (recipes matching ALL criteria)
5. Category filter still uses OR (recipes matching ANY selected category)

### 8.5 Recipe Card Click Interaction

**Flow**:
1. User clicks anywhere on recipe card
2. Browser navigation to `/recipes/:id` (recipe detail view)
3. Before navigation, current scroll position saved to sessionStorage
4. Recipe detail view loads
5. On back navigation, scroll position restored

**Accessibility**:
- Entire card is focusable via Tab key
- Enter key activates navigation
- Visual focus indicator on keyboard focus

### 8.6 Load More Interaction

**Infinite Scroll Variant**:
1. User scrolls down page
2. InfiniteScrollTrigger becomes visible (80% scroll position)
3. Intersection Observer callback fires
4. `handleLoadMore()` increments `currentPage`
5. API call for next page
6. New recipes appended to existing list
7. Skeleton cards shown at bottom during load

**Button Variant**:
1. User clicks "Load More" button
2. `handleLoadMore()` called
3. Button shows loading spinner
4. API call for next page
5. New recipes appended
6. Button re-enabled or hidden if no more results

### 8.7 Clear Filters Interaction

**Individual Filter Clear**:
1. User clicks X on filter chip
2. Specific filter removed from state
3. API call with updated filters
4. Results update

**Clear All Filters**:
1. User clicks "Clear All Filters" button
2. `handleClearFilters()` resets all filters to default
3. Search input cleared
4. Page reset to 0
5. API call with no filter parameters
6. All recipes displayed

### 8.8 Scroll to Top Interaction

**Flow**:
1. User scrolls down more than 300px
2. ScrollToTopFAB fades in (bottom-right corner)
3. User clicks FAB
4. Smooth scroll animation to top of page
5. FAB fades out when scroll position < 300px

## 9. Conditions and Validation

### 9.1 UI Display Conditions

**Loading States**:
- `loading && recipes.length === 0`: Show full-page loading spinner
- `loading && recipes.length > 0`: Show skeleton cards at bottom (pagination)
- `!loading`: Hide all loading indicators

**Empty States**:
- `!loading && recipes.length === 0 && !hasActiveFilters`: Show "No recipes yet" with create button
- `!loading && recipes.length === 0 && hasActiveFilters && filters.search`: Show "No recipes found for '{search}'"
- `!loading && recipes.length === 0 && hasActiveFilters && !filters.search`: Show "No recipes match these filters"

**Filter Display Conditions**:
- `filters.categoryIds.length > 0 || filters.difficulty || filters.search`: Show "Clear All Filters" button
- `filters.categoryIds.length > 0`: Show category chips in ActiveFilterChips
- `filters.difficulty !== null`: Show difficulty chip in ActiveFilterChips
- `filters.search !== ''`: Show search chip in ActiveFilterChips

**Pagination Conditions**:
- `pagination?.hasNext === true`: Enable Load More button / Infinite scroll trigger
- `pagination?.hasNext === false`: Hide Load More button / Disable infinite scroll
- `loading === true`: Disable Load More button (prevent duplicate requests)

**Scroll to Top FAB**:
- `scrollY > 300`: Show FAB
- `scrollY <= 300`: Hide FAB

### 9.2 Component Rendering Logic

```typescript
// In RecipeListPage component
{loading && recipes.length === 0 && <LoadingSpinner />}

{!loading && recipes.length === 0 && !hasActiveFilters && (
  <EmptyState variant="no-recipes" onCreateRecipe={() => navigate('/recipes/new')} />
)}

{!loading && recipes.length === 0 && hasActiveFilters && (
  <EmptyState 
    variant="no-results" 
    searchQuery={filters.search}
  />
)}

{recipes.length > 0 && (
  <>
    <RecipeGrid recipes={recipes} loading={loading} />
    {loading && <SkeletonCards count={5} />}
    {pagination?.hasNext && (
      <LoadMoreButton 
        onClick={handleLoadMore}
        hasMore={pagination.hasNext}
        loading={loading}
      />
    )}
  </>
)}
```

### 9.3 Filter State Validation

**No explicit validation required** - All filters are optional and handled gracefully:
- Empty categoryIds array: No category filter applied
- Null difficulty: No difficulty filter applied
- Empty search string: No search filter applied

**Backend handles**:
- Invalid category IDs: Returns empty results
- Invalid difficulty enum: Returns 400 error (caught and displayed as toast)
- Malformed search: Sanitized by backend

## 10. Error Handling

### 10.1 Error Scenarios and Responses

**Network Error** (No Connection):
```typescript
catch (error) {
  if (!error.response) {
    setError('Network error. Please check your connection.');
    toast.error('Unable to connect to server');
  }
}
```

**401 Unauthorized** (Invalid/Expired JWT):
- Handled automatically by axios interceptor
- Token removed from sessionStorage
- Redirect to `/login`
- No explicit error message (seamless redirect)

**400 Bad Request** (Invalid Query Parameters):
```typescript
catch (error) {
  if (error.response?.status === 400) {
    setError('Invalid search parameters');
    toast.error('Invalid filter settings. Please try again.');
  }
}
```

**500 Internal Server Error**:
```typescript
catch (error) {
  if (error.response?.status === 500) {
    setError('Server error. Please try again later.');
    toast.error('Something went wrong on our end');
  }
}
```

**Empty Results** (Valid Request, No Data):
- Not an error - handled by empty state UI
- Different messages for different scenarios (see section 9.1)

### 10.2 Error Display Methods

**Toast Notifications** (Transient Errors):
- Network errors
- 400/500 API errors
- Failed API calls
- Auto-dismiss after 4 seconds
- Red background with error icon

**Inline Error State** (Persistent Errors):
- Error state variable set in component
- Error banner displayed above recipe grid
- "Try Again" button to retry API call
- Persists until successful request or user dismisses

**Empty States** (No Data Scenarios):
- "No recipes yet" - First-time user
- "No results found" - Search/filter returned nothing
- Helpful messaging with clear next steps

### 10.3 Error Recovery

**Retry Mechanism**:
```typescript
const retryFetch = useCallback(() => {
  setError(null);
  setCurrentPage(0);
  // Triggers useEffect to re-fetch
}, []);
```

**Error UI Example**:
```tsx
{error && (
  <Alert severity="error" onClose={() => setError(null)}>
    <AlertTitle>Error</AlertTitle>
    {error}
    <Button onClick={retryFetch} size="small">
      Try Again
    </Button>
  </Alert>
)}
```

**Graceful Degradation**:
- Categories fail to load: Disable category filter, show all recipes
- Recipes fail to load: Show error state with retry
- Pagination fails: Show current recipes, disable Load More
- Individual recipe card data missing: Use fallback values or skip rendering

### 10.4 Error Logging

**Development**:
```typescript
catch (error) {
  console.error('Recipe fetch failed:', error);
  console.error('Request params:', params);
  console.error('Error response:', error.response);
}
```

**Production** (Future Enhancement):
- Send errors to logging service (Sentry, LogRocket)
- Include user context (userId, current filters)
- Exclude sensitive data (JWT tokens)

## 11. Implementation Steps

### Step 1: Project Setup and File Structure
1. Create folder structure:
   ```
   src/
   ├── pages/
   │   └── RecipeListPage.jsx
   ├── components/
   │   ├── recipe/
   │   │   ├── RecipeCard.jsx
   │   │   ├── RecipeGrid.jsx
   │   │   ├── CategoryBadges.jsx
   │   │   └── DifficultyBadge.jsx
   │   ├── filters/
   │   │   ├── SearchBar.jsx
   │   │   ├── FilterBar.jsx
   │   │   ├── CategoryFilter.jsx
   │   │   ├── DifficultyFilter.jsx
   │   │   └── ActiveFilterChips.jsx
   │   └── common/
   │       ├── LoadingSpinner.jsx
   │       ├── SkeletonCards.jsx
   │       ├── EmptyState.jsx
   │       ├── LoadMoreButton.jsx
   │       ├── InfiniteScrollTrigger.jsx
   │       └── ScrollToTopFAB.jsx
   ├── hooks/
   │   └── useRecipeList.js
   ├── services/
   │   ├── axiosConfig.js
   │   └── recipeService.js
   └── types/
       └── recipe.types.ts (or .d.ts)
   ```

### Step 2: Define Types
1. Create `src/types/recipe.types.ts`
2. Define all DTOs from section 5.1 (RecipeSummaryDTO, CategoryDTO, PaginationDTO, etc.)
3. Define all ViewModels from section 5.2 (RecipeFilters, RecipeListState, etc.)
4. Export all types for use across components

### Step 3: Configure Axios
1. Create `src/services/axiosConfig.js`
2. Set base URL to Spring Boot backend (http://localhost:8080)
3. Add request interceptor to attach JWT token from sessionStorage
4. Add response interceptor to handle 401 errors (redirect to login)
5. Export configured axios instance

### Step 4: Create API Service Layer
1. Create `src/services/recipeService.js`
2. Implement `getRecipes(params)` function
3. Implement `getCategories()` function
4. Export recipeService object with all methods
5. Add JSDoc comments for type hints

### Step 5: Create Custom Hook (useRecipeList)
1. Create `src/hooks/useRecipeList.js`
2. Implement all state variables (recipes, filters, pagination, etc.)
3. Implement useEffect for fetching categories on mount
4. Implement useEffect for fetching recipes on filter/page change
5. Implement debounced search effect (300ms delay)
6. Implement scroll position save/restore effects
7. Create handler functions (handleSearch, handleCategoryChange, etc.)
8. Compute derived state (hasActiveFilters)
9. Return object with all necessary values and handlers
10. Add error handling for all API calls

### Step 6: Create Presentational Components (Bottom-Up)

**6.1 DifficultyBadge**:
- Create chip/badge component
- Implement color mapping (EASY=green, MEDIUM=yellow, HARD=red)
- Add size variants (small, medium)
- Test with all difficulty values

**6.2 CategoryBadges**:
- Create component showing first 2 categories
- Add expansion logic for "...and X more"
- Implement toggle state for showing all categories
- Style as chips or inline badges

**6.3 RecipeCard**:
- Create card layout with all required fields
- Wrap in Link component for navigation
- Add hover effect
- Integrate DifficultyBadge and CategoryBadges
- Ensure 44x44px minimum tap target
- Add ARIA labels for accessibility

**6.4 RecipeGrid**:
- Create responsive grid layout
- Define breakpoints (1/2/3 columns)
- Map over recipes to render RecipeCard components
- Add gap/spacing between cards

**6.5 LoadingSpinner & SkeletonCards**:
- Create centered loading spinner
- Create skeleton card matching RecipeCard layout
- Add shimmer animation effect
- Render multiple skeleton cards in grid

**6.6 EmptyState**:
- Create component with icon, heading, message, CTA button
- Implement three variants (no-recipes, no-results, error)
- Conditionally render CTA button for no-recipes variant
- Style centered with max-width

**6.7 SearchBar**:
- Create text input with search icon
- Add clear button (X icon) when value present
- Implement onChange handler
- Add placeholder text
- Style with proper spacing

**6.8 CategoryFilter**:
- Create multi-select dropdown or chip group
- Fetch categories from props
- Implement checkbox selection
- Add "Select All" option
- Handle onChange with array of selected IDs

**6.9 DifficultyFilter**:
- Create single-select dropdown or chip group
- Options: All, Easy, Medium, Hard
- Color-code options
- Handle onChange with selected value or null

**6.10 ActiveFilterChips**:
- Create container for removable chips
- Map over selected categories to render chips
- Render difficulty chip if selected
- Render search chip if present
- Add X button to each chip
- Handle individual removal

**6.11 FilterBar**:
- Create container combining CategoryFilter and DifficultyFilter
- Add "Clear All Filters" button (conditional)
- Arrange horizontally or stacked based on screen size
- Pass down filter state and handlers

**6.12 LoadMoreButton / InfiniteScrollTrigger**:
- **Button variant**: Create button with loading state, disabled logic
- **Infinite scroll**: Create invisible div with Intersection Observer
- Trigger callback when visible
- Prevent multiple simultaneous loads

**6.13 ScrollToTopFAB**:
- Create floating action button with up arrow icon
- Position fixed (bottom-right)
- Implement smooth scroll to top
- Add show/hide logic based on scroll position
- Use CSS transition for fade in/out

### Step 7: Create Container Component (RecipeListPage)
1. Create `src/pages/RecipeListPage.jsx`
2. Use `useRecipeList()` hook to get state and handlers
3. Implement scroll position tracking for FAB visibility
4. Compose all child components with proper props
5. Implement conditional rendering for loading/empty/error states
6. Add error boundary for graceful failure
7. Implement layout with responsive grid

### Step 8: Configure Routing
1. Update `src/App.jsx` or routing configuration
2. Add route: `<Route path="/recipes" element={<PrivateRoute><RecipeListPage /></PrivateRoute>} />`
3. Set as default redirect after login
4. Ensure PrivateRoute component checks for JWT token

### Step 9: Styling and Responsive Design
1. Apply Material-UI or Ant Design theme
2. Define responsive breakpoints
3. Ensure mobile-first approach
4. Test on multiple screen sizes (mobile, tablet, desktop)
5. Verify 44x44px tap targets on mobile
6. Add hover effects for desktop
7. Ensure sufficient color contrast (WCAG AA)
8. Test dark mode if applicable

### Step 10: Accessibility Implementation
1. Add semantic HTML (`<main>`, `<article>`, `<nav>`)
2. Add ARIA labels to interactive elements
3. Implement keyboard navigation (Tab, Enter)
4. Add ARIA live region for search results count
5. Ensure focus indicators are visible
6. Test with screen reader (NVDA, VoiceOver)
7. Add skip to main content link
8. Verify color contrast ratios

### Step 11: Testing and Debugging
1. **Manual Testing**:
   - Test all user interactions (search, filter, pagination)
   - Test with no recipes (empty state)
   - Test with no results (filter/search empty state)
   - Test error scenarios (network error, 401, 500)
   - Test on multiple browsers (Chrome, Firefox, Safari)
   - Test on mobile devices (iOS, Android)
   - Test keyboard navigation
   - Test with slow 3G connection (loading states)

2. **Edge Cases**:
   - Single recipe
   - Exactly 20 recipes (one full page)
   - 21 recipes (pagination)
   - Recipe with 10+ categories
   - Recipe with very long title
   - Search with no results
   - All filters applied simultaneously
   - Network disconnection during pagination

3. **Performance Testing**:
   - Test with 100+ recipes
   - Monitor API call frequency (ensure debouncing works)
   - Check for memory leaks (component unmount)
   - Verify scroll position restoration
   - Test infinite scroll trigger threshold

### Step 12: Optimization
1. **Memoization**:
   - Wrap handler functions in `useCallback`
   - Wrap derived values in `useMemo`
   - Use `React.memo` for RecipeCard if needed

2. **Code Splitting**:
   - Lazy load RecipeListPage if not initial route
   - Consider lazy loading filter components

3. **Debouncing**:
   - Verify 300ms search debounce
   - Prevent API call spam on rapid filter changes

4. **Image Optimization** (Future):
   - Lazy load recipe images
   - Use placeholder images
   - Implement image CDN

### Step 13: Documentation
1. Add JSDoc comments to all components
2. Document prop types with PropTypes or TypeScript
3. Create README for component usage examples
4. Document API integration in developer guide
5. Add inline code comments for complex logic

### Step 14: Final Review and Deployment
1. Code review with team
2. Fix any linting errors
3. Verify all acceptance criteria from PRD (US-3.1 through US-3.5)
4. Build production bundle: `npm run build`
5. Test production build locally
6. Deploy frontend to static hosting or integrate with Spring Boot
7. Verify production deployment
8. Monitor for errors using browser console or error tracking
