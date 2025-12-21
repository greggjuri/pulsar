# WORKFLOW.md - Claude.ai ↔ Claude Code Handoff Guide

This document explains how to coordinate between Claude.ai (planning/architecture) and Claude Code (implementation) for this project.

## The Split

| Claude.ai (Planning) | Claude Code (Implementation) |
|----------------------|------------------------------|
| Architecture decisions | Write code |
| Feature planning | Execute PRPs |
| Write INITIAL specs | Run tests |
| Review PRPs before execution | Git operations |
| Troubleshoot blockers | Create files and directories |
| Update PLANNING.md & DECISIONS.md | Update TASK.md |

## Workflow Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                         PLANNING PHASE                               │
│                        (Claude.ai)                                   │
├─────────────────────────────────────────────────────────────────────┤
│  1. Discuss feature/requirement                                      │
│  2. Create INITIAL spec (INITIAL/initial-XX-name.md)                │
│  3. Review for completeness                                          │
└──────────────────────────────┬──────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      GENERATION PHASE                                │
│                      (Claude Code)                                   │
├─────────────────────────────────────────────────────────────────────┤
│  4. Run: /generate-prp INITIAL/initial-XX-name.md                   │
│  5. Claude Code reads context files + INITIAL                        │
│  6. Generates PRP (PRPs/prp-XX-name.md)                             │
└──────────────────────────────┬──────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────────┐
│                       REVIEW PHASE                                   │
│                      (Claude.ai - Optional)                          │
├─────────────────────────────────────────────────────────────────────┤
│  7. Review PRP for completeness (optional but recommended)           │
│  8. Check for missing edge cases                                     │
│  9. Verify cost estimates if AWS services involved                   │
└──────────────────────────────┬──────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      EXECUTION PHASE                                 │
│                      (Claude Code)                                   │
├─────────────────────────────────────────────────────────────────────┤
│  10. Run: /execute-prp PRPs/prp-XX-name.md                          │
│  11. Execute step-by-step with validation                            │
│  12. Update TASK.md with progress                                    │
│  13. Git commit on completion                                        │
└──────────────────────────────┬──────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────────┐
│                       SYNC PHASE                                     │
│                      (Either/Both)                                   │
├─────────────────────────────────────────────────────────────────────┤
│  14. Update PLANNING.md if architecture evolved                      │
│  15. Add to DECISIONS.md if new decisions made                       │
│  16. Mark task complete in TASK.md                                   │
└─────────────────────────────────────────────────────────────────────┘
```

## Step-by-Step Guide

### Step 1: Plan (Claude.ai)

Start a conversation about what you want to build:

> "I want to add drag-and-drop node positioning"

Claude.ai will:
- Ask clarifying questions
- Reference PLANNING.md for context
- Check DECISIONS.md for related past decisions
- Create an INITIAL spec with requirements

### Step 2: Generate PRP (Claude Code)

In Claude Code, from project root:

```bash
/generate-prp INITIAL/initial-02-drag-nodes.md
```

Claude Code will:
- Read all context files (CLAUDE.md, PLANNING.md, TASK.md, DECISIONS.md)
- Read the INITIAL spec
- Research existing codebase
- Generate detailed PRP with implementation steps
- Report confidence level (1-10)

### Step 3: Review PRP (Claude.ai - Optional)

For complex features, bring the PRP back to Claude.ai:

> "Here's the generated PRP for drag nodes, does this look right?"

Claude.ai will:
- Verify all INITIAL requirements are addressed
- Check for missing edge cases
- Validate cost estimates (if AWS involved)
- Suggest improvements

### Step 4: Execute PRP (Claude Code)

```bash
/execute-prp PRPs/prp-02-drag-nodes.md
```

Claude Code will:
- Execute each step sequentially
- Validate after each step
- Stop on failure and report
- Update TASK.md with progress
- Git commit when complete

### Step 5: Handle Issues

**Simple bugs:** Claude Code can fix directly  
**Architecture questions:** Bring back to Claude.ai  
**Blockers:** Discuss approach in Claude.ai, implement fix in Claude Code

## Key Files Reference

| File | Purpose | Who Updates |
|------|---------|-------------|
| `CLAUDE.md` | Project rules, conventions | Claude.ai (rarely) |
| `docs/PLANNING.md` | Architecture, roadmap | Claude.ai |
| `docs/TASK.md` | Current work status | Claude Code |
| `docs/DECISIONS.md` | Architectural decisions | Claude.ai |
| `INITIAL/*.md` | Feature specifications | Claude.ai |
| `PRPs/*.md` | Implementation plans | Claude Code |

## Quick Reference Commands

```bash
# Check current status
/status

# Generate implementation plan from spec
/generate-prp INITIAL/initial-XX-feature.md

# Execute implementation plan
/execute-prp PRPs/prp-XX-feature.md
```

## Example Session

**You (to Claude.ai):**
> "I want to add the ability to export diagrams as PNG"

**Claude.ai:**
> "Let's define that. Based on PLANNING.md, we should... [creates INITIAL/initial-06-export-png.md]"

**You (to Claude Code):**
```bash
/generate-prp INITIAL/initial-06-export-png.md
```

**Claude Code:**
> "Generated PRPs/prp-06-export-png.md with confidence 8/10..."

**You (optionally, back to Claude.ai):**
> "Here's the PRP, does this look right?"

**Claude.ai:**
> "Looks good, but consider adding a loading indicator for large diagrams..."

**You (to Claude Code):**
```bash
/execute-prp PRPs/prp-06-export-png.md
```

**Claude Code:**
> "Step 1 complete ✅ ... Step 2 complete ✅ ... All tests passing ✅"

## Tips for Success

1. **Don't skip the INITIAL step** — Well-defined requirements = better PRPs
2. **Review PRPs for complex features** — Catch issues before implementation
3. **Keep TASK.md updated** — Both AI and human need to know current state
4. **Document decisions** — Future you (and Claude) will thank you
5. **Use the reference/ folder** — Add patterns that work, Claude Code will follow them
6. **Check costs before AWS changes** — No surprises on the bill

## When Things Go Wrong

**PRP generation fails or low confidence:**
- Bring back to Claude.ai to refine INITIAL spec
- Add more detail or clarify requirements

**Execution step fails:**
- Claude Code will stop and report the error
- Simple fix → let Claude Code try
- Complex issue → bring to Claude.ai for architecture discussion

**Tests failing:**
- Review test expectations vs implementation
- May need INITIAL spec clarification

**Cost concerns:**
- Always bring AWS cost questions to Claude.ai
- Never proceed with uncertain cost implications
