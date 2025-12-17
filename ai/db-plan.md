# Recipe Notebook Database Schema

**Database**: H2 (PostgreSQL Compatibility Mode)  
**Version**: 1.0  
**Date**: December 17, 2025  
**Author**: Database Architecture Team  

---

## 1. Tables

### 1.1 Users Table
Stores user authentication and account information.

```sql
CREATE TABLE users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password_hash VARCHAR(60) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Columns:**
- `id` (BIGINT, PK): Auto-incrementing unique identifier
- `username` (VARCHAR(50), UNIQUE, NOT NULL): User's login name (3-50 characters)
- `password_hash` (VARCHAR(60), NOT NULL): BCrypt hashed password
- `created_at` (TIMESTAMP): Account creation timestamp

**Constraints:**
- Primary Key: `id`
- Unique: `username`
- NOT NULL: `username`, `password_hash`

**Design Notes:**
- BCrypt hash requires 60 characters for storage
- No additional metadata (lastLoginAt, updatedAt) per MVP requirements
- Username uniqueness enforced at database level for security

---

### 1.2 Recipes Table
Stores core recipe information.

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

**Columns:**
- `id` (BIGINT, PK): Auto-incrementing unique identifier
- `user_id` (BIGINT, FK, NOT NULL): Owner of the recipe
- `title` (VARCHAR(100), NOT NULL): Recipe name (1-100 characters)
- `difficulty` (VARCHAR(10), NOT NULL): Cooking difficulty (EASY, MEDIUM, HARD)
- `cooking_time_minutes` (INT, NOT NULL): Total cooking time in minutes (positive integer)
- `created_at` (TIMESTAMP): Recipe creation timestamp
- `updated_at` (TIMESTAMP): Last modification timestamp

**Constraints:**
- Primary Key: `id`
- Foreign Key: `user_id` → `users(id)` ON DELETE CASCADE
- NOT NULL: `user_id`, `title`, `difficulty`, `cooking_time_minutes`
- CHECK: `difficulty IN ('EASY', 'MEDIUM', 'HARD')`
- CHECK: `cooking_time_minutes > 0`

**Design Notes:**
- No unique constraint on title (multiple recipes can have same name)
- Single cooking time value only (no ranges)
- UTF-8 encoding supports international recipe names with accents
- ON UPDATE CURRENT_TIMESTAMP automatically tracks modifications
- Cascade delete ensures orphaned recipes are removed if user is deleted (future feature)

---

### 1.3 Ingredients Table
Stores recipe ingredients with ordering.

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

**Columns:**
- `id` (BIGINT, PK): Auto-incrementing unique identifier
- `recipe_id` (BIGINT, FK, NOT NULL): Parent recipe reference
- `quantity` (VARCHAR(20), NOT NULL): Ingredient amount (supports "1/2", "1.5", "a pinch")
- `unit` (VARCHAR(20), NOT NULL): Measurement unit (cups, tbsp, grams, etc.)
- `name` (VARCHAR(50), NOT NULL): Ingredient name
- `sort_order` (INT, NOT NULL): Display order (continuous numbering: 1, 2, 3...)

**Constraints:**
- Primary Key: `id`
- Foreign Key: `recipe_id` → `recipes(id)` ON DELETE CASCADE
- UNIQUE: `(recipe_id, sort_order)` - Enforces continuous ordering
- NOT NULL: All columns

**Design Notes:**
- VARCHAR quantity allows flexible input (fractions, decimals, descriptive text)
- Unique constraint on (recipe_id, sort_order) prevents duplicate positions
- Continuous numbering enforced in business logic (1, 2, 3, 4 with no gaps)
- Cascade delete removes all ingredients when recipe is deleted

---

### 1.4 Steps Table
Stores recipe cooking instructions with sequential numbering.

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

**Columns:**
- `id` (BIGINT, PK): Auto-incrementing unique identifier
- `recipe_id` (BIGINT, FK, NOT NULL): Parent recipe reference
- `step_number` (INT, NOT NULL): Sequential step number (1, 2, 3...)
- `instruction` (VARCHAR(500), NOT NULL): Instruction text (max 500 characters)

**Constraints:**
- Primary Key: `id`
- Foreign Key: `recipe_id` → `recipes(id)` ON DELETE CASCADE
- UNIQUE: `(recipe_id, step_number)` - Prevents duplicate step numbers
- NOT NULL: All columns

**Design Notes:**
- Minimum 2 steps required per recipe (enforced in business logic)
- Auto-renumbering logic in service layer maintains continuous sequence on deletion
- Unique constraint ensures no duplicate step numbers within a recipe
- Cascade delete removes all steps when recipe is deleted

---

### 1.5 Categories Table
Stores meal type classifications.

```sql
CREATE TABLE categories (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    is_default BOOLEAN DEFAULT FALSE
);
```

**Columns:**
- `id` (BIGINT, PK): Auto-incrementing unique identifier
- `name` (VARCHAR(50), UNIQUE, NOT NULL): Category name
- `is_default` (BOOLEAN): Flag for system-created categories

**Constraints:**
- Primary Key: `id`
- UNIQUE: `name`
- NOT NULL: `name`

**Design Notes:**
- MVP includes 6 default categories: Breakfast, Lunch, Dinner, Dessert, Snacks, Drinks
- `is_default = true` identifies system categories
- No user-specific categories in MVP (shared across all users)
- No custom category creation/deletion in MVP

---

### 1.6 RecipeCategories Table
Junction table for many-to-many relationship between recipes and categories.

```sql
CREATE TABLE recipe_categories (
    recipe_id BIGINT NOT NULL,
    category_id BIGINT NOT NULL,
    PRIMARY KEY (recipe_id, category_id),
    FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE RESTRICT
);
```

**Columns:**
- `recipe_id` (BIGINT, FK, NOT NULL): Recipe reference
- `category_id` (BIGINT, FK, NOT NULL): Category reference

**Constraints:**
- Primary Key: `(recipe_id, category_id)` - Composite key
- Foreign Key: `recipe_id` → `recipes(id)` ON DELETE CASCADE
- Foreign Key: `category_id` → `categories(id)` ON DELETE RESTRICT
- NOT NULL: Both columns

**Design Notes:**
- No additional metadata (createdAt, sort order) in MVP
- CASCADE on recipe deletion removes all category assignments
- RESTRICT on category deletion prevents deletion of categories in use
- Minimum 1 category per recipe enforced in business logic

---

## 2. Relationships

### 2.1 Entity Relationship Diagram (Text Format)

```
users (1) ──────< (N) recipes
                        │
                        ├───< (N) ingredients
                        │
                        ├───< (N) steps
                        │
                        └───< (N) recipe_categories >───┐
                                                         │
categories (N) <─────────────────────────────────────────┘
```

### 2.2 Relationship Details

| Parent | Child | Cardinality | Cascade Behavior | Notes |
|--------|-------|-------------|------------------|-------|
| users | recipes | 1:N | ON DELETE CASCADE | One user owns many recipes |
| recipes | ingredients | 1:N | ON DELETE CASCADE | One recipe has many ingredients (min 1) |
| recipes | steps | 1:N | ON DELETE CASCADE | One recipe has many steps (min 2) |
| recipes | recipe_categories | 1:N | ON DELETE CASCADE | One recipe has many category assignments (min 1) |
| categories | recipe_categories | 1:N | ON DELETE RESTRICT | One category can be assigned to many recipes |
| recipes ↔ categories | N:M via recipe_categories | Recipe can have multiple categories, category can be used by multiple recipes |

### 2.3 JPA Relationship Mapping (Unidirectional)

**Recipe Entity (Parent)**
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

**Design Notes:**
- Unidirectional relationships for simplicity (no bidirectional mappings)
- orphanRemoval = true ensures orphaned ingredients/steps are deleted
- @OrderBy on steps maintains sequential ordering
- Set<Category> prevents duplicate category assignments

---

## 3. Indexes

### 3.1 Index Definitions

```sql
-- Foreign key indexes for JOIN performance
CREATE INDEX idx_recipes_user_id ON recipes(user_id);
CREATE INDEX idx_ingredients_recipe_id ON ingredients(recipe_id);
CREATE INDEX idx_steps_recipe_id ON steps(recipe_id);
CREATE INDEX idx_recipe_categories_category_id ON recipe_categories(category_id);

-- Search optimization
CREATE INDEX idx_recipes_title ON recipes(title);

-- Unique constraint indexes (auto-created by database)
-- idx_users_username (UNIQUE on users.username)
-- idx_categories_name (UNIQUE on categories.name)
```

### 3.2 Index Strategy

| Index Name | Table | Column(s) | Type | Purpose |
|------------|-------|-----------|------|---------|
| idx_recipes_user_id | recipes | user_id | BTREE | Filter recipes by user (row-level security) |
| idx_ingredients_recipe_id | ingredients | recipe_id | BTREE | Retrieve ingredients for recipe detail view |
| idx_steps_recipe_id | steps | recipe_id | BTREE | Retrieve steps for recipe detail view |
| idx_recipe_categories_category_id | recipe_categories | category_id | BTREE | Filter recipes by category |
| idx_recipes_title | recipes | title | BTREE | Search recipes by name (partial match) |
| idx_users_username | users | username | UNIQUE | Enforce username uniqueness, login lookup |
| idx_categories_name | categories | name | UNIQUE | Enforce category name uniqueness |

**Design Notes:**
- Indexes optimized for expected query patterns (user filtering, recipe search, category filtering)
- No over-indexing on non-queried fields (created_at, cooking_time_minutes)
- Foreign key indexes improve JOIN performance for recipe detail view
- Expected data volume: ~100 recipes per user, 5-10 ingredients per recipe

---

## 4. Data Integrity Rules

### 4.1 NOT NULL Constraints
All columns marked NOT NULL to enforce data completeness:
- users: username, password_hash
- recipes: user_id, title, difficulty, cooking_time_minutes
- ingredients: recipe_id, quantity, unit, name, sort_order
- steps: recipe_id, step_number, instruction
- categories: name
- recipe_categories: recipe_id, category_id

### 4.2 UNIQUE Constraints
- users.username - Prevents duplicate usernames
- categories.name - Prevents duplicate category names
- ingredients(recipe_id, sort_order) - Enforces continuous ingredient ordering
- steps(recipe_id, step_number) - Prevents duplicate step numbers
- recipe_categories(recipe_id, category_id) - Prevents duplicate category assignments

### 4.3 CHECK Constraints
```sql
-- Difficulty enum validation
CHECK (difficulty IN ('EASY', 'MEDIUM', 'HARD'))

-- Positive cooking time
CHECK (cooking_time_minutes > 0)
```

### 4.4 Cascade Rules
| Trigger | Cascade Behavior | Affected Tables |
|---------|------------------|-----------------|
| DELETE recipe | CASCADE | ingredients, steps, recipe_categories |
| DELETE user | CASCADE | recipes (and transitively: ingredients, steps, recipe_categories) |
| DELETE category | RESTRICT | Prevents deletion if category is in use |

### 4.5 Business Logic Constraints (Enforced in Service Layer)
- Minimum 1 ingredient per recipe
- Minimum 2 steps per recipe
- Minimum 1 category per recipe
- Username: 3-50 characters
- Password: minimum 6 characters
- Continuous numbering for ingredient sort_order and step_number

---

## 5. Security Implementation

### 5.1 Row-Level Security (Repository Layer)

**Authentication:**
- BCrypt password hashing (60-character storage)
- JWT token authentication with 24-hour expiration
- JWT secret stored as environment variable (JWT_SECRET)
- Client-side token deletion from sessionStorage (no server-side blacklist)

**Authorization:**
All repository queries MUST include userId filtering to enforce row-level security:

```java
public interface RecipeRepository extends JpaRepository<Recipe, Long> {
    // Find all recipes for a user
    List<Recipe> findByUserId(Long userId);
    
    // Find single recipe with user validation
    Optional<Recipe> findByIdAndUserId(Long id, Long userId);
    
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

**Design Notes:**
- Every query includes `userId` parameter to prevent cross-user data access
- Database-level UNIQUE constraint on username prevents account hijacking
- No queries should access recipes without userId filtering
- H2 console disabled in production for security

### 5.2 Input Validation
Enforced via Hibernate Validator annotations:
- @NotBlank on required text fields
- @Size for length constraints
- @Min for positive integers
- @Pattern for username format validation

---

## 6. Database Configuration

### 6.1 H2 Configuration

**Development (application-dev.properties):**
```properties
spring.datasource.url=jdbc:h2:file:${DB_PATH:./data/recipes};MODE=PostgreSQL
spring.datasource.driverClassName=org.h2.Driver
spring.jpa.database-platform=org.hibernate.dialect.H2Dialect
spring.h2.console.enabled=true
spring.h2.console.path=/h2-console
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
```

**Production (application-prod.properties):**
```properties
spring.datasource.url=jdbc:h2:file:${DB_PATH:./data/recipes};MODE=PostgreSQL
spring.datasource.driverClassName=org.h2.Driver
spring.jpa.database-platform=org.hibernate.dialect.H2Dialect
spring.h2.console.enabled=false
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=false
```

**Design Notes:**
- MODE=PostgreSQL enables PostgreSQL compatibility for future migration
- File-based storage at `./data/recipes.mv.db`
- DB_PATH environment variable allows custom database location
- H2 console disabled in production for security
- ddl-auto=update automatically applies schema changes

### 6.2 Primary Key Strategy
```java
@Id
@GeneratedValue(strategy = GenerationType.IDENTITY)
private Long id;
```
- IDENTITY strategy used for all tables
- Auto-incrementing BIGINT primary keys
- Compatible with PostgreSQL for future migration

### 6.3 Database Initialization (data.sql)

**Default Categories:**
```sql
INSERT INTO categories (name, is_default) VALUES
('Breakfast', true),
('Lunch', true),
('Dinner', true),
('Dessert', true),
('Snacks', true),
('Drinks', true);
```

**Sample Recipe (Created on User Registration):**
- Sample recipe inserted via application code during user registration
- No hardcoded user_id in data.sql to avoid foreign key issues
- One sample recipe per new user account

---

## 7. Performance Optimization

### 7.1 Query Optimization

**Pagination:**
```java
// Database-level pagination with LIMIT/OFFSET
PageRequest pageRequest = PageRequest.of(page, 20, Sort.by("title").ascending());
Page<Recipe> recipes = recipeRepository.findByUserId(userId, pageRequest);
```

**Search Debouncing:**
- Client-side 300ms debounce on search input
- No server-side throttling needed for MVP
- Database handles search via indexed title column

**Expected Load:**
- Maximum 5 concurrent users
- ~100 recipes per user
- 5-10 ingredients per recipe
- 20 recipes per page

### 7.2 N+1 Query Prevention

**Fetch Strategies:**
```java
// Use JOIN FETCH for recipe detail view
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

**Design Notes:**
- Single query retrieves recipe with all related entities
- Prevents N+1 queries when displaying recipe detail
- LEFT JOIN FETCH eagerly loads collections

---

## 8. Migration Path to PostgreSQL

### 8.1 Migration Strategy
The schema is designed for zero-change migration to PostgreSQL:

1. **SQL Compatibility**: MODE=PostgreSQL ensures H2 uses PostgreSQL-compatible SQL
2. **Data Type Compatibility**: All data types have direct PostgreSQL equivalents
3. **Primary Key Strategy**: IDENTITY supported by PostgreSQL SERIAL
4. **Constraints**: CHECK, UNIQUE, FOREIGN KEY constraints identical
5. **Indexes**: BTREE indexes work identically in PostgreSQL

### 8.2 Migration Steps (Post-MVP)
1. Export H2 data to SQL dump
2. Update application.properties with PostgreSQL connection
3. Switch hibernate.ddl-auto to `validate`
4. Add Flyway/Liquibase for schema version control
5. Import H2 data dump into PostgreSQL
6. Run integration tests to verify data integrity

**No schema changes required during migration.**

---

## 9. Design Decisions Summary

### 9.1 Key Decisions
1. **User Isolation**: Row-level security via repository layer userId filtering
2. **Continuous Numbering**: Ingredients and steps maintain sequential numbering with auto-renumbering on deletion
3. **Flexible Quantity**: VARCHAR(20) supports fractions, decimals, and descriptive text ("1/2 cup", "a pinch")
4. **No Soft Delete**: Hard deletion with cascade rules for MVP simplicity
5. **Shared Categories**: System-wide categories (no user-specific categories in MVP)
6. **Unidirectional JPA**: Simplified entity relationships without bidirectional mappings
7. **Single Cooking Time**: No range support (e.g., "30-45 minutes")
8. **No Recipe Title Uniqueness**: Users can create multiple recipes with same name
9. **Client-Side JWT Management**: No server-side token blacklist for MVP

### 9.2 Future Enhancements
- Add Flyway/Liquibase for schema versioning
- Migrate to PostgreSQL for production
- Add full-text search with tsvector (PostgreSQL)
- Add user profile metadata (avatar, preferences)
- Support custom user-created categories
- Add recipe tags for advanced organization
- Add recipe ratings and notes
- Add recipe photo storage (URL/blob reference)
- Implement soft delete with deleted_at timestamp
- Add cooking time ranges (min_time, max_time)

---

## 10. Database Testing Strategy

### 10.1 Unit Tests
- Constraint validation (UNIQUE username, CHECK constraints)
- Cascade delete behavior (recipe → ingredients/steps)
- Row-level security (userId filtering in repositories)
- Continuous numbering logic (ingredient sort_order, step_number)

### 10.2 Integration Tests
- End-to-end recipe CRUD operations
- Multi-category assignment
- Search and filtering queries
- Pagination with sorting
- Edge cases (minimum validations: 1 ingredient, 2 steps)

### 10.3 Performance Tests
- Query performance with 100+ recipes per user
- Search query performance with title index
- JOIN performance for recipe detail view

---

## Appendix A: Complete Schema DDL

```sql
-- Recipe Notebook Database Schema
-- H2 Database (PostgreSQL Compatibility Mode)

-- Users Table
CREATE TABLE users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password_hash VARCHAR(60) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Recipes Table
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

-- Ingredients Table
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

-- Steps Table
CREATE TABLE steps (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    recipe_id BIGINT NOT NULL,
    step_number INT NOT NULL,
    instruction VARCHAR(500) NOT NULL,
    FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE CASCADE,
    UNIQUE (recipe_id, step_number)
);

-- Categories Table
CREATE TABLE categories (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    is_default BOOLEAN DEFAULT FALSE
);

-- RecipeCategories Junction Table
CREATE TABLE recipe_categories (
    recipe_id BIGINT NOT NULL,
    category_id BIGINT NOT NULL,
    PRIMARY KEY (recipe_id, category_id),
    FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE RESTRICT
);

-- Indexes
CREATE INDEX idx_recipes_user_id ON recipes(user_id);
CREATE INDEX idx_ingredients_recipe_id ON ingredients(recipe_id);
CREATE INDEX idx_steps_recipe_id ON steps(recipe_id);
CREATE INDEX idx_recipe_categories_category_id ON recipe_categories(category_id);
CREATE INDEX idx_recipes_title ON recipes(title);

-- Default Data (data.sql)
INSERT INTO categories (name, is_default) VALUES
('Breakfast', true),
('Lunch', true),
('Dinner', true),
('Dessert', true),
('Snacks', true),
('Drinks', true);
```

---

**End of Database Schema Documentation**
