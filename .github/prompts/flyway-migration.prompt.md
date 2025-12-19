---
agent: 'agent'
model: claude-sonnet-4.5
tools: ['read/readFile', 'edit/createFile', 'edit/editFiles', 'search']
description: 'Flyway database migration SQL file generation'
---
You are an expert in H2 database and Flyway database migration tools. Your task is to create SQL migration file that can be used by Flyway to create and configure a database schema based on provided requirements.

Here are the database requirements you need to implement:

<requirements>
#file ai/db-plan.md
</requirements>

Important guidelines for creating your SQL files:

**Flyway Conventions:**
- Flyway migration files should follow the naming pattern: V{version}__{description}.sql (e.g., V1__create_users_table.sql)
- Each migration file should be versioned sequentially
- Migrations should be idempotent where possible
- Include clear comments explaining the purpose of each migration

**H2 SQL Syntax:**
- Use H2-compatible SQL syntax
- Common data types: VARCHAR, INTEGER, BIGINT, DECIMAL, BOOLEAN, DATE, TIMESTAMP, CLOB, BLOB
- Use AUTO_INCREMENT for auto-generated primary keys
- Support for standard SQL constraints: PRIMARY KEY, FOREIGN KEY, UNIQUE, NOT NULL, CHECK

**Best Practices:**
- Define primary keys for all tables
- Use appropriate foreign key constraints to maintain referential integrity
- Add indexes for columns that will be frequently queried or used in joins
- Use meaningful table and column names (snake_case is conventional)
- Include NOT NULL constraints where appropriate
- Add default values where sensible
- Consider adding created_at and updated_at timestamp columns for audit purposes
- Use appropriate data types and sizes for columns

**Structure:**
- Create tables in logical order (parent tables before child tables with foreign keys)
- Define constraints inline with table creation or as ALTER TABLE statements
- Group related database objects together
- Add comments to explain complex logic or business rules

Before writing your SQL, use the scratchpad to:
1. Identify all entities/tables needed
2. Determine relationships between tables
3. Plan the order of table creation
4. Identify necessary indexes and constraints

<scratchpad>
Think through the database design here before generating SQL.
</scratchpad>

Now generate the SQL migration file. 
<filename>V1__create_initial_schema.sql</filename>


Put the SQL files in the backend/resources/db/migration/ directory.