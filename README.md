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
├── CLAUDE.md              # AI assistant instructions
├── docs/
│   ├── PLANNING.md        # Architecture overview
│   ├── TASK.md            # Current work status
│   └── DECISIONS.md       # Architectural decisions
├── INITIAL/               # Feature specifications
├── PRPs/                  # Implementation plans
├── reference/             # POC code and examples
└── src/                   # Application source
```

## Development Workflow

This project uses a context engineering approach with Claude AI:

1. **Plan** (Claude.ai) - Define features in `INITIAL/` specs
2. **Generate PRP** (Claude Code) - Create implementation plan
3. **Review** (Claude.ai) - Refine approach if needed
4. **Execute** (Claude Code) - Implement the feature
5. **Update** - Keep docs in sync

See `docs/` for detailed documentation.

## License

TBD

## Acknowledgments

- Inspired by sci-fi interfaces from Iron Man, Minority Report, and countless others
- Built with [React Three Fiber](https://docs.pmnd.rs/react-three-fiber)
