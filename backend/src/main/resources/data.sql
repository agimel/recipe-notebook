-- =============================================================================
-- Recipe Notebook Initial Data
-- Description: Seed data for default categories
-- =============================================================================

-- Insert default categories for meal types
-- These categories are shared across all users and cannot be deleted
INSERT INTO categories (name, is_default) VALUES
('Breakfast', true),
('Lunch', true),
('Dinner', true),
('Dessert', true),
('Snacks', true),
('Drinks', true);

-- Note: Sample recipes are created programmatically during user registration
-- to ensure proper user_id assignment and avoid foreign key constraint issues
