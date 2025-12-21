# Pulsar

> 🚧 **Work in Progress** - This project is in early development

Interactive 3D visualization tool for AWS architecture diagrams with a sci-fi holographic aesthetic.

![Status](https://img.shields.io/badge/status-early%20development-orange)

## Vision

Create beautiful, interactive 3D architecture diagrams that look like they belong in a sci-fi movie. Think Minority Report meets AWS.

## Features (Planned)

- 🎮 Full 3D orbit controls (rotate, zoom, pan)
- ✨ Glowing nodes with animated particle data flows
- 🖱️ Drag-and-drop node positioning
- 📦 Import/export architecture as JSON
- 🎨 Sci-fi holographic aesthetic
- ☁️ AWS service icon library

## Tech Stack

- **React** - UI framework
- **Three.js** / **React Three Fiber** - 3D rendering
- **Zustand** - State management
- **Tailwind CSS** - Styling
- **Vite** - Build tool

## Getting Started

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build
```

## Project Structure

```
├── .claude/
│   └── commands/          # Claude Code slash commands
│       ├── generate-prp.md
│       ├── execute-prp.md
│       └── status.md
├── CLAUDE.md              # AI assistant instructions
├── PROJECT_INSTRUCTIONS.md # Claude Project settings (copy to project)
├── docs/
│   ├── PLANNING.md        # Architecture overview
│   ├── TASK.md            # Current work status
│   ├── DECISIONS.md       # Architectural decisions
│   └── WORKFLOW.md        # Claude.ai ↔ Claude Code handoff guide
├── INITIAL/               # Feature specifications (initial-##-name.md)
├── PRPs/                  # Implementation plans (prp-##-name.md)
├── reference/             # POC code and examples
└── src/                   # Application source
```

## Development Workflow

This project uses a context engineering approach with Claude AI:

| Step | Where | What |
|------|-------|------|
| 1. Plan | Claude.ai | Define features, create `INITIAL/initial-##-name.md` specs |
| 2. Generate | Claude Code | `/generate-prp INITIAL/initial-##-name.md` |
| 3. Review | Claude.ai | Review PRP, refine if needed (optional) |
| 4. Execute | Claude Code | `/execute-prp PRPs/prp-##-name.md` |
| 5. Sync | Both | Update docs, commit changes |

**See `docs/WORKFLOW.md` for the complete handoff guide.**

### Quick Start Commands (Claude Code)

```bash
# Check project status
/status

# Generate implementation plan
/generate-prp INITIAL/initial-01-project-foundation.md

# Execute implementation plan
/execute-prp PRPs/prp-01-project-foundation.md
```

## License

TBD

## Acknowledgments

- Inspired by sci-fi interfaces from Iron Man, Minority Report, and countless others
- Built with [React Three Fiber](https://docs.pmnd.rs/react-three-fiber)
