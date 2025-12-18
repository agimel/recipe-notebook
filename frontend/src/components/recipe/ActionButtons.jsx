import React from 'react';
import Button from '../Button';
import './ActionButtons.css';

function ActionButtons({ onEdit, onDelete, isDeleting }) {
  return (
    <div className="action-buttons">
      <Button
        onClick={onEdit}
        variant="primary"
        disabled={isDeleting}
        aria-label="Edit recipe"
      >
        Edit Recipe
      </Button>
      <Button
        onClick={onDelete}
        variant="danger"
        disabled={isDeleting}
        aria-label="Delete recipe"
      >
        Delete Recipe
      </Button>
    </div>
  );
}

export default ActionButtons;
