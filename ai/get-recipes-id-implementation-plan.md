# API Endpoint Implementation Plan: GET /api/v1/recipes/{id}

## 1. Endpoint Overview

This endpoint retrieves detailed recipe information for a specific recipe ID, including all associated ingredients, steps, and categories. The endpoint enforces user ownership verification, returning 404 for both non-existent recipes and recipes belonging to other users (security through obscurity). Ingredients are returned sorted by `sortOrder`, and steps by `stepNumber`.

## 2. Request Details

- **HTTP Method**: GET
- **URL Structure**: `/api/v1/recipes/{id}`
- **Authentication**: Required (JWT token in Authorization header)
- **Path Parameters**:
  - `id` (Long, required): The unique identifier of the recipe to retrieve
- **Request Body**: None
- **Headers**:
  - `Authorization: Bearer <jwt_token>` (required)

## 3. Types Used

### DTOs

**RecipeDetailDTO**
```java
public class RecipeDetailDTO {
    private Long id;
    private String title;
    private String difficulty;
    private Integer cookingTimeMinutes;
    private List<CategoryDTO> categories;
    private List<IngredientDTO> ingredients;
    private List<StepDTO> steps;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
```

**CategoryDTO**
```java
public class CategoryDTO {
    private Long id;
    private String name;
}
```

**IngredientDTO**
```java
public class IngredientDTO {
    private Long id;
    private String quantity;
    private String unit;
    private String name;
    private Integer sortOrder;
}
```

**StepDTO**
```java
public class StepDTO {
    private Long id;
    private Integer stepNumber;
    private String instruction;
}
```

### Custom Exceptions

**RecipeNotFoundException**
```java
public class RecipeNotFoundException extends RuntimeException {
    private final Long recipeId;
    
    public RecipeNotFoundException(Long recipeId) {
        super("Recipe not found");
        this.recipeId = recipeId;
    }
}
```

## 4. Response Details

### Success Response (HTTP 200)
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
      }
    ],
    "steps": [
      {
        "id": 1,
        "stepNumber": 1,
        "instruction": "Preheat your oven to 375°F (190°C)."
      }
    ],
    "createdAt": "2025-12-15T10:30:00Z",
    "updatedAt": "2025-12-15T10:30:00Z"
  }
}
```

### Error Responses

**HTTP 404 - Not Found**
```json
{
  "status": "error",
  "message": "Recipe not found",
  "data": null
}
```

**HTTP 401 - Unauthorized**
```json
{
  "status": "error",
  "message": "Unauthorized access",
  "data": null
}
```

**HTTP 500 - Internal Server Error**
```json
{
  "status": "error",
  "message": "An unexpected error occurred",
  "data": null
}
```

## 5. Data Flow

1. **Request Reception**: Controller receives GET request with recipe `{id}` path parameter
2. **Authentication**: JWT token extracted from Authorization header and validated by JwtService
3. **User Extraction**: User ID extracted from validated JWT token
4. **Service Invocation**: Controller calls `RecipeService.getRecipeById(recipeId, userId)`
5. **Database Query**: Service queries database using `RecipeRepository.findByIdAndUserId(recipeId, userId)`
6. **Entity Retrieval**: JPA fetches Recipe entity with lazy-loaded associations (ingredients, steps, categories)
7. **Ownership Validation**: If recipe not found OR userId doesn't match, throw RecipeNotFoundException
8. **Association Loading**: Service explicitly triggers loading of:
   - `recipe.getIngredients()` - sorted by `sortOrder ASC`
   - `recipe.getSteps()` - sorted by `stepNumber ASC`
   - `recipe.getCategories()` - no specific ordering required
9. **DTO Mapping**: Service maps Recipe entity and associations to RecipeDetailDTO
10. **Response Building**: Controller wraps DTO in ApiResponse.success() and returns with HTTP 200
11. **Exception Handling**: GlobalExceptionHandler catches RecipeNotFoundException and returns 404 response

### Database Queries

**Primary Query** (RecipeRepository):
```java
@Query("SELECT r FROM Recipe r WHERE r.id = :recipeId AND r.userId = :userId")
Optional<Recipe> findByIdAndUserId(@Param("recipeId") Long recipeId, @Param("userId") Long userId);
```

**Association Queries** (triggered by lazy loading):
- Ingredients: `SELECT * FROM ingredients WHERE recipe_id = ? ORDER BY sort_order ASC`
- Steps: `SELECT * FROM steps WHERE recipe_id = ? ORDER BY step_number ASC`
- Categories: `SELECT * FROM categories c JOIN recipe_categories rc ON c.id = rc.category_id WHERE rc.recipe_id = ?`

## 6. Security Considerations

### Authentication & Authorization
- **JWT Validation**: JwtService validates token signature, expiration, and extracts user ID
- **Ownership Verification**: Recipe userId must match authenticated user ID from JWT
- **Security Through Obscurity**: Returns 404 for both non-existent recipes and unauthorized access attempts (prevents recipe ID enumeration attacks)

### Input Validation
- **Path Parameter**: `id` must be a valid Long integer (handled by Spring's type conversion)
- **Invalid ID Format**: Spring returns HTTP 400 automatically if `id` cannot be parsed as Long
- **Null/Negative IDs**: Handled implicitly by database query returning empty result

### Data Exposure Prevention
- **User Isolation**: Query explicitly filters by userId to prevent cross-user data access
- **Lazy Loading Strategy**: Only fetch associated data when recipe ownership is confirmed
- **Error Messages**: Generic "Recipe not found" message prevents information leakage about recipe existence

### Security Threats Mitigation
| Threat | Mitigation |
|--------|------------|
| Unauthorized Data Access | Combined `findByIdAndUserId()` query ensures user can only access own recipes |
| Recipe ID Enumeration | Identical 404 response for non-existent and unauthorized recipes |
| SQL Injection | Spring Data JPA uses parameterized queries automatically |
| JWT Token Theft | Token expiration enforced, HTTPS required in production |
| Mass Assignment | DTOs prevent exposure of internal entity fields (e.g., userId) |

## 7. Error Handling

### Exception Scenarios

| Scenario | Exception | HTTP Status | Response Message |
|----------|-----------|-------------|------------------|
| Recipe ID not found | RecipeNotFoundException | 404 | "Recipe not found" |
| Recipe belongs to different user | RecipeNotFoundException | 404 | "Recipe not found" |
| Invalid/expired JWT token | JwtValidationException | 401 | "Unauthorized access" |
| Missing Authorization header | JwtValidationException | 401 | "Unauthorized access" |
| Invalid ID format (non-numeric) | MethodArgumentTypeMismatchException | 400 | "Invalid recipe ID format" |
| Database connection failure | Exception (generic) | 500 | "An unexpected error occurred" |

### GlobalExceptionHandler Additions

Add handler for RecipeNotFoundException:
```java
@ExceptionHandler(RecipeNotFoundException.class)
public ResponseEntity<ApiResponse<Void>> handleRecipeNotFound(RecipeNotFoundException ex) {
    log.warn("Recipe access attempt failed: Recipe ID {} not found or access denied", ex.getRecipeId());
    return ResponseEntity.status(HttpStatus.NOT_FOUND)
            .body(ApiResponse.error("Recipe not found", null));
}
```

Add handler for invalid path parameter types:
```java
@ExceptionHandler(MethodArgumentTypeMismatchException.class)
public ResponseEntity<ApiResponse<Void>> handleTypeMismatch(MethodArgumentTypeMismatchException ex) {
    log.warn("Invalid path parameter: {}", ex.getValue());
    return ResponseEntity.status(HttpStatus.BAD_REQUEST)
            .body(ApiResponse.error("Invalid recipe ID format", null));
}
```

### Logging Strategy
- **INFO**: Successful recipe retrievals (optional, may be verbose)
- **WARN**: RecipeNotFoundException (includes recipe ID for audit trail)
- **WARN**: Invalid ID format attempts
- **ERROR**: Unexpected database or system errors

## 8. Performance Considerations

### Potential Bottlenecks
- **N+1 Query Problem**: Lazy loading ingredients, steps, and categories triggers separate queries
- **Large Recipe Data**: Recipes with 50+ ingredients or steps may cause memory overhead
- **Concurrent Requests**: Multiple users retrieving recipes simultaneously may strain database connections

### Optimization Strategies
- **Eager Fetching**: Use `@Query` with `JOIN FETCH` to load associations in single query:
  ```java
  @Query("SELECT r FROM Recipe r " +
         "LEFT JOIN FETCH r.ingredients " +
         "LEFT JOIN FETCH r.steps " +
         "LEFT JOIN FETCH r.categories " +
         "WHERE r.id = :recipeId AND r.userId = :userId")
  Optional<Recipe> findByIdAndUserIdWithAssociations(@Param("recipeId") Long recipeId, @Param("userId") Long userId);
  ```
- **Indexed Queries**: Database indexes already exist on `recipe_id` foreign keys (performance validated)
- **DTO Projection**: Consider using Spring Data JPA projections if full entity hydration becomes expensive
- **Caching** (Future): Add `@Cacheable` annotation for frequently accessed recipes (post-MVP)

### Expected Performance
- **Average Response Time**: 50-150ms (single database query with joins)
- **Database Load**: 1 query per request (with JOIN FETCH optimization)
- **Memory Footprint**: ~5-10KB per recipe (typical recipe with 10 ingredients, 5 steps)

## 9. Implementation Steps

### Step 1: Create DTOs
1. Create `RecipeDetailDTO` in `com.recipenotebook.dto` package
2. Create `CategoryDTO` with id and name fields
3. Create `IngredientDTO` with all required fields including sortOrder
4. Create `StepDTO` with id, stepNumber, and instruction fields
5. Add Lombok annotations (`@Getter`, `@Setter`, `@NoArgsConstructor`, `@AllArgsConstructor`)
6. Ensure all DTOs use appropriate Java types (Long, Integer, String, LocalDateTime)

### Step 2: Create Custom Exception
1. Create `RecipeNotFoundException` in `com.recipenotebook.exception` package
2. Extend `RuntimeException`
3. Add `recipeId` field with getter for logging purposes
4. Add constructor accepting `Long recipeId`

### Step 3: Update GlobalExceptionHandler
1. Add `@ExceptionHandler(RecipeNotFoundException.class)` method
2. Log warning with recipe ID (avoid exposing whether recipe exists or access denied)
3. Return `ApiResponse.error("Recipe not found", null)` with HTTP 404
4. Add `@ExceptionHandler(MethodArgumentTypeMismatchException.class)` for invalid ID format
5. Return HTTP 400 with "Invalid recipe ID format" message

### Step 4: Update RecipeRepository
1. Open `RecipeRepository` interface
2. Add optimized query method with JOIN FETCH:
   ```java
   @Query("SELECT DISTINCT r FROM Recipe r " +
          "LEFT JOIN FETCH r.ingredients i " +
          "LEFT JOIN FETCH r.steps s " +
          "LEFT JOIN FETCH r.categories c " +
          "WHERE r.id = :recipeId AND r.userId = :userId " +
          "ORDER BY i.sortOrder ASC, s.stepNumber ASC")
   Optional<Recipe> findByIdAndUserIdWithAssociations(@Param("recipeId") Long recipeId, @Param("userId") Long userId);
   ```
3. Note: `DISTINCT` prevents duplicate Recipe entities when fetching multiple associations

### Step 5: Create/Update RecipeService
1. Create `RecipeService` class in `com.recipenotebook.service` package (if not exists)
2. Annotate with `@Service` and `@Slf4j`
3. Inject `RecipeRepository` via constructor
4. Implement `getRecipeById(Long recipeId, Long userId)` method:
   - Call repository's `findByIdAndUserIdWithAssociations(recipeId, userId)`
   - Throw `RecipeNotFoundException(recipeId)` if Optional is empty
   - Map Recipe entity to RecipeDetailDTO
   - Ensure ingredients sorted by sortOrder (handled by query ORDER BY)
   - Ensure steps sorted by stepNumber (handled by query ORDER BY)
   - Map categories to CategoryDTO list
   - Log successful retrieval at DEBUG level

### Step 6: Create DTO Mapper Methods
1. Add private mapper methods in `RecipeService`:
   - `mapToRecipeDetailDTO(Recipe recipe)` - maps Recipe entity to RecipeDetailDTO
   - `mapToCategoryDTO(Category category)` - maps Category entity to CategoryDTO
   - `mapToIngredientDTO(Ingredient ingredient)` - maps Ingredient entity to IngredientDTO
   - `mapToStepDTO(Step step)` - maps Step entity to StepDTO
2. Ensure proper null handling in mappers
3. Use streams for collection mappings (e.g., `recipe.getCategories().stream().map(this::mapToCategoryDTO).toList()`)

### Step 7: Create/Update RecipeController
1. Create `RecipeController` class in `com.recipenotebook.controller` package (if not exists)
2. Annotate with `@RestController`, `@RequestMapping("/api/v1/recipes")`, `@RequiredArgsConstructor`
3. Inject `RecipeService` and `JwtService` via constructor
4. Implement GET endpoint:
   ```java
   @GetMapping("/{id}")
   public ResponseEntity<ApiResponse<RecipeDetailDTO>> getRecipeById(
       @PathVariable Long id,
       @RequestHeader("Authorization") String authHeader
   )
   ```
5. Extract JWT token from Authorization header (remove "Bearer " prefix)
6. Validate token and extract userId using `JwtService.extractUserId(token)`
7. Call `recipeService.getRecipeById(id, userId)`
8. Wrap result in `ApiResponse.success("Recipe retrieved successfully", recipeDetailDTO)`
9. Return `ResponseEntity.ok()` with ApiResponse

### Step 8: Write Unit Tests
1. Create `RecipeServiceTest` in `src/test/java/com/recipenotebook/service`
2. Test scenarios:
   - Successful recipe retrieval with all associations
   - RecipeNotFoundException when recipe doesn't exist
   - RecipeNotFoundException when recipe belongs to different user
   - Verify ingredients sorted by sortOrder
   - Verify steps sorted by stepNumber
3. Use Mockito to mock `RecipeRepository`
4. Verify logging behavior with appropriate log levels

### Step 9: Write Integration Tests
1. Create `RecipeControllerIntegrationTest` in `src/test/java/com/recipenotebook/controller`
2. Use `@SpringBootTest` and `@AutoConfigureMockMvc`
3. Test scenarios:
   - Successful GET with valid JWT and owned recipe (HTTP 200)
   - Not found for non-existent recipe (HTTP 404)
   - Not found for recipe owned by different user (HTTP 404)
   - Unauthorized for missing JWT token (HTTP 401)
   - Unauthorized for invalid JWT token (HTTP 401)
   - Bad request for invalid ID format (HTTP 400)
4. Verify response structure matches API specification
5. Verify ingredients and steps ordering

### Step 10: Manual Testing
1. Start Spring Boot application
2. Register test user and obtain JWT token (use existing POST /api/v1/auth/register and POST /api/v1/auth/login endpoints)
3. Create test recipe with POST /api/v1/recipes (if endpoint exists) or insert via data.sql
4. Test GET /api/v1/recipes/{id} with valid token and owned recipe
5. Test GET with recipe ID belonging to different user (should return 404)
6. Test GET with non-existent recipe ID (should return 404)
7. Test GET without Authorization header (should return 401)
8. Test GET with malformed ID (e.g., /api/v1/recipes/abc) (should return 400)
9. Verify response JSON structure matches specification exactly
10. Verify ingredients ordered by sortOrder ascending
11. Verify steps ordered by stepNumber ascending

### Step 11: Documentation Updates
1. Update API documentation (if exists) with endpoint details
2. Add example requests/responses to README.md or API docs
3. Document authentication requirements
4. Note security through obscurity pattern (404 for both non-existent and unauthorized)

### Step 12: Code Review Checklist
- [ ] All DTOs follow naming conventions and use Lombok
- [ ] Custom exception properly extends RuntimeException
- [ ] GlobalExceptionHandler includes all required exception handlers
- [ ] Repository query uses JOIN FETCH to avoid N+1 problem
- [ ] Service method validates ownership before returning data
- [ ] Controller extracts and validates JWT token correctly
- [ ] DTO mappers handle null values appropriately
- [ ] Ingredients sorted by sortOrder in response
- [ ] Steps sorted by stepNumber in response
- [ ] All error responses use ApiResponse.error() format
- [ ] Success response uses ApiResponse.success() format
- [ ] Logging follows SLF4J patterns with appropriate levels
- [ ] Unit tests achieve 70%+ coverage for RecipeService
- [ ] Integration tests cover all error scenarios
- [ ] Manual testing confirms API specification compliance
- [ ] Code follows Java general guidelines (naming, formatting, imports)
- [ ] Code follows Spring Boot guidelines (constructor injection, stateless services)
- [ ] Security through obscurity implemented correctly (identical 404 responses)
