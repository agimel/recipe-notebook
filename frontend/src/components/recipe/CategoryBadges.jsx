import React, { useState } from 'react';
import './CategoryBadges.css';

export default function CategoryBadges({ categories, maxVisible = 2 }) {
  const [expanded, setExpanded] = useState(false);
  
  if (!categories || categories.length === 0) {
    return null;
  }

  const visibleCategories = expanded ? categories : categories.slice(0, maxVisible);
  const remainingCount = categories.length - maxVisible;

  return (
    <div className="category-badges">
      {visibleCategories.map(category => (
        <span key={category.id} className="category-badge">
          {category.name}
        </span>
      ))}
      {remainingCount > 0 && !expanded && (
        <button 
          className="category-more-btn"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setExpanded(true);
          }}
        >
          +{remainingCount} more
        </button>
      )}
      {expanded && (
        <button 
          className="category-less-btn"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setExpanded(false);
          }}
        >
          Show less
        </button>
      )}
    </div>
  );
}
