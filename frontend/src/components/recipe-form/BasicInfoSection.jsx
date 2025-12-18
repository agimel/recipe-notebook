import React from 'react';
import './BasicInfoSection.css';

const BasicInfoSection = ({ 
  title, 
  difficulty, 
  cookingTimeMinutes, 
  errors, 
  touched, 
  onFieldChange, 
  onFieldBlur 
}) => {
  const titleLength = title.length;
  const maxTitleLength = 100;

  return (
    <div className="basic-info-section">
      <div className="form-field">
        <label htmlFor="title">
          Title <span className="required">*</span>
        </label>
        <input
          id="title"
          name="title"
          type="text"
          maxLength={maxTitleLength}
          value={title}
          onChange={(e) => onFieldChange('title', e.target.value)}
          onBlur={() => onFieldBlur('title')}
          className={errors?.title && touched?.title ? 'input-error' : ''}
          placeholder="Enter recipe title"
        />
        <div className="field-footer">
          <span className={`char-counter ${titleLength > maxTitleLength ? 'over-limit' : ''}`}>
            {titleLength}/{maxTitleLength}
          </span>
          {errors?.title && touched?.title && (
            <span className="error-message">{errors.title}</span>
          )}
        </div>
      </div>

      <div className="form-field">
        <label htmlFor="difficulty">
          Difficulty <span className="required">*</span>
        </label>
        <select
          id="difficulty"
          name="difficulty"
          value={difficulty}
          onChange={(e) => onFieldChange('difficulty', e.target.value)}
          onBlur={() => onFieldBlur('difficulty')}
          className={errors?.difficulty && touched?.difficulty ? 'input-error' : ''}
        >
          <option value="">Select difficulty</option>
          <option value="EASY">Easy</option>
          <option value="MEDIUM">Medium</option>
          <option value="HARD">Hard</option>
        </select>
        {errors?.difficulty && touched?.difficulty && (
          <span className="error-message">{errors.difficulty}</span>
        )}
      </div>

      <div className="form-field">
        <label htmlFor="cookingTimeMinutes">
          Cooking Time (minutes) <span className="required">*</span>
        </label>
        <input
          id="cookingTimeMinutes"
          name="cookingTimeMinutes"
          type="number"
          min="1"
          value={cookingTimeMinutes || ''}
          onChange={(e) => onFieldChange('cookingTimeMinutes', e.target.value ? parseInt(e.target.value) : null)}
          onBlur={() => onFieldBlur('cookingTimeMinutes')}
          className={errors?.cookingTimeMinutes && touched?.cookingTimeMinutes ? 'input-error' : ''}
          placeholder="e.g., 30"
        />
        {errors?.cookingTimeMinutes && touched?.cookingTimeMinutes && (
          <span className="error-message">{errors.cookingTimeMinutes}</span>
        )}
      </div>
    </div>
  );
};

export default BasicInfoSection;
