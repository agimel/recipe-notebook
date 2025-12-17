# Endpoint: GET /api/v1/recipes

## Endpoint Details

**HTTP Method**: GET  
**Path**: `/api/v1/recipes`  
**Description**: List recipes with pagination, filtering, and sorting  
**Authentication**: Required (JWT)

### Query Parameters

- `page` (integer, optional, default: 0): Page number (0-indexed)
- `size` (integer, optional, default: 20): Items per page (max: 100)
- `sort` (string, optional, default: "title"): Sort field (title, cookingTimeMinutes, createdAt, updatedAt)
- `direction` (string, optional, default: "asc"): Sort direction (asc, desc)
- `categoryIds` (array of long, optional): Filter by category IDs (comma-separated)
- `difficulty` (string, optional): Filter by difficulty (EASY, MEDIUM, HARD)
- `search` (string, optional): Search by recipe title (partial match, case-insensitive)

### Example Requests

```
GET /api/v1/recipes
GET /api/v1/recipes?page=0&size=20
GET /api/v1/recipes?categoryIds=1,2&difficulty=EASY
GET /api/v1/recipes?search=chocolate
GET /api/v1/recipes?categoryIds=4&difficulty=MEDIUM&search=cake
```

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

### Error Responses

**HTTP 401 - Unauthorized**:
```json
{
  "status": "error",
  "message": "Authentication required",
  "data": null
}
```

**HTTP 400 - Invalid Parameter**:
```json
{
  "status": "error",
  "message": "Invalid query parameter",
  "data": {
    "errors": {
      "difficulty": "Must be one of: EASY, MEDIUM, HARD"
    }
  }
}
```

### Notes

- Empty result returns empty array with pagination metadata
- Multiple category IDs are OR-ed (recipes matching ANY category)
- Search and filters are AND-ed together
- Results automatically filtered by authenticated user's ID

### Business Rules

1. Search is case-insensitive partial match on title only
2. Multiple category filters are OR-ed (match ANY category)
3. Category filter AND difficulty filter AND search are all AND-ed together
4. Results automatically filtered by authenticated user's ID
5. Results sorted alphabetically by title by default

### Filter Combinations

- Category only: `WHERE userId = ? AND categoryId IN (?)`
- Difficulty only: `WHERE userId = ? AND difficulty = ?`
- Search only: `WHERE userId = ? AND title ILIKE ?`
- Category + Difficulty: `WHERE userId = ? AND categoryId IN (?) AND difficulty = ?`
- All filters: `WHERE userId = ? AND categoryId IN (?) AND difficulty = ? AND title ILIKE ?`

---

## Related Database Resources

### Tables

#### recipes
**Description**: Stores core recipe information

**Schema**:
```sql
CREATE TABLE recipes (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    title VARCHAR(100) NOT NULL,
    difficulty VARCHAR(10) NOT NULL CHECK (difficulty IN ('EASY', 'MEDIUM', 'HARD')),
    cooking_time_minutes INT NOT NULL CHECK (cooking_time_minutes > 0),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

**Columns**:
- `id` (BIGINT, PK): Auto-incrementing unique identifier
- `user_id` (BIGINT, FK, NOT NULL): Owner of the recipe
- `title` (VARCHAR(100), NOT NULL): Recipe name (1-100 characters)
- `difficulty` (VARCHAR(10), NOT NULL): Cooking difficulty (EASY, MEDIUM, HARD)
- `cooking_time_minutes` (INT, NOT NULL): Total cooking time in minutes
- `created_at` (TIMESTAMP): Recipe creation timestamp
- `updated_at` (TIMESTAMP): Last modification timestamp

**Constraints**:
- Primary Key: `id`
- Foreign Key: `user_id` → `users(id)` ON DELETE CASCADE
- NOT NULL: `user_id`, `title`, `difficulty`, `cooking_time_minutes`
- CHECK: `difficulty IN ('EASY', 'MEDIUM', 'HARD')`
- CHECK: `cooking_time_minutes > 0`

#### categories
**Schema**:
```sql
CREATE TABLE categories (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    is_default BOOLEAN DEFAULT FALSE
);
```

#### recipe_categories
**Description**: Junction table for many-to-many relationship

**Schema**:
```sql
CREATE TABLE recipe_categories (
    recipe_id BIGINT NOT NULL,
    category_id BIGINT NOT NULL,
    PRIMARY KEY (recipe_id, category_id),
    FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE RESTRICT
);
```

### Relationships

- `recipes.user_id` → `users.id` (1:N, ON DELETE CASCADE)
- `recipes` ↔ `categories` via `recipe_categories` (N:M)

### Indexes

- `idx_recipes_user_id`: Filter recipes by user (row-level security)
- `idx_recipes_title`: Search recipes by name (partial match)
- `idx_recipe_categories_category_id`: Filter recipes by category

### JPA Repository Methods

```java
public interface RecipeRepository extends JpaRepository<Recipe, Long> {
    // Paginated recipes for a user
    Page<Recipe> findByUserId(Long userId, Pageable pageable);
    
    // Search recipes with user isolation
    Page<Recipe> findByUserIdAndTitleContainingIgnoreCase(
        Long userId, String titleQuery, Pageable pageable
    );
    
    // Category filtering with user isolation
    Page<Recipe> findByUserIdAndCategoriesIn(
        Long userId, List<Category> categories, Pageable pageable
    );
}
```

### Authorization

**Row-Level Security**: All queries filtered by `userId` extracted from JWT to prevent cross-user data access
