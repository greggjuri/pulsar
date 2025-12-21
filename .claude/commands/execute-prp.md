# Execute PRP Implementation Plan

Execute a PRP (Product Requirements Plan) step by step, validating each step before proceeding.

## Input
$ARGUMENTS - Path to the PRP file (e.g., `PRPs/prp-01-project-foundation.md`)

## Process

1. **Read all context files first:**
   - CLAUDE.md (project rules and conventions)
   - docs/PLANNING.md (architecture overview)
   - docs/TASK.md (current status)

2. **Read the PRP file** at the provided path

3. **Verify prerequisites:**
   - All dependencies available
   - No blocking open questions
   - Previous steps completed (if resuming)

4. **Execute each step sequentially:**

   For each step:
   
   a. **Announce** what you're about to do
   ```
   ## Executing Step X: [Step Name]
   ```
   
   b. **Implement** the changes listed
   
   c. **Validate** using the step's validation criteria
   
   d. **Report** success or failure
   ```
   ✅ Step X complete: [Brief summary]
   ```
   or
   ```
   ❌ Step X failed: [Error details]
   ```
   
   e. **Stop on failure** - Do not proceed to next step if validation fails

5. **After each step, update docs/TASK.md:**
   - Mark completed steps
   - Note any issues encountered
   - Update current status

6. **On completion:**
   - Run any final tests specified
   - Summarize what was accomplished
   - List any follow-up tasks identified
   - Update TASK.md with completion status

## Error Handling

If a step fails:
1. Report the specific error
2. Attempt to diagnose the cause
3. Suggest fix if obvious
4. Ask for guidance if complex
5. Do NOT proceed to next step

If blocked by open question:
1. Stop execution
2. Document the question clearly
3. Suggest bringing to Claude.ai for resolution

## Output Format

```
# PRP Execution: [Feature Name]

## Step 1: [Name]
[Actions taken]
✅ Validation passed

## Step 2: [Name]
[Actions taken]
✅ Validation passed

...

## Summary
- Steps completed: X/Y
- Status: Complete | Partial | Failed
- Follow-up tasks: [list any]
- Issues encountered: [list any]

## TASK.md Updated
[Confirmation of status update]
```

## Important Rules

1. **Never skip validation** - Each step must be verified before proceeding
2. **Commit frequently** - Git commit after each major step (if git is initialized)
3. **Stay within scope** - Only implement what's in the PRP
4. **Document deviations** - If you must deviate from PRP, document why
5. **Check costs** - If AWS resources are being created, verify cost estimates
