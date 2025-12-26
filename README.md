# ✨ PULSAR

### 3D AWS Architecture Visualizer

<p align="center">
  <img src="docs/screenshot.png" alt="Pulsar Screenshot" width="800">
</p>

> Transform your AWS architecture diagrams into stunning, interactive 3D visualizations with a sci-fi holographic aesthetic.

[![License: MIT](https://img.shields.io/badge/License-MIT-cyan.svg)](https://opensource.org/licenses/MIT)

---

## 🎯 What is Pulsar?

Pulsar is a web-based tool for creating and visualizing AWS architecture diagrams in 3D. Inspired by sci-fi interfaces like Iron Man's JARVIS and Minority Report, it transforms traditional network diagrams into immersive, glowing visualizations.

**Perfect for:**
- Architecture documentation
- Technical presentations
- System design discussions
- Making your diagrams actually enjoyable to look at

## ✨ Features

### Visual
- 🔮 **Bloom post-processing** — Authentic sci-fi glow effects
- 🌐 **Animated data flows** — Particles flowing along connections
- 🎨 **Node color customization** — Pick from preset colors or customize
- 🏷️ **AWS service labels** — 25+ AWS services with floating labels

### Interaction
- 🖱️ **Click to select** — Nodes and edges
- ✋ **Drag to move** — Reposition nodes with collision detection
- 🎥 **Orbit camera** — Rotate, zoom, and pan
- 📋 **Context menus** — Right-click for actions

### Data Management
- 💾 **Auto-save** — Changes saved to localStorage automatically
- 📤 **JSON export/import** — Share diagrams as files
- 🆕 **Create from scratch** — Start fresh with the New button

### Editing
- ➕ **Add nodes** — Create new services
- 🔗 **Connect nodes** — Draw edges between services
- ✏️ **Edit properties** — Change labels, colors, service types
- 🗑️ **Delete** — Remove nodes and edges

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/greggjuri/pulsar.git
cd pulsar

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Build for Production

```bash
npm run build
npm run preview  # Preview the build locally
```

## 🎮 Usage

### Keyboard Shortcuts

Press `?` to see all shortcuts, or reference this table:

| Key | Action |
|-----|--------|
| `?` | Toggle shortcuts panel |
| `F` | Fit camera to view all nodes |
| `R` / `Home` | Reset camera position |
| `DEL` / `Backspace` | Delete selected node or edge |
| `ESC` | Deselect / Cancel action |

### Mouse Controls

| Action | Control |
|--------|---------|
| Rotate camera | Click + drag on background |
| Zoom | Scroll wheel |
| Select node/edge | Click |
| Move node | Drag selected node |
| Context menu | Right-click node |

### Creating a Diagram

1. Click **+ NODE** to add a new node
2. Select the node and choose an AWS service type from the dropdown
3. Right-click a node and select "Connect to..." to create edges
4. Drag nodes to arrange your architecture
5. Use **↓ EXPORT** to save your diagram as JSON

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| **Framework** | React 18 |
| **Build** | Vite |
| **3D Rendering** | Three.js via @react-three/fiber |
| **3D Helpers** | @react-three/drei |
| **Post-processing** | @react-three/postprocessing |
| **State** | Zustand |
| **Styling** | Tailwind CSS v4 |

## 📁 Project Structure

```
pulsar/
├── src/
│   ├── components/
│   │   ├── canvas/      # 3D components (Node3D, Edge3D, etc.)
│   │   └── hud/         # UI overlay components
│   ├── data/            # Configuration (AWS services, shortcuts)
│   ├── hooks/           # Custom React hooks
│   ├── stores/          # Zustand stores
│   └── utils/           # Utility functions
├── docs/                # Documentation
├── INITIAL/             # Feature specifications
└── PRPs/                # Project Requirement Plans
```

## 🎨 Design System

### Colors

| Purpose | Color | Hex |
|---------|-------|-----|
| Primary accent | Cyan | `#00ffff` |
| Secondary | Magenta | `#ff4f8b` |
| AWS Orange | Orange | `#ff9900` |
| Background | Dark blue | `#0a0a0f` |

### AWS Services Supported

**Compute:** Lambda, EC2, ECS, Fargate  
**Storage:** S3, EFS, EBS  
**Database:** DynamoDB, RDS, Aurora, ElastiCache  
**Networking:** API Gateway, CloudFront, Route 53, VPC, ALB/ELB  
**Integration:** SQS, SNS, EventBridge, Step Functions  
**Security:** Cognito, IAM, WAF  
**Other:** CloudWatch, Generic

## 🗺️ Roadmap

### Completed ✅
- [x] 3D node rendering with glow effects
- [x] Animated edge particles
- [x] Node selection, dragging, deletion
- [x] Edge creation and management
- [x] JSON export/import
- [x] localStorage persistence
- [x] Camera controls (fit, reset)
- [x] Bloom post-processing
- [x] AWS service type dropdown
- [x] Keyboard shortcuts panel

### Planned 🔜
- [ ] AWS service icons on nodes
- [ ] Multiple layout algorithms
- [ ] Cloud sync (AWS backend)
- [ ] User authentication
- [ ] Shareable diagram links
- [ ] Import from CloudFormation/CDK

## 🤝 Contributing

Contributions are welcome! Please read our contributing guidelines (coming soon).

## 📄 License

MIT License — see [LICENSE](LICENSE) for details.

## 🙏 Acknowledgments

- Three.js team for the incredible 3D library
- React Three Fiber for the React integration
- AWS for the architecture icon inspiration
- Sci-fi movies for the aesthetic inspiration

---

<p align="center">
  <strong>Built with 💜 and lots of ☕</strong>
</p>
