import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import RegistrationView from './RegistrationView';

vi.mock('../components/RegistrationForm', () => ({
  default: () => <div data-testid="registration-form">Registration Form Mock</div>
}));

function renderWithRouter(component) {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
}

describe('RegistrationView', () => {
  describe('Rendering', () => {
    it('renders the application branding', () => {
      renderWithRouter(<RegistrationView />);
      
      expect(screen.getByText(/Recipe Notebook/i)).toBeInTheDocument();
    });

    it('renders the main page heading', () => {
      renderWithRouter(<RegistrationView />);
      
      const heading = screen.getByRole('heading', { name: /Create Your Account/i });
      expect(heading).toBeInTheDocument();
      expect(heading.tagName).toBe('H1');
    });

    it('renders the RegistrationForm component', () => {
      renderWithRouter(<RegistrationView />);
      
      expect(screen.getByTestId('registration-form')).toBeInTheDocument();
    });

    it('has an ARIA live region for dynamic announcements', () => {
      renderWithRouter(<RegistrationView />);
      
      const liveRegion = screen.getByRole('status');
      expect(liveRegion).toHaveAttribute('aria-live', 'polite');
      expect(liveRegion).toHaveAttribute('aria-atomic', 'true');
    });

    it('applies correct CSS classes for layout', () => {
      const { container } = renderWithRouter(<RegistrationView />);
      
      expect(container.querySelector('.registration-view')).toBeInTheDocument();
      expect(container.querySelector('.registration-container')).toBeInTheDocument();
      expect(container.querySelector('.registration-card')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has proper semantic structure', () => {
      renderWithRouter(<RegistrationView />);
      
      const headings = screen.getAllByRole('heading');
      expect(headings).toHaveLength(2);
    });

    it('has screen reader only class for ARIA live region', () => {
      const { container } = renderWithRouter(<RegistrationView />);
      
      const liveRegion = container.querySelector('.sr-only');
      expect(liveRegion).toHaveAttribute('role', 'status');
    });
  });
});
