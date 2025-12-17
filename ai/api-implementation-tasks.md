# API Implementation Tasks

This document lists all API endpoints to be implemented for the Recipe Notebook application, along with their priority and estimated complexity.

---

## Authentication Endpoints

### 1. POST /api/v1/auth/register
**Description**: Register a new user account  
**Priority**: High  
**Complexity**: Medium  
**Dependencies**: 
- User entity and repository
- BCrypt password hashing
- Category seeding logic
- Sample recipe creation
**File**: `ai/post-auth-register.md`

---

### 2. POST /api/v1/auth/login
**Description**: Authenticate user and receive JWT token  
**Priority**: High  
**Complexity**: Medium  
**Dependencies**:
- User entity and repository
- BCrypt password verification
- JWT token generation service
**File**: `ai/post-auth-login.md`

---

## Recipe Endpoints

### 3. GET /api/v1/recipes
**Description**: List recipes with pagination, filtering, and sorting  
**Priority**: High  
**Complexity**: High  
**Dependencies**:
- Recipe, Category entities and repositories
- JWT authentication
- Pagination, filtering, and sorting logic
- JPA Specification for dynamic queries
**File**: `ai/get-recipes.md`

---

### 4. GET /api/v1/recipes/{id}
**Description**: Get detailed recipe information including ingredients and steps  
**Priority**: High  
**Complexity**: Medium  
**Dependencies**:
- Recipe, Ingredient, Step, Category entities
- JWT authentication
- JOIN FETCH query to prevent N+1
**File**: `ai/get-recipes-id.md`

---

### 5. POST /api/v1/recipes
**Description**: Create a new recipe  
**Priority**: High  
**Complexity**: High  
**Dependencies**:
- Recipe, Ingredient, Step, Category entities
- JWT authentication
- Transaction management for multiple inserts
- Continuous numbering logic
- Category validation
**File**: `ai/post-recipes.md`

---

### 6. PUT /api/v1/recipes/{id}
**Description**: Update an existing recipe (full replacement)  
**Priority**: Medium  
**Complexity**: High  
**Dependencies**:
- Recipe, Ingredient, Step, Category entities
- JWT authentication
- Transaction management for delete + insert
- Authorization check (user owns recipe)
- Continuous numbering logic
**File**: `ai/put-recipes-id.md`

---

### 7. DELETE /api/v1/recipes/{id}
**Description**: Delete a recipe and all associated data  
**Priority**: Medium  
**Complexity**: Low  
**Dependencies**:
- Recipe entity and repository
- JWT authentication
- Authorization check (user owns recipe)
- Cascade delete configuration
**File**: `ai/delete-recipes-id.md`

---

## Category Endpoints

### 8. GET /api/v1/categories
**Description**: List all available categories  
**Priority**: High  
**Complexity**: Low  
**Dependencies**:
- Category entity and repository
- JWT authentication
**File**: `ai/get-categories.md`

---

## Health Check Endpoint

### 9. GET /api/health
**Description**: Application health check endpoint  
**Priority**: Low  
**Complexity**: Low  
**Dependencies**:
- Database connectivity check
**File**: `ai/get-health.md`

---

## Implementation Order

### Phase 1: Foundation (Must be completed first)
1. **POST /api/v1/auth/register** - User registration
2. **POST /api/v1/auth/login** - User authentication
3. **GET /api/v1/categories** - Category listing (needed for recipe creation)

### Phase 2: Core Recipe Functionality
4. **POST /api/v1/recipes** - Recipe creation
5. **GET /api/v1/recipes/{id}** - Recipe detail view
6. **GET /api/v1/recipes** - Recipe listing with search/filter

### Phase 3: Recipe Management
7. **PUT /api/v1/recipes/{id}** - Recipe updates
8. **DELETE /api/v1/recipes/{id}** - Recipe deletion

### Phase 4: Monitoring
9. **GET /api/health** - Health check

---

## Cross-Cutting Concerns

### Global Exception Handler
**Description**: Centralized error handling with consistent response format  
**Priority**: High  
**Complexity**: Medium  
**Implementation**:
- @ControllerAdvice class
- Handle validation errors (400)
- Handle authentication errors (401)
- Handle authorization errors (403)
- Handle not found errors (404)
- Handle conflict errors (409)
- Handle server errors (500)

### JWT Service
**Description**: JWT token generation and validation  
**Priority**: High  
**Complexity**: Medium  
**Implementation**:
- Token generation with claims (userId, username)
- Token validation
- Claim extraction
- 24-hour expiration

### JWT Authentication Filter
**Description**: Intercept requests and validate JWT  
**Priority**: High  
**Complexity**: Medium  
**Implementation**:
- Extract token from Authorization header
- Validate token
- Extract userId from claims
- Skip for public endpoints

### Response Envelope
**Description**: Standard API response wrapper  
**Priority**: High  
**Complexity**: Low  
**Implementation**:
```java
{
  "status": "success|error",
  "message": "string",
  "data": {}
}
```

### DTO Mappers
**Description**: Convert between entities and DTOs  
**Priority**: High  
**Complexity**: Low  
**Implementation**:
- Entity → Response DTO
- Request DTO → Entity
- Manual mapping (no MapStruct for MVP)

---

## Testing Requirements

### Unit Tests
- Service layer business logic
- DTO validation
- Continuous numbering logic
- JWT token generation/validation

### Integration Tests
- All 9 endpoints
- User isolation enforcement
- Cascade delete behavior
- Pagination and filtering
- Error scenarios

---

## Estimated Timeline

- **Phase 1**: 2-3 days
- **Phase 2**: 3-4 days
- **Phase 3**: 2 days
- **Phase 4**: 1 day
- **Cross-cutting concerns**: 2-3 days
- **Testing**: 3-4 days

**Total**: 13-17 days for complete backend implementation

---

## Notes

- All endpoints require consistent error handling
- All protected endpoints require JWT authentication
- All recipe endpoints require row-level security (userId filtering)
- Continuous numbering must be enforced for ingredients and steps
- Full replacement strategy for PUT operations (not PATCH)
