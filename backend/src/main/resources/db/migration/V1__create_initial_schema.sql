-- Recipe Notebook Database Schema
-- H2 Database (PostgreSQL Compatibility Mode)
-- Flyway Migration V1: Create initial schema with all tables, constraints, and indexes

-- ============================================
-- 1. USERS TABLE
-- ============================================
-- Stores user authentication and account information
CREATE TABLE users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password_hash VARCHAR(60) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_username ON users(username);

-- ============================================
-- 2. RECIPES TABLE
-- ============================================
-- Stores core recipe information with metadata
CREATE TABLE recipes (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    title VARCHAR(100) NOT NULL,
    difficulty VARCHAR(10) NOT NULL CHECK (difficulty IN ('EASY', 'MEDIUM', 'HARD')),
    cooking_time_minutes INT NOT NULL CHECK (cooking_time_minutes > 0),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_recipes_user_id ON recipes(user_id);
CREATE INDEX idx_recipes_title ON recipes(title);

-- ============================================
-- 3. INGREDIENTS TABLE
-- ============================================
-- Stores recipe ingredients with ordering
-- Unique constraint on (recipe_id, sort_order) enforces continuous ordering
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

CREATE INDEX idx_ingredients_recipe_id ON ingredients(recipe_id);

-- ============================================
-- 4. STEPS TABLE
-- ============================================
-- Stores recipe cooking instructions with sequential numbering
-- Unique constraint on (recipe_id, step_number) prevents duplicate step numbers
CREATE TABLE steps (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    recipe_id BIGINT NOT NULL,
    step_number INT NOT NULL,
    instruction VARCHAR(500) NOT NULL,
    FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE CASCADE,
    UNIQUE (recipe_id, step_number)
);

CREATE INDEX idx_steps_recipe_id ON steps(recipe_id);

-- ============================================
-- 5. CATEGORIES TABLE
-- ============================================
-- Stores meal type classifications (system-wide, not user-specific)
CREATE TABLE categories (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    is_default BOOLEAN DEFAULT FALSE
);

CREATE INDEX idx_categories_name ON categories(name);

-- ============================================
-- 6. RECIPE_CATEGORIES JUNCTION TABLE
-- ============================================
-- Many-to-many relationship between recipes and categories
-- Composite primary key prevents duplicate category assignments
CREATE TABLE recipe_categories (
    recipe_id BIGINT NOT NULL,
    category_id BIGINT NOT NULL,
    PRIMARY KEY (recipe_id, category_id),
    FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE RESTRICT
);

CREATE INDEX idx_recipe_categories_category_id ON recipe_categories(category_id);

-- ============================================
-- 7. DEFAULT DATA
-- ============================================
-- Insert default system categories
INSERT INTO categories (name, is_default) VALUES
('Breakfast', true),
('Lunch', true),
('Dinner', true),
('Dessert', true),
('Snacks', true),
('Drinks', true);
