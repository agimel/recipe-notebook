# API Endpoint Implementation Plan: PUT /api/v1/recipes/{id}

## 1. Endpoint Overview

The `PUT /api/v1/recipes/{id}` endpoint updates an existing recipe with full replacement semantics. This is not a partial update (PATCH) - all child resources (ingredients, steps, category associations) are deleted and recreated. The endpoint ensures that only the authenticated recipe owner can perform updates by returning 404 for both non-existent recipes and recipes owned by other users.

## 2. Request Details

- **HTTP Method**: PUT
- **URL Structure**: `/api/v1/recipes/{id}`
- **Authentication**: Required (JWT token in Authorization header)

### Path Parameters
- **id** (Long, required): The unique identifier of the recipe to update

### Request Body
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

## 3. Types Used

### Request DTOs
- **CreateRecipeRequest** (reuse from POST endpoint)
  - `title`: String
  - `difficulty`: String (validated against EASY|MEDIUM|HARD pattern)
  - `cookingTimeMinutes`: Integer
  - `categoryIds`: List<Long>
  - `ingredients`: List<IngredientDTO>
  - `steps`: List<StepDTO>

- **IngredientDTO** (nested in CreateRecipeRequest)
  - `quantity`: String
  - `unit`: String
  - `name`: String

- **StepDTO** (nested in CreateRecipeRequest)
  - `instruction`: String

### Response DTOs
- **ApiResponse<RecipeIdData>** (reuse from POST endpoint)
  - `status`: String ("success" or "error")
  - `message`: String
  - `data`: RecipeIdData

- **RecipeIdData**
  - `recipeId`: Long

### Validation Annotations
- **title**: `@NotBlank`, `@Size(min=1, max=100)`
- **difficulty**: `@NotNull`, `@Pattern(regexp="^(EASY|MEDIUM|HARD)$")`
- **cookingTimeMinutes**: `@NotNull`, `@Min(1)`
- **categoryIds**: `@NotEmpty`, `@Size(min=1)`
- **ingredients**: `@NotEmpty`, `@Size(min=1)`, `@Valid`
  - **quantity**: `@NotBlank`, `@Size(max=20)`
  - **unit**: `@NotBlank`, `@Size(max=20)`
  - **name**: `@NotBlank`, `@Size(max=50)`
- **steps**: `@NotEmpty`, `@Size(min=2)`, `@Valid`
  - **instruction**: `@NotBlank`, `@Size(min=1, max=500)`

## 4. Response Details

### Success Response (HTTP 200)
```json
{
  "status": "success",
  "message": "Recipe updated successfully",
  "data": {
    "recipeId": 42
  }
}
```

### Error Responses

**HTTP 400 - Validation Error**:
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

**HTTP 404 - Not Found**:
```json
{
  "status": "error",
  "message": "Recipe not found",
  "data": null
}
```

**HTTP 404 - Category Not Found**:
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

**HTTP 401 - Unauthorized**:
```json
{
  "status": "error",
  "message": "Authentication required",
  "data": null
}
```

**HTTP 500 - Internal Server Error**:
```json
{
  "status": "error",
  "message": "An unexpected error occurred",
  "data": null
}
```

## 5. Data Flow

1. **Request Reception**: RecipeController receives PUT request with path parameter `id` and request body
2. **Authentication**: JWT token extracted and validated, userId obtained
3. **Bean Validation**: Hibernate Validator validates request body annotations
4. **Service Invocation**: RecipeService.updateRecipe(id, userId, request) called
5. **Ownership Verification**: 
   - Recipe fetched by id
   - If not found → throw RecipeNotFoundException
   - If recipe.userId != authenticated userId → throw RecipeNotFoundException (security through obscurity)
6. **Category Validation**: All categoryIds verified to exist in database
7. **Transaction Begin**: Start database transaction for atomicity
8. **Delete Child Records**:
   - Delete all ingredients (CASCADE handles this automatically)
   - Delete all steps (CASCADE handles this automatically)
   - Delete all recipe_categories associations
9. **Update Core Recipe**:
   - Update title, difficulty, cookingTimeMinutes
   - updatedAt timestamp auto-updated by database
10. **Create New Ingredients**:
    - Iterate through ingredients array
    - Create new Ingredient entities with sortOrder = 1, 2, 3...
    - Save to database
11. **Create New Steps**:
    - Iterate through steps array
    - Create new Step entities with stepNumber = 1, 2, 3...
    - Save to database
12. **Create New Category Associations**:
    - Iterate through categoryIds
    - Create RecipeCategory associations
    - Save to database
13. **Transaction Commit**: Commit all changes atomically
14. **Response**: Return ApiResponse with status 200 and recipeId

## 6. Security Considerations

### Authentication
- JWT token required in `Authorization: Bearer <token>` header
- Token validated using JwtService.extractUserId()
- Invalid/expired tokens result in 401 Unauthorized

### Authorization
- Recipe ownership enforced: `recipe.userId == authenticatedUserId`
- Return 404 (not 403) when user tries to access another user's recipe to avoid information disclosure
- This prevents attackers from enumerating valid recipe IDs

### Data Validation
- All inputs validated using Hibernate Validator annotations
- Path parameter `id` validated as valid Long (Spring handles type conversion errors)
- Category IDs validated against database to prevent orphaned references
- Array sizes constrained (min 1 ingredient, min 2 steps) to prevent resource exhaustion

### SQL Injection Prevention
- JPA/Hibernate used for all database access (parameterized queries)
- No raw SQL or string concatenation in queries

### Mass Assignment Prevention
- DTOs explicitly define allowed fields
- Entity fields not directly exposed in request/response
- userId comes from authenticated token, not request body

## 7. Error Handling

### Validation Errors (400)
- **Trigger**: Bean validation failures (@NotBlank, @Size, @Min, @Pattern, etc.)
- **Handler**: Global exception handler catches MethodArgumentNotValidException
- **Response**: ValidationErrorResponse with field-level errors

### Category Not Found (404)
- **Trigger**: categoryIds contains non-existent category ID
- **Handler**: Service throws InvalidCategoryException
- **Response**: ApiResponse with error message specifying invalid category ID

### Recipe Not Found (404)
- **Trigger**: Recipe with given id doesn't exist OR belongs to different user
- **Handler**: Service throws RecipeNotFoundException
- **Response**: ApiResponse with "Recipe not found" message
- **Security Note**: Same response for both cases to prevent information leakage

### Unauthorized (401)
- **Trigger**: Missing, invalid, or expired JWT token
- **Handler**: JWT filter or global exception handler
- **Response**: ApiResponse with "Authentication required" message

### Internal Server Error (500)
- **Trigger**: Unexpected database errors, runtime exceptions
- **Handler**: Global exception handler catches generic Exception
- **Response**: ApiResponse with generic error message
- **Logging**: Full stack trace logged for debugging

## 8. Performance Considerations

### Potential Bottlenecks
1. **Cascading Deletes**: Database must delete many child records before update
2. **N+1 Queries**: Multiple insert operations for ingredients, steps, categories
3. **Category Validation**: Multiple SELECT queries to validate each category ID
4. **Transaction Size**: Large arrays of ingredients/steps increase transaction time

### Optimization Strategies
1. **Database CASCADE**: Leverage ON DELETE CASCADE to automatically clean up child records
2. **Batch Inserts**: Use JPA batch insert for ingredients and steps (`spring.jpa.properties.hibernate.jdbc.batch_size=20`)
3. **Single Category Query**: Fetch all categories by IDs in one query using `IN` clause
4. **Transaction Isolation**: Use appropriate isolation level (READ_COMMITTED) to minimize locking
5. **Array Size Limits**: Enforce reasonable max limits on ingredients/steps arrays (e.g., max 50 each)
6. **Index Usage**: Ensure foreign key columns (recipe_id, user_id, category_id) are indexed

### Performance Targets (MVP)
- Response time: < 500ms for recipes with 10 ingredients + 5 steps
- Database connections: Reuse connection pool, max 10 concurrent connections
- Memory: < 5MB per request for reasonable recipe sizes

## 9. Implementation Steps

### Step 1: Create/Verify DTOs
1. Verify `CreateRecipeRequest` exists from POST endpoint (reuse)
2. Verify `IngredientDTO` with validation annotations
3. Verify `StepDTO` with validation annotations
4. Verify `ApiResponse<T>` generic response wrapper
5. Verify `RecipeIdData` response data class

### Step 2: Create Exception Classes
1. Create `RecipeNotFoundException` extending RuntimeException
2. Create `InvalidCategoryException` extending RuntimeException
3. Ensure both return appropriate HTTP status codes via global exception handler

### Step 3: Create/Update RecipeService
1. Create `RecipeService` if not exists
2. Inject `RecipeRepository`, `IngredientRepository`, `StepRepository`, `CategoryRepository`, `RecipeCategoryRepository`
3. Implement `updateRecipe(Long id, Long userId, CreateRecipeRequest request)`:
   - Fetch recipe by id and verify ownership
   - Validate all category IDs exist
   - Delete existing ingredients (if not auto-cascaded)
   - Delete existing steps (if not auto-cascaded)
   - Delete recipe_categories associations
   - Update recipe core fields
   - Create new ingredients with sequential sortOrder
   - Create new steps with sequential stepNumber
   - Create new recipe-category associations
   - Return recipe ID
4. Annotate method with `@Transactional` for atomicity

### Step 4: Create RecipeController Endpoint
1. Create `RecipeController` if not exists
2. Add `@RestController` and `@RequestMapping("/api/v1/recipes")`
3. Inject `RecipeService` and `JwtService`
4. Implement PUT endpoint:
   ```java
   @PutMapping("/{id}")
   public ResponseEntity<ApiResponse<RecipeIdData>> updateRecipe(
       @PathVariable Long id,
       @Valid @RequestBody CreateRecipeRequest request,
       @RequestHeader("Authorization") String authHeader
   )
   ```
5. Extract userId from JWT token
6. Call `recipeService.updateRecipe(id, userId, request)`
7. Return `ResponseEntity.ok()` with success response

### Step 5: Implement Global Exception Handler
1. Add handler for `RecipeNotFoundException` → return 404
2. Add handler for `InvalidCategoryException` → return 404 with category error details
3. Verify handler for `MethodArgumentNotValidException` → return 400 with validation errors
4. Verify handler for generic `Exception` → return 500

### Step 6: Create Repository Interfaces
1. Create `RecipeRepository extends JpaRepository<Recipe, Long>`
2. Create `IngredientRepository extends JpaRepository<Ingredient, Long>`
   - Add method: `void deleteByRecipeId(Long recipeId)` (if cascade not configured)
3. Create `StepRepository extends JpaRepository<Step, Long>`
   - Add method: `void deleteByRecipeId(Long recipeId)` (if cascade not configured)
4. Create `CategoryRepository extends JpaRepository<Category, Long>`
   - Add method: `List<Category> findAllById(Iterable<Long> ids)` (built-in)
5. Create `RecipeCategoryRepository extends JpaRepository<RecipeCategory, RecipeCategoryId>`
   - Add method: `void deleteByRecipeId(Long recipeId)`

### Step 7: Configure JPA Entities
1. Verify `Recipe` entity with proper cascade settings:
   ```java
   @OneToMany(mappedBy = "recipe", cascade = CascadeType.ALL, orphanRemoval = true)
   private List<Ingredient> ingredients;
   
   @OneToMany(mappedBy = "recipe", cascade = CascadeType.ALL, orphanRemoval = true)
   private List<Step> steps;
   ```
2. Verify `Ingredient` entity with `recipe_id` foreign key
3. Verify `Step` entity with `recipe_id` foreign key
4. Verify `Category` entity
5. Create `RecipeCategory` entity for join table if not exists

### Step 8: Add Unit Tests
1. **RecipeServiceTest**:
   - Test successful update
   - Test recipe not found
   - Test unauthorized access (different user)
   - Test invalid category ID
   - Test full replacement of ingredients/steps
2. **RecipeControllerIntegrationTest**:
   - Test PUT with valid data returns 200
   - Test PUT with invalid data returns 400
   - Test PUT non-existent recipe returns 404
   - Test PUT another user's recipe returns 404
   - Test PUT without auth token returns 401

### Step 9: Manual Testing
1. Start application with H2 database
2. Register test user and login to get JWT token
3. Create test recipe using POST /api/v1/recipes
4. Test update with valid data → verify 200 response
5. Test update with validation errors → verify 400 response
6. Test update non-existent recipe → verify 404 response
7. Test update another user's recipe → verify 404 response
8. Verify database state: old ingredients/steps deleted, new ones created
9. Verify updatedAt timestamp updated

### Step 10: Documentation
1. Update API documentation with PUT endpoint details
2. Document request/response examples
3. Document error scenarios and status codes
4. Add endpoint to Postman collection for manual testing
