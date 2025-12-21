# Generate PRP from INITIAL Spec

Read the INITIAL spec file provided and generate a detailed Product Requirements Plan (PRP) for implementation.

## Input
$ARGUMENTS - Path to the INITIAL spec file (e.g., `INITIAL/initial-01-project-foundation.md`)

## Process

1. **Read all context files first:**
   - CLAUDE.md (project rules and conventions)
   - docs/PLANNING.md (architecture overview)
   - docs/TASK.md (current status)
   - docs/DECISIONS.md (past decisions)

2. **Read the INITIAL spec file** at the provided path

3. **Research the codebase** to understand:
   - Existing patterns and conventions
   - Related code that might be affected
   - Dependencies already in use

4. **Generate a PRP** with this structure:

```markdown
# PRP: [Number] - [Feature Name]

> Generated from: `INITIAL/initial-XX-feature-name.md`
> Generated on: [Date]
> Confidence: [1-10]/10

## Summary
[Brief description of what this PRP implements]

## Requirements Addressed
[List from INITIAL spec]

## Technical Approach
[Detailed technical design]

## Implementation Steps

### Step 1: [Name]
**Files:** [list of files to create/modify]
**Changes:**
- [ ] [Specific change 1]
- [ ] [Specific change 2]

**Validation:**
- [ ] [How to verify this step worked]

### Step 2: [Name]
...

## Dependencies
- [New packages to install]
- [Existing code this depends on]

## Cost Estimate (if AWS services involved)
| Service | Usage Estimate | Monthly Cost |
|---------|----------------|--------------|
| ... | ... | ... |

**Free Tier Eligible:** Yes/No

## Testing Strategy
- [ ] [Test 1]
- [ ] [Test 2]

## Rollback Plan
[How to undo if something goes wrong]

## Open Questions
[Any ambiguities that need clarification before execution]
```

5. **Save the PRP** to `PRPs/prp-XX-feature-name.md` (matching the INITIAL number)

6. **Report confidence level** (1-10) based on:
   - Clarity of requirements
   - Familiarity with the codebase
   - Complexity of implementation
   - Any open questions

## Output
- Created PRP file path
- Confidence score with reasoning
- Any blockers or questions for Claude.ai review
