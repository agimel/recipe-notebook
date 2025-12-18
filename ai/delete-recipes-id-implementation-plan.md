# API Endpoint Implementation Plan: DELETE /api/v1/recipes/{id}

## 1. Endpoint Overview

This endpoint deletes a recipe and all its associated data (ingredients, steps, and category assignments). The operation is a hard delete (not soft delete) and uses database cascade rules to automatically remove all related records. The endpoint verifies that the recipe exists and belongs to the authenticated user before deletion. For security, the endpoint returns a 404 response for both non-existent recipes and recipes owned by other users, preventing information disclosure about which recipes exist in the system.

## 2. Request Details

- **HTTP Method**: DELETE
- **URL Structure**: `/api/v1/recipes/{id}`
- **Authentication**: Required (JWT token in Authorization header)
- **Content-Type**: Not applicable (no request body)

### Parameters

**Required**:
- `id` (Path parameter, Long): The unique identifier of the recipe to delete

**Optional**: None

### Request Example

```
DELETE /api/v1/recipes/42
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## 3. Types Used

No request DTOs are needed for this endpoint. The response uses the existing `ApiResponse<Void>` generic type.

### Response DTO

**ApiResponse<Void>** (existing)
```java
public class ApiResponse<T> {
    private String status;
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

## 4. Response Details

### Success Response (HTTP 200)

**Status Code**: 200 OK

**Response Body**:
```json
{
  "status": "success",
  "message": "Recipe deleted successfully",
  "data": null
}
```

### Error Responses

**HTTP 404 - Not Found** (Recipe doesn't exist OR doesn't belong to user):
```json
{
  "status": "error",
  "message": "Recipe not found",
  "data": null
}
```

**HTTP 401 - Unauthorized** (No/Invalid JWT token):
```json
{
  "status": "error",
  "message": "Unauthorized access",
  "data": null
}
```

**HTTP 500 - Internal Server Error** (Database or system failure):
```json
{
  "status": "error",
  "message": "An unexpected error occurred",
  "data": null
}
```

## 5. Data Flow

### Request Flow

1. **Authentication Layer**: JWT filter extracts user ID from token, validates authenticity
2. **Controller Layer**: Receives DELETE request with recipe `id` path parameter and authenticated user ID from security context
3. **Service Layer**: Validates recipe ownership and existence, performs deletion
4. **Repository Layer**: Executes database delete operation using JPA repository
5. **Database Layer**: Cascades deletion to ingredients, steps, and recipe_categories tables
6. **Response**: Returns success response with 200 status code

### Detailed Data Flow

```
Client Request (DELETE /api/v1/recipes/42)
    ↓
JWT Authentication Filter
    ↓ (extracts userId from token)
RecipeController.deleteRecipe(id, userId)
    ↓
RecipeService.deleteRecipe(id, userId)
    ↓
RecipeRepository.findByIdAndUserId(id, userId)
    ├─ Recipe Found → RecipeRepository.delete(recipe)
    │                     ↓
    │                 Database CASCADE deletes:
    │                     - ingredients (ON DELETE CASCADE)
    │                     - steps (ON DELETE CASCADE)
    │                     - recipe_categories (ON DELETE CASCADE)
    │                     ↓
    │                 Return success response (HTTP 200)
    │
    └─ Not Found → Throw RecipeNotFoundException
                     ↓
                 GlobalExceptionHandler
                     ↓
                 Return error response (HTTP 404)
```

### Database Cascade Operations

When a recipe is deleted, the following cascade operations occur automatically:

| Table | Relationship | Cascade Rule | Action |
|-------|-------------|--------------|--------|
| ingredients | recipe_id → recipes.id | ON DELETE CASCADE | All ingredients for the recipe are deleted |
| steps | recipe_id → recipes.id | ON DELETE CASCADE | All steps for the recipe are deleted |
| recipe_categories | recipe_id → recipes.id | ON DELETE CASCADE | All category assignments are deleted |

## 6. Security Considerations

### Authentication

- **JWT Token Required**: All requests must include a valid JWT token in the Authorization header
- **Token Validation**: JWT filter validates token signature, expiration, and extracts user ID
- **User Context**: User ID from token is used for authorization checks

### Authorization

- **Row-Level Security**: Recipe must belong to the authenticated user
- **Security Through Obscurity**: Returns 404 for both non-existent recipes AND recipes owned by other users to prevent enumeration attacks
- **Prevents Information Disclosure**: Attacker cannot determine which recipe IDs exist by probing the endpoint

### Input Validation

- **Path Parameter Type**: Spring Boot automatically validates that `id` is a valid Long integer
- **Malformed ID Handling**: Non-numeric IDs (e.g., `/recipes/abc`) return 400 Bad Request automatically
- **SQL Injection Prevention**: JPA parameterized queries prevent SQL injection

### Threat Analysis

| Threat | Mitigation |
|--------|-----------|
| Unauthorized deletion of other users' recipes | Verify recipe ownership via `findByIdAndUserId()` |
| Recipe enumeration attacks | Return 404 for both non-existent and unauthorized recipes |
| JWT token theft | Use HTTPS in production, short token expiration times |
| SQL injection | JPA parameterized queries prevent injection |
| Mass deletion via automation | Rate limiting (post-MVP feature) |

## 7. Error Handling

### Exception Scenarios

| Scenario | Exception | HTTP Status | Response Message |
|----------|-----------|-------------|------------------|
| Recipe not found | RecipeNotFoundException | 404 | "Recipe not found" |
| Recipe belongs to different user | RecipeNotFoundException | 404 | "Recipe not found" |
| Missing/invalid JWT token | UnauthorizedException | 401 | "Unauthorized access" |
| Malformed recipe ID (non-numeric) | MethodArgumentTypeMismatchException | 400 | "Invalid recipe ID format" |
| Database connection failure | DataAccessException | 500 | "An unexpected error occurred" |
| Constraint violation during delete | DataIntegrityViolationException | 500 | "An unexpected error occurred" |

### Custom Exception Classes

**RecipeNotFoundException** (new)
```java
public class RecipeNotFoundException extends RuntimeException {
    public RecipeNotFoundException(String message) {
        super(message);
    }
}
```

### Global Exception Handler

**GlobalExceptionHandler** (existing, extend if needed)
```java
@ExceptionHandler(RecipeNotFoundException.class)
public ResponseEntity<ApiResponse<Void>> handleRecipeNotFoundException(
        RecipeNotFoundException ex) {
    
    log.warn("Recipe not found: {}", ex.getMessage());
    
    return ResponseEntity.status(HttpStatus.NOT_FOUND)
            .body(ApiResponse.error(ex.getMessage(), null));
}

@ExceptionHandler(MethodArgumentTypeMismatchException.class)
public ResponseEntity<ApiResponse<Void>> handleTypeMismatch(
        MethodArgumentTypeMismatchException ex) {
    
    log.warn("Invalid path parameter type: {}", ex.getMessage());
    
    return ResponseEntity.status(HttpStatus.BAD_REQUEST)
            .body(ApiResponse.error("Invalid recipe ID format", null));
}
```

### Logging Strategy

- **INFO**: Successful deletions with recipe ID and user ID
- **WARN**: Failed attempts (recipe not found, unauthorized access)
- **ERROR**: Database failures, unexpected exceptions
- **DEBUG**: Detailed flow for development troubleshooting

## 8. Performance Considerations

### Potential Bottlenecks

1. **Cascade Delete Performance**: Deleting a recipe with many ingredients/steps triggers multiple DELETE operations
2. **Database Lock Contention**: Deletion locks the recipe row and cascades to related tables
3. **Transaction Time**: Long-running transactions can cause performance issues under high load

### Optimization Strategies

1. **Database Indexes**: Ensure foreign key columns (recipe_id) are indexed for fast cascade operations
2. **Transaction Isolation**: Use default READ_COMMITTED isolation to minimize lock contention
3. **Lazy Loading**: Not applicable (no related entities loaded, only deletion)
4. **Batch Operations**: Not applicable (single recipe deletion)
5. **Connection Pooling**: Spring Boot default HikariCP provides efficient connection management

### Expected Performance

- **Single Recipe Delete**: < 50ms for recipe with 10-20 ingredients/steps
- **Cascade Operations**: Database handles automatically, minimal overhead
- **Scalability**: Linear performance, no N+1 query issues

### Monitoring Recommendations (Post-MVP)

- Track average deletion time per recipe
- Monitor database lock wait times
- Alert on deletion failures
- Log deletion frequency per user for abuse detection

## 9. Implementation Steps

### Step 1: Create Custom Exception

**File**: `backend/src/main/java/com/recipenotebook/exception/RecipeNotFoundException.java`

```java
package com.recipenotebook.exception;

public class RecipeNotFoundException extends RuntimeException {
    public RecipeNotFoundException(String message) {
        super(message);
    }
}
```

### Step 2: Add Repository Method

**File**: `backend/src/main/java/com/recipenotebook/repository/RecipeRepository.java`

Add method to existing repository:

```java
Optional<Recipe> findByIdAndUserId(Long id, Long userId);
```

This method is used to verify both existence and ownership in a single query.

### Step 3: Create RecipeService (if not exists) or Add Delete Method

**File**: `backend/src/main/java/com/recipenotebook/service/RecipeService.java`

```java
package com.recipenotebook.service;

import com.recipenotebook.entity.Recipe;
import com.recipenotebook.exception.RecipeNotFoundException;
import com.recipenotebook.repository.RecipeRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class RecipeService {
    
    private final RecipeRepository recipeRepository;
    
    @Transactional
    public void deleteRecipe(Long recipeId, Long userId) {
        log.debug("Attempting to delete recipe {} for user {}", recipeId, userId);
        
        Recipe recipe = recipeRepository.findByIdAndUserId(recipeId, userId)
                .orElseThrow(() -> {
                    log.warn("Recipe {} not found or does not belong to user {}", 
                            recipeId, userId);
                    return new RecipeNotFoundException("Recipe not found");
                });
        
        recipeRepository.delete(recipe);
        
        log.info("Successfully deleted recipe {} for user {}", recipeId, userId);
    }
}
```

**Key Points**:
- `@Transactional`: Ensures atomicity of delete operation and cascades
- `findByIdAndUserId()`: Single query verifies both existence and ownership
- Security through obscurity: Same error message for both scenarios
- Logging: Debug for attempts, warn for failures, info for success

### Step 4: Update GlobalExceptionHandler

**File**: `backend/src/main/java/com/recipenotebook/exception/GlobalExceptionHandler.java`

Add handler for RecipeNotFoundException:

```java
@ExceptionHandler(RecipeNotFoundException.class)
public ResponseEntity<ApiResponse<Void>> handleRecipeNotFoundException(
        RecipeNotFoundException ex) {
    
    log.warn("Recipe not found: {}", ex.getMessage());
    
    return ResponseEntity.status(HttpStatus.NOT_FOUND)
            .body(ApiResponse.error(ex.getMessage(), null));
}

@ExceptionHandler(MethodArgumentTypeMismatchException.class)
public ResponseEntity<ApiResponse<Void>> handleTypeMismatch(
        MethodArgumentTypeMismatchException ex) {
    
    log.warn("Invalid path parameter type: {}", ex.getMessage());
    
    return ResponseEntity.status(HttpStatus.BAD_REQUEST)
            .body(ApiResponse.error("Invalid recipe ID format", null));
}
```

### Step 5: Create RecipeController (if not exists) or Add Delete Endpoint

**File**: `backend/src/main/java/com/recipenotebook/controller/RecipeController.java`

```java
package com.recipenotebook.controller;

import com.recipenotebook.dto.ApiResponse;
import com.recipenotebook.service.RecipeService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/recipes")
@RequiredArgsConstructor
@Slf4j
public class RecipeController {
    
    private final RecipeService recipeService;
    
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteRecipe(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        
        log.debug("Received delete request for recipe {} from user {}", 
                id, userDetails.getUsername());
        
        Long userId = extractUserId(userDetails);
        recipeService.deleteRecipe(id, userId);
        
        return ResponseEntity.ok(
                ApiResponse.success("Recipe deleted successfully", null));
    }
    
    private Long extractUserId(UserDetails userDetails) {
        // Extract user ID from UserDetails
        // Implementation depends on your JWT/UserDetails setup
        // Assuming CustomUserDetails with getId() method
        return ((CustomUserDetails) userDetails).getId();
    }
}
```

**Alternative if using JWT directly**:

```java
@DeleteMapping("/{id}")
public ResponseEntity<ApiResponse<Void>> deleteRecipe(
        @PathVariable Long id,
        @RequestHeader("Authorization") String authHeader) {
    
    log.debug("Received delete request for recipe {}", id);
    
    String token = authHeader.substring(7); // Remove "Bearer " prefix
    Long userId = jwtService.extractUserId(token);
    
    recipeService.deleteRecipe(id, userId);
    
    return ResponseEntity.ok(
            ApiResponse.success("Recipe deleted successfully", null));
}
```

### Step 6: Write Unit Tests

**File**: `backend/src/test/java/com/recipenotebook/service/RecipeServiceTest.java`

```java
@Test
void deleteRecipe_success() {
    // Arrange
    Long recipeId = 1L;
    Long userId = 100L;
    Recipe recipe = new Recipe();
    recipe.setId(recipeId);
    recipe.setUserId(userId);
    
    when(recipeRepository.findByIdAndUserId(recipeId, userId))
            .thenReturn(Optional.of(recipe));
    
    // Act
    recipeService.deleteRecipe(recipeId, userId);
    
    // Assert
    verify(recipeRepository).delete(recipe);
}

@Test
void deleteRecipe_notFound() {
    // Arrange
    Long recipeId = 1L;
    Long userId = 100L;
    
    when(recipeRepository.findByIdAndUserId(recipeId, userId))
            .thenReturn(Optional.empty());
    
    // Act & Assert
    assertThrows(RecipeNotFoundException.class, 
            () -> recipeService.deleteRecipe(recipeId, userId));
    
    verify(recipeRepository, never()).delete(any());
}

@Test
void deleteRecipe_wrongUser() {
    // Arrange
    Long recipeId = 1L;
    Long requestingUserId = 100L;
    Long actualOwnerId = 200L;
    
    when(recipeRepository.findByIdAndUserId(recipeId, requestingUserId))
            .thenReturn(Optional.empty());
    
    // Act & Assert
    assertThrows(RecipeNotFoundException.class, 
            () -> recipeService.deleteRecipe(recipeId, requestingUserId));
}
```

### Step 7: Write Integration Tests

**File**: `backend/src/test/java/com/recipenotebook/controller/RecipeControllerIntegrationTest.java`

```java
@Test
void deleteRecipe_success() throws Exception {
    // Arrange: Create recipe via database or mock
    String token = getValidJwtToken();
    
    // Act & Assert
    mockMvc.perform(delete("/api/v1/recipes/1")
            .header("Authorization", "Bearer " + token))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.status").value("success"))
            .andExpect(jsonPath("$.message").value("Recipe deleted successfully"))
            .andExpect(jsonPath("$.data").isEmpty());
}

@Test
void deleteRecipe_notFound() throws Exception {
    String token = getValidJwtToken();
    
    mockMvc.perform(delete("/api/v1/recipes/9999")
            .header("Authorization", "Bearer " + token))
            .andExpect(status().isNotFound())
            .andExpect(jsonPath("$.status").value("error"))
            .andExpect(jsonPath("$.message").value("Recipe not found"));
}

@Test
void deleteRecipe_unauthorized() throws Exception {
    mockMvc.perform(delete("/api/v1/recipes/1"))
            .andExpect(status().isUnauthorized());
}
```

### Step 8: Manual Testing with Postman

1. **Create test data**: Add a recipe using POST /api/v1/recipes
2. **Get JWT token**: Login via POST /api/v1/auth/login
3. **Test successful deletion**:
   ```
   DELETE http://localhost:8080/api/v1/recipes/1
   Authorization: Bearer {token}
   ```
   Expected: 200 OK with success message

4. **Test recipe not found**:
   ```
   DELETE http://localhost:8080/api/v1/recipes/9999
   Authorization: Bearer {token}
   ```
   Expected: 404 Not Found

5. **Test unauthorized access**:
   ```
   DELETE http://localhost:8080/api/v1/recipes/1
   ```
   Expected: 401 Unauthorized

6. **Verify cascade deletion**: Check database to confirm ingredients, steps, and recipe_categories were deleted

### Step 9: Update API Documentation (Post-MVP)

Document the endpoint in SpringDoc OpenAPI when added post-MVP:

```java
@Operation(summary = "Delete a recipe", description = "Deletes a recipe and all associated data")
@ApiResponses(value = {
    @ApiResponse(responseCode = "200", description = "Recipe deleted successfully"),
    @ApiResponse(responseCode = "404", description = "Recipe not found or unauthorized"),
    @ApiResponse(responseCode = "401", description = "Unauthorized access")
})
```

## 10. Testing Checklist

Before marking this endpoint as complete, verify:

- [ ] Recipe deletion works for authenticated user's own recipes
- [ ] Returns 404 when recipe doesn't exist
- [ ] Returns 404 when recipe belongs to different user (not 403)
- [ ] Returns 401 when JWT token is missing or invalid
- [ ] Returns 400 when recipe ID is malformed (e.g., "abc")
- [ ] Cascade deletion removes all ingredients
- [ ] Cascade deletion removes all steps
- [ ] Cascade deletion removes all recipe_categories entries
- [ ] Transaction rollback works if deletion fails
- [ ] Logging captures successful and failed attempts
- [ ] Unit tests achieve 70%+ coverage for service layer
- [ ] Integration tests verify end-to-end flow

## 11. Post-MVP Enhancements

Consider adding these features after MVP validation:

1. **Soft Delete**: Add `deleted_at` timestamp instead of hard delete
2. **Audit Trail**: Log deletion events in audit table
3. **Bulk Delete**: Allow deleting multiple recipes in one request
4. **Undo Functionality**: Allow users to restore recently deleted recipes
5. **Rate Limiting**: Prevent abuse of deletion endpoint
6. **Webhooks**: Notify external systems when recipe is deleted
7. **Cascade Metrics**: Track average cascade operation time
