import axios from 'axios';

const apiClient = axios.create({
  baseURL: '/api/v1',
  headers: {
    'Content-Type': 'application/json'
  }
});

export const authApi = {
  register: (data) => {
    return apiClient.post('/auth/register', data);
  },
  
  login: (data) => {
    return apiClient.post('/auth/login', data);
  }
};

export const recipesApi = {
  getRecipes: (params) => {
    const userId = sessionStorage.getItem('userId');
    return apiClient.get('/recipes', {
      params,
      headers: userId ? { 'X-User-Id': userId } : {}
    });
  },
  
  getRecipe: (id) => {
    const userId = sessionStorage.getItem('userId');
    return apiClient.get(`/recipes/${id}`, {
      headers: userId ? { 'X-User-Id': userId } : {}
    });
  },
  
  createRecipe: (data) => {
    const userId = sessionStorage.getItem('userId');
    return apiClient.post('/recipes', data, {
      headers: userId ? { 'X-User-Id': userId } : {}
    });
  },
  
  updateRecipe: (id, data) => {
    const userId = sessionStorage.getItem('userId');
    return apiClient.put(`/recipes/${id}`, data, {
      headers: userId ? { 'X-User-Id': userId } : {}
    });
  },
  
  deleteRecipe: (id) => {
    const userId = sessionStorage.getItem('userId');
    return apiClient.delete(`/recipes/${id}`, {
      headers: userId ? { 'X-User-Id': userId } : {}
    });
  }
};

export const categoriesApi = {
  getCategories: () => {
    return apiClient.get('/categories');
  }
};

export default apiClient;
