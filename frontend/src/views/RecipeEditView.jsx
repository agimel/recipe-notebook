import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../hooks/useAuth';
import { useRecipeForm } from '../hooks/useRecipeForm';
import { useNavigationBlocker } from '../hooks/useNavigationBlocker';
import { categoriesApi, recipesApi } from '../services/api';
import BasicInfoSection from '../components/recipe-form/BasicInfoSection';
import CategorySection from '../components/recipe-form/CategorySection';
import IngredientsSection from '../components/recipe-form/IngredientsSection';
import StepsSection from '../components/recipe-form/StepsSection';
import FormActions from '../components/recipe-form/FormActions';
import UnsavedChangesDialog from '../components/UnsavedChangesDialog';
import './RecipeEditView.css';

const RecipeEditView = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { logout } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [recipe, setRecipe] = useState(null);
  const [categories, setCategories] = useState([]);
  const [recipeNotFound, setRecipeNotFound] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showUnsavedDialog, setShowUnsavedDialog] = useState(false);
  const [blockedNavigation, setBlockedNavigation] = useState(null);
  const [isInitializing, setIsInitializing] = useState(true);

  const {
    formData,
    errors,
    touched,
    isDirty,
    updateField,
    handleBlur,
    addIngredient,
    removeIngredient,
    updateIngredient,
    ingredientBlur,
    addStep,
    removeStep,
    updateStep,
    stepBlur,
    moveStepUp,
    moveStepDown,
    validateForm,
    setErrors,
    setTouched
  } = useRecipeForm();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setIsInitializing(true);
        const userId = sessionStorage.getItem('userId');
        
        if (!userId) {
          logout();
          toast.error('Session expired. Please log in again.');
          navigate('/login');
          return;
        }

        const [recipeResponse, categoriesResponse] = await Promise.all([
          recipesApi.getRecipe(id),
          categoriesApi.getCategories()
        ]);

        if (recipeResponse.data?.status === 'success' && recipeResponse.data?.data) {
          const recipeData = recipeResponse.data.data;
          setRecipe(recipeData);
          
          updateField('title', recipeData.title || '');
          updateField('difficulty', recipeData.difficulty || '');
          updateField('cookingTimeMinutes', recipeData.cookingTimeMinutes || null);
          updateField('categoryIds', recipeData.categories?.map(cat => cat.id) || []);
          updateField('ingredients', recipeData.ingredients?.length > 0 
            ? recipeData.ingredients.map(ing => ({
                id: ing.id,
                quantity: ing.quantity || '',
                unit: ing.unit || '',
                name: ing.name || ''
              }))
            : [{ quantity: '', unit: '', name: '' }]
          );
          updateField('steps', recipeData.steps?.length > 0
            ? recipeData.steps.map(step => ({
                id: step.id,
                instruction: step.instruction || ''
              }))
            : [{ instruction: '' }, { instruction: '' }]
          );
          
          setTimeout(() => setIsInitializing(false), 100);
        }

        if (categoriesResponse.data?.status === 'success' && categoriesResponse.data?.data?.categories) {
          setCategories(categoriesResponse.data.data.categories);
        }
      } catch (error) {
        if (error.response?.status === 404) {
          setRecipeNotFound(true);
        } else if (error.response?.status === 401) {
          logout();
          toast.error('Session expired. Please log in again.');
          navigate('/login');
        } else {
          toast.error('Failed to load recipe');
          console.error('Recipe fetch error:', error);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [id, navigate]);

  const actualIsDirty = !isInitializing && isDirty;

  const handleRefresh = useCallback(async () => {
    try {
      setIsLoading(true);
      setIsInitializing(true);
      const response = await recipesApi.getRecipe(id);
      
      if (response.data?.status === 'success' && response.data?.data) {
        const recipeData = response.data.data;
        setRecipe(recipeData);
        
        updateField('title', recipeData.title || '');
        updateField('difficulty', recipeData.difficulty || '');
        updateField('cookingTimeMinutes', recipeData.cookingTimeMinutes || null);
        updateField('categoryIds', recipeData.categories?.map(cat => cat.id) || []);
        updateField('ingredients', recipeData.ingredients?.length > 0 
          ? recipeData.ingredients.map(ing => ({
              id: ing.id,
              quantity: ing.quantity || '',
              unit: ing.unit || '',
              name: ing.name || ''
            }))
          : [{ quantity: '', unit: '', name: '' }]
        );
        updateField('steps', recipeData.steps?.length > 0
          ? recipeData.steps.map(step => ({
              id: step.id,
              instruction: step.instruction || ''
            }))
          : [{ instruction: '' }, { instruction: '' }]
        );
        
        setTimeout(() => setIsInitializing(false), 100);
        toast.success('Recipe data refreshed');
      }
    } catch (error) {
      toast.error('Failed to refresh recipe data');
      console.error('Recipe refresh error:', error);
    } finally {
      setIsLoading(false);
    }
  }, [id, updateField]);

  useNavigationBlocker(actualIsDirty, (tx) => {
    setBlockedNavigation(tx);
    setShowUnsavedDialog(true);
  });

  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (actualIsDirty) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [actualIsDirty]);

  const handleCategoryToggle = useCallback((categoryId) => {
    updateField('categoryIds', 
      formData.categoryIds.includes(categoryId)
        ? formData.categoryIds.filter(id => id !== categoryId)
        : [...formData.categoryIds, categoryId]
    );
  }, [formData.categoryIds, updateField]);

  const handleSubmit = async () => {
    const validationErrors = validateForm(formData);
    
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      
      const firstErrorField = Object.keys(validationErrors)[0];
      const element = document.querySelector(`[name="${firstErrorField}"]`) || 
                     document.querySelector(`#${firstErrorField}`);
      element?.focus();
      
      toast.error('Please fix validation errors');
      return;
    }

    try {
      setIsSubmitting(true);
      
      const userId = sessionStorage.getItem('userId');
      if (!userId) {
        logout();
        toast.error('Session expired. Please log in again.');
        navigate('/login');
        return;
      }

      const request = {
        title: formData.title.trim(),
        difficulty: formData.difficulty,
        cookingTimeMinutes: formData.cookingTimeMinutes,
        categoryIds: formData.categoryIds,
        ingredients: formData.ingredients
          .filter(ing => ing.quantity && ing.unit && ing.name)
          .map(ing => ({
            quantity: ing.quantity.trim(),
            unit: ing.unit.trim(),
            name: ing.name.trim()
          })),
        steps: formData.steps
          .filter(step => step.instruction.trim())
          .map(step => ({
            instruction: step.instruction.trim()
          }))
      };

      const response = await recipesApi.updateRecipe(id, request);
      
      if (response.data?.status === 'success') {
        toast.success('Recipe updated successfully');
        navigate(`/recipes/${id}`);
      }
    } catch (error) {
      if (error.response?.status === 400 && error.response?.data?.data?.errors) {
        const serverErrors = error.response.data.data.errors;
        setErrors(serverErrors);
        toast.error('Validation failed. Please check the form.');
      } else if (error.response?.status === 404) {
        toast.error('Recipe not found');
        navigate('/recipes');
      } else if (error.response?.status === 401) {
        logout();
        toast.error('Session expired. Please log in again.');
        navigate('/login');
      } else {
        toast.error('Failed to update recipe. Please try again.');
      }
      console.error('Recipe update error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (actualIsDirty) {
      setShowUnsavedDialog(true);
    } else {
      navigate(`/recipes/${id}`);
    }
  };

  const confirmLeave = () => {
    setShowUnsavedDialog(false);
    
    if (blockedNavigation) {
      blockedNavigation.retry();
      setBlockedNavigation(null);
    } else {
      navigate(`/recipes/${id}`);
    }
  };

  const cancelLeave = () => {
    setShowUnsavedDialog(false);
    setBlockedNavigation(null);
  };

  if (isLoading) {
    return (
      <div className="recipe-edit-view">
        <div className="container">
          <div className="loading-skeleton">
            <div className="skeleton-header"></div>
            <div className="skeleton-form">
              <div className="skeleton-section"></div>
              <div className="skeleton-section"></div>
              <div className="skeleton-section"></div>
              <div className="skeleton-section"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (recipeNotFound) {
    return (
      <div className="recipe-edit-view">
        <div className="container">
          <div className="not-found-message">
            <div className="error-icon">⚠️</div>
            <h2>Recipe Not Found</h2>
            <p>This recipe doesn't exist or you don't have permission to edit it.</p>
            <button 
              className="btn btn-primary"
              onClick={() => navigate('/recipes')}
            >
              Back to Recipes
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="recipe-edit-view">
      <div className="container">
        <header className="page-header">
          <h1>Edit Recipe: {recipe?.title}</h1>
        </header>

        <form className="recipe-form" onSubmit={(e) => e.preventDefault()}>
          <BasicInfoSection
            title={formData.title}
            difficulty={formData.difficulty}
            cookingTimeMinutes={formData.cookingTimeMinutes}
            errors={errors}
            touched={touched}
            onFieldChange={updateField}
            onFieldBlur={handleBlur}
          />

          <CategorySection
            categories={categories}
            selectedCategoryIds={formData.categoryIds}
            error={errors.categoryIds}
            touched={touched.categoryIds}
            onCategoryToggle={handleCategoryToggle}
            isLoading={false}
          />

          <IngredientsSection
            ingredients={formData.ingredients}
            errors={errors}
            touched={touched}
            onAddIngredient={addIngredient}
            onRemoveIngredient={removeIngredient}
            onIngredientChange={updateIngredient}
            onIngredientBlur={ingredientBlur}
          />

          <StepsSection
            steps={formData.steps}
            errors={errors}
            touched={touched}
            onAddStep={addStep}
            onRemoveStep={removeStep}
            onStepChange={updateStep}
            onStepBlur={stepBlur}
            onMoveStepUp={moveStepUp}
            onMoveStepDown={moveStepDown}
          />

          <FormActions
            isSubmitting={isSubmitting}
            onCancel={handleCancel}
            onSave={handleSubmit}
            saveButtonText="Update Recipe"
          />
        </form>

        <UnsavedChangesDialog
          isOpen={showUnsavedDialog}
          onCancel={cancelLeave}
          onConfirm={confirmLeave}
        />
      </div>
    </div>
  );
};

export default RecipeEditView;
