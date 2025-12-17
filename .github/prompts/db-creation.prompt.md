---
agent: 'agent'
model: claude-sonnet-4.5
tools: ['edit/editFiles','search','edit/createFile']
description: 'Implement H2 database based on provided documents'
---

You will be creating an H2 database implementation based on a database plan document, along with supporting technical stack and product requirements documents.

Here is the database plan document:
<db_plan>
#file ai/db-plan.md
</db_plan>

Here is the technical stack document:
<tech_stack>
#file ai/tech-stack.md
</tech_stack>

Here is the product requirements document (PRD):
<prd>
#file ai/prd.md
</prd>

Your task is to create a complete H2 database implementation that includes:
- Database schema creation statements (CREATE TABLE, etc.)
- Appropriate data types for H2
- Primary keys, foreign keys, and constraints
- Indexes where specified or appropriate
- Any initial data or seed data if mentioned in the documents

Follow these steps:

1. Carefully review the db_plan document to understand the database structure, tables, columns, relationships, and constraints that need to be implemented.

2. Review the tech_stack document to understand any specific H2 configuration requirements, version specifications, or integration details.

3. Review the PRD to understand the business requirements and ensure your database implementation supports all necessary functionality.

4. Before writing your implementation, use a scratchpad to plan out:
   - All tables that need to be created
   - The relationships between tables
   - Any specific H2 syntax considerations
   - The order in which tables should be created (to respect foreign key dependencies)

5. Write your H2 database implementation using proper H2 SQL syntax. Ensure that:
   - Tables are created in the correct order to satisfy foreign key dependencies
   - Data types are appropriate for H2
   - All constraints are properly defined
   - The code is well-commented to explain the purpose of each table and important fields
   - The implementation is complete and can be executed as-is

<scratchpad>
Use this space to:
- List all tables identified from the db_plan
- Map out relationships and dependencies
- Note any special requirements from the tech_stack or PRD
- Plan the order of table creation
- Identify any H2-specific syntax needs
</scratchpad>

<implementation>
Write your complete H2 database implementation here. Include:
- All CREATE TABLE statements
- All constraints (PRIMARY KEY, FOREIGN KEY, UNIQUE, CHECK, etc.)
- All indexes
- Any initial INSERT statements for seed data
- Comments explaining the schema

Format the SQL code properly with appropriate indentation and spacing.
</implementation>