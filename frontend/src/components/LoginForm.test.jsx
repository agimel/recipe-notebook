import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import LoginForm from './LoginForm';

function renderWithRouter(component) {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
}

describe('LoginForm', () => {
  let mockOnSubmit;

  beforeEach(() => {
    mockOnSubmit = vi.fn();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering & Initial State', () => {
    it('renders username input field with correct attributes', () => {
      renderWithRouter(<LoginForm onSubmit={mockOnSubmit} isLoading={false} />);
      
      const usernameInput = screen.getByLabelText(/Username/i);
      expect(usernameInput).toBeInTheDocument();
      expect(usernameInput).toHaveAttribute('type', 'text');
      expect(usernameInput).toHaveAttribute('placeholder', 'Enter your username');
    });

    it('renders password input field with correct attributes', () => {
      renderWithRouter(<LoginForm onSubmit={mockOnSubmit} isLoading={false} />);
      
      const passwordInput = screen.getByLabelText(/Password/i, { selector: 'input' });
      expect(passwordInput).toBeInTheDocument();
      expect(passwordInput).toHaveAttribute('type', 'password');
      expect(passwordInput).toHaveAttribute('placeholder', 'Enter your password');
    });

    it('renders submit button with correct initial text', () => {
      renderWithRouter(<LoginForm onSubmit={mockOnSubmit} isLoading={false} />);
      
      const submitButton = screen.getByRole('button', { name: /Log In/i });
      expect(submitButton).toBeInTheDocument();
      expect(submitButton).toHaveAttribute('type', 'submit');
    });

    it('renders registration link with correct text and href', () => {
      renderWithRouter(<LoginForm onSubmit={mockOnSubmit} isLoading={false} />);
      
      expect(screen.getByText(/Don't have an account\?/i)).toBeInTheDocument();
      
      const registerLink = screen.getByRole('link', { name: /Sign up/i });
      expect(registerLink).toBeInTheDocument();
      expect(registerLink).toHaveAttribute('href', '/register');
    });

    it('has noValidate attribute on form to prevent browser validation', () => {
      const { container } = renderWithRouter(<LoginForm onSubmit={mockOnSubmit} isLoading={false} />);
      
      const form = container.querySelector('form');
      expect(form).toHaveAttribute('noValidate');
    });

    it('auto-focuses username input on mount', () => {
      renderWithRouter(<LoginForm onSubmit={mockOnSubmit} isLoading={false} />);
      
      const usernameInput = screen.getByLabelText(/Username/i);
      expect(usernameInput).toHaveFocus();
    });

    it('initializes form fields with empty values', () => {
      renderWithRouter(<LoginForm onSubmit={mockOnSubmit} isLoading={false} />);
      
      expect(screen.getByLabelText(/Username/i)).toHaveValue('');
      expect(screen.getByLabelText(/Password/i, { selector: 'input' })).toHaveValue('');
    });
  });

  describe('Form Validation - Username Field', () => {
    it('displays required error when username is empty and field is blurred', async () => {
      const user = userEvent.setup();
      renderWithRouter(<LoginForm onSubmit={mockOnSubmit} isLoading={false} />);
      
      const usernameInput = screen.getByLabelText(/Username/i);
      
      await user.click(usernameInput);
      await user.tab();
      
      await waitFor(() => {
        expect(screen.getByText('Username is required')).toBeInTheDocument();
      });
    });

    it('does not display error when username field has value', async () => {
      const user = userEvent.setup();
      renderWithRouter(<LoginForm onSubmit={mockOnSubmit} isLoading={false} />);
      
      const usernameInput = screen.getByLabelText(/Username/i);
      
      await user.type(usernameInput, 'testuser');
      await user.tab();
      
      await waitFor(() => {
        expect(screen.queryByText('Username is required')).not.toBeInTheDocument();
      });
    });

    it('clears validation error when user enters value after error', async () => {
      const user = userEvent.setup();
      renderWithRouter(<LoginForm onSubmit={mockOnSubmit} isLoading={false} />);
      
      const usernameInput = screen.getByLabelText(/Username/i);
      
      await user.click(usernameInput);
      await user.tab();
      
      await waitFor(() => {
        expect(screen.getByText('Username is required')).toBeInTheDocument();
      });
      
      await user.type(usernameInput, 'testuser');
      await user.tab();
      
      await waitFor(() => {
        expect(screen.queryByText('Username is required')).not.toBeInTheDocument();
      });
    });
  });

  describe('Form Validation - Password Field', () => {
    it('displays required error when password is empty and field is blurred', async () => {
      const user = userEvent.setup();
      renderWithRouter(<LoginForm onSubmit={mockOnSubmit} isLoading={false} />);
      
      const passwordInput = screen.getByLabelText(/Password/i, { selector: 'input' });
      
      await user.click(passwordInput);
      await user.tab();
      
      await waitFor(() => {
        expect(screen.getByText('Password is required')).toBeInTheDocument();
      });
    });

    it('does not display error when password field has value', async () => {
      const user = userEvent.setup();
      renderWithRouter(<LoginForm onSubmit={mockOnSubmit} isLoading={false} />);
      
      const passwordInput = screen.getByLabelText(/Password/i, { selector: 'input' });
      
      await user.type(passwordInput, 'password123');
      await user.tab();
      
      await waitFor(() => {
        expect(screen.queryByText('Password is required')).not.toBeInTheDocument();
      });
    });

    it('clears validation error when user enters value after error', async () => {
      const user = userEvent.setup();
      renderWithRouter(<LoginForm onSubmit={mockOnSubmit} isLoading={false} />);
      
      const passwordInput = screen.getByLabelText(/Password/i, { selector: 'input' });
      
      await user.click(passwordInput);
      await user.tab();
      
      await waitFor(() => {
        expect(screen.getByText('Password is required')).toBeInTheDocument();
      });
      
      await user.type(passwordInput, 'password123');
      await user.tab();
      
      await waitFor(() => {
        expect(screen.queryByText('Password is required')).not.toBeInTheDocument();
      });
    });
  });

  describe('Form Submission - Valid Data', () => {
    it('calls onSubmit with correct data when form is valid', async () => {
      const user = userEvent.setup();
      renderWithRouter(<LoginForm onSubmit={mockOnSubmit} isLoading={false} />);
      
      await user.type(screen.getByLabelText(/Username/i), 'testuser');
      await user.type(screen.getByLabelText(/Password/i, { selector: 'input' }), 'password123');
      await user.click(screen.getByRole('button', { name: /Log In/i }));
      
      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledTimes(1);
        expect(mockOnSubmit).toHaveBeenCalledWith({
          username: 'testuser',
          password: 'password123'
        }, expect.anything());
      });
    });

    it('submits form when Enter key is pressed in username field', async () => {
      const user = userEvent.setup();
      renderWithRouter(<LoginForm onSubmit={mockOnSubmit} isLoading={false} />);
      
      const usernameInput = screen.getByLabelText(/Username/i);
      const passwordInput = screen.getByLabelText(/Password/i, { selector: 'input' });
      
      await user.type(usernameInput, 'testuser');
      await user.type(passwordInput, 'password123');
      await user.type(usernameInput, '{Enter}');
      
      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith({
          username: 'testuser',
          password: 'password123'
        }, expect.anything());
      });
    });

    it('submits form when Enter key is pressed in password field', async () => {
      const user = userEvent.setup();
      renderWithRouter(<LoginForm onSubmit={mockOnSubmit} isLoading={false} />);
      
      const usernameInput = screen.getByLabelText(/Username/i);
      const passwordInput = screen.getByLabelText(/Password/i, { selector: 'input' });
      
      await user.type(usernameInput, 'testuser');
      await user.type(passwordInput, 'password123{Enter}');
      
      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith({
          username: 'testuser',
          password: 'password123'
        }, expect.anything());
      });
    });
  });

  describe('Form Submission - Invalid Data', () => {
    it('does not call onSubmit when username is empty', async () => {
      const user = userEvent.setup();
      renderWithRouter(<LoginForm onSubmit={mockOnSubmit} isLoading={false} />);
      
      await user.type(screen.getByLabelText(/Password/i, { selector: 'input' }), 'password123');
      await user.click(screen.getByRole('button', { name: /Log In/i }));
      
      await waitFor(() => {
        expect(screen.getByText('Username is required')).toBeInTheDocument();
      });
      
      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it('does not call onSubmit when password is empty', async () => {
      const user = userEvent.setup();
      renderWithRouter(<LoginForm onSubmit={mockOnSubmit} isLoading={false} />);
      
      await user.type(screen.getByLabelText(/Username/i), 'testuser');
      await user.click(screen.getByRole('button', { name: /Log In/i }));
      
      await waitFor(() => {
        expect(screen.getByText('Password is required')).toBeInTheDocument();
      });
      
      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it('does not call onSubmit when both fields are empty', async () => {
      const user = userEvent.setup();
      renderWithRouter(<LoginForm onSubmit={mockOnSubmit} isLoading={false} />);
      
      await user.click(screen.getByRole('button', { name: /Log In/i }));
      
      await waitFor(() => {
        expect(screen.getByText('Username is required')).toBeInTheDocument();
        expect(screen.getByText('Password is required')).toBeInTheDocument();
      });
      
      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it('displays all validation errors simultaneously on submit', async () => {
      const user = userEvent.setup();
      renderWithRouter(<LoginForm onSubmit={mockOnSubmit} isLoading={false} />);
      
      await user.click(screen.getByRole('button', { name: /Log In/i }));
      
      await waitFor(() => {
        expect(screen.getByText('Username is required')).toBeInTheDocument();
        expect(screen.getByText('Password is required')).toBeInTheDocument();
      });
    });
  });

  describe('Loading States', () => {
    it('displays loading text on submit button when isLoading is true', () => {
      renderWithRouter(<LoginForm onSubmit={mockOnSubmit} isLoading={true} />);
      
      expect(screen.getByRole('button', { name: /Loading/i })).toBeInTheDocument();
    });

    it('disables submit button when isLoading is true', () => {
      renderWithRouter(<LoginForm onSubmit={mockOnSubmit} isLoading={true} />);
      
      const submitButton = screen.getByRole('button', { name: /Loading/i });
      expect(submitButton).toBeDisabled();
    });

    it('enables submit button when isLoading is false', () => {
      renderWithRouter(<LoginForm onSubmit={mockOnSubmit} isLoading={false} />);
      
      const submitButton = screen.getByRole('button', { name: /Log In/i });
      expect(submitButton).not.toBeDisabled();
    });

    it('prevents form submission when isLoading is true', async () => {
      const user = userEvent.setup();
      renderWithRouter(<LoginForm onSubmit={mockOnSubmit} isLoading={true} />);
      
      await user.type(screen.getByLabelText(/Username/i), 'testuser');
      await user.type(screen.getByLabelText(/Password/i, { selector: 'input' }), 'password123');
      
      const submitButton = screen.getByRole('button', { name: /Loading/i });
      await user.click(submitButton);
      
      expect(mockOnSubmit).not.toHaveBeenCalled();
    });
  });

  describe('User Interactions - Input Changes', () => {
    it('updates username value as user types', async () => {
      const user = userEvent.setup();
      renderWithRouter(<LoginForm onSubmit={mockOnSubmit} isLoading={false} />);
      
      const usernameInput = screen.getByLabelText(/Username/i);
      
      await user.type(usernameInput, 'john');
      expect(usernameInput).toHaveValue('john');
      
      await user.type(usernameInput, 'doe');
      expect(usernameInput).toHaveValue('johndoe');
    });

    it('updates password value as user types', async () => {
      const user = userEvent.setup();
      renderWithRouter(<LoginForm onSubmit={mockOnSubmit} isLoading={false} />);
      
      const passwordInput = screen.getByLabelText(/Password/i, { selector: 'input' });
      
      await user.type(passwordInput, 'pass');
      expect(passwordInput).toHaveValue('pass');
      
      await user.type(passwordInput, 'word123');
      expect(passwordInput).toHaveValue('password123');
    });

    it('allows clearing username field', async () => {
      const user = userEvent.setup();
      renderWithRouter(<LoginForm onSubmit={mockOnSubmit} isLoading={false} />);
      
      const usernameInput = screen.getByLabelText(/Username/i);
      
      await user.type(usernameInput, 'testuser');
      expect(usernameInput).toHaveValue('testuser');
      
      await user.clear(usernameInput);
      expect(usernameInput).toHaveValue('');
    });

    it('allows clearing password field', async () => {
      const user = userEvent.setup();
      renderWithRouter(<LoginForm onSubmit={mockOnSubmit} isLoading={false} />);
      
      const passwordInput = screen.getByLabelText(/Password/i, { selector: 'input' });
      
      await user.type(passwordInput, 'password123');
      expect(passwordInput).toHaveValue('password123');
      
      await user.clear(passwordInput);
      expect(passwordInput).toHaveValue('');
    });
  });

  describe('Keyboard Navigation & Accessibility', () => {
    it('allows tabbing from username to password field', async () => {
      const user = userEvent.setup();
      renderWithRouter(<LoginForm onSubmit={mockOnSubmit} isLoading={false} />);
      
      const usernameInput = screen.getByLabelText(/Username/i);
      const passwordInput = screen.getByLabelText(/Password/i, { selector: 'input' });
      
      expect(usernameInput).toHaveFocus();
      
      await user.tab();
      expect(passwordInput).toHaveFocus();
    });

    it('allows tabbing from password to submit button', async () => {
      const user = userEvent.setup();
      renderWithRouter(<LoginForm onSubmit={mockOnSubmit} isLoading={false} />);
      
      const passwordInput = screen.getByLabelText(/Password/i, { selector: 'input' });
      const submitButton = screen.getByRole('button', { name: /Log In/i });
      
      await user.tab();
      expect(passwordInput).toHaveFocus();
      
      await user.tab();
      await user.tab();
      expect(submitButton).toHaveFocus();
    });

    it('has accessible labels for all form fields', () => {
      renderWithRouter(<LoginForm onSubmit={mockOnSubmit} isLoading={false} />);
      
      expect(screen.getByLabelText(/Username/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Password/i, { selector: 'input' })).toBeInTheDocument();
    });

    it('has accessible button text', () => {
      renderWithRouter(<LoginForm onSubmit={mockOnSubmit} isLoading={false} />);
      
      expect(screen.getByRole('button', { name: /Log In/i })).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('handles rapid successive form submissions gracefully', async () => {
      const user = userEvent.setup();
      renderWithRouter(<LoginForm onSubmit={mockOnSubmit} isLoading={false} />);
      
      await user.type(screen.getByLabelText(/Username/i), 'testuser');
      await user.type(screen.getByLabelText(/Password/i, { selector: 'input' }), 'password123');
      
      const submitButton = screen.getByRole('button', { name: /Log In/i });
      
      await user.click(submitButton);
      await user.click(submitButton);
      await user.click(submitButton);
      
      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledTimes(3);
      });
    });

    it('handles special characters in username', async () => {
      const user = userEvent.setup();
      renderWithRouter(<LoginForm onSubmit={mockOnSubmit} isLoading={false} />);
      
      await user.type(screen.getByLabelText(/Username/i), 'user@123_test');
      await user.type(screen.getByLabelText(/Password/i, { selector: 'input' }), 'password123');
      await user.click(screen.getByRole('button', { name: /Log In/i }));
      
      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith({
          username: 'user@123_test',
          password: 'password123'
        }, expect.anything());
      });
    });

    it('handles special characters in password', async () => {
      const user = userEvent.setup();
      renderWithRouter(<LoginForm onSubmit={mockOnSubmit} isLoading={false} />);
      
      await user.type(screen.getByLabelText(/Username/i), 'testuser');
      await user.type(screen.getByLabelText(/Password/i, { selector: 'input' }), 'P@$$w0rd!#123');
      await user.click(screen.getByRole('button', { name: /Log In/i }));
      
      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith({
          username: 'testuser',
          password: 'P@$$w0rd!#123'
        }, expect.anything());
      });
    });

    it('handles very long username input', async () => {
      const user = userEvent.setup();
      renderWithRouter(<LoginForm onSubmit={mockOnSubmit} isLoading={false} />);
      
      const longUsername = 'a'.repeat(100);
      await user.type(screen.getByLabelText(/Username/i), longUsername);
      await user.type(screen.getByLabelText(/Password/i, { selector: 'input' }), 'password123');
      await user.click(screen.getByRole('button', { name: /Log In/i }));
      
      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith({
          username: longUsername,
          password: 'password123'
        }, expect.anything());
      });
    });

    it('handles very long password input', async () => {
      const user = userEvent.setup();
      renderWithRouter(<LoginForm onSubmit={mockOnSubmit} isLoading={false} />);
      
      const longPassword = 'p'.repeat(200);
      await user.type(screen.getByLabelText(/Username/i), 'testuser');
      await user.type(screen.getByLabelText(/Password/i, { selector: 'input' }), longPassword);
      await user.click(screen.getByRole('button', { name: /Log In/i }));
      
      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith({
          username: 'testuser',
          password: longPassword
        }, expect.anything());
      });
    });

    it('handles whitespace in username', async () => {
      const user = userEvent.setup();
      renderWithRouter(<LoginForm onSubmit={mockOnSubmit} isLoading={false} />);
      
      await user.type(screen.getByLabelText(/Username/i), '  testuser  ');
      await user.type(screen.getByLabelText(/Password/i, { selector: 'input' }), 'password123');
      await user.click(screen.getByRole('button', { name: /Log In/i }));
      
      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith({
          username: '  testuser  ',
          password: 'password123'
        }, expect.anything());
      });
    });

    it('maintains form state when re-rendered', async () => {
      const user = userEvent.setup();
      const { rerender } = renderWithRouter(<LoginForm onSubmit={mockOnSubmit} isLoading={false} />);
      
      await user.type(screen.getByLabelText(/Username/i), 'testuser');
      await user.type(screen.getByLabelText(/Password/i, { selector: 'input' }), 'password123');

      rerender(
        <BrowserRouter>
          <LoginForm onSubmit={mockOnSubmit} isLoading={false} />
        </BrowserRouter>
      );

      expect(screen.getByLabelText(/Username/i)).toHaveValue('testuser');
      expect(screen.getByLabelText(/Password/i, { selector: 'input' })).toHaveValue('password123');
    });
  });

  describe('Form Behavior', () => {
    it('clears validation errors when fields are corrected', async () => {
      const user = userEvent.setup();
      renderWithRouter(<LoginForm onSubmit={mockOnSubmit} isLoading={false} />);
      
      await user.click(screen.getByRole('button', { name: /Log In/i }));
      
      await waitFor(() => {
        expect(screen.getByText('Username is required')).toBeInTheDocument();
        expect(screen.getByText('Password is required')).toBeInTheDocument();
      });

      await user.type(screen.getByLabelText(/Username/i), 'testuser');
      await user.type(screen.getByLabelText(/Password/i, { selector: 'input' }), 'password123');

      await waitFor(() => {
        expect(screen.queryByText('Username is required')).not.toBeInTheDocument();
        expect(screen.queryByText('Password is required')).not.toBeInTheDocument();
      });
    });
  });

  describe('Password Field Visibility', () => {
    it('renders password field with type="password" by default', () => {
      renderWithRouter(<LoginForm onSubmit={mockOnSubmit} isLoading={false} />);
      
      const passwordInput = screen.getByLabelText(/Password/i, { selector: 'input' });
      expect(passwordInput).toHaveAttribute('type', 'password');
    });

    it('includes password visibility toggle button', () => {
      renderWithRouter(<LoginForm onSubmit={mockOnSubmit} isLoading={false} />);

      const toggleButton = screen.getByRole('button', { name: /show password/i });
      expect(toggleButton).toBeInTheDocument();
    });

    it('toggles password visibility when toggle button is clicked', async () => {
      const user = userEvent.setup();
      renderWithRouter(<LoginForm onSubmit={mockOnSubmit} isLoading={false} />);

      const passwordInput = screen.getByLabelText(/Password/i, { selector: 'input' });
      let toggleButton = screen.getByRole('button', { name: /show password/i });
      
      expect(passwordInput).toHaveAttribute('type', 'password');
      
      await user.click(toggleButton);
      expect(passwordInput).toHaveAttribute('type', 'text');
      
      toggleButton = screen.getByRole('button', { name: /hide password/i });
      await user.click(toggleButton);
      expect(passwordInput).toHaveAttribute('type', 'password');
    });
  });
});
