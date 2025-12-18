import React from 'react';
import IngredientsList from './IngredientsList';
import './IngredientsSection.css';

function IngredientsSection({ ingredients }) {
  return (
    <section className="ingredients-section" aria-labelledby="ingredients-heading">
      <h2 id="ingredients-heading" className="section-heading">Ingredients</h2>
      <IngredientsList ingredients={ingredients} />
    </section>
  );
}

export default IngredientsSection;
