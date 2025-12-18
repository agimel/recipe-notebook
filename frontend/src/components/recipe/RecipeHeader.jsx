import React from 'react';
import DifficultyBadge from './DifficultyBadge';
import CookingTime from './CookingTime';
import CategoryChips from './CategoryChips';
import './RecipeHeader.css';

function RecipeHeader({ title, difficulty, cookingTimeMinutes, categories, titleRef }) {
  return (
    <header className="recipe-header">
      <h1 className="recipe-title" ref={titleRef} tabIndex="-1">{title}</h1>
      <div className="recipe-metadata">
        <DifficultyBadge difficulty={difficulty} />
        <CookingTime minutes={cookingTimeMinutes} />
      </div>
      {categories && categories.length > 0 && (
        <CategoryChips categories={categories} />
      )}
    </header>
  );
}

export default RecipeHeader;
