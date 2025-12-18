import React from 'react';
import SearchBar from './SearchBar';
import CategoryFilter from './CategoryFilter';
import DifficultyFilter from './DifficultyFilter';
import './FilterBar.css';

export default function FilterBar({
  categories,
  selectedCategoryIds,
  selectedDifficulty,
  searchQuery,
  onCategoryChange,
  onDifficultyChange,
  onSearchChange,
  onSearchClear,
  onClearAll,
  hasActiveFilters
}) {
  return (
    <div className="filter-bar">
      <SearchBar 
        value={searchQuery}
        onChange={onSearchChange}
        onClear={onSearchClear}
      />
      
      <div className="filter-bar__filters">
        <CategoryFilter
          categories={categories}
          selectedCategoryIds={selectedCategoryIds}
          onChange={onCategoryChange}
        />
        
        <DifficultyFilter
          selectedDifficulty={selectedDifficulty}
          onChange={onDifficultyChange}
        />
      </div>
      
      {hasActiveFilters && (
        <button 
          className="filter-bar__clear-all"
          onClick={onClearAll}
          type="button"
        >
          Clear All Filters
        </button>
      )}
    </div>
  );
}
