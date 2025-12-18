import React from 'react';
import './IngredientsList.css';

function IngredientsList({ ingredients }) {
  if (!ingredients || ingredients.length === 0) {
    return <p className="empty-message">No ingredients listed</p>;
  }

  return (
    <ul className="ingredients-list" role="list">
      {ingredients.map((ingredient) => (
        <li key={ingredient.id} className="ingredient-item">
          {ingredient.quantity} {ingredient.unit} {ingredient.name}
        </li>
      ))}
    </ul>
  );
}

export default IngredientsList;
