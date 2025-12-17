# Recipe Notebook REST API Plan

**Version**: 1.0  
**Date**: December 17, 2025  
**Status**: Ready for Implementation

---

## 1. Assumptions

Based on the database schema, PRD, and tech stack, the following assumptions guide this API design:

1. **Authentication Mechanism**: JWT-based authentication without full Spring Security framework (simplified implementation for MVP timeline)
2. **Token Storage**: JWT tokens stored client-side in sessionStorage with 24-hour expiration
3. **Session Management**: No server-side session tracking or token blacklist for MVP
4. **API Versioning**: Version 1 API under `/api/v1/` namespace for future compatibility
5. **Response Format**: Consistent JSON response envelope with `status`, `message`, and `data` fields
6. **Error Handling**: Global exception handler returns consistent error format across all endpoints
7. **User Isolation**: All recipe operations automatically filtered by authenticated user's ID (row-level security)
8. **Pagination**: Default page size of 20 recipes, using Spring Data's PageRequest
9. **Sorting**: Default alphabetical sorting by recipe title
10. **Filtering**: Multiple filters applied with AND logic (e.g., category AND difficulty)
11. **Search**: Case-insensitive partial match on recipe title only
12. **Validation**: Hibernate Validator annotations on DTOs with field-level error messages
13. **CORS**: Enabled for local development (React on :3000, Spring Boot on :8080)
14. **Content Type**: All requests and responses use `application/json`
15. **ID Format**: All entity IDs are Long (BIGINT) type
16. **Continuous Numbering**: Step numbers and ingredient sort orders managed automatically by backend
17. **Category Management**: Categories are read-only in MVP (no create/update/delete)
18. **Sample Data**: New user registration automatically creates 6 default categories and 1 sample recipe

---

## 2. Authentication & Authorization

### 2.1 Authentication Strategy

**Mechanism**: JWT (JSON Web Token) with simplified implementation

**Flow**:
1. User submits credentials to `/api/v1/auth/login`
2. Backend validates credentials against BCrypt hashed password
3. On success, generate JWT with userId and username claims
4. Return JWT to client
5. Client stores JWT in sessionStorage
6. Client includes JWT in `Authorization: Bearer <token>` header for subsequent requests
7. Backend validates JWT on protected endpoints and extracts userId

**JWT Structure**:
```json
{
  "sub": "username",
  "userId": 123,
  "iat": 1702825200,
  "exp": 1702911600
}
```

**JWT Configuration**:
- Secret key: Environment variable `JWT_SECRET`
- Algorithm: HS256
- Expiration: 24 hours from issuance
- Claims: `sub` (username), `userId`, `iat` (issued at), `exp` (expiration)

### 2.2 Authorization Strategy

**User Isolation**: All recipe endpoints enforce row-level security by filtering on `userId` extracted from JWT

**Implementation Pattern**:
```java
// Extract userId from JWT in controller
Long authenticatedUserId = jwtService.extractUserId(token);

// Pass to service layer for filtering
recipeService.findByUserId(authenticatedUserId);
```

**Protected Endpoints**: All endpoints under `/api/v1/recipes` and `/api/v1/categories` require valid JWT

**Public Endpoints**: Only `/api/v1/auth/register`, `/api/v1/auth/login`, and `/api/health` are accessible without JWT

### 2.3 Security Headers

All responses include:
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`

---

## 3. API Endpoints

### 3.1 Authentication Endpoints

#### **POST /api/v1/auth/register**

Register a new user account.

**Authentication**: None required

**Request Body**:
```json
{
  "username": "string (3-50 chars, required)",
  "password": "string (min 6 chars, required)"
}
```

**Validation Rules**:
- `username`: 3-50 characters, alphanumeric + underscore only, unique
- `password`: Minimum 6 characters

**Success Response** (HTTP 201):
```json
{
  "status": "success",
  "message": "User registered successfully",
  "data": {
    "userId": 123,
    "username": "johndoe"
  }
}
```

**Error Responses**:

*HTTP 400 - Validation Error*:
```json
{
  "status": "error",
  "message": "Validation failed",
  "data": {
    "errors": {
      "username": "Username must be between 3 and 50 characters",
      "password": "Password must be at least 6 characters"
    }
  }
}
```

*HTTP 409 - Conflict*:
```json
{
  "status": "error",
  "message": "Username already exists",
  "data": null
}
```

**Side Effects**:
1. Password hashed with BCrypt before storage
2. 6 default categories created for user
3. 1 sample recipe (Classic Chocolate Chip Cookies) created

---

#### **POST /api/v1/auth/login**

Authenticate user and receive JWT token.

**Authentication**: None required

**Request Body**:
```json
{
  "username": "string (required)",
  "password": "string (required)"
}
```

**Success Response** (HTTP 200):
```json
{
  "status": "success",
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "username": "johndoe",
    "expiresAt": "2025-12-18T15:30:00Z"
  }
}
```

**Error Responses**:

*HTTP 401 - Unauthorized*:
```json
{
  "status": "error",
  "message": "Invalid username or password",
  "data": null
}
```

*HTTP 400 - Validation Error*:
```json
{
  "status": "error",
  "message": "Validation failed",
  "data": {
    "errors": {
      "username": "Username is required",
      "password": "Password is required"
    }
  }
}
```

---

### 3.2 Recipe Endpoints

#### **GET /api/v1/recipes**

List recipes with pagination, filtering, and sorting.

**Authentication**: Required (JWT)

**Query Parameters**:
- `page` (integer, optional, default: 0): Page number (0-indexed)
- `size` (integer, optional, default: 20): Items per page (max: 100)
- `sort` (string, optional, default: "title"): Sort field (title, cookingTimeMinutes, createdAt)
- `direction` (string, optional, default: "asc"): Sort direction (asc, desc)
- `categoryIds` (array of long, optional): Filter by category IDs (comma-separated)
- `difficulty` (string, optional): Filter by difficulty (EASY, MEDIUM, HARD)
- `search` (string, optional): Search by recipe title (partial match, case-insensitive)

**Example Requests**:
```
GET /api/v1/recipes
GET /api/v1/recipes?page=0&size=20
GET /api/v1/recipes?categoryIds=1,2&difficulty=EASY
GET /api/v1/recipes?search=chocolate
GET /api/v1/recipes?categoryIds=4&difficulty=MEDIUM&search=cake
```

**Success Response** (HTTP 200):
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
        ],
        "createdAt": "2025-12-15T10:30:00Z",
        "updatedAt": "2025-12-15T10:30:00Z"
      }
    ],
    "pagination": {
      "currentPage": 0,
      "totalPages": 5,
      "totalRecipes": 87,
      "pageSize": 20,
      "hasNext": true,
      "hasPrevious": false
    }
  }
}
```

**Error Responses**:

*HTTP 401 - Unauthorized*:
```json
{
  "status": "error",
  "message": "Authentication required",
  "data": null
}
```

*HTTP 400 - Invalid Parameter*:
```json
{
  "status": "error",
  "message": "Invalid query parameter",
  "data": {
    "errors": {
      "difficulty": "Must be one of: EASY, MEDIUM, HARD"
    }
  }
}
```

**Notes**:
- Empty result returns empty array with pagination metadata
- Multiple category IDs are OR-ed (recipes matching ANY category)
- Search and filters are AND-ed together
- Results automatically filtered by authenticated user's ID

---

#### **GET /api/v1/recipes/{id}**

Get detailed recipe information including ingredients and steps.

**Authentication**: Required (JWT)

**Path Parameters**:
- `id` (long, required): Recipe ID

**Success Response** (HTTP 200):
```json
{
  "status": "success",
  "message": "Recipe retrieved successfully",
  "data": {
    "id": 1,
    "title": "Classic Chocolate Chip Cookies",
    "difficulty": "EASY",
    "cookingTimeMinutes": 25,
    "categories": [
      { "id": 4, "name": "Dessert" },
      { "id": 5, "name": "Snacks" }
    ],
    "ingredients": [
      {
        "id": 1,
        "quantity": "2 1/4",
        "unit": "cups",
        "name": "all-purpose flour",
        "sortOrder": 1
      },
      {
        "id": 2,
        "quantity": "1",
        "unit": "tsp",
        "name": "baking soda",
        "sortOrder": 2
      }
    ],
    "steps": [
      {
        "id": 1,
        "stepNumber": 1,
        "instruction": "Preheat your oven to 375°F (190°C)."
      },
      {
        "id": 2,
        "stepNumber": 2,
        "instruction": "Combine flour, baking soda, and salt in a small bowl."
      }
    ],
    "createdAt": "2025-12-15T10:30:00Z",
    "updatedAt": "2025-12-15T10:30:00Z"
  }
}
```

**Error Responses**:

*HTTP 404 - Not Found*:
```json
{
  "status": "error",
  "message": "Recipe not found",
  "data": null
}
```

*HTTP 403 - Forbidden*:
```json
{
  "status": "error",
  "message": "Access denied",
  "data": null
}
```

**Notes**:
- Ingredients returned in `sortOrder` ascending
- Steps returned in `stepNumber` ascending
- Returns 404 if recipe doesn't exist OR belongs to different user (security through obscurity)

---

#### **POST /api/v1/recipes**

Create a new recipe.

**Authentication**: Required (JWT)

**Request Body**:
```json
{
  "title": "string (1-100 chars, required)",
  "difficulty": "EASY|MEDIUM|HARD (required)",
  "cookingTimeMinutes": "integer (positive, required)",
  "categoryIds": [1, 4],
  "ingredients": [
    {
      "quantity": "string (max 20 chars, required)",
      "unit": "string (max 20 chars, required)",
      "name": "string (max 50 chars, required)"
    }
  ],
  "steps": [
    {
      "instruction": "string (1-500 chars, required)"
    }
  ]
}
```

**Validation Rules**:
- `title`: 1-100 characters, required
- `difficulty`: Must be EASY, MEDIUM, or HARD
- `cookingTimeMinutes`: Positive integer, required
- `categoryIds`: At least 1 category required, must exist in database
- `ingredients`: Minimum 1 required
  - `quantity`: Max 20 characters, supports fractions (e.g., "1/2")
  - `unit`: Max 20 characters
  - `name`: Max 50 characters
- `steps`: Minimum 2 required
  - `instruction`: 1-500 characters

**Success Response** (HTTP 201):
```json
{
  "status": "success",
  "message": "Recipe created successfully",
  "data": {
    "recipeId": 42
  }
}
```

**Error Responses**:

*HTTP 400 - Validation Error*:
```json
{
  "status": "error",
  "message": "Validation failed",
  "data": {
    "errors": {
      "title": "Title is required",
      "ingredients": "At least one ingredient is required",
      "steps": "At least two steps are required",
      "categoryIds": "At least one category is required"
    }
  }
}
```

*HTTP 404 - Category Not Found*:
```json
{
  "status": "error",
  "message": "Invalid category ID",
  "data": {
    "errors": {
      "categoryIds": "Category with ID 99 does not exist"
    }
  }
}
```

**Side Effects**:
1. Recipe created with `userId` from JWT
2. Ingredients assigned sequential `sortOrder` (1, 2, 3...)
3. Steps assigned sequential `stepNumber` (1, 2, 3...)
4. `createdAt` and `updatedAt` timestamps set automatically

---

#### **PUT /api/v1/recipes/{id}**

Update an existing recipe (full replacement).

**Authentication**: Required (JWT)

**Path Parameters**:
- `id` (long, required): Recipe ID

**Request Body**: Same as POST /api/v1/recipes

**Validation Rules**: Same as POST /api/v1/recipes

**Success Response** (HTTP 200):
```json
{
  "status": "success",
  "message": "Recipe updated successfully",
  "data": {
    "recipeId": 42
  }
}
```

**Error Responses**: Same as POST, plus:

*HTTP 404 - Not Found*:
```json
{
  "status": "error",
  "message": "Recipe not found",
  "data": null
}
```

*HTTP 403 - Forbidden*:
```json
{
  "status": "error",
  "message": "Access denied",
  "data": null
}
```

**Side Effects**:
1. All existing ingredients deleted and replaced with new ones
2. All existing steps deleted and replaced with new ones
3. All category assignments replaced with new ones
4. `updatedAt` timestamp updated automatically
5. Ingredients re-numbered from 1
6. Steps re-numbered from 1

**Notes**:
- Full replacement update (not partial/PATCH)
- Returns 404 if recipe doesn't exist OR belongs to different user

---

#### **DELETE /api/v1/recipes/{id}**

Delete a recipe and all associated data.

**Authentication**: Required (JWT)

**Path Parameters**:
- `id` (long, required): Recipe ID

**Success Response** (HTTP 200):
```json
{
  "status": "success",
  "message": "Recipe deleted successfully",
  "data": null
}
```

**Error Responses**:

*HTTP 404 - Not Found*:
```json
{
  "status": "error",
  "message": "Recipe not found",
  "data": null
}
```

*HTTP 403 - Forbidden*:
```json
{
  "status": "error",
  "message": "Access denied",
  "data": null
}
```

**Side Effects**:
1. Recipe deleted
2. All associated ingredients deleted (CASCADE)
3. All associated steps deleted (CASCADE)
4. All category assignments deleted (CASCADE)

**Notes**:
- Hard delete (not soft delete)
- Returns 404 if recipe doesn't exist OR belongs to different user

---

### 3.3 Category Endpoints

#### **GET /api/v1/categories**

List all available categories.

**Authentication**: Required (JWT)

**Query Parameters**: None

**Success Response** (HTTP 200):
```json
{
  "status": "success",
  "message": "Categories retrieved successfully",
  "data": {
    "categories": [
      { "id": 1, "name": "Breakfast", "isDefault": true },
      { "id": 2, "name": "Lunch", "isDefault": true },
      { "id": 3, "name": "Dinner", "isDefault": true },
      { "id": 4, "name": "Dessert", "isDefault": true },
      { "id": 5, "name": "Snacks", "isDefault": true },
      { "id": 6, "name": "Drinks", "isDefault": true }
    ]
  }
}
```

**Error Responses**:

*HTTP 401 - Unauthorized*:
```json
{
  "status": "error",
  "message": "Authentication required",
  "data": null
}
```

**Notes**:
- Returns all system categories (no user-specific categories in MVP)
- All categories have `isDefault: true` in MVP
- No pagination (small static dataset)
- Sorted alphabetically by name

---

### 3.4 Health Check Endpoint

#### **GET /api/health**

Application health check endpoint.

**Authentication**: None required

**Success Response** (HTTP 200):
```json
{
  "status": "UP",
  "timestamp": "2025-12-17T15:30:00Z",
  "database": "UP"
}
```

**Error Response** (HTTP 503):
```json
{
  "status": "DOWN",
  "timestamp": "2025-12-17T15:30:00Z",
  "database": "DOWN"
}
```

**Notes**:
- Used for monitoring and deployment verification
- Checks database connectivity
- No authentication required

---

## 4. Data Models

### 4.1 Request DTOs

#### **RegisterRequest**
```json
{
  "username": "string",
  "password": "string"
}
```

**Validation**:
- `username`: @NotBlank, @Size(min=3, max=50), @Pattern(regexp="^[a-zA-Z0-9_]+$")
- `password`: @NotBlank, @Size(min=6)

---

#### **LoginRequest**
```json
{
  "username": "string",
  "password": "string"
}
```

**Validation**:
- `username`: @NotBlank
- `password`: @NotBlank

---

#### **CreateRecipeRequest**
```json
{
  "title": "string",
  "difficulty": "string",
  "cookingTimeMinutes": "integer",
  "categoryIds": ["long"],
  "ingredients": [
    {
      "quantity": "string",
      "unit": "string",
      "name": "string"
    }
  ],
  "steps": [
    {
      "instruction": "string"
    }
  ]
}
```

**Validation**:
- `title`: @NotBlank, @Size(min=1, max=100)
- `difficulty`: @NotNull, @Pattern(regexp="^(EASY|MEDIUM|HARD)$")
- `cookingTimeMinutes`: @NotNull, @Min(1)
- `categoryIds`: @NotEmpty, @Size(min=1)
- `ingredients`: @NotEmpty, @Size(min=1), @Valid
  - `quantity`: @NotBlank, @Size(max=20)
  - `unit`: @NotBlank, @Size(max=20)
  - `name`: @NotBlank, @Size(max=50)
- `steps`: @NotEmpty, @Size(min=2), @Valid
  - `instruction`: @NotBlank, @Size(min=1, max=500)

---

#### **UpdateRecipeRequest**
Same structure and validation as CreateRecipeRequest.

---

### 4.2 Response DTOs

#### **AuthResponse**
```json
{
  "token": "string",
  "username": "string",
  "expiresAt": "ISO 8601 datetime"
}
```

---

#### **UserResponse**
```json
{
  "userId": "long",
  "username": "string"
}
```

---

#### **RecipeListItemResponse**
```json
{
  "id": "long",
  "title": "string",
  "difficulty": "string",
  "cookingTimeMinutes": "integer",
  "categories": [
    {
      "id": "long",
      "name": "string"
    }
  ],
  "createdAt": "ISO 8601 datetime",
  "updatedAt": "ISO 8601 datetime"
}
```

---

#### **RecipeDetailResponse**
```json
{
  "id": "long",
  "title": "string",
  "difficulty": "string",
  "cookingTimeMinutes": "integer",
  "categories": [
    {
      "id": "long",
      "name": "string"
    }
  ],
  "ingredients": [
    {
      "id": "long",
      "quantity": "string",
      "unit": "string",
      "name": "string",
      "sortOrder": "integer"
    }
  ],
  "steps": [
    {
      "id": "long",
      "stepNumber": "integer",
      "instruction": "string"
    }
  ],
  "createdAt": "ISO 8601 datetime",
  "updatedAt": "ISO 8601 datetime"
}
```

---

#### **CategoryResponse**
```json
{
  "id": "long",
  "name": "string",
  "isDefault": "boolean"
}
```

---

#### **PaginationMetadata**
```json
{
  "currentPage": "integer",
  "totalPages": "integer",
  "totalRecipes": "long",
  "pageSize": "integer",
  "hasNext": "boolean",
  "hasPrevious": "boolean"
}
```

---

#### **RecipeIdResponse**
```json
{
  "recipeId": "long"
}
```

---

### 4.3 Standard Response Envelope

All API responses use a consistent envelope structure:

**Success Response**:
```json
{
  "status": "success",
  "message": "Human-readable success message",
  "data": { /* Response-specific data */ }
}
```

**Error Response**:
```json
{
  "status": "error",
  "message": "Human-readable error message",
  "data": {
    "errors": {
      "fieldName": "Field-specific error message"
    }
  }
}
```

---

## 5. Business Logic & Validation

### 5.1 User Registration

**Business Rules**:
1. Username must be unique across all users
2. Password must be hashed with BCrypt before storage (strength: 10 rounds)
3. Automatically create 6 default categories for new user
4. Automatically create 1 sample recipe (Classic Chocolate Chip Cookies)

**Validation**:
- Username: 3-50 characters, alphanumeric + underscore only
- Password: Minimum 6 characters (no complexity requirements in MVP)

**Process Flow**:
1. Validate username format and uniqueness
2. Validate password length
3. Hash password with BCrypt
4. Create user record
5. Create 6 default categories
6. Create sample recipe with ingredients and steps
7. Return user ID and username

---

### 5.2 User Login

**Business Rules**:
1. Credentials must match stored username and BCrypt hash
2. Generate JWT with 24-hour expiration
3. Include userId and username in JWT claims

**Validation**:
- Both username and password required
- Case-sensitive username matching

**Process Flow**:
1. Lookup user by username
2. Compare provided password with stored BCrypt hash
3. On success, generate JWT with claims
4. Return JWT, username, and expiration timestamp

---

### 5.3 Recipe Creation

**Business Rules**:
1. Recipe automatically associated with authenticated user (from JWT)
2. Minimum 1 ingredient required
3. Minimum 2 steps required
4. Minimum 1 category assignment required
5. Ingredients assigned continuous `sortOrder` starting from 1
6. Steps assigned continuous `stepNumber` starting from 1
7. Category IDs must exist in database

**Validation**:
- Title: 1-100 characters, required
- Difficulty: Must be EASY, MEDIUM, or HARD
- Cooking time: Positive integer
- Ingredients: Each with quantity (max 20), unit (max 20), name (max 50)
- Steps: Each instruction 1-500 characters
- Category IDs: At least 1, all must exist

**Process Flow**:
1. Validate all fields
2. Verify all category IDs exist
3. Extract userId from JWT
4. Create recipe record with userId
5. Create ingredient records with sequential sortOrder
6. Create step records with sequential stepNumber
7. Create recipe-category associations
8. Return recipe ID

---

### 5.4 Recipe Update

**Business Rules**:
1. User can only update their own recipes
2. Full replacement of ingredients and steps (not merge)
3. All existing ingredients deleted, new ones created with fresh sortOrder
4. All existing steps deleted, new ones created with fresh stepNumber
5. Category assignments fully replaced
6. Same validation rules as creation

**Validation**: Same as Recipe Creation

**Process Flow**:
1. Validate all fields
2. Verify recipe exists and belongs to authenticated user
3. Verify all category IDs exist
4. Delete all existing ingredients
5. Delete all existing steps
6. Delete all existing category assignments
7. Update recipe core fields
8. Create new ingredient records with sequential sortOrder
9. Create new step records with sequential stepNumber
10. Create new recipe-category associations
11. Update `updatedAt` timestamp
12. Return recipe ID

---

### 5.5 Recipe Deletion

**Business Rules**:
1. User can only delete their own recipes
2. Hard delete (not soft delete)
3. Cascade delete ingredients, steps, and category assignments

**Process Flow**:
1. Verify recipe exists and belongs to authenticated user
2. Delete recipe (database cascades to ingredients, steps, recipe_categories)
3. Return success message

---

### 5.6 Recipe Search & Filtering

**Business Rules**:
1. Search is case-insensitive partial match on title only
2. Multiple category filters are OR-ed (match ANY category)
3. Category filter AND difficulty filter AND search are all AND-ed together
4. Results automatically filtered by authenticated user's ID
5. Results sorted alphabetically by title by default

**Filter Combinations**:
- Category only: `WHERE userId = ? AND categoryId IN (?)`
- Difficulty only: `WHERE userId = ? AND difficulty = ?`
- Search only: `WHERE userId = ? AND title ILIKE ?`
- Category + Difficulty: `WHERE userId = ? AND categoryId IN (?) AND difficulty = ?`
- All filters: `WHERE userId = ? AND categoryId IN (?) AND difficulty = ? AND title ILIKE ?`

**Process Flow**:
1. Extract userId from JWT
2. Build dynamic query based on provided filters
3. Apply pagination parameters
4. Execute query with user isolation
5. Return results with pagination metadata

---

### 5.7 Continuous Numbering

**Ingredient Sort Order**:
- On creation: Assigned 1, 2, 3, 4... in request order
- On update: All deleted and recreated with fresh numbering
- No gaps allowed in sequence

**Step Numbering**:
- On creation: Assigned 1, 2, 3, 4... in request order
- On update: All deleted and recreated with fresh numbering
- No gaps allowed in sequence
- User does not manually provide step numbers

---

## 6. Error Handling

### 6.1 Error Response Format

All errors return a consistent JSON structure:

```json
{
  "status": "error",
  "message": "High-level error description",
  "data": {
    "errors": {
      "fieldName": "Specific error message",
      "anotherField": "Another error message"
    }
  }
}
```

For non-validation errors, `data` may be `null` or contain additional context.

---

### 6.2 HTTP Status Codes

| Status Code | Usage | Example |
|-------------|-------|---------|
| 200 OK | Successful GET, PUT, DELETE | Recipe retrieved successfully |
| 201 Created | Successful POST | Recipe created successfully |
| 400 Bad Request | Validation errors, malformed request | Invalid difficulty value |
| 401 Unauthorized | Missing or invalid JWT | Authentication required |
| 403 Forbidden | Valid JWT but insufficient permissions | Access denied (different user's recipe) |
| 404 Not Found | Resource doesn't exist or user doesn't own it | Recipe not found |
| 409 Conflict | Unique constraint violation | Username already exists |
| 500 Internal Server Error | Unexpected server errors | Database connection failed |
| 503 Service Unavailable | Service temporarily down | Health check failure |

---

### 6.3 Error Categories

#### **Validation Errors (HTTP 400)**
```json
{
  "status": "error",
  "message": "Validation failed",
  "data": {
    "errors": {
      "title": "Title must be between 1 and 100 characters",
      "ingredients": "At least one ingredient is required",
      "steps": "At least two steps are required"
    }
  }
}
```

**Triggers**:
- Missing required fields
- Field length violations
- Invalid enum values
- Min/max constraint violations
- Pattern mismatches

---

#### **Authentication Errors (HTTP 401)**
```json
{
  "status": "error",
  "message": "Authentication required",
  "data": null
}
```

**Triggers**:
- Missing Authorization header
- Invalid JWT token
- Expired JWT token
- Malformed JWT token

---

#### **Authorization Errors (HTTP 403)**
```json
{
  "status": "error",
  "message": "Access denied",
  "data": null
}
```

**Triggers**:
- Attempting to access another user's recipe
- Attempting to update another user's recipe
- Attempting to delete another user's recipe

---

#### **Not Found Errors (HTTP 404)**
```json
{
  "status": "error",
  "message": "Recipe not found",
  "data": null
}
```

**Triggers**:
- Recipe ID doesn't exist
- Recipe belongs to different user (security through obscurity)
- Category ID doesn't exist

---

#### **Conflict Errors (HTTP 409)**
```json
{
  "status": "error",
  "message": "Username already exists",
  "data": null
}
```

**Triggers**:
- Duplicate username during registration
- Unique constraint violations

---

#### **Server Errors (HTTP 500)**
```json
{
  "status": "error",
  "message": "An unexpected error occurred",
  "data": {
    "errorId": "uuid-for-log-correlation"
  }
}
```

**Triggers**:
- Database connection failures
- Unexpected exceptions
- Null pointer exceptions
- Data integrity issues

**Note**: Error ID should be logged for debugging while keeping sensitive details from client.

---

### 6.4 Global Exception Handling

Implemented using Spring's `@ControllerAdvice`:

```java
@ControllerAdvice
public class GlobalExceptionHandler {
    
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponse> handleValidationErrors(MethodArgumentNotValidException ex) {
        // Return 400 with field-level errors
    }
    
    @ExceptionHandler(JwtException.class)
    public ResponseEntity<ApiResponse> handleJwtErrors(JwtException ex) {
        // Return 401
    }
    
    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ApiResponse> handleAccessDenied(AccessDeniedException ex) {
        // Return 403
    }
    
    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ApiResponse> handleNotFound(ResourceNotFoundException ex) {
        // Return 404
    }
    
    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<ApiResponse> handleConflict(DataIntegrityViolationException ex) {
        // Return 409
    }
    
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse> handleGenericErrors(Exception ex) {
        // Log error, return 500 with error ID
    }
}
```

---

## 7. Pagination, Filtering, and Sorting

### 7.1 Pagination Strategy

**Implementation**: Spring Data's `PageRequest` with database-level pagination (LIMIT/OFFSET)

**Default Values**:
- Page size: 20 recipes
- Page number: 0 (first page)
- Sort: Alphabetical by title (ascending)

**Query Parameters**:
- `page`: 0-indexed page number
- `size`: Items per page (max: 100)
- `sort`: Sort field (title, cookingTimeMinutes, createdAt)
- `direction`: Sort direction (asc, desc)

**Response Metadata**:
```json
{
  "pagination": {
    "currentPage": 0,
    "totalPages": 5,
    "totalRecipes": 87,
    "pageSize": 20,
    "hasNext": true,
    "hasPrevious": false
  }
}
```

**Performance Considerations**:
- Database-level pagination prevents loading entire dataset into memory
- Indexed title column for efficient sorting
- Expected max ~100 recipes per user (low data volume)

---

### 7.2 Filtering Strategy

**Available Filters**:
1. **Category Filter**: Multiple categories (OR logic)
   - Query param: `categoryIds=1,2,4`
   - SQL: `JOIN recipe_categories WHERE category_id IN (1, 2, 4)`
   
2. **Difficulty Filter**: Single difficulty level
   - Query param: `difficulty=EASY`
   - SQL: `WHERE difficulty = 'EASY'`
   
3. **Search Filter**: Partial title match
   - Query param: `search=chocolate`
   - SQL: `WHERE title ILIKE '%chocolate%'`

**Filter Combination**: All filters applied with AND logic
```sql
WHERE user_id = ? 
  AND category_id IN (?, ?, ?) 
  AND difficulty = ? 
  AND title ILIKE ?
```

**Implementation**:
- JPA Specification pattern for dynamic query building
- Indexed fields for efficient filtering
- User ID always included for row-level security

---

### 7.3 Sorting Strategy

**Supported Sort Fields**:
- `title` (default): Alphabetical recipe name
- `cookingTimeMinutes`: Cooking time duration
- `createdAt`: Recipe creation timestamp
- `updatedAt`: Last modification timestamp

**Sort Directions**:
- `asc` (default): Ascending order
- `desc`: Descending order

**Examples**:
- `/api/v1/recipes?sort=title&direction=asc` (default)
- `/api/v1/recipes?sort=cookingTimeMinutes&direction=asc`
- `/api/v1/recipes?sort=createdAt&direction=desc`

**Implementation**:
```java
Sort sort = Sort.by(Sort.Direction.fromString(direction), sortField);
PageRequest pageRequest = PageRequest.of(page, size, sort);
```

---

### 7.4 Search Strategy

**Search Scope**: Recipe title only (no ingredient or instruction search in MVP)

**Match Type**: Case-insensitive partial match (ILIKE)

**Client-Side Debouncing**: 300ms delay after user stops typing

**Query Construction**:
```sql
WHERE user_id = ? AND title ILIKE '%search_term%'
```

**Index**: `idx_recipes_title` for efficient search

**Example**:
- Search: "chocolate" → Matches "Chocolate Cake", "Chocolate Chip Cookies", "Hot Chocolate"

---

### 7.5 Combined Example

**Request**:
```
GET /api/v1/recipes?page=0&size=20&sort=cookingTimeMinutes&direction=asc&categoryIds=4,5&difficulty=EASY&search=cookie
```

**Query Logic**:
1. Filter by authenticated user's ID
2. Filter recipes in categories 4 OR 5
3. Filter difficulty = EASY
4. Filter title contains "cookie" (case-insensitive)
5. Sort by cooking time ascending
6. Return page 0 with 20 items

**SQL Equivalent**:
```sql
SELECT r.* 
FROM recipes r
JOIN recipe_categories rc ON r.id = rc.recipe_id
WHERE r.user_id = ?
  AND rc.category_id IN (4, 5)
  AND r.difficulty = 'EASY'
  AND r.title ILIKE '%cookie%'
ORDER BY r.cooking_time_minutes ASC
LIMIT 20 OFFSET 0
```

---

## 8. Implementation Checklist

### 8.1 Backend Setup
- [ ] Initialize Spring Boot project with dependencies
- [ ] Configure H2 database with PostgreSQL compatibility mode
- [ ] Set up application.properties with JWT secret environment variable
- [ ] Enable CORS for local development (React :3000)

### 8.2 Entity Layer
- [ ] Create User entity with BCrypt password field
- [ ] Create Recipe entity with relationships
- [ ] Create Ingredient entity with sortOrder
- [ ] Create Step entity with stepNumber
- [ ] Create Category entity
- [ ] Set up cascade rules on relationships
- [ ] Add validation annotations

### 8.3 Repository Layer
- [ ] Create UserRepository with findByUsername method
- [ ] Create RecipeRepository with user isolation queries
- [ ] Create CategoryRepository
- [ ] Create custom query methods for search/filter combinations
- [ ] Add pagination support with PageRequest

### 8.4 Service Layer
- [ ] Implement AuthService with BCrypt and JWT
- [ ] Implement RecipeService with CRUD operations
- [ ] Implement CategoryService
- [ ] Add business logic for continuous numbering
- [ ] Add user isolation enforcement
- [ ] Implement search and filter logic

### 8.5 DTO Layer
- [ ] Create request DTOs with validation annotations
- [ ] Create response DTOs
- [ ] Implement DTO ↔ Entity mappers
- [ ] Create standard ApiResponse envelope

### 8.6 Controller Layer
- [ ] Create AuthController with register/login endpoints
- [ ] Create RecipeController with CRUD endpoints
- [ ] Create CategoryController with list endpoint
- [ ] Create HealthController
- [ ] Add JWT extraction and user ID retrieval
- [ ] Map service exceptions to HTTP status codes

### 8.7 Security Layer
- [ ] Implement JWT token generation
- [ ] Implement JWT token validation
- [ ] Create authentication filter/interceptor
- [ ] Add security headers to responses
- [ ] Configure public vs protected endpoints

### 8.8 Exception Handling
- [ ] Create custom exception classes (ResourceNotFoundException, etc.)
- [ ] Implement @ControllerAdvice global exception handler
- [ ] Map validation errors to field-level messages
- [ ] Add error ID generation for 500 errors

### 8.9 Database Initialization
- [ ] Create data.sql with 6 default categories
- [ ] Implement sample recipe creation on user registration
- [ ] Configure H2 console for development

### 8.10 Testing
- [ ] Unit tests for AuthService (registration, login, JWT)
- [ ] Unit tests for RecipeService (CRUD, validation)
- [ ] Unit tests for search and filter logic
- [ ] Integration tests for API endpoints
- [ ] Test user isolation enforcement
- [ ] Test cascade delete behavior

### 8.11 Documentation
- [ ] Set up SpringDoc OpenAPI (if time permits)
- [ ] Create Postman collection for manual testing
- [ ] Document environment variables in README

---

## 9. API Testing Scenarios

### 9.1 Happy Path Tests

**Scenario 1: User Registration and First Recipe**
1. POST /api/v1/auth/register → 201 with userId
2. POST /api/v1/auth/login → 200 with JWT
3. GET /api/v1/categories → 200 with 6 categories
4. POST /api/v1/recipes → 201 with recipeId
5. GET /api/v1/recipes → 200 with 2 recipes (sample + new)
6. GET /api/v1/recipes/{id} → 200 with full recipe details

**Scenario 2: Search and Filter**
1. Login
2. GET /api/v1/recipes?search=chocolate → 200 with matching recipes
3. GET /api/v1/recipes?categoryIds=4 → 200 with desserts only
4. GET /api/v1/recipes?difficulty=EASY → 200 with easy recipes
5. GET /api/v1/recipes?categoryIds=4&difficulty=EASY → 200 with easy desserts

**Scenario 3: Recipe Update and Delete**
1. Login
2. POST /api/v1/recipes → 201
3. PUT /api/v1/recipes/{id} → 200
4. GET /api/v1/recipes/{id} → 200 with updated data
5. DELETE /api/v1/recipes/{id} → 200
6. GET /api/v1/recipes/{id} → 404

---

### 9.2 Error Path Tests

**Authentication Errors**
- POST /api/v1/auth/register with existing username → 409
- POST /api/v1/auth/register with short password → 400
- POST /api/v1/auth/login with wrong password → 401
- GET /api/v1/recipes without JWT → 401
- GET /api/v1/recipes with expired JWT → 401

**Validation Errors**
- POST /api/v1/recipes with empty title → 400
- POST /api/v1/recipes with 0 ingredients → 400
- POST /api/v1/recipes with 1 step → 400
- POST /api/v1/recipes with 0 categories → 400
- POST /api/v1/recipes with 501-char step → 400

**Authorization Errors**
- User A creates recipe
- User B attempts GET /api/v1/recipes/{userA_recipe_id} → 404
- User B attempts PUT /api/v1/recipes/{userA_recipe_id} → 404
- User B attempts DELETE /api/v1/recipes/{userA_recipe_id} → 404

**Not Found Errors**
- GET /api/v1/recipes/99999 → 404
- PUT /api/v1/recipes/99999 → 404
- DELETE /api/v1/recipes/99999 → 404
- POST /api/v1/recipes with categoryIds=[99999] → 404

---

### 9.3 Edge Case Tests

**Pagination Edge Cases**
- GET /api/v1/recipes?page=999 → 200 with empty array
- GET /api/v1/recipes?size=0 → 400 (invalid size)
- GET /api/v1/recipes?size=1000 → 400 (exceeds max 100)

**Search Edge Cases**
- GET /api/v1/recipes?search= → 200 with all recipes (empty search)
- GET /api/v1/recipes?search=xyz123 → 200 with empty array (no matches)

**Special Characters**
- POST /api/v1/recipes with title "Crème Brûlée" → 201 (UTF-8 support)
- POST /api/v1/recipes with quantity "1/2" → 201 (fraction support)
- GET /api/v1/recipes?search=crème → 200 (UTF-8 search)

**Continuous Numbering**
- Create recipe with 5 ingredients → sortOrder 1-5
- Update recipe with 3 ingredients → sortOrder reset to 1-3
- Create recipe with 10 steps → stepNumber 1-10

---

## 10. Performance Considerations

### 10.1 Database Optimization

**Indexes**:
- `idx_recipes_user_id`: Fast user filtering
- `idx_recipes_title`: Fast title search
- `idx_ingredients_recipe_id`: Fast ingredient retrieval
- `idx_steps_recipe_id`: Fast step retrieval
- `idx_recipe_categories_category_id`: Fast category filtering

**Query Optimization**:
- Use JOIN FETCH for recipe detail view (prevent N+1)
- Database-level pagination with LIMIT/OFFSET
- Avoid SELECT * in production (use specific columns)

**Expected Load**:
- Max 5 concurrent users (MVP)
- ~100 recipes per user
- 5-10 ingredients per recipe
- Minimal performance tuning needed

---

### 10.2 API Optimization

**Client-Side**:
- Debounce search input (300ms)
- Cache category list (static data)
- Optimistic UI updates

**Server-Side**:
- Lazy loading: Don't fetch ingredients/steps in list view
- Pagination: Prevent loading entire dataset
- Connection pooling: Default HikariCP settings sufficient

---

### 10.3 Response Time Targets

| Endpoint | Target | Notes |
|----------|--------|-------|
| POST /api/v1/auth/register | < 1s | Includes BCrypt hashing |
| POST /api/v1/auth/login | < 500ms | BCrypt verification |
| GET /api/v1/recipes (list) | < 500ms | Paginated, indexed |
| GET /api/v1/recipes/{id} | < 300ms | Single query with JOIN FETCH |
| POST /api/v1/recipes | < 1s | Multiple inserts (transaction) |
| PUT /api/v1/recipes/{id} | < 1.5s | Delete + recreate ingredients/steps |
| DELETE /api/v1/recipes/{id} | < 300ms | Cascade delete |
| GET /api/v1/categories | < 100ms | Small static dataset |

**Note**: Targets assume local H2 database with no network latency.

---

## 11. Security Considerations

### 11.1 Authentication Security

- BCrypt password hashing (strength: 10 rounds)
- JWT signed with HS256 algorithm
- JWT secret stored in environment variable
- 24-hour token expiration (no refresh tokens in MVP)
- No server-side token blacklist (logout = client deletes token)

---

### 11.2 Authorization Security

- Row-level security: All queries filtered by userId from JWT
- 404 for unauthorized access (security through obscurity)
- No direct user ID exposure in URLs
- Category IDs validated before assignment

---

### 11.3 Input Validation

- All DTOs validated with Hibernate Validator
- SQL injection prevention via parameterized queries (JPA)
- XSS prevention via JSON response encoding
- Maximum field lengths enforced
- Enum validation for difficulty

---

### 11.4 Transport Security

- CORS configured for development (React :3000)
- Security headers: X-Content-Type-Options, X-Frame-Options, X-XSS-Protection
- HTTPS recommended for production (not enforced in MVP)

---

### 11.5 Data Security

- Passwords never logged or returned in responses
- JWT secret never exposed to client
- Database file permissions should be restricted (OS-level)
- No sensitive data in error messages

---

## 12. Future Enhancements (Post-MVP)

### 12.1 API Enhancements

- PATCH endpoints for partial recipe updates
- Bulk delete endpoint for multiple recipes
- Recipe duplication/cloning endpoint
- Export recipes (JSON, Recipe Schema format)
- Import recipes from various formats

---

### 12.2 Search & Filter Enhancements

- Search by ingredients
- Search by step instructions
- Full-text search with PostgreSQL tsvector
- Saved search queries
- Advanced filtering (cooking time ranges, multiple difficulties)

---

### 12.3 Security Enhancements

- Refresh token implementation
- Server-side token blacklist for logout
- Rate limiting per user
- Password reset flow with email verification
- Two-factor authentication
- OAuth integration (Google, GitHub)

---

### 12.4 Feature Enhancements

- User profile endpoints (avatar, preferences)
- Custom category creation/management
- Recipe tagging system
- Recipe ratings and notes
- Favorite/bookmark recipes
- Recipe photos upload and storage
- Nutrition information
- Shopping list generation from ingredients

---

### 12.5 Technical Enhancements

- Migrate to PostgreSQL
- Add Flyway for database migrations
- Implement caching (Redis)
- Add comprehensive API documentation (SpringDoc OpenAPI)
- Implement comprehensive logging (structured JSON logs)
- Add monitoring and metrics (Prometheus/Grafana)
- Implement CI/CD pipeline
- Add comprehensive test coverage (80%+ target)

---

**END OF API PLAN**
