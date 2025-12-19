import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import LoginView from './LoginView';
import { useAuth } from '../hooks/useAuth';
import { useLogin } from '../hooks/useLogin';

vi.mock('../hooks/useAuth');
vi.mock('../hooks/useLogin');

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

describe('LoginView', () => {
  let mockLogin;

  beforeEach(() => {
    mockLogin = vi.fn();
    useAuth.mockReturnValue({
      isAuthenticated: false
    });
    useLogin.mockReturnValue({
      login: mockLogin,
      isLoading: false
    });
    mockNavigate.mockClear();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering & Initial State', () => {
    it('renders the branding section with app title', () => {
      renderWithRouter(<LoginView />);
      
      expect(screen.getByText('🍳 Recipe Notebook')).toBeInTheDocument();
    });

    it('renders the page heading "Welcome Back"', () => {
      renderWithRouter(<LoginView />);
      
      expect(screen.getByRole('heading', { name: /Welcome Back/i })).toBeInTheDocument();
    });

    it('renders the LoginForm component', () => {
      renderWithRouter(<LoginView />);
      
      expect(screen.getByLabelText(/Username/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Password/i, { selector: 'input' })).toBeInTheDocument();
      const { container } = renderWithRouter(<LoginView />);
      
      expect(container.querySelector('.login-view')).toBeInTheDocument();
      expect(container.querySelector('.login-container')).toBeInTheDocument();
      expect(container.querySelector('.login-card')).toBeInTheDocument();
    });
  });


  describe('Authentication Redirect Logic', () => {
    it('redirects to /recipes when user is already authenticated', () => {
      useAuth.mockReturnValue({
        isAuthenticated: true
      });

      const { container } = renderWithRouter(<LoginView />);

      expect(container.querySelector('.login-form')).not.toBeInTheDocument();
    });

    it('does not redirect when user is not authenticated', () => {
      useAuth.mockReturnValue({
        isAuthenticated: false
      });

      renderWithRouter(<LoginView />);

      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });

  describe('Login Submission Flow', () => {
    it('passes the login handler to LoginForm', () => {
      renderWithRouter(<LoginView />);
      
      expect(useLogin).toHaveBeenCalled();
    });

    it('calls the login function from useLogin when form is submitted', async () => {
      const userEventModule = await import('@testing-library/user-event');
      const user = userEventModule.default.setup();
      
      renderWithRouter(<LoginView />);
      
      await user.type(screen.getByLabelText(/Username/i), 'testuser');
      await user.type(screen.getByLabelText(/Password/i, { selector: 'input' }), 'testpass');
      await user.click(screen.getByRole('button', { name: /Log In/i }));
      
      await waitFor(() => {
        expect(mockLogin).toHaveBeenCalledWith(
          expect.objectContaining({
            username: 'testuser',
            password: 'testpass'
          })
        );
      });
    });

    it('passes isLoading state to LoginForm', () => {
      useLogin.mockReturnValue({
        login: mockLogin,
        isLoading: true
      });

      renderWithRouter(<LoginView />);
      
      const submitButton = screen.getByRole('button', { name: /Loading/i });
      expect(submitButton).toBeInTheDocument();
      expect(submitButton).toBeDisabled();
    });

    it('passes isLoading false to LoginForm when not loading', () => {
      useLogin.mockReturnValue({
        login: mockLogin,
        isLoading: false
      });

      renderWithRouter(<LoginView />);
      
      const submitButton = screen.getByRole('button', { name: /Log In/i });
      expect(submitButton).toBeInTheDocument();
      expect(submitButton).not.toBeDisabled();
    });
  });

  describe('Hook Integration', () => {
    it('uses useAuth hook to check authentication', () => {
      renderWithRouter(<LoginView />);
      
      expect(useAuth).toHaveBeenCalled();
    });

    it('uses useLogin hook to get login function', () => {
      renderWithRouter(<LoginView />);
      
      expect(useLogin).toHaveBeenCalled();
    });

    it('uses useNavigate hook for navigation', () => {
      renderWithRouter(<LoginView />);
      
      expect(mockNavigate).toBeDefined();
    });
  });
});
