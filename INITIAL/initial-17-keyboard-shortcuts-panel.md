# INITIAL-17: Keyboard Shortcuts Panel

## Overview

Add a help panel that displays all available keyboard shortcuts in one place. This improves discoverability and helps users learn the full capabilities of Pulsar without hunting through documentation.

## User Story

As a user, I want to see all available keyboard shortcuts so that I can work more efficiently and discover features I might not know about.

## Background

Pulsar currently has several keyboard shortcuts scattered across features:
- **F** — Fit camera to view all nodes
- **R** / **Home** — Reset camera to default position
- **DEL** / **Backspace** — Delete selected node
- **ESC** — Deselect node / Cancel connecting mode

These are mentioned in the ControlsPanel hints, but there's no single place to see them all. Power users benefit from a comprehensive shortcuts reference.

## Requirements

### Functional Requirements

1. **FR-1: Shortcuts Panel**
   - Display all keyboard shortcuts in a modal or panel
   - Organized by category (Navigation, Selection, Editing)
   - Shows key + description for each shortcut

2. **FR-2: Toggle Trigger**
   - Keyboard shortcut to open/close panel: `?` (Shift+/) or `H`
   - Optional: Button in UI (e.g., "?" icon in corner)
   - Panel closes on ESC or clicking outside

3. **FR-3: Sci-Fi Styling**
   - Match existing HUD aesthetic
   - Semi-transparent dark background
   - Cyan accents, monospace font for keys
   - Subtle glow effects

### Non-Functional Requirements

1. **NFR-1: Non-Intrusive**
   - Panel overlays content, doesn't shift layout
   - Quick to open and dismiss
   - Doesn't interfere with other interactions

2. **NFR-2: Maintainable**
   - Shortcuts defined in a single config array
   - Easy to add new shortcuts as features are added

## Current Shortcuts Inventory

### Navigation
| Key | Action |
|-----|--------|
| `F` | Fit camera to view all nodes |
| `R` | Reset camera to default position |
| `Home` | Reset camera to default position |
| Drag | Rotate camera |
| Scroll | Zoom in/out |

### Selection
| Key | Action |
|-----|--------|
| Click node | Select node |
| Click edge | Select edge |
| `ESC` | Deselect / Cancel action |
| Click background | Deselect |

### Editing
| Key | Action |
|-----|--------|
| `DEL` | Delete selected node/edge |
| `Backspace` | Delete selected node/edge |
| Right-click node | Open context menu |
| Drag selected node | Move node |

### Help
| Key | Action |
|-----|--------|
| `?` | Toggle shortcuts panel |

## Technical Approach

### Shortcuts Configuration

Create a centralized config:

```javascript
// src/data/shortcuts.js
export const SHORTCUTS = [
  {
    category: 'Navigation',
    shortcuts: [
      { keys: ['F'], description: 'Fit camera to view all nodes' },
      { keys: ['R', 'Home'], description: 'Reset camera position' },
      { keys: ['Scroll'], description: 'Zoom in/out' },
      { keys: ['Drag'], description: 'Rotate camera' },
    ]
  },
  {
    category: 'Selection',
    shortcuts: [
      { keys: ['Click'], description: 'Select node or edge' },
      { keys: ['ESC'], description: 'Deselect / Cancel action' },
    ]
  },
  {
    category: 'Editing',
    shortcuts: [
      { keys: ['DEL', '⌫'], description: 'Delete selected item' },
      { keys: ['Right-click'], description: 'Open context menu' },
    ]
  },
  {
    category: 'Help',
    shortcuts: [
      { keys: ['?'], description: 'Toggle this panel' },
    ]
  }
];
```

### Panel Component

```jsx
// src/components/hud/ShortcutsPanel.jsx
const ShortcutsPanel = ({ isOpen, onClose }) => {
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60"
        onClick={onClose}
      />
      
      {/* Panel */}
      <div className="relative bg-slate-900/95 border border-cyan-500/30 
                      rounded-lg p-6 max-w-md shadow-lg shadow-cyan-500/10">
        <h2 className="text-cyan-400 font-mono text-lg mb-4">
          KEYBOARD SHORTCUTS
        </h2>
        
        {SHORTCUTS.map(category => (
          <div key={category.category} className="mb-4">
            <h3 className="text-cyan-600 text-sm mb-2">{category.category}</h3>
            {category.shortcuts.map(shortcut => (
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-400">{shortcut.description}</span>
                <span className="font-mono text-cyan-300">
                  {shortcut.keys.join(' / ')}
                </span>
              </div>
            ))}
          </div>
        ))}
        
        <div className="text-gray-500 text-xs mt-4 text-center">
          Press ESC or ? to close
        </div>
      </div>
    </div>
  );
};
```

### State Management

Add to App.jsx or use local state:

```jsx
const [showShortcuts, setShowShortcuts] = useState(false);

// Keyboard listener for '?' key
useEffect(() => {
  const handleKeyDown = (e) => {
    if (e.key === '?' || (e.shiftKey && e.key === '/')) {
      setShowShortcuts(prev => !prev);
    }
    if (e.key === 'Escape' && showShortcuts) {
      setShowShortcuts(false);
    }
  };
  
  window.addEventListener('keydown', handleKeyDown);
  return () => window.removeEventListener('keydown', handleKeyDown);
}, [showShortcuts]);
```

### Optional: Help Button

Add a small "?" button to the HUD:

```jsx
<button 
  onClick={() => setShowShortcuts(true)}
  className="text-cyan-400 hover:text-cyan-300"
  title="Keyboard shortcuts (?)"
>
  ?
</button>
```

## Acceptance Criteria

1. [ ] Pressing `?` opens the shortcuts panel
2. [ ] Panel displays all current shortcuts grouped by category
3. [ ] Pressing `?` again or `ESC` closes the panel
4. [ ] Clicking outside the panel closes it
5. [ ] Panel styled to match sci-fi aesthetic
6. [ ] Keys displayed in monospace font
7. [ ] Panel doesn't interfere with other app functionality
8. [ ] Optional: "?" button visible in HUD

## Out of Scope

- Customizable shortcuts (key rebinding)
- Printable shortcuts cheat sheet
- Context-sensitive shortcuts (showing different shortcuts based on mode)
- Animated panel open/close

## Dependencies

- No new packages required
- Uses existing Tailwind styling

## Files to Create/Modify

| File | Action | Purpose |
|------|--------|---------|
| `src/data/shortcuts.js` | CREATE | Shortcuts configuration |
| `src/components/hud/ShortcutsPanel.jsx` | CREATE | Panel component |
| `src/App.jsx` | MODIFY | Add state, keyboard listener, render panel |

## Testing Strategy

1. **Panel Toggle**
   - Press `?` to open
   - Press `?` again to close
   - Press `ESC` to close
   - Click backdrop to close

2. **Content Accuracy**
   - All shortcuts listed match actual functionality
   - Keys are correctly displayed

3. **Visual**
   - Matches sci-fi aesthetic
   - Readable at different screen sizes
   - Doesn't block important content when open

## Cost Estimate

| Service | Usage Estimate | Monthly Cost |
|---------|----------------|--------------|
| N/A | Frontend-only feature | $0.00 |

**Total: $0.00** - No AWS services involved.

## Questions for Review

1. **Trigger key:** `?` (Shift+/) or `H` for help?
2. **Help button:** Include a "?" button in HUD, or keyboard-only?
3. **Position:** Centered modal, or slide-in from side?

---

**Author:** Claude.ai (Planning)  
**For:** Claude Code (Implementation)  
**Phase:** 5 - Polish  
**Priority:** Medium (discoverability improvement)
