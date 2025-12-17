-- =============================================================================
-- Recipe Notebook Database Schema
-- Database: H2 (PostgreSQL Compatibility Mode)
-- Version: 1.0
-- Date: December 17, 2025
-- =============================================================================

-- Drop tables if they exist (for clean re-initialization)
DROP TABLE IF EXISTS recipe_categories CASCADE;
DROP TABLE IF EXISTS steps CASCADE;
DROP TABLE IF EXISTS ingredients CASCADE;
DROP TABLE IF EXISTS recipes CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- =============================================================================
-- Table: users
-- Description: Stores user authentication and account information
-- =============================================================================
CREATE TABLE users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password_hash VARCHAR(60) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_username_length CHECK (CHAR_LENGTH(username) >= 3 AND CHAR_LENGTH(username) <= 50)
);

COMMENT ON TABLE users IS 'User authentication and account information';
COMMENT ON COLUMN users.id IS 'Auto-incrementing unique identifier';
COMMENT ON COLUMN users.username IS 'User login name (3-50 characters, unique)';
COMMENT ON COLUMN users.password_hash IS 'BCrypt hashed password (60 characters)';
COMMENT ON COLUMN users.created_at IS 'Account creation timestamp';

-- =============================================================================
-- Table: categories
-- Description: Stores meal type classifications (Breakfast, Lunch, etc.)
-- =============================================================================
CREATE TABLE categories (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    is_default BOOLEAN DEFAULT FALSE
);

COMMENT ON TABLE categories IS 'Meal type classifications for recipe categorization';
COMMENT ON COLUMN categories.id IS 'Auto-incrementing unique identifier';
COMMENT ON COLUMN categories.name IS 'Category name (unique across system)';
COMMENT ON COLUMN categories.is_default IS 'Flag identifying system-created default categories';

-- =============================================================================
-- Table: recipes
-- Description: Stores core recipe information
-- =============================================================================
CREATE TABLE recipes (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    title VARCHAR(100) NOT NULL,
    difficulty VARCHAR(10) NOT NULL,
    cooking_time_minutes INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_recipes_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT chk_difficulty CHECK (difficulty IN ('EASY', 'MEDIUM', 'HARD')),
    CONSTRAINT chk_cooking_time CHECK (cooking_time_minutes > 0),
    CONSTRAINT chk_title_length CHECK (CHAR_LENGTH(title) >= 1 AND CHAR_LENGTH(title) <= 100)
);

COMMENT ON TABLE recipes IS 'Core recipe information including title, difficulty, and cooking time';
COMMENT ON COLUMN recipes.id IS 'Auto-incrementing unique identifier';
COMMENT ON COLUMN recipes.user_id IS 'Owner of the recipe (foreign key to users)';
COMMENT ON COLUMN recipes.title IS 'Recipe name (1-100 characters)';
COMMENT ON COLUMN recipes.difficulty IS 'Cooking difficulty level (EASY, MEDIUM, HARD)';
COMMENT ON COLUMN recipes.cooking_time_minutes IS 'Total cooking time in minutes (positive integer)';
COMMENT ON COLUMN recipes.created_at IS 'Recipe creation timestamp';
COMMENT ON COLUMN recipes.updated_at IS 'Last modification timestamp';

-- =============================================================================
-- Table: ingredients
-- Description: Stores recipe ingredients with ordering
-- =============================================================================
CREATE TABLE ingredients (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    recipe_id BIGINT NOT NULL,
    quantity VARCHAR(20) NOT NULL,
    unit VARCHAR(20) NOT NULL,
    name VARCHAR(50) NOT NULL,
    sort_order INT NOT NULL,
    CONSTRAINT fk_ingredients_recipe FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE CASCADE,
    CONSTRAINT uq_ingredient_order UNIQUE (recipe_id, sort_order)
);

COMMENT ON TABLE ingredients IS 'Recipe ingredients with quantities, units, and display order';
COMMENT ON COLUMN ingredients.id IS 'Auto-incrementing unique identifier';
COMMENT ON COLUMN ingredients.recipe_id IS 'Parent recipe reference (foreign key)';
COMMENT ON COLUMN ingredients.quantity IS 'Ingredient amount (supports fractions, decimals, text like "a pinch")';
COMMENT ON COLUMN ingredients.unit IS 'Measurement unit (cups, tbsp, grams, etc.)';
COMMENT ON COLUMN ingredients.name IS 'Ingredient name (max 50 characters)';
COMMENT ON COLUMN ingredients.sort_order IS 'Display order (continuous numbering: 1, 2, 3...)';

-- =============================================================================
-- Table: steps
-- Description: Stores recipe cooking instructions with sequential numbering
-- =============================================================================
CREATE TABLE steps (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    recipe_id BIGINT NOT NULL,
    step_number INT NOT NULL,
    instruction VARCHAR(500) NOT NULL,
    CONSTRAINT fk_steps_recipe FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE CASCADE,
    CONSTRAINT uq_step_number UNIQUE (recipe_id, step_number),
    CONSTRAINT chk_instruction_length CHECK (CHAR_LENGTH(instruction) >= 1 AND CHAR_LENGTH(instruction) <= 500)
);

COMMENT ON TABLE steps IS 'Recipe cooking instructions with sequential step numbers';
COMMENT ON COLUMN steps.id IS 'Auto-incrementing unique identifier';
COMMENT ON COLUMN steps.recipe_id IS 'Parent recipe reference (foreign key)';
COMMENT ON COLUMN steps.step_number IS 'Sequential step number (1, 2, 3...)';
COMMENT ON COLUMN steps.instruction IS 'Instruction text (1-500 characters)';

-- =============================================================================
-- Table: recipe_categories
-- Description: Junction table for many-to-many relationship between recipes and categories
-- =============================================================================
CREATE TABLE recipe_categories (
    recipe_id BIGINT NOT NULL,
    category_id BIGINT NOT NULL,
    PRIMARY KEY (recipe_id, category_id),
    CONSTRAINT fk_recipe_categories_recipe FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE CASCADE,
    CONSTRAINT fk_recipe_categories_category FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE RESTRICT
);

COMMENT ON TABLE recipe_categories IS 'Many-to-many relationship between recipes and categories';
COMMENT ON COLUMN recipe_categories.recipe_id IS 'Recipe reference (foreign key)';
COMMENT ON COLUMN recipe_categories.category_id IS 'Category reference (foreign key)';

-- =============================================================================
-- Indexes for Query Performance Optimization
-- =============================================================================

-- Foreign key indexes for JOIN performance
CREATE INDEX idx_recipes_user_id ON recipes(user_id);
COMMENT ON INDEX idx_recipes_user_id IS 'Optimize filtering recipes by user (row-level security)';

CREATE INDEX idx_ingredients_recipe_id ON ingredients(recipe_id);
COMMENT ON INDEX idx_ingredients_recipe_id IS 'Optimize retrieving ingredients for recipe detail view';

CREATE INDEX idx_steps_recipe_id ON steps(recipe_id);
COMMENT ON INDEX idx_steps_recipe_id IS 'Optimize retrieving steps for recipe detail view';

CREATE INDEX idx_recipe_categories_category_id ON recipe_categories(category_id);
COMMENT ON INDEX idx_recipe_categories_category_id IS 'Optimize filtering recipes by category';

-- Search optimization index
CREATE INDEX idx_recipes_title ON recipes(title);
COMMENT ON INDEX idx_recipes_title IS 'Optimize recipe search by name (partial match support)';

-- Composite index for common query pattern (user + title search)
CREATE INDEX idx_recipes_user_title ON recipes(user_id, title);
COMMENT ON INDEX idx_recipes_user_title IS 'Optimize combined user filtering and title search queries';
