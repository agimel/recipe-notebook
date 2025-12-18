import React from 'react';
import './ActiveFilterChips.css';

export default function ActiveFilterChips({
  selectedCategories,
  selectedDifficulty,
  searchQuery,
  onRemoveCategory,
  onRemoveDifficulty,
  onRemoveSearch
}) {
  const hasFilters = selectedCategories.length > 0 || selectedDifficulty || searchQuery;

  if (!hasFilters) {
    return null;
  }

  return (
    <div className="active-filter-chips">
      <span className="active-filter-chips__label">Active Filters:</span>
      
      {searchQuery && (
        <div className="active-filter-chip">
          <span>Search: "{searchQuery}"</span>
          <button 
            onClick={onRemoveSearch}
            aria-label="Remove search filter"
            type="button"
          >
            ✕
          </button>
        </div>
      )}
      
      {selectedCategories.map(category => (
        <div key={category.id} className="active-filter-chip">
          <span>{category.name}</span>
          <button 
            onClick={() => onRemoveCategory(category.id)}
            aria-label={`Remove ${category.name} filter`}
            type="button"
          >
            ✕
          </button>
        </div>
      ))}
      
      {selectedDifficulty && (
        <div className="active-filter-chip">
          <span>{selectedDifficulty}</span>
          <button 
            onClick={onRemoveDifficulty}
            aria-label="Remove difficulty filter"
            type="button"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
}
