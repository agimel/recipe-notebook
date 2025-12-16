# Product Requirements Document: Recipe Notebook MVP

**Version**: 1.0  
**Date**: December 16, 2025  
**Author**: Product Management  
**Status**: Approved

---

## 1. Product Overview

Recipe Notebook is a personal recipe management web application that enables users to digitally save, organize, and retrieve their recipes. The MVP delivers core CRUD operations with basic categorization and search capabilities, targeting individual users who need a simple, straightforward solution for managing their recipe collection without the complexity of social features or advanced organization tools.

**Value Proposition**: A no-frills, easy-to-use recipe management system that allows home cooks to quickly digitize their recipe collection and access it from any device with a browser, especially mobile devices while cooking.

---

## 2. Goals and Objectives

### Primary Goal
Enable individual users to create and manage a personal digital recipe collection with basic organization and retrieval capabilities within a 3-4 day development timeline.

### Business Objectives
1. Deliver a functional MVP with zero infrastructure cost
2. Validate core recipe management workflow and user engagement
3. Establish foundation for potential future enhancements based on user feedback

### Success Metrics
- **Primary**: 80% of new users successfully add at least one recipe within their first session
- **Supporting Metrics**:
  - Average time to create first recipe
  - Number of recipes created per user
  - Search usage rate
  - Filter usage rate
  - Mobile vs desktop usage ratio

---

## 3. Target Users/Personas

### Primary Persona: Individual Home Cook
**Profile**:
- Individual who cooks regularly at home
- Wants to digitize personal recipe collection
- Needs quick access to recipes while cooking (primarily on mobile/tablet)
- Values simplicity and ease of use over advanced features
- Not interested in sharing recipes or social features

**Pain Points**:
- Paper recipes get lost, damaged, or disorganized
- Hard to find specific recipes quickly
- Difficult to access recipes while cooking with messy hands
- No convenient way to organize recipes by meal type or difficulty

**Goals**:
- Quickly save recipes in digital format
- Easily find recipes by name or category
- Access recipes on mobile device while cooking
- Simple categorization without complex organization systems

---

## 4. User Stories and Use Cases

### Epic 1: Account Management
**US-1.1**: As a new user, I want to create an account so I can securely store my recipes  
**Acceptance Criteria**:
- User can register with username and password (minimum 6 characters)
- Username must be 3-50 characters
- Successful registration automatically creates 6 default categories
- One sample recipe is created for new accounts
- User is redirected to recipe list after registration

**US-1.2**: As a registered user, I want to log in so I can access my saved recipes  
**Acceptance Criteria**:
- User can log in with username and password
- JWT token is generated and stored in sessionStorage
- Session lasts 24 hours
- User is redirected to recipe list upon successful login

### Epic 2: Recipe Management
**US-2.1**: As a user, I want to add a new recipe with ingredients and steps so I can save my favorite dishes  
**Acceptance Criteria**:
- User can enter recipe title (required, max 100 chars)
- User can select difficulty level (Easy/Medium/Hard)
- User can enter cooking time in minutes
- User can add multiple ingredients with quantity, unit, and name
- Minimum 1 ingredient required
- User can add multiple numbered steps (minimum 2 required)
- Each step supports up to 500 characters
- User can assign one or more categories (at least 1 required)
- Form validates in real-time with field-level error messages
- Success toast notification appears after save
- User is redirected to recipe detail view after save

**US-2.2**: As a user, I want to view my recipe details so I can follow the instructions while cooking  
**Acceptance Criteria**:
- Recipe displays title, difficulty badge, cooking time
- All assigned categories are visible
- Ingredients are listed with quantity, unit, and name
- Steps are displayed with automatic numbering
- View is mobile-responsive and easy to read on small screens

**US-2.3**: As a user, I want to edit my recipes so I can update them as I refine them  
**Acceptance Criteria**:
- User can access edit mode from recipe detail view
- All existing recipe data pre-populates the form
- User can modify any field following creation validation rules
- Changes overwrite existing recipe (no draft state)
- Confirmation dialog appears if user attempts to navigate away with unsaved changes
- Success toast notification appears after save

**US-2.4**: As a user, I want to delete recipes so I can remove ones I no longer use  
**Acceptance Criteria**:
- Delete button/icon is available on recipe detail view
- Confirmation dialog appears before deletion
- Recipe and associated ingredients/steps are permanently deleted
- User is redirected to recipe list after deletion
- Success toast notification confirms deletion

### Epic 3: Recipe Organization & Discovery
**US-3.1**: As a user, I want to see all my recipes in a list so I can browse my collection  
**Acceptance Criteria**:
- Recipes are displayed in alphabetical order by title
- Each recipe card shows: title, up to 2 categories (+ count indicator if more), difficulty badge, cooking time
- List is paginated with 20 recipes per page
- "Load More" button or infinite scroll loads additional recipes
- Empty state displays call-to-action message for new users

**US-3.2**: As a user, I want to filter recipes by category so I can find suitable recipes for specific meal types  
**Acceptance Criteria**:
- Category filter dropdown/chips displayed in top bar
- User can select one or more categories
- Recipe list updates in real-time to show only matching recipes
- Filter state is visible and clearable
- Works in combination with difficulty filter

**US-3.3**: As a user, I want to filter recipes by difficulty so I can choose appropriate recipes for my skill level  
**Acceptance Criteria**:
- Difficulty filter dropdown/chips displayed in top bar
- User can select Easy, Medium, or Hard
- Recipe list updates in real-time to show only matching recipes
- Filter state is visible and clearable
- Works in combination with category filter

**US-3.4**: As a user, I want to search for recipes by name so I can quickly find what I need  
**Acceptance Criteria**:
- Search bar is visible in top navigation
- Search performs partial match, case-insensitive
- Search is debounced (waits for user to stop typing)
- Results display mixed from all categories (not grouped)
- Clear search button allows easy reset
- Empty search results show helpful message

**US-3.5**: As a user, I want to view my recipes on mobile while cooking so I can follow along easily  
**Acceptance Criteria**:
- All views are mobile-responsive
- Touch-friendly UI elements (minimum 44x44px tap targets)
- Readable font sizes on small screens
- Recipe detail view optimized for reading while cooking
- Works on mobile browsers and tablets

---

## 5. Functional Requirements

### 5.1 Authentication & Authorization
| ID | Requirement | Priority |
|----|-------------|----------|
| F-AUTH-1 | System shall provide user registration with username and password | Must Have |
| F-AUTH-2 | System shall validate username is 3-50 characters and password is minimum 6 characters | Must Have |
| F-AUTH-3 | System shall hash passwords before storage | Must Have |
| F-AUTH-4 | System shall provide login functionality with JWT token generation | Must Have |
| F-AUTH-5 | System shall store JWT in sessionStorage with 24-hour expiration | Must Have |
| F-AUTH-6 | System shall auto-create 6 default categories (Breakfast, Lunch, Dinner, Dessert, Snacks, Drinks) for new users | Must Have |
| F-AUTH-7 | System shall create one sample recipe for new user accounts | Must Have |
| F-AUTH-8 | System shall restrict recipe access to authenticated users only | Must Have |

### 5.2 Recipe Management
| ID | Requirement | Priority |
|----|-------------|----------|
| F-REC-1 | System shall allow users to create recipes with title, difficulty, cooking time, ingredients, steps, and categories | Must Have |
| F-REC-2 | System shall validate title is 1-100 characters | Must Have |
| F-REC-3 | System shall require difficulty selection (Easy, Medium, Hard) | Must Have |
| F-REC-4 | System shall require cooking time as positive integer in minutes | Must Have |
| F-REC-5 | System shall require minimum 1 ingredient, each with quantity (max 20 chars), unit (max 20 chars), and name (max 50 chars) | Must Have |
| F-REC-6 | System shall require minimum 2 steps, each with max 500 characters | Must Have |
| F-REC-7 | System shall automatically number steps sequentially | Must Have |
| F-REC-8 | System shall require at least 1 category assignment per recipe | Must Have |
| F-REC-9 | System shall allow multiple category assignments per recipe | Must Have |
| F-REC-10 | System shall allow users to view recipe details including all fields | Must Have |
| F-REC-11 | System shall allow users to edit existing recipes with same validation as creation | Must Have |
| F-REC-12 | System shall overwrite recipe on edit without maintaining draft state | Must Have |
| F-REC-13 | System shall allow users to delete recipes with confirmation dialog | Must Have |
| F-REC-14 | System shall cascade delete associated ingredients and steps when recipe is deleted | Must Have |
| F-REC-15 | System shall NOT enforce unique recipe titles | Must Have |

### 5.3 Recipe Discovery
| ID | Requirement | Priority |
|----|-------------|----------|
| F-DISC-1 | System shall display all user's recipes in alphabetical order by title | Must Have |
| F-DISC-2 | System shall paginate recipe list with 20 recipes per page | Must Have |
| F-DISC-3 | System shall support infinite scroll or "Load More" pagination UI | Must Have |
| F-DISC-4 | System shall display recipe cards with title, up to 2 categories (+ count), difficulty badge, and cooking time | Must Have |
| F-DISC-5 | System shall allow filtering by one or more categories | Must Have |
| F-DISC-6 | System shall allow filtering by difficulty level | Must Have |
| F-DISC-7 | System shall support simultaneous category AND difficulty filtering | Must Have |
| F-DISC-8 | System shall provide search by recipe title with partial match and case-insensitive logic | Must Have |
| F-DISC-9 | System shall debounce search input to optimize performance | Must Have |
| F-DISC-10 | System shall display mixed search results from all categories (not grouped) | Must Have |

### 5.4 Category Management
| ID | Requirement | Priority |
|----|-------------|----------|
| F-CAT-1 | System shall provide 6 pre-defined categories: Breakfast, Lunch, Dinner, Dessert, Snacks, Drinks | Must Have |
| F-CAT-2 | System shall list all available categories via API endpoint | Must Have |
| F-CAT-3 | System shall NOT allow custom category creation in MVP | Must Have |
| F-CAT-4 | System shall NOT allow category deletion in MVP | Must Have |

### 5.5 User Interface
| ID | Requirement | Priority |
|----|-------------|----------|
| F-UI-1 | System shall provide single-page recipe form (not wizard) | Must Have |
| F-UI-2 | System shall provide dynamic ingredient rows with + add button | Must Have |
| F-UI-3 | System shall provide X/trash icon to delete ingredient rows | Must Have |
| F-UI-4 | System shall show real-time field-level validation errors as users type | Must Have |
| F-UI-5 | System shall display toast notifications for success/error messages | Must Have |
| F-UI-6 | System shall show loading states/skeleton screens during async operations | Must Have |
| F-UI-7 | System shall implement optimistic UI updates where possible | Must Have |
| F-UI-8 | System shall display call-to-action messages for empty states | Must Have |
| F-UI-9 | System shall provide confirmation dialog before destructive actions (delete) | Must Have |

---

## 6. Non-Functional Requirements

### 6.1 Performance
| ID | Requirement | Target |
|----|-------------|--------|
| NF-PERF-1 | System shall support maximum 5 concurrent users | 5 users |
| NF-PERF-2 | Recipe list page shall load within 3 seconds on 3G connection | 3 seconds |
| NF-PERF-3 | Search results shall return within 2 seconds | 2 seconds |
| NF-PERF-4 | Form validation shall provide feedback within 500ms | 500ms |

**Note**: No SLAs enforced for MVP.

### 6.2 Security
| ID | Requirement |
|----|-------------|
| NF-SEC-1 | Passwords shall be hashed using industry-standard algorithm (BCrypt) before storage |
| NF-SEC-2 | JWT tokens shall be used for stateless authentication |
| NF-SEC-3 | API endpoints shall require valid JWT for access (except auth endpoints) |
| NF-SEC-4 | JWT tokens shall expire after 24 hours |
| NF-SEC-5 | Minimum password length shall be 6 characters (no complexity rules for MVP) |
| NF-SEC-6 | CORS shall be properly configured for local development (React :3000, Spring Boot :8080) |

### 6.3 Scalability
| ID | Requirement |
|----|-------------|
| NF-SCALE-1 | Database shall use H2 file-based storage for local deployment |
| NF-SCALE-2 | System shall support pagination to handle growing recipe collections |
| NF-SCALE-3 | Database schema shall use proper foreign keys and indexes for future growth |

### 6.4 Reliability & Availability
| ID | Requirement |
|----|-------------|
| NF-REL-1 | System shall implement global exception handling for consistent error responses |
| NF-REL-2 | System shall provide health check endpoint (/api/health) |
| NF-REL-3 | Database migrations shall use Liquibase or Flyway for systematic schema management |

### 6.5 Usability
| ID | Requirement |
|----|-------------|
| NF-USE-1 | System shall be responsive for mobile browsers and tablets |
| NF-USE-2 | System shall use mobile-first design approach |
| NF-USE-3 | UI shall provide clear feedback for all user actions |
| NF-USE-4 | Forms shall include helpful placeholder text and labels |
| NF-USE-5 | Error messages shall be clear, specific, and actionable |

### 6.6 Maintainability
| ID | Requirement |
|----|-------------|
| NF-MAINT-1 | Code shall follow RESTful API conventions |
| NF-MAINT-2 | API documentation shall be auto-generated using SpringDoc OpenAPI |
| NF-MAINT-3 | Environment-specific configuration shall use environment variables |
| NF-MAINT-4 | Codebase shall achieve 80% unit test coverage for critical business logic |

### 6.7 Compatibility
| ID | Requirement |
|----|-------------|
| NF-COMPAT-1 | System shall support modern browsers (Chrome, Firefox, Safari - latest versions) |
| NF-COMPAT-2 | System shall be accessible on mobile browsers (iOS Safari, Android Chrome) |
| NF-COMPAT-3 | System shall work on tablets (iPad, Android tablets) |

---

## 7. User Experience Requirements

### 7.1 Design Principles
1. **Mobile-First**: Start with mobile layout, enhance for desktop
2. **Simplicity**: Minimize cognitive load with clear, focused interfaces
3. **Immediate Feedback**: Provide real-time validation and status updates
4. **Progressive Disclosure**: Show only necessary information, hide complexity
5. **Consistency**: Use consistent patterns across all views

### 7.2 Layout & Navigation
- **Top Navigation Bar**: Search, filters, and primary actions
- **Recipe List View**: Grid/list of recipe cards
- **Recipe Detail/Edit View**: Single-page form with all fields visible
- **Authentication Views**: Simple centered forms for login/register

### 7.3 Recipe List View
- Title displayed prominently
- Up to 2 category badges visible (+ count indicator if more)
- Difficulty displayed as color-coded badge (Green=Easy, Yellow=Medium, Red=Hard)
- Cooking time with clock icon
- Alphabetical sorting by default
- Empty state with "Create your first recipe" call-to-action
- Pagination controls at bottom

### 7.4 Recipe Form
- Single-page layout (all fields visible, no wizard)
- Clear section headings (Basic Info, Ingredients, Steps, Categories)
- Title input with character counter (100 max)
- Difficulty dropdown with clear labels
- Cooking time number input with "minutes" label
- Category multi-select with checkboxes
- **Ingredients Section**:
  - Dynamic row addition with prominent + button
  - Each row: Quantity | Unit | Name fields
  - X/trash icon on each row for deletion
  - Minimum 1 row always visible
- **Steps Section**:
  - Auto-numbered text areas (users don't manually number)
  - Character counter per step (500 max)
  - + button to add more steps
  - Minimum 2 steps required
- Real-time validation with inline error messages
- Save and Cancel buttons clearly visible

### 7.5 Search & Filters
- Search bar in top navigation, always visible
- Placeholder text: "Search recipes..."
- Debounced input (300ms delay)
- Category filter: Dropdown or chip selection
- Difficulty filter: Dropdown or chip selection
- Active filters displayed as removable chips
- Clear all filters button when filters applied

### 7.6 Interactions & Feedback
- **Toast Notifications**: Top-right corner, auto-dismiss after 4 seconds
  - Success: Green with checkmark icon
  - Error: Red with error icon
- **Confirmation Dialogs**: Modal overlay for destructive actions
  - Clear message: "Are you sure you want to delete this recipe?"
  - Cancel and Confirm buttons
- **Loading States**: Skeleton screens for recipe list, spinner for form submissions
- **Optimistic Updates**: UI updates immediately, rollback on error
- **Form Validation**: Red border and error text below invalid fields

### 7.7 Accessibility Guidelines
- Minimum touch target size: 44x44px
- Readable font sizes (minimum 16px body text)
- Sufficient color contrast (WCAG AA minimum)
- Keyboard navigation support
- Semantic HTML structure
- Descriptive button labels

---

## 8. Technical Architecture

### 8.1 Technology Stack

**Backend**:
- Java Spring Boot
- Spring Web (REST API)
- Spring Security (JWT authentication)
- Spring Data JPA (data persistence)
- H2 Database (file-based for deployment)
- Hibernate Validator (validation with @NotBlank, @Size, @Min, @Max)
- Liquibase or Flyway (database migrations)
- SpringDoc OpenAPI (API documentation)
- Spring Boot DevTools (development auto-restart)

**Frontend**:
- React.js
- Vite (build tool for faster development)
- Material-UI or Ant Design (component library)
- React Hook Form (form management)
- React Hot Toast or similar (notifications)
- Axios (HTTP client)

**Deployment**:
- Single executable JAR file
- Embedded Tomcat server (port 8080)
- React build served as static resources from Spring Boot
- H2 file-based database

### 8.2 Data Model

**User**
- `id` (Long, primary key, auto-generated)
- `username` (String, unique, 3-50 chars)
- `password` (String, hashed with BCrypt)
- `createdAt` (Timestamp)

**Recipe**
- `id` (Long, primary key, auto-generated)
- `userId` (Long, foreign key to User)
- `title` (String, 1-100 chars, required)
- `difficulty` (Enum: EASY, MEDIUM, HARD, required)
- `cookingTimeMinutes` (Integer, positive, required)
- `createdAt` (Timestamp)
- `updatedAt` (Timestamp)

**Ingredient**
- `id` (Long, primary key, auto-generated)
- `recipeId` (Long, foreign key to Recipe, cascade delete)
- `quantity` (String, max 20 chars, required)
- `unit` (String, max 20 chars, required)
- `name` (String, max 50 chars, required)
- `sortOrder` (Integer, for maintaining order)

**Step**
- `id` (Long, primary key, auto-generated)
- `recipeId` (Long, foreign key to Recipe, cascade delete)
- `stepNumber` (Integer, required, sequential)
- `instruction` (String, 1-500 chars, required)

**Category**
- `id` (Long, primary key, auto-generated)
- `name` (String, required)
- `isDefault` (Boolean, true for system categories)

**RecipeCategory** (join table)
- `recipeId` (Long, foreign key to Recipe)
- `categoryId` (Long, foreign key to Category)
- Composite primary key (recipeId, categoryId)

### 8.3 API Endpoints

**Authentication**
- `POST /api/v1/auth/register` - Create new user account
  - Request: `{ username, password }`
  - Response: `{ status, message, data: { userId, username } }`
- `POST /api/v1/auth/login` - Authenticate user
  - Request: `{ username, password }`
  - Response: `{ status, message, data: { token, username } }`

**Recipes**
- `GET /api/v1/recipes?page=0&size=20&sort=title&category={id}&difficulty={level}` - List recipes with filters
  - Response: `{ status, message, data: { recipes: [], totalPages, currentPage } }`
- `GET /api/v1/recipes/{id}` - Get single recipe details
  - Response: `{ status, message, data: { recipe object with ingredients and steps } }`
- `POST /api/v1/recipes` - Create new recipe
  - Request: `{ title, difficulty, cookingTimeMinutes, ingredients: [], steps: [], categoryIds: [] }`
  - Response: `{ status, message, data: { recipeId } }`
- `PUT /api/v1/recipes/{id}` - Update existing recipe
  - Request: Same as POST
  - Response: `{ status, message, data: { recipeId } }`
- `DELETE /api/v1/recipes/{id}` - Delete recipe
  - Response: `{ status, message }`
- `GET /api/v1/recipes/search?q={query}` - Search recipes by title
  - Response: `{ status, message, data: { recipes: [] } }`

**Categories**
- `GET /api/v1/categories` - List all categories
  - Response: `{ status, message, data: { categories: [] } }`

**Health**
- `GET /api/health` - Application health check
  - Response: `{ status: "UP" }`

**Standard Response Format**:
```json
{
  "status": "success|error",
  "message": "Human-readable message",
  "data": {}
}
```

### 8.4 Configuration Management
- All environment-specific settings via environment variables
- JWT secret stored as environment variable
- Database connection settings configurable
- CORS configuration for development (React :3000, Spring Boot :8080)
- Production profile preparation (application-prod.properties)

---

## 9. Success Metrics

### 9.1 Primary Success Metric
**Target**: 80% of new users successfully add at least one recipe within their first session

**Measurement**:
- Track `user_registered` event
- Track `recipe_created` event
- Calculate: (Users with recipe_created in first session / Total users_registered) * 100

### 9.2 Supporting KPIs

| Metric | Target | Measurement Method |
|--------|--------|-------------------|
| Average time to create first recipe | < 5 minutes | Time between registration and first recipe_created event |
| Recipes per user | ≥ 3 recipes | Average count of recipes per user after 1 week |
| Search usage rate | ≥ 40% of users | % of users who perform at least one search |
| Filter usage rate | ≥ 50% of users | % of users who apply at least one filter |
| Mobile vs desktop usage | ≥ 60% mobile | % of sessions from mobile user agents |
| Recipe edit rate | ≥ 20% of recipes | % of recipes that have been edited at least once |

### 9.3 Measurement Approach
- Basic event logging to console for MVP
- Manual review and aggregation of logs
- Events to track:
  - `user_registered`
  - `recipe_created`
  - `recipe_viewed`
  - `recipe_edited`
  - `recipe_deleted`
  - `search_performed`
  - `filter_applied`
  - `category_selected`

**Note**: Post-MVP consideration for analytics integration (e.g., Google Analytics, Mixpanel)

---

## 10. Assumptions and Constraints

### 10.1 Assumptions
1. Users have access to modern web browsers (Chrome, Firefox, Safari - latest versions)
2. Users have stable internet connection for API calls
3. Users are comfortable with basic web application interactions
4. Single user per account (no multi-user or sharing features needed)
5. Recipes are primarily text-based (no images required)
6. Users will manage relatively small recipe collections (< 1000 recipes per user)
7. Local deployment is acceptable for MVP
8. 24-hour session duration is sufficient
9. Users will not need to recover forgotten passwords in MVP
10. Default categories cover most common use cases

### 10.2 Constraints
1. **Timeline**: Strict 3-4 day development window
2. **Resources**: Single developer, no additional team members
3. **Budget**: Zero infrastructure cost (no cloud hosting, paid services)
4. **Capacity**: Maximum 5 concurrent users (MVP limitation)
5. **Technology**: Plain Java/Node.js installation (no Docker or complex infrastructure)
6. **Testing**: Limited to unit tests for critical paths and manual testing
7. **Deployment**: Local deployment only (single JAR file)
8. **Database**: H2 file-based database (not production-grade RDBMS)
9. **Authentication**: No password reset or account recovery mechanism
10. **Browser Support**: Modern browsers only, no IE11 or legacy support

---

## 11. Out of Scope

The following features and capabilities are explicitly **excluded** from the MVP and may be considered for future phases:

### 11.1 Recipe Features
- ❌ Recipe images/photos
- ❌ Import/export recipes (JSON, Recipe Schema, etc.)
- ❌ Recipe sharing between users
- ❌ Public or shared recipes
- ❌ Recipe version history
- ❌ Draft state for recipes
- ❌ Recipe duplication/cloning
- ❌ Recipe ratings or reviews
- ❌ Favorite/bookmark recipes
- ❌ Recipe tags (additional to categories)
- ❌ Servings/yield information
- ❌ Nutritional information
- ❌ Preparation time separate from cooking time
- ❌ Print-friendly view
- ❌ Recipe source/attribution

### 11.2 Search & Organization
- ❌ Search by ingredients
- ❌ Search across fields other than title
- ❌ Advanced search with operators
- ❌ Custom category creation/editing/deletion
- ❌ Category hierarchies or subcategories
- ❌ Saved searches or smart collections
- ❌ Bulk operations (delete/edit multiple recipes)

### 11.3 User Account Features
- ❌ Password reset/recovery
- ❌ Email verification
- ❌ User profile management
- ❌ Profile pictures
- ❌ Account settings/preferences
- ❌ Account deletion
- ❌ Multi-user/family accounts
- ❌ OAuth/social login

### 11.4 Technical Features
- ❌ Offline functionality/PWA
- ❌ Native mobile apps (iOS/Android)
- ❌ Cloud deployment
- ❌ Database migration from H2 to production RDBMS
- ❌ Automated backups
- ❌ Data encryption at rest
- ❌ Advanced monitoring/analytics
- ❌ Email notifications
- ❌ API rate limiting
- ❌ Dark mode/theming

### 11.5 UI/UX Features
- ❌ Recipe detail view customization
- ❌ Custom sorting options
- ❌ Grid vs list view toggle
- ❌ Recipe card customization
- ❌ Keyboard shortcuts
- ❌ Undo/redo functionality
- ❌ Accessibility compliance (beyond basic HTML semantics)

---

## 12. Timeline and Milestones

### Development Schedule: 3-4 Days

#### **Day 1-2: Backend Foundation** (16-20 hours)
**Milestone**: Functional REST API with authentication

- ✅ Project setup using Spring Boot Initializer
- ✅ Database schema design and Liquibase/Flyway migrations
- ✅ User entity and authentication service implementation
- ✅ JWT generation and validation
- ✅ Recipe CRUD API endpoints
- ✅ Category API endpoints
- ✅ Global exception handling (@ControllerAdvice)
- ✅ Validation annotations on entities
- ✅ Unit tests for business logic (80% coverage target)
- ✅ SpringDoc OpenAPI integration
- ✅ Health check endpoint

**Deliverable**: Working backend API testable via Postman

#### **Day 3: Frontend Core** (8-12 hours)
**Milestone**: Functional UI for core user journeys

- ✅ React project setup with Vite
- ✅ Component library integration (Material-UI or Ant Design)
- ✅ Authentication UI (login/register forms)
- ✅ Recipe list view with pagination
- ✅ Recipe detail view
- ✅ Recipe create/edit form with dynamic ingredients/steps
- ✅ Category multi-select implementation
- ✅ Form validation with React Hook Form
- ✅ Toast notification integration
- ✅ Basic routing setup

**Deliverable**: Working UI for create, view, list recipes

#### **Day 4: Search, Filters, Polish & Testing** (8-12 hours)
**Milestone**: Complete MVP ready for deployment

- ✅ Search implementation (frontend + backend)
- ✅ Category filtering
- ✅ Difficulty filtering
- ✅ Combined filter logic
- ✅ Mobile responsiveness verification
- ✅ Optimistic UI updates
- ✅ Loading states and skeleton screens
- ✅ Empty states with call-to-action
- ✅ Integration testing critical paths
- ✅ UI component tests (if time permits)
- ✅ Bug fixes and polish
- ✅ README documentation
- ✅ Build frontend and embed in Spring Boot JAR
- ✅ Final testing of single JAR deployment

**Deliverable**: Single executable JAR file with complete functionality

### Key Decision Points
- **End of Day 1**: Backend API functional? If not, extend backend work into Day 2 morning
- **End of Day 2**: API complete with tests? If not, reduce test coverage or defer UI component tests
- **End of Day 3**: Core UI functional? If not, prioritize create/list over edit/delete
- **Morning Day 4**: On track for completion? If not, cut UI component tests and focus on integration testing

---

## 13. Dependencies

### 13.1 Technical Dependencies

**Backend Dependencies** (Maven):
- `spring-boot-starter-web` - REST API framework
- `spring-boot-starter-security` - Authentication/authorization
- `spring-boot-starter-data-jpa` - Data persistence
- `spring-boot-starter-validation` - Bean validation
- `h2` - Embedded database
- `jjwt` (Java JWT) - JWT token generation/validation
- `liquibase-core` or `flyway-core` - Database migrations
- `springdoc-openapi-ui` - API documentation
- `spring-boot-devtools` - Development auto-restart
- `spring-boot-starter-test` - Testing framework
- `lombok` (optional) - Reduce boilerplate code

**Frontend Dependencies** (npm):
- `react` & `react-dom` - UI framework
- `vite` - Build tool
- `@mui/material` or `antd` - Component library
- `react-hook-form` - Form management
- `react-hot-toast` or `react-toastify` - Notifications
- `axios` - HTTP client
- `react-router-dom` - Routing
- `@tanstack/react-query` (optional) - Server state management

### 13.2 External Dependencies
- **None** - MVP is fully self-contained with no external APIs or services

### 13.3 Environment Prerequisites
- **Development Machine**:
  - Java JDK 17 or higher
  - Node.js 18 or higher
  - npm or yarn
  - Git (for version control)
  - IDE (IntelliJ IDEA, VS Code, or similar)
  - Modern web browser for testing

- **Deployment Machine**:
  - Java JRE 17 or higher
  - Sufficient disk space for H2 database file

### 13.4 Knowledge Dependencies
- Developer must have:
  - Proficiency in Java and Spring Boot
  - Proficiency in React.js
  - Understanding of JWT authentication
  - Understanding of REST API design
  - Basic understanding of H2 database
  - Familiarity with responsive design principles

---

## 14. Testing Requirements

### 14.1 Unit Testing

**Backend Unit Tests** (Target: 80% coverage)
- **Authentication Service**:
  - User registration validation
  - Password hashing
  - JWT token generation
  - JWT token validation
  - Login success/failure scenarios
- **Recipe Service**:
  - Create recipe with valid data
  - Create recipe with invalid data (missing fields)
  - Update recipe
  - Delete recipe (cascade to ingredients/steps)
  - Pagination logic
- **Search & Filter Service**:
  - Title search partial matching
  - Case-insensitive search
  - Category filtering
  - Difficulty filtering
  - Combined filters (AND logic)
- **Validation**:
  - Field length constraints
  - Required field validation
  - Minimum ingredient/step requirements

**Frontend Unit Tests** (If time permits)
- **Form Validation**:
  - Recipe form field validation
  - Ingredient row addition/deletion
  - Step addition with auto-numbering
- **Components**:
  - Recipe card rendering
  - Toast notification display
  - Confirmation dialog

### 14.2 Integration Testing

**API Integration Tests**:
- Full user journey: Register → Login → Create recipe → View recipe → Edit → Delete
- Authentication flow with JWT
- Recipe creation with categories
- Search functionality
- Filter functionality
- Pagination

**Database Integration Tests**:
- Recipe cascade delete (ingredients/steps removed)
- Category assignment (many-to-many)
- User isolation (recipes only visible to owner)

### 14.3 Manual Testing

**Critical User Paths**:
1. New user registration and login
2. Create first recipe with multiple ingredients and steps
3. Search for recipe by title
4. Filter recipes by category
5. Filter recipes by difficulty
6. Apply combined filters (category + difficulty)
7. Edit existing recipe
8. Delete recipe with confirmation
9. View recipe on mobile device
10. Test all validation error scenarios

**Cross-Browser Testing**:
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Mobile Safari (iOS)
- Chrome Mobile (Android)

**Responsive Testing**:
- Mobile phone (320px - 480px)
- Tablet (768px - 1024px)
- Desktop (1280px+)

### 14.4 Testing Tools
- **Backend**: JUnit 5, Mockito, Spring Boot Test
- **Frontend**: Vitest or Jest, React Testing Library (if time permits)
- **API Testing**: Postman collection for manual testing
- **Browser Testing**: Chrome DevTools device emulation

### 14.5 Testing Contingency
If timeline is at risk:
1. Prioritize backend unit tests (80% coverage mandatory)
2. Focus integration tests on critical path only
3. Defer frontend unit tests to post-MVP
4. Rely on thorough manual testing for UI

---

## 15. Development Best Practices

### 15.1 Code Quality
- Use Spring Boot Starter Validation with Hibernate Validator annotations
- Implement global exception handling with @ControllerAdvice
- Follow RESTful API conventions
- Use meaningful variable and function names
- Keep components small and focused
- Avoid code duplication (DRY principle)

### 15.2 Performance Optimization
- Implement optimistic UI updates for better perceived performance
- Debounce search input (300ms delay)
- Use pagination to limit data transfer
- Lazy load recipe details (don't fetch all recipes with full details)
- Index database fields used in search/filtering

### 15.3 Development Workflow
- Use Spring Boot DevTools for automatic restart on code changes
- Enable CORS for local development (React :3000, Spring Boot :8080)
- Use Vite for fast hot module replacement
- Create Postman collection alongside development
- Track features with GitHub Issues or similar

### 15.4 Configuration Management
- Store all environment-specific settings in environment variables
- Use application.properties for defaults
- Create application-prod.properties for production profile
- Never commit secrets or credentials to version control
- Document all environment variables in README

### 15.5 Documentation
- README with quick-start instructions at top
- Detailed setup instructions for development and deployment
- API documentation auto-generated with SpringDoc OpenAPI
- Inline code comments for complex logic only
- Document assumptions and design decisions

---

## 16. Deployment Strategy

### 16.1 Build Process
1. Build React frontend:
   ```bash
   cd frontend
   npm run build
   ```
2. Copy build artifacts to Spring Boot static resources:
   ```bash
   cp -r dist/* ../backend/src/main/resources/static/
   ```
3. Build Spring Boot JAR:
   ```bash
   cd ../backend
   mvn clean package -DskipTests
   ```
4. Output: `recipe-notebook.jar` in `target/` directory

### 16.2 Deployment (Local)
1. Ensure Java 17+ is installed
2. Run the JAR:
   ```bash
   java -jar recipe-notebook.jar
   ```
3. Access application at `http://localhost:8080`
4. H2 database file created automatically in application directory

### 16.3 Environment Configuration
Environment variables (optional, with defaults):
- `JWT_SECRET` - Secret key for JWT signing (default: auto-generated)
- `DB_PATH` - H2 database file path (default: `./data/recipes`)
- `SERVER_PORT` - Application port (default: 8080)
- `LOG_LEVEL` - Logging level (default: INFO)

### 16.4 Database Management
- H2 file-based database stored at `./data/recipes.mv.db`
- Database created automatically on first run
- Liquibase/Flyway migrations run automatically on startup
- No manual database setup required

### 16.5 Monitoring
- Console logging for MVP
- Health check endpoint: `GET /api/health`
- Basic error logging to console
- No external monitoring tools required

---

## 17. Risks and Mitigation

### 17.1 Schedule Risks

| Risk | Probability | Impact | Mitigation | Contingency |
|------|------------|--------|------------|-------------|
| 3-4 day timeline too aggressive | HIGH | HIGH | Strict scope adherence, use component libraries, minimize custom code | Extend to 5 days if absolutely necessary |
| Backend development takes longer than expected | MEDIUM | HIGH | Prioritize core CRUD over advanced features, reduce test coverage if needed | Defer search/filter to Day 4 |
| Frontend form complexity causes delays | MEDIUM | MEDIUM | Use React Hook Form for efficiency, leverage component library | Simplify ingredient/step UI if needed |
| Integration testing reveals major issues | MEDIUM | HIGH | Continuous integration testing during development, not just at end | Focus on critical path fixes only |

### 17.2 Technical Risks

| Risk | Probability | Impact | Mitigation | Contingency |
|------|------------|--------|------------|-------------|
| JWT authentication implementation complexity | LOW | MEDIUM | Use proven Spring Security + JWT pattern, reference documentation | Simplify to basic auth if JWT proves too complex |
| H2 database limitations discovered | LOW | MEDIUM | Test database operations early, use proper JPA relationships | Switch to in-memory H2 if file-based has issues |
| Mobile responsiveness issues | MEDIUM | MEDIUM | Use component library with built-in responsiveness, test early and often | Mobile-first approach, desktop enhancement if time permits |
| Performance issues with pagination | LOW | LOW | Test with realistic data volumes early | Reduce page size or simplify queries |

### 17.3 Scope Risks

| Risk | Probability | Impact | Mitigation | Contingency |
|------|------------|--------|------------|-------------|
| Feature creep during development | MEDIUM | HIGH | Maintain strict scope discipline, refer to PRD for decisions | Document new ideas for post-MVP, do not implement |
| Complexity of dynamic ingredient/step forms | MEDIUM | MEDIUM | Use React Hook Form field arrays | Limit maximum ingredients/steps if performance issues |
| Search functionality more complex than expected | LOW | MEDIUM | Keep search simple (title only, partial match) | Defer to post-MVP if timeline at risk |

### 17.4 Resource Risks

| Risk | Probability | Impact | Mitigation | Contingency |
|------|------------|--------|------------|-------------|
| Single developer illness or unavailability | LOW | HIGH | None (MVP risk acceptance) | Delay delivery if absolutely necessary |
| Developer unfamiliarity with technology | LOW | HIGH | Ensure developer has Java/Spring Boot and React experience | Provide quick-start tutorials and documentation |

### 17.5 Quality Risks

| Risk | Probability | Impact | Mitigation | Contingency |
|------|------------|--------|------------|-------------|
| Insufficient test coverage | MEDIUM | MEDIUM | Prioritize unit tests for critical business logic (80% target) | Reduce coverage to 60% if timeline at risk |
| Bugs discovered late in development | MEDIUM | MEDIUM | Continuous manual testing during development | Focus on critical path bug fixes only |
| Poor user experience on mobile | LOW | HIGH | Mobile-first design, test on real devices throughout | Simplify mobile UI if needed |

---

## 18. Open Questions and Assumptions to Validate

### 18.1 Resolved
All critical questions have been addressed in the planning session. No open questions remain for MVP development.

### 18.2 Future Considerations (Post-MVP)
The following questions should be revisited after MVP validation:

1. **Custom Categories**: Do users need to create their own categories, or are 6 defaults sufficient?
2. **Search Scope**: Is title-only search sufficient, or do users need ingredient search?
3. **Recipe Images**: How important are images to user experience?
4. **Sharing Features**: Is there demand for sharing recipes with other users?
5. **Cloud Deployment**: Would users prefer cloud-hosted version over local deployment?
6. **Mobile App**: Is responsive web sufficient, or do users want native mobile apps?
7. **Import/Export**: Do users need to import existing recipes or export for backup?
8. **Advanced Organization**: Do users need tags, favorites, or other organization beyond categories?

---

## 19. Approval and Sign-off

### 19.1 Document History
| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | December 16, 2025 | Product Management | Initial PRD based on MVP and planning documents |

### 19.2 Approvals Required
- [ ] Product Owner
- [ ] Development Lead
- [ ] Stakeholder Sign-off

### 19.3 Document Status
**Status**: Draft - Pending Approval

---

## Appendix A: Default Categories

The following 6 categories are pre-created for every new user:

1. **Breakfast** - Morning meals, brunch items
2. **Lunch** - Midday meals, light dishes
3. **Dinner** - Evening meals, main courses
4. **Dessert** - Sweet treats, desserts, baked goods
5. **Snacks** - Quick bites, appetizers, finger foods
6. **Drinks** - Beverages, smoothies, cocktails

All categories have `isDefault: true` flag. Custom category creation is deferred to post-MVP.

---

## Appendix B: Sample Recipe (Auto-created for New Users)

**Title**: Classic Chocolate Chip Cookies  
**Difficulty**: Easy  
**Cooking Time**: 25 minutes  
**Categories**: Dessert, Snacks  

**Ingredients**:
1. 2 1/4 cups - all-purpose flour
2. 1 tsp - baking soda
3. 1 tsp - salt
4. 1 cup - butter (softened)
5. 3/4 cup - granulated sugar
6. 3/4 cup - packed brown sugar
7. 2 - large eggs
8. 2 tsp - vanilla extract
9. 2 cups - chocolate chips

**Steps**:
1. Preheat your oven to 375°F (190°C).
2. Combine flour, baking soda, and salt in a small bowl.
3. Beat butter and both sugars in a large bowl until creamy.
4. Add eggs and vanilla extract to butter mixture and beat well.
5. Gradually blend in flour mixture.
6. Stir in chocolate chips.
7. Drop rounded tablespoons of dough onto ungreased baking sheets.
8. Bake for 9-11 minutes or until golden brown.
9. Cool on baking sheets for 2 minutes, then remove to wire racks.

---

## Appendix C: API Response Examples

### Successful Recipe Creation
```json
{
  "status": "success",
  "message": "Recipe created successfully",
  "data": {
    "recipeId": 42
  }
}
```

### Validation Error
```json
{
  "status": "error",
  "message": "Validation failed",
  "data": {
    "errors": {
      "title": "Title is required",
      "ingredients": "At least one ingredient is required"
    }
  }
}
```

### Recipe List Response
```json
{
  "status": "success",
  "message": "Recipes retrieved successfully",
  "data": {
    "recipes": [
      {
        "id": 1,
        "title": "Classic Chocolate Chip Cookies",
        "difficulty": "EASY",
        "cookingTimeMinutes": 25,
        "categories": [
          { "id": 4, "name": "Dessert" },
          { "id": 5, "name": "Snacks" }
        ]
      }
    ],
    "totalPages": 5,
    "currentPage": 0,
    "totalRecipes": 87
  }
}
```

---

## Appendix D: Glossary

- **JWT (JSON Web Token)**: A compact, URL-safe means of representing claims to be transferred between two parties for authentication
- **MVP (Minimum Viable Product)**: The simplest version of a product that can be released to validate core assumptions
- **CRUD**: Create, Read, Update, Delete - basic database operations
- **H2 Database**: Java-based lightweight relational database, can run embedded in applications
- **Spring Boot**: Java framework for building production-ready applications with minimal configuration
- **React**: JavaScript library for building user interfaces
- **Vite**: Modern frontend build tool that provides fast development experience
- **Optimistic UI Update**: UI is updated immediately before server confirmation, improving perceived performance
- **Debounce**: Delay execution until user stops performing an action for a specified time
- **Cascade Delete**: Automatically delete related records when parent record is deleted
- **RESTful API**: API design that follows REST (Representational State Transfer) architectural principles
- **Responsive Design**: Web design approach that adapts layout to different screen sizes
- **Mobile-First**: Design approach that starts with mobile layout and progressively enhances for larger screens

---

**END OF DOCUMENT**
