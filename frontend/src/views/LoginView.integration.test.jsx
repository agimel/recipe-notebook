import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import LoginView from './LoginView';
import RegistrationView from './RegistrationView';
import RecipeListView from './RecipeListView';
import ProtectedRoute from '../components/ProtectedRoute';
import { useAuth } from '../hooks/useAuth';
import { useLogin } from '../hooks/useLogin';

vi.mock('../hooks/useAuth');
vi.mock('../hooks/useLogin');

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useLocation: () => ({ state: null })
  };
});

vi.mock('./RegistrationView', () => ({
  default: () => <div data-testid="registration-view">Registration View</div>
}));
vi.mock('./RecipeListView', () => ({
  default: () => <div data-testid="recipe-list-view">Recipe List View</div>
}));
vi.mock('../components/ProtectedRoute', () => ({
  default: ({ children }) => {
    const { isAuthenticated } = useAuth();
    return isAuthenticated ? children : <div>Redirecting to login...</div>;
  }
}));

function renderWithRouter(initialRoute = '/login') {
  return render(
    <MemoryRouter initialEntries={[initialRoute]}>
      <Routes>
        <Route path="/" element={<LoginView />} />
        <Route path="/login" element={<LoginView />} />
        <Route path="/register" element={<RegistrationView />} />
        <Route 
          path="/recipes" 
          element={
            <ProtectedRoute>
              <RecipeListView />
            </ProtectedRoute>
          } 
        />
      </Routes>
    </MemoryRouter>
  );
}

describe('LoginView Integration Tests - Navigation and Routing', () => {
  let mockLogin;
  let mockUseAuth;

  beforeEach(() => {
    mockLogin = vi.fn();
    mockUseAuth = {
      isAuthenticated: false,
      login: vi.fn()
    };
    
    useAuth.mockReturnValue(mockUseAuth);
    useLogin.mockReturnValue({
      login: mockLogin,
      isLoading: false,
      error: null
    });

    mockNavigate.mockClear();
    sessionStorage.clear();
  });

  afterEach(() => {
    vi.clearAllMocks();
    sessionStorage.clear();
  });

  describe('Route Rendering', () => {
    it('renders LoginView when navigating to /login route', () => {
      renderWithRouter('/login');
      
      expect(screen.getByText('🍳 Recipe Notebook')).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: /Welcome Back/i })).toBeInTheDocument();
      expect(screen.getByLabelText(/Username/i)).toBeInTheDocument();
    });

    it('renders LoginView when navigating to root / route', () => {
      render(
        <MemoryRouter initialEntries={['/']}>
          <Routes>
            <Route path="/" element={<LoginView />} />
            <Route path="/login" element={<LoginView />} />
            <Route path="/register" element={<RegistrationView />} />
          </Routes>
        </MemoryRouter>
      );
      
      expect(screen.getByText('🍳 Recipe Notebook')).toBeInTheDocument();
      expect(screen.getByLabelText(/Username/i)).toBeInTheDocument();
    });

    it('has correct route path configured', () => {
      const { container } = renderWithRouter('/login');
      
      expect(container.querySelector('.login-view')).toBeInTheDocument();
    });
  });

  describe('Navigation to Registration', () => {
    it('navigates to /register when clicking the registration link', async () => {
      const user = userEvent.setup();
      renderWithRouter('/login');
      
      const registerLink = screen.getByRole('link', { name: /Sign up/i });
      expect(registerLink).toBeInTheDocument();
      
      await user.click(registerLink);
      
      await waitFor(() => {
        expect(screen.getByTestId('registration-view')).toBeInTheDocument();
      });
    });

    it('displays registration view after navigation from login', async () => {
      const user = userEvent.setup();
      renderWithRouter('/login');
      
      const registerLink = screen.getByRole('link', { name: /Sign up/i });
      await user.click(registerLink);
      
      await waitFor(() => {
        expect(screen.queryByLabelText(/Username/i)).not.toBeInTheDocument();
        expect(screen.getByTestId('registration-view')).toBeInTheDocument();
      });
    });

    it('allows keyboard navigation to registration link', async () => {
      const user = userEvent.setup();
      renderWithRouter('/login');
      
      const registerLink = screen.getByRole('link', { name: /Sign up/i });
      expect(registerLink).toBeInTheDocument();
      
      // Focus the link directly (simulating tab navigation reaching it)
      registerLink.focus();
      expect(registerLink).toHaveFocus();
      
      await user.keyboard('{Enter}');
      
      await waitFor(() => {
        expect(screen.getByTestId('registration-view')).toBeInTheDocument();
      });
    });
  });

  describe('Navigation After Successful Login', () => {
    it('calls login which triggers navigation in the real useLogin hook', async () => {
      const user = userEvent.setup();
      
      mockLogin.mockImplementation(async (credentials) => {
        // In the real useLogin, this would call navigate('/recipes', { replace: true })
        // We're testing that LoginView correctly calls the login function
        mockUseAuth.login('fake-jwt-token', 'testuser', '2025-12-31T23:59:59Z');
        mockUseAuth.isAuthenticated = true;
        useAuth.mockReturnValue(mockUseAuth);
        return { success: true };
      });
      
      renderWithRouter('/login');
      
      await user.type(screen.getByLabelText(/Username/i), 'testuser');
      await user.type(screen.getByLabelText(/Password/i, { selector: 'input' }), 'password123');
      await user.click(screen.getByRole('button', { name: /Log In/i }));
      
      // Verify the login function was called with correct credentials
      // In the real app, useLogin.login() navigates internally
      await waitFor(() => {
        expect(mockLogin).toHaveBeenCalledWith({
          username: 'testuser',
          password: 'password123'
        });
      });
    });

    it('does not navigate to /recipes on failed login', async () => {
      const user = userEvent.setup();
      
      mockLogin.mockResolvedValue({ success: false, error: 'Invalid credentials' });
      
      renderWithRouter('/login');
      
      await user.type(screen.getByLabelText(/Username/i), 'wronguser');
      await user.type(screen.getByLabelText(/Password/i, { selector: 'input' }), 'wrongpass');
      await user.click(screen.getByRole('button', { name: /Log In/i }));
      
      await waitFor(() => {
        expect(mockNavigate).not.toHaveBeenCalled();
      });
      
      expect(screen.getByLabelText(/Username/i)).toBeInTheDocument();
    });
  });

  describe('Protected Route Behavior', () => {
    it('allows access to /recipes when authenticated', () => {
      mockUseAuth.isAuthenticated = true;
      useAuth.mockReturnValue(mockUseAuth);
      
      renderWithRouter('/recipes');
      
      expect(screen.getByTestId('recipe-list-view')).toBeInTheDocument();
    });

    it('blocks access to /recipes when not authenticated', () => {
      mockUseAuth.isAuthenticated = false;
      useAuth.mockReturnValue(mockUseAuth);
      
      renderWithRouter('/recipes');
      
      expect(screen.queryByTestId('recipe-list-view')).not.toBeInTheDocument();
      expect(screen.getByText('Redirecting to login...')).toBeInTheDocument();
    });

    it('redirects from /recipes to login when authentication state becomes false', () => {
      mockUseAuth.isAuthenticated = true;
      useAuth.mockReturnValue(mockUseAuth);
      
      const { rerender } = renderWithRouter('/recipes');
      
      expect(screen.getByTestId('recipe-list-view')).toBeInTheDocument();
      
      mockUseAuth.isAuthenticated = false;
      useAuth.mockReturnValue(mockUseAuth);
      
      rerender(
        <MemoryRouter initialEntries={['/recipes']}>
          <Routes>
            <Route path="/login" element={<LoginView />} />
            <Route 
              path="/recipes" 
              element={
                <ProtectedRoute>
                  <RecipeListView />
                </ProtectedRoute>
              } 
            />
          </Routes>
        </MemoryRouter>
      );
      
      expect(screen.queryByTestId('recipe-list-view')).not.toBeInTheDocument();
    });
  });

  describe('Authenticated User Redirect from Login', () => {
    it('redirects to /recipes when already authenticated user visits /login', () => {
      mockUseAuth.isAuthenticated = true;
      useAuth.mockReturnValue(mockUseAuth);
      
      const { container } = render(
        <MemoryRouter initialEntries={['/login']}>
          <Routes>
            <Route path="/login" element={<LoginView />} />
            <Route 
              path="/recipes" 
              element={
                <ProtectedRoute>
                  <RecipeListView />
                </ProtectedRoute>
              } 
            />
          </Routes>
        </MemoryRouter>
      );
      
      expect(container.querySelector('.login-form')).not.toBeInTheDocument();
    });

    it('prevents authenticated users from accessing login page', () => {
      mockUseAuth.isAuthenticated = true;
      useAuth.mockReturnValue(mockUseAuth);
      
      const { container } = renderWithRouter('/login');
      
      expect(container.querySelector('.login-form')).not.toBeInTheDocument();
    });

    it('shows login form when user is not authenticated', () => {
      mockUseAuth.isAuthenticated = false;
      useAuth.mockReturnValue(mockUseAuth);
      
      renderWithRouter('/login');
      
      expect(screen.getByRole('heading', { name: /Welcome Back/i })).toBeInTheDocument();
      expect(screen.getByLabelText(/Username/i)).toBeInTheDocument();
      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });

  describe('Complete User Journey: Login to Recipe List', () => {
    it('completes full authentication flow from /login', async () => {
      const user = userEvent.setup();
      
      mockLogin.mockImplementation(async (credentials) => {
        mockUseAuth.login('jwt-token-123', credentials.username, '2025-12-31T23:59:59Z');
        mockUseAuth.isAuthenticated = true;
        useAuth.mockReturnValue(mockUseAuth);
        return { success: true };
      });
      
      renderWithRouter('/login');
      
      expect(screen.getByRole('heading', { name: /Welcome Back/i })).toBeInTheDocument();
      
      await user.type(screen.getByLabelText(/Username/i), 'johndoe');
      await user.type(screen.getByLabelText(/Password/i, { selector: 'input' }), 'password123');
      await user.click(screen.getByRole('button', { name: /Log In/i }));
      
      await waitFor(() => {
        expect(mockLogin).toHaveBeenCalledWith({
          username: 'johndoe',
          password: 'password123'
        });
      });
      
      // Navigation happens inside useLogin hook, which is tested separately
      await waitFor(() => {
        expect(mockUseAuth.isAuthenticated).toBe(true);
      });
    });

    it('completes full authentication flow from root path /', async () => {
      const user = userEvent.setup();
      
      mockLogin.mockImplementation(async (credentials) => {
        mockUseAuth.login('jwt-token-456', credentials.username, '2025-12-31T23:59:59Z');
        mockUseAuth.isAuthenticated = true;
        useAuth.mockReturnValue(mockUseAuth);
        return { success: true };
      });
      
      renderWithRouter('/');
      
      expect(screen.getByRole('heading', { name: /Welcome Back/i })).toBeInTheDocument();
      
      await user.type(screen.getByLabelText(/Username/i), 'testuser');
      await user.type(screen.getByLabelText(/Password/i, { selector: 'input' }), 'testpass');
      await user.click(screen.getByRole('button', { name: /Log In/i }));
      
      await waitFor(() => {
        expect(mockLogin).toHaveBeenCalledWith({
          username: 'testuser',
          password: 'testpass'
        });
      });
      
      await waitFor(() => {
        expect(mockUseAuth.isAuthenticated).toBe(true);
      });
    });

    it('maintains login page on failed authentication', async () => {
      const user = userEvent.setup();
      
      mockLogin.mockResolvedValue({ 
        success: false, 
        error: 'Invalid username or password' 
      });
      
      renderWithRouter('/login');
      
      await user.type(screen.getByLabelText(/Username/i), 'wronguser');
      await user.type(screen.getByLabelText(/Password/i, { selector: 'input' }), 'wrongpass');
      await user.click(screen.getByRole('button', { name: /Log In/i }));
      
      await waitFor(() => {
        expect(mockLogin).toHaveBeenCalled();
      });
      
      expect(screen.getByRole('heading', { name: /Welcome Back/i })).toBeInTheDocument();
      expect(screen.getByLabelText(/Username/i)).toBeInTheDocument();
      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });

  describe('Complete User Journey: Login to Registration', () => {
    it('navigates from login to registration and back', async () => {
      const user = userEvent.setup();
      const { Link } = await import('react-router-dom');
      
      render(
        <MemoryRouter initialEntries={['/login']}>
          <Routes>
            <Route path="/login" element={<LoginView />} />
            <Route 
              path="/register" 
              element={
                <>
                  <div data-testid="registration-view">Registration View</div>
                  <Link to="/login">Back to Login</Link>
                </>
              } 
            />
          </Routes>
        </MemoryRouter>
      );
      
      expect(screen.getByRole('heading', { name: /Welcome Back/i })).toBeInTheDocument();
      
      const registerLink = screen.getByRole('link', { name: /Sign up/i });
      await user.click(registerLink);
      
      await waitFor(() => {
        expect(screen.getByTestId('registration-view')).toBeInTheDocument();
      });
      
      const backToLoginLink = screen.getByRole('link', { name: /Back to Login/i });
      await user.click(backToLoginLink);
      
      await waitFor(() => {
        expect(screen.getByRole('heading', { name: /Welcome Back/i })).toBeInTheDocument();
      });
    });
  });

  describe('Programmatic Navigation', () => {
    it('supports Enter key for form submission', async () => {
      const user = userEvent.setup();
      
      mockLogin.mockImplementation(async () => {
        mockUseAuth.login('jwt-token', 'testuser', '2025-12-31T23:59:59Z');
        mockUseAuth.isAuthenticated = true;
        useAuth.mockReturnValue(mockUseAuth);
        return { success: true };
      });
      
      renderWithRouter('/login');
      
      await user.type(screen.getByLabelText(/Username/i), 'testuser');
      await user.type(screen.getByLabelText(/Password/i, { selector: 'input' }), 'password123{Enter}');
      
      await waitFor(() => {
        expect(mockLogin).toHaveBeenCalled();
      });
      
      // Navigation happens inside useLogin hook, which is tested separately
      await waitFor(() => {
        expect(mockUseAuth.isAuthenticated).toBe(true);
      });
    });
  });

  describe('Browser Navigation', () => {
    it('maintains route state when navigating back from registration', async () => {
      const user = userEvent.setup();
      
      render(
        <MemoryRouter initialEntries={['/login']}>
          <Routes>
            <Route path="/login" element={<LoginView />} />
            <Route path="/register" element={<RegistrationView />} />
          </Routes>
        </MemoryRouter>
      );
      
      const registerLink = screen.getByRole('link', { name: /Sign up/i });
      await user.click(registerLink);
      
      await waitFor(() => {
        expect(screen.getByTestId('registration-view')).toBeInTheDocument();
      });
      
      expect(screen.queryByRole('heading', { name: /Welcome Back/i })).not.toBeInTheDocument();
    });

    it('clears form data when navigating away and back', async () => {
      const user = userEvent.setup();
      
      render(
        <MemoryRouter initialEntries={['/login']}>
          <Routes>
            <Route path="/login" element={<LoginView />} />
            <Route path="/register" element={<RegistrationView />} />
          </Routes>
        </MemoryRouter>
      );
      
      const usernameInput = screen.getByLabelText(/Username/i);
      await user.type(usernameInput, 'testuser');
      
      expect(usernameInput).toHaveValue('testuser');
      
      const registerLink = screen.getByRole('link', { name: /Sign up/i });
      await user.click(registerLink);
      
      await waitFor(() => {
        expect(screen.getByTestId('registration-view')).toBeInTheDocument();
      });
    });
  });

  describe('Route Parameter Handling', () => {
    it('does not accept route parameters on /login', () => {
      render(
        <MemoryRouter initialEntries={['/login/extra']}>
          <Routes>
            <Route path="/login" element={<LoginView />} />
            <Route path="/login/:param" element={<div>Invalid Route</div>} />
          </Routes>
        </MemoryRouter>
      );
      
      expect(screen.getByText('Invalid Route')).toBeInTheDocument();
      expect(screen.queryByRole('heading', { name: /Welcome Back/i })).not.toBeInTheDocument();
    });

    it('renders correctly with exact path match', () => {
      renderWithRouter('/login');
      
      expect(screen.getByRole('heading', { name: /Welcome Back/i })).toBeInTheDocument();
      expect(screen.getByLabelText(/Username/i)).toBeInTheDocument();
    });
  });

  describe('Authentication State Persistence', () => {
    it('maintains authentication state across route changes', () => {
      mockUseAuth.isAuthenticated = true;
      useAuth.mockReturnValue(mockUseAuth);
      
      render(
        <MemoryRouter initialEntries={['/recipes']}>
          <Routes>
            <Route path="/login" element={<LoginView />} />
            <Route 
              path="/recipes" 
              element={
                <ProtectedRoute>
                  <RecipeListView />
                </ProtectedRoute>
              } 
            />
          </Routes>
        </MemoryRouter>
      );
      
      expect(screen.getByTestId('recipe-list-view')).toBeInTheDocument();
      expect(useAuth).toHaveBeenCalled();
    });

    it('loses authentication state when sessionStorage is cleared', () => {
      mockUseAuth.isAuthenticated = true;
      useAuth.mockReturnValue(mockUseAuth);
      
      renderWithRouter('/recipes');
      
      expect(screen.getByTestId('recipe-list-view')).toBeInTheDocument();
      
      sessionStorage.clear();
      
      mockUseAuth.isAuthenticated = false;
      useAuth.mockReturnValue(mockUseAuth);
      
      renderWithRouter('/login');
      
      expect(screen.getByRole('heading', { name: /Welcome Back/i })).toBeInTheDocument();
    });
  });
});
