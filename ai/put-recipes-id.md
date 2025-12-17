# Endpoint: PUT /api/v1/recipes/{id}

## Endpoint Details

**HTTP Method**: PUT  
**Path**: `/api/v1/recipes/{id}`  
**Description**: Update an existing recipe (full replacement)  
**Authentication**: Required (JWT)

### Path Parameters

- `id` (long, required): Recipe ID

### Request Body

Same as POST /api/v1/recipes:

```json
{
  "title": "string (1-100 chars, required)",
  "difficulty": "EASY|MEDIUM|HARD (required)",
  "cookingTimeMinutes": "integer (positive, required)",
  "categoryIds": [1, 4],
  "ingredients": [
    {
      "quantity": "string (max 20 chars, required)",
      "unit": "string (max 20 chars, required)",
      "name": "string (max 50 chars, required)"
    }
  ],
  "steps": [
    {
      "instruction": "string (1-500 chars, required)"
    }
  ]
}
```

### Validation Rules

Same as POST /api/v1/recipes:
- `title`: @NotBlank, @Size(min=1, max=100)
- `difficulty`: @NotNull, @Pattern(regexp="^(EASY|MEDIUM|HARD)$")
- `cookingTimeMinutes`: @NotNull, @Min(1)
- `categoryIds`: @NotEmpty, @Size(min=1)
- `ingredients`: @NotEmpty, @Size(min=1), @Valid
- `steps`: @NotEmpty, @Size(min=2), @Valid

### Success Response (HTTP 200)

```json
{
  "status": "success",
  "message": "Recipe updated successfully",
  "data": {
    "recipeId": 42
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

**HTTP 400 - Validation Error**: Same as POST /api/v1/recipes

### Side Effects

1. All existing ingredients deleted and replaced with new ones
2. All existing steps deleted and replaced with new ones
3. All category assignments replaced with new ones
4. `updatedAt` timestamp updated automatically
5. Ingredients re-numbered from 1
6. Steps re-numbered from 1

### Notes

- Full replacement update (not partial/PATCH)
- Returns 404 if recipe doesn't exist OR belongs to different user

### Business Rules

1. User can only update their own recipes
2. Full replacement of ingredients and steps (not merge)
3. All existing ingredients deleted, new ones created with fresh sortOrder
4. All existing steps deleted, new ones created with fresh stepNumber
5. Category assignments fully replaced
6. Same validation rules as creation

### Process Flow

1. Validate all fields
2. Verify recipe exists and belongs to authenticated user
3. Verify all category IDs exist
4. Delete all existing ingredients
5. Delete all existing steps
6. Delete all existing category assignments
7. Update recipe core fields
8. Create new ingredient records with sequential sortOrder
9. Create new step records with sequential stepNumber
10. Create new recipe-category associations
11. Update `updatedAt` timestamp
12. Return recipe ID

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

**Design Notes**:
- ON UPDATE CURRENT_TIMESTAMP automatically tracks modifications

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

**Design Notes**:
- Cascade delete removes all ingredients when recipe is deleted
- All ingredients deleted and recreated during update

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

**Design Notes**:
- Cascade delete removes all steps when recipe is deleted
- All steps deleted and recreated during update

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

**Design Notes**:
- CASCADE on recipe deletion removes all category assignments
- All category assignments deleted and recreated during update

### Relationships

- `recipes.user_id` → `users.id` (1:N, ON DELETE CASCADE)
- `recipes` → `ingredients` (1:N, ON DELETE CASCADE)
- `recipes` → `steps` (1:N, ON DELETE CASCADE)
- `recipes` ↔ `categories` via `recipe_categories` (N:M)

### JPA Entity Mapping

```java
@Entity
public class Recipe {
    @OneToMany(cascade = CascadeType.ALL, orphanRemoval = true)
    @JoinColumn(name = "recipe_id")
    private List<Ingredient> ingredients;
    
    @OneToMany(cascade = CascadeType.ALL, orphanRemoval = true)
    @JoinColumn(name = "recipe_id")
    @OrderBy("stepNumber ASC")
    private List<Step> steps;
    
    @ManyToMany
    @JoinTable(
        name = "recipe_categories",
        joinColumns = @JoinColumn(name = "recipe_id"),
        inverseJoinColumns = @JoinColumn(name = "category_id")
    )
    private Set<Category> categories;
}
```

**Design Notes**:
- orphanRemoval = true ensures orphaned ingredients/steps are deleted

### Authorization

**Row-Level Security**: Must verify recipe belongs to authenticated user before allowing update
