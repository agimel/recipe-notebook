# Endpoint: GET /api/v1/recipes/{id}

## Endpoint Details

**HTTP Method**: GET  
**Path**: `/api/v1/recipes/{id}`  
**Description**: Get detailed recipe information including ingredients and steps  
**Authentication**: Required (JWT)

### Path Parameters

- `id` (long, required): Recipe ID

### Success Response (HTTP 200)

```json
{
  "status": "success",
  "message": "Recipe retrieved successfully",
  "data": {
    "id": 1,
    "title": "Classic Chocolate Chip Cookies",
    "difficulty": "EASY",
    "cookingTimeMinutes": 25,
    "categories": [
      { "id": 4, "name": "Dessert" },
      { "id": 5, "name": "Snacks" }
    ],
    "ingredients": [
      {
        "id": 1,
        "quantity": "2 1/4",
        "unit": "cups",
        "name": "all-purpose flour",
        "sortOrder": 1
      },
      {
        "id": 2,
        "quantity": "1",
        "unit": "tsp",
        "name": "baking soda",
        "sortOrder": 2
      }
    ],
    "steps": [
      {
        "id": 1,
        "stepNumber": 1,
        "instruction": "Preheat your oven to 375°F (190°C)."
      },
      {
        "id": 2,
        "stepNumber": 2,
        "instruction": "Combine flour, baking soda, and salt in a small bowl."
      }
    ],
    "createdAt": "2025-12-15T10:30:00Z",
    "updatedAt": "2025-12-15T10:30:00Z"
  }
}
```

### Error Responses

**HTTP 404 - Not Found**:
```json
{
  "status": "error",
  "message": "Recipe not found",
  "data": null
}
```

**HTTP 403 - Forbidden**:
```json
{
  "status": "error",
  "message": "Access denied",
  "data": null
}
```

### Notes

- Ingredients returned in `sortOrder` ascending
- Steps returned in `stepNumber` ascending
- Returns 404 if recipe doesn't exist OR belongs to different user (security through obscurity)

---

## Related Database Resources

### Tables

#### recipes
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

#### ingredients
**Description**: Stores recipe ingredients with ordering

**Schema**:
```sql
CREATE TABLE ingredients (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    recipe_id BIGINT NOT NULL,
    quantity VARCHAR(20) NOT NULL,
    unit VARCHAR(20) NOT NULL,
    name VARCHAR(50) NOT NULL,
    sort_order INT NOT NULL,
    FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE CASCADE,
    UNIQUE (recipe_id, sort_order)
);
```

**Columns**:
- `id` (BIGINT, PK): Auto-incrementing unique identifier
- `recipe_id` (BIGINT, FK, NOT NULL): Parent recipe reference
- `quantity` (VARCHAR(20), NOT NULL): Ingredient amount (supports "1/2", "1.5", "a pinch")
- `unit` (VARCHAR(20), NOT NULL): Measurement unit (cups, tbsp, grams, etc.)
- `name` (VARCHAR(50), NOT NULL): Ingredient name
- `sort_order` (INT, NOT NULL): Display order (continuous numbering: 1, 2, 3...)

**Constraints**:
- UNIQUE: `(recipe_id, sort_order)` - Enforces continuous ordering
- Foreign Key: `recipe_id` → `recipes(id)` ON DELETE CASCADE

#### steps
**Description**: Stores recipe cooking instructions with sequential numbering

**Schema**:
```sql
CREATE TABLE steps (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    recipe_id BIGINT NOT NULL,
    step_number INT NOT NULL,
    instruction VARCHAR(500) NOT NULL,
    FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE CASCADE,
    UNIQUE (recipe_id, step_number)
);
```

**Columns**:
- `id` (BIGINT, PK): Auto-incrementing unique identifier
- `recipe_id` (BIGINT, FK, NOT NULL): Parent recipe reference
- `step_number` (INT, NOT NULL): Sequential step number (1, 2, 3...)
- `instruction` (VARCHAR(500), NOT NULL): Instruction text (max 500 characters)

**Constraints**:
- UNIQUE: `(recipe_id, step_number)` - Prevents duplicate step numbers
- Foreign Key: `recipe_id` → `recipes(id)` ON DELETE CASCADE

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
- `recipes` → `ingredients` (1:N, ON DELETE CASCADE)
- `recipes` → `steps` (1:N, ON DELETE CASCADE)
- `recipes` ↔ `categories` via `recipe_categories` (N:M)

### Indexes

- `idx_ingredients_recipe_id`: Retrieve ingredients for recipe detail view
- `idx_steps_recipe_id`: Retrieve steps for recipe detail view

### JPA Repository Query

```java
@Query("SELECT r FROM Recipe r " +
       "LEFT JOIN FETCH r.ingredients " +
       "LEFT JOIN FETCH r.steps " +
       "LEFT JOIN FETCH r.categories " +
       "WHERE r.id = :id AND r.userId = :userId")
Optional<Recipe> findByIdAndUserIdWithDetails(
    @Param("id") Long id, 
    @Param("userId") Long userId
);
```

### N+1 Query Prevention

Use JOIN FETCH to eagerly load all related entities in a single query, preventing multiple database round-trips.

### Authorization

**Row-Level Security**: Query must include `userId` filter to ensure user can only access their own recipes
