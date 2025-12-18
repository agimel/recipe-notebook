# Recipe Notebook

## Project Description

Recipe Notebook is a personal recipe management web application that enables users to digitally save, organize, and retrieve their recipes. This MVP delivers core CRUD operations with basic categorization and search capabilities, targeting individual users who need a simple, straightforward solution for managing their recipe collection without the complexity of social features or advanced organization tools.

**Value Proposition**: A no-frills, easy-to-use recipe management system that allows home cooks to quickly digitize their recipe collection and access it from any device with a browser, especially mobile devices while cooking.

## Tech Stack

### Frontend
- **React.js** - UI framework
- **Vite** - Build tool for faster development
- **React Router DOM** - Client-side routing
- **React Hook Form** - Form management with validation
- **React Hot Toast** - Toast notifications
- **Axios** - HTTP client for API communication

### Backend
- **Java 17** - Programming language
- **Spring Boot 3.2.1** - Application framework
- **Spring Web** - REST API framework
- **Spring Data JPA** - Data persistence layer
- **Hibernate Validator** - Bean validation
- **BCrypt** - Password hashing via Spring Security Crypto
- **JWT (JJWT)** - Token-based authentication
- **Lombok** - Reduce boilerplate code
- **Spring Boot DevTools** - Development auto-restart

### Database
- **H2 Database** - File-based embedded database
- Auto-DDL enabled for automatic schema generation
- File location: `./data/recipes.mv.db`

### Testing
- **JUnit 5** - Backend unit testing framework
- **Mockito** - Mocking dependencies
- **Spring Boot Test** - Integration testing support
- **Vitest** - Frontend testing framework

## Getting Started Locally

### Prerequisites
- **Java 17 or higher** - [Download here](https://adoptium.net/)
- **Maven 3.6+** - [Download here](https://maven.apache.org/download.cgi) (or use Maven wrapper included)
- **Node.js 18+** - [Download here](https://nodejs.org/)
- **npm** - Comes with Node.js

### Backend Setup

1. **Navigate to the backend directory:**
   ```bash
   cd backend
   ```

2. **Build the project:**
   ```bash
   ./mvnw clean install
   ```
   Or on Windows:
   ```bash
   mvnw.cmd clean install
   ```

3. **Run the application:**
   ```bash
   ./mvnw spring-boot:run
   ```
   Or on Windows:
   ```bash
   mvnw.cmd spring-boot:run
   ```

4. **Verify the backend is running:**
   - The server will start on `http://localhost:8080`
   - Health check endpoint: `http://localhost:8080/api/health`
   - H2 Console (development only): `http://localhost:8080/h2-console`

### Frontend Setup

1. **Navigate to the frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Run the development server:**
   ```bash
   npm run dev
   ```

4. **Access the application:**
   - Open your browser to `http://localhost:3000`
   - The frontend will proxy API requests to the backend at `http://localhost:8080`

### First-Time User Setup

1. Navigate to `http://localhost:3000`
2. Click "Register" to create a new account
3. Enter a username (3-50 characters) and password (minimum 6 characters)
4. Upon successful registration, you will:
   - Be automatically logged in
   - Have 6 default categories created (Breakfast, Lunch, Dinner, Dessert, Snacks, Drinks)
   - See one sample recipe in your collection
5. Start adding your own recipes!

## Available Scripts

### Backend Scripts (Maven)

| Command | Description |
|---------|-------------|
| `./mvnw clean install` | Clean build directory and install dependencies |
| `./mvnw spring-boot:run` | Run the Spring Boot application |
| `./mvnw test` | Run unit and integration tests |
| `./mvnw clean package` | Build executable JAR file |
| `./mvnw spring-boot:run -Dspring-boot.run.profiles=dev` | Run with development profile |

### Frontend Scripts (npm)

| Command | Description |
|---------|-------------|
| `npm install` | Install all dependencies |
| `npm run dev` | Start Vite development server with hot reload |
| `npm run build` | Build production-ready static files |
| `npm run preview` | Preview production build locally |
| `npm run lint` | Lint code with ESLint |
| `npm test` | Run Vitest tests |

## Project Scope

### Core Features (MVP)

#### Authentication & Authorization
- User registration with username and password
- Secure login with JWT token generation (24-hour expiration)
- Password hashing with BCrypt
- Automatic creation of default categories for new users
- Sample recipe created for new accounts

#### Recipe Management
- **Create**: Add new recipes with title, difficulty, cooking time, ingredients, steps, and categories
- **Read**: View recipe details including all fields in a mobile-friendly format
- **Update**: Edit existing recipes with real-time validation
- **Delete**: Remove recipes with confirmation dialog

#### Recipe Organization & Discovery
- Browse all recipes in alphabetical order
- Filter recipes by category (multiple selection supported)
- Filter recipes by difficulty level (Easy, Medium, Hard)
- Search recipes by name (partial match, case-insensitive)
- Mobile-responsive design optimized for cooking on tablets and phones
- Pagination with "Load More" functionality

### Validation Rules
- **Title**: 1-100 characters (required)
- **Difficulty**: Easy, Medium, or Hard (required)
- **Cooking Time**: Positive integer in minutes (required)
- **Ingredients**: Minimum 1 required
  - Quantity: Max 20 characters
  - Unit: Max 20 characters
  - Name: Max 50 characters
- **Steps**: Minimum 2 required, max 500 characters each
- **Categories**: At least 1 required, multiple allowed

### Out of Scope (Post-MVP)
- Social features (sharing, comments, likes)
- Recipe photos/images
- Advanced search (by ingredients, cooking time range)
- Recipe ratings or reviews
- Meal planning or shopping lists
- Nutritional information
- Multi-language support
- User profile customization
- Cloud deployment
- Database migrations (Liquibase/Flyway)
- Comprehensive API documentation (OpenAPI/Swagger)

## Project Status

**Current Status**: MVP Development Complete

### Implemented Features
- ✅ User registration and login with JWT authentication
- ✅ Full recipe CRUD operations
- ✅ Category and difficulty filtering
- ✅ Recipe search functionality
- ✅ Mobile-responsive UI
- ✅ Form validation with real-time feedback
- ✅ Toast notifications for user actions
- ✅ H2 database with auto-generated schema
- ✅ Backend unit tests for core services
- ✅ Manual testing documentation

### Next Steps (Post-MVP Enhancements)
- Add recipe images/photos
- Implement comprehensive frontend testing
- Add SpringDoc OpenAPI documentation
- Set up CI/CD pipeline with GitHub Actions
- Migrate from H2 to PostgreSQL for production
- Deploy to cloud platform (AWS, Azure, or Heroku)
- Add Liquibase/Flyway for database migrations
- Implement Spring Security framework for enhanced security

### Development Timeline
- **Target**: 3-4 day MVP development
- **Focus**: Core recipe management workflow validation
- **Deployment**: Local development only (no infrastructure costs)

## License

This project is licensed under the MIT License.

Copyright (c) 2025 annam

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
