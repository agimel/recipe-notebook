# API Endpoint Implementation Plan: GET /api/v1/categories

## 1. Endpoint Overview

This endpoint retrieves all available meal type categories from the system. In the MVP, all users share the same 6 default categories (Breakfast, Lunch, Dinner, Dessert, Snacks, Drinks). The endpoint requires JWT authentication and returns the categories sorted alphabetically by name.

**Purpose**: Provide the list of available categories for recipe classification in the recipe creation/editing UI.

## 2. Request Details

- **HTTP Method**: GET
- **URL Structure**: `/api/v1/categories`
- **Parameters**:
  - **Required**: 
    - `Authorization` header with JWT token (format: `Bearer <token>`)
  - **Optional**: None
- **Request Body**: None
- **Query Parameters**: None

## 3. Types Used

### DTOs

**CategoryDTO.java**
```java
package com.recipenotebook.dto;

public class CategoryDTO {
    private Long id;
    private String name;
    private Boolean isDefault;
    
    // Constructor, getters, setters
}
```

**CategoriesResponseData.java**
```java
package com.recipenotebook.dto;

import java.util.List;

public class CategoriesResponseData {
    private List<CategoryDTO> categories;
    
    public CategoriesResponseData(List<CategoryDTO> categories) {
        this.categories = categories;
    }
    
    // Getters, setters
}
```

**ApiResponse<T>** (already exists)
```java
package com.recipenotebook.dto;

public class ApiResponse<T> {
    private String status;
    private String message;
    private T data;
    
    public static <T> ApiResponse<T> success(String message, T data) {
        return new ApiResponse<>("success", message, data);
    }
}
```

### Domain Entities

**Category.java** (already exists)
```java
@Entity
@Table(name = "categories")
public class Category {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false, unique = true, length = 50)
    private String name;
    
    @Column(name = "is_default")
    private Boolean isDefault = false;
}
```

## 4. Response Details

### Success Response (HTTP 200)

```json
{
  "status": "success",
  "message": "Categories retrieved successfully",
  "data": {
    "categories": [
      { "id": 1, "name": "Breakfast", "isDefault": true },
      { "id": 2, "name": "Dessert", "isDefault": true },
      { "id": 3, "name": "Dinner", "isDefault": true },
      { "id": 4, "name": "Drinks", "isDefault": true },
      { "id": 5, "name": "Lunch", "isDefault": true },
      { "id": 6, "name": "Snacks", "isDefault": true }
    ]
  }
}
```

**Note**: Categories are sorted alphabetically by name.

### Error Responses

**HTTP 401 - Unauthorized**
```json
{
  "status": "error",
  "message": "Authentication required",
  "data": null
}
```
- Triggered when JWT token is missing, expired, or invalid
- Handled by JwtAuthenticationFilter before reaching the controller

**HTTP 500 - Internal Server Error**
```json
{
  "status": "error",
  "message": "An unexpected error occurred while retrieving categories",
  "data": null
}
```
- Triggered by unexpected exceptions (database connectivity issues, etc.)
- Handled by global exception handler (@ControllerAdvice)

## 5. Data Flow

1. **Request Reception**:
   - Client sends GET request to `/api/v1/categories` with JWT token in Authorization header
   - JwtAuthenticationFilter intercepts request and validates JWT token

2. **Authentication**:
   - Filter extracts userId from JWT claims
   - Filter sets userId in request attribute for controller access
   - If token is invalid/expired, filter returns 401 response

3. **Controller Processing**:
   - CategoryController receives authenticated request
   - Controller calls `categoryService.getAllCategories()`
   - Controller wraps result in `ApiResponse.success()`

4. **Service Layer**:
   - CategoryService calls `categoryRepository.findAllByOrderByNameAsc()`
   - Service maps `List<Category>` entities to `List<CategoryDTO>`
   - Service wraps DTOs in `CategoriesResponseData`

5. **Repository Layer**:
   - Spring Data JPA executes: `SELECT * FROM categories ORDER BY name ASC`
   - Returns `List<Category>` entities

6. **Response Formation**:
   - Controller returns `ApiResponse<CategoriesResponseData>` with HTTP 200
   - Jackson serializes response to JSON
   - Categories appear sorted alphabetically by name

## 6. Security Considerations

### Authentication
- **JWT Token Validation**: Enforced by JwtAuthenticationFilter
- **Token Location**: Authorization header (Bearer scheme)
- **Token Expiration**: Handled by filter (returns 401 if expired)
- **User Identification**: Not required for this endpoint (shared categories)

### Authorization
- **Access Control**: Any authenticated user can access categories
- **Data Isolation**: Not applicable (categories are shared across all users)

### Data Validation
- **Input Validation**: No input parameters to validate
- **Output Sanitization**: Not required (static system data, no user-generated content)

### Security Risks (Low)
- **SQL Injection**: Not applicable (no dynamic SQL, JPA handles queries)
- **Data Exposure**: Low risk (categories are non-sensitive system data)
- **Mass Assignment**: Not applicable (read-only operation)

## 7. Error Handling

### Missing or Invalid JWT Token (HTTP 401)

**Trigger Conditions**:
- Authorization header is missing
- JWT token is malformed
- JWT token signature is invalid
- JWT token is expired

**Handling**:
- JwtAuthenticationFilter intercepts request before controller
- Filter returns 401 response with error message
- Controller is never invoked
- No error logging required (handled by filter)

**Example Response**:
```json
{
  "status": "error",
  "message": "Authentication required",
  "data": null
}
```

### Database Connectivity Issues (HTTP 500)

**Trigger Conditions**:
- H2 database file is corrupted or inaccessible
- Database connection pool exhausted
- Unexpected runtime exceptions

**Handling**:
- Service catches general exceptions
- Log error with stack trace using SLF4J
- Throw custom InternalServerErrorException
- Global exception handler (@ControllerAdvice) catches exception
- Return generic error message (don't expose internal details)

**Example Code**:
```java
@GetMapping
public ResponseEntity<ApiResponse<CategoriesResponseData>> getCategories() {
    try {
        CategoriesResponseData data = categoryService.getAllCategories();
        return ResponseEntity.ok(
            ApiResponse.success("Categories retrieved successfully", data)
        );
    } catch (Exception e) {
        log.error("Unexpected error retrieving categories", e);
        return ResponseEntity.status(500).body(
            ApiResponse.error("An unexpected error occurred while retrieving categories", null)
        );
    }
}
```

### Empty Category List (Not an Error)

**Scenario**: If categories table is empty (unlikely in MVP with default data)

**Handling**:
- Service returns empty list in `CategoriesResponseData`
- Controller returns HTTP 200 with empty categories array
- This is a valid response, not an error condition

**Example Response**:
```json
{
  "status": "success",
  "message": "Categories retrieved successfully",
  "data": {
    "categories": []
  }
}
```

## 8. Performance Considerations

### Potential Bottlenecks
- **Database Query**: Minimal impact (6 rows, indexed primary key)
- **Sorting**: Performed in database (efficient with small dataset)
- **Serialization**: Negligible (small JSON payload ~300 bytes)

### Optimization Strategies
1. **Client-Side Caching**:
   - Categories are static in MVP
   - Frontend should cache response for session duration
   - Add `Cache-Control` header: `max-age=3600` (1 hour)

2. **Database Indexing**:
   - Primary key index already exists on `id`
   - Consider adding index on `name` if sorting becomes bottleneck (overkill for 6 rows)

3. **Connection Pooling**:
   - Use default HikariCP connection pool (included in Spring Boot)
   - Default settings sufficient for MVP

### Expected Performance
- **Response Time**: < 50ms (local H2 database)
- **Throughput**: > 500 requests/second (limited by authentication overhead, not database)
- **Payload Size**: ~300 bytes (gzip compression reduces to ~150 bytes)

## 9. Implementation Steps

### Step 1: Create DTOs

**Files to Create**:
- `src/main/java/com/recipenotebook/dto/CategoryDTO.java`
- `src/main/java/com/recipenotebook/dto/CategoriesResponseData.java`

**Actions**:
- Create `CategoryDTO` with fields: id, name, isDefault
- Add Lombok annotations: `@Getter`, `@Setter`, `@NoArgsConstructor`, `@AllArgsConstructor`
- Create `CategoriesResponseData` wrapper with `List<CategoryDTO> categories` field
- Add Lombok annotations for getters/setters

**Example Implementation**:
```java
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CategoryDTO {
    private Long id;
    private String name;
    private Boolean isDefault;
}

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CategoriesResponseData {
    private List<CategoryDTO> categories;
}
```

### Step 2: Update CategoryRepository

**File to Modify**:
- `src/main/java/com/recipenotebook/repository/CategoryRepository.java`

**Actions**:
- Add method: `List<Category> findAllByOrderByNameAsc()`
- Spring Data JPA will auto-implement based on method name

**Example Implementation**:
```java
@Repository
public interface CategoryRepository extends JpaRepository<Category, Long> {
    Optional<Category> findByName(String name);
    List<Category> findAllByOrderByNameAsc();
}
```

### Step 3: Create CategoryService

**File to Create**:
- `src/main/java/com/recipenotebook/service/CategoryService.java`

**Actions**:
- Annotate with `@Service`
- Add Lombok annotations: `@RequiredArgsConstructor`, `@Slf4j`
- Inject `CategoryRepository` via constructor (final field)
- Implement `getAllCategories()` method
- Map entities to DTOs
- Wrap DTOs in `CategoriesResponseData`

**Example Implementation**:
```java
@Service
@RequiredArgsConstructor
@Slf4j
public class CategoryService {
    
    private final CategoryRepository categoryRepository;
    
    public CategoriesResponseData getAllCategories() {
        log.info("Retrieving all categories");
        
        List<Category> categories = categoryRepository.findAllByOrderByNameAsc();
        
        List<CategoryDTO> categoryDTOs = categories.stream()
            .map(this::mapToDTO)
            .collect(Collectors.toList());
        
        log.info("Retrieved {} categories", categoryDTOs.size());
        
        return new CategoriesResponseData(categoryDTOs);
    }
    
    private CategoryDTO mapToDTO(Category category) {
        CategoryDTO dto = new CategoryDTO();
        dto.setId(category.getId());
        dto.setName(category.getName());
        dto.setIsDefault(category.getIsDefault());
        return dto;
    }
}
```

### Step 4: Create CategoryController

**File to Create**:
- `src/main/java/com/recipenotebook/controller/CategoryController.java`

**Actions**:
- Annotate with `@RestController` and `@RequestMapping("/api/v1/categories")`
- Add Lombok annotations: `@RequiredArgsConstructor`, `@Slf4j`
- Inject `CategoryService` via constructor
- Implement GET endpoint mapped to root path
- Call service method
- Wrap result in `ApiResponse.success()`
- Return `ResponseEntity.ok()`

**Example Implementation**:
```java
@RestController
@RequestMapping("/api/v1/categories")
@RequiredArgsConstructor
@Slf4j
public class CategoryController {
    
    private final CategoryService categoryService;
    
    @GetMapping
    public ResponseEntity<ApiResponse<CategoriesResponseData>> getCategories() {
        log.info("GET /api/v1/categories - Retrieving all categories");
        
        CategoriesResponseData data = categoryService.getAllCategories();
        
        return ResponseEntity.ok(
            ApiResponse.success("Categories retrieved successfully", data)
        );
    }
}
```

### Step 5: Add Global Exception Handling (if not exists)

**File to Create/Modify**:
- `src/main/java/com/recipenotebook/exception/GlobalExceptionHandler.java`

**Actions**:
- Create `@ControllerAdvice` class if it doesn't exist
- Add handler for generic `Exception` class
- Log error details
- Return HTTP 500 with generic error message

**Example Implementation**:
```java
@ControllerAdvice
@Slf4j
public class GlobalExceptionHandler {
    
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<Object>> handleGenericException(Exception e) {
        log.error("Unexpected error occurred", e);
        return ResponseEntity.status(500).body(
            ApiResponse.error("An unexpected error occurred", null)
        );
    }
}
```

### Step 6: Test the Endpoint

**Manual Testing**:
1. Start the application
2. Register a user via POST /auth/register
3. Login via POST /auth/login to get JWT token
4. Call GET /api/v1/categories with Authorization header
5. Verify response contains 6 categories sorted alphabetically
6. Test without Authorization header (should return 401)
7. Test with invalid/expired token (should return 401)

**Unit Testing** (Optional for MVP):
1. Create `CategoryServiceTest.java`
2. Mock `CategoryRepository`
3. Test `getAllCategories()` method
4. Verify mapping logic
5. Verify sorting

**Integration Testing** (Optional for MVP):
1. Create `CategoryControllerIntegrationTest.java`
2. Use `@SpringBootTest` and `MockMvc`
3. Test full request/response cycle
4. Verify JWT authentication
5. Verify response structure

### Step 7: Verify Default Categories

**File to Check**:
- `src/main/resources/data.sql` or initialization logic in `AuthService`

**Actions**:
- Ensure 6 default categories are created on application startup
- Verify categories: Breakfast, Lunch, Dinner, Dessert, Snacks, Drinks
- Verify `is_default = true` for all categories

**Note**: Based on existing code, categories are created in `AuthService.createDefaultCategories()` during user registration. Ensure this logic is preserved.

## 10. Checklist

- [ ] Create `CategoryDTO.java`
- [ ] Create `CategoriesResponseData.java`
- [ ] Update `CategoryRepository` with `findAllByOrderByNameAsc()` method
- [ ] Create `CategoryService.java` with `getAllCategories()` method
- [ ] Create `CategoryController.java` with GET endpoint
- [ ] Verify global exception handler exists
- [ ] Test endpoint with valid JWT token
- [ ] Test endpoint without JWT token (expect 401)
- [ ] Test endpoint with invalid JWT token (expect 401)
- [ ] Verify categories are sorted alphabetically
- [ ] Verify all 6 default categories are returned
- [ ] (Optional) Write unit tests for CategoryService
- [ ] (Optional) Write integration tests for CategoryController
