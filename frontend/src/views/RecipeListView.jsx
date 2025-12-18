import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import useRecipeList from '../hooks/useRecipeList';
import Button from '../components/Button';
import FilterBar from '../components/filters/FilterBar';
import ActiveFilterChips from '../components/filters/ActiveFilterChips';
import RecipeGrid from '../components/recipe/RecipeGrid';
import LoadingSpinner from '../components/common/LoadingSpinner';
import SkeletonCards from '../components/common/SkeletonCards';
import EmptyState from '../components/common/EmptyState';
import LoadMoreButton from '../components/common/LoadMoreButton';
import ScrollToTopFAB from '../components/common/ScrollToTopFAB';
import './RecipeListView.css';

export default function RecipeListView() {
  const { getUsername, logout } = useAuth();
  const navigate = useNavigate();
  const username = getUsername();
  
  const {
    recipes,
    filters,
    pagination,
    categories,
    loading,
    error,
    searchInput,
    handleSearch,
    handleCategoryChange,
    handleDifficultyChange,
    handleClearFilters,
    handleLoadMore,
    hasActiveFilters
  } = useRecipeList();

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const selectedCategories = categories.filter(cat => 
    filters.categoryIds.includes(cat.id)
  );

  const handleRemoveCategory = (categoryId) => {
    handleCategoryChange(filters.categoryIds.filter(id => id !== categoryId));
  };

  const handleRemoveDifficulty = () => {
    handleDifficultyChange(null);
  };

  const handleRemoveSearch = () => {
    handleSearch('');
  };
  
  return (
    <div className="recipe-list-view">
      <div className="recipe-list-container">
        <header className="header">
          <div className="header-content">
            <h1>🍳 Recipe Notebook</h1>
            <div className="user-section">
              <p>Welcome, {username}!</p>
              <Button onClick={handleLogout} variant="secondary">
                Logout
              </Button>
            </div>
          </div>
        </header>
        
        <div className="content">
          <div className="content-header">
            <h2>Your Recipes</h2>
            <Button onClick={() => navigate('/recipes/new')} variant="primary">
              + Create Recipe
            </Button>
          </div>

          <FilterBar
            categories={categories}
            selectedCategoryIds={filters.categoryIds}
            selectedDifficulty={filters.difficulty}
            searchQuery={searchInput}
            onCategoryChange={handleCategoryChange}
            onDifficultyChange={handleDifficultyChange}
            onSearchChange={handleSearch}
            onSearchClear={handleRemoveSearch}
            onClearAll={handleClearFilters}
            hasActiveFilters={hasActiveFilters}
          />

          <ActiveFilterChips
            selectedCategories={selectedCategories}
            selectedDifficulty={filters.difficulty}
            searchQuery={filters.search}
            onRemoveCategory={handleRemoveCategory}
            onRemoveDifficulty={handleRemoveDifficulty}
            onRemoveSearch={handleRemoveSearch}
          />

          {error && (
            <div className="error-banner">
              <p>{error}</p>
              <button onClick={() => window.location.reload()}>Try Again</button>
            </div>
          )}

          {loading && recipes.length === 0 && <LoadingSpinner />}

          {!loading && recipes.length === 0 && !hasActiveFilters && (
            <EmptyState 
              variant="no-recipes" 
              onCreateRecipe={() => navigate('/recipes/new')} 
            />
          )}

          {!loading && recipes.length === 0 && hasActiveFilters && (
            <EmptyState 
              variant="no-results" 
              searchQuery={filters.search}
            />
          )}

          {recipes.length > 0 && (
            <>
              <div className="results-count">
                {pagination && (
                  <p>
                    Showing {recipes.length} of {pagination.totalRecipes} recipe
                    {pagination.totalRecipes !== 1 ? 's' : ''}
                  </p>
                )}
              </div>
              
              <RecipeGrid recipes={recipes} loading={loading} />
              
              {loading && <SkeletonCards count={5} />}
              
              {pagination && (
                <LoadMoreButton
                  onClick={handleLoadMore}
                  hasMore={pagination.hasNext}
                  loading={loading}
                />
              )}
            </>
          )}
        </div>
      </div>
      
      <ScrollToTopFAB />
    </div>
  );
}
