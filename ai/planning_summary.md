# PRD Planning Summary - Recipe Notebook MVP

## Conversation Summary

### Decisions

1. **User Authentication & Data Model**
   - Account-based system (login required)
   - No recipe sharing between accounts
   - Recipes are private per user

2. **Category Management**
   - Categories can be deleted only if not in use by any recipe
   - System prevents deletion if recipes are tagged with that category
   - Multiple categories per recipe supported
   - Categories can be created on-the-fly during recipe creation
   - Empty categories (no recipes) are allowed
   - Categories sorted alphabetically
   - Category names: max 50 characters

3. **Recipe Data Structure**
   - Required fields: title, at least one ingredient, at least one step
   - No draft functionality in MVP
   - Title: max 200 characters, case-sensitive uniqueness per user
   - Duplicate recipe titles not allowed (case-sensitive, per user)
   - Ingredients structure:
     ```json
     {
       "quantity": "number (optional)",
       "unit": "string (optional, max 50 chars)",
       "name": "string (required, max 100 chars)"
     }
     ```
   - Steps: numbered automatically, max 1000 characters per step
   - Additional optional fields: difficulty level (Easy/Medium/Hard), prep time (minutes), cook time (minutes), creation date
   - No limits on: number of categories, ingredients, or steps per recipe
   - Serving size: beyond MVP scope

4. **Search & Filtering**
   - Title search: partial match, case-insensitive
   - Search scope: titles only (not ingredients or steps)
   - List recipes by category
   - Recipes with multiple categories appear in all relevant category lists
   - Advanced filtering (by difficulty, time): beyond MVP scope

5. **Recipe Operations**
   - Users can edit existing recipes
   - Users can delete recipes
   - Confirmation dialogs for:
     - Delete operations (destructive)
     - Navigating away with unsaved changes
   - No confirmation for save actions
   - Recipe list sorting: alphabetically by title (case-insensitive)
   - Recipe list display: flat list showing title, category tags, difficulty, prep time, cook time
   - All fields default to blank when creating new recipe

6. **User Interface**
   - Platform: Web application with responsive UI
   - No offline functionality required
   - Responsive breakpoints:
     - Mobile: <768px
     - Tablet: 768-1024px
     - Desktop: >1024px
   - Create/edit form: single page organized into logical sections (Basic Info, Ingredients, Steps, Details)
   - Category selection: tag-style input where users can type new category names (created on-the-fly) or select existing ones
   - Recipe display: title, category tags, difficulty, prep time, cook time in lists; full details in single recipe view

7. **Authentication & Security**
   - Password requirements: minimum 6 characters with at least one number
   - Session duration: 24 hours
   - Session expiry handling: show re-login modal, store draft work in browser localStorage as backup

8. **Technical Stack**
   - Frontend: React
   - Backend: Java Spring Boot
   - Database: PostgreSQL
   - Authentication: JWT tokens
   - API-first design for future extensibility

9. **Data Expectations**
   - Expected recipes per user: ~20
   - Time format: stored as integers (minutes), displayed as "X hours Y minutes"

10. **Success Measurement**
    - Unit tests for core functionality
    - Minimum test coverage: 80%+ for business logic

11. **Future Considerations (Not in MVP)**
    - Search by ingredients
    - Import/export functionality
    - Recipe sharing between users
    - Filtering by difficulty/time
    - Serving size field
    - Password reset functionality
    - Advanced authentication options

---

### Matched Recommendations

1. **Define Data Models Early**
   - ✅ Clear schemas established for Recipe and Category entities
   - Recipe: title, ingredients[], steps[], categoryIds[], difficulty, prepTime, cookTime, createdDate
   - Category: name
   - Ingredient: quantity, unit, name
   - Many-to-many relationship between Recipes and Categories

2. **Establish Technical Stack**
   - ✅ Documented: Java Spring Boot (backend), React (frontend), PostgreSQL (database), JWT authentication

3. **Prioritize MVP Features**
   - ✅ Core features ranked: Save recipe → Add category → Label recipe → List by category → Search by title

4. **Define "Done" Criteria**
   - ✅ Success criteria: User can add recipe, add category, see all recipes in selected category
   - Validated through unit tests with 80%+ coverage

5. **Plan for Future Enhancements**
   - ✅ Documented excluded features: ingredient search, import/export, sharing, advanced filtering

6. **Set Performance Benchmarks**
   - Recommended targets:
     - Page load time: <2 seconds
     - Search response time: <500ms
     - API response time: <200ms

7. **Consider Accessibility**
   - Recommended: WCAG 2.1 Level AA compliance
     - Keyboard navigation
     - Screen reader support
     - Color contrast ratios
     - Focus indicators

8. **Error Handling Strategy**
   - Recommended error responses:
     - 400: Validation errors (with field-specific messages)
     - 401: Unauthorized
     - 403: Forbidden
     - 404: Recipe/Category not found
     - 409: Duplicate recipe title conflict

9. **Validation Rules Document**
   - ✅ Comprehensive validation rules established:
     - Title: required, max 200 chars, unique per user (case-sensitive)
     - Ingredients: minimum 1, each with required name field (max 100 chars)
     - Steps: minimum 1, max 1000 chars per step
     - Categories: max 50 chars
     - Password: min 6 chars with at least one number
     - Optional fields: difficulty, prepTime, cookTime

10. **API Endpoint Specification**
    - Recommended RESTful endpoints:
      - `POST /api/recipes` (create)
      - `GET /api/recipes` (list all)
      - `GET /api/recipes/{id}` (view single)
      - `PUT /api/recipes/{id}` (edit)
      - `DELETE /api/recipes/{id}` (delete)
      - `GET /api/recipes?search={term}` (search)
      - `GET /api/recipes?categoryId={id}` (filter by category)
      - `POST /api/categories` (create)
      - `GET /api/categories` (list all)
      - `DELETE /api/categories/{id}` (delete if unused)
      - `POST /api/auth/register` (user registration)
      - `POST /api/auth/login` (user login)
      - `POST /api/auth/logout` (user logout)

11. **Security Measures**
    - ✅ Password hashing (bcrypt or similar)
    - HTTPS enforcement
    - CSRF protection
    - SQL injection prevention (use parameterized queries)
    - XSS protection
    - JWT token-based authentication

12. **User Flow Diagrams** - Key flows to document:
    - **Create Recipe Flow**: Navigate to create → Fill basic info (title) → Add ingredients (with inline create) → Add steps → Add optional details (difficulty, times) → Select/create categories → Save
    - **Edit Recipe Flow**: Select recipe → Modify fields → Navigate away triggers unsaved warning → Save changes
    - **Delete Recipe Flow**: Select recipe → Click delete → Confirmation dialog → Delete confirmed
    - **Search Flow**: Enter search term → Partial match on titles → Display results with title, categories, difficulty, times
    - **Category Filter Flow**: Select category → Display all recipes tagged with that category
    - **Category Creation**: Inline during recipe creation or separate category management

13. **Progressive Enhancement**
    - ✅ Single-page form organized into logical sections
    - Draft work stored in localStorage as backup
    - Graceful session handling with re-login modal

14. **Structured Time Input**
    - ✅ Time stored as integers (minutes)
    - Display format: "X hours Y minutes" in UI

---

### PRD Planning Summary

#### Main Functional Requirements

**1. User Management**
- User registration with email and password (min 6 chars, 1 number)
- User login/logout with JWT authentication
- 24-hour session duration with graceful expiry handling
- Private recipe storage per user (no sharing)

**2. Recipe Management**
- Create recipes with:
  - Required: title (200 chars max, unique per user), ingredients (min 1), steps (min 1)
  - Optional: difficulty (Easy/Medium/Hard), prep time (minutes), cook time (minutes)
  - Automatic: creation date
- Edit existing recipes (with unsaved changes warning)
- Delete recipes (with confirmation)
- View recipe details (full information display)
- List all recipes (flat list, alphabetically sorted)
- Recipe list displays: title, category tags, difficulty, prep time, cook time

**3. Ingredient Management**
- Add multiple ingredients per recipe
- Each ingredient: quantity (optional), unit (optional, 50 chars), name (required, 100 chars)
- Free-text entry for MVP

**4. Steps Management**
- Add multiple steps per recipe
- Automatic numbering
- Max 1000 characters per step

**5. Category Management**
- Create categories (50 chars max)
- Assign multiple categories per recipe
- Tag-style input with inline creation
- Delete categories (only if unused by recipes)
- List all categories (alphabetically sorted)
- Filter recipes by category
- Empty categories allowed

**6. Search & Discovery**
- Search recipes by title (partial match, case-insensitive)
- List all recipes in a category
- Recipes appear in all assigned category lists
- Alphabetical sorting by title

**7. User Interface**
- Responsive web design (mobile <768px, tablet 768-1024px, desktop >1024px)
- Single-page recipe create/edit form with logical sections
- Tag-style category selector
- Confirmation dialogs for destructive actions
- LocalStorage backup for unsaved work

#### Key User Stories

**US1: User Registration & Login**
- As a new user, I want to create an account so that I can save my recipes privately
- As a returning user, I want to log in so that I can access my saved recipes
- As a logged-in user, I want my session to last 24 hours so I don't have to re-login frequently

**US2: Create Recipe**
- As a user, I want to create a recipe with a title, ingredients, and steps so that I can save my favorite recipes
- As a user, I want to optionally add difficulty level, prep time, and cook time to help me plan meals
- As a user, I want to assign categories while creating a recipe so that I can organize my recipes
- As a user, I want to create new categories on-the-fly so that I don't have to leave the recipe creation flow

**US3: Manage Recipes**
- As a user, I want to edit my recipes so that I can update them as I refine them
- As a user, I want to be warned before losing unsaved changes so that I don't accidentally lose work
- As a user, I want to delete recipes I no longer need with a confirmation prompt to prevent accidental deletion
- As a user, I want to see my recipes sorted alphabetically so I can easily find them

**US4: Organize with Categories**
- As a user, I want to create categories (like "dessert", "soup", "cake") so that I can organize my recipes
- As a user, I want to assign multiple categories to a recipe so that it can belong to multiple groups
- As a user, I want to delete unused categories to keep my category list clean
- As a user, I want to be prevented from deleting categories that are in use to avoid breaking my organization

**US5: Find Recipes**
- As a user, I want to search for recipes by title so that I can quickly find a specific recipe
- As a user, I want to filter recipes by category so that I can see all recipes of a certain type
- As a user, I want search to work with partial matches so I don't have to remember exact titles

**US6: View Recipes**
- As a user, I want to see recipe lists showing title, categories, difficulty, and cooking times so I can choose what to cook
- As a user, I want to view full recipe details including all ingredients and steps when I select a recipe

#### Important Success Criteria

**Functional Success**
1. ✅ User can successfully register and log in
2. ✅ User can add a recipe with title, at least one ingredient, and at least one step
3. ✅ User can create categories
4. ✅ User can assign one or more categories to a recipe
5. ✅ User can view all recipes in a selected category
6. ✅ User can search for recipes by title (partial match)
7. ✅ User can edit existing recipes
8. ✅ User can delete recipes with confirmation
9. ✅ System prevents deletion of categories in use
10. ✅ System prevents duplicate recipe titles per user

**Technical Success**
1. Unit test coverage ≥80% for business logic
2. All validation rules enforced (required fields, character limits, uniqueness)
3. API response times <200ms for simple queries
4. Search response times <500ms
5. Page load times <2 seconds
6. Secure password storage (hashed)
7. JWT authentication working correctly
8. Session management (24-hour expiry with graceful handling)

**User Experience Success**
1. Responsive design works on mobile, tablet, and desktop
2. Unsaved changes warnings prevent data loss
3. Confirmation dialogs prevent accidental deletions
4. LocalStorage backup recovers work after session expiry
5. Alphabetical sorting makes recipes easy to find
6. Tag-style category input is intuitive
7. Single-page form is easy to complete

#### Usage Flows

**Flow 1: First-Time User Registration & Recipe Creation**
1. User navigates to application
2. User clicks "Register"
3. User enters email and password (validated: min 6 chars + 1 number)
4. System creates account and logs user in
5. User navigates to "Create Recipe"
6. User fills in Basic Info section (title - required)
7. User adds ingredients in Ingredients section (min 1, with quantity, unit, name)
8. User adds steps in Steps section (min 1, auto-numbered)
9. User optionally fills Details section (difficulty, prep time, cook time)
10. User types category name in tag input (new category created on-the-fly or existing selected)
11. User clicks "Save"
12. System validates and saves recipe
13. User redirected to recipe view or recipe list

**Flow 2: Searching and Viewing Recipe**
1. User enters search term in search box
2. System performs partial, case-insensitive match on recipe titles
3. Results displayed in list (title, categories, difficulty, times)
4. User clicks on recipe
5. Full recipe details displayed (all fields, ingredients, steps)

**Flow 3: Filtering by Category**
1. User selects category from category list/dropdown
2. System filters recipes tagged with that category
3. Filtered list displayed (alphabetically sorted)
4. Recipes with multiple categories appear in all relevant lists

**Flow 4: Editing Recipe**
1. User views recipe
2. User clicks "Edit"
3. Form populated with current values
4. User modifies fields
5. If user navigates away, warning dialog appears ("You have unsaved changes")
6. User clicks "Save"
7. System validates changes
8. Recipe updated

**Flow 5: Deleting Recipe**
1. User views recipe
2. User clicks "Delete"
3. Confirmation dialog appears ("Are you sure you want to delete this recipe?")
4. User confirms
5. Recipe deleted
6. User redirected to recipe list

**Flow 6: Category Management**
1. User navigates to categories section
2. User views all categories (alphabetically sorted)
3. User clicks "Delete" on unused category
4. Category deleted
5. OR: User tries to delete category in use
6. System shows error "Cannot delete category - recipes are using it"

---

### Unresolved Issues

**Minor Clarifications Needed:**

1. **Password Reset Flow**: Not explicitly discussed. Should be added to MVP or deferred?
   - Recommendation: Defer to post-MVP to reduce scope, but plan for it

2. **Email Validation**: Should email addresses be validated (format check, verification email)?
   - Recommendation: Format validation yes, email verification defer to post-MVP

3. **User Profile Management**: Can users change email, password, or delete account?
   - Recommendation: Basic profile editing (change password) in MVP, account deletion post-MVP

4. **Error Messages**: Specific wording for user-facing error messages not defined
   - Recommendation: Define during implementation, keep user-friendly and actionable

5. **Recipe Image/Photo**: Not mentioned - is this intentionally excluded from MVP?
   - Recommendation: Confirm this is out of scope for MVP

6. **Pagination**: With ~20 recipes expected, is pagination needed for recipe lists?
   - Recommendation: Not needed for MVP given small dataset, but design API to support future pagination

7. **Loading States**: How should the UI indicate loading during API calls?
   - Recommendation: Standard spinners/skeletons, define during UI implementation

8. **Ingredient Ordering**: Can users reorder ingredients and steps, or only add/remove?
   - Recommendation: For MVP, maintain entry order, defer drag-and-drop reordering to post-MVP

9. **Recipe Duplication**: Can users duplicate/copy an existing recipe?
   - Recommendation: Defer to post-MVP as nice-to-have feature

10. **Bulk Operations**: Can users delete multiple recipes at once, or apply categories to multiple recipes?
    - Recommendation: Defer to post-MVP, single operations sufficient for ~20 recipes

**Technical Decisions Needed:**

1. **Hosting/Deployment**: Where will the application be hosted (AWS, Azure, Heroku, etc.)?
2. **CI/CD Pipeline**: What tools for continuous integration and deployment?
3. **Development Environment Setup**: Docker, local installs, or cloud-based development?
4. **Code Repository Structure**: Monorepo or separate repos for frontend/backend?
5. **API Documentation**: What tool for API documentation (Swagger/OpenAPI, Postman, etc.)?
6. **Frontend State Management**: Redux, Context API, or other solution for React state?
7. **CSS Framework**: Tailwind CSS, Material-UI, Bootstrap, or custom CSS?
8. **Database Migration Strategy**: Flyway, Liquibase, or Spring Boot native migrations?
9. **Logging Framework**: What logging solution for backend (Logback, Log4j2, etc.)?
10. **Monitoring**: Application monitoring and error tracking tools?

**Process Decisions Needed:**

1. **Sprint Duration**: If using Agile, what sprint length?
2. **Code Review Process**: PR requirements, number of approvers, etc.?
3. **Testing Strategy**: Manual testing process, QA environment setup?
4. **Documentation Standards**: README structure, code comments, API docs?
5. **Git Branch Strategy**: Git Flow, GitHub Flow, or trunk-based development?
6. **Definition of Done**: Beyond unit tests, what else is required (code review, integration tests, documentation)?

---

## Next Steps

1. **Create Detailed PRD Document** with all decisions and requirements documented
2. **Design Database Schema** with ER diagrams for PostgreSQL
3. **Define API Specification** with complete endpoint documentation (OpenAPI/Swagger)
4. **Create UI Wireframes** for all main screens and user flows
5. **Set Up Development Environment** and project repositories
6. **Define Sprint Plan** breaking work into implementable chunks
7. **Establish Testing Framework** and write initial test cases
8. **Create Technical Architecture Document** detailing system design

---

*Document created: November 16, 2025*
*Project: Recipe Notebook MVP*
*Status: Planning Complete - Ready for PRD Development*
