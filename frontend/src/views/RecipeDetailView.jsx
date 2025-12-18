import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { recipesApi } from '../services/api';
import { VIEW_STATES } from '../types/recipe';
import LoadingSkeleton from '../components/recipe/LoadingSkeleton';
import ErrorDisplay from '../components/recipe/ErrorDisplay';
import RecipeContent from '../components/recipe/RecipeContent';
import './RecipeDetailView.css';

function RecipeDetailView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const titleRef = useRef(null);
  
  const [recipe, setRecipe] = useState(null);
  const [viewState, setViewState] = useState(VIEW_STATES.LOADING);
  const [errorMessage, setErrorMessage] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchRecipe = async () => {
    const userId = sessionStorage.getItem('userId');
    
    if (!userId) {
      toast.error('Please log in to view recipes');
      navigate('/login');
      return;
    }

    try {
      setViewState(VIEW_STATES.LOADING);
      const response = await recipesApi.getRecipe(id);
      
      if (response.data.status === 'success' && response.data.data) {
        setRecipe(response.data.data);
        setViewState(VIEW_STATES.SUCCESS);
        
        setTimeout(() => {
          if (titleRef.current) {
            titleRef.current.focus();
          }
        }, 100);
      } else {
        setViewState(VIEW_STATES.NOT_FOUND);
      }
    } catch (error) {
      if (error.response?.status === 404) {
        setViewState(VIEW_STATES.NOT_FOUND);
      } else if (error.response?.status === 401) {
        sessionStorage.removeItem('userId');
        toast.error('Session expired. Please log in again.');
        navigate(`/login?returnTo=/recipes/${id}`);
      } else {
        setViewState(VIEW_STATES.ERROR);
        setErrorMessage(
          error.response?.data?.message || 
          'Unable to load recipe. Please check your connection and try again.'
        );
      }
    }
  };

  useEffect(() => {
    fetchRecipe();
  }, [id]);

  const handleEdit = () => {
    navigate(`/recipes/${id}/edit`);
  };

  const handleDeleteClick = () => {
    setDeleteDialogOpen(true);
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
  };

  const handleDeleteConfirm = async () => {
    setIsDeleting(true);
    
    try {
      const response = await recipesApi.deleteRecipe(id);
      
      if (response.data.status === 'success') {
        toast.success('Recipe deleted successfully');
        navigate('/recipes');
      } else {
        throw new Error(response.data.message || 'Failed to delete recipe');
      }
    } catch (error) {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
      
      const errorMsg = error.response?.data?.message || error.message || 'Failed to delete recipe. Please try again.';
      toast.error(errorMsg);
    }
  };

  const handleRetry = () => {
    fetchRecipe();
  };

  return (
    <main className="recipe-detail-view">
      {viewState === VIEW_STATES.LOADING && <LoadingSkeleton />}
      
      {viewState === VIEW_STATES.SUCCESS && recipe && (
        <>
          <div className="recipe-detail-nav">
            <button 
              onClick={() => navigate('/recipes')} 
              className="back-button"
              aria-label="Back to recipes list"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
              </svg>
              Back to Recipes
            </button>
          </div>
          <RecipeContent
            recipe={recipe}
            onEdit={handleEdit}
            onDelete={handleDeleteClick}
            deleteDialogOpen={deleteDialogOpen}
            isDeleting={isDeleting}
            onDeleteConfirm={handleDeleteConfirm}
            onDeleteCancel={handleDeleteCancel}
            titleRef={titleRef}
          />
        </>
      )}
      
      {(viewState === VIEW_STATES.ERROR || viewState === VIEW_STATES.NOT_FOUND) && (
        <ErrorDisplay
          errorType={viewState === VIEW_STATES.NOT_FOUND ? 'notFound' : 'error'}
          errorMessage={errorMessage}
          onRetry={viewState === VIEW_STATES.ERROR ? handleRetry : undefined}
        />
      )}
    </main>
  );
}

export default RecipeDetailView;
