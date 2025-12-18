import React from 'react';
import './UnsavedChangesDialog.css';

const UnsavedChangesDialog = ({ isOpen, onCancel, onConfirm }) => {
  if (!isOpen) return null;

  return (
    <div className="dialog-overlay" onClick={onCancel}>
      <div className="dialog-container" onClick={(e) => e.stopPropagation()}>
        <div className="dialog-header">
          <h3>Unsaved Changes</h3>
        </div>
        
        <div className="dialog-content">
          <p>You have unsaved changes. Are you sure you want to leave?</p>
        </div>
        
        <div className="dialog-actions">
          <button
            className="btn-secondary"
            onClick={onCancel}
          >
            Stay
          </button>
          
          <button
            className="btn-danger"
            onClick={onConfirm}
          >
            Leave
          </button>
        </div>
      </div>
    </div>
  );
};

export default UnsavedChangesDialog;
