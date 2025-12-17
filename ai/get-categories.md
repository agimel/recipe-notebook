# Endpoint: GET /api/v1/categories

## Endpoint Details

**HTTP Method**: GET  
**Path**: `/api/v1/categories`  
**Description**: List all available categories  
**Authentication**: Required (JWT)

### Query Parameters

None

### Success Response (HTTP 200)

```json
{
  "status": "success",
  "message": "Categories retrieved successfully",
  "data": {
    "categories": [
      { "id": 1, "name": "Breakfast", "isDefault": true },
      { "id": 2, "name": "Lunch", "isDefault": true },
      { "id": 3, "name": "Dinner", "isDefault": true },
      { "id": 4, "name": "Dessert", "isDefault": true },
      { "id": 5, "name": "Snacks", "isDefault": true },
      { "id": 6, "name": "Drinks", "isDefault": true }
    ]
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

### Notes

- Returns all system categories (no user-specific categories in MVP)
- All categories have `isDefault: true` in MVP
- No pagination (small static dataset)
- Sorted alphabetically by name

---

## Related Database Resources

### Tables

#### categories
**Description**: Stores meal type classifications

**Schema**:
```sql
CREATE TABLE categories (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    is_default BOOLEAN DEFAULT FALSE
);
```

**Columns**:
- `id` (BIGINT, PK): Auto-incrementing unique identifier
- `name` (VARCHAR(50), UNIQUE, NOT NULL): Category name
- `is_default` (BOOLEAN): Flag for system-created categories

**Constraints**:
- Primary Key: `id`
- Unique: `name`
- NOT NULL: `name`

**Design Notes**:
- MVP includes 6 default categories: Breakfast, Lunch, Dinner, Dessert, Snacks, Drinks
- `is_default = true` identifies system categories
- No user-specific categories in MVP (shared across all users)
- No custom category creation/deletion in MVP

### Default Categories

```sql
INSERT INTO categories (name, is_default) VALUES
('Breakfast', true),
('Lunch', true),
('Dinner', true),
('Dessert', true),
('Snacks', true),
('Drinks', true);
```

### Relationships

- `categories` ↔ `recipes` via `recipe_categories` (N:M)
- `category_id` → `categories(id)` ON DELETE RESTRICT (prevents deletion of categories in use)

### Indexes

- `idx_categories_name` (UNIQUE): Enforce category name uniqueness

### JPA Entity Mapping

```java
@Entity
public class Category {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false, unique = true, length = 50)
    private String name;
    
    @Column(name = "is_default")
    private Boolean isDefault;
}
```

### JPA Repository Method

```java
public interface CategoryRepository extends JpaRepository<Category, Long> {
    List<Category> findAllByOrderByNameAsc();
}
```

### Notes

- Categories are read-only in MVP (no create/update/delete endpoints)
- All users share the same 6 default categories
- Client-side caching recommended (static data)
