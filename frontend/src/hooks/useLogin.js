import { useState } from 'react';
import toast from 'react-hot-toast';
import { authApi } from '../services/api';
import { useAuth } from './useAuth';

export function useLogin() {
  const [isLoading, setIsLoading] = useState(false);
  const { login: setAuthData } = useAuth();

  const login = async (credentials) => {
    setIsLoading(true);
    
    try {
      const response = await authApi.login(credentials);
      
      if (response.data.status === 'success' && response.data.data) {
        const { token, username, expiresAt } = response.data.data;
        
        setAuthData(token, username, expiresAt);
        
        toast.success('Login successful!');
        
        return { success: true };
      } else {
        throw new Error(response.data.message || 'Login failed');
      }
    } catch (error) {
      let errorMessage = 'An unexpected error occurred. Please try again.';
      
      if (error.response) {
        if (error.response.status === 401) {
          errorMessage = 'Invalid username or password';
        } else if (error.response.status === 400) {
          errorMessage = error.response.data.message || 'Validation failed';
        } else if (error.response.data?.message) {
          errorMessage = error.response.data.message;
        }
      } else if (error.request) {
        errorMessage = 'Unable to connect to server. Please check your internet connection.';
      }
      
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  return { login, isLoading };
}
