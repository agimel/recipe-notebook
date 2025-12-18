import React from 'react';
import './CategoryFilter.css';

export default function CategoryFilter({ categories, selectedCategoryIds, onChange }) {
  const handleToggle = (categoryId) => {
    if (selectedCategoryIds.includes(categoryId)) {
      onChange(selectedCategoryIds.filter(id => id !== categoryId));
    } else {
      onChange([...selectedCategoryIds, categoryId]);
    }
  };

  const handleSelectAll = () => {
    onChange(categories.map(cat => cat.id));
  };

  const handleClearAll = () => {
    onChange([]);
  };

  const allSelected = selectedCategoryIds.length === categories.length && categories.length > 0;

  return (
    <div className="category-filter">
      <label className="category-filter__label">Categories</label>
      <div className="category-filter__chips">
        <button
          className={`category-filter__chip ${allSelected ? 'category-filter__chip--selected' : ''}`}
          onClick={allSelected ? handleClearAll : handleSelectAll}
          type="button"
        >
          All Categories
        </button>
        {categories.map(category => (
          <button
            key={category.id}
            className={`category-filter__chip ${
              selectedCategoryIds.includes(category.id) ? 'category-filter__chip--selected' : ''
            }`}
            onClick={() => handleToggle(category.id)}
            type="button"
          >
            {category.name}
          </button>
        ))}
      </div>
    </div>
  );
}
