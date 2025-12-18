export const getInitialFormData = () => ({
  title: '',
  difficulty: '',
  cookingTimeMinutes: null,
  categoryIds: [],
  ingredients: [{ quantity: '', unit: '', name: '' }],
  steps: [
    { instruction: '' },
    { instruction: '' }
  ]
});

export const getInitialErrors = () => ({});

export const getInitialTouched = () => ({});

export const VIEW_STATES = {
  LOADING: 'loading',
  SUCCESS: 'success',
  ERROR: 'error',
  NOT_FOUND: 'notFound'
};

export const DIFFICULTY_LEVELS = {
  EASY: 'EASY',
  MEDIUM: 'MEDIUM',
  HARD: 'HARD'
};
