# Recipe Notebook Frontend

React-based frontend for the Recipe Notebook application.

## Setup

1. Install Node.js (v18 or higher)
2. Install dependencies:
   ```bash
   npm install
   ```

## Development

Start the development server:
```bash
npm run dev
```

The app will be available at http://localhost:3000

## Testing

Run tests:
```bash
npm test
```

Run tests in watch mode:
```bash
npm test -- --watch
```

## Build

Build for production:
```bash
npm run build
```

## Features

### Authentication
- User registration with validation
- User login with session management
- Protected routes with authentication guards
- Session-based authentication using sessionStorage
- Password visibility toggle
- Character counter for username input

### Recipe Management
- Browse recipes with infinite scroll
- Search recipes by name
- Filter by categories and difficulty level
- Create new recipes with ingredients and steps
- Edit existing recipes
- Delete recipes with confirmation
- View detailed recipe information
- Unsaved changes protection

### User Experience
- Real-time form validation
- Toast notifications for user feedback
- Responsive design for all screen sizes
- Loading states and skeletons
- Empty states with helpful messages
- Scroll to top button
- Welcome banner for new users
- Accessibility features (ARIA labels, keyboard navigation)

## Tech Stack

- **React** 18.2.0 - UI library
- **React Router DOM** 6.20.0 - Client-side routing
- **Vite** 5.0.8 - Build tool and dev server
- **Axios** 1.6.2 - HTTP client
- **React Hook Form** 7.48.0 - Form state management
- **React Hot Toast** 2.4.1 - Toast notifications
- **Vitest** 4.0.16 - Testing framework
- **Testing Library** - Component testing utilities

## Project Structure

```
src/
├── components/           # Reusable components
│   ├── common/          # Common UI components
│   │   ├── EmptyState.jsx
│   │   ├── LoadingSpinner.jsx
│   │   ├── LoadMoreButton.jsx
│   │   ├── ScrollToTopFAB.jsx
│   │   └── SkeletonCards.jsx
│   ├── filters/         # Filter components
│   │   ├── ActiveFilterChips.jsx
│   │   ├── CategoryFilter.jsx
│   │   ├── DifficultyFilter.jsx
│   │   ├── FilterBar.jsx
│   │   └── SearchBar.jsx
│   ├── recipe/          # Recipe display components
│   │   ├── ActionButtons.jsx
│   │   ├── CategoryBadges.jsx
│   │   ├── CategoryChips.jsx
│   │   ├── CookingTime.jsx
│   │   ├── DeleteConfirmationDialog.jsx
│   │   ├── DifficultyBadge.jsx
│   │   ├── ErrorDisplay.jsx
│   │   ├── IngredientsList.jsx
│   │   ├── IngredientsSection.jsx
│   │   ├── LoadingSkeleton.jsx
│   │   ├── RecipeCard.jsx
│   │   ├── RecipeContent.jsx
│   │   ├── RecipeGrid.jsx
│   │   ├── RecipeHeader.jsx
│   │   ├── StepsList.jsx
│   │   ├── StepsSection.jsx
│   │   └── WelcomeBanner.jsx
│   ├── recipe-form/     # Recipe form components
│   │   ├── BasicInfoSection.jsx
│   │   ├── CategorySection.jsx
│   │   ├── FormActions.jsx
│   │   ├── IngredientRow.jsx
│   │   ├── IngredientsSection.jsx
│   │   ├── StepItem.jsx
│   │   └── StepsSection.jsx
│   ├── Button.jsx
│   ├── FormInput.jsx
│   ├── LoginForm.jsx
│   ├── ProtectedRoute.jsx
│   ├── RegistrationForm.jsx
│   └── UnsavedChangesDialog.jsx
├── contexts/            # React contexts
│   └── AuthContext.jsx
├── hooks/               # Custom React hooks
│   ├── useAuth.js
│   ├── useConcurrentEditDetection.jsx
│   ├── useLogin.js
│   ├── useNavigationBlocker.js
│   ├── useRecipeForm.js
│   ├── useRecipeList.js
│   └── useRegistration.js
├── services/            # API services
│   └── api.js          # Axios client and API endpoints
├── types/               # Type definitions (for reference)
│   ├── auth.js
│   └── recipe.js
├── views/               # Page-level components
│   ├── CreateRecipeView.jsx
│   ├── LoginView.jsx
│   ├── RecipeDetailView.jsx
│   ├── RecipeEditView.jsx
│   ├── RecipeListView.jsx
│   └── RegistrationView.jsx
├── test/                # Test utilities
│   └── setup.js
├── App.jsx              # Main app component with routing
├── App.css              # Global styles
└── main.jsx             # Entry point
```

## API Integration

The application integrates with a Spring Boot backend API:

- **Auth API**: Registration and login endpoints
- **Recipes API**: CRUD operations for recipes
- **Categories API**: Fetch available recipe categories

All API requests include user authentication via session headers.

## Routes

- `/login` - User login
- `/register` - User registration
- `/recipes` - Recipe list (protected)
- `/recipes/new` - Create new recipe (protected)
- `/recipes/:id` - Recipe detail view (protected)
- `/recipes/:id/edit` - Edit recipe (protected)

## Testing Documentation

See additional testing documentation:
- `TESTING.md` - General testing guidelines
- `MANUAL_TESTING_LOGIN.md` - Login view testing procedures
- `MANUAL_TESTING_REGISTRATION.md` - Registration view testing procedures
- `TESTING_RECIPE_CREATION.md` - Recipe creation testing procedures
- `TESTING_RECIPE_DETAIL.md` - Recipe detail view testing procedures
