import React from 'react';
import './StepItem.css';

const StepItem = ({ 
  index, 
  step, 
  error, 
  touched, 
  isFirst, 
  isLast, 
  canDelete, 
  onStepChange, 
  onStepBlur, 
  onMoveUp, 
  onMoveDown, 
  onRemove 
}) => {
  const currentLength = step.instruction.length;
  const maxLength = 500;
  
  return (
    <div className="step-item">
      <div className="step-number">{index + 1}</div>
      
      <div className="step-content">
        <textarea
          placeholder="Enter step instruction"
          maxLength={maxLength}
          value={step.instruction}
          onChange={(e) => onStepChange(e.target.value)}
          onBlur={onStepBlur}
          className={error && touched ? 'textarea-error' : ''}
          rows={3}
        />
        
        <div className="step-footer">
          <span className={`char-counter ${currentLength > maxLength ? 'over-limit' : ''}`}>
            {currentLength}/{maxLength}
          </span>
          {error && touched && (
            <span className="error-message">{error}</span>
          )}
        </div>
      </div>
      
      <div className="step-controls">
        <button
          type="button"
          className="control-btn"
          onClick={onMoveUp}
          disabled={isFirst}
          aria-label="Move step up"
        >
          ▲
        </button>
        
        <button
          type="button"
          className="control-btn"
          onClick={onMoveDown}
          disabled={isLast}
          aria-label="Move step down"
        >
          ▼
        </button>
        
        <button
          type="button"
          className="delete-btn"
          onClick={onRemove}
          disabled={!canDelete}
          aria-label="Remove step"
        >
          ✕
        </button>
      </div>
    </div>
  );
};

export default StepItem;
