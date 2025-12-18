import React from 'react';
import RegistrationForm from '../components/RegistrationForm';
import './RegistrationView.css';

export default function RegistrationView() {
  return (
    <div className="registration-view">
      <div className="registration-container">
        <div className="branding">
          <h1 className="app-title">🍳 Recipe Notebook</h1>
        </div>

        <div className="registration-card">
          <h1 className="page-heading">Create Your Account</h1>
          <RegistrationForm />
        </div>

        <div role="status" aria-live="polite" aria-atomic="true" className="sr-only"></div>
      </div>
    </div>
  );
}
