# API Endpoint Implementation Plan: GET /api/v1/recipes

## 1. Endpoint Overview

This endpoint retrieves a paginated list of recipes for the authenticated user with support for filtering, sorting, and searching. The endpoint automatically filters results to show only recipes belonging to the authenticated user (extracted from JWT token). It supports filtering by category IDs (OR operation), difficulty level, and partial title search (all filters are AND-ed together). Results are returned with pagination metadata including total pages, total recipes, and navigation flags.

## 2. Request Details

- **HTTP Method**: GET
- **URL Structure**: `/api/v1/recipes`
- **Authentication**: Required (JWT token in Authorization header)
- **Content-Type**: N/A (no request body)

### Query Parameters

**All Optional**:
- `page` (Integer, default: 0): Zero-indexed page number, must be >= 0
- `size` (Integer, default: 20): Items per page, must be between 1 and 100
- `sort` (String, default: "title"): Sort field, must be one of: "title", "cookingTimeMinutes", "createdAt", "updatedAt"
- `direction` (String, default: "asc"): Sort direction, must be "asc" or "desc"
- `categoryIds` (String, optional): Comma-separated list of category IDs (e.g., "1,2,4")
- `difficulty` (String, optional): Filter by difficulty, must be "EASY", "MEDIUM", or "HARD"
- `search` (String, optional): Partial, case-insensitive search on recipe title

### Example Requests

```
GET /api/v1/recipes
GET /api/v1/recipes?page=0&size=20
GET /api/v1/recipes?categoryIds=1,2&difficulty=EASY
GET /api/v1/recipes?search=chocolate
GET /api/v1/recipes?categoryIds=4&difficulty=MEDIUM&search=cake&sort=cookingTimeMinutes&direction=desc
```

## 3. Types Used

### Response DTOs

**RecipeListResponseData**
```java
public class RecipeListResponseData {
    private List<RecipeSummaryDTO> recipes;
    private PaginationDTO pagination;
}
```

**RecipeSummaryDTO**
```java
public class RecipeSummaryDTO {
    private Long id;
    private String title;
    private String difficulty; // "EASY", "MEDIUM", or "HARD"
    private Integer cookingTimeMinutes;
    private List<CategoryDTO> categories;
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

**PaginationDTO**
```java
public class PaginationDTO {
    private Integer currentPage;
    private Integer totalPages;
    private Long totalRecipes;
    private Integer pageSize;
    private Boolean hasNext;
    private Boolean hasPrevious;
}
```

**ErrorDetails** (for validation errors)
```java
public class ErrorDetails {
    private Map<String, String> errors;
}
```

### Service Layer Model

**RecipeFilterCriteria** (internal command model for service)
```java
public class RecipeFilterCriteria {
    private Long userId; // From JWT
    private List<Long> categoryIds;
    private Difficulty difficulty;
    private String searchQuery;
    private int page;
    private int size;
    private String sortField;
    private String sortDirection;
}
```

## 4. Response Details

### Success Response (HTTP 200)

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

### Empty Results (HTTP 200)

```json
{
  "status": "success",
  "message": "Recipes retrieved successfully",
  "data": {
    "recipes": [],
    "pagination": {
      "currentPage": 0,
      "totalPages": 0,
      "totalRecipes": 0,
      "pageSize": 20,
      "hasNext": false,
      "hasPrevious": false
    }
  }
}
```

### Error Responses

**HTTP 401 - Unauthorized**:
```json
{
  "status": "error",
  "message": "Authentication required",
  "data": null
}
```

**HTTP 400 - Invalid Query Parameters**:
```json
{
  "status": "error",
  "message": "Invalid query parameter",
  "data": {
    "errors": {
      "difficulty": "Must be one of: EASY, MEDIUM, HARD",
      "sort": "Must be one of: title, cookingTimeMinutes, createdAt, updatedAt",
      "size": "Must be between 1 and 100"
    }
  }
}
```

## 5. Data Flow

1. **Request Reception** (Controller Layer):
   - Extract JWT token from Authorization header
   - Parse and validate all query parameters
   - Extract userId from JWT token using JwtService
   - Build RecipeFilterCriteria object

2. **Business Logic** (Service Layer):
   - RecipeService.getRecipes(RecipeFilterCriteria) is called
   - Build dynamic JPA Specification or JPQL query based on filters:
     - Filter by userId (mandatory, from JWT)
     - Filter by categoryIds if provided (OR operation on categories)
     - Filter by difficulty if provided
     - Filter by search query if provided (case-insensitive LIKE on title)
   - Apply sorting (validate sort field against allowed fields)
   - Execute paginated query using Spring Data PageRequest
   - Transform Recipe entities to RecipeSummaryDTO objects
   - Build PaginationDTO from Spring Data Page metadata

3. **Data Access** (Repository Layer):
   - RecipeRepository extends JpaRepository and JpaSpecificationExecutor
   - Use Specification pattern or custom JPQL query for dynamic filtering
   - Fetch recipes with categories (use JOIN FETCH to avoid N+1 problem)
   - Return Page<Recipe> object

4. **Response Construction**:
   - Map Recipe entities to RecipeSummaryDTO
   - Extract categories and map to CategoryDTO
   - Calculate pagination metadata (hasNext, hasPrevious)
   - Wrap in RecipeListResponseData
   - Return ApiResponse with status="success"

## 6. Security Considerations

### Authentication & Authorization
- **JWT Validation**: Verify JWT token is valid and not expired using JwtService
- **User Isolation**: Automatically filter recipes by userId from JWT (never trust client-provided userId)
- **Token Extraction**: Use Authorization header with "Bearer {token}" format

### Data Validation
- **Query Parameter Validation**:
  - Validate `page` >= 0 (prevent negative page numbers)
  - Validate `size` between 1 and 100 (prevent DoS via large page sizes)
  - Validate `sort` is one of: "title", "cookingTimeMinutes", "createdAt", "updatedAt"
  - Validate `direction` is "asc" or "desc"
  - Validate `difficulty` matches enum values: "EASY", "MEDIUM", "HARD"
  - Validate `categoryIds` are parseable as Long values
- **Search Parameter Sanitization**:
  - Use parameterized queries to prevent SQL injection
  - Trim and sanitize search input (no special SQL characters)
  - Use JPA Specification or JPQL with named parameters

### Potential Threats
- **SQL Injection**: Mitigated by using JPA Specification or parameterized JPQL queries
- **Unauthorized Access**: Mitigated by filtering results by authenticated userId
- **DoS via Large Queries**: Mitigated by enforcing max page size of 100
- **Information Disclosure**: Never return recipes belonging to other users

## 7. Error Handling

### Validation Errors (HTTP 400)

| Scenario | Error Message | Response Field |
|----------|--------------|----------------|
| Invalid difficulty value | "Must be one of: EASY, MEDIUM, HARD" | `data.errors.difficulty` |
| Invalid sort field | "Must be one of: title, cookingTimeMinutes, createdAt, updatedAt" | `data.errors.sort` |
| Invalid sort direction | "Must be one of: asc, desc" | `data.errors.direction` |
| Page number negative | "Page number must be >= 0" | `data.errors.page` |
| Size out of range | "Page size must be between 1 and 100" | `data.errors.size` |
| Invalid categoryIds format | "Category IDs must be valid numbers" | `data.errors.categoryIds` |

### Authentication Errors (HTTP 401)

| Scenario | Error Message |
|----------|--------------|
| Missing JWT token | "Authentication required" |
| Invalid JWT token | "Invalid authentication token" |
| Expired JWT token | "Authentication token expired" |

### Server Errors (HTTP 500)

| Scenario | Error Message |
|----------|--------------|
| Database connection failure | "Internal server error" |
| Unexpected exception | "Internal server error" |

### Error Logging

- Log all validation errors at DEBUG level
- Log authentication failures at WARN level
- Log server errors at ERROR level with full stack trace
- Never log sensitive data (JWT tokens, user passwords)

## 8. Performance Considerations

### Potential Bottlenecks
1. **N+1 Query Problem**: Loading categories for each recipe separately
   - **Solution**: Use JOIN FETCH in JPQL query to load categories in single query
2. **Large Result Sets**: Filtering thousands of recipes without indexes
   - **Solution**: Ensure database indexes on `user_id`, `difficulty`, `created_at`, `updated_at`, `cooking_time_minutes`
3. **Full Table Scans**: Search query without index on title
   - **Solution**: Add index on `title` column for LIKE queries

### Optimization Strategies
- Use Spring Data Pageable for efficient pagination (LIMIT/OFFSET in SQL)
- Fetch only required fields in DTOs (avoid loading ingredients and steps for list view)
- Use database connection pooling (Spring Boot default HikariCP)
- Cache category lookups if categories are static (optional for MVP)
- Consider adding database index on (user_id, created_at) for default sort

## 9. Implementation Steps

### Step 1: Create Response DTOs
1. Create `CategoryDTO.java` in `dto` package with `id` and `name` fields
2. Create `RecipeSummaryDTO.java` with all required fields (id, title, difficulty, cookingTimeMinutes, categories, createdAt, updatedAt)
3. Create `PaginationDTO.java` with pagination metadata fields
4. Create `RecipeListResponseData.java` combining recipes and pagination
5. Create `ErrorDetails.java` with Map<String, String> errors field
6. Add Lombok annotations (@Getter, @Setter, @NoArgsConstructor, @AllArgsConstructor) to all DTOs

### Step 2: Update Repository Layer
1. Update `RecipeRepository` to extend `JpaSpecificationExecutor<Recipe>`:
   ```java
   public interface RecipeRepository extends JpaRepository<Recipe, Long>, JpaSpecificationExecutor<Recipe>
   ```
2. Create utility class `RecipeSpecification.java` with static methods for building Specifications:
   - `hasUserId(Long userId)` - Filter by user
   - `hasCategoryIds(List<Long> categoryIds)` - Filter by categories (OR)
   - `hasDifficulty(Difficulty difficulty)` - Filter by difficulty
   - `titleContains(String search)` - Case-insensitive search on title
3. Combine specifications using `Specification.where()` and `.and()` methods

### Step 3: Implement Service Layer
1. Create `RecipeFilterCriteria.java` command model class
2. Add method to `RecipeService`:
   ```java
   public RecipeListResponseData getRecipes(RecipeFilterCriteria criteria)
   ```
3. Implementation logic:
   - Build Specification from criteria using RecipeSpecification utility
   - Create PageRequest with sort and pagination
   - Call `recipeRepository.findAll(specification, pageRequest)`
   - Map Page<Recipe> to RecipeListResponseData:
     - Transform recipes to RecipeSummaryDTO
     - Extract categories and map to CategoryDTO
     - Build PaginationDTO from Page metadata
   - Return RecipeListResponseData

### Step 4: Implement Controller Layer
1. Add GET endpoint to `RecipeController`:
   ```java
   @GetMapping
   public ResponseEntity<ApiResponse<RecipeListResponseData>> getRecipes(
       @RequestParam(defaultValue = "0") int page,
       @RequestParam(defaultValue = "20") int size,
       @RequestParam(defaultValue = "title") String sort,
       @RequestParam(defaultValue = "asc") String direction,
       @RequestParam(required = false) String categoryIds,
       @RequestParam(required = false) String difficulty,
       @RequestParam(required = false) String search,
       @RequestHeader("Authorization") String authHeader
   )
   ```
2. Validate query parameters manually (since @Valid doesn't work on @RequestParam):
   - Validate page >= 0
   - Validate size between 1 and 100
   - Validate sort field is in allowed list
   - Validate direction is "asc" or "desc"
   - Validate difficulty is valid enum value if provided
   - Parse categoryIds as comma-separated Longs
3. Extract JWT token from Authorization header
4. Extract userId from JWT using JwtService
5. Build RecipeFilterCriteria object
6. Call RecipeService.getRecipes(criteria)
7. Return ResponseEntity with ApiResponse.success()

### Step 5: Implement Error Handling
1. Add validation helper method in controller or separate validator class:
   ```java
   private void validateQueryParameters(int page, int size, String sort, String direction, String difficulty)
   ```
2. Throw custom `ValidationException` with field errors if validation fails
3. Update `GlobalExceptionHandler` to handle ValidationException:
   - Return 400 status
   - Map field errors to ErrorDetails object
   - Wrap in ApiResponse.error()

### Step 6: Add Unit Tests
1. Create `RecipeServiceTest.java`:
   - Test getRecipes with no filters (default pagination)
   - Test filtering by categoryIds (single and multiple)
   - Test filtering by difficulty
   - Test search functionality (case-insensitive)
   - Test combined filters (categoryIds + difficulty + search)
   - Test sorting (different fields and directions)
   - Test pagination (different pages and sizes)
   - Test user isolation (only return recipes for authenticated user)
   - Mock RecipeRepository and verify Specification and PageRequest
2. Test edge cases:
   - Empty results
   - Page beyond total pages
   - Search with no matches

### Step 7: Add Integration Tests
1. Create `RecipeControllerIntegrationTest.java`:
   - Test GET /api/v1/recipes with valid JWT
   - Test GET /api/v1/recipes without JWT (expect 401)
   - Test with invalid query parameters (expect 400)
   - Test filtering and sorting combinations
   - Verify response structure matches specification
   - Verify user isolation (user A can't see user B's recipes)

### Step 8: Manual Testing
1. Start application and generate JWT token via POST /api/v1/auth/login
2. Test with Postman:
   - GET /api/v1/recipes (default pagination)
   - GET /api/v1/recipes?page=1&size=10
   - GET /api/v1/recipes?categoryIds=1,2&difficulty=EASY
   - GET /api/v1/recipes?search=chocolate
   - GET /api/v1/recipes?sort=cookingTimeMinutes&direction=desc
3. Verify response format matches specification
4. Verify pagination metadata is correct
5. Verify filtering works correctly (OR for categories, AND for all filters)
6. Test error scenarios (invalid parameters, missing JWT)

### Step 9: Database Indexing (Optional but Recommended)
1. Add indexes to schema.sql or create migration script:
   ```sql
   CREATE INDEX idx_recipes_user_id ON recipes(user_id);
   CREATE INDEX idx_recipes_difficulty ON recipes(difficulty);
   CREATE INDEX idx_recipes_created_at ON recipes(created_at);
   CREATE INDEX idx_recipes_title ON recipes(title);
   ```
2. Add composite index for common queries:
   ```sql
   CREATE INDEX idx_recipes_user_created ON recipes(user_id, created_at DESC);
   ```

### Step 10: Documentation
1. Update README.md with endpoint documentation
2. Add example curl commands for testing
3. Document query parameter validation rules
4. Add notes about filtering behavior (OR for categories, AND for all filters)
