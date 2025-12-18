import React from 'react';
import StepItem from './StepItem';
import './StepsSection.css';

const StepsSection = ({ 
  steps, 
  errors, 
  touched, 
  onAddStep, 
  onRemoveStep, 
  onStepChange, 
  onStepBlur, 
  onMoveStepUp, 
  onMoveStepDown 
}) => {
  const validStepsCount = steps.filter(step => step.instruction.trim()).length;
  const hasMinimum = validStepsCount >= 2;

  return (
    <div className="steps-section">
      <div className="section-header">
        <h3>Steps</h3>
        <span className={`count-indicator ${hasMinimum ? 'valid' : 'invalid'}`}>
          {validStepsCount} step{validStepsCount !== 1 ? 's' : ''} added 
          (minimum 2 required)
        </span>
      </div>

      <div className="steps-list">
        {steps.map((step, index) => (
          <StepItem
            key={index}
            index={index}
            step={step}
            error={errors?.steps?.[index]}
            touched={touched?.steps?.[index]}
            isFirst={index === 0}
            isLast={index === steps.length - 1}
            canDelete={steps.length > 2}
            onStepChange={(value) => onStepChange(index, value)}
            onStepBlur={() => onStepBlur(index)}
            onMoveUp={() => onMoveStepUp(index)}
            onMoveDown={() => onMoveStepDown(index)}
            onRemove={() => onRemoveStep(index)}
          />
        ))}
      </div>

      <button
        type="button"
        className="add-btn"
        onClick={onAddStep}
      >
        + Add Step
      </button>

      {errors?.steps && !hasMinimum && (
        <span className="section-error">At least two steps are required</span>
      )}
    </div>
  );
};

export default StepsSection;
