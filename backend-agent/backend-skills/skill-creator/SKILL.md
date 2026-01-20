# Skill Creator

Create new Claude Code skills interactively.

## Trigger Phrases

- "create a skill"
- "new skill"
- "make a skill"
- "skill creator"
- "/skill-creator"

## Instructions

You are a skill creation assistant. Help the user create a new Claude Code skill by gathering requirements and generating a complete SKILL.md file.

### Step 1: Gather Skill Information

Use the AskUserQuestion tool to ask the following questions:

**Question 1: Skill Purpose**
Ask: "What should this skill do?"
- Provide 3-4 example options based on common skill types:
  - "Code review" - Review code for issues and improvements
  - "Documentation" - Generate or update documentation
  - "Testing" - Write or run tests
  - "Refactoring" - Improve code structure

**Question 2: Skill Name**
Ask: "What should this skill be called?"
- Suggest a name based on their purpose description
- Names should be lowercase with hyphens (e.g., "code-reviewer", "test-runner")

**Question 3: Trigger Phrases**
Ask: "What phrases should trigger this skill?"
- Suggest 3-4 trigger phrases based on the skill name and purpose
- Include a slash command option (e.g., "/review", "/test")

### Step 2: Generate the SKILL.md

Create a complete SKILL.md file with this structure:

```markdown
# [Skill Name]

[One-line description of what the skill does]

## Trigger Phrases

- "[phrase 1]"
- "[phrase 2]"
- "[phrase 3]"
- "/[command]"

## Instructions

[Detailed instructions for Claude on how to execute this skill]

### Context Gathering

[What information to collect before executing]

### Execution Steps

[Step-by-step process to complete the skill's task]

### Output Format

[How to present results to the user]
```

### Step 3: Save the Skill

1. Create the skill directory: `.claude/skills/[skill-name]/`
2. Write the SKILL.md file to that directory
3. Confirm creation and show the user how to use their new skill

### Example Output

After gathering information, generate a skill like:

```markdown
# Code Reviewer

Perform comprehensive code reviews with actionable feedback.

## Trigger Phrases

- "review this code"
- "code review"
- "check my code"
- "/review"

## Instructions

Perform a thorough code review focusing on:

### Context Gathering

1. Identify the files or changes to review
2. Understand the programming language and framework
3. Check for any project-specific conventions in CLAUDE.md

### Execution Steps

1. Read all relevant files
2. Analyze for:
   - Logic errors and bugs
   - Security vulnerabilities
   - Performance issues
   - Code style and readability
   - Missing error handling
3. Provide specific, actionable feedback

### Output Format

Present findings as:
- **Critical**: Must fix before merging
- **Suggestions**: Recommended improvements
- **Nitpicks**: Minor style preferences

Include line numbers and code examples for each issue.
```

## Notes

- Keep skill instructions clear and actionable
- Include specific steps Claude should follow
- Define expected output format
- Consider edge cases and error handling
