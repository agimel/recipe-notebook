import React from 'react';
import { useNavigate } from 'react-router-dom';
import DifficultyBadge from './DifficultyBadge';
import CategoryBadges from './CategoryBadges';
import './RecipeCard.css';

export default function RecipeCard({ recipe }) {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/recipes/${recipe.id}`);
  };

  return (
    <article 
      className="recipe-card"
      onClick={handleClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClick();
        }
      }}
      tabIndex={0}
      role="button"
      aria-label={`View recipe: ${recipe.title}`}
    >
      <div className="recipe-card__content">
        <h3 className="recipe-card__title">{recipe.title}</h3>
        
        <div className="recipe-card__meta">
          <DifficultyBadge difficulty={recipe.difficulty} size="small" />
          <div className="recipe-card__time">
            <span className="recipe-card__time-icon">🕐</span>
            <span>{recipe.cookingTimeMinutes} min</span>
          </div>
        </div>
        
        <CategoryBadges categories={recipe.categories} maxVisible={2} />
      </div>
    </article>
  );
}
