# Database Planning Session Summary

**Date**: December 17, 2025  
**Project**: Recipe Notebook MVP  
**Session Type**: Database Schema Planning

---

## Decisions

### Entity Structure Decisions
1. **User metadata**: No additional tracking beyond core requirements (no lastLoginAt, updatedAt, accountStatus)
2. **Sample recipe**: Static recipe inserted via SQL script, no isSample flag needed
3. **Ingredient sort order**: Enforce continuous numbering (1, 2, 3, 4) with UNIQUE constraint on (recipe_id, sort_order)
4. **Step numbering**: Auto-renumber steps when one is deleted to maintain continuous sequence
5. **Ingredient quantity**: Use VARCHAR(20) for flexibility (supports "1/2", "1.5", "a pinch")
6. **Cooking time**: Single value only (no ranges like "30-45 minutes")
7. **Character encoding**: UTF-8 for international recipe names with accented characters
8. **Timestamps**: No timezone awareness for MVP (simple TIMESTAMP without timezone)

### Relationship Decisions
9. **RecipeCategory metadata**: No additional metadata (no createdAt or sort order)
10. **User deletion cascade**: Not implemented for MVP, no soft-delete
11. **Category cleanup**: No orphaned category cleanup needed
12. **JPA relationship style**: Unidirectional JPA relationships for simplicity

### Security Decisions
13. **Row-level security**: Implement in repository layer with userId filtering in all queries
14. **Username uniqueness**: Database-level UNIQUE constraint
15. **JWT token invalidation**: Client-side token deletion only (no server-side blacklist)
16. **JWT secret storage**: Environment variable (not in database)

### Performance Decisions
17. **Index strategy**: Create indexes on:
    - recipes.user_id
    - ingredients.recipe_id
    - steps.recipe_id
    - recipe_categories.category_id
    - Recipe.title (for search)
18. **Pagination**: Database-level using SQL LIMIT/OFFSET
19. **Search debouncing**: 300ms client-side debounce is sufficient
20. **Expected data volume**: ~100 recipes per user, 5-10 ingredients per recipe

### H2-Specific Decisions
21. **H2 console**: Enable for development debugging
22. **Database file location**: Explicit file path with environment variable override
23. **Primary key strategy**: Use IDENTITY strategy for all tables
24. **H2 compatibility mode**: Add MODE=PostgreSQL for future migration
25. **Database initialization**: Use data.sql for default categories and sample recipe

---

## Matched Recommendations

### Core Tables (Approved)

**1. User Table**
```sql
CREATE TABLE users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password_hash VARCHAR(60) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```
- UNIQUE constraint on username (Decision #14)
- BCrypt password hash storage (60 chars)
- Minimal metadata per Decision #1

**2. Recipe Table**
```sql
CREATE TABLE recipes (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    title VARCHAR(100) NOT NULL,
    difficulty VARCHAR(10) NOT NULL CHECK (difficulty IN ('EASY', 'MEDIUM', 'HARD')),
    cooking_time_minutes INT NOT NULL CHECK (cooking_time_minutes > 0),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_title (title)
);
```
- Single cooking time value (Decision #6)
- Indexes on user_id and title (Decision #17)
- UTF-8 encoding for title (Decision #7)
- No timezone on timestamps (Decision #8)

**3. Ingredient Table**
```sql
CREATE TABLE ingredients (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    recipe_id BIGINT NOT NULL,
    quantity VARCHAR(20) NOT NULL,
    unit VARCHAR(20) NOT NULL,
    name VARCHAR(50) NOT NULL,
    sort_order INT NOT NULL,
    FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE CASCADE,
    UNIQUE (recipe_id, sort_order),
    INDEX idx_recipe_id (recipe_id)
);
```
- VARCHAR(20) for quantity (Decision #5)
- UNIQUE constraint on (recipe_id, sort_order) for continuous ordering (Decision #3)
- Index on recipe_id (Decision #17)

**4. Step Table**
```sql
CREATE TABLE steps (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    recipe_id BIGINT NOT NULL,
    step_number INT NOT NULL,
    instruction VARCHAR(500) NOT NULL,
    FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE CASCADE,
    UNIQUE (recipe_id, step_number),
    INDEX idx_recipe_id (recipe_id)
);
```
- Auto-renumbering enforced in business logic (Decision #4)
- UNIQUE constraint prevents duplicate step numbers
- Index on recipe_id (Decision #17)

**5. Category Table**
```sql
CREATE TABLE categories (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    is_default BOOLEAN DEFAULT FALSE
);
```
- Simple structure, no metadata (Decision #9)

**6. RecipeCategory Table (Junction)**
```sql
CREATE TABLE recipe_categories (
    recipe_id BIGINT NOT NULL,
    category_id BIGINT NOT NULL,
    PRIMARY KEY (recipe_id, category_id),
    FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE RESTRICT,
    INDEX idx_category_id (category_id)
);
```
- No additional metadata (Decision #9)
- Index on category_id (Decision #17)

### Relationship Implementation

**7. Unidirectional JPA Relationships (Decision #12)**
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

**8. Cascade Delete Implementation**
- Recipe → User: ON DELETE CASCADE (if future user deletion)
- Ingredient/Step → Recipe: ON DELETE CASCADE (per F-REC-14)
- RecipeCategory → Category: ON DELETE RESTRICT

### Security Implementation

**9. Row-Level Security in Repository Layer (Decision #13)**
```java
public interface RecipeRepository extends JpaRepository<Recipe, Long> {
    List<Recipe> findByUserId(Long userId);
    Optional<Recipe> findByIdAndUserId(Long id, Long userId);
    Page<Recipe> findByUserId(Long userId, Pageable pageable);
    // All queries MUST include userId filter
}
```

**10. Database-Level Unique Constraint (Decision #14)**
```sql
CREATE UNIQUE INDEX idx_users_username ON users(username);
```

**11. JWT Configuration (Decisions #15, #16)**
```properties
# application.properties
jwt.secret=${JWT_SECRET:default-secret-for-dev-only}
jwt.expiration-hours=24
```
- No server-side token blacklist
- Client-side deletion from sessionStorage

### H2 Configuration

**12. H2 Database Configuration (Decisions #21-25)**
```properties
# application-dev.properties
spring.datasource.url=jdbc:h2:file:${DB_PATH:./data/recipes};MODE=PostgreSQL
spring.h2.console.enabled=true
spring.h2.console.path=/h2-console
spring.jpa.hibernate.ddl-auto=update

# application-prod.properties
spring.datasource.url=jdbc:h2:file:${DB_PATH:./data/recipes};MODE=PostgreSQL
spring.h2.console.enabled=false
spring.jpa.hibernate.ddl-auto=update
```

**13. Primary Key Strategy (Decision #23)**
```java
@Id
@GeneratedValue(strategy = GenerationType.IDENTITY)
private Long id;
```

**14. Database Initialization via data.sql (Decision #25)**
```sql
-- data.sql
INSERT INTO categories (name, is_default) VALUES
('Breakfast', true),
('Lunch', true),
('Dinner', true),
('Dessert', true),
('Snacks', true),
('Drinks', true);

-- Sample recipe to be defined
INSERT INTO recipes (user_id, title, difficulty, cooking_time_minutes) VALUES
(?, 'Sample Recipe', 'EASY', 30);
-- Additional sample ingredients and steps to be added
```

### Performance Optimization

**15. Indexing Strategy (Decision #17)**
- Foreign key indexes: user_id, recipe_id, category_id
- Search index: Recipe.title
- No over-indexing on non-queried fields (created_at, cooking_time_minutes)

**16. Pagination Strategy (Decision #18)**
```java
// Database-level pagination
Page<Recipe> findByUserId(Long userId, Pageable pageable);
// Use PageRequest.of(page, 20, Sort.by("title").ascending())
```

**17. Search Debouncing (Decision #19)**
- Client-side 300ms debounce sufficient
- No server-side throttling needed for MVP
- Database handles search via indexed title column

### Data Integrity

**18. NOT NULL and CHECK Constraints**
- All required fields marked NOT NULL
- CHECK constraints for enums (difficulty)
- CHECK constraints for positive integers (cooking_time_minutes)

**19. UNIQUE Constraints**
- users.username
- (recipe_id, sort_order) in ingredients
- (recipe_id, step_number) in steps

**20. Automatic Timestamp Management**
```sql
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
```

---

## Database Planning Summary

### Overview
The database schema has been designed to support the Recipe Notebook MVP with a focus on simplicity, data integrity, and future PostgreSQL migration. The schema consists of 6 core tables supporting user authentication, recipe management, and basic categorization.

### Key Database Schema Requirements

1. **User Isolation**: Complete data separation between users via row-level security implemented in repository layer
2. **Data Integrity**: CASCADE deletion for recipe children (ingredients, steps), RESTRICT deletion for categories
3. **Sequential Ordering**: Continuous numbering for ingredients (sort_order) and steps (step_number) with auto-renumbering on deletion
4. **Flexible Data Entry**: VARCHAR-based quantity fields to support fractions, decimals, and text ("1/2", "a pinch")
5. **Future Migration**: H2 configured in PostgreSQL compatibility mode for seamless migration path
6. **Performance**: Strategic indexing on foreign keys and search fields to support 100+ recipes per user

### Key Entities and Relationships

**Core Entities:**
1. **User** - Authentication and ownership (id, username, password_hash, created_at)
2. **Recipe** - Main entity (id, user_id, title, difficulty, cooking_time_minutes, timestamps)
3. **Ingredient** - Recipe components (id, recipe_id, quantity, unit, name, sort_order)
4. **Step** - Cooking instructions (id, recipe_id, step_number, instruction)
5. **Category** - Meal type classification (id, name, is_default)
6. **RecipeCategory** - Many-to-many junction (recipe_id, category_id)

**Relationships:**
- User 1:N Recipe (one user owns many recipes)
- Recipe 1:N Ingredient (cascade delete, continuous sort_order)
- Recipe 1:N Step (cascade delete, auto-renumbered step_number)
- Recipe N:M Category (via RecipeCategory junction table)

**Cardinality Constraints:**
- Minimum 1 ingredient per recipe (enforced in business logic)
- Minimum 2 steps per recipe (enforced in business logic)
- Minimum 1 category per recipe (enforced in business logic)
- Maximum expected: 100 recipes/user, 5-10 ingredients/recipe

### Security Implementation

**Authentication:**
- BCrypt password hashing with 60-character VARCHAR storage
- JWT token authentication with 24-hour expiration
- JWT secret stored as environment variable
- Client-side token deletion only (no server-side blacklist)

**Authorization:**
- Row-level security via repository layer userId filtering
- Every query includes `WHERE userId = ?` condition
- Database-level UNIQUE constraint on username prevents duplicates
- No cross-user data access possible

**Data Protection:**
- Passwords never stored in plaintext
- Database file can be encrypted at file-system level if needed
- CORS configuration restricts API access to known origins

### Scalability Considerations

**Current Scale (MVP):**
- Maximum 5 concurrent users
- ~100 recipes per user
- 5-10 ingredients per recipe
- 20 recipes per page pagination

**Performance Optimizations:**
- Indexed foreign keys for JOIN performance
- Indexed title for search queries
- Database-level pagination with LIMIT/OFFSET
- Client-side search debouncing (300ms)

**Future Migration Path:**
1. H2 MODE=PostgreSQL ensures SQL compatibility
2. IDENTITY strategy supported by PostgreSQL
3. Schema designed for zero changes during migration
4. Add Flyway/Liquibase for production migrations
5. Switch to `spring.jpa.hibernate.ddl-auto=validate`

**Extensibility:**
- Schema supports future features (tags, ratings, photos)
- is_default flag enables future custom categories
- Timestamp tracking supports future analytics
- Unidirectional JPA relationships simplify future refactoring

### Database Initialization

**Startup Sequence:**
1. H2 database file created at `${DB_PATH:./data/recipes}`
2. Auto-DDL creates tables from JPA entities
3. data.sql inserts 6 default categories
4. data.sql inserts sample recipe (content TBD)

**Default Categories:**
- Breakfast
- Lunch
- Dinner
- Dessert
- Snacks
- Drinks

All marked with `is_default = true` for system identification.

### Development Workflow

**Local Development:**
- H2 console enabled at `/h2-console`
- Auto-DDL updates schema on entity changes
- DevTools for auto-restart on code changes
- Database file persists between restarts

**Testing Strategy:**
- Unit tests for constraint validation (unique username, CASCADE delete)
- Integration tests for row-level security (userId filtering)
- Performance tests with 100+ recipes per user
- Edge case tests (minimum validations: 1 ingredient, 2 steps)

**Production Deployment:**
- H2 console disabled
- Database file path configurable via DB_PATH env var
- JWT_SECRET required via environment variable
- Single JAR deployment with embedded database

---

## Unresolved Issues

### Critical (Must Resolve Before Implementation)

1. **Sample Recipe Content**: Define exact title, ingredients, steps, and categories for auto-generated sample recipe in data.sql
   - **Impact**: Blocks data.sql creation
   - **Recommendation**: Simple recipe like "Scrambled Eggs" with 3 ingredients, 3 steps, Breakfast category

2. **Step Renumbering Logic**: Clarify exact business logic for auto-renumbering steps
   - **Scenario**: Recipe has steps 1, 2, 3, 4. User deletes step 2. What happens?
   - **Option A**: Immediate renumber (3→2, 4→3) on delete
   - **Option B**: Renumber on next save/edit
   - **Impact**: Affects service layer implementation complexity

3. **Ingredient Sort Order Management**: Define UI/API contract for sort_order
   - **Question**: Does frontend send explicit sort_order values, or does backend auto-assign?
   - **Impact**: Affects DTO design and validation logic

### Non-Critical (Can Defer or Use Defaults)

4. **BCrypt Rounds Configuration**: Recommended value is 12 rounds, but should be confirmed based on performance testing
   - **Default**: Use 12 rounds (industry standard)
   - **Testing**: Validate login performance stays under 500ms (NF-PERF-4)

5. **Error Message Standards**: Define exact error messages for constraint violations
   - **Examples needed**:
     - Duplicate username: "Username already exists"
     - Invalid difficulty: "Difficulty must be EASY, MEDIUM, or HARD"
     - Missing required field: "Title is required"
   - **Impact**: User experience consistency

6. **H2 Database File Backup Strategy**: How should users backup their recipes?
   - **Options**:
     - Manual file copy of recipes.mv.db
     - Export to JSON endpoint
     - Automatic backup on shutdown
   - **Impact**: Data safety, user trust

7. **Character Encoding Validation**: Should we restrict special characters (emoji) in recipe titles?
   - **Current**: UTF-8 supports full Unicode including emoji
   - **Question**: Are there specific characters to block?
   - **Impact**: Validation logic complexity

8. **Category Name Capitalization**: Confirm exact casing for default categories
   - **Current assumption**: Title case (Breakfast, Lunch, Dinner, etc.)
   - **Impact**: data.sql content, UI display consistency

### Future Considerations (Post-MVP)

9. **User Account Deletion**: Design user deletion workflow
   - **Options**: Hard delete with CASCADE, soft delete with flag
   - **Impact**: Data retention policy, GDPR compliance

10. **Recipe Title Uniqueness**: Consider adding optional unique constraint per user
    - **Current**: F-REC-15 explicitly states NO unique constraint
    - **Future**: Users may want to prevent duplicate recipe names

11. **Audit Trail**: Consider adding audit columns (created_by, updated_by, deleted_at)
    - **Current**: Basic created_at/updated_at only
    - **Future**: Full audit trail for recipe history

12. **Database Migration Testing**: Plan test migration from H2 to PostgreSQL
    - **Timeline**: Before first production deployment
    - **Risk**: Data loss if migration fails

---

## Next Actions

### Immediate (Before Coding)
1. ✅ Define sample recipe content for data.sql
2. ✅ Clarify step renumbering business logic
3. ✅ Define sort_order API contract (frontend vs backend responsibility)

### Implementation Phase
4. Create JPA entities with proper annotations
5. Create repository interfaces with userId filtering
6. Create data.sql with default categories and sample recipe
7. Configure application.properties for dev/prod profiles
8. Implement BCrypt password encoder bean
9. Set up H2 console for development

### Testing Phase
10. Write unit tests for constraint validation
11. Write integration tests for row-level security
12. Performance test with 100+ recipes
13. Test H2 → PostgreSQL migration path

### Documentation
14. Document environment variables (JWT_SECRET, DB_PATH)
15. Document database backup procedure
16. Create database schema diagram
17. Document migration procedure for production deployment
