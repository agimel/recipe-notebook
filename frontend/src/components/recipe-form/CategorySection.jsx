import React from 'react';
import './CategorySection.css';

const CategorySection = ({ 
  categories, 
  selectedCategoryIds, 
  error, 
  touched, 
  onCategoryToggle,
  isLoading 
}) => {
  const selectedCount = selectedCategoryIds.length;
  const hasMinimum = selectedCount >= 1;

  if (isLoading) {
    return (
      <div className="category-section">
        <div className="section-header">
          <h3>Categories</h3>
        </div>
        <div className="loading-skeleton">Loading categories...</div>
      </div>
    );
  }

  return (
    <div className="category-section">
      <div className="section-header">
        <h3>
          Categories <span className="required">*</span>
        </h3>
        <span className={`count-indicator ${hasMinimum ? 'valid' : 'invalid'}`}>
          {selectedCount} selected (minimum 1 required)
        </span>
      </div>

      <div className="category-chips">
        {categories.map(category => (
          <button
            key={category.id}
            type="button"
            className={`category-chip ${selectedCategoryIds.includes(category.id) ? 'selected' : ''}`}
            onClick={() => onCategoryToggle(category.id)}
            aria-pressed={selectedCategoryIds.includes(category.id)}
          >
            {category.name}
          </button>
        ))}
      </div>

      {error && !hasMinimum && (
        <span className="error-message">{error}</span>
      )}
    </div>
  );
};

export default CategorySection;
