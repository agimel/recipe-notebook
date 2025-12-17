---
agent: 'agent'
model: claude-sonnet-4.5
tools: ['edit/createFile', 'edit/editFiles', 'search']
description: 'Generate REST API implementation task list'
---

You will be creating a list of files based on the content of two input files: api-plan.md and db-plan.md. Each file you create will contain one endpoint from api-plan.md and its related resources from db-plan.md. You will also create a Task file containing all endpoints to be created.

<api_plan>
#file ai/api-plan.md
</api_plan>

<db_plan>
#file ai/db-plan.md
</db_plan>

Follow these steps to complete the task:

1. Parse the api-plan.md file:
   - Identify each endpoint in the file
   - Extract the endpoint name, HTTP method, and any other relevant information

2. Parse the db-plan.md file:
   - Identify tables, columns, relationships, and constraints that are relevant to each endpoint

2. For each endpoint identified:
   - Create a new markdown file, in the 'ai' folder, named after the endpoint (e.g., get-users.md for a GET /users endpoint)
   - Include the following sections in each file:
     - Endpoint Details: Include the HTTP method, path, description, request parameters, request body schema, response schema, error responses, and authentication/authorization requirements.
     - Related Database Resources: Identify and include any related tables, columns, relationships, and constraints from db-plan.md that are relevant to this endpoint.

3. Create a Task file named api-implementation-tasks.md in the 'ai' folder:
   - List all the endpoints to be created, along with a brief description of each.

4. Prepare the final output:
   - List all the files you've created, including their paths and a brief description of their contents
   - Include the content of the 'api-implementation-tasks.md' file


Your final output should be formatted as follows:

<output>
Created files:
1. ai/[endpoint1].md - Contains endpoint [endpoint1] and related models
2. ai/[endpoint2].md - Contains endpoint [endpoint2] and related models
...

Task file (ai/endpoint-tasks.md):
[Content of the endpoint-tasks.md file]
</output>