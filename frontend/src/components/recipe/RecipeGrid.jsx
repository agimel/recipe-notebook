import React from 'react';
import RecipeCard from './RecipeCard';
import './RecipeGrid.css';

export default function RecipeGrid({ recipes, loading }) {
  return (
    <div className="recipe-grid">
      {recipes.map(recipe => (
        <RecipeCard key={recipe.id} recipe={recipe} />
      ))}
    </div>
  );
}
