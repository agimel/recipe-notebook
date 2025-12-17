# Endpoint: DELETE /api/v1/recipes/{id}

## Endpoint Details

**HTTP Method**: DELETE  
**Path**: `/api/v1/recipes/{id}`  
**Description**: Delete a recipe and all associated data  
**Authentication**: Required (JWT)

### Path Parameters

- `id` (long, required): Recipe ID

### Success Response (HTTP 200)

```json
{
  "status": "success",
  "message": "Recipe deleted successfully",
  "data": null
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

### Side Effects

1. Recipe deleted
2. All associated ingredients deleted (CASCADE)
3. All associated steps deleted (CASCADE)
4. All category assignments deleted (CASCADE)

### Notes

- Hard delete (not soft delete)
- Returns 404 if recipe doesn't exist OR belongs to different user

### Business Rules

1. User can only delete their own recipes
2. Hard delete (not soft delete)
3. Cascade delete ingredients, steps, and category assignments

### Process Flow

1. Verify recipe exists and belongs to authenticated user
2. Delete recipe (database cascades to ingredients, steps, recipe_categories)
3. Return success message

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

**Cascade Behavior**: All ingredients automatically deleted when recipe is deleted

#### steps
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

**Cascade Behavior**: All steps automatically deleted when recipe is deleted

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

**Cascade Behavior**: All category assignments automatically deleted when recipe is deleted

### Relationships

- `recipes.user_id` → `users.id` (1:N, ON DELETE CASCADE)
- `recipes` → `ingredients` (1:N, ON DELETE CASCADE)
- `recipes` → `steps` (1:N, ON DELETE CASCADE)
- `recipes` ↔ `categories` via `recipe_categories` (N:M, CASCADE on recipe)

### Cascade Rules

| Trigger | Cascade Behavior | Affected Tables |
|---------|------------------|-----------------|
| DELETE recipe | CASCADE | ingredients, steps, recipe_categories |

### JPA Repository Method

```java
public interface RecipeRepository extends JpaRepository<Recipe, Long> {
    // Find single recipe with user validation
    Optional<Recipe> findByIdAndUserId(Long id, Long userId);
}
```

### Authorization

**Row-Level Security**: Must verify recipe belongs to authenticated user before allowing deletion. Returns 404 for unauthorized access (security through obscurity).
