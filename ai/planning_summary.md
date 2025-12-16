# Recipe Notebook MVP - Planning Summary

## Decisions

1. **Data Structure**: Ingredients will use structured fields (quantity, unit, name as separate fields). Steps will be numbered automatically with Markdown formatting support for sequential instructions.

2. **Categories**: Use 6 default categories (Breakfast, Lunch, Dinner, Dessert, Snacks, Drinks) pre-created for every new user. Custom category creation is OUT OF SCOPE for MVP.

3. **Search**: Basic title search with partial matching, case-insensitive. Search across other fields (originally planned) is DEFERRED to post-MVP to meet timeline.

4. **Performance**: Maximum 5 concurrent users, no SLAs for MVP. Pagination set to 20 recipes per page with infinite scroll or "Load More" button.

5. **List View Display**: Show title, categories (max 2 visible + count indicator), difficulty, and cooking time.

6. **Image Support**: NO image support in MVP.

7. **Difficulty Scale**: Easy/Medium/Hard, used for filtering.

8. **Cooking Time**: Single total time field in minutes.

9. **Technology Stack**: Java Spring Boot backend, React.js frontend.

10. **Resources**: Single developer, no budget, 3-4 days strict timeline.

11. **Platform Support**: Responsive design for mobile browsers and tablets (no native apps).

12. **Required Fields**: Title, ingredients (minimum 1), steps (minimum 2). No draft state - overwrite on edit.

13. **Character Limits**: Title (100 chars), Ingredient name (50 chars), Ingredient quantity (20 chars), Ingredient unit (20 chars), Step (500 chars).

14. **Success Metric**: 80% of new users successfully add at least one recipe within their first session.

15. **Deployment**: Local deployment for MVP using single executable JAR with embedded React build.

16. **Authentication**: Simple JWT-based authentication stored in sessionStorage, 24-hour session duration, minimum 6-character password requirement (no complexity rules).

17. **Database**: H2 file-based database for local deployment.

18. **Filtering**: Support multiple criteria simultaneously (category AND difficulty). Filters displayed in top bar.

19. **Default Behaviors**: Recipes sorted alphabetically. All 6 default categories auto-created for new users. One sample recipe included for new accounts.

20. **User Experience**: Confirmation dialog for recipe deletion. Call-to-action messages for empty states. Field-level validation errors shown as users type. Toast notifications for success/error messages.

21. **Testing**: Unit tests for critical business logic during development (80% coverage target). UI component tests at the end if time permits.

22. **Form Design**: Single-page recipe form with "+" button to add ingredient rows. Simple X/trash icon per row for deletion.

23. **API Structure**: RESTful conventions (GET/POST/PUT/DELETE on /api/v1/recipes, /api/v1/categories, /api/v1/auth). Standard response wrapper with status, message, data fields.

24. **Logging**: Console logging only for MVP (basic monitoring).

25. **Documentation**: README with quick-start at top, detailed setup instructions at bottom.

26. **Uniqueness**: Recipe titles NOT enforced as unique - users can have duplicate titles.

27. **Search Results**: Display mixed results from all categories (not grouped).

28. **Steps Format**: Automatic numbering implemented by system (users don't manually number).

## Matched Recommendations

1. **Use H2 Database**: Start with H2 file-based database for rapid development with zero cost, suitable for local deployment.

2. **JWT Authentication with Spring Security**: Implement stateless JWT-based authentication using Spring Security for clean React integration.

3. **Material-UI or Ant Design**: Use comprehensive React component library to accelerate UI development and ensure mobile responsiveness.

4. **Phased Development**: Day 1-2: Backend API + Auth, Day 3: Recipe CRUD + Categories, Day 4: Search + Filtering + Testing.

5. **Spring Boot Starter Validation**: Leverage Hibernate Validator annotations (@NotBlank, @Size, @Min, @Max) for consistent validation.

6. **React Hook Form**: Use for efficient form management with built-in validation to reduce boilerplate.

7. **Vite for React**: Use Vite for faster development experience and better build performance.

8. **Liquibase or Flyway**: Implement database migration tooling from start for systematic schema management.

9. **Global Exception Handling**: Use Spring's @ControllerAdvice for centralized exception handling and consistent error responses.

10. **Optimistic UI Updates**: Update UI immediately on user actions, then sync with backend for better perceived performance.

11. **SpringDoc OpenAPI**: Auto-generate API documentation for testing and future reference.

12. **Environment Variables**: Configure all environment-specific settings (database URLs, JWT secrets) through environment variables.

13. **Spring Boot DevTools**: Enable automatic restart on code changes for faster development iterations.

14. **Mobile-First Design**: Start with mobile layout in React components, enhance for desktop using responsive utilities.

15. **Seed Data Script**: Create one sample recipe to demonstrate functionality for new users.

16. **CORS Configuration**: Properly configure for local development (React on :3000, Spring Boot on :8080).

17. **Health Check Endpoint**: Add /api/health for monitoring application status.

18. **Production Profile Preparation**: Create application-prod.properties even if not used immediately.

19. **Postman Collection**: Build API request collection alongside development for quick manual testing.

20. **GitHub Issues for Tracking**: Use issues for each feature to maintain focus on remaining work.

## PRD Planning Summary

### Product Overview
Recipe Notebook is a personal recipe management web application designed to help users save, organize, and retrieve their recipes. The MVP focuses on core CRUD operations with basic categorization and search capabilities, targeting individual users who want a simple, no-frills solution for managing their recipe collection.

### Core Problem
Users need a straightforward way to digitally store and organize their recipes with basic categorization and search functionality, without the complexity of social features or advanced organization tools.

### MVP Scope (In Scope)
- User account creation and JWT-based authentication
- Create, read, update, delete recipes with structured data (title, ingredients with quantity/unit/name, numbered steps, difficulty, cooking time)
- Assign multiple pre-defined categories to recipes (Breakfast, Lunch, Dinner, Dessert, Snacks, Drinks)
- Filter recipes by category and difficulty (combinable filters)
- Search recipes by title (partial match, case-insensitive)
- List all recipes with pagination
- Responsive design for mobile/tablet browsers
- Form validation with real-time feedback
- Sample recipe for new users

### MVP Scope (Out of Scope)
- Custom category creation/editing/deletion
- Search by ingredients or other fields beyond title
- Recipe images/photos
- Import/export recipes
- Recipe sharing between users
- Public/shared recipes
- Version history or draft states
- Password reset/account recovery
- User profile management
- Offline functionality
- Native mobile apps

### User Personas
**Primary Persona**: Individual home cook
- Wants to digitize personal recipe collection
- Needs quick access while cooking (mobile/tablet)
- Values simplicity over advanced features
- Not concerned with sharing or social features

### Key User Stories
1. As a user, I want to create an account so I can securely store my recipes
2. As a user, I want to add a new recipe with ingredients and steps so I can save my favorite dishes
3. As a user, I want to categorize recipes so I can organize my collection
4. As a user, I want to search for recipes by name so I can quickly find what I need
5. As a user, I want to filter recipes by category and difficulty so I can find suitable recipes for my situation
6. As a user, I want to edit my recipes so I can update them as I refine them
7. As a user, I want to delete recipes so I can remove ones I no longer use
8. As a user, I want to view my recipes on mobile while cooking so I can follow along easily

### Technical Architecture
**Backend**: Java Spring Boot
- Spring Web (REST API)
- Spring Security (JWT authentication)
- Spring Data JPA (data persistence)
- H2 Database (file-based for local deployment)
- Hibernate Validator (validation)
- Liquibase/Flyway (database migrations)
- SpringDoc OpenAPI (API documentation)

**Frontend**: React.js
- Vite (build tool)
- Material-UI or Ant Design (component library)
- React Hook Form (form management)
- React Hot Toast (notifications)
- Axios (HTTP client)

**Deployment**: Single executable JAR with embedded frontend (local deployment)

### Data Model

**User**
- id (Long, primary key)
- username (String, unique)
- password (String, hashed)
- createdAt (Timestamp)

**Recipe**
- id (Long, primary key)
- userId (Long, foreign key)
- title (String, max 100 chars, required)
- difficulty (Enum: EASY, MEDIUM, HARD, required)
- cookingTimeMinutes (Integer, required)
- createdAt (Timestamp)
- updatedAt (Timestamp)

**Ingredient**
- id (Long, primary key)
- recipeId (Long, foreign key)
- quantity (String, max 20 chars, required)
- unit (String, max 20 chars, required)
- name (String, max 50 chars, required)
- sortOrder (Integer)

**Step**
- id (Long, primary key)
- recipeId (Long, foreign key)
- stepNumber (Integer, required)
- instruction (String, max 500 chars, required)

**Category**
- id (Long, primary key)
- name (String, required)
- isDefault (Boolean)

**RecipeCategory** (join table)
- recipeId (Long, foreign key)
- categoryId (Long, foreign key)

### API Endpoints

**Authentication**
- POST /api/v1/auth/register - Create account
- POST /api/v1/auth/login - Login (returns JWT)

**Recipes**
- GET /api/v1/recipes?page=0&size=20&sort=title&category=1&difficulty=EASY - List recipes with filters
- GET /api/v1/recipes/{id} - Get recipe details
- POST /api/v1/recipes - Create recipe
- PUT /api/v1/recipes/{id} - Update recipe
- DELETE /api/v1/recipes/{id} - Delete recipe
- GET /api/v1/recipes/search?q={query} - Search by title

**Categories**
- GET /api/v1/categories - List all categories

**Health**
- GET /api/health - Health check

**Response Format**
```json
{
  "status": "success|error",
  "message": "Human-readable message",
  "data": {}
}
```

### UI/UX Requirements

**Layout**
- Mobile-first responsive design
- Top navigation bar with filters
- Recipe list/grid view
- Recipe detail/edit view
- Login/register forms

**Recipe List View**
- Display: title, up to 2 categories (+ count if more), difficulty badge, cooking time
- Pagination: 20 per page with "Load More" or infinite scroll
- Empty state: Call-to-action to create first recipe
- Alphabetical sorting

**Recipe Form**
- Single-page form (not wizard)
- Title input (100 char limit)
- Difficulty dropdown
- Cooking time input (minutes)
- Category multi-select (checkboxes, max 2 visible + count)
- Ingredients section: Dynamic rows with + button, each row has quantity/unit/name fields and X delete icon
- Steps section: Auto-numbered text areas (500 char limit per step)
- Real-time validation with field-level error messages
- Save/Cancel buttons

**Search & Filters**
- Search bar in top navigation (debounced, partial match)
- Filter dropdowns/chips for category and difficulty
- Filters are combinable (AND logic)
- Results update in real-time

**Interactions**
- Toast notifications for success/error
- Confirmation dialog before recipe deletion
- Loading states/skeleton screens during async operations
- Optimistic UI updates where possible

### Validation Rules

**Registration**
- Username: required, 3-50 chars
- Password: required, minimum 6 chars

**Recipe**
- Title: required, 1-100 chars
- Difficulty: required, one of EASY/MEDIUM/HARD
- Cooking time: required, positive integer
- Ingredients: minimum 1 required, each with quantity/unit/name
- Steps: minimum 2 required, each 1-500 chars
- Categories: at least 1 required

### Success Metrics & KPIs

**Primary Success Metric**
- 80% of new users successfully add at least one recipe within their first session

**Supporting Metrics**
- Average time to create first recipe
- Number of recipes created per user
- Search usage rate
- Filter usage rate
- Mobile vs desktop usage ratio

**Measurement Approach**
- Basic event logging (recipe created, category assigned, search performed)
- Console logging for MVP
- Manual review of logs to calculate metrics

### Development Timeline (3-4 Days)

**Day 1-2: Backend Foundation**
- Project setup (Spring Boot Initializer)
- Database schema and migrations
- User authentication (registration, login, JWT)
- Recipe CRUD API endpoints
- Category endpoints
- Unit tests for business logic

**Day 3: Frontend Core**
- React project setup (Vite)
- Authentication UI (login/register)
- Recipe list view
- Recipe detail view
- Recipe create/edit form
- Category filtering

**Day 4: Search, Polish & Testing**
- Search implementation
- Difficulty filtering
- Combined filters
- UI component tests
- Integration testing
- Bug fixes
- README documentation
- Build single JAR deployment

### Testing Requirements

**Unit Tests (80% coverage target)**
- Business logic validation
- Authentication service
- Recipe service (CRUD operations)
- Category assignment logic
- Search functionality

**Integration Tests**
- API endpoint tests
- Database integration
- Authentication flow

**UI Component Tests (if time permits)**
- Form validation
- User interactions
- Critical user paths

**Manual Testing**
- Complete user journey (register → create recipe → search → filter → edit → delete)
- Mobile responsiveness
- Cross-browser testing (Chrome, Firefox, Safari - modern versions only)

### Risk Assessment & Mitigation

**Risk: Timeline too aggressive (3-4 days)**
- Mitigation: Strict scope adherence, deferred "search across fields" feature, skip custom categories
- Contingency: Reduce test coverage if needed, focus on critical path

**Risk: Single developer capacity**
- Mitigation: Use component libraries, code generation tools, minimize custom code
- Contingency: Extend to 5 days if absolutely necessary

**Risk: Authentication complexity**
- Mitigation: Use proven Spring Security + JWT pattern, no password reset needed
- Contingency: Simplify to basic auth if JWT proves too complex

**Risk: Form complexity (ingredients, steps)**
- Mitigation: Use React Hook Form, simple array manipulation
- Contingency: Limit maximum ingredients/steps if performance issues

**Risk: Responsive design time sink**
- Mitigation: Use component library with built-in responsiveness
- Contingency: Mobile-first approach, desktop enhancement if time permits

### Deployment Strategy

**Development Environment**
- Plain Java/Node.js installation (not Docker)
- H2 in-memory during active development for speed
- Switch to H2 file-based before final build

**Production Deployment (Local)**
- Single executable JAR file
- Embedded Tomcat server
- React build served as static resources
- H2 file-based database
- Configuration via environment variables
- Port: 8080 (backend serves both API and frontend)

**Build Process**
1. Build React frontend (npm run build)
2. Copy build artifacts to Spring Boot static resources
3. Build Spring Boot JAR (mvn clean package)
4. Run: java -jar recipe-notebook.jar

### Future Enhancements (Post-MVP)

**Phase 2 Considerations**
- Custom category creation/editing/deletion
- Search by ingredients
- Recipe images/photos
- Import/export (JSON, Recipe Schema)
- Password reset and account recovery
- Enhanced search across all fields
- Recipe tags (additional to categories)
- Favorite/bookmark recipes
- Recipe ratings
- Preparation time separate from cooking time
- Servings/yield information
- Nutritional information
- Print-friendly view
- Dark mode
- Bulk operations (delete multiple recipes)
- Recipe duplication
- Share recipes via link
- Cloud deployment option

## Unresolved Issues

None. All critical decisions for PRD creation have been made and documented above. The project is ready to proceed to detailed PRD documentation and implementation phases.
