import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { authApi, recipesApi } from '../services/api';

export function useRegistration(setError) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setErrorState] = useState(null);
  const navigate = useNavigate();

  const register = async (data) => {
    setIsLoading(true);
    setErrorState(null);

    try {
      const response = await authApi.register(data);
      
      if (response.data.status === 'success') {
        const userId = response.data.data.userId;
        sessionStorage.setItem('userId', userId.toString());
        localStorage.setItem('username', response.data.data.username);
        
        toast.success('Welcome! Here\'s a sample recipe to get started. Try creating your own!');
        
        try {
          const recipesResponse = await recipesApi.getRecipes();
          const sampleRecipe = recipesResponse.data.data.recipes[0];
          
          if (sampleRecipe) {
            navigate(`/recipes/${sampleRecipe.id}`);
          } else {
            navigate('/recipes');
          }
        } catch (recipeError) {
          console.error('Failed to fetch sample recipe:', recipeError);
          navigate('/recipes');
        }
      }
    } catch (err) {
      if (err.response?.status === 400) {
        const validationErrors = err.response.data.data?.errors || {};
        Object.entries(validationErrors).forEach(([field, message]) => {
          setError(field, {
            type: 'server',
            message: message
          });
        });
      } else if (err.response?.status === 409) {
        setError('username', {
          type: 'server',
          message: 'Username already exists'
        });
      } else if (!err.response) {
        toast.error('Network error. Please check your connection.');
        console.error('Network error:', err);
      } else {
        toast.error('An error occurred. Please try again later.');
        console.error('Server error:', err);
      }
      setErrorState(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return { register, isLoading, error };
}
