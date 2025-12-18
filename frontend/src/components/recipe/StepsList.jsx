import React from 'react';
import './StepsList.css';

function StepsList({ steps }) {
  if (!steps || steps.length === 0) {
    return <p className="empty-message">No steps listed</p>;
  }

  return (
    <ol className="steps-list">
      {steps.map((step) => (
        <li key={step.id} className="step-item">
          {step.instruction}
        </li>
      ))}
    </ol>
  );
}

export default StepsList;
