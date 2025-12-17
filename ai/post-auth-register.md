# Endpoint: POST /api/v1/auth/register

## Endpoint Details

**HTTP Method**: POST  
**Path**: `/api/v1/auth/register`  
**Description**: Register a new user account  
**Authentication**: None required

### Request Body

```json
{
  "username": "string (3-50 chars, required)",
  "password": "string (min 6 chars, required)"
}
```

### Validation Rules

- `username`: 3-50 characters, alphanumeric + underscore only, unique
  - Annotations: `@NotBlank`, `@Size(min=3, max=50)`, `@Pattern(regexp="^[a-zA-Z0-9_]+$")`
- `password`: Minimum 6 characters
  - Annotations: `@NotBlank`, `@Size(min=6)`

### Success Response (HTTP 201)

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

**HTTP 400 - Validation Error**:
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

**HTTP 409 - Conflict**:
```json
{
  "status": "error",
  "message": "Username already exists",
  "data": null
}
```

### Side Effects

1. Password hashed with BCrypt before storage (strength: 10 rounds)
2. 6 default categories created for user
3. 1 sample recipe (Classic Chocolate Chip Cookies) created

### Business Rules

1. Username must be unique across all users
2. Password must be hashed with BCrypt before storage (strength: 10 rounds)
3. Automatically create 6 default categories for new user
4. Automatically create 1 sample recipe (Classic Chocolate Chip Cookies)

### Process Flow

1. Validate username format and uniqueness
2. Validate password length
3. Hash password with BCrypt
4. Create user record
5. Create 6 default categories
6. Create sample recipe with ingredients and steps
7. Return user ID and username

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
- `username` (VARCHAR(50), UNIQUE, NOT NULL): User's login name (3-50 characters)
- `password_hash` (VARCHAR(60), NOT NULL): BCrypt hashed password
- `created_at` (TIMESTAMP): Account creation timestamp

**Constraints**:
- Primary Key: `id`
- Unique: `username`
- NOT NULL: `username`, `password_hash`

**Design Notes**:
- BCrypt hash requires 60 characters for storage
- Username uniqueness enforced at database level for security

#### categories
**Description**: Stores meal type classifications (for default categories creation)

**Schema**:
```sql
CREATE TABLE categories (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    is_default BOOLEAN DEFAULT FALSE
);
```

**Default Categories**:
- Breakfast
- Lunch
- Dinner
- Dessert
- Snacks
- Drinks

### Relationships

- None directly (this endpoint creates users which will later own recipes)

### Indexes

- `idx_users_username` (UNIQUE): Enforce username uniqueness, login lookup

### JPA Entity Mapping

```java
@Entity
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
}
```
