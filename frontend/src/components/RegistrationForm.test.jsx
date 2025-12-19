import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import RegistrationForm from './RegistrationForm';
import { useRegistration } from '../hooks/useRegistration';

vi.mock('../hooks/useRegistration');

function renderWithRouter(component) {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
}

describe('RegistrationForm', () => {
  let mockRegister;
  let mockSetError;

  beforeEach(() => {
    mockRegister = vi.fn();
    useRegistration.mockReturnValue({
      register: mockRegister,
      isLoading: false,
      error: null
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering & Initial State', () => {
    it('renders username input field', () => {
      renderWithRouter(<RegistrationForm />);
      
      expect(screen.getByLabelText(/Username/i)).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/Enter username \(3-50 characters\)/i)).toBeInTheDocument();
    });

    it('renders password input field', () => {
      renderWithRouter(<RegistrationForm />);
      
      const passwordInput = screen.getByPlaceholderText(/Enter password \(minimum 6 characters\)/i);
      expect(passwordInput).toBeInTheDocument();
      expect(passwordInput).toHaveAttribute('type', 'password');
    });

    it('renders submit button with correct initial text', () => {
      renderWithRouter(<RegistrationForm />);
      
      const submitButton = screen.getByRole('button', { name: /Create Account/i });
      expect(submitButton).toBeInTheDocument();
      expect(submitButton).toHaveAttribute('type', 'submit');
    });

    it('renders login link with correct text', () => {
      renderWithRouter(<RegistrationForm />);
      
      expect(screen.getByText(/Already have an account\?/i)).toBeInTheDocument();
      
      const loginLink = screen.getByRole('link', { name: /Log in/i });
      expect(loginLink).toBeInTheDocument();
      expect(loginLink).toHaveAttribute('href', '/login');
    });

    it('has noValidate attribute on form to prevent browser validation', () => {
      const { container } = renderWithRouter(<RegistrationForm />);
      
      const form = container.querySelector('form');
      expect(form).toHaveAttribute('noValidate');
    });
  });

  describe('Username Input - Character Counter', () => {
    it('displays character counter with initial count of 0/50', () => {
      renderWithRouter(<RegistrationForm />);
      
      expect(screen.getByText('0/50')).toBeInTheDocument();
    });

    it('updates character counter in real-time as user types', async () => {
      const user = userEvent.setup();
      renderWithRouter(<RegistrationForm />);
      
      const usernameInput = screen.getByLabelText(/Username/i);
      await user.type(usernameInput, 'john');
      
      expect(screen.getByText('4/50')).toBeInTheDocument();
    });

    it('updates character counter when user deletes characters', async () => {
      const user = userEvent.setup();
      renderWithRouter(<RegistrationForm />);
      
      const usernameInput = screen.getByLabelText(/Username/i);
      await user.type(usernameInput, 'johndoe');
      expect(screen.getByText('7/50')).toBeInTheDocument();
      
      await user.type(usernameInput, '{Backspace}{Backspace}{Backspace}');
      expect(screen.getByText('4/50')).toBeInTheDocument();
    });

    it('applies at-limit styling when maxLength is reached', async () => {
      const user = userEvent.setup();
      const { container } = renderWithRouter(<RegistrationForm />);
      
      const usernameInput = screen.getByLabelText(/Username/i);
      const longUsername = 'a'.repeat(50);
      await user.type(usernameInput, longUsername);
      
      const counterElement = container.querySelector('.character-counter span');
      expect(counterElement).toHaveClass('at-limit');
      expect(screen.getByText('50/50')).toBeInTheDocument();
    });

    it('does not allow typing beyond maxLength', async () => {
      const user = userEvent.setup();
      renderWithRouter(<RegistrationForm />);
      
      const usernameInput = screen.getByLabelText(/Username/i);
      const tooLongUsername = 'a'.repeat(55);
      await user.type(usernameInput, tooLongUsername);
      
      expect(usernameInput.value.length).toBe(50);
      expect(screen.getByText('50/50')).toBeInTheDocument();
    });
  });

  describe('Username Input - Validation', () => {
    it('shows required error when username is empty and field is blurred', async () => {
      const user = userEvent.setup();
      renderWithRouter(<RegistrationForm />);
      
      const usernameInput = screen.getByLabelText(/Username/i);
      await user.click(usernameInput);
      await user.tab();
      
      await waitFor(() => {
        expect(screen.getByText(/Username is required/i)).toBeInTheDocument();
      });
    });

    it('shows minimum length error for username less than 3 characters', async () => {
      const user = userEvent.setup();
      renderWithRouter(<RegistrationForm />);
      
      const usernameInput = screen.getByLabelText(/Username/i);
      await user.type(usernameInput, 'ab');
      await user.tab();
      
      await waitFor(() => {
        expect(screen.getByText(/Username must be between 3 and 50 characters/i)).toBeInTheDocument();
      });
    });

    it('shows maximum length error for username more than 50 characters', async () => {
      const user = userEvent.setup();
      renderWithRouter(<RegistrationForm />);
      
      const usernameInput = screen.getByLabelText(/Username/i);
      const longUsername = 'a'.repeat(51);
      await user.type(usernameInput, longUsername);
      
      expect(usernameInput.value).toHaveLength(50);
      expect(screen.getByText('50/50')).toBeInTheDocument();
    });

    it('shows pattern error for username with invalid characters', async () => {
      const user = userEvent.setup();
      renderWithRouter(<RegistrationForm />);
      
      const usernameInput = screen.getByLabelText(/Username/i);
      await user.type(usernameInput, 'john@doe');
      await user.tab();
      
      await waitFor(() => {
        expect(screen.getByText(/Username can only contain letters, numbers, and underscores/i)).toBeInTheDocument();
      });
    });

    it('accepts valid username with letters, numbers, and underscores', async () => {
      const user = userEvent.setup();
      renderWithRouter(<RegistrationForm />);
      
      const usernameInput = screen.getByLabelText(/Username/i);
      await user.type(usernameInput, 'john_doe_123');
      await user.tab();
      
      await waitFor(() => {
        expect(screen.queryByText(/Username/i, { selector: '.error-message' })).not.toBeInTheDocument();
      });
    });

    it('clears error when username becomes valid', async () => {
      const user = userEvent.setup();
      renderWithRouter(<RegistrationForm />);
      
      const usernameInput = screen.getByLabelText(/Username/i);
      await user.type(usernameInput, 'ab');
      await user.tab();
      
      await waitFor(() => {
        expect(screen.getByText(/Username must be between 3 and 50 characters/i)).toBeInTheDocument();
      });
      
      await user.clear(usernameInput);
      await user.type(usernameInput, 'johndoe');
      
      expect(usernameInput.value).toBe('johndoe');
      expect(screen.getByText('7/50')).toBeInTheDocument();
    });

    it('sets aria-invalid attribute when username has error', async () => {
      const user = userEvent.setup();
      renderWithRouter(<RegistrationForm />);
      
      const usernameInput = screen.getByLabelText(/Username/i);
      expect(usernameInput).toHaveAttribute('aria-invalid', 'false');
      
      await user.click(usernameInput);
      await user.tab();
      
      await waitFor(() => {
        expect(usernameInput).toHaveAttribute('aria-invalid', 'true');
      });
    });

    it('sets aria-describedby to error message id when username has error', async () => {
      const user = userEvent.setup();
      renderWithRouter(<RegistrationForm />);
      
      const usernameInput = screen.getByLabelText(/Username/i);
      await user.click(usernameInput);
      await user.tab();
      
      await waitFor(() => {
        expect(usernameInput).toHaveAttribute('aria-describedby', 'username-error');
      });
    });

    it('error message has role="alert" for screen readers', async () => {
      const user = userEvent.setup();
      renderWithRouter(<RegistrationForm />);
      
      const usernameInput = screen.getByLabelText(/Username/i);
      await user.click(usernameInput);
      await user.tab();
      
      await waitFor(() => {
        const errorMessage = screen.getByText(/Username is required/i);
        expect(errorMessage).toHaveAttribute('role', 'alert');
      });
    });
  });

  describe('Password Input - Functionality', () => {
    it('password is masked by default', () => {
      renderWithRouter(<RegistrationForm />);
      
      const passwordInput = screen.getByPlaceholderText(/Enter password \(minimum 6 characters\)/i);
      expect(passwordInput).toHaveAttribute('type', 'password');
    });

    it('toggles password visibility when toggle button is clicked', async () => {
      const user = userEvent.setup();
      renderWithRouter(<RegistrationForm />);
      
      const passwordInput = screen.getByPlaceholderText(/Enter password \(minimum 6 characters\)/i);
      const toggleButton = screen.getByRole('button', { name: /Show password/i });
      
      expect(passwordInput).toHaveAttribute('type', 'password');
      
      await user.click(toggleButton);
      expect(passwordInput).toHaveAttribute('type', 'text');
      
      await user.click(toggleButton);
      expect(passwordInput).toHaveAttribute('type', 'password');
    });

    it('toggle button has correct ARIA label when password is hidden', () => {
      renderWithRouter(<RegistrationForm />);
      
      const toggleButton = screen.getByRole('button', { name: /Show password/i });
      expect(toggleButton).toBeInTheDocument();
    });

    it('toggle button has correct ARIA label when password is visible', async () => {
      const user = userEvent.setup();
      renderWithRouter(<RegistrationForm />);
      
      const toggleButton = screen.getByRole('button', { name: /Show password/i });
      await user.click(toggleButton);
      
      expect(screen.getByRole('button', { name: /Hide password/i })).toBeInTheDocument();
    });

    it('password toggle button does not submit form', async () => {
      const user = userEvent.setup();
      renderWithRouter(<RegistrationForm />);
      
      const toggleButton = screen.getByRole('button', { name: /Show password/i });
      await user.click(toggleButton);
      
      expect(mockRegister).not.toHaveBeenCalled();
    });
  });

  describe('Password Input - Validation', () => {
    it('shows required error when password is empty and field is blurred', async () => {
      const user = userEvent.setup();
      renderWithRouter(<RegistrationForm />);
      
      const passwordInput = screen.getByPlaceholderText(/Enter password \(minimum 6 characters\)/i);
      await user.click(passwordInput);
      await user.tab();
      
      await waitFor(() => {
        expect(screen.getByText(/Password is required/i)).toBeInTheDocument();
      });
    });

    it('shows minimum length error for password less than 6 characters', async () => {
      const user = userEvent.setup();
      renderWithRouter(<RegistrationForm />);
      
      const passwordInput = screen.getByPlaceholderText(/Enter password \(minimum 6 characters\)/i);
      await user.type(passwordInput, '12345');
      await user.tab();
      
      await waitFor(() => {
        expect(screen.getByText(/Password must be at least 6 characters/i)).toBeInTheDocument();
      });
    });

    it('accepts valid password with 6 or more characters', async () => {
      const user = userEvent.setup();
      renderWithRouter(<RegistrationForm />);
      
      const passwordInput = screen.getByPlaceholderText(/Enter password \(minimum 6 characters\)/i);
      await user.type(passwordInput, '123456');
      await user.tab();
      
      await waitFor(() => {
        expect(screen.queryByText(/Password must be at least 6 characters/i)).not.toBeInTheDocument();
      });
    });

    it('clears error when password becomes valid', async () => {
      const user = userEvent.setup();
      renderWithRouter(<RegistrationForm />);
      
      const passwordInput = screen.getByPlaceholderText(/Enter password \(minimum 6 characters\)/i);
      await user.type(passwordInput, '12345');
      await user.tab();
      
      await waitFor(() => {
        expect(screen.getByText(/Password must be at least 6 characters/i)).toBeInTheDocument();
      });
      
      await user.clear(passwordInput);
      await user.type(passwordInput, '123456');
      
      expect(passwordInput.value).toBe('123456');
    });
  });

  describe('Form Submission - Loading State', () => {
    it('disables submit button during loading', () => {
      useRegistration.mockReturnValue({
        register: mockRegister,
        isLoading: true,
        error: null
      });
      
      renderWithRouter(<RegistrationForm />);
      
      const submitButton = screen.getByRole('button', { name: /Loading.../i });
      expect(submitButton).toBeDisabled();
    });

    it('changes button text to "Loading..." when isLoading is true', () => {
      useRegistration.mockReturnValue({
        register: mockRegister,
        isLoading: true,
        error: null
      });
      
      renderWithRouter(<RegistrationForm />);
      
      expect(screen.getByText(/Loading.../i)).toBeInTheDocument();
      expect(screen.queryByText(/Creating.../i)).not.toBeInTheDocument();
    });

    it('shows loading spinner when isLoading is true', () => {
      useRegistration.mockReturnValue({
        register: mockRegister,
        isLoading: true,
        error: null
      });
      
      const { container } = renderWithRouter(<RegistrationForm />);
      
      expect(container.querySelector('.spinner')).toBeInTheDocument();
    });
  });

  describe('Form Submission - Client-side Validation', () => {
    it('prevents submission when form is invalid', async () => {
      const user = userEvent.setup();
      renderWithRouter(<RegistrationForm />);
      
      const submitButton = screen.getByRole('button', { name: /Create Account/i });
      await user.click(submitButton);
      
      expect(mockRegister).not.toHaveBeenCalled();
    });

    it('shows all validation errors when submitting empty form', async () => {
      const user = userEvent.setup();
      renderWithRouter(<RegistrationForm />);
      
      const submitButton = screen.getByRole('button', { name: /Create Account/i });
      await user.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText(/Username is required/i)).toBeInTheDocument();
        expect(screen.getByText(/Password is required/i)).toBeInTheDocument();
      });
    });

    it('does not call register hook when validation fails', async () => {
      const user = userEvent.setup();
      renderWithRouter(<RegistrationForm />);
      
      const usernameInput = screen.getByLabelText(/Username/i);
      await user.type(usernameInput, 'ab');
      
      const submitButton = screen.getByRole('button', { name: /Create Account/i });
      await user.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText(/Username must be between 3 and 50 characters/i)).toBeInTheDocument();
      });
      
      expect(mockRegister).not.toHaveBeenCalled();
    });
  });

  describe('Form Submission - Successful Registration', () => {
    it('calls register hook with form data on valid submission', async () => {
      const user = userEvent.setup();
      mockRegister.mockResolvedValue(undefined);
      
      renderWithRouter(<RegistrationForm />);
      
      const usernameInput = screen.getByLabelText(/Username/i);
      const passwordInput = screen.getByPlaceholderText(/Enter password \(minimum 6 characters\)/i);
      
      await user.type(usernameInput, 'johndoe');
      await user.type(passwordInput, 'password123');
      
      const submitButton = screen.getByRole('button', { name: /Create Account/i });
      await user.click(submitButton);
      
      await waitFor(() => {
        expect(mockRegister).toHaveBeenCalledWith({
          username: 'johndoe',
          password: 'password123'
        });
      });
    });

    it('submits form when pressing Enter in username field', async () => {
      const user = userEvent.setup();
      mockRegister.mockResolvedValue(undefined);
      
      renderWithRouter(<RegistrationForm />);
      
      const usernameInput = screen.getByLabelText(/Username/i);
      const passwordInput = screen.getByPlaceholderText(/Enter password \(minimum 6 characters\)/i);
      
      await user.type(usernameInput, 'johndoe');
      await user.type(passwordInput, 'password123');
      await user.type(usernameInput, '{Enter}');
      
      await waitFor(() => {
        expect(mockRegister).toHaveBeenCalledWith({
          username: 'johndoe',
          password: 'password123'
        });
      });
    });

    it('submits form when pressing Enter in password field', async () => {
      const user = userEvent.setup();
      mockRegister.mockResolvedValue(undefined);
      
      renderWithRouter(<RegistrationForm />);
      
      const usernameInput = screen.getByLabelText(/Username/i);
      const passwordInput = screen.getByPlaceholderText(/Enter password \(minimum 6 characters\)/i);
      
      await user.type(usernameInput, 'johndoe');
      await user.type(passwordInput, 'password123{Enter}');
      
      await waitFor(() => {
        expect(mockRegister).toHaveBeenCalledWith({
          username: 'johndoe',
          password: 'password123'
        });
      });
    });
  });

  describe('Form Submission - Error Handling', () => {
    it('handles server validation errors (HTTP 400)', async () => {
      const user = userEvent.setup();
      
      renderWithRouter(<RegistrationForm />);
      
      const usernameInput = screen.getByLabelText(/Username/i);
      const passwordInput = screen.getByPlaceholderText(/Enter password \(minimum 6 characters\)/i);
      
      await user.type(usernameInput, 'johndoe');
      await user.type(passwordInput, 'password123');
      
      const submitButton = screen.getByRole('button', { name: /Create Account/i });
      await user.click(submitButton);
      
      await waitFor(() => {
        expect(mockRegister).toHaveBeenCalled();
      });
    });

    it('handles username conflict error (HTTP 409)', async () => {
      const user = userEvent.setup();
      
      renderWithRouter(<RegistrationForm />);
      
      const usernameInput = screen.getByLabelText(/Username/i);
      const passwordInput = screen.getByPlaceholderText(/Enter password \(minimum 6 characters\)/i);
      
      await user.type(usernameInput, 'existinguser');
      await user.type(passwordInput, 'password123');
      
      const submitButton = screen.getByRole('button', { name: /Create Account/i });
      await user.click(submitButton);
      
      await waitFor(() => {
        expect(mockRegister).toHaveBeenCalled();
      });
    });

    it('button returns to normal state after failed submission', async () => {
      const user = userEvent.setup();
      mockRegister.mockImplementation(async () => {
        await Promise.resolve();
      });
      
      renderWithRouter(<RegistrationForm />);
      
      const usernameInput = screen.getByLabelText(/Username/i);
      const passwordInput = screen.getByPlaceholderText(/Enter password \(minimum 6 characters\)/i);
      
      await user.type(usernameInput, 'johndoe');
      await user.type(passwordInput, 'password123');
      
      const submitButton = screen.getByRole('button', { name: /Create Account/i });
      await user.click(submitButton);
      
      await waitFor(() => {
        expect(mockRegister).toHaveBeenCalled();
      });
    });
  });

  describe('Navigation', () => {
    it('login link navigates to /login route', () => {
      renderWithRouter(<RegistrationForm />);
      
      const loginLink = screen.getByRole('link', { name: /Log in/i });
      expect(loginLink).toHaveAttribute('href', '/login');
    });

    it('renders login link with proper context text', () => {
      renderWithRouter(<RegistrationForm />);
      
      expect(screen.getByText(/Already have an account\?/i)).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('handles rapid typing in username field without errors', async () => {
      const user = userEvent.setup();
      renderWithRouter(<RegistrationForm />);
      
      const usernameInput = screen.getByLabelText(/Username/i);
      await user.type(usernameInput, 'johndoe123', { delay: 1 });
      
      expect(usernameInput.value).toBe('johndoe123');
      expect(screen.getByText('10/50')).toBeInTheDocument();
    });

    it('handles multiple password visibility toggles', async () => {
      const user = userEvent.setup();
      renderWithRouter(<RegistrationForm />);
      
      const passwordInput = screen.getByPlaceholderText(/Enter password \(minimum 6 characters\)/i);
      const toggleButton = screen.getByRole('button', { name: /Show password/i });
      
      await user.click(toggleButton);
      expect(passwordInput).toHaveAttribute('type', 'text');
      
      await user.click(toggleButton);
      expect(passwordInput).toHaveAttribute('type', 'password');
      
      await user.click(toggleButton);
      expect(passwordInput).toHaveAttribute('type', 'text');
    });

    it('prevents double submission when button is clicked twice', async () => {
      const user = userEvent.setup();
      mockRegister.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 1000)));
      
      renderWithRouter(<RegistrationForm />);
      
      const usernameInput = screen.getByLabelText(/Username/i);
      const passwordInput = screen.getByPlaceholderText(/Enter password \(minimum 6 characters\)/i);
      
      await user.type(usernameInput, 'johndoe');
      await user.type(passwordInput, 'password123');
      
      const submitButton = screen.getByRole('button', { name: /Create Account/i });
      await user.click(submitButton);
      
      await waitFor(() => {
        expect(submitButton).toBeDisabled();
      });
      
      await user.click(submitButton);
      
      expect(mockRegister).toHaveBeenCalledTimes(1);
    });

    it('handles username with exactly 3 characters (boundary test)', async () => {
      const user = userEvent.setup();
      renderWithRouter(<RegistrationForm />);
      
      const usernameInput = screen.getByLabelText(/Username/i);
      await user.type(usernameInput, 'abc');
      await user.tab();
      
      await waitFor(() => {
        expect(screen.queryByText(/Username must be between 3 and 50 characters/i)).not.toBeInTheDocument();
      });
    });

    it('handles username with exactly 50 characters (boundary test)', async () => {
      const user = userEvent.setup();
      renderWithRouter(<RegistrationForm />);
      
      const usernameInput = screen.getByLabelText(/Username/i);
      const fiftyChars = 'a'.repeat(50);
      await user.type(usernameInput, fiftyChars);
      await user.tab();
      
      await waitFor(() => {
        expect(screen.queryByText(/Username must be between 3 and 50 characters/i)).not.toBeInTheDocument();
      });
    });

    it('handles password with exactly 6 characters (boundary test)', async () => {
      const user = userEvent.setup();
      renderWithRouter(<RegistrationForm />);
      
      const passwordInput = screen.getByPlaceholderText(/Enter password \(minimum 6 characters\)/i);
      await user.type(passwordInput, '123456');
      await user.tab();
      
      await waitFor(() => {
        expect(screen.queryByText(/Password must be at least 6 characters/i)).not.toBeInTheDocument();
      });
    });

    it('clears character counter when username is cleared', async () => {
      const user = userEvent.setup();
      renderWithRouter(<RegistrationForm />);
      
      const usernameInput = screen.getByLabelText(/Username/i);
      await user.type(usernameInput, 'johndoe');
      expect(screen.getByText('7/50')).toBeInTheDocument();
      
      await user.clear(usernameInput);
      expect(screen.getByText('0/50')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('all inputs have proper labels', () => {
      renderWithRouter(<RegistrationForm />);
      
      expect(screen.getByLabelText(/Username/i)).toBeInTheDocument();
      const passwordInput = screen.getByPlaceholderText(/Enter password \(minimum 6 characters\)/i);
      expect(passwordInput).toHaveAttribute('id', 'password');
    });

    it('error messages have role="alert" for screen reader announcements', async () => {
      const user = userEvent.setup();
      renderWithRouter(<RegistrationForm />);
      
      const usernameInput = screen.getByLabelText(/Username/i);
      await user.click(usernameInput);
      await user.tab();
      
      await waitFor(() => {
        const errorMessage = screen.getByText(/Username is required/i);
        expect(errorMessage).toHaveAttribute('role', 'alert');
      });
    });

    it('invalid inputs have aria-invalid attribute', async () => {
      const user = userEvent.setup();
      renderWithRouter(<RegistrationForm />);
      
      const usernameInput = screen.getByLabelText(/Username/i);
      await user.click(usernameInput);
      await user.tab();
      
      await waitFor(() => {
        expect(usernameInput).toHaveAttribute('aria-invalid', 'true');
      });
    });

    it('error messages are associated with inputs via aria-describedby', async () => {
      const user = userEvent.setup();
      renderWithRouter(<RegistrationForm />);
      
      const passwordInput = screen.getByPlaceholderText(/Enter password \(minimum 6 characters\)/i);
      await user.click(passwordInput);
      await user.tab();
      
      await waitFor(() => {
        expect(passwordInput).toHaveAttribute('aria-describedby', 'password-error');
        expect(screen.getByText(/Password is required/i)).toHaveAttribute('id', 'password-error');
      });
    });

    it('password toggle button has descriptive ARIA label', () => {
      renderWithRouter(<RegistrationForm />);
      
      const toggleButton = screen.getByRole('button', { name: /Show password/i });
      expect(toggleButton).toHaveAttribute('aria-label', 'Show password');
    });

    it('submit button is keyboard accessible', async () => {
      const user = userEvent.setup();
      mockRegister.mockResolvedValue(undefined);
      
      renderWithRouter(<RegistrationForm />);
      
      const usernameInput = screen.getByLabelText(/Username/i);
      const passwordInput = screen.getByPlaceholderText(/Enter password \(minimum 6 characters\)/i);
      
      await user.type(usernameInput, 'johndoe');
      await user.type(passwordInput, 'password123');
      
      const submitButton = screen.getByRole('button', { name: /Create Account/i });
      submitButton.focus();
      await user.keyboard('{Enter}');
      
      await waitFor(() => {
        expect(mockRegister).toHaveBeenCalled();
      });
    });
  });

  describe('Form State Management', () => {
    it('validates on blur (onBlur mode)', async () => {
      const user = userEvent.setup();
      renderWithRouter(<RegistrationForm />);
      
      const usernameInput = screen.getByLabelText(/Username/i);
      await user.type(usernameInput, 'ab');
      
      expect(screen.queryByText(/Username must be between 3 and 50 characters/i)).not.toBeInTheDocument();
      
      await user.tab();
      
      await waitFor(() => {
        expect(screen.getByText(/Username must be between 3 and 50 characters/i)).toBeInTheDocument();
      });
    });

    it('revalidates on change after first blur (revalidateMode: onChange)', async () => {
      const user = userEvent.setup();
      renderWithRouter(<RegistrationForm />);
      
      const usernameInput = screen.getByLabelText(/Username/i);
      await user.type(usernameInput, 'ab');
      await user.tab();
      
      await waitFor(() => {
        expect(screen.getByText(/Username must be between 3 and 50 characters/i)).toBeInTheDocument();
      });
      
      await user.type(usernameInput, 'd');
      
      expect(usernameInput.value).toBe('abd');
      expect(screen.getByText('3/50')).toBeInTheDocument();
    });

    it('maintains form state while typing', async () => {
      const user = userEvent.setup();
      renderWithRouter(<RegistrationForm />);
      
      const usernameInput = screen.getByLabelText(/Username/i);
      const passwordInput = screen.getByPlaceholderText(/Enter password \(minimum 6 characters\)/i);
      
      await user.type(usernameInput, 'johndoe');
      await user.type(passwordInput, 'password123');
      
      expect(usernameInput.value).toBe('johndoe');
      expect(passwordInput.value).toBe('password123');
    });
  });
});
