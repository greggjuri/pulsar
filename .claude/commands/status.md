# Show Project Status

Display the current project status including active tasks, recent progress, and next steps.

## Process

1. **Read status files:**
   - docs/TASK.md (current work status)
   - docs/PLANNING.md (roadmap context)

2. **Check for in-progress work:**
   - Any partially completed PRPs
   - Uncommitted changes
   - Failed validations

3. **Display status report:**

```
# Pulsar Project Status

## Current Task
[Name and description of active task]
- Status: [Not Started | In Progress | Blocked | Complete]
- PRP: [path if exists]
- Progress: [X/Y steps complete]

## Recent Completions
- [List recently completed tasks]

## Blockers
- [Any blocking issues]

## Next Up
1. [Next task in queue]
2. [Following task]

## Quick Stats
- Total INITIAL specs: X
- PRPs generated: X
- PRPs executed: X

## Recommended Action
[What to do next - e.g., "Run /execute-prp PRPs/prp-01-..." or "Review blocking issue with Claude.ai"]
```

## Output
Formatted status report with clear next action recommendation.
