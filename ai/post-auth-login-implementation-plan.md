# API Endpoint Implementation Plan: POST /auth/login

## 1. Endpoint Overview

The `/api/v1/auth/login` endpoint authenticates users by validating their credentials (username and password) against the database. Upon successful authentication, it generates a JWT token valid for 24 hours and returns it along with the username and expiration timestamp. This is a public endpoint that does not require prior authentication.

**Primary Use Case**: User login to obtain authentication token for subsequent API requests.

## 2. Request Details

- **HTTP Method**: POST
- **URL Structure**: `/api/v1/auth/login`
- **Content-Type**: `application/json`
- **Authentication**: None (public endpoint)

### Parameters

**Required (Request Body)**:
```json
{
  "username": "string (required, not blank)",
  "password": "string (required, not blank)"
}
```

**Validation Rules**:
- `username`: Must not be blank (`@NotBlank`)
- `password`: Must not be blank (`@NotBlank`)
- Username matching is case-sensitive
- No length validation at endpoint level (database constraint: 3-50 characters)

## 3. Types Used

### Request DTO

**LoginRequestDTO**:
```java
package com.recipenotebook.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class LoginRequestDTO {
    @NotBlank(message = "Username is required")
    private String username;
    
    @NotBlank(message = "Password is required")
    private String password;
}
```

### Response DTOs

**LoginResponseDTO**:
```java
package com.recipenotebook.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class LoginResponseDTO {
    private String token;
    private String username;
    private String expiresAt; // ISO-8601 format: "2025-12-18T15:30:00Z"
}
```

**ApiResponse<T>** (Generic wrapper):
```java
package com.recipenotebook.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ApiResponse<T> {
    private String status;  // "success" or "error"
    private String message;
    private T data;
    
    public static <T> ApiResponse<T> success(String message, T data) {
        return new ApiResponse<>("success", message, data);
    }
    
    public static <T> ApiResponse<T> error(String message, T data) {
        return new ApiResponse<>("error", message, data);
    }
}
```

**ValidationErrorDetails** (for 400 responses):
```java
package com.recipenotebook.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import java.util.Map;

@Data
@AllArgsConstructor
public class ValidationErrorDetails {
    private Map<String, String> errors;
}
```

### Entity

**User Entity**:
```java
package com.recipenotebook.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "users")
@Data
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(unique = true, nullable = false, length = 50)
    private String username;
    
    @Column(name = "password_hash", nullable = false, length = 60)
    private String passwordHash;
    
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
```

## 4. Response Details

### Success Response (HTTP 200)

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

### Error Responses

**HTTP 401 - Unauthorized** (Invalid credentials):
```json
{
  "status": "error",
  "message": "Invalid username or password",
  "data": null
}
```

**HTTP 400 - Bad Request** (Validation failure):
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

**HTTP 500 - Internal Server Error**:
```json
{
  "status": "error",
  "message": "An unexpected error occurred",
  "data": null
}
```

## 5. Data Flow

```
1. Client sends POST request with username and password
   ↓
2. AuthController receives request and validates input (@Valid)
   ↓
3. If validation fails → Return 400 with validation errors
   ↓
4. AuthController calls AuthService.login(username, password)
   ↓
5. AuthService queries UserRepository.findByUsername(username)
   ↓
6. If user not found → Throw AuthenticationException → Return 401
   ↓
7. AuthService compares password with BCrypt hash
   ↓
8. If password mismatch → Throw AuthenticationException → Return 401
   ↓
9. AuthService calls JwtService.generateToken(user.getId(), user.getUsername())
   ↓
10. JwtService creates JWT with claims: sub, userId, iat, exp (24h)
   ↓
11. AuthService calculates expiresAt timestamp
   ↓
12. Return LoginResponseDTO with token, username, expiresAt
   ↓
13. AuthController wraps in ApiResponse and returns 200 OK
```

## 6. Security Considerations

### Authentication & Authorization
- **Public Endpoint**: No authentication required for this endpoint
- **Password Security**: Passwords are never logged or returned in responses
- **BCrypt Hashing**: Use Spring's `BCryptPasswordEncoder` for password verification
- **Constant-Time Comparison**: BCrypt inherently provides protection against timing attacks

### Input Validation
- **JSR-380 Validation**: Use `@NotBlank` on LoginRequestDTO fields
- **SQL Injection Prevention**: JPA/Hibernate uses parameterized queries automatically
- **XSS Prevention**: No HTML content expected; JSON serialization handles escaping

### JWT Security
- **Secret Management**: Store JWT secret in environment variable `JWT_SECRET`
- **Algorithm**: Use HS256 (HMAC with SHA-256)
- **Token Expiration**: 24 hours from issuance
- **Claims**: Include minimal necessary data (userId, username)
- **No Sensitive Data**: Never include passwords or sensitive PII in JWT

### Error Handling Security
- **Information Leakage Prevention**: Return identical error message for invalid username or invalid password
  - Both return: "Invalid username or password"
  - Prevents username enumeration attacks
- **No Stack Traces**: Never expose stack traces or internal error details to clients
- **Audit Logging**: Log failed login attempts with username (for security monitoring) but never log passwords

### Post-MVP Security Enhancements
- Rate limiting (prevent brute force attacks)
- Account lockout after N failed attempts
- Multi-factor authentication (MFA)
- Password complexity requirements
- HTTPS enforcement
- CSRF protection for session-based flows

## 7. Error Handling

### Exception Strategy

**Create Custom Exception**:
```java
package com.recipenotebook.exception;

public class AuthenticationException extends RuntimeException {
    public AuthenticationException(String message) {
        super(message);
    }
}
```

**Global Exception Handler**:
```java
package com.recipenotebook.exception;

import com.recipenotebook.dto.ApiResponse;
import com.recipenotebook.dto.ValidationErrorDetails;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {
    
    private static final Logger logger = LoggerFactory.getLogger(GlobalExceptionHandler.class);
    
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponse<ValidationErrorDetails>> handleValidationException(
            MethodArgumentNotValidException ex) {
        
        Map<String, String> errors = new HashMap<>();
        for (FieldError error : ex.getBindingResult().getFieldErrors()) {
            errors.put(error.getField(), error.getDefaultMessage());
        }
        
        ValidationErrorDetails errorDetails = new ValidationErrorDetails(errors);
        ApiResponse<ValidationErrorDetails> response = 
            ApiResponse.error("Validation failed", errorDetails);
        
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
    }
    
    @ExceptionHandler(AuthenticationException.class)
    public ResponseEntity<ApiResponse<Object>> handleAuthenticationException(
            AuthenticationException ex) {
        
        logger.warn("Authentication failed: {}", ex.getMessage());
        ApiResponse<Object> response = ApiResponse.error("Invalid username or password", null);
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
    }
    
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<Object>> handleGenericException(Exception ex) {
        logger.error("Unexpected error occurred", ex);
        ApiResponse<Object> response = ApiResponse.error("An unexpected error occurred", null);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
    }
}
```

### Error Scenarios

| Scenario | HTTP Status | Error Message | Logging Action |
|----------|-------------|---------------|----------------|
| Missing username/password | 400 | "Validation failed" + field errors | None |
| Blank username/password | 400 | "Validation failed" + field errors | None |
| User not found | 401 | "Invalid username or password" | Log username attempt (WARN) |
| Password mismatch | 401 | "Invalid username or password" | Log username attempt (WARN) |
| Database error | 500 | "An unexpected error occurred" | Log full stack trace (ERROR) |
| JWT generation failure | 500 | "An unexpected error occurred" | Log full stack trace (ERROR) |

## 8. Performance Considerations

### Potential Bottlenecks
1. **Database Query**: Single SELECT on indexed `username` column (acceptable)
2. **BCrypt Comparison**: Intentionally slow (~100ms) for security - cannot optimize
3. **JWT Generation**: Minimal overhead (<10ms)

### Optimization Strategies
- **Database Indexing**: Ensure `username` column has UNIQUE index (already defined in schema)
- **Connection Pooling**: Use default HikariCP configuration (already included in Spring Boot)
- **BCrypt Work Factor**: Use default strength (10) - balance security and performance

### Deferred Optimizations (Post-MVP)
- Redis caching for user lookups (if database becomes bottleneck)
- Rate limiting with in-memory or distributed cache
- JWT refresh token mechanism to reduce re-authentication

## 9. Implementation Steps

### Step 1: Create Repository Layer
```java
package com.recipenotebook.repository;

import com.recipenotebook.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByUsername(String username);
}
```

### Step 2: Create JWT Service
```java
package com.recipenotebook.service;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

@Service
public class JwtService {
    
    private final SecretKey secretKey;
    private static final long EXPIRATION_HOURS = 24;
    
    public JwtService(@Value("${jwt.secret}") String secret) {
        // Ensure secret is at least 256 bits for HS256
        this.secretKey = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
    }
    
    public String generateToken(Long userId, String username) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("userId", userId);
        
        Instant now = Instant.now();
        Instant expiration = now.plus(EXPIRATION_HOURS, ChronoUnit.HOURS);
        
        return Jwts.builder()
                .setClaims(claims)
                .setSubject(username)
                .setIssuedAt(Date.from(now))
                .setExpiration(Date.from(expiration))
                .signWith(secretKey, SignatureAlgorithm.HS256)
                .compact();
    }
    
    public Instant getExpirationTime() {
        return Instant.now().plus(EXPIRATION_HOURS, ChronoUnit.HOURS);
    }
}
```

### Step 3: Create Authentication Service
```java
package com.recipenotebook.service;

import com.recipenotebook.dto.LoginResponseDTO;
import com.recipenotebook.entity.User;
import com.recipenotebook.exception.AuthenticationException;
import com.recipenotebook.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.format.DateTimeFormatter;

@Service
public class AuthService {
    
    private static final Logger logger = LoggerFactory.getLogger(AuthService.class);
    
    private final UserRepository userRepository;
    private final JwtService jwtService;
    private final BCryptPasswordEncoder passwordEncoder;
    
    public AuthService(UserRepository userRepository, JwtService jwtService) {
        this.userRepository = userRepository;
        this.jwtService = jwtService;
        this.passwordEncoder = new BCryptPasswordEncoder();
    }
    
    public LoginResponseDTO login(String username, String password) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> {
                    logger.warn("Login attempt with non-existent username: {}", username);
                    return new AuthenticationException("Invalid credentials");
                });
        
        if (!passwordEncoder.matches(password, user.getPasswordHash())) {
            logger.warn("Login attempt with invalid password for username: {}", username);
            throw new AuthenticationException("Invalid credentials");
        }
        
        String token = jwtService.generateToken(user.getId(), user.getUsername());
        Instant expiresAt = jwtService.getExpirationTime();
        String expiresAtFormatted = DateTimeFormatter.ISO_INSTANT.format(expiresAt);
        
        logger.info("User logged in successfully: {}", username);
        
        return new LoginResponseDTO(token, user.getUsername(), expiresAtFormatted);
    }
}
```

### Step 4: Create Controller
```java
package com.recipenotebook.controller;

import com.recipenotebook.dto.ApiResponse;
import com.recipenotebook.dto.LoginRequestDTO;
import com.recipenotebook.dto.LoginResponseDTO;
import com.recipenotebook.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {
    
    private final AuthService authService;
    
    public AuthController(AuthService authService) {
        this.authService = authService;
    }
    
    @PostMapping("/login")
    public ResponseEntity<ApiResponse<LoginResponseDTO>> login(
            @Valid @RequestBody LoginRequestDTO request) {
        
        LoginResponseDTO loginResponse = authService.login(
                request.getUsername(), 
                request.getPassword()
        );
        
        ApiResponse<LoginResponseDTO> response = 
            ApiResponse.success("Login successful", loginResponse);
        
        return ResponseEntity.ok(response);
    }
}
```

### Step 5: Configure Application Properties
Add to `application.properties`:
```properties
# JWT Configuration
jwt.secret=${JWT_SECRET:your-256-bit-secret-key-for-development-only-change-in-production}

# BCrypt Configuration (default strength is 10)
# No configuration needed - using Spring's default BCryptPasswordEncoder
```

For `application-dev.properties`:
```properties
# Development JWT Secret (256+ bits required)
jwt.secret=dev-secret-key-minimum-32-characters-required-for-hs256-algorithm
```

### Step 6: Create Configuration Bean
```java
package com.recipenotebook.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {
    
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
                .allowedOrigins("http://localhost:3000")  // React dev server
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true);
    }
}
```

### Step 7: Testing Checklist

**Unit Tests** (AuthService):
- ✓ Test successful login with valid credentials
- ✓ Test login failure with non-existent username
- ✓ Test login failure with incorrect password
- ✓ Test JWT token generation and expiration time

**Integration Tests** (AuthController):
- ✓ Test POST /api/v1/auth/login with valid credentials returns 200
- ✓ Test POST /api/v1/auth/login with invalid credentials returns 401
- ✓ Test POST /api/v1/auth/login with missing username returns 400
- ✓ Test POST /api/v1/auth/login with blank password returns 400

**Manual Testing**:
- ✓ Verify JWT token can be decoded and contains correct claims
- ✓ Verify expiresAt timestamp is 24 hours in future
- ✓ Verify CORS works with React frontend
- ✓ Verify error messages don't reveal whether username exists

### Step 8: Deployment Preparation

1. **Environment Variables**: Set `JWT_SECRET` to a strong 256-bit (32+ character) random string in production
2. **Database**: Ensure H2 database file has proper read/write permissions
3. **Logging**: Configure SLF4J/Logback to rotate logs and set appropriate log levels
4. **Documentation**: Update API documentation with authentication flow for other endpoints

---

## Implementation Checklist

- [ ] Create `User` entity with JPA annotations
- [ ] Create `UserRepository` interface
- [ ] Create DTOs: `LoginRequestDTO`, `LoginResponseDTO`, `ApiResponse`, `ValidationErrorDetails`
- [ ] Create `JwtService` with token generation logic
- [ ] Create `AuthService` with login logic and BCrypt verification
- [ ] Create `AuthController` with POST /login endpoint
- [ ] Create `AuthenticationException` custom exception
- [ ] Create `GlobalExceptionHandler` for centralized error handling
- [ ] Configure `jwt.secret` in application properties
- [ ] Configure CORS for frontend integration
- [ ] Write unit tests for `AuthService`
- [ ] Write integration tests for `AuthController`
- [ ] Manual testing with Postman/cURL
- [ ] Document endpoint in API documentation

---

## Notes for Developers

1. **BCrypt Performance**: BCrypt is intentionally slow (~100ms per hash). This is a security feature, not a bug.
2. **JWT Secret**: The secret MUST be at least 256 bits (32 characters) for HS256 algorithm.
3. **Error Messages**: Always return "Invalid username or password" for 401 errors - never indicate whether the username exists.
4. **Password Logging**: NEVER log passwords in any form (plaintext or hashed).
5. **Token Storage**: Advise frontend to store JWT in httpOnly cookies or secure localStorage (document trade-offs).
6. **Post-MVP**: Plan for rate limiting and account lockout to prevent brute force attacks.
