import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useRecipeForm } from '../hooks/useRecipeForm';
import { categoriesApi, recipesApi } from '../services/api';
import BasicInfoSection from '../components/recipe-form/BasicInfoSection';
import CategorySection from '../components/recipe-form/CategorySection';
import IngredientsSection from '../components/recipe-form/IngredientsSection';
import StepsSection from '../components/recipe-form/StepsSection';
import FormActions from '../components/recipe-form/FormActions';
import UnsavedChangesDialog from '../components/UnsavedChangesDialog';
import './CreateRecipeView.css';

const CreateRecipeView = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showUnsavedDialog, setShowUnsavedDialog] = useState(false);

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
    const fetchCategories = async () => {
      try {
        setIsLoadingCategories(true);
        const response = await categoriesApi.getCategories();
        
        if (response.data?.status === 'success' && response.data?.data?.categories) {
          setCategories(response.data.data.categories);
        }
      } catch (error) {
        toast.error('Failed to load categories');
        console.error('Category fetch error:', error);
      } finally {
        setIsLoadingCategories(false);
      }
    };

    fetchCategories();
  }, []);

  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty]);

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

      const response = await recipesApi.createRecipe(request);
      
      if (response.data?.status === 'success' && response.data?.data?.recipeId) {
        toast.success('Recipe created successfully');
        navigate(`/recipes/${response.data.data.recipeId}`);
      }
    } catch (error) {
      if (error.response?.status === 400 && error.response?.data?.data?.errors) {
        const serverErrors = error.response.data.data.errors;
        setErrors(serverErrors);
        toast.error('Validation failed. Please check the form.');
      } else if (error.response?.status === 404) {
        toast.error('Invalid category selected');
      } else if (error.response?.status === 401) {
        toast.error('Session expired. Please log in again.');
        navigate('/login');
      } else {
        toast.error('Failed to create recipe. Please try again.');
      }
      console.error('Recipe creation error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (isDirty) {
      setShowUnsavedDialog(true);
    } else {
      navigate('/recipes');
    }
  };

  const confirmLeave = () => {
    setShowUnsavedDialog(false);
    navigate('/recipes');
  };

  return (
    <div className="create-recipe-view">
      <div className="container">
        <header className="page-header">
          <h1>Create New Recipe</h1>
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
            isLoading={isLoadingCategories}
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
          />
        </form>

        <UnsavedChangesDialog
          isOpen={showUnsavedDialog}
          onCancel={() => setShowUnsavedDialog(false)}
          onConfirm={confirmLeave}
        />
      </div>
    </div>
  );
};

export default CreateRecipeView;
