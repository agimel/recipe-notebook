import { useState, useCallback } from 'react';
import { getInitialFormData, getInitialErrors, getInitialTouched } from '../types/recipe';

export const useRecipeForm = (initialData) => {
  const [formData, setFormData] = useState(initialData || getInitialFormData());
  const [errors, setErrors] = useState(getInitialErrors());
  const [touched, setTouched] = useState(getInitialTouched());
  const [isDirty, setIsDirty] = useState(false);

  const updateField = useCallback((field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setIsDirty(true);
  }, []);

  const handleBlur = useCallback((field) => {
    setTouched(prev => ({ ...prev, [field]: true }));
  }, []);

  const addIngredient = useCallback(() => {
    setFormData(prev => ({
      ...prev,
      ingredients: [...prev.ingredients, { quantity: '', unit: '', name: '' }]
    }));
    setIsDirty(true);
    
    setTimeout(() => {
      const newIndex = document.querySelectorAll('.ingredient-row').length - 1;
      const newRow = document.querySelectorAll('.ingredient-row')[newIndex];
      newRow?.querySelector('input')?.focus();
    }, 0);
  }, []);

  const removeIngredient = useCallback((index) => {
    setFormData(prev => ({
      ...prev,
      ingredients: prev.ingredients.filter((_, i) => i !== index)
    }));
    setIsDirty(true);
  }, []);

  const updateIngredient = useCallback((index, field, value) => {
    setFormData(prev => ({
      ...prev,
      ingredients: prev.ingredients.map((ing, i) => 
        i === index ? { ...ing, [field]: value } : ing
      )
    }));
    setIsDirty(true);
  }, []);

  const ingredientBlur = useCallback((index, field) => {
    setTouched(prev => ({
      ...prev,
      ingredients: {
        ...prev.ingredients,
        [index]: {
          ...prev.ingredients?.[index],
          [field]: true
        }
      }
    }));
  }, []);

  const addStep = useCallback(() => {
    setFormData(prev => ({
      ...prev,
      steps: [...prev.steps, { instruction: '' }]
    }));
    setIsDirty(true);
    
    setTimeout(() => {
      const textareas = document.querySelectorAll('.step-content textarea');
      textareas[textareas.length - 1]?.focus();
    }, 0);
  }, []);

  const removeStep = useCallback((index) => {
    setFormData(prev => ({
      ...prev,
      steps: prev.steps.filter((_, i) => i !== index)
    }));
    setIsDirty(true);
  }, []);

  const updateStep = useCallback((index, value) => {
    setFormData(prev => ({
      ...prev,
      steps: prev.steps.map((step, i) => 
        i === index ? { instruction: value } : step
      )
    }));
    setIsDirty(true);
  }, []);

  const stepBlur = useCallback((index) => {
    setTouched(prev => ({
      ...prev,
      steps: {
        ...prev.steps,
        [index]: true
      }
    }));
  }, []);

  const moveStepUp = useCallback((index) => {
    if (index === 0) return;
    setFormData(prev => {
      const newSteps = [...prev.steps];
      [newSteps[index - 1], newSteps[index]] = [newSteps[index], newSteps[index - 1]];
      return { ...prev, steps: newSteps };
    });
    setIsDirty(true);
  }, []);

  const moveStepDown = useCallback((index) => {
    setFormData(prev => {
      if (index >= prev.steps.length - 1) return prev;
      const newSteps = [...prev.steps];
      [newSteps[index], newSteps[index + 1]] = [newSteps[index + 1], newSteps[index]];
      return { ...prev, steps: newSteps };
    });
    setIsDirty(true);
  }, []);

  const validateForm = useCallback((data) => {
    const validationErrors = {};

    if (!data.title || data.title.trim() === '') {
      validationErrors.title = 'Title is required';
    } else if (data.title.length > 100) {
      validationErrors.title = 'Title must not exceed 100 characters';
    }

    if (!data.difficulty) {
      validationErrors.difficulty = 'Difficulty is required';
    } else if (!['EASY', 'MEDIUM', 'HARD'].includes(data.difficulty)) {
      validationErrors.difficulty = 'Difficulty must be EASY, MEDIUM, or HARD';
    }

    if (!data.cookingTimeMinutes) {
      validationErrors.cookingTimeMinutes = 'Cooking time is required';
    } else if (data.cookingTimeMinutes < 1) {
      validationErrors.cookingTimeMinutes = 'Cooking time must be at least 1 minute';
    }

    if (!data.categoryIds || data.categoryIds.length === 0) {
      validationErrors.categoryIds = 'At least one category is required';
    }

    const validIngredients = data.ingredients.filter(
      ing => ing.quantity || ing.unit || ing.name
    );

    if (validIngredients.length === 0) {
      validationErrors.ingredients = { 0: { name: 'At least one ingredient is required' } };
    } else {
      const ingredientErrors = {};
      validIngredients.forEach((ing, idx) => {
        const ingErrors = {};

        if (!ing.quantity) {
          ingErrors.quantity = 'Quantity is required';
        } else if (ing.quantity.length > 20) {
          ingErrors.quantity = 'Quantity must not exceed 20 characters';
        }

        if (!ing.unit) {
          ingErrors.unit = 'Unit is required';
        } else if (ing.unit.length > 20) {
          ingErrors.unit = 'Unit must not exceed 20 characters';
        }

        if (!ing.name) {
          ingErrors.name = 'Name is required';
        } else if (ing.name.length > 50) {
          ingErrors.name = 'Name must not exceed 50 characters';
        }

        if (Object.keys(ingErrors).length > 0) {
          ingredientErrors[idx] = ingErrors;
        }
      });

      if (Object.keys(ingredientErrors).length > 0) {
        validationErrors.ingredients = ingredientErrors;
      }
    }

    const validSteps = data.steps.filter(step => step.instruction.trim());

    if (validSteps.length < 2) {
      validationErrors.steps = { 0: 'At least two steps are required' };
    } else {
      const stepErrors = {};
      validSteps.forEach((step, idx) => {
        if (!step.instruction || step.instruction.trim() === '') {
          stepErrors[idx] = 'Instruction is required';
        } else if (step.instruction.length > 500) {
          stepErrors[idx] = 'Instruction must not exceed 500 characters';
        }
      });

      if (Object.keys(stepErrors).length > 0) {
        validationErrors.steps = stepErrors;
      }
    }

    return validationErrors;
  }, []);

  const resetForm = useCallback(() => {
    setFormData(getInitialFormData());
    setErrors(getInitialErrors());
    setTouched(getInitialTouched());
    setIsDirty(false);
  }, []);

  const getFormData = useCallback(() => formData, [formData]);

  return {
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
    resetForm,
    getFormData,
    setErrors,
    setTouched
  };
};
