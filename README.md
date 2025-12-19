# Recipe Notebook

## Project Description

Recipe Notebook is a personal recipe management web application designed for individual home cooks who want to digitally save, organize, and retrieve their recipes. The application provides a simple, no-frills solution for managing recipe collections with core CRUD operations, basic categorization, and search capabilities.

**Value Proposition**: A straightforward, easy-to-use recipe management system that allows home cooks to quickly digitize their recipe collection and access it from any device with a browser, with special optimization for mobile devices while cooking.

## Tech Stack

### Frontend
- **React.js** - Modern UI framework for building interactive user interfaces
- **Vite** - Fast build tool optimized for modern web development
- **React Router DOM** - Client-side routing for single-page application navigation
- **React Hook Form** - Efficient form management with built-in validation
- **React Hot Toast** - Elegant toast notifications for user feedback
- **Axios** - Promise-based HTTP client for API communication

### Backend
- **Java 17** - Modern, long-term support version of Java
- **Spring Boot 3.2.1** - Production-ready application framework
- **Spring Web** - REST API development framework
- **Spring Data JPA** - Simplified data persistence with JPA/Hibernate
- **Hibernate Validator** - Declarative validation using annotations
- **BCrypt** - Industry-standard password hashing (via Spring Security Crypto)
- **JWT (JJWT)** - Secure token-based authentication
- **Lombok** - Boilerplate code reduction
- **Spring Boot DevTools** - Enhanced development experience with auto-restart

### Database
- **H2 Database** - Lightweight, file-based embedded database
- **Flyway** - Database migration management
- File location: `./data/recipes.mv.db`
- Perfect for local development and MVP deployment

### Testing
- **JUnit 5** - Modern testing framework for Java
- **Mockito** - Mocking framework for unit tests
- **Spring Boot Test** - Integration testing support
- **Vitest** - Fast unit testing for frontend components

## Getting Started Locally

### Prerequisites
Ensure you have the following installed on your system:
- **Java 17**
- **Maven 3.6+**
- **Node.js 18+**
- **npm** - Automatically included with Node.js installation

### Backend Setup

1. **Navigate to the backend directory:**
   ```bash
   cd backend
   ```

2. **Build the project:**
   ```bash
   mvn clean install
   ```

3. **Run the application:**
   ```bash
   mvn spring-boot:run
   ```

4. **Verify the backend is running:**
   - Backend API: `http://localhost:8080`
   - Health check endpoint: `http://localhost:8080/api/health`
   - H2 Console (development only): `http://localhost:8080/h2-console`
     - JDBC URL: `jdbc:h2:file:./data/recipes`
     - Username: `sa`
     - Password: (leave blank)

### Frontend Setup

1. **Navigate to the frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```

4. **Access the application:**
   - Frontend application: `http://localhost:3000`
   - The frontend automatically proxies API requests to the backend at `http://localhost:8080`

### First-Time User Setup

1. Open your browser and navigate to `http://localhost:3000`
2. Click "Register" to create a new account
3. Provide credentials:
   - Username: 3-50 characters
   - Password: minimum 6 characters
4. Upon successful registration, the system will:
   - Create 6 default categories (Breakfast, Lunch, Dinner, Dessert, Snacks, Drinks)
   - Generate one sample recipe for reference
5. You're ready to start adding your own recipes!

## Available Scripts

### Backend Scripts (Maven)

Run these commands from the `backend/` directory:

| Command | Description |
|---------|-------------|
| `mvn clean install` | Clean the build directory and install all dependencies |
| `mvn spring-boot:run` | Start the Spring Boot application in development mode |
| `mvn test` | Execute all unit and integration tests |
| `mvn clean package` | Build an executable JAR file for deployment |
| `mvn spring-boot:run -Dspring-boot.run.profiles=dev` | Run with a specific Spring profile (e.g., dev) |

### Frontend Scripts (npm)

Run these commands from the `frontend/` directory:

| Command | Description |
|---------|-------------|
| `npm install` | Install all project dependencies |
| `npm run dev` | Start Vite development server with hot module replacement |
| `npm run build` | Create optimized production build in `dist/` folder |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run ESLint to check code quality |
| `npm test` | Execute Vitest unit tests |

## Project Scope

### MVP Features

This MVP (Minimum Viable Product) focuses on delivering core recipe management functionality for individual users. The application provides essential features for digitizing and organizing a personal recipe collection.

#### 1. Authentication & Authorization
- **User Registration**: Create account with username (3-50 chars) and password (min 6 chars)
- **Secure Login**: JWT-based authentication with 24-hour token expiration
- **Password Security**: BCrypt hashing for secure password storage
- **Automatic Onboarding**: New users receive 6 default categories and 1 sample recipe

#### 2. Recipe Management (Full CRUD)
- **Create Recipes**: Add new recipes with comprehensive details:
  - Title (1-100 characters, required)
  - Difficulty level (Easy, Medium, Hard, required)
  - Cooking time in minutes (required)
  - Ingredients (minimum 1): quantity, unit, and name
  - Cooking steps (minimum 2, max 500 characters each)
  - Category assignments (minimum 1, multiple allowed)
- **View Recipes**: Mobile-optimized detail view showing all recipe information
- **Update Recipes**: Edit existing recipes with real-time validation
- **Delete Recipes**: Remove recipes with confirmation dialog to prevent accidents

#### 3. Recipe Organization & Discovery
- **Browse Recipes**: Alphabetically sorted list with recipe cards displaying:
  - Recipe title
  - Up to 2 categories (with +N indicator for additional categories)
  - Color-coded difficulty badge
  - Cooking time
- **Filter by Category**: Single or multiple category selection
- **Filter by Difficulty**: Easy, Medium, or Hard
- **Search by Name**: Partial match, case-insensitive search with debouncing
- **Pagination**: "Load More" functionality (20 recipes per page)
- **Mobile-Responsive**: Optimized layouts for phones, tablets, and desktop

#### 4. Validation & User Experience
- Real-time form validation with inline error messages
- Toast notifications for success and error states
- Loading states and skeleton screens during async operations
- Confirmation dialogs for destructive actions
- Empty state messages with clear calls-to-action

### Validation Rules Summary

| Field | Validation |
|-------|------------|
| Title | 1-100 characters (required) |
| Difficulty | Must select Easy, Medium, or Hard (required) |
| Cooking Time | Positive integer in minutes (required) |
| Ingredients | Minimum 1 required; Quantity (max 20 chars), Unit (max 20 chars), Name (max 50 chars) |
| Steps | Minimum 2 required; Maximum 500 characters per step |
| Categories | Minimum 1 required; Multiple selections allowed |

### Explicitly Out of Scope (Post-MVP)

The following features are intentionally excluded from the MVP to maintain focus and meet development timeline:

- ❌ Social features (recipe sharing, comments, likes, follows)
- ❌ Recipe photos or images
- ❌ Advanced search capabilities (by ingredients, time ranges, tags)
- ❌ Recipe ratings or reviews
- ❌ Meal planning functionality
- ❌ Shopping list generation
- ❌ Nutritional information or calorie tracking
- ❌ Multi-language support
- ❌ User profile customization
- ❌ Cloud deployment
- ❌ Custom category creation/deletion
- ❌ Recipe import/export functionality
- ❌ Print-friendly recipe view
- ❌ Recipe versioning or history

## Project Status

**Current Status**: ✅ MVP Development Complete

### Development Timeline
- **Target Duration**: 3-4 day rapid development cycle
- **Focus**: Validate core recipe management workflow with minimal feature set
- **Deployment Strategy**: Local development only (zero infrastructure costs)

### Completed Features

#### ✅ Backend Implementation
- User registration and authentication with JWT tokens
- Password hashing with BCrypt
- Full RESTful API for recipe CRUD operations
- Category management endpoints
- Search and filtering capabilities
- Health check endpoint
- H2 database with auto-generated schema
- Global exception handling
- Request/response validation
- Unit tests for critical business logic (60-70% coverage target)

#### ✅ Frontend Implementation
- User registration and login views
- Recipe list view with cards
- Recipe detail view (mobile-optimized)
- Recipe creation form with dynamic fields
- Recipe edit form with pre-populated data
- Category and difficulty filtering
- Search functionality with debouncing
- Toast notifications for user feedback
- Form validation with real-time error messages
- Confirmation dialogs for destructive actions
- Mobile-responsive layouts
- Loading states and skeleton screens

#### ✅ Integration & Testing
- Backend-frontend API integration
- Manual testing documentation
- Cross-browser compatibility verification
- Mobile device testing (iOS Safari, Android Chrome)

### Known Limitations (As Designed)

These are intentional MVP limitations, not bugs:
- H2 database (not production-ready for multi-user deployment)
- No image upload capability
- Fixed category list (no custom categories)
- Basic authentication (no OAuth, social login, or password recovery)
- No API documentation (Swagger/OpenAPI not implemented)
- Limited test coverage focused on critical paths
- Local deployment only

### Post-MVP Enhancement Roadmap

#### Phase 2: Production Readiness
- Migrate from H2 to PostgreSQL/MySQL
- Deploy to cloud platform (AWS, Azure, or Heroku)
- Set up CI/CD pipeline with GitHub Actions
- Enhance Spring Security implementation
- Add comprehensive API documentation with SpringDoc OpenAPI
- Increase test coverage to 80%+

#### Phase 3: Feature Enhancements
- Recipe image upload and display
- Advanced search (by ingredients, cooking time ranges, tags)
- Print-friendly recipe view
- Recipe import/export (JSON, PDF)
- Custom category creation and management
- Recipe ratings and favorites
- Shopping list generation from recipe ingredients

#### Phase 4: Social Features (Future Consideration)
- Recipe sharing functionality
- Public recipe discovery
- User comments and reviews
- Social authentication (Google, Facebook)

### Success Metrics

The MVP aims to validate:
- **Primary Goal**: 80% of new users successfully add at least one recipe in their first session
- **Supporting Metrics**:
  - Average time to create first recipe
  - Recipes created per user
  - Search and filter usage rates
  - Mobile vs desktop usage distribution

## License

This project is licensed under the **MIT License**.

```
MIT License

Copyright (c) 2025 annam

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

For the full license text, see the [LICENSE](LICENSE) file in the repository root.

---

**Recipe Notebook** - A simple, effective solution for managing your personal recipe collection. Happy cooking! 🍳
