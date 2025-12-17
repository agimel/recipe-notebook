---
agent: 'agent'
model: claude-sonnet-4.5
tools: ['edit/createFile', 'edit/editFiles', 'search']
description: 'Database implementation plan'
---

You are a database architect tasked with creating a H2 database schema based on information provided during the planning session, the product requirements document (PRD), and the technology stack. Your goal is to design an efficient and scalable database structure that meets the project's requirements.

<prd>
#file ai/prd.md 
</prd>
This is the product requirements document that defines the features, functionality, and requirements of the project.

<session_notes>
#file ai/DB_planning_session_summary.md 
</session_notes>
These are notes from the database schema planning session. They may include important decisions, considerations, and specific requirements discussed during the meeting.

<tech_stack>
 #file ai/tech-stack.md 
</tech_stack>
Describes the technology stack that will be used in the project, which may influence database design decisions.

Follow these steps to create the database schema:

1. Carefully review your session notes, identifying key entities, attributes, and relationships discussed during the planning session.
2. Review the PRD to ensure that all required features and functionality are supported by the database schema.
3. Analyze the technology stack and ensure that the database design is optimized for the selected technologies.

4. Create a comprehensive database schema that includes

a. Tables with appropriate column names and data types

b. Primary and foreign keys

c. Indexes to improve query performance

d. Any necessary constraints (e.g., uniqueness, not null)

5. Define relationships between tables, specifying cardinality (one-to-one, one-to-many, many-to-many) and any joining tables required for many-to-many relationships.

6. Ensure that the schema adheres to database design best practices, including normalization to an appropriate level (typically 3NF, unless denormalization is justified for performance reasons).

The final output should have the following structure:


1. List of tables with their columns, data types, and constraints
2. Table relationships
3. Indexes
4. PostgreSQL rules (if applicable)
5. Any additional comments or clarifications regarding design decisions


In your response, provide only the final database schema in markdown format, which you will save in the .ai/db-plan.md file, without including any thought processes or intermediate steps. Ensure that the schema is comprehensive, well-organized, and ready to be used as the basis for database implementation.