import React, { useEffect, useRef } from 'react';
import './DeleteConfirmationDialog.css';

function DeleteConfirmationDialog({ open, recipeTitle, isDeleting, onConfirm, onCancel }) {
  const cancelButtonRef = useRef(null);
  const dialogRef = useRef(null);

  useEffect(() => {
    if (open && cancelButtonRef.current) {
      cancelButtonRef.current.focus();
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const handleEscape = (e) => {
      if (e.key === 'Escape' && !isDeleting) {
        onCancel();
      }
    };

    const handleClickOutside = (e) => {
      if (dialogRef.current && !dialogRef.current.contains(e.target) && !isDeleting) {
        onCancel();
      }
    };

    document.addEventListener('keydown', handleEscape);
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [open, isDeleting, onCancel]);

  if (!open) return null;

  return (
    <div className="dialog-overlay" role="dialog" aria-modal="true" aria-labelledby="dialog-title">
      <div className="dialog-container" ref={dialogRef}>
        <div className="dialog-header">
          <h2 id="dialog-title" className="dialog-title">Delete Recipe?</h2>
        </div>
        <div className="dialog-content">
          <p>
            Are you sure you want to delete <strong>"{recipeTitle}"</strong>? 
            This action cannot be undone.
          </p>
        </div>
        <div className="dialog-actions">
          <button
            ref={cancelButtonRef}
            onClick={onCancel}
            className="dialog-button dialog-button-cancel"
            disabled={isDeleting}
            type="button"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="dialog-button dialog-button-confirm"
            disabled={isDeleting}
            type="button"
          >
            {isDeleting ? (
              <>
                <span className="spinner" aria-hidden="true"></span>
                Deleting...
              </>
            ) : (
              'Delete'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default DeleteConfirmationDialog;
