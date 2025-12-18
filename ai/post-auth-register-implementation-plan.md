# API Endpoint Implementation Plan: POST /auth/register

## 1. Endpoint Overview

The `/api/v1/auth/register` endpoint creates a new user account with automatic onboarding setup. This endpoint is publicly accessible (no authentication required) and performs several automated tasks to provide a ready-to-use account:

1. Creates a user record with securely hashed password
2. Generates 6 default meal categories (Breakfast, Lunch, Dinner, Dessert, Snacks, Drinks)
3. Creates a sample recipe ("Classic Chocolate Chip Cookies") with full ingredients and cooking steps

This endpoint serves as the entry point for new users and ensures they have immediate access to a functional recipe management system.

## 2. Request Details

**HTTP Method**: `POST`

**URL Structure**: `/api/v1/auth/register`

**Parameters**:
- **Required**:
  - `username` (String): User's chosen login name
    - Length: 3-50 characters
    - Pattern: Alphanumeric and underscore only (`^[a-zA-Z0-9_]+$`)
    - Must be unique across the system
  - `password` (String): User's chosen password
    - Minimum length: 6 characters
    - Will be hashed with BCrypt (10 rounds) before storage

- **Optional**: None

**Request Body Structure**:
```json
{
  "username": "johndoe",
  "password": "securepass123"
}
```

**Request Headers**:
- `Content-Type: application/json`

## 3. Types Used

### DTOs (Data Transfer Objects)

**RegisterRequest.java**
```java
package com.recipenotebook.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public class RegisterRequest {
    
    @NotBlank(message = "Username is required")
    @Size(min = 3, max = 50, message = "Username must be between 3 and 50 characters")
    @Pattern(regexp = "^[a-zA-Z0-9_]+$", message = "Username can only contain letters, numbers, and underscores")
    private String username;
    
    @NotBlank(message = "Password is required")
    @Size(min = 6, message = "Password must be at least 6 characters")
    private String password;
    
    // Constructors, getters, setters
}
```

**RegisterResponse.java**
```java
package com.recipenotebook.dto;

public class RegisterResponse {
    private Long userId;
    private String username;
    
    // Constructors, getters, setters
}
```

**ApiResponse.java** (Generic wrapper)
```java
package com.recipenotebook.dto;

public class ApiResponse<T> {
    private String status;  // "success" or "error"
    private String message;
    private T data;
    
    // Static factory methods
    public static <T> ApiResponse<T> success(String message, T data) {
        return new ApiResponse<>("success", message, data);
    }
    
    public static <T> ApiResponse<T> error(String message, T data) {
        return new ApiResponse<>("error", message, data);
    }
    
    // Constructors, getters, setters
}
```

**ValidationErrorResponse.java**
```java
package com.recipenotebook.dto;

import java.util.Map;

public class ValidationErrorResponse {
    private Map<String, String> errors;
    
    // Constructor, getters, setters
}
```

### Entities

**User.java**
```java
package com.recipenotebook.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "users")
public class User {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false, unique = true, length = 50)
    private String username;
    
    @Column(name = "password_hash", nullable = false, length = 60)
    private String passwordHash;
    
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
    
    // Constructors, getters, setters
}
```

**Category.java**
```java
package com.recipenotebook.entity;

import jakarta.persistence.*;

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
    
    // Constructors, getters, setters
}
```

**Recipe.java**
```java
package com.recipenotebook.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

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
    @Enumerated(EnumType.STRING)
    private Difficulty difficulty;
    
    @Column(name = "cooking_time_minutes", nullable = false)
    private Integer cookingTimeMinutes;
    
    @OneToMany(mappedBy = "recipe", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Ingredient> ingredients = new ArrayList<>();
    
    @OneToMany(mappedBy = "recipe", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Step> steps = new ArrayList<>();
    
    @ManyToMany
    @JoinTable(
        name = "recipe_categories",
        joinColumns = @JoinColumn(name = "recipe_id"),
        inverseJoinColumns = @JoinColumn(name = "category_id")
    )
    private List<Category> categories = new ArrayList<>();
    
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
    
    // Constructors, getters, setters, helper methods
}

enum Difficulty {
    EASY, MEDIUM, HARD
}
```

**Ingredient.java**
```java
package com.recipenotebook.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "ingredients")
public class Ingredient {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "recipe_id", nullable = false)
    private Recipe recipe;
    
    @Column(nullable = false, length = 20)
    private String quantity;
    
    @Column(nullable = false, length = 20)
    private String unit;
    
    @Column(nullable = false, length = 50)
    private String name;
    
    @Column(name = "sort_order", nullable = false)
    private Integer sortOrder;
    
    // Constructors, getters, setters
}
```

**Step.java**
```java
package com.recipenotebook.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "steps")
public class Step {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "recipe_id", nullable = false)
    private Recipe recipe;
    
    @Column(name = "step_number", nullable = false)
    private Integer stepNumber;
    
    @Column(nullable = false, length = 500)
    private String instruction;
    
    // Constructors, getters, setters
}
```

## 4. Response Details

### Success Response (HTTP 201 Created)

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

### Error Responses

**HTTP 400 Bad Request - Validation Errors**
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

**HTTP 409 Conflict - Username Already Exists**
```json
{
  "status": "error",
  "message": "Username already exists",
  "data": null
}
```

**HTTP 500 Internal Server Error**
```json
{
  "status": "error",
  "message": "An unexpected error occurred during registration",
  "data": null
}
```

## 5. Data Flow

1. **Request Validation** (Controller Layer)
   - Spring validates `@Valid RegisterRequest` against Bean Validation annotations
   - If validation fails → Return HTTP 400 with field-specific error messages

2. **Username Uniqueness Check** (Service Layer)
   - Query `UserRepository.existsByUsername(username)`
   - If username exists → Throw `UsernameAlreadyExistsException` → HTTP 409

3. **Password Hashing** (Service Layer)
   - Use `BCryptPasswordEncoder` with strength 10
   - Hash the plain password: `passwordHash = encoder.encode(password)`

4. **User Creation** (Service Layer)
   - Create `User` entity with username and passwordHash
   - Save to database via `UserRepository.save(user)`
   - Retrieve generated user ID

5. **Default Categories Creation** (Service Layer)
   - Create 6 categories with `isDefault = true`:
     - Breakfast
     - Lunch
     - Dinner
     - Dessert
     - Snacks
     - Drinks
   - Save all via `CategoryRepository.saveAll(categories)`

6. **Sample Recipe Creation** (Service Layer)
   - Create recipe: "Classic Chocolate Chip Cookies"
   - Set: `userId`, `title`, `difficulty = EASY`, `cookingTimeMinutes = 25`
   - Add ingredients (with sortOrder):
     1. "2¼" cups "all-purpose flour"
     2. "1" tsp "baking soda"
     3. "1" tsp "salt"
     4. "1" cup "butter, softened"
     5. "¾" cup "granulated sugar"
     6. "¾" cup "packed brown sugar"
     7. "2" large "eggs"
     8. "2" tsp "vanilla extract"
     9. "2" cups "chocolate chips"
   - Add steps (with stepNumber):
     1. "Preheat oven to 375°F (190°C)."
     2. "Combine flour, baking soda, and salt in a bowl."
     3. "Beat butter and sugars until creamy. Add eggs and vanilla."
     4. "Gradually blend in flour mixture. Stir in chocolate chips."
     5. "Drop rounded tablespoons onto ungreased baking sheets."
     6. "Bake for 9-11 minutes or until golden brown."
   - Link to "Dessert" category
   - Save via `RecipeRepository.save(recipe)` (cascades save ingredients and steps)

7. **Response Construction** (Controller Layer)
   - Create `RegisterResponse` with userId and username
   - Wrap in `ApiResponse.success()` envelope
   - Return with HTTP 201 status

## 6. Security Considerations

### Authentication & Authorization
- **Public Endpoint**: No authentication required (this is the registration endpoint)
- **Rate Limiting**: Consider implementing rate limiting to prevent abuse (post-MVP enhancement)

### Input Validation
- **Bean Validation**: Primary defense using Jakarta Validation annotations
  - `@NotBlank`: Prevents null or empty strings
  - `@Size`: Enforces length constraints
  - `@Pattern`: Restricts username to alphanumeric + underscore (prevents injection attacks)
- **Database Constraint**: Username uniqueness enforced at DB level as backup
- **Whitelist Validation**: Username pattern acts as whitelist, rejecting special characters

### Password Security
- **BCrypt Hashing**: Industry-standard algorithm with adaptive cost factor
- **Salt**: BCrypt automatically generates unique salt per password
- **Work Factor**: 10 rounds provides strong security without excessive performance impact
- **No Plaintext Storage**: Password never persisted in plain form
- **No Password in Logs**: Ensure logging excludes password field

### SQL Injection Prevention
- **JPA/Hibernate**: All queries use parameterized statements
- **No Raw SQL**: Avoid concatenating user input into queries

### Data Exposure Prevention
- **Password Exclusion**: Never return password or passwordHash in responses
- **Error Messages**: Generic messages prevent username enumeration
  - Same error format for all validation failures
  - No distinction between "username invalid" vs "username taken" in timing

### Session Management
- **New Session**: Generate new session after successful registration
- **Session Fixation**: Invalidate any pre-registration session

### XSS Prevention
- **Input Pattern**: Regex validation prevents HTML/script injection in username
- **Output Encoding**: Frontend should encode all user-generated content

### Audit Trail
- **Logging**: Log registration attempts (success and failure) with timestamps
- **No Sensitive Data**: Exclude passwords from logs, use sanitized usernames

## 7. Error Handling

### Validation Errors (HTTP 400)

**Trigger**: Bean validation fails on `RegisterRequest`

**Handling**:
1. Spring's `@Valid` annotation triggers validation
2. `MethodArgumentNotValidException` is thrown
3. Global exception handler (`@ControllerAdvice`) catches exception
4. Extract field errors from `BindingResult`
5. Build `ValidationErrorResponse` with field-to-message map
6. Return `ApiResponse.error("Validation failed", errorResponse)` with HTTP 400

**Example**:
```java
@ExceptionHandler(MethodArgumentNotValidException.class)
public ResponseEntity<ApiResponse<ValidationErrorResponse>> handleValidationException(
        MethodArgumentNotValidException ex) {
    
    Map<String, String> errors = new HashMap<>();
    ex.getBindingResult().getFieldErrors().forEach(error -> 
        errors.put(error.getField(), error.getDefaultMessage())
    );
    
    ValidationErrorResponse errorResponse = new ValidationErrorResponse(errors);
    return ResponseEntity.status(HttpStatus.BAD_REQUEST)
            .body(ApiResponse.error("Validation failed", errorResponse));
}
```

### Username Conflict (HTTP 409)

**Trigger**: Username already exists in database

**Handling**:
1. Service layer checks `UserRepository.existsByUsername(username)`
2. If true, throw `UsernameAlreadyExistsException` (custom exception)
3. Global exception handler catches exception
4. Return `ApiResponse.error("Username already exists", null)` with HTTP 409

**Example**:
```java
@ExceptionHandler(UsernameAlreadyExistsException.class)
public ResponseEntity<ApiResponse<Void>> handleUsernameExists(
        UsernameAlreadyExistsException ex) {
    
    logger.warn("Registration attempt with existing username: {}", ex.getUsername());
    return ResponseEntity.status(HttpStatus.CONFLICT)
            .body(ApiResponse.error("Username already exists", null));
}
```

### Database Errors (HTTP 500)

**Trigger**: Database connection failure, constraint violation, or persistence error

**Handling**:
1. Catch `DataAccessException` or `PersistenceException` in service layer
2. Log full stack trace with context
3. Throw generic `RegistrationException` (hide internal details)
4. Global exception handler returns generic error message
5. Return HTTP 500 with safe error message

**Example**:
```java
@ExceptionHandler(RegistrationException.class)
public ResponseEntity<ApiResponse<Void>> handleRegistrationError(
        RegistrationException ex) {
    
    logger.error("Registration failed", ex);
    return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
            .body(ApiResponse.error("An unexpected error occurred during registration", null));
}
```

### BCrypt Hashing Errors (HTTP 500)

**Trigger**: Password hashing fails (rare, but possible)

**Handling**:
1. Wrap `BCryptPasswordEncoder.encode()` in try-catch
2. Catch `IllegalArgumentException` or generic `Exception`
3. Log error with sanitized context (no password)
4. Throw `RegistrationException`
5. Return HTTP 500

### Transaction Rollback

**Strategy**: Wrap entire registration process in `@Transactional`
- If any step fails, entire transaction rolls back
- Prevents partial registration (user created but categories missing)
- Ensures data consistency

## 8. Performance Considerations

### Potential Bottlenecks

1. **Password Hashing**: BCrypt is intentionally slow (10 rounds ≈ 100-200ms)
   - **Impact**: Acceptable for registration (one-time operation)
   - **Mitigation**: Not needed for MVP; consider async processing post-MVP

2. **Multiple Database Inserts**: Creating user + 6 categories + 1 recipe + 9 ingredients + 6 steps
   - **Impact**: ~23 total inserts per registration
   - **Mitigation**: 
     - Use `@Transactional` for batch commit
     - Leverage JPA cascade for recipe children (reduces round-trips)
     - H2 file-based DB provides fast local writes

3. **Username Uniqueness Check**: Database query before insert
   - **Impact**: Minimal with indexed UNIQUE constraint
   - **Mitigation**: Database handles via `idx_users_username` index

### Optimization Strategies

1. **Batch Inserts**: Use `CategoryRepository.saveAll()` for bulk category creation
2. **Cascade Persistence**: Recipe entity cascades to ingredients and steps (single `save()` call)
3. **Indexed Lookups**: Username uniqueness check uses database index for O(log n) performance
4. **Connection Pooling**: Spring Boot's default HikariCP provides efficient connection reuse
5. **Lazy Loading**: Recipe relationships marked `FetchType.LAZY` to avoid unnecessary data retrieval

### Scalability Notes

- **Current Setup**: Suitable for hundreds of concurrent registrations
- **Post-MVP Enhancements**:
  - Consider async category/recipe creation via background jobs
  - Implement connection pooling tuning for high-traffic scenarios
  - Add database replication for read-heavy workloads
  - Consider caching default categories to avoid repeated queries

## 9. Implementation Steps

### Step 1: Create Entity Classes

1. Create `com.recipenotebook.entity` package
2. Implement `User.java` entity with JPA annotations
3. Implement `Category.java` entity
4. Implement `Recipe.java` entity with `Difficulty` enum
5. Implement `Ingredient.java` entity with `@ManyToOne` to Recipe
6. Implement `Step.java` entity with `@ManyToOne` to Recipe
7. Add `@PrePersist` and `@PreUpdate` lifecycle hooks for timestamps

### Step 2: Create Repository Interfaces

1. Create `com.recipenotebook.repository` package
2. Create `UserRepository extends JpaRepository<User, Long>`
   - Add method: `boolean existsByUsername(String username)`
   - Add method: `Optional<User> findByUsername(String username)` (for future login)
3. Create `CategoryRepository extends JpaRepository<Category, Long>`
   - Add method: `Optional<Category> findByName(String name)`
4. Create `RecipeRepository extends JpaRepository<Recipe, Long>`

### Step 3: Create DTO Classes

1. Create `com.recipenotebook.dto` package
2. Implement `RegisterRequest.java` with validation annotations
3. Implement `RegisterResponse.java`
4. Implement `ApiResponse.java` generic wrapper with factory methods
5. Implement `ValidationErrorResponse.java`

### Step 4: Create Custom Exceptions

1. Create `com.recipenotebook.exception` package
2. Create `UsernameAlreadyExistsException extends RuntimeException`
   - Add field: `private String username`
   - Add constructor accepting username
3. Create `RegistrationException extends RuntimeException`
   - Add constructors for message and cause

### Step 5: Create Service Layer

1. Create `com.recipenotebook.service` package
2. Create `AuthService` class with `@Service` annotation
3. Inject dependencies via constructor:
   - `UserRepository userRepository`
   - `CategoryRepository categoryRepository`
   - `RecipeRepository recipeRepository`
   - `BCryptPasswordEncoder passwordEncoder`
4. Implement `registerUser(RegisterRequest request)` method:
   - Mark with `@Transactional`
   - Check username uniqueness
   - Hash password
   - Create and save user
   - Create and save 6 default categories
   - Create sample recipe with ingredients and steps
   - Return `RegisterResponse`
5. Create helper method `createDefaultCategories()`
6. Create helper method `createSampleRecipe(Long userId, Category dessertCategory)`

### Step 6: Configure Password Encoder

1. Create `com.recipenotebook.config` package
2. Create `SecurityConfig.java` with `@Configuration` annotation
3. Define `@Bean` for `BCryptPasswordEncoder`:
   ```java
   @Bean
   public BCryptPasswordEncoder passwordEncoder() {
       return new BCryptPasswordEncoder(10); // 10 rounds
   }
   ```

### Step 7: Create Controller

1. Create `com.recipenotebook.controller` package
2. Create `AuthController` class with `@RestController` annotation
3. Add `@RequestMapping("/api/v1/auth")`
4. Inject `AuthService` via constructor
5. Implement `register(@Valid @RequestBody RegisterRequest request)` endpoint:
   - Method: `@PostMapping("/register")`
   - Call `authService.registerUser(request)`
   - Wrap response in `ApiResponse.success()`
   - Return `ResponseEntity.status(HttpStatus.CREATED).body(response)`

### Step 8: Create Global Exception Handler

1. Create `com.recipenotebook.exception` package (if not exists)
2. Create `GlobalExceptionHandler` class with `@ControllerAdvice`
3. Add SLF4J logger
4. Implement handlers:
   - `@ExceptionHandler(MethodArgumentNotValidException.class)` → HTTP 400
   - `@ExceptionHandler(UsernameAlreadyExistsException.class)` → HTTP 409
   - `@ExceptionHandler(RegistrationException.class)` → HTTP 500
   - `@ExceptionHandler(Exception.class)` → HTTP 500 (catch-all)

### Step 9: Configure CORS

1. Update `SecurityConfig.java` or create `WebConfig.java`
2. Add CORS configuration to allow frontend (http://localhost:3000):
   ```java
   @Bean
   public WebMvcConfigurer corsConfigurer() {
       return new WebMvcConfigurer() {
           @Override
           public void addCorsMappings(CorsRegistry registry) {
               registry.addMapping("/api/**")
                       .allowedOrigins("http://localhost:3000")
                       .allowedMethods("GET", "POST", "PUT", "DELETE")
                       .allowedHeaders("*")
                       .allowCredentials(true);
           }
       };
   }
   ```

### Step 10: Update Database Schema (if needed)

1. Verify `src/main/resources/schema.sql` matches entity definitions
2. Ensure all tables, columns, constraints, and indexes are defined
3. Test with `spring.jpa.hibernate.ddl-auto=validate` to verify consistency

### Step 11: Add Logging

1. Add SLF4J loggers to `AuthService` and `AuthController`
2. Log key events:
   - Registration attempts (INFO level)
   - Username conflicts (WARN level)
   - Registration failures (ERROR level with stack traces)
3. Ensure NO password logging (sanitize request objects)

### Step 12: Write Unit Tests

1. Create `src/test/java/com/recipenotebook/service/AuthServiceTest.java`
2. Test cases:
   - Successful registration
   - Username already exists
   - Password hashing validation
   - Default categories creation
   - Sample recipe creation
   - Transaction rollback on error
3. Use Mockito to mock repositories
4. Target 70% coverage for `AuthService`

### Step 13: Write Integration Tests

1. Create `src/test/java/com/recipenotebook/controller/AuthControllerTest.java`
2. Use `@SpringBootTest` and `MockMvc`
3. Test cases:
   - Valid registration → HTTP 201
   - Invalid username format → HTTP 400
   - Short password → HTTP 400
   - Duplicate username → HTTP 409
4. Verify database state after each test

### Step 14: Manual Testing

1. Start application: `./mvnw spring-boot:run`
2. Test with curl or Postman:
   ```bash
   curl -X POST http://localhost:8080/api/v1/auth/register \
     -H "Content-Type: application/json" \
     -d '{"username":"testuser","password":"password123"}'
   ```
3. Verify:
   - HTTP 201 response
   - User created in database
   - 6 categories exist
   - 1 sample recipe with ingredients and steps
   - Password is hashed (not plaintext)
4. Test error cases:
   - Invalid username format
   - Short password
   - Duplicate username

### Step 15: Code Review and Refinement

1. Review code against Spring Boot best practices
2. Verify adherence to Java coding standards
3. Check error handling coverage
4. Validate security measures
5. Confirm logging is appropriate (no sensitive data)
6. Refactor if needed for clarity and maintainability

### Step 16: Documentation

1. Add Javadoc comments to public methods
2. Document non-obvious business logic
3. Update README.md with registration endpoint details
4. Document sample recipe content for future reference

### Step 17: Prepare for Next Endpoints

1. Verify `User` entity is ready for login endpoint
2. Confirm `AuthService` can be extended for login logic
3. Document any assumptions or future enhancements needed
