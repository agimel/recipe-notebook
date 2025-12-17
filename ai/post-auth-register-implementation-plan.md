# API Endpoint Implementation Plan: POST /api/v1/auth/register

## 1. Endpoint Overview

Registers a new user account with automatic setup of default categories and a sample recipe. This endpoint is publicly accessible (no authentication required) and returns user identification details upon successful registration. The registration process ensures username uniqueness, secure password storage via BCrypt hashing, and automatic creation of starter content to improve user onboarding experience.

## 2. Request Details

- **HTTP Method**: POST
- **URL Structure**: `/api/v1/auth/register`
- **Content-Type**: `application/json`
- **Authentication**: None (public endpoint)

### Parameters

**Required (Request Body)**:
- `username` (String): User's unique login identifier
  - Length: 3-50 characters
  - Format: Alphanumeric characters and underscores only (`^[a-zA-Z0-9_]+$`)
  - Must be unique across all users
- `password` (String): User's account password
  - Minimum length: 6 characters
  - Stored as BCrypt hash (60 characters, strength 10 rounds)

**Optional**: None

### Request Body Example

```json
{
  "username": "johndoe",
  "password": "mypassword123"
}
```

## 3. Types Used

### Request DTO

```java
public class RegisterRequest {
    @NotBlank(message = "Username is required")
    @Size(min = 3, max = 50, message = "Username must be between 3 and 50 characters")
    @Pattern(regexp = "^[a-zA-Z0-9_]+$", message = "Username can only contain letters, numbers, and underscores")
    private String username;

    @NotBlank(message = "Password is required")
    @Size(min = 6, message = "Password must be at least 6 characters")
    private String password;

    // Getters and setters
}
```

### Response DTO

```java
public class UserData {
    private Long userId;
    private String username;

    // Constructor, getters, and setters
}
```

### Standard API Response Envelope

```java
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

    // Constructor, getters, and setters
}
```

### Entity Models

```java
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
    private Timestamp createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = new Timestamp(System.currentTimeMillis());
    }

    // Constructors, getters, and setters
}
```

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
    private Boolean isDefault;

    // Constructors, getters, and setters
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

#### HTTP 400 Bad Request - Validation Errors

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

#### HTTP 409 Conflict - Username Already Exists

```json
{
  "status": "error",
  "message": "Username already exists",
  "data": null
}
```

#### HTTP 500 Internal Server Error - Server-side Failure

```json
{
  "status": "error",
  "message": "Registration failed due to server error",
  "data": null
}
```

## 5. Data Flow

### Transaction Scope

All operations must execute within a single database transaction to ensure atomicity:

1. **Request Reception**: Controller receives and validates RegisterRequest via `@Valid` annotation
2. **Username Uniqueness Check**: Query database for existing username
   - If exists → throw `UsernameAlreadyExistsException` (409)
3. **Password Hashing**: Hash password using BCrypt (strength: 10 rounds)
4. **User Creation**: Insert user record with hashed password
5. **Default Categories Creation**: Insert 6 default categories:
   - Breakfast
   - Lunch
   - Dinner
   - Dessert
   - Snacks
   - Drinks
6. **Sample Recipe Creation**: Insert "Classic Chocolate Chip Cookies" recipe with:
   - Ingredients (sequential sortOrder: 1, 2, 3...)
   - Steps (sequential stepNumber: 1, 2, 3...)
   - Category associations
7. **Transaction Commit**: Persist all changes atomically
8. **Response Construction**: Return UserData with generated userId and username

### Service Method Signature

```java
@Service
public class AuthService {
    private final UserRepository userRepository;
    private final CategoryRepository categoryRepository;
    private final RecipeRepository recipeRepository;
    private final BCryptPasswordEncoder passwordEncoder;

    @Transactional
    public UserData registerUser(RegisterRequest request) {
        // Implementation logic
    }
}
```

### Database Interactions

1. **SELECT**: `SELECT COUNT(*) FROM users WHERE username = ?`
2. **INSERT**: `INSERT INTO users (username, password_hash, created_at) VALUES (?, ?, ?)`
3. **INSERT BATCH**: 6 category inserts
4. **INSERT**: 1 recipe + N ingredients + M steps (cascading inserts)

## 6. Security Considerations

### Password Security

- **BCrypt Hashing**: Use Spring Security's `BCryptPasswordEncoder` with default strength (10 rounds)
- **Salt Handling**: BCrypt automatically generates unique salts per password
- **Storage**: Password hash stored in 60-character VARCHAR field
- **Plaintext Password**: Never logged, stored, or returned in responses

```java
@Configuration
public class SecurityConfig {
    @Bean
    public BCryptPasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder(10);  // Explicit strength
    }
}
```

### Input Validation

- **Bean Validation**: Hibernate Validator annotations on RegisterRequest DTO
- **Pattern Validation**: Regex prevents XSS/injection via username
- **SQL Injection**: Prevented via Spring Data JPA parameterized queries
- **Uniqueness Enforcement**: Database UNIQUE constraint + service-level check

### Username Enumeration

- **Risk**: 409 response reveals username existence
- **Mitigation**: Acceptable for MVP; post-MVP consider generic 400 response
- **Logging**: Log registration attempts at INFO level (not ERROR)

### Data Validation

- **Whitespace Handling**: `@NotBlank` rejects empty/whitespace-only values
- **Length Enforcement**: Database constraints match validation rules
- **Character Set**: Pattern validation prevents Unicode/special character exploits

## 7. Error Handling

### Exception Mapping

| Exception Type | HTTP Status | Response Message | Logging Level |
|----------------|-------------|------------------|---------------|
| `MethodArgumentNotValidException` | 400 | "Validation failed" + field errors | WARN |
| `UsernameAlreadyExistsException` | 409 | "Username already exists" | INFO |
| `DataIntegrityViolationException` | 409 | "Username already exists" | WARN |
| `BCryptPasswordEncoderException` | 500 | "Registration failed due to server error" | ERROR |
| `TransactionException` | 500 | "Registration failed due to server error" | ERROR |
| `RuntimeException` (catch-all) | 500 | "Registration failed due to server error" | ERROR |

### Controller Exception Handler

```java
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponse<Map<String, String>>> handleValidationErrors(
            MethodArgumentNotValidException ex) {
        Map<String, String> errors = new HashMap<>();
        ex.getBindingResult().getFieldErrors().forEach(error ->
            errors.put(error.getField(), error.getDefaultMessage())
        );
        return ResponseEntity
            .status(HttpStatus.BAD_REQUEST)
            .body(ApiResponse.error("Validation failed", Map.of("errors", errors)));
    }

    @ExceptionHandler(UsernameAlreadyExistsException.class)
    public ResponseEntity<ApiResponse<Object>> handleUsernameExists(
            UsernameAlreadyExistsException ex) {
        return ResponseEntity
            .status(HttpStatus.CONFLICT)
            .body(ApiResponse.error(ex.getMessage(), null));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<Object>> handleGenericError(Exception ex) {
        logger.error("Unexpected error during registration", ex);
        return ResponseEntity
            .status(HttpStatus.INTERNAL_SERVER_ERROR)
            .body(ApiResponse.error("Registration failed due to server error", null));
    }
}
```

### Custom Exceptions

```java
public class UsernameAlreadyExistsException extends RuntimeException {
    public UsernameAlreadyExistsException(String username) {
        super("Username already exists");
    }
}
```

### Logging Strategy

```java
private static final Logger logger = LoggerFactory.getLogger(AuthService.class);

public UserData registerUser(RegisterRequest request) {
    logger.info("Registration attempt for username: {}", request.getUsername());

    if (userRepository.existsByUsername(request.getUsername())) {
        logger.info("Registration failed: username '{}' already exists", request.getUsername());
        throw new UsernameAlreadyExistsException(request.getUsername());
    }

    try {
        // Registration logic
        logger.info("User '{}' registered successfully with ID: {}", user.getUsername(), user.getId());
    } catch (Exception ex) {
        logger.error("Registration failed for username: {}", request.getUsername(), ex);
        throw ex;
    }
}
```

## 8. Performance Considerations

### Potential Bottlenecks

1. **BCrypt Hashing**: CPU-intensive operation (10 rounds ≈ 100-200ms)
   - **Impact**: Acceptable for registration endpoint (not high-frequency)
   - **Mitigation**: Not needed for MVP; post-MVP consider async processing
2. **Bulk Inserts**: 1 user + 6 categories + 1 recipe + ~10 ingredients + ~10 steps
   - **Impact**: ~20 INSERT statements in single transaction
   - **Mitigation**: Use JDBC batch insert if performance degrades
3. **Unique Username Check**: SELECT query before INSERT
   - **Impact**: Additional round-trip to database
   - **Mitigation**: Database UNIQUE index ensures fast lookup

### Optimization Strategies

- **Database Indexing**: UNIQUE index on `users.username` (required for constraint)
- **Connection Pooling**: Use HikariCP (Spring Boot default)
- **Transaction Isolation**: Use default READ_COMMITTED level
- **Batch Processing**: Enable batch inserts in Hibernate if needed:
  ```properties
  spring.jpa.properties.hibernate.jdbc.batch_size=20
  spring.jpa.properties.hibernate.order_inserts=true
  ```

### Expected Performance

- **Response Time**: < 500ms for typical registration (including BCrypt)
- **Throughput**: Not critical for MVP (low-frequency endpoint)
- **Database Load**: Minimal (single transaction with ~20 inserts)

## 9. Implementation Steps

### Step 1: Entity and Repository Setup

1. Create `User` entity with JPA annotations
2. Create `Category` entity with JPA annotations
3. Create `UserRepository` extending `JpaRepository<User, Long>`
   - Add method: `boolean existsByUsername(String username)`
   - Add method: `Optional<User> findByUsername(String username)`
4. Create `CategoryRepository` extending `JpaRepository<Category, Long>`
5. Verify H2 database auto-generates tables with correct schema

### Step 2: Security Configuration

1. Create `SecurityConfig` class with `@Configuration`
2. Define `BCryptPasswordEncoder` bean with strength 10
3. Configure CORS for local development (React on port 3000)
4. Disable CSRF for API endpoints (stateless JWT authentication)

### Step 3: DTO and Request/Response Models

1. Create `RegisterRequest` DTO with validation annotations
2. Create `UserData` response DTO
3. Create generic `ApiResponse<T>` wrapper class
4. Create `ValidationErrorResponse` for 400 errors

### Step 4: Custom Exception Classes

1. Create `UsernameAlreadyExistsException` extending `RuntimeException`
2. Implement constructor with username parameter
3. Override `getMessage()` to return standardized message

### Step 5: Service Layer Implementation

1. Create `AuthService` class with `@Service` annotation
2. Inject `UserRepository`, `CategoryRepository`, `RecipeRepository`, `BCryptPasswordEncoder`
3. Implement `registerUser(RegisterRequest request)` method with `@Transactional`:
   - Check username uniqueness via `existsByUsername()`
   - Hash password using `passwordEncoder.encode()`
   - Create and save `User` entity
   - Create and save 6 default categories
   - Create and save sample recipe "Classic Chocolate Chip Cookies"
   - Return `UserData` with userId and username
4. Add SLF4J logging for registration attempts, success, and failures

### Step 6: Controller Layer Implementation

1. Create `AuthController` class with `@RestController` and `@RequestMapping("/api/v1/auth")`
2. Inject `AuthService` via constructor
3. Implement `POST /register` endpoint:
   - Method signature: `ResponseEntity<ApiResponse<UserData>> register(@Valid @RequestBody RegisterRequest request)`
   - Call `authService.registerUser(request)`
   - Return `ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success("User registered successfully", userData))`
4. Add `@RestControllerAdvice` for exception handling

### Step 7: Global Exception Handler

1. Create `GlobalExceptionHandler` class with `@RestControllerAdvice`
2. Implement `@ExceptionHandler` methods:
   - `MethodArgumentNotValidException` → 400 with field errors
   - `UsernameAlreadyExistsException` → 409
   - `DataIntegrityViolationException` → 409 (fallback for DB constraint)
   - `Exception` (catch-all) → 500 with generic error
3. Add SLF4J logging for all exception handlers

### Step 8: Default Categories and Sample Recipe Data

1. Create `DataInitializer` class with `@Component` and `CommandLineRunner`
2. Check if default categories exist; if not, create them:
   - Breakfast, Lunch, Dinner, Dessert, Snacks, Drinks
3. Define sample recipe structure (Classic Chocolate Chip Cookies):
   - Title, difficulty (EASY), cooking time (25 minutes)
   - Ingredients list with quantity, unit, name, sortOrder
   - Steps list with stepNumber, instruction
4. Implement logic in `AuthService.registerUser()` to create sample recipe for new user

### Step 9: Testing

1. **Unit Tests** (Service Layer):
   - Test successful registration with valid input
   - Test username uniqueness validation
   - Test password hashing (verify BCrypt hash format)
   - Test transaction rollback on failure
   - Mock repositories using Mockito
2. **Integration Tests** (Controller Layer):
   - Test 201 response for valid registration
   - Test 400 response for validation errors (short username, short password, invalid characters)
   - Test 409 response for duplicate username
   - Test 500 response for server errors
   - Use MockMvc or TestRestTemplate
3. **Manual Testing**:
   - Test with Postman/cURL
   - Verify database entries (user, categories, recipe)
   - Verify password is hashed (not plaintext)

### Step 10: Configuration and Documentation

1. Update `application.yml` with:
   - H2 database connection settings
   - JPA/Hibernate configuration (ddl-auto: update)
   - Logging levels (INFO for registration, ERROR for failures)
2. Add API documentation comments (Javadoc) for public methods
3. Create README section for registration endpoint usage
4. Document default categories and sample recipe structure

### Step 11: Verification and Deployment

1. Run `mvn clean package` or `./gradlew build` to ensure compilation
2. Execute all unit and integration tests
3. Manually test registration flow end-to-end
4. Verify H2 database file creation and schema
5. Test error scenarios (duplicate username, validation failures)
6. Review logs for proper INFO/WARN/ERROR levels
7. Commit changes with descriptive message: "Implement POST /api/v1/auth/register endpoint"
