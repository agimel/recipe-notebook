# Endpoint: POST /api/v1/recipes

## Endpoint Details

**HTTP Method**: POST  
**Path**: `/api/v1/recipes`  
**Description**: Create a new recipe  
**Authentication**: Required (JWT)

### Request Body

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

- `title`: 1-100 characters, required
  - Annotations: `@NotBlank`, `@Size(min=1, max=100)`
- `difficulty`: Must be EASY, MEDIUM, or HARD
  - Annotations: `@NotNull`, `@Pattern(regexp="^(EASY|MEDIUM|HARD)$")`
- `cookingTimeMinutes`: Positive integer, required
  - Annotations: `@NotNull`, `@Min(1)`
- `categoryIds`: At least 1 category required, must exist in database
  - Annotations: `@NotEmpty`, `@Size(min=1)`
- `ingredients`: Minimum 1 required
  - Annotations: `@NotEmpty`, `@Size(min=1)`, `@Valid`
  - `quantity`: Max 20 characters, supports fractions (e.g., "1/2")
    - Annotations: `@NotBlank`, `@Size(max=20)`
  - `unit`: Max 20 characters
    - Annotations: `@NotBlank`, `@Size(max=20)`
  - `name`: Max 50 characters
    - Annotations: `@NotBlank`, `@Size(max=50)`
- `steps`: Minimum 2 required
  - Annotations: `@NotEmpty`, `@Size(min=2)`, `@Valid`
  - `instruction`: 1-500 characters
    - Annotations: `@NotBlank`, `@Size(min=1, max=500)`

### Success Response (HTTP 201)

```json
{
  "status": "success",
  "message": "Recipe created successfully",
  "data": {
    "recipeId": 42
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
      "title": "Title is required",
      "ingredients": "At least one ingredient is required",
      "steps": "At least two steps are required",
      "categoryIds": "At least one category is required"
    }
  }
}
```

**HTTP 404 - Category Not Found**:
```json
{
  "status": "error",
  "message": "Invalid category ID",
  "data": {
    "errors": {
      "categoryIds": "Category with ID 99 does not exist"
    }
  }
}
```

### Side Effects

1. Recipe created with `userId` from JWT
2. Ingredients assigned sequential `sortOrder` (1, 2, 3...)
3. Steps assigned sequential `stepNumber` (1, 2, 3...)
4. `createdAt` and `updatedAt` timestamps set automatically

### Business Rules

1. Recipe automatically associated with authenticated user (from JWT)
2. Minimum 1 ingredient required
3. Minimum 2 steps required
4. Minimum 1 category assignment required
5. Ingredients assigned continuous `sortOrder` starting from 1
6. Steps assigned continuous `stepNumber` starting from 1
7. Category IDs must exist in database

### Process Flow

1. Validate all fields
2. Verify all category IDs exist
3. Extract userId from JWT
4. Create recipe record with userId
5. Create ingredient records with sequential sortOrder
6. Create step records with sequential stepNumber
7. Create recipe-category associations
8. Return recipe ID

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

**Design Notes**:
- VARCHAR quantity allows flexible input (fractions, decimals, descriptive text)
- Unique constraint on (recipe_id, sort_order) prevents duplicate positions
- Continuous numbering enforced in business logic (1, 2, 3, 4 with no gaps)

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
- Minimum 2 steps required per recipe (enforced in business logic)
- Unique constraint ensures no duplicate step numbers within a recipe

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
- Minimum 1 category per recipe enforced in business logic

### Relationships

- `recipes.user_id` → `users.id` (1:N, ON DELETE CASCADE)
- `recipes` → `ingredients` (1:N, ON DELETE CASCADE)
- `recipes` → `steps` (1:N, ON DELETE CASCADE)
- `recipes` ↔ `categories` via `recipe_categories` (N:M)

### JPA Entity Mapping

```java
@Entity
public class Recipe {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "user_id", nullable = false)
    private Long userId;
    
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

### Continuous Numbering

**Ingredient Sort Order**:
- On creation: Assigned 1, 2, 3, 4... in request order
- No gaps allowed in sequence

**Step Numbering**:
- On creation: Assigned 1, 2, 3, 4... in request order
- No gaps allowed in sequence
- User does not manually provide step numbers
