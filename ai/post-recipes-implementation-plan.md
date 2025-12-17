# API Endpoint Implementation Plan: POST /api/v1/recipes

## 1. Endpoint Overview

This endpoint creates a new recipe in the system. The authenticated user submits recipe details including title, difficulty, cooking time, categories, ingredients, and cooking steps. The recipe is automatically associated with the user from the JWT token. The endpoint performs validation on all inputs, verifies that referenced categories exist, and creates all related records in a single transaction. Upon success, it returns a 201 status code with the newly created recipe's ID.

## 2. Request Details

- **HTTP Method**: POST
- **URL Structure**: `/api/v1/recipes`
- **Authentication**: Required (JWT token in Authorization header)
- **Content-Type**: `application/json`

### Parameters

**Required (all in request body)**:
- `title` (String): Recipe name, 1-100 characters
- `difficulty` (String): Must be "EASY", "MEDIUM", or "HARD"
- `cookingTimeMinutes` (Integer): Positive integer representing total cooking time
- `categoryIds` (Array of Long): At least 1 category ID, all must exist in database
- `ingredients` (Array): At least 1 ingredient object
  - `quantity` (String): Amount, max 20 characters (supports fractions like "1/2")
  - `unit` (String): Measurement unit, max 20 characters
  - `name` (String): Ingredient name, max 50 characters
- `steps` (Array): At least 2 step objects
  - `instruction` (String): Step instruction, 1-500 characters

**Optional**: None

### Request Body Example

```json
{
  "title": "Classic Chocolate Chip Cookies",
  "difficulty": "EASY",
  "cookingTimeMinutes": 25,
  "categoryIds": [4, 5],
  "ingredients": [
    {
      "quantity": "2",
      "unit": "cups",
      "name": "all-purpose flour"
    },
    {
      "quantity": "1",
      "unit": "cup",
      "name": "chocolate chips"
    }
  ],
  "steps": [
    {
      "instruction": "Preheat oven to 375°F and line baking sheets with parchment paper."
    },
    {
      "instruction": "Mix flour and chocolate chips in a bowl until well combined."
    },
    {
      "instruction": "Bake for 10-12 minutes until golden brown."
    }
  ]
}
```

## 3. Types Used

### Request DTOs

**CreateRecipeRequest**
```java
public class CreateRecipeRequest {
    @NotBlank(message = "Title is required")
    @Size(min = 1, max = 100, message = "Title must be between 1 and 100 characters")
    private String title;

    @NotNull(message = "Difficulty is required")
    @Pattern(regexp = "^(EASY|MEDIUM|HARD)$", message = "Difficulty must be EASY, MEDIUM, or HARD")
    private String difficulty;

    @NotNull(message = "Cooking time is required")
    @Min(value = 1, message = "Cooking time must be at least 1 minute")
    private Integer cookingTimeMinutes;

    @NotEmpty(message = "At least one category is required")
    @Size(min = 1, message = "At least one category is required")
    private List<Long> categoryIds;

    @NotEmpty(message = "At least one ingredient is required")
    @Size(min = 1, message = "At least one ingredient is required")
    @Valid
    private List<IngredientRequest> ingredients;

    @NotEmpty(message = "At least two steps are required")
    @Size(min = 2, message = "At least two steps are required")
    @Valid
    private List<StepRequest> steps;
}
```

**IngredientRequest** (nested DTO)
```java
public class IngredientRequest {
    @NotBlank(message = "Quantity is required")
    @Size(max = 20, message = "Quantity must not exceed 20 characters")
    private String quantity;

    @NotBlank(message = "Unit is required")
    @Size(max = 20, message = "Unit must not exceed 20 characters")
    private String unit;

    @NotBlank(message = "Ingredient name is required")
    @Size(max = 50, message = "Ingredient name must not exceed 50 characters")
    private String name;
}
```

**StepRequest** (nested DTO)
```java
public class StepRequest {
    @NotBlank(message = "Instruction is required")
    @Size(min = 1, max = 500, message = "Instruction must be between 1 and 500 characters")
    private String instruction;
}
```

### Response DTOs

**ApiResponse<T>** (generic wrapper)
```java
public class ApiResponse<T> {
    private String status;
    private String message;
    private T data;
}
```

**RecipeIdResponse**
```java
public class RecipeIdResponse {
    private Long recipeId;
}
```

**ErrorDetails**
```java
public class ErrorDetails {
    private Map<String, String> errors;
}
```

### Domain Entities

**Recipe**
```java
@Entity
@Table(name = "recipes")
public class Recipe {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(nullable = false, length = 100)
    private String title;

    @Column(nullable = false, length = 10)
    private String difficulty;

    @Column(name = "cooking_time_minutes", nullable = false)
    private Integer cookingTimeMinutes;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @OneToMany(cascade = CascadeType.ALL, orphanRemoval = true)
    @JoinColumn(name = "recipe_id", nullable = false)
    private List<Ingredient> ingredients = new ArrayList<>();

    @OneToMany(cascade = CascadeType.ALL, orphanRemoval = true)
    @JoinColumn(name = "recipe_id", nullable = false)
    @OrderBy("stepNumber ASC")
    private List<Step> steps = new ArrayList<>();

    @ManyToMany
    @JoinTable(
        name = "recipe_categories",
        joinColumns = @JoinColumn(name = "recipe_id"),
        inverseJoinColumns = @JoinColumn(name = "category_id")
    )
    private Set<Category> categories = new HashSet<>();

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
```

**Ingredient**
```java
@Entity
@Table(name = "ingredients", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"recipe_id", "sort_order"})
})
public class Ingredient {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "recipe_id", nullable = false, insertable = false, updatable = false)
    private Long recipeId;

    @Column(nullable = false, length = 20)
    private String quantity;

    @Column(nullable = false, length = 20)
    private String unit;

    @Column(nullable = false, length = 50)
    private String name;

    @Column(name = "sort_order", nullable = false)
    private Integer sortOrder;
}
```

**Step**
```java
@Entity
@Table(name = "steps", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"recipe_id", "step_number"})
})
public class Step {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "recipe_id", nullable = false, insertable = false, updatable = false)
    private Long recipeId;

    @Column(name = "step_number", nullable = false)
    private Integer stepNumber;

    @Column(nullable = false, length = 500)
    private String instruction;
}
```

**Category**
```java
@Entity
@Table(name = "categories")
public class Category {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 50)
    private String name;

    @Column(name = "is_default", nullable = false)
    private Boolean isDefault = false;
}
```

## 4. Response Details

### Success Response (HTTP 201)

```json
{
  "status": "success",
  "message": "Recipe created successfully",
  "data": {
    "recipeId": 42
  }
}
```

### Error Responses

**HTTP 400 - Validation Error**
```json
{
  "status": "error",
  "message": "Validation failed",
  "data": {
    "errors": {
      "title": "Title is required",
      "ingredients": "At least one ingredient is required",
      "steps": "At least two steps are required"
    }
  }
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

**HTTP 404 - Category Not Found**
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

**HTTP 500 - Internal Server Error**
```json
{
  "status": "error",
  "message": "An unexpected error occurred",
  "data": null
}
```

## 5. Data Flow

### Request Flow

1. **Authentication Layer**: JWT token is validated and userId is extracted
2. **Controller Layer**: `RecipeController.createRecipe()` receives the request
   - Validates request body using `@Valid` annotation
   - Extracts userId from authentication context
   - Delegates to service layer
3. **Service Layer**: `RecipeService.createRecipe(request, userId)`
   - Validates all categoryIds exist in database
   - Creates Recipe entity with userId
   - Creates Ingredient entities with sequential sortOrder (1, 2, 3...)
   - Creates Step entities with sequential stepNumber (1, 2, 3...)
   - Associates categories with recipe
   - Saves recipe (cascades to ingredients and steps)
   - Returns recipe ID
4. **Repository Layer**: 
   - `RecipeRepository.save()` persists recipe
   - `CategoryRepository.findAllById()` fetches categories
5. **Response**: Controller wraps result in ApiResponse and returns HTTP 201

### Database Operations

**Transaction Scope**: Entire operation wrapped in `@Transactional`

**SQL Operations** (executed in order):
1. `SELECT * FROM categories WHERE id IN (?)` - Verify categories exist
2. `INSERT INTO recipes (user_id, title, difficulty, cooking_time_minutes, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)`
3. `INSERT INTO ingredients (recipe_id, quantity, unit, name, sort_order) VALUES (?, ?, ?, ?, ?)` - Batch insert
4. `INSERT INTO steps (recipe_id, step_number, instruction) VALUES (?, ?, ?)` - Batch insert
5. `INSERT INTO recipe_categories (recipe_id, category_id) VALUES (?, ?)` - Batch insert

### Side Effects

- New recipe record created with `createdAt` and `updatedAt` timestamps
- Ingredients assigned continuous sortOrder starting from 1
- Steps assigned continuous stepNumber starting from 1
- Recipe-category associations created in junction table
- Recipe automatically associated with authenticated user

## 6. Security Considerations

### Authentication & Authorization

- **JWT Validation**: Token must be present and valid in Authorization header
- **User Association**: userId extracted from JWT claims, not from request body (prevents impersonation)
- **Resource Ownership**: Recipe automatically linked to authenticated user

### Input Validation

- **Bean Validation**: All request fields validated using JSR-380 annotations
- **SQL Injection Prevention**: Spring Data JPA uses parameterized queries
- **Category Validation**: Verify all categoryIds exist before creating recipe (prevents foreign key violations and invalid references)
- **Data Sanitization**: String fields limited by @Size annotations to prevent buffer overflow

### Data Integrity

- **Transaction Management**: All database operations in single transaction (rollback on any failure)
- **Cascade Operations**: Ingredients and steps automatically saved with recipe (orphanRemoval = true)
- **Unique Constraints**: Database enforces unique (recipe_id, sort_order) and (recipe_id, step_number)

### Potential Security Threats

1. **Mass Assignment Attack**: Mitigated by using dedicated DTOs instead of accepting entity objects
2. **Category Injection**: Mitigated by validating category IDs exist in database
3. **Data Tampering**: userId from JWT only, cannot be overridden by request
4. **XSS (Stored)**: Input validation limits characters, but frontend must also encode output
5. **DoS via Large Payload**: Consider adding max array size limits (e.g., max 50 ingredients, max 20 steps)

## 7. Error Handling

### Validation Errors (HTTP 400)

**Trigger Conditions**:
- Missing required fields (title, difficulty, cookingTimeMinutes, categoryIds, ingredients, steps)
- Field value constraints violated (@Size, @Min, @Pattern)
- Less than 1 ingredient provided
- Less than 2 steps provided
- Empty categoryIds list

**Handling**:
- Controller method annotated with `@Valid`
- `MethodArgumentNotValidException` caught by `@ControllerAdvice`
- Extract field errors from `BindingResult`
- Return ApiResponse with status="error", map of field→message

**Example Code**:
```java
@ExceptionHandler(MethodArgumentNotValidException.class)
public ResponseEntity<ApiResponse<ErrorDetails>> handleValidationException(
    MethodArgumentNotValidException ex) {
    
    Map<String, String> errors = new HashMap<>();
    ex.getBindingResult().getFieldErrors().forEach(error -> 
        errors.put(error.getField(), error.getDefaultMessage())
    );
    
    ErrorDetails errorDetails = new ErrorDetails();
    errorDetails.setErrors(errors);
    
    ApiResponse<ErrorDetails> response = new ApiResponse<>();
    response.setStatus("error");
    response.setMessage("Validation failed");
    response.setData(errorDetails);
    
    return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
}
```

### Authentication Errors (HTTP 401)

**Trigger Conditions**:
- Missing Authorization header
- Invalid JWT token format
- Expired JWT token
- Token signature verification failure

**Handling**:
- Handled by authentication filter/interceptor
- Return ApiResponse with status="error", message="Unauthorized access"
- Log authentication failures (without sensitive token data)

### Category Not Found (HTTP 404)

**Trigger Conditions**:
- One or more categoryIds do not exist in categories table

**Handling**:
- Service validates categories before creating recipe
- Throws custom `CategoryNotFoundException` with invalid IDs
- `@ControllerAdvice` catches exception
- Return ApiResponse with specific error about which category ID is invalid

**Example Code**:
```java
public void validateCategories(List<Long> categoryIds) {
    List<Long> existingIds = categoryRepository.findAllById(categoryIds)
        .stream()
        .map(Category::getId)
        .collect(Collectors.toList());
    
    List<Long> invalidIds = categoryIds.stream()
        .filter(id -> !existingIds.contains(id))
        .collect(Collectors.toList());
    
    if (!invalidIds.isEmpty()) {
        throw new CategoryNotFoundException(
            "Category with ID " + invalidIds.get(0) + " does not exist"
        );
    }
}
```

### Database Errors (HTTP 500)

**Trigger Conditions**:
- Constraint violations (unexpected, should be prevented by validation)
- Database connection failures
- Transaction rollback failures
- Unique constraint violations on sort_order/step_number (data race)

**Handling**:
- Generic exception handler in `@ControllerAdvice`
- Log full stack trace with SLF4J (error level)
- Return generic error message to client (don't expose internal details)
- Consider retry logic for transient failures

**Logging Example**:
```java
@ExceptionHandler(Exception.class)
public ResponseEntity<ApiResponse<Void>> handleGenericException(Exception ex) {
    logger.error("Unexpected error during recipe creation", ex);
    
    ApiResponse<Void> response = new ApiResponse<>();
    response.setStatus("error");
    response.setMessage("An unexpected error occurred");
    response.setData(null);
    
    return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
}
```

## 8. Performance Considerations

### Potential Bottlenecks

1. **N+1 Query Problem**: Fetching categories one-by-one if not batched
   - **Mitigation**: Use `categoryRepository.findAllById(categoryIds)` for batch fetch
2. **Large Batch Inserts**: Many ingredients/steps could slow insert operations
   - **Mitigation**: JPA batch insert configuration, consider limiting max array sizes
3. **Transaction Lock Duration**: Long-running transaction holds database locks
   - **Mitigation**: Keep transaction scope minimal, validate categories before starting transaction

### Optimization Strategies

1. **Batch Configuration**: Enable Hibernate batch inserts
   ```properties
   spring.jpa.properties.hibernate.jdbc.batch_size=20
   spring.jpa.properties.hibernate.order_inserts=true
   ```
2. **Index Usage**: Ensure indexes exist on:
   - `recipes(user_id)` for future queries
   - `categories(id)` (primary key, auto-indexed)
   - `recipe_categories(recipe_id, category_id)` (composite primary key, auto-indexed)
3. **Eager vs Lazy Loading**: Use lazy loading for associations not needed in response
4. **Connection Pooling**: Configure HikariCP for efficient connection management (default in Spring Boot)

### Expected Performance

- **Target Response Time**: < 200ms for typical recipe (5 ingredients, 5 steps)
- **Database Operations**: 4-5 queries total (1 SELECT, 4 INSERTs with batching)
- **Concurrency**: H2 supports concurrent writes, but file-based mode may serialize transactions
- **Scalability**: For production, migrate to PostgreSQL/MySQL for better concurrent write performance

## 9. Implementation Steps

### Step 1: Create DTO Classes

**Files to Create**:
- `src/main/java/com/recipenotebook/dto/CreateRecipeRequest.java`
- `src/main/java/com/recipenotebook/dto/IngredientRequest.java`
- `src/main/java/com/recipenotebook/dto/StepRequest.java`
- `src/main/java/com/recipenotebook/dto/RecipeIdResponse.java`
- `src/main/java/com/recipenotebook/dto/ApiResponse.java`
- `src/main/java/com/recipenotebook/dto/ErrorDetails.java`

**Actions**:
- Add all Bean Validation annotations as specified in section 3
- Include getters, setters, and constructors
- Consider using Lombok `@Data` to reduce boilerplate

### Step 2: Create Domain Entities

**Files to Create**:
- `src/main/java/com/recipenotebook/entity/Recipe.java`
- `src/main/java/com/recipenotebook/entity/Ingredient.java`
- `src/main/java/com/recipenotebook/entity/Step.java`
- `src/main/java/com/recipenotebook/entity/Category.java`

**Actions**:
- Add JPA annotations as specified in section 3
- Configure cascade types: `CascadeType.ALL` for ingredients and steps
- Set `orphanRemoval = true` for one-to-many relationships
- Add `@PrePersist` and `@PreUpdate` callbacks for timestamps
- Verify unique constraints match database schema

### Step 3: Create Repository Interfaces

**Files to Create**:
- `src/main/java/com/recipenotebook/repository/RecipeRepository.java`
- `src/main/java/com/recipenotebook/repository/CategoryRepository.java`

**Actions**:
```java
public interface RecipeRepository extends JpaRepository<Recipe, Long> {
}

public interface CategoryRepository extends JpaRepository<Category, Long> {
}
```

### Step 4: Create Custom Exception Classes

**Files to Create**:
- `src/main/java/com/recipenotebook/exception/CategoryNotFoundException.java`

**Actions**:
```java
public class CategoryNotFoundException extends RuntimeException {
    public CategoryNotFoundException(String message) {
        super(message);
    }
}
```

### Step 5: Implement Service Layer

**Files to Create**:
- `src/main/java/com/recipenotebook/service/RecipeService.java`

**Actions**:
- Annotate with `@Service`
- Inject `RecipeRepository` and `CategoryRepository` via constructor
- Add SLF4J Logger: `private static final Logger logger = LoggerFactory.getLogger(RecipeService.class);`
- Implement `@Transactional public Long createRecipe(CreateRecipeRequest request, Long userId)`
- Validate categories exist (throw `CategoryNotFoundException` if not)
- Map DTO to entity
- Assign sequential sortOrder to ingredients (1, 2, 3...)
- Assign sequential stepNumber to steps (1, 2, 3...)
- Save recipe
- Return recipe ID

**Example Implementation**:
```java
@Service
public class RecipeService {
    private static final Logger logger = LoggerFactory.getLogger(RecipeService.class);
    
    private final RecipeRepository recipeRepository;
    private final CategoryRepository categoryRepository;
    
    public RecipeService(RecipeRepository recipeRepository, 
                        CategoryRepository categoryRepository) {
        this.recipeRepository = recipeRepository;
        this.categoryRepository = categoryRepository;
    }
    
    @Transactional
    public Long createRecipe(CreateRecipeRequest request, Long userId) {
        logger.info("Creating recipe for user {}", userId);
        
        validateCategories(request.getCategoryIds());
        
        Recipe recipe = new Recipe();
        recipe.setUserId(userId);
        recipe.setTitle(request.getTitle());
        recipe.setDifficulty(request.getDifficulty());
        recipe.setCookingTimeMinutes(request.getCookingTimeMinutes());
        
        // Assign ingredients with sequential sortOrder
        List<Ingredient> ingredients = new ArrayList<>();
        for (int i = 0; i < request.getIngredients().size(); i++) {
            IngredientRequest ingReq = request.getIngredients().get(i);
            Ingredient ingredient = new Ingredient();
            ingredient.setQuantity(ingReq.getQuantity());
            ingredient.setUnit(ingReq.getUnit());
            ingredient.setName(ingReq.getName());
            ingredient.setSortOrder(i + 1);
            ingredients.add(ingredient);
        }
        recipe.setIngredients(ingredients);
        
        // Assign steps with sequential stepNumber
        List<Step> steps = new ArrayList<>();
        for (int i = 0; i < request.getSteps().size(); i++) {
            StepRequest stepReq = request.getSteps().get(i);
            Step step = new Step();
            step.setInstruction(stepReq.getInstruction());
            step.setStepNumber(i + 1);
            steps.add(step);
        }
        recipe.setSteps(steps);
        
        // Associate categories
        List<Category> categories = categoryRepository.findAllById(request.getCategoryIds());
        recipe.setCategories(new HashSet<>(categories));
        
        Recipe savedRecipe = recipeRepository.save(recipe);
        logger.info("Recipe created successfully with ID {}", savedRecipe.getId());
        
        return savedRecipe.getId();
    }
    
    private void validateCategories(List<Long> categoryIds) {
        List<Long> existingIds = categoryRepository.findAllById(categoryIds)
            .stream()
            .map(Category::getId)
            .collect(Collectors.toList());
        
        List<Long> invalidIds = categoryIds.stream()
            .filter(id -> !existingIds.contains(id))
            .collect(Collectors.toList());
        
        if (!invalidIds.isEmpty()) {
            throw new CategoryNotFoundException(
                "Category with ID " + invalidIds.get(0) + " does not exist"
            );
        }
    }
}
```

### Step 6: Implement Controller Layer

**Files to Create**:
- `src/main/java/com/recipenotebook/controller/RecipeController.java`

**Actions**:
- Annotate with `@RestController` and `@RequestMapping("/api/v1/recipes")`
- Inject `RecipeService` via constructor
- Create POST endpoint method
- Extract userId from authentication (implementation depends on auth mechanism)
- Call service layer
- Wrap response in ApiResponse
- Return HTTP 201

**Example Implementation**:
```java
@RestController
@RequestMapping("/api/v1/recipes")
public class RecipeController {
    private final RecipeService recipeService;
    
    public RecipeController(RecipeService recipeService) {
        this.recipeService = recipeService;
    }
    
    @PostMapping
    public ResponseEntity<ApiResponse<RecipeIdResponse>> createRecipe(
            @Valid @RequestBody CreateRecipeRequest request,
            @AuthenticationPrincipal Long userId) { // Adjust based on auth implementation
        
        Long recipeId = recipeService.createRecipe(request, userId);
        
        RecipeIdResponse data = new RecipeIdResponse();
        data.setRecipeId(recipeId);
        
        ApiResponse<RecipeIdResponse> response = new ApiResponse<>();
        response.setStatus("success");
        response.setMessage("Recipe created successfully");
        response.setData(data);
        
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
}
```

### Step 7: Implement Global Exception Handler

**Files to Create**:
- `src/main/java/com/recipenotebook/exception/GlobalExceptionHandler.java`

**Actions**:
- Annotate with `@ControllerAdvice`
- Add handler for `MethodArgumentNotValidException` (validation errors)
- Add handler for `CategoryNotFoundException` (HTTP 404)
- Add handler for generic `Exception` (HTTP 500)
- Log errors appropriately
- Return consistent ApiResponse format

**Example Implementation**:
```java
@ControllerAdvice
public class GlobalExceptionHandler {
    private static final Logger logger = LoggerFactory.getLogger(GlobalExceptionHandler.class);
    
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponse<ErrorDetails>> handleValidationException(
            MethodArgumentNotValidException ex) {
        
        Map<String, String> errors = new HashMap<>();
        ex.getBindingResult().getFieldErrors().forEach(error -> 
            errors.put(error.getField(), error.getDefaultMessage())
        );
        
        ErrorDetails errorDetails = new ErrorDetails();
        errorDetails.setErrors(errors);
        
        ApiResponse<ErrorDetails> response = new ApiResponse<>();
        response.setStatus("error");
        response.setMessage("Validation failed");
        response.setData(errorDetails);
        
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
    }
    
    @ExceptionHandler(CategoryNotFoundException.class)
    public ResponseEntity<ApiResponse<ErrorDetails>> handleCategoryNotFoundException(
            CategoryNotFoundException ex) {
        
        Map<String, String> errors = new HashMap<>();
        errors.put("categoryIds", ex.getMessage());
        
        ErrorDetails errorDetails = new ErrorDetails();
        errorDetails.setErrors(errors);
        
        ApiResponse<ErrorDetails> response = new ApiResponse<>();
        response.setStatus("error");
        response.setMessage("Invalid category ID");
        response.setData(errorDetails);
        
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
    }
    
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<Void>> handleGenericException(Exception ex) {
        logger.error("Unexpected error occurred", ex);
        
        ApiResponse<Void> response = new ApiResponse<>();
        response.setStatus("error");
        response.setMessage("An unexpected error occurred");
        response.setData(null);
        
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
    }
}
```

### Step 8: Configure Application Properties

**Files to Modify**:
- `src/main/resources/application.properties` or `application-dev.properties`

**Actions**:
- Enable Hibernate batch inserts for performance
- Configure transaction management
- Set appropriate logging levels

**Example Configuration**:
```properties
# Hibernate Batch Insert Optimization
spring.jpa.properties.hibernate.jdbc.batch_size=20
spring.jpa.properties.hibernate.order_inserts=true
spring.jpa.properties.hibernate.order_updates=true

# Logging
logging.level.com.recipenotebook=INFO
logging.level.org.hibernate.SQL=DEBUG
logging.level.org.hibernate.type.descriptor.sql.BasicBinder=TRACE
```

### Step 9: Testing

**Unit Tests to Create**:
- `src/test/java/com/recipenotebook/service/RecipeServiceTest.java`
  - Test successful recipe creation
  - Test category validation failure
  - Test ingredient sortOrder assignment
  - Test step stepNumber assignment

**Integration Tests to Create**:
- `src/test/java/com/recipenotebook/controller/RecipeControllerTest.java`
  - Test POST /api/v1/recipes with valid request (expect 201)
  - Test POST with missing required fields (expect 400)
  - Test POST with invalid difficulty value (expect 400)
  - Test POST with non-existent category ID (expect 404)
  - Test POST with less than 2 steps (expect 400)

**Manual Testing**:
- Use Postman or cURL to test endpoint
- Verify database records created correctly
- Test with various edge cases (maximum field lengths, special characters)

### Step 10: Build Verification

**Actions**:
- Run Maven build: `./mvnw clean package`
- Verify all tests pass
- Check for compilation errors
- Review logs for warnings

### Step 11: Documentation

**Actions**:
- Add Javadoc comments to public methods
- Document business logic decisions (e.g., why sortOrder starts at 1)
- Update project README if needed
- Consider adding API documentation (defer to post-MVP if using SpringDoc)
