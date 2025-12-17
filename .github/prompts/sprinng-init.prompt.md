---
agent: 'agent'
model: claude-sonnet-4.5
tools: ['edit/editFiles','search','edit/createFile']
description: 'Generate a Spring Boot project initialization based on provided documents'
---

You will be generating a Spring Boot project initialization based on a technical stack document.

Here is the technical stack document:
<tech_stack>  
#file ai/tech-stack.md
</tech_stack>

Your task is to create a complete Spring Boot project initialization that includes:
- A basic project structure with necessary directories and files
- A `pom.xml` file with dependencies as specified in the technical stack document
- A main application class
- Application properties file with any configurations mentioned in the technical stack document

Follow these steps:
1. Carefully review the tech_stack document to understand the required dependencies, configurations, and any specific project structure mentioned.
2. Before writing your implementation, use a scratchpad to plan out:
   - The project structure and directories
   - The dependencies to be included in the `pom.xml`
   - Any specific configurations needed in the application properties file

3. Write your Spring Boot project initialization ensuring that:
   - The project structure is well-organized and follows best practices
    - The `pom.xml` includes all necessary dependencies with correct versions
    - The main application class is correctly set up to run the Spring Boot application
    - The application properties file contains all required configurations

    Do not include any REST controllers, services, or other business logic at this stage; focus solely on the project initialization.
    
