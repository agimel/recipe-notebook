import React from 'react';
import './Button.css';

export default function Button({ 
  type = 'button', 
  isLoading = false, 
  disabled = false, 
  onClick, 
  children, 
  variant = 'primary' 
}) {
  return (
    <button
      type={type}
      className={`btn btn-${variant}`}
      disabled={disabled || isLoading}
      onClick={onClick}
    >
      {isLoading ? (
        <>
          <span className="spinner"></span>
          {typeof children === 'string' ? 'Loading...' : children}
        </>
      ) : (
        children
      )}
    </button>
  );
}
