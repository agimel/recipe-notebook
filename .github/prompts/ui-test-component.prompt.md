---
agent: 'agent'
model: claude-sonnet-4.5
tools: ['execute/getTerminalOutput', 'execute/runInTerminal', 'read/readFile', 'edit/createFile', 'edit/editFiles', 'search']
description: 'UI view component test generation'
---

You will be writing comprehensive unit tests for a React.js component using the Vitest testing framework. Your goal is to create tests that minimize the need for manual testing by covering all important functionality, edge cases, and user interactions.

Here is the component implementation plan you need to write tests for:

<component_plan>
${input:implementation-plan}
</component_plan>

Your task is to create a complete test suite that thoroughly validates the component's behavior. Follow these guidelines:

**Testing Coverage Requirements:**
- Test all user interactions (clicks, inputs, form submissions, keyboard events, etc.)
- Test all conditional rendering paths
- Test edge cases and error states
- Test accessibility features (ARIA labels, keyboard navigation, focus management)
- Test integration with props and callbacks
- Test state changes and their effects on the UI
- Test loading states, empty states, and error states
- Test data validation and error handling

**Testing Best Practices:**
- Use React Testing Library for rendering and querying components
- Prefer user-centric queries (getByRole, getByLabelText) over implementation details (getByTestId)
- Test behavior, not implementation details
- Keep tests isolated and independent
- Use descriptive test names that explain what is being tested
- Mock external dependencies (API calls, external libraries, etc.)
- Use Vitest's built-in assertions and matchers
- Group related tests using describe blocks
- Set up and tear down test state properly using beforeEach/afterEach when needed

**Vitest and React Testing Library Patterns:**
- Import necessary utilities: `import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'`
- Import React Testing Library: `import { render, screen, fireEvent, waitFor, userEvent } from '@testing-library/react'`
- Use `vi.fn()` for mock functions
- Use `vi.mock()` for mocking modules
- Use `userEvent` for more realistic user interactions when appropriate
- Use `waitFor` for asynchronous operations
- Clean up after tests with `cleanup()` if not done automatically

**Test Organization:**
- Start with a main describe block for the component
- Group related tests in nested describe blocks
- Order tests logically (rendering → interactions → edge cases)
- Include clear comments for complex test scenarios

Before writing the tests, use the scratchpad to plan your testing strategy:

<scratchpad>
In your scratchpad:
1. Identify all the key features and behaviors that need testing based on the component plan
2. List the different states the component can be in
3. Identify props that need to be tested with different values
4. Note any external dependencies that need mocking
5. Plan the structure of your test suite (describe blocks and test cases)
</scratchpad>

After planning, write your complete test suite inside <tests> tags. Include:
- All necessary imports
- Mock setups
- Helper functions if needed
- The complete test suite with all test cases
- Clear comments explaining complex test scenarios

Your tests should be production-ready and follow modern React testing best practices. Make sure the test code is syntactically correct and can be run immediately with Vitest.