import React from 'react';
import './CategoryChips.css';

function CategoryChips({ categories }) {
  if (!categories || categories.length === 0) {
    return null;
  }

  return (
    <div className="category-chips" role="list" aria-label="Recipe categories">
      {categories.map((category) => (
        <span 
          key={category.id} 
          className="category-chip"
          role="listitem"
        >
          {category.name}
        </span>
      ))}
    </div>
  );
}

export default CategoryChips;
