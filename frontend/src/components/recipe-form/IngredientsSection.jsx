import React from 'react';
import IngredientRow from './IngredientRow';
import './IngredientsSection.css';

const IngredientsSection = ({ 
  ingredients, 
  errors, 
  touched, 
  onAddIngredient, 
  onRemoveIngredient, 
  onIngredientChange, 
  onIngredientBlur 
}) => {
  const ingredientCount = ingredients.filter(
    ing => ing.quantity || ing.unit || ing.name
  ).length;
  
  const hasMinimum = ingredientCount >= 1;

  return (
    <div className="ingredients-section">
      <div className="section-header">
        <h3>Ingredients</h3>
        <span className={`count-indicator ${hasMinimum ? 'valid' : 'invalid'}`}>
          {ingredientCount} ingredient{ingredientCount !== 1 ? 's' : ''} added 
          (minimum 1 required)
        </span>
      </div>

      <div className="ingredients-list">
        {ingredients.map((ingredient, index) => (
          <IngredientRow
            key={index}
            index={index}
            ingredient={ingredient}
            errors={errors?.ingredients?.[index]}
            touched={touched?.ingredients?.[index]}
            isOnlyRow={ingredients.length === 1}
            onIngredientChange={(field, value) => onIngredientChange(index, field, value)}
            onIngredientBlur={(field) => onIngredientBlur(index, field)}
            onRemove={() => onRemoveIngredient(index)}
          />
        ))}
      </div>

      <button
        type="button"
        className="add-btn"
        onClick={onAddIngredient}
      >
        + Add Ingredient
      </button>

      {errors?.ingredients && !hasMinimum && (
        <span className="section-error">At least one ingredient is required</span>
      )}
    </div>
  );
};

export default IngredientsSection;
