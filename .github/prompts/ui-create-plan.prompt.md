---
agent: 'agent'
model: claude-sonnet-4.5
tools: ['read/readFile', 'edit/createFile', 'edit/editFiles', 'search']
description: 'Generate UI architecture plan'
---

You are a skilled front-end architect tasked with creating a comprehensive user interface architecture document. You will analyze product requirements, API capabilities, and UI planning discussions to design the overall structure, user journeys, navigation patterns, and key elements for each view in the application.

You will be provided with three key documents:

<prd>
#file ai\prd.md
</prd>

<api_roadmap>
#file ai\api-plan.md
</api_roadmap>

<ui_planning_notes>
#file ai\ui-planning-notes.md
</ui_planning_notes>

Your task is to synthesize information from these documents to create a UI architecture that addresses the product requirements while being feasible given the API capabilities.

Here's what you should analyze from each document:

From the PRD:
- Core user needs and problems to solve
- Key features and functionality requirements
- User personas and their goals
- Business objectives and success metrics

From the API Roadmap:
- Available and planned API endpoints
- Data structures and entities
- API capabilities and limitations
- Timeline constraints for API availability

From the UI Planning Notes:
- Design decisions and rationale
- User flow discussions
- Navigation patterns considered
- View-level requirements and priorities

Your UI architecture document should include:

1. **User Journey Map**: High-level flows showing how users will move through the application to accomplish their goals
2. **Navigation Architecture**: Overall navigation structure (e.g., tab-based, drawer-based, hierarchical) and how sections relate to each other
3. **View Inventory**: A comprehensive list of all views/screens needed, organized by section or user flow
4. **View Specifications**: For each major view, describe:
   - Purpose and user goals
   - Key UI elements and components (e.g., lists, forms, cards, filters)
   - Data requirements and sources (referencing APIs)
   - Entry points and exit points (navigation to/from this view)
   - States to handle (loading, empty, error, success)

Important constraints:
- Focus ONLY on architecture, structure, and organization
- Do NOT include visual design details (colors, fonts, spacing, exact layouts)
- Do NOT include implementation details or code examples unless absolutely necessary to clarify the architecture
- Do NOT create detailed wireframes or mockups
- Keep component descriptions ate.g., "a filterable list of items" not "a RecyclerView with CardViews")

Before writing your architecture document, use the scratchpad to:
1. Identify the core user journeys from the PRD
2. Map which APIs support which features
3. Note any gaps or constraints from the API roadmap
4. Extract key architectural decisions from the planning notes

<scratchpad>
Write your analysis and planning here before creating the final architecture document.
</scratchpad>

Present the final UI architecture in the following Markdown format:

```markdown
# UI Architecture for [Product Name]

## 1. UI Framework Overview

[Provide a high-level overview of the UI framework]

## 2. List of Views

[For each view, provide:
- View Name
- View Path
- Primary Purpose
- Key Information to Display
- Key View Components
- UX, Accessibility, and Security Considerations]

## 3. User Journey Map

[Describe the flow between views and key user interactions]

## 4. Navigation Layout and Structure

[Explain how users will navigate between views]

## 5. Key Components

[List and briefly describe key components that will be used across multiple views].

```

Focus solely on the UI architecture, user journey, navigation, and key elements for each view. Do not include implementation details, specific visual design, or code examples unless they are crucial to understanding the architecture.

The final result should consist solely of the UI architecture in Markdown format, saved in the .ai/ui-plan.md file. Do not duplicate or repeat any work done in the Thinking Block.