import React from 'react';
import './IngredientRow.css';

const IngredientRow = ({ 
  index, 
  ingredient, 
  errors, 
  touched, 
  isOnlyRow, 
  onIngredientChange, 
  onIngredientBlur, 
  onRemove 
}) => {
  return (
    <div className="ingredient-row">
      <div className="ingredient-fields">
        <div className="ingredient-field">
          <input
            type="text"
            placeholder="Quantity"
            maxLength={20}
            value={ingredient.quantity}
            onChange={(e) => onIngredientChange('quantity', e.target.value)}
            onBlur={() => onIngredientBlur('quantity')}
            className={errors?.quantity && touched?.quantity ? 'input-error' : ''}
          />
          {errors?.quantity && touched?.quantity && (
            <span className="error-message">{errors.quantity}</span>
          )}
        </div>
        
        <div className="ingredient-field">
          <input
            type="text"
            placeholder="Unit"
            maxLength={20}
            value={ingredient.unit}
            onChange={(e) => onIngredientChange('unit', e.target.value)}
            onBlur={() => onIngredientBlur('unit')}
            className={errors?.unit && touched?.unit ? 'input-error' : ''}
          />
          {errors?.unit && touched?.unit && (
            <span className="error-message">{errors.unit}</span>
          )}
        </div>
        
        <div className="ingredient-field ingredient-name">
          <input
            type="text"
            placeholder="Ingredient name"
            maxLength={50}
            value={ingredient.name}
            onChange={(e) => onIngredientChange('name', e.target.value)}
            onBlur={() => onIngredientBlur('name')}
            className={errors?.name && touched?.name ? 'input-error' : ''}
          />
          {errors?.name && touched?.name && (
            <span className="error-message">{errors.name}</span>
          )}
        </div>
      </div>
      
      <button
        type="button"
        className="delete-btn"
        onClick={onRemove}
        disabled={isOnlyRow}
        aria-label="Remove ingredient"
      >
        ✕
      </button>
    </div>
  );
};

export default IngredientRow;
