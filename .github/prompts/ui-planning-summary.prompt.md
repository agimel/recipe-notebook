---
agent: 'agent'
model: claude-sonnet-4.5
tools: ['read/readFile', 'edit/createFile', 'edit/editFiles', 'search']
description: 'Generate summary regarding UI architecture planning'
---

You are an AI assistant tasked with summarizing a conversation about UI architecture planning for an MVP and preparing a concise summary for the next stage of development. The conversation history contains the following information:
1. Product Requirements Document (PRD)
2. Technology Stack Information
3. API Roadmap
4. Conversation History containing questions and answers
5. UI Architecture Recommendations

Your task is to:
1. Summarize the conversation history, focusing on all decisions related to UI architecture planning.
2. Match the model's recommendations to the answers provided in the conversation history. Identify which recommendations are relevant based on the discussion. 3. Prepare a detailed conversation summary that includes:

a. Key UI architecture requirements

b. Key views, screens, and user flows

c. API integration and state management strategy

d. Responsiveness, accessibility, and security issues

e. Any unresolved issues or areas requiring further clarification

4. Format the results as follows:

<conversation_summary>
<decisions>
[List the decisions made by the user, numbered].

</decisions>
<matched_recommendations>
[List the most important recommendations matched to the conversation, numbered].

</matched_recommendations>
<ui_architecture_planning_summary>
[Provide a detailed conversation summary, including the items listed in Step 3].

</ui_architecture_planning_summary>
<unresolved_issues>
[List any unresolved issues or areas requiring further clarification, if any]
</unresolved_issues>
</conversation_summary>

The final output should contain only markdown content. Ensure your summary is clear, concise, and provides valuable information for the next stage of UI architecture planning and API integration. Save the output in a file named `ai/ui-planning-summary.md`.
