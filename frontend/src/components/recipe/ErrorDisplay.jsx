import React from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../Button';
import './ErrorDisplay.css';

function ErrorDisplay({ errorType, errorMessage, onRetry }) {
  const navigate = useNavigate();

  const getErrorContent = () => {
    switch (errorType) {
      case 'notFound':
        return {
          icon: '🔍',
          title: 'Recipe Not Found',
          message: "This recipe doesn't exist or you don't have permission to view it."
        };
      case 'unauthorized':
        return {
          icon: '🔒',
          title: 'Unauthorized',
          message: 'You need to log in to view this recipe.'
        };
      default:
        return {
          icon: '⚠️',
          title: 'Something Went Wrong',
          message: errorMessage || 'Unable to load recipe. Please try again.'
        };
    }
  };

  const content = getErrorContent();
  const showRetry = errorType === 'error' && onRetry;

  return (
    <div className="error-display">
      <div className="error-content">
        <div className="error-icon" aria-hidden="true">{content.icon}</div>
        <h1 className="error-title">{content.title}</h1>
        <p className="error-message">{content.message}</p>
        <div className="error-actions">
          {showRetry && (
            <Button onClick={onRetry} variant="primary">
              Try Again
            </Button>
          )}
          <Button onClick={() => navigate('/recipes')} variant="secondary">
            Back to Recipes
          </Button>
        </div>
      </div>
    </div>
  );
}

export default ErrorDisplay;
