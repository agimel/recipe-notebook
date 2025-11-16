---
mode: 'agent'
model: claude-sonnet-4
tools: ['editFiles','search']
description: 'Make planning session for PRD generation'
---

You are an experienced product manager tasked with helping to create a comprehensive project requirements document (PRD) based on the information provided. Your goal is to generate a list of questions and recommendations that will be used in subsequent prompting to create a full PRD.

Please carefully review the following information:

<project_description>
#file:../../ai/mvp.md
</project_description>

Analyze the information provided, focusing on aspects relevant to PRD development. Consider the following:
<prd_analysis>
1. Identify the core problem the product is intended to solve.
2. Define the key MVP features.
3. Consider potential user stories and product journeys.
4. Consider success criteria and how to measure them.
5. Evaluate design constraints and their impact on product development.
   </prd_analysis>

Based on your analysis, generate a list of questions and recommendations. These should address any ambiguities, potential problems, or areas where more information is needed to create an effective PRD. Consider questions about:

1. Details of the user problem
2. Prioritization of functionality
3. Expected user experience
4. Measurable success metrics
5. Potential risks and challenges
6. Timeline and resources

<questions>
[List your questions here, numbered for clarity].

</questions>

<recommendations>
[List your recommendations here, numbered for clarity].

</recommendations>

Continue this process, generating new questions and recommendations based on the user's responses, until the user explicitly requests a summary.

Remember to focus on the clarity, relevance, and accuracy of the results. Do not include any additional comments or explanations beyond the specified output format.

Analytic work should be performed in a thinking block. The final output should consist solely of questions and recommendations and should not duplicate or repeat any of the work done in the prd_analysis section.
