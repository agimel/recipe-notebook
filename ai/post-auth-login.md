# Endpoint: POST /api/v1/auth/login

## Endpoint Details

**HTTP Method**: POST  
**Path**: `/api/v1/auth/login`  
**Description**: Authenticate user and receive JWT token  
**Authentication**: None required

### Request Body

```json
{
  "username": "string (required)",
  "password": "string (required)"
}
```

### Validation Rules

- `username`: Required
  - Annotations: `@NotBlank`
- `password`: Required
  - Annotations: `@NotBlank`

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

**HTTP 401 - Unauthorized**:
```json
{
  "status": "error",
  "message": "Invalid username or password",
  "data": null
}
```

**HTTP 400 - Validation Error**:
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

### JWT Structure

```json
{
  "sub": "username",
  "userId": 123,
  "iat": 1702825200,
  "exp": 1702911600
}
```

**JWT Configuration**:
- Secret key: Environment variable `JWT_SECRET`
- Algorithm: HS256
- Expiration: 24 hours from issuance
- Claims: `sub` (username), `userId`, `iat` (issued at), `exp` (expiration)

### Business Rules

1. Credentials must match stored username and BCrypt hash
2. Generate JWT with 24-hour expiration
3. Include userId and username in JWT claims

### Validation

- Both username and password required
- Case-sensitive username matching

### Process Flow

1. Lookup user by username
2. Compare provided password with stored BCrypt hash
3. On success, generate JWT with claims
4. Return JWT, username, and expiration timestamp

---

## Related Database Resources

### Tables

#### users
**Description**: Stores user authentication and account information

**Schema**:
```sql
CREATE TABLE users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password_hash VARCHAR(60) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Columns**:
- `id` (BIGINT, PK): Auto-incrementing unique identifier
- `username` (VARCHAR(50), UNIQUE, NOT NULL): User's login name
- `password_hash` (VARCHAR(60), NOT NULL): BCrypt hashed password
- `created_at` (TIMESTAMP): Account creation timestamp

**Constraints**:
- Primary Key: `id`
- Unique: `username`
- NOT NULL: `username`, `password_hash`

### Relationships

- None directly

### Indexes

- `idx_users_username` (UNIQUE): Username lookup for login

### JPA Repository Query

```java
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByUsername(String username);
}
```

### Security Implementation

**Authentication**:
- BCrypt password hashing (60-character storage)
- JWT token authentication with 24-hour expiration
- JWT secret stored as environment variable (JWT_SECRET)
- Client-side token storage in sessionStorage
