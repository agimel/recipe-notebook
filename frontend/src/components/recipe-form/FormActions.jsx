import React from 'react';
import './FormActions.css';

const FormActions = ({ isSubmitting, onCancel, onSave, saveButtonText = 'Save Recipe' }) => {
  return (
    <div className="form-actions">
      <button
        type="button"
        className="btn-secondary"
        onClick={onCancel}
        disabled={isSubmitting}
      >
        Cancel
      </button>
      
      <button
        type="button"
        className="btn-primary"
        onClick={onSave}
        disabled={isSubmitting}
      >
        {isSubmitting ? 'Saving...' : saveButtonText}
      </button>
    </div>
  );
};

export default FormActions;
