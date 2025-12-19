import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import toast from 'react-hot-toast';
import CreateRecipeView from './CreateRecipeView';
import { categoriesApi, recipesApi } from '../services/api';

vi.mock('../services/api');
vi.mock('react-hot-toast');

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate
  };
});

function renderWithRouter(component) {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
}

describe('CreateRecipeView', () => {
  const mockCategories = [
    { id: 1, name: 'Italian' },
    { id: 2, name: 'Dessert' },
    { id: 3, name: 'Vegetarian' }
  ];

  beforeEach(() => {
    sessionStorage.setItem('userId', '123');
    
    categoriesApi.getCategories.mockResolvedValue({
      data: {
        status: 'success',
        data: {
          categories: mockCategories
        }
      }
    });

    recipesApi.createRecipe.mockResolvedValue({
      data: {
        status: 'success',
        data: {
          recipeId: 42
        }
      }
    });

    mockNavigate.mockClear();
    toast.error.mockClear();
    toast.success.mockClear();
  });

  afterEach(() => {
    vi.clearAllMocks();
    sessionStorage.clear();
  });

  describe('Rendering & Initial State', () => {
    it('renders the page title', async () => {
      renderWithRouter(<CreateRecipeView />);
      
      expect(screen.getByRole('heading', { name: /Create New Recipe/i })).toBeInTheDocument();
    });

    it('renders all form sections', async () => {
      renderWithRouter(<CreateRecipeView />);
      
      await waitFor(() => {
        expect(screen.getByLabelText(/Title/i)).toBeInTheDocument();
      });
      
      expect(screen.getByLabelText(/Difficulty/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Cooking Time/i)).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: /Categories/i })).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: /Ingredients/i })).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: /Steps/i })).toBeInTheDocument();
    });

    it('renders form action buttons', async () => {
      renderWithRouter(<CreateRecipeView />);
      
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Cancel/i })).toBeInTheDocument();
      });
      
      expect(screen.getByRole('button', { name: /Save Recipe/i })).toBeInTheDocument();
    });

    it('initializes with one empty ingredient row', async () => {
      renderWithRouter(<CreateRecipeView />);
      
      await waitFor(() => {
        const ingredientInputs = screen.getAllByPlaceholderText(/Quantity/i);
        expect(ingredientInputs).toHaveLength(1);
      });
    });

    it('initializes with two empty step rows', async () => {
      renderWithRouter(<CreateRecipeView />);
      
      await waitFor(() => {
        const stepTextareas = screen.getAllByPlaceholderText(/Enter step instruction/i);
        expect(stepTextareas).toHaveLength(2);
      });
    });

    it('fetches and displays categories on mount', async () => {
      renderWithRouter(<CreateRecipeView />);
      
      await waitFor(() => {
        expect(categoriesApi.getCategories).toHaveBeenCalled();
      });

      await waitFor(() => {
        expect(screen.getByText('Italian')).toBeInTheDocument();
        expect(screen.getByText('Dessert')).toBeInTheDocument();
        expect(screen.getByText('Vegetarian')).toBeInTheDocument();
      });
    });

    it('shows error toast when categories fail to load', async () => {
      categoriesApi.getCategories.mockRejectedValueOnce(new Error('Network error'));
      
      renderWithRouter(<CreateRecipeView />);
      
      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Failed to load categories');
      });
    });
  });

  describe('Basic Info Section - Title Field', () => {
    it('updates title value when user types', async () => {
      const user = userEvent.setup();
      renderWithRouter(<CreateRecipeView />);
      
      await waitFor(() => {
        expect(screen.getByLabelText(/Title/i)).toBeInTheDocument();
      });

      const titleInput = screen.getByLabelText(/Title/i);
      await user.type(titleInput, 'Chocolate Cake');
      
      expect(titleInput).toHaveValue('Chocolate Cake');
    });

    it('displays character counter for title field', async () => {
      const user = userEvent.setup();
      renderWithRouter(<CreateRecipeView />);
      
      await waitFor(() => {
        expect(screen.getByText('0/100')).toBeInTheDocument();
      });

      const titleInput = screen.getByLabelText(/Title/i);
      await user.type(titleInput, 'Test');
      
      expect(screen.getByText('4/100')).toBeInTheDocument();
    });

    it('enforces maximum title length of 100 characters', async () => {
      const user = userEvent.setup();
      renderWithRouter(<CreateRecipeView />);
      
      await waitFor(() => {
        expect(screen.getByLabelText(/Title/i)).toBeInTheDocument();
      });

      const longTitle = 'a'.repeat(150);
      const titleInput = screen.getByLabelText(/Title/i);
      await user.type(titleInput, longTitle);
      
      expect(titleInput).toHaveValue('a'.repeat(100));
    });

    it('shows validation error for empty title on blur', async () => {
      const user = userEvent.setup();
      renderWithRouter(<CreateRecipeView />);
      
      await waitFor(() => {
        expect(screen.getByLabelText(/Title/i)).toBeInTheDocument();
      });

      const titleInput = screen.getByLabelText(/Title/i);
      await user.click(titleInput);
      await user.tab();
      
      const saveButton = screen.getByRole('button', { name: /Save Recipe/i });
      await user.click(saveButton);
      
      await waitFor(() => {
        expect(screen.getByText(/Title is required/i)).toBeInTheDocument();
      });
    });
  });

  describe('Basic Info Section - Difficulty Field', () => {
    it('updates difficulty when user selects an option', async () => {
      const user = userEvent.setup();
      renderWithRouter(<CreateRecipeView />);
      
      await waitFor(() => {
        expect(screen.getByLabelText(/Difficulty/i)).toBeInTheDocument();
      });

      const difficultySelect = screen.getByLabelText(/Difficulty/i);
      await user.selectOptions(difficultySelect, 'MEDIUM');
      
      expect(difficultySelect).toHaveValue('MEDIUM');
    });

    it('displays all difficulty options', async () => {
      renderWithRouter(<CreateRecipeView />);
      
      await waitFor(() => {
        expect(screen.getByLabelText(/Difficulty/i)).toBeInTheDocument();
      });

      const difficultySelect = screen.getByLabelText(/Difficulty/i);
      const options = Array.from(difficultySelect.options).map(opt => opt.value);
      
      expect(options).toContain('EASY');
      expect(options).toContain('MEDIUM');
      expect(options).toContain('HARD');
    });

    it('validates difficulty is required on submit', async () => {
      const user = userEvent.setup();
      renderWithRouter(<CreateRecipeView />);
      
      await waitFor(() => {
        expect(screen.getByLabelText(/Title/i)).toBeInTheDocument();
      });

      const titleInput = screen.getByLabelText(/Title/i);
      await user.type(titleInput, 'Test Recipe');

      const saveButton = screen.getByRole('button', { name: /Save Recipe/i });
      await user.click(saveButton);
      
      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Please fix validation errors');
      });
    });
  });

  describe('Basic Info Section - Cooking Time Field', () => {
    it('updates cooking time when user enters a number', async () => {
      const user = userEvent.setup();
      renderWithRouter(<CreateRecipeView />);
      
      await waitFor(() => {
        expect(screen.getByLabelText(/Cooking Time/i)).toBeInTheDocument();
      });

      const cookingTimeInput = screen.getByLabelText(/Cooking Time/i);
      await user.type(cookingTimeInput, '45');
      
      expect(cookingTimeInput).toHaveValue(45);
    });

    it('only accepts positive numbers', async () => {
      const user = userEvent.setup();
      renderWithRouter(<CreateRecipeView />);
      
      await waitFor(() => {
        expect(screen.getByLabelText(/Cooking Time/i)).toBeInTheDocument();
      });

      const cookingTimeInput = screen.getByLabelText(/Cooking Time/i);
      
      expect(cookingTimeInput).toHaveAttribute('type', 'number');
      expect(cookingTimeInput).toHaveAttribute('min', '1');
    });

    it('validates cooking time is required on submit', async () => {
      const user = userEvent.setup();
      renderWithRouter(<CreateRecipeView />);
      
      await waitFor(() => {
        expect(screen.getByLabelText(/Title/i)).toBeInTheDocument();
      });

      const titleInput = screen.getByLabelText(/Title/i);
      await user.type(titleInput, 'Test Recipe');

      const difficultySelect = screen.getByLabelText(/Difficulty/i);
      await user.selectOptions(difficultySelect, 'EASY');

      const saveButton = screen.getByRole('button', { name: /Save Recipe/i });
      await user.click(saveButton);
      
      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Please fix validation errors');
      });
    });
  });

  describe('Category Section', () => {
    it('toggles category selection on click', async () => {
      const user = userEvent.setup();
      renderWithRouter(<CreateRecipeView />);
      
      await waitFor(() => {
        expect(screen.getByText('Italian')).toBeInTheDocument();
      });

      const italianChip = screen.getByText('Italian').closest('button');
      await user.click(italianChip);
      
      expect(italianChip).toHaveClass('selected');
    });

    it('allows multiple category selections', async () => {
      const user = userEvent.setup();
      renderWithRouter(<CreateRecipeView />);
      
      await waitFor(() => {
        expect(screen.getByText('Italian')).toBeInTheDocument();
      });

      const italianChip = screen.getByText('Italian').closest('button');
      const dessertChip = screen.getByText('Dessert').closest('button');
      
      await user.click(italianChip);
      await user.click(dessertChip);
      
      expect(italianChip).toHaveClass('selected');
      expect(dessertChip).toHaveClass('selected');
    });

    it('deselects category when clicked again', async () => {
      const user = userEvent.setup();
      renderWithRouter(<CreateRecipeView />);
      
      await waitFor(() => {
        expect(screen.getByText('Italian')).toBeInTheDocument();
      });

      const italianChip = screen.getByText('Italian').closest('button');
      
      await user.click(italianChip);
      expect(italianChip).toHaveClass('selected');
      
      await user.click(italianChip);
      expect(italianChip).not.toHaveClass('selected');
    });

    it('validates at least one category is required on submit', async () => {
      const user = userEvent.setup();
      renderWithRouter(<CreateRecipeView />);
      
      await waitFor(() => {
        expect(screen.getByLabelText(/Title/i)).toBeInTheDocument();
      });

      const titleInput = screen.getByLabelText(/Title/i);
      await user.type(titleInput, 'Test Recipe');

      const difficultySelect = screen.getByLabelText(/Difficulty/i);
      await user.selectOptions(difficultySelect, 'EASY');

      const cookingTimeInput = screen.getByLabelText(/Cooking Time/i);
      await user.type(cookingTimeInput, '30');

      const saveButton = screen.getByRole('button', { name: /Save Recipe/i });
      await user.click(saveButton);
      
      await waitFor(() => {
        expect(screen.getByText(/At least one category is required/i)).toBeInTheDocument();
      });
    });
  });

  describe('Ingredients Section', () => {
    it('displays ingredient count indicator', async () => {
      renderWithRouter(<CreateRecipeView />);
      
      await waitFor(() => {
        expect(screen.getByText(/0 ingredients added/i)).toBeInTheDocument();
      });
    });

    it('adds a new ingredient row when Add Ingredient is clicked', async () => {
      const user = userEvent.setup();
      renderWithRouter(<CreateRecipeView />);
      
      await waitFor(() => {
        const ingredientRows = screen.getAllByPlaceholderText(/Quantity/i);
        expect(ingredientRows).toHaveLength(1);
      });

      const addButton = screen.getByRole('button', { name: /Add Ingredient/i });
      await user.click(addButton);
      
      await waitFor(() => {
        const ingredientRows = screen.getAllByPlaceholderText(/Quantity/i);
        expect(ingredientRows).toHaveLength(2);
      });
    });

    it('removes an ingredient row when delete button is clicked', async () => {
      const user = userEvent.setup();
      renderWithRouter(<CreateRecipeView />);
      
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Add Ingredient/i })).toBeInTheDocument();
      });

      const addButton = screen.getByRole('button', { name: /Add Ingredient/i });
      await user.click(addButton);
      
      await waitFor(() => {
        const deleteButtons = screen.getAllByRole('button', { name: /Remove ingredient/i });
        expect(deleteButtons).toHaveLength(2);
      });

      const deleteButtons = screen.getAllByRole('button', { name: /Remove ingredient/i });
      await user.click(deleteButtons[1]);
      
      await waitFor(() => {
        const ingredientRows = screen.getAllByPlaceholderText(/Quantity/i);
        expect(ingredientRows).toHaveLength(1);
      });
    });

    it('disables delete button when only one ingredient row exists', async () => {
      renderWithRouter(<CreateRecipeView />);
      
      await waitFor(() => {
        const deleteButton = screen.getByRole('button', { name: /Remove ingredient/i });
        expect(deleteButton).toBeDisabled();
      });
    });

    it('updates ingredient quantity when user types', async () => {
      const user = userEvent.setup();
      renderWithRouter(<CreateRecipeView />);
      
      await waitFor(() => {
        expect(screen.getByPlaceholderText(/Quantity/i)).toBeInTheDocument();
      });

      const quantityInput = screen.getByPlaceholderText(/Quantity/i);
      await user.type(quantityInput, '1/2');
      
      expect(quantityInput).toHaveValue('1/2');
    });

    it('updates ingredient unit when user types', async () => {
      const user = userEvent.setup();
      renderWithRouter(<CreateRecipeView />);
      
      await waitFor(() => {
        expect(screen.getByPlaceholderText(/Unit/i)).toBeInTheDocument();
      });

      const unitInput = screen.getByPlaceholderText(/Unit/i);
      await user.type(unitInput, 'tablespoon');
      
      expect(unitInput).toHaveValue('tablespoon');
    });

    it('updates ingredient name when user types', async () => {
      const user = userEvent.setup();
      renderWithRouter(<CreateRecipeView />);
      
      await waitFor(() => {
        expect(screen.getByPlaceholderText(/Ingredient name/i)).toBeInTheDocument();
      });

      const nameInput = screen.getByPlaceholderText(/Ingredient name/i);
      await user.type(nameInput, 'sugar');
      
      expect(nameInput).toHaveValue('sugar');
    });

    it('validates at least one ingredient is required on submit', async () => {
      const user = userEvent.setup();
      renderWithRouter(<CreateRecipeView />);
      
      await waitFor(() => {
        expect(screen.getByLabelText(/Title/i)).toBeInTheDocument();
      });

      const titleInput = screen.getByLabelText(/Title/i);
      await user.type(titleInput, 'Test Recipe');

      const difficultySelect = screen.getByLabelText(/Difficulty/i);
      await user.selectOptions(difficultySelect, 'EASY');

      const cookingTimeInput = screen.getByLabelText(/Cooking Time/i);
      await user.type(cookingTimeInput, '30');

      const saveButton = screen.getByRole('button', { name: /Save Recipe/i });
      await user.click(saveButton);
      
      await waitFor(() => {
        expect(screen.getByText(/At least one ingredient is required/i)).toBeInTheDocument();
      });
    });

    it('validates ingredient fields are all required when any field is filled', async () => {
      const user = userEvent.setup();
      renderWithRouter(<CreateRecipeView />);
      
      await waitFor(() => {
        expect(screen.getByPlaceholderText(/Quantity/i)).toBeInTheDocument();
      });

      const quantityInput = screen.getByPlaceholderText(/Quantity/i);
      await user.type(quantityInput, '1');

      const titleInput = screen.getByLabelText(/Title/i);
      await user.type(titleInput, 'Test Recipe');

      const difficultySelect = screen.getByLabelText(/Difficulty/i);
      await user.selectOptions(difficultySelect, 'EASY');

      const cookingTimeInput = screen.getByLabelText(/Cooking Time/i);
      await user.type(cookingTimeInput, '30');

      await waitFor(() => {
        expect(screen.getByText('Italian')).toBeInTheDocument();
      });
      const italianChip = screen.getByText('Italian').closest('button');
      await user.click(italianChip);

      const saveButton = screen.getByRole('button', { name: /Save Recipe/i });
      await user.click(saveButton);
      
      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Please fix validation errors');
      });
    });

    it('updates ingredient count indicator when ingredients are added', async () => {
      const user = userEvent.setup();
      renderWithRouter(<CreateRecipeView />);
      
      await waitFor(() => {
        expect(screen.getByText(/0 ingredient.*minimum 1 required/i)).toBeInTheDocument();
      });

      const quantityInput = screen.getByPlaceholderText(/Quantity/i);
      await user.type(quantityInput, '1');
      
      await waitFor(() => {
        expect(screen.getByText(/1 ingredient added.*minimum 1 required/i)).toBeInTheDocument();
      });
    });
  });

  describe('Steps Section', () => {
    it('displays step count indicator', async () => {
      renderWithRouter(<CreateRecipeView />);
      
      await waitFor(() => {
        expect(screen.getByText(/0 steps added/i)).toBeInTheDocument();
      });
    });

    it('adds a new step when Add Step is clicked', async () => {
      const user = userEvent.setup();
      renderWithRouter(<CreateRecipeView />);
      
      await waitFor(() => {
        const stepTextareas = screen.getAllByPlaceholderText(/Enter step instruction/i);
        expect(stepTextareas).toHaveLength(2);
      });

      const addButton = screen.getByRole('button', { name: /Add Step/i });
      await user.click(addButton);
      
      await waitFor(() => {
        const stepTextareas = screen.getAllByPlaceholderText(/Enter step instruction/i);
        expect(stepTextareas).toHaveLength(3);
      });
    });

    it('removes a step when delete button is clicked', async () => {
      const user = userEvent.setup();
      renderWithRouter(<CreateRecipeView />);
      
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Add Step/i })).toBeInTheDocument();
      });

      const addButton = screen.getByRole('button', { name: /Add Step/i });
      await user.click(addButton);
      
      await waitFor(() => {
        const stepTextareas = screen.getAllByPlaceholderText(/Enter step instruction/i);
        expect(stepTextareas).toHaveLength(3);
      });

      const deleteButtons = screen.getAllByRole('button', { name: /Remove step/i });
      await user.click(deleteButtons[2]);
      
      await waitFor(() => {
        const stepTextareas = screen.getAllByPlaceholderText(/Enter step instruction/i);
        expect(stepTextareas).toHaveLength(2);
      });
    });

    it('disables delete button when only two steps exist', async () => {
      renderWithRouter(<CreateRecipeView />);
      
      await waitFor(() => {
        const deleteButtons = screen.getAllByRole('button', { name: /Remove step/i });
        expect(deleteButtons).toHaveLength(2);
        deleteButtons.forEach(btn => expect(btn).toBeDisabled());
      });
    });

    it('updates step instruction when user types', async () => {
      const user = userEvent.setup();
      renderWithRouter(<CreateRecipeView />);
      
      await waitFor(() => {
        const stepTextareas = screen.getAllByPlaceholderText(/Enter step instruction/i);
        expect(stepTextareas).toHaveLength(2);
      });

      const firstStepTextarea = screen.getAllByPlaceholderText(/Enter step instruction/i)[0];
      await user.type(firstStepTextarea, 'Preheat the oven');
      
      expect(firstStepTextarea).toHaveValue('Preheat the oven');
    });

    it('displays character counter for steps', async () => {
      const user = userEvent.setup();
      renderWithRouter(<CreateRecipeView />);
      
      await waitFor(() => {
        expect(screen.getAllByText('0/500')).toHaveLength(2);
      });

      const firstStepTextarea = screen.getAllByPlaceholderText(/Enter step instruction/i)[0];
      await user.type(firstStepTextarea, 'Test step');
      
      expect(screen.getByText('9/500')).toBeInTheDocument();
    });

    it('moves step up when up arrow is clicked', async () => {
      const user = userEvent.setup();
      renderWithRouter(<CreateRecipeView />);
      
      await waitFor(() => {
        const stepTextareas = screen.getAllByPlaceholderText(/Enter step instruction/i);
        expect(stepTextareas).toHaveLength(2);
      });

      const stepTextareas = screen.getAllByPlaceholderText(/Enter step instruction/i);
      await user.type(stepTextareas[0], 'First step');
      await user.type(stepTextareas[1], 'Second step');

      const upButtons = screen.getAllByRole('button', { name: /Move step up/i });
      await user.click(upButtons[1]);
      
      await waitFor(() => {
        const updatedTextareas = screen.getAllByPlaceholderText(/Enter step instruction/i);
        expect(updatedTextareas[0]).toHaveValue('Second step');
        expect(updatedTextareas[1]).toHaveValue('First step');
      });
    });

    it('moves step down when down arrow is clicked', async () => {
      const user = userEvent.setup();
      renderWithRouter(<CreateRecipeView />);
      
      await waitFor(() => {
        const stepTextareas = screen.getAllByPlaceholderText(/Enter step instruction/i);
        expect(stepTextareas).toHaveLength(2);
      });

      const stepTextareas = screen.getAllByPlaceholderText(/Enter step instruction/i);
      await user.type(stepTextareas[0], 'First step');
      await user.type(stepTextareas[1], 'Second step');

      const downButtons = screen.getAllByRole('button', { name: /Move step down/i });
      await user.click(downButtons[0]);
      
      await waitFor(() => {
        const updatedTextareas = screen.getAllByPlaceholderText(/Enter step instruction/i);
        expect(updatedTextareas[0]).toHaveValue('Second step');
        expect(updatedTextareas[1]).toHaveValue('First step');
      });
    });

    it('disables up arrow for first step', async () => {
      renderWithRouter(<CreateRecipeView />);
      
      await waitFor(() => {
        const upButtons = screen.getAllByRole('button', { name: /Move step up/i });
        expect(upButtons[0]).toBeDisabled();
      });
    });

    it('disables down arrow for last step', async () => {
      renderWithRouter(<CreateRecipeView />);
      
      await waitFor(() => {
        const downButtons = screen.getAllByRole('button', { name: /Move step down/i });
        expect(downButtons[downButtons.length - 1]).toBeDisabled();
      });
    });

    it('validates at least two steps are required on submit', async () => {
      const user = userEvent.setup();
      renderWithRouter(<CreateRecipeView />);
      
      await waitFor(() => {
        expect(screen.getByLabelText(/Title/i)).toBeInTheDocument();
      });

      const titleInput = screen.getByLabelText(/Title/i);
      await user.type(titleInput, 'Test Recipe');

      const difficultySelect = screen.getByLabelText(/Difficulty/i);
      await user.selectOptions(difficultySelect, 'EASY');

      const cookingTimeInput = screen.getByLabelText(/Cooking Time/i);
      await user.type(cookingTimeInput, '30');

      const saveButton = screen.getByRole('button', { name: /Save Recipe/i });
      await user.click(saveButton);
      
      await waitFor(() => {
        expect(screen.getByText(/At least two steps are required/i)).toBeInTheDocument();
      });
    });

    it('updates step count indicator when steps are filled', async () => {
      const user = userEvent.setup();
      renderWithRouter(<CreateRecipeView />);
      
      await waitFor(() => {
        expect(screen.getByText(/0 steps added/i)).toBeInTheDocument();
      });

      const stepTextareas = screen.getAllByPlaceholderText(/Enter step instruction/i);
      await user.type(stepTextareas[0], 'First step');
      
      await waitFor(() => {
        const countText = screen.getByText((content, element) => {
          return element.className === 'count-indicator invalid' && content.includes('1 step');
        });
        expect(countText).toBeInTheDocument();
      });
    });
  });

  describe('Form Submission', () => {
    const fillValidForm = async (user) => {
      await waitFor(() => {
        expect(screen.getByLabelText(/Title/i)).toBeInTheDocument();
      });

      const titleInput = screen.getByLabelText(/Title/i);
      await user.type(titleInput, 'Chocolate Cake');

      const difficultySelect = screen.getByLabelText(/Difficulty/i);
      await user.selectOptions(difficultySelect, 'MEDIUM');

      const cookingTimeInput = screen.getByLabelText(/Cooking Time/i);
      await user.type(cookingTimeInput, '45');

      await waitFor(() => {
        expect(screen.getByText('Italian')).toBeInTheDocument();
      });
      const italianChip = screen.getByText('Italian').closest('button');
      await user.click(italianChip);

      const quantityInput = screen.getByPlaceholderText(/Quantity/i);
      await user.type(quantityInput, '2');
      const unitInput = screen.getByPlaceholderText(/Unit/i);
      await user.type(unitInput, 'cups');
      const nameInput = screen.getByPlaceholderText(/Ingredient name/i);
      await user.type(nameInput, 'flour');

      const stepTextareas = screen.getAllByPlaceholderText(/Enter step instruction/i);
      await user.type(stepTextareas[0], 'Mix ingredients');
      await user.type(stepTextareas[1], 'Bake in oven');
    };

    it('submits the form with valid data', async () => {
      const user = userEvent.setup();
      renderWithRouter(<CreateRecipeView />);
      
      await fillValidForm(user);

      const saveButton = screen.getByRole('button', { name: /Save Recipe/i });
      await user.click(saveButton);

      await waitFor(() => {
        expect(recipesApi.createRecipe).toHaveBeenCalledWith({
          title: 'Chocolate Cake',
          difficulty: 'MEDIUM',
          cookingTimeMinutes: 45,
          categoryIds: [1],
          ingredients: [
            { quantity: '2', unit: 'cups', name: 'flour' }
          ],
          steps: [
            { instruction: 'Mix ingredients' },
            { instruction: 'Bake in oven' }
          ]
        });
      });
    });

    it('shows success toast on successful submission', async () => {
      const user = userEvent.setup();
      renderWithRouter(<CreateRecipeView />);
      
      await fillValidForm(user);

      const saveButton = screen.getByRole('button', { name: /Save Recipe/i });
      await user.click(saveButton);

      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith('Recipe created successfully');
      });
    });

    it('navigates to recipe detail page on successful submission', async () => {
      const user = userEvent.setup();
      renderWithRouter(<CreateRecipeView />);
      
      await fillValidForm(user);

      const saveButton = screen.getByRole('button', { name: /Save Recipe/i });
      await user.click(saveButton);

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/recipes/42');
      });
    });

    it('disables save button while submitting', async () => {
      const user = userEvent.setup();
      recipesApi.createRecipe.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));
      
      renderWithRouter(<CreateRecipeView />);
      
      await fillValidForm(user);

      const saveButton = screen.getByRole('button', { name: /Save Recipe/i });
      await user.click(saveButton);

      expect(saveButton).toBeDisabled();
    });

    it('shows error toast on validation failure from server', async () => {
      const user = userEvent.setup();
      recipesApi.createRecipe.mockRejectedValueOnce({
        response: {
          status: 400,
          data: {
            data: {
              errors: {
                title: 'Title is too long'
              }
            }
          }
        }
      });
      
      renderWithRouter(<CreateRecipeView />);
      
      await fillValidForm(user);

      const saveButton = screen.getByRole('button', { name: /Save Recipe/i });
      await user.click(saveButton);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Validation failed. Please check the form.');
      });
    });

    it('shows error toast on 404 category not found', async () => {
      const user = userEvent.setup();
      recipesApi.createRecipe.mockRejectedValueOnce({
        response: { status: 404 }
      });
      
      renderWithRouter(<CreateRecipeView />);
      
      await fillValidForm(user);

      const saveButton = screen.getByRole('button', { name: /Save Recipe/i });
      await user.click(saveButton);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Invalid category selected');
      });
    });

    it('redirects to login on 401 unauthorized', async () => {
      const user = userEvent.setup();
      recipesApi.createRecipe.mockRejectedValueOnce({
        response: { status: 401 }
      });
      
      renderWithRouter(<CreateRecipeView />);
      
      await fillValidForm(user);

      const saveButton = screen.getByRole('button', { name: /Save Recipe/i });
      await user.click(saveButton);

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/login');
      });
    });

    it('shows generic error toast on other errors', async () => {
      const user = userEvent.setup();
      recipesApi.createRecipe.mockRejectedValueOnce({
        response: { status: 500 }
      });
      
      renderWithRouter(<CreateRecipeView />);
      
      await fillValidForm(user);

      const saveButton = screen.getByRole('button', { name: /Save Recipe/i });
      await user.click(saveButton);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Failed to create recipe. Please try again.');
      });
    });

    it('checks for userId in session before submitting', async () => {
      const user = userEvent.setup();
      sessionStorage.removeItem('userId');
      
      renderWithRouter(<CreateRecipeView />);
      
      await fillValidForm(user);

      const saveButton = screen.getByRole('button', { name: /Save Recipe/i });
      await user.click(saveButton);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Session expired. Please log in again.');
        expect(mockNavigate).toHaveBeenCalledWith('/login');
      });
    });

    it('focuses first invalid field on validation error', async () => {
      const user = userEvent.setup();
      renderWithRouter(<CreateRecipeView />);
      
      await waitFor(() => {
        expect(screen.getByLabelText(/Title/i)).toBeInTheDocument();
      });

      const saveButton = screen.getByRole('button', { name: /Save Recipe/i });
      await user.click(saveButton);

      await waitFor(() => {
        const titleInput = screen.getByLabelText(/Title/i);
        expect(titleInput).toHaveFocus();
      });
    });
  });

  describe('Cancel Button & Unsaved Changes', () => {
    it('navigates to recipes list when cancel is clicked with no changes', async () => {
      const user = userEvent.setup();
      renderWithRouter(<CreateRecipeView />);
      
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Cancel/i })).toBeInTheDocument();
      });

      const cancelButton = screen.getByRole('button', { name: /Cancel/i });
      await user.click(cancelButton);

      expect(mockNavigate).toHaveBeenCalledWith('/recipes');
    });

    it('shows unsaved changes dialog when cancel is clicked with changes', async () => {
      const user = userEvent.setup();
      renderWithRouter(<CreateRecipeView />);
      
      await waitFor(() => {
        expect(screen.getByLabelText(/Title/i)).toBeInTheDocument();
      });

      const titleInput = screen.getByLabelText(/Title/i);
      await user.type(titleInput, 'Test');

      const cancelButton = screen.getByRole('button', { name: /Cancel/i });
      await user.click(cancelButton);

      await waitFor(() => {
        expect(screen.getByText(/You have unsaved changes/i)).toBeInTheDocument();
      });
    });

    it('stays on page when cancel is clicked in unsaved changes dialog', async () => {
      const user = userEvent.setup();
      renderWithRouter(<CreateRecipeView />);
      
      await waitFor(() => {
        expect(screen.getByLabelText(/Title/i)).toBeInTheDocument();
      });

      const titleInput = screen.getByLabelText(/Title/i);
      await user.type(titleInput, 'Test');

      const cancelButton = screen.getByRole('button', { name: /Cancel/i });
      await user.click(cancelButton);

      await waitFor(() => {
        expect(screen.getByText(/You have unsaved changes/i)).toBeInTheDocument();
      });

      const stayButton = screen.getAllByRole('button', { name: /Cancel/i }).find(
        btn => btn.closest('.unsaved-changes-dialog')
      );
      if (stayButton) {
        await user.click(stayButton);

        await waitFor(() => {
          expect(screen.queryByText(/You have unsaved changes/i)).not.toBeInTheDocument();
        });
      }
      expect(mockNavigate).not.toHaveBeenCalled();
    });

    it('navigates away when confirm is clicked in unsaved changes dialog', async () => {
      const user = userEvent.setup();
      renderWithRouter(<CreateRecipeView />);
      
      await waitFor(() => {
        expect(screen.getByLabelText(/Title/i)).toBeInTheDocument();
      });

      const titleInput = screen.getByLabelText(/Title/i);
      await user.type(titleInput, 'Test');

      const cancelButton = screen.getByRole('button', { name: /Cancel/i });
      await user.click(cancelButton);

      await waitFor(() => {
        expect(screen.getByText(/You have unsaved changes/i)).toBeInTheDocument();
      });

      const confirmButton = screen.getByRole('button', { name: /Leave/i });
      await user.click(confirmButton);

      expect(mockNavigate).toHaveBeenCalledWith('/recipes');
    });

    it('sets up beforeunload event listener for browser navigation', async () => {
      const user = userEvent.setup();
      renderWithRouter(<CreateRecipeView />);
      
      await waitFor(() => {
        expect(screen.getByLabelText(/Title/i)).toBeInTheDocument();
      });

      const titleInput = screen.getByLabelText(/Title/i);
      await user.type(titleInput, 'Test');

      const mockPreventDefault = vi.fn();
      const beforeUnloadEvent = new Event('beforeunload', { cancelable: true });
      Object.defineProperty(beforeUnloadEvent, 'preventDefault', {
        writable: true,
        value: mockPreventDefault
      });
      Object.defineProperty(beforeUnloadEvent, 'returnValue', {
        writable: true,
        value: ''
      });

      window.dispatchEvent(beforeUnloadEvent);

      expect(mockPreventDefault).toHaveBeenCalled();
      expect(beforeUnloadEvent.returnValue).toBe('');
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA labels for form fields', async () => {
      renderWithRouter(<CreateRecipeView />);
      
      await waitFor(() => {
        expect(screen.getByLabelText(/Title/i)).toBeInTheDocument();
      });

      expect(screen.getByLabelText(/Title/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Difficulty/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Cooking Time/i)).toBeInTheDocument();
    });

    it('marks required fields with asterisk', async () => {
      renderWithRouter(<CreateRecipeView />);
      
      await waitFor(() => {
        const requiredIndicators = screen.getAllByText('*');
        expect(requiredIndicators.length).toBeGreaterThan(0);
      });
    });

    it('associates error messages with form fields', async () => {
      const user = userEvent.setup();
      renderWithRouter(<CreateRecipeView />);
      
      await waitFor(() => {
        expect(screen.getByLabelText(/Title/i)).toBeInTheDocument();
      });

      const titleInput = screen.getByLabelText(/Title/i);
      await user.click(titleInput);
      await user.tab();

      const saveButton = screen.getByRole('button', { name: /Save Recipe/i });
      await user.click(saveButton);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Please fix validation errors');
        expect(titleInput).toHaveClass('input-error');
      });
    });

    it('supports keyboard navigation for category chips', async () => {
      const user = userEvent.setup();
      renderWithRouter(<CreateRecipeView />);
      
      await waitFor(() => {
        expect(screen.getByText('Italian')).toBeInTheDocument();
      });

      const italianChip = screen.getByText('Italian').closest('button');
      italianChip.focus();
      
      expect(italianChip).toHaveFocus();
      
      await user.keyboard('{Enter}');
      
      expect(italianChip).toHaveClass('selected');
    });
  });

  describe('Edge Cases', () => {
    it('handles empty ingredients gracefully on submit', async () => {
      const user = userEvent.setup();
      renderWithRouter(<CreateRecipeView />);
      
      await waitFor(() => {
        expect(screen.getByLabelText(/Title/i)).toBeInTheDocument();
      });

      const titleInput = screen.getByLabelText(/Title/i);
      await user.type(titleInput, 'Test Recipe');

      const difficultySelect = screen.getByLabelText(/Difficulty/i);
      await user.selectOptions(difficultySelect, 'EASY');

      const cookingTimeInput = screen.getByLabelText(/Cooking Time/i);
      await user.type(cookingTimeInput, '30');

      await waitFor(() => {
        expect(screen.getByText('Italian')).toBeInTheDocument();
      });
      const italianChip = screen.getByText('Italian').closest('button');
      await user.click(italianChip);

      const stepTextareas = screen.getAllByPlaceholderText(/Enter step instruction/i);
      await user.type(stepTextareas[0], 'Step 1');
      await user.type(stepTextareas[1], 'Step 2');

      const saveButton = screen.getByRole('button', { name: /Save Recipe/i });
      await user.click(saveButton);

      await waitFor(() => {
        expect(screen.getByText(/At least one ingredient is required/i)).toBeInTheDocument();
      });
    });

    it('handles partial ingredient data correctly', async () => {
      const user = userEvent.setup();
      renderWithRouter(<CreateRecipeView />);
      
      await waitFor(() => {
        expect(screen.getByPlaceholderText(/Quantity/i)).toBeInTheDocument();
      });

      const quantityInput = screen.getByPlaceholderText(/Quantity/i);
      await user.type(quantityInput, '1');

      const addButton = screen.getByRole('button', { name: /Add Ingredient/i });
      await user.click(addButton);

      const ingredientRows = screen.getAllByPlaceholderText(/Quantity/i);
      await user.type(ingredientRows[1], '2');
      const unitInputs = screen.getAllByPlaceholderText(/Unit/i);
      await user.type(unitInputs[1], 'cups');
      const nameInputs = screen.getAllByPlaceholderText(/Ingredient name/i);
      await user.type(nameInputs[1], 'sugar');

      await waitFor(() => {
        expect(screen.getByText(/2 ingredients added.*minimum 1 required/i)).toBeInTheDocument();
      });
    });

    it('trims whitespace from form fields on submit', async () => {
      const user = userEvent.setup();
      renderWithRouter(<CreateRecipeView />);
      
      await waitFor(() => {
        expect(screen.getByLabelText(/Title/i)).toBeInTheDocument();
      });

      const titleInput = screen.getByLabelText(/Title/i);
      await user.type(titleInput, '  Chocolate Cake  ');

      const difficultySelect = screen.getByLabelText(/Difficulty/i);
      await user.selectOptions(difficultySelect, 'MEDIUM');

      const cookingTimeInput = screen.getByLabelText(/Cooking Time/i);
      await user.type(cookingTimeInput, '45');

      await waitFor(() => {
        expect(screen.getByText('Italian')).toBeInTheDocument();
      });
      const italianChip = screen.getByText('Italian').closest('button');
      await user.click(italianChip);

      const quantityInput = screen.getByPlaceholderText(/Quantity/i);
      await user.type(quantityInput, '  2  ');
      const unitInput = screen.getByPlaceholderText(/Unit/i);
      await user.type(unitInput, '  cups  ');
      const nameInput = screen.getByPlaceholderText(/Ingredient name/i);
      await user.type(nameInput, '  flour  ');

      const stepTextareas = screen.getAllByPlaceholderText(/Enter step instruction/i);
      await user.type(stepTextareas[0], '  Mix ingredients  ');
      await user.type(stepTextareas[1], '  Bake in oven  ');

      const saveButton = screen.getByRole('button', { name: /Save Recipe/i });
      await user.click(saveButton);

      await waitFor(() => {
        expect(recipesApi.createRecipe).toHaveBeenCalledWith({
          title: 'Chocolate Cake',
          difficulty: 'MEDIUM',
          cookingTimeMinutes: 45,
          categoryIds: [1],
          ingredients: [
            { quantity: '2', unit: 'cups', name: 'flour' }
          ],
          steps: [
            { instruction: 'Mix ingredients' },
            { instruction: 'Bake in oven' }
          ]
        });
      });
    });

    it('handles maximum field lengths correctly', async () => {
      renderWithRouter(<CreateRecipeView />);
      
      await waitFor(() => {
        expect(screen.getByLabelText(/Title/i)).toBeInTheDocument();
      });

      const quantityInput = screen.getByPlaceholderText(/Quantity/i);
      expect(quantityInput).toHaveAttribute('maxlength', '20');

      const unitInput = screen.getByPlaceholderText(/Unit/i);
      expect(unitInput).toHaveAttribute('maxlength', '20');

      const nameInput = screen.getByPlaceholderText(/Ingredient name/i);
      expect(nameInput).toHaveAttribute('maxlength', '50');

      const stepTextarea = screen.getAllByPlaceholderText(/Enter step instruction/i)[0];
      expect(stepTextarea).toHaveAttribute('maxlength', '500');
    });
  });
});

