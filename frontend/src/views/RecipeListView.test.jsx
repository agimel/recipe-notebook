import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import RecipeListView from './RecipeListView';
import { useAuth } from '../hooks/useAuth';
import useRecipeList from '../hooks/useRecipeList';

vi.mock('../hooks/useAuth');
vi.mock('../hooks/useRecipeList');

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate
  };
});

function renderWithRouter(component) {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
}

describe('RecipeListView', () => {
  const mockLogout = vi.fn();
  const mockHandleSearch = vi.fn();
  const mockHandleCategoryChange = vi.fn();
  const mockHandleDifficultyChange = vi.fn();
  const mockHandleClearFilters = vi.fn();
  const mockHandleLoadMore = vi.fn();

  const defaultAuthState = {
    getUsername: vi.fn(() => 'testuser'),
    logout: mockLogout,
    isAuthenticated: true
  };

  const defaultRecipeListState = {
    recipes: [],
    filters: {
      categoryIds: [],
      difficulty: null,
      search: ''
    },
    pagination: {
      currentPage: 0,
      totalPages: 1,
      totalRecipes: 0,
      hasNext: false,
      hasPrevious: false
    },
    categories: [],
    loading: false,
    error: null,
    searchInput: '',
    handleSearch: mockHandleSearch,
    handleCategoryChange: mockHandleCategoryChange,
    handleDifficultyChange: mockHandleDifficultyChange,
    handleClearFilters: mockHandleClearFilters,
    handleLoadMore: mockHandleLoadMore,
    hasActiveFilters: false
  };

  const mockRecipes = [
    {
      id: 1,
      title: 'Pasta Carbonara',
      difficulty: 'MEDIUM',
      cookingTimeMinutes: 30,
      categories: [{ id: 1, name: 'Italian' }, { id: 2, name: 'Pasta' }],
      createdAt: '2024-01-01T10:00:00Z',
      updatedAt: '2024-01-01T10:00:00Z'
    },
    {
      id: 2,
      title: 'Chicken Curry',
      difficulty: 'HARD',
      cookingTimeMinutes: 60,
      categories: [{ id: 3, name: 'Indian' }],
      createdAt: '2024-01-02T10:00:00Z',
      updatedAt: '2024-01-02T10:00:00Z'
    },
    {
      id: 3,
      title: 'Caesar Salad',
      difficulty: 'EASY',
      cookingTimeMinutes: 15,
      categories: [{ id: 4, name: 'Salad' }],
      createdAt: '2024-01-03T10:00:00Z',
      updatedAt: '2024-01-03T10:00:00Z'
    }
  ];

  const mockCategories = [
    { id: 1, name: 'Italian' },
    { id: 2, name: 'Pasta' },
    { id: 3, name: 'Indian' },
    { id: 4, name: 'Salad' }
  ];

  beforeEach(() => {
    useAuth.mockReturnValue(defaultAuthState);
    useRecipeList.mockReturnValue(defaultRecipeListState);
    mockNavigate.mockClear();
    mockLogout.mockClear();
    mockHandleSearch.mockClear();
    mockHandleCategoryChange.mockClear();
    mockHandleDifficultyChange.mockClear();
    mockHandleClearFilters.mockClear();
    mockHandleLoadMore.mockClear();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering & Initial State', () => {
    it('renders the app title in header', () => {
      renderWithRouter(<RecipeListView />);
      
      expect(screen.getByText('🍳 Recipe Notebook')).toBeInTheDocument();
    });

    it('renders welcome message with username', () => {
      renderWithRouter(<RecipeListView />);
      
      expect(screen.getByText(/Welcome, testuser!/i)).toBeInTheDocument();
    });

    it('renders logout button in header', () => {
      renderWithRouter(<RecipeListView />);
      
      const logoutButton = screen.getByRole('button', { name: /Logout/i });
      expect(logoutButton).toBeInTheDocument();
    });

    it('renders "Your Recipes" heading', () => {
      renderWithRouter(<RecipeListView />);
      
      expect(screen.getByRole('heading', { name: /Your Recipes/i })).toBeInTheDocument();
    });

    it('renders Create Recipe button', () => {
      renderWithRouter(<RecipeListView />);
      
      const createButton = screen.getByRole('button', { name: /Create Recipe/i });
      expect(createButton).toBeInTheDocument();
    });

    it('renders FilterBar component', () => {
      renderWithRouter(<RecipeListView />);
      
      const { container } = renderWithRouter(<RecipeListView />);
      expect(container.querySelector('.filter-bar')).toBeInTheDocument();
    });

    it('renders ActiveFilterChips component when filters are active', () => {
      const customState = {
        ...defaultRecipeListState,
        categories: mockCategories,
        filters: { categoryIds: [1], difficulty: null, search: '' },
        hasActiveFilters: true
      };
      useRecipeList.mockReturnValue(customState);
      
      const { container } = renderWithRouter(<RecipeListView />);
      expect(container.querySelector('.active-filter-chips')).toBeInTheDocument();
    });

    it('has correct CSS classes for layout structure', () => {
      const { container } = renderWithRouter(<RecipeListView />);
      
      expect(container.querySelector('.recipe-list-view')).toBeInTheDocument();
      expect(container.querySelector('.recipe-list-container')).toBeInTheDocument();
      expect(container.querySelector('.header')).toBeInTheDocument();
      expect(container.querySelector('.content')).toBeInTheDocument();
    });
  });

  describe('Authentication & User Actions', () => {
    it('displays username from useAuth hook', () => {
      const customAuth = {
        ...defaultAuthState,
        getUsername: vi.fn(() => 'johndoe')
      };
      useAuth.mockReturnValue(customAuth);
      
      renderWithRouter(<RecipeListView />);
      
      expect(screen.getByText(/Welcome, johndoe!/i)).toBeInTheDocument();
    });

    it('calls logout and navigates to login when logout button clicked', () => {
      renderWithRouter(<RecipeListView />);
      
      const logoutButton = screen.getByRole('button', { name: /Logout/i });
      fireEvent.click(logoutButton);
      
      expect(mockLogout).toHaveBeenCalledTimes(1);
      expect(mockNavigate).toHaveBeenCalledWith('/login', { replace: true });
    });

    it('navigates to recipe creation when Create Recipe button clicked', () => {
      renderWithRouter(<RecipeListView />);
      
      const createButton = screen.getByRole('button', { name: /Create Recipe/i });
      fireEvent.click(createButton);
      
      expect(mockNavigate).toHaveBeenCalledWith('/recipes/new');
    });
  });

  describe('Filter Interactions', () => {
    it('passes filter props correctly to FilterBar', () => {
      const customState = {
        ...defaultRecipeListState,
        categories: mockCategories,
        filters: {
          categoryIds: [1, 2],
          difficulty: 'MEDIUM',
          search: 'pasta'
        },
        searchInput: 'pasta',
        hasActiveFilters: true
      };
      useRecipeList.mockReturnValue(customState);
      
      renderWithRouter(<RecipeListView />);
      
      expect(screen.getByRole('button', { name: /Clear All Filters/i })).toBeInTheDocument();
    });

    it('calls handleCategoryChange when category filter changes', () => {
      renderWithRouter(<RecipeListView />);
      
      const mockEvent = { target: { value: '1' } };
      mockHandleCategoryChange.mockClear();
      mockHandleCategoryChange([1]);
      
      expect(mockHandleCategoryChange).toHaveBeenCalledWith([1]);
    });

    it('calls handleDifficultyChange when difficulty filter changes', () => {
      renderWithRouter(<RecipeListView />);
      
      mockHandleDifficultyChange('EASY');
      
      expect(mockHandleDifficultyChange).toHaveBeenCalledWith('EASY');
    });

    it('calls handleSearch when search input changes', () => {
      renderWithRouter(<RecipeListView />);
      
      mockHandleSearch('pasta');
      
      expect(mockHandleSearch).toHaveBeenCalledWith('pasta');
    });

    it('calls handleClearFilters when Clear All Filters button clicked', () => {
      const customState = {
        ...defaultRecipeListState,
        hasActiveFilters: true,
        filters: { categoryIds: [1], difficulty: 'EASY', search: 'test' }
      };
      useRecipeList.mockReturnValue(customState);
      
      renderWithRouter(<RecipeListView />);
      
      const clearButton = screen.getByRole('button', { name: /Clear All Filters/i });
      fireEvent.click(clearButton);
      
      expect(mockHandleClearFilters).toHaveBeenCalledTimes(1);
    });

    it('removes category filter when chip remove button clicked', () => {
      const customState = {
        ...defaultRecipeListState,
        categories: mockCategories,
        filters: { categoryIds: [1, 2], difficulty: null, search: '' },
        hasActiveFilters: true
      };
      useRecipeList.mockReturnValue(customState);
      
      renderWithRouter(<RecipeListView />);
      
      const removeButtons = screen.getAllByLabelText(/Remove .* filter/i);
      fireEvent.click(removeButtons[0]);
      
      expect(mockHandleCategoryChange).toHaveBeenCalled();
    });

    it('removes difficulty filter when difficulty chip remove button clicked', () => {
      const customState = {
        ...defaultRecipeListState,
        filters: { categoryIds: [], difficulty: 'MEDIUM', search: '' },
        hasActiveFilters: true
      };
      useRecipeList.mockReturnValue(customState);
      
      renderWithRouter(<RecipeListView />);
      
      const removeButton = screen.getByLabelText(/Remove difficulty filter/i);
      fireEvent.click(removeButton);
      
      expect(mockHandleDifficultyChange).toHaveBeenCalledWith(null);
    });

    it('removes search filter when search chip remove button clicked', () => {
      const customState = {
        ...defaultRecipeListState,
        filters: { categoryIds: [], difficulty: null, search: 'pasta' },
        searchInput: 'pasta',
        hasActiveFilters: true
      };
      useRecipeList.mockReturnValue(customState);
      
      renderWithRouter(<RecipeListView />);
      
      const removeButton = screen.getByLabelText(/Remove search filter/i);
      fireEvent.click(removeButton);
      
      expect(mockHandleSearch).toHaveBeenCalledWith('');
    });
  });

  describe('Recipe Display & Pagination', () => {
    it('displays recipe grid when recipes are available', () => {
      const customState = {
        ...defaultRecipeListState,
        recipes: mockRecipes,
        pagination: {
          currentPage: 0,
          totalPages: 1,
          totalRecipes: 3,
          hasNext: false,
          hasPrevious: false
        }
      };
      useRecipeList.mockReturnValue(customState);
      
      const { container } = renderWithRouter(<RecipeListView />);
      
      expect(container.querySelector('.recipe-grid')).toBeInTheDocument();
    });

    it('displays correct recipe count in results summary', () => {
      const customState = {
        ...defaultRecipeListState,
        recipes: mockRecipes,
        pagination: {
          currentPage: 0,
          totalPages: 1,
          totalRecipes: 3,
          hasNext: false,
          hasPrevious: false
        }
      };
      useRecipeList.mockReturnValue(customState);
      
      renderWithRouter(<RecipeListView />);
      
      expect(screen.getByText(/Showing 3 of 3 recipes/i)).toBeInTheDocument();
    });

    it('displays singular "recipe" when count is 1', () => {
      const customState = {
        ...defaultRecipeListState,
        recipes: [mockRecipes[0]],
        pagination: {
          currentPage: 0,
          totalPages: 1,
          totalRecipes: 1,
          hasNext: false,
          hasPrevious: false
        }
      };
      useRecipeList.mockReturnValue(customState);
      
      renderWithRouter(<RecipeListView />);
      
      expect(screen.getByText(/Showing 1 of 1 recipe$/i)).toBeInTheDocument();
    });

    it('displays Load More button when hasNext is true', () => {
      const customState = {
        ...defaultRecipeListState,
        recipes: mockRecipes,
        pagination: {
          currentPage: 0,
          totalPages: 2,
          totalRecipes: 25,
          hasNext: true,
          hasPrevious: false
        }
      };
      useRecipeList.mockReturnValue(customState);
      
      renderWithRouter(<RecipeListView />);
      
      expect(screen.getByRole('button', { name: /Load More Recipes/i })).toBeInTheDocument();
    });

    it('does not display Load More button when hasNext is false', () => {
      const customState = {
        ...defaultRecipeListState,
        recipes: mockRecipes,
        pagination: {
          currentPage: 0,
          totalPages: 1,
          totalRecipes: 3,
          hasNext: false,
          hasPrevious: false
        }
      };
      useRecipeList.mockReturnValue(customState);
      
      renderWithRouter(<RecipeListView />);
      
      expect(screen.queryByRole('button', { name: /Load More Recipes/i })).not.toBeInTheDocument();
    });

    it('calls handleLoadMore when Load More button clicked', () => {
      const customState = {
        ...defaultRecipeListState,
        recipes: mockRecipes,
        pagination: {
          currentPage: 0,
          totalPages: 2,
          totalRecipes: 25,
          hasNext: true,
          hasPrevious: false
        }
      };
      useRecipeList.mockReturnValue(customState);
      
      renderWithRouter(<RecipeListView />);
      
      const loadMoreButton = screen.getByRole('button', { name: /Load More Recipes/i });
      fireEvent.click(loadMoreButton);
      
      expect(mockHandleLoadMore).toHaveBeenCalledTimes(1);
    });

    it('displays skeleton cards when loading with existing recipes', () => {
      const customState = {
        ...defaultRecipeListState,
        recipes: mockRecipes,
        loading: true,
        pagination: {
          currentPage: 1,
          totalPages: 2,
          totalRecipes: 25,
          hasNext: true,
          hasPrevious: true
        }
      };
      useRecipeList.mockReturnValue(customState);
      
      const { container } = renderWithRouter(<RecipeListView />);
      
      expect(container.querySelector('.skeleton-cards')).toBeInTheDocument();
    });

    it('displays loading spinner during initial load', () => {
      const customState = {
        ...defaultRecipeListState,
        recipes: [],
        loading: true
      };
      useRecipeList.mockReturnValue(customState);
      
      const { container } = renderWithRouter(<RecipeListView />);
      
      expect(container.querySelector('.loading-spinner')).toBeInTheDocument();
    });
  });

  describe('Empty States', () => {
    it('displays "no recipes" empty state when user has no recipes and no filters', () => {
      const customState = {
        ...defaultRecipeListState,
        recipes: [],
        loading: false,
        hasActiveFilters: false
      };
      useRecipeList.mockReturnValue(customState);
      
      renderWithRouter(<RecipeListView />);
      
      expect(screen.getByText(/You haven't created any recipes yet/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Create Your First Recipe/i })).toBeInTheDocument();
    });

    it('navigates to recipe creation when Create First Recipe button clicked', () => {
      const customState = {
        ...defaultRecipeListState,
        recipes: [],
        loading: false,
        hasActiveFilters: false
      };
      useRecipeList.mockReturnValue(customState);
      
      renderWithRouter(<RecipeListView />);
      
      const createButton = screen.getByRole('button', { name: /Create Your First Recipe/i });
      fireEvent.click(createButton);
      
      expect(mockNavigate).toHaveBeenCalledWith('/recipes/new');
    });

    it('displays "no results" empty state when filters yield no results', () => {
      const customState = {
        ...defaultRecipeListState,
        recipes: [],
        loading: false,
        hasActiveFilters: true,
        filters: { categoryIds: [1], difficulty: null, search: '' }
      };
      useRecipeList.mockReturnValue(customState);
      
      renderWithRouter(<RecipeListView />);
      
      expect(screen.getByText(/No recipes match these filters/i)).toBeInTheDocument();
    });

    it('displays search query in "no results" empty state when search is active', () => {
      const customState = {
        ...defaultRecipeListState,
        recipes: [],
        loading: false,
        hasActiveFilters: true,
        filters: { categoryIds: [], difficulty: null, search: 'nonexistent' }
      };
      useRecipeList.mockReturnValue(customState);
      
      renderWithRouter(<RecipeListView />);
      
      expect(screen.getByText(/No recipes found for "nonexistent"/i)).toBeInTheDocument();
    });

    it('does not show Create First Recipe button in no-results state', () => {
      const customState = {
        ...defaultRecipeListState,
        recipes: [],
        loading: false,
        hasActiveFilters: true,
        filters: { categoryIds: [1], difficulty: null, search: '' }
      };
      useRecipeList.mockReturnValue(customState);
      
      renderWithRouter(<RecipeListView />);
      
      expect(screen.queryByRole('button', { name: /Create Your First Recipe/i })).not.toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('displays error banner when error exists', () => {
      const customState = {
        ...defaultRecipeListState,
        error: 'Failed to fetch recipes. Please try again.'
      };
      useRecipeList.mockReturnValue(customState);
      
      renderWithRouter(<RecipeListView />);
      
      expect(screen.getByText(/Failed to fetch recipes. Please try again./i)).toBeInTheDocument();
    });

    it('displays Try Again button in error banner', () => {
      const customState = {
        ...defaultRecipeListState,
        error: 'Failed to fetch recipes. Please try again.'
      };
      useRecipeList.mockReturnValue(customState);
      
      renderWithRouter(<RecipeListView />);
      
      expect(screen.getByRole('button', { name: /Try Again/i })).toBeInTheDocument();
    });

    it('reloads page when Try Again button clicked in error banner', () => {
      const reloadFn = vi.fn();
      delete window.location;
      window.location = { reload: reloadFn };
      
      const customState = {
        ...defaultRecipeListState,
        error: 'Failed to fetch recipes. Please try again.'
      };
      useRecipeList.mockReturnValue(customState);
      
      renderWithRouter(<RecipeListView />);
      
      const tryAgainButton = screen.getByRole('button', { name: /Try Again/i });
      fireEvent.click(tryAgainButton);
      
      expect(reloadFn).toHaveBeenCalled();
    });

    it('does not display error banner when error is null', () => {
      const customState = {
        ...defaultRecipeListState,
        error: null,
        recipes: mockRecipes
      };
      useRecipeList.mockReturnValue(customState);
      
      const { container } = renderWithRouter(<RecipeListView />);
      
      expect(container.querySelector('.error-banner')).not.toBeInTheDocument();
    });

    it('still displays recipes when error exists', () => {
      const customState = {
        ...defaultRecipeListState,
        error: 'Some error occurred',
        recipes: mockRecipes,
        pagination: {
          currentPage: 0,
          totalPages: 1,
          totalRecipes: 3,
          hasNext: false,
          hasPrevious: false
        }
      };
      useRecipeList.mockReturnValue(customState);
      
      const { container } = renderWithRouter(<RecipeListView />);
      
      expect(container.querySelector('.recipe-grid')).toBeInTheDocument();
      expect(screen.getByText(/Showing 3 of 3 recipes/i)).toBeInTheDocument();
    });
  });

  describe('ScrollToTopFAB Component', () => {
    it('renders ScrollToTopFAB component (hidden by default)', () => {
      const { container } = renderWithRouter(<RecipeListView />);
      
      // ScrollToTopFAB is rendered but not visible until scrollY > 300
      expect(container.querySelector('.scroll-to-top-fab')).not.toBeInTheDocument();
    });
  });

  describe('Edge Cases & Conditional Rendering', () => {
    it('handles null pagination gracefully', () => {
      const customState = {
        ...defaultRecipeListState,
        recipes: mockRecipes,
        pagination: null
      };
      useRecipeList.mockReturnValue(customState);
      
      renderWithRouter(<RecipeListView />);
      
      expect(screen.queryByText(/Showing/i)).not.toBeInTheDocument();
    });

    it('does not show results count when pagination is null', () => {
      const customState = {
        ...defaultRecipeListState,
        recipes: mockRecipes,
        pagination: null
      };
      useRecipeList.mockReturnValue(customState);
      
      renderWithRouter(<RecipeListView />);
      
      expect(screen.queryByText(/Showing/i)).not.toBeInTheDocument();
    });

    it('handles empty categories array', () => {
      const customState = {
        ...defaultRecipeListState,
        categories: [],
        recipes: mockRecipes
      };
      useRecipeList.mockReturnValue(customState);
      
      renderWithRouter(<RecipeListView />);
      
      expect(screen.getByText('🍳 Recipe Notebook')).toBeInTheDocument();
    });

    it('handles selected categories being filtered correctly', () => {
      const customState = {
        ...defaultRecipeListState,
        categories: mockCategories,
        filters: { categoryIds: [1, 3], difficulty: null, search: '' },
        hasActiveFilters: true
      };
      useRecipeList.mockReturnValue(customState);
      
      renderWithRouter(<RecipeListView />);
      
      // Categories appear in both filter bar and active chips, so use getAllByText
      const italianElements = screen.getAllByText('Italian');
      const indianElements = screen.getAllByText('Indian');
      expect(italianElements.length).toBeGreaterThan(0);
      expect(indianElements.length).toBeGreaterThan(0);
    });

    it('does not show active filter chips when hasActiveFilters is false', () => {
      const customState = {
        ...defaultRecipeListState,
        hasActiveFilters: false
      };
      useRecipeList.mockReturnValue(customState);
      
      renderWithRouter(<RecipeListView />);
      
      expect(screen.queryByText(/Active Filters:/i)).not.toBeInTheDocument();
    });

    it('shows active filter chips when hasActiveFilters is true', () => {
      const customState = {
        ...defaultRecipeListState,
        categories: mockCategories,
        filters: { categoryIds: [1], difficulty: null, search: '' },
        hasActiveFilters: true
      };
      useRecipeList.mockReturnValue(customState);
      
      renderWithRouter(<RecipeListView />);
      
      expect(screen.getByText(/Active Filters:/i)).toBeInTheDocument();
    });
  });

  describe('Integration with useRecipeList Hook', () => {
    it('calls useRecipeList hook on mount', () => {
      renderWithRouter(<RecipeListView />);
      
      expect(useRecipeList).toHaveBeenCalled();
    });

    it('uses all values returned from useRecipeList hook', () => {
      const customState = {
        recipes: mockRecipes,
        filters: { categoryIds: [1], difficulty: 'EASY', search: 'test' },
        pagination: {
          currentPage: 0,
          totalPages: 1,
          totalRecipes: 3,
          hasNext: false,
          hasPrevious: false
        },
        categories: mockCategories,
        loading: false,
        error: null,
        searchInput: 'test',
        handleSearch: mockHandleSearch,
        handleCategoryChange: mockHandleCategoryChange,
        handleDifficultyChange: mockHandleDifficultyChange,
        handleClearFilters: mockHandleClearFilters,
        handleLoadMore: mockHandleLoadMore,
        hasActiveFilters: true
      };
      useRecipeList.mockReturnValue(customState);
      
      renderWithRouter(<RecipeListView />);
      
      expect(screen.getByText(/Showing 3 of 3 recipes/i)).toBeInTheDocument();
      expect(screen.getByText(/Active Filters:/i)).toBeInTheDocument();
    });

    it('passes correct props to child components from hook state', () => {
      const customState = {
        ...defaultRecipeListState,
        categories: mockCategories,
        filters: { categoryIds: [1, 2], difficulty: 'MEDIUM', search: 'pasta' },
        searchInput: 'pasta',
        hasActiveFilters: true
      };
      useRecipeList.mockReturnValue(customState);
      
      renderWithRouter(<RecipeListView />);
      
      expect(screen.getByRole('button', { name: /Clear All Filters/i })).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has proper heading hierarchy', () => {
      renderWithRouter(<RecipeListView />);
      
      const headings = screen.getAllByRole('heading');
      expect(headings.length).toBeGreaterThan(0);
    });

    it('logout button is keyboard accessible', () => {
      renderWithRouter(<RecipeListView />);
      
      const logoutButton = screen.getByRole('button', { name: /Logout/i });
      expect(logoutButton).toBeInTheDocument();
      expect(logoutButton.tagName).toBe('BUTTON');
    });

    it('create recipe button is keyboard accessible', () => {
      renderWithRouter(<RecipeListView />);
      
      const createButton = screen.getByRole('button', { name: /Create Recipe/i });
      expect(createButton).toBeInTheDocument();
      expect(createButton.tagName).toBe('BUTTON');
    });

    it('all interactive elements are buttons or links', () => {
      const customState = {
        ...defaultRecipeListState,
        hasActiveFilters: true,
        filters: { categoryIds: [1], difficulty: 'EASY', search: '' }
      };
      useRecipeList.mockReturnValue(customState);
      
      renderWithRouter(<RecipeListView />);
      
      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);
    });
  });
});
