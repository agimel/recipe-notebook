import { useState, useEffect, useCallback, useMemo } from 'react';
import { recipesApi, categoriesApi } from '../services/api';

export default function useRecipeList() {
  const [recipes, setRecipes] = useState([]);
  const [filters, setFilters] = useState({
    categoryIds: [],
    difficulty: null,
    search: ''
  });
  const [pagination, setPagination] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [searchInput, setSearchInput] = useState('');

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await categoriesApi.getCategories();
        setCategories(response.data.data.categories);
      } catch (err) {
        console.error('Failed to fetch categories:', err);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchRecipes = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const params = {
          page: currentPage,
          size: 20,
          sort: 'title',
          direction: 'asc'
        };
        
        if (filters.categoryIds.length > 0) {
          params.categoryIds = filters.categoryIds.join(',');
        }
        if (filters.difficulty) {
          params.difficulty = filters.difficulty;
        }
        if (filters.search) {
          params.search = filters.search;
        }
        
        const response = await recipesApi.getRecipes(params);
        const { recipes: newRecipes, pagination: newPagination } = response.data.data;
        
        if (currentPage === 0) {
          setRecipes(newRecipes);
        } else {
          setRecipes(prev => [...prev, ...newRecipes]);
        }
        
        setPagination(newPagination);
      } catch (err) {
        setError('Failed to fetch recipes. Please try again.');
        console.error('Fetch recipes error:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchRecipes();
  }, [currentPage, filters]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setFilters(prev => ({ ...prev, search: searchInput }));
      setCurrentPage(0);
    }, 300);
    
    return () => clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    const savedScrollY = sessionStorage.getItem('recipeListScrollY');
    if (savedScrollY) {
      window.scrollTo(0, parseInt(savedScrollY, 10));
      sessionStorage.removeItem('recipeListScrollY');
    }
    
    return () => {
      sessionStorage.setItem('recipeListScrollY', window.scrollY.toString());
    };
  }, []);

  const handleSearch = useCallback((query) => {
    setSearchInput(query);
  }, []);

  const handleCategoryChange = useCallback((categoryIds) => {
    setFilters(prev => ({ ...prev, categoryIds }));
    setCurrentPage(0);
  }, []);

  const handleDifficultyChange = useCallback((difficulty) => {
    setFilters(prev => ({ ...prev, difficulty }));
    setCurrentPage(0);
  }, []);

  const handleClearFilters = useCallback(() => {
    setFilters({ categoryIds: [], difficulty: null, search: '' });
    setSearchInput('');
    setCurrentPage(0);
  }, []);

  const handleLoadMore = useCallback(() => {
    if (pagination?.hasNext && !loading) {
      setCurrentPage(prev => prev + 1);
    }
  }, [pagination, loading]);

  const hasActiveFilters = useMemo(() => {
    return filters.categoryIds.length > 0 || 
           filters.difficulty !== null || 
           filters.search !== '';
  }, [filters]);

  return {
    recipes,
    filters,
    pagination,
    categories,
    loading,
    error,
    searchInput,
    handleSearch,
    handleCategoryChange,
    handleDifficultyChange,
    handleClearFilters,
    handleLoadMore,
    hasActiveFilters
  };
}
