import React from 'react';
import StepsList from './StepsList';
import './StepsSection.css';

function StepsSection({ steps }) {
  return (
    <section className="steps-section" aria-labelledby="steps-heading">
      <h2 id="steps-heading" className="section-heading">Instructions</h2>
      <StepsList steps={steps} />
    </section>
  );
}

export default StepsSection;
