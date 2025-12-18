import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useLogin } from '../hooks/useLogin';
import LoginForm from '../components/LoginForm';
import './LoginView.css';

export default function LoginView() {
  const { isAuthenticated } = useAuth();
  const { login, isLoading } = useLogin();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/recipes', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleLogin = async (credentials) => {
    await login(credentials);
  };

  return (
    <div className="login-view">
      <div className="login-container">
        <div className="branding">
          <h1 className="app-title">🍳 Recipe Notebook</h1>
        </div>

        <div className="login-card">
          <h1 className="page-heading">Welcome Back</h1>
          <LoginForm onSubmit={handleLogin} isLoading={isLoading} />
        </div>
      </div>
    </div>
  );
}
