import React, { useState } from 'react';
import './FormInput.css';

export default function FormInput({
  name,
  label,
  placeholder,
  type = 'text',
  register,
  rules = {},
  error,
  value = '',
  maxLength,
  showCharacterCounter = false,
  autoFocus = false
}) {
  const [showPassword, setShowPassword] = useState(false);
  
  const inputType = type === 'password' && showPassword ? 'text' : type;
  const errorId = `${name}-error`;

  return (
    <div className="form-input">
      <label htmlFor={name} className="form-label">
        {label}
      </label>
      
      <div className="input-wrapper">
        <input
          id={name}
          type={inputType}
          placeholder={placeholder}
          className={`form-control ${error ? 'invalid' : ''}`}
          aria-invalid={!!error}
          aria-describedby={error ? errorId : undefined}
          maxLength={maxLength}
          autoFocus={autoFocus}
          {...register(name, rules)}
        />
        
        {type === 'password' && (
          <button
            type="button"
            className="password-toggle"
            onClick={() => setShowPassword(!showPassword)}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? '🙈' : '👁️'}
          </button>
        )}
      </div>

      {showCharacterCounter && maxLength && (
        <div className="character-counter">
          <span className={value.length >= maxLength ? 'at-limit' : ''}>
            {value.length}/{maxLength}
          </span>
        </div>
      )}

      {error && (
        <span id={errorId} className="error-message" role="alert">
          {error.message}
        </span>
      )}
    </div>
  );
}
