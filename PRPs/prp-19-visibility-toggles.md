# PRP: 19 - Label and Icon Visibility Toggles

> Generated from: `INITIAL/initial-19-visibility-toggles.md`
> Generated on: 2025-12-26
> Confidence: 9/10

## Summary

Add toggle buttons to the ControlsPanel allowing users to independently show/hide node labels and icons. Includes keyboard shortcuts (`L` for labels, `I` for icons) and localStorage persistence of preferences.

## Requirements Addressed

1. **FR-1:** Toggle labels on/off via button and `L` key
2. **FR-2:** Toggle icons on/off via button and `I` key
3. **FR-3:** Persist settings to localStorage, restore on page load
4. **FR-4:** Visual feedback showing toggle state (active/inactive)
5. Shortcuts panel updated with new L and I entries

## Technical Approach

### State Management
Add `showLabels` and `showIcons` boolean state to `graphStore.js` along with toggle actions. These values default to `true`.

### Persistence
Create dedicated storage functions for display settings using a separate localStorage key (`pulsar-display-settings`). Load settings on store initialization.

### UI
Add toggle buttons to the existing ControlsPanel in a new row below the Fit/Reset/Help buttons. Buttons show active state (filled) vs inactive (dimmed).

### Node Rendering
Update Node3D.jsx to conditionally render icon and label based on store state.

### Keyboard Shortcuts
Add `L` and `I` handlers to App.jsx keyboard handler, and update shortcuts.js data.

## Implementation Steps

### Step 1: Add Display Settings Storage
**Files:** `src/utils/storage.js` (MODIFY)

**Changes:**
- [ ] Add `SETTINGS_KEY = 'pulsar-display-settings'`
- [ ] Add `saveDisplaySettings(settings)` function
- [ ] Add `loadDisplaySettings()` function (returns `{ showLabels: true, showIcons: true }` as default)

```javascript
const SETTINGS_KEY = 'pulsar-display-settings';

export function saveDisplaySettings(settings) {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    return true;
  } catch (e) {
    return false;
  }
}

export function loadDisplaySettings() {
  try {
    const data = localStorage.getItem(SETTINGS_KEY);
    if (!data) return { showLabels: true, showIcons: true };
    return JSON.parse(data);
  } catch (e) {
    return { showLabels: true, showIcons: true };
  }
}
```

**Validation:**
- [ ] Functions exist and return correct types
- [ ] Default values are `{ showLabels: true, showIcons: true }`

### Step 2: Add State to graphStore
**Files:** `src/stores/graphStore.js` (MODIFY)

**Changes:**
- [ ] Import `loadDisplaySettings`, `saveDisplaySettings` from storage.js
- [ ] Load initial display settings in `getInitialState()` or separately
- [ ] Add `showLabels: true` state (from loaded settings or default)
- [ ] Add `showIcons: true` state (from loaded settings or default)
- [ ] Add `toggleLabels()` action that toggles and saves to localStorage
- [ ] Add `toggleIcons()` action that toggles and saves to localStorage

```javascript
// After existing imports
import { loadDisplaySettings, saveDisplaySettings } from '../utils/storage';

// Get display settings
const displaySettings = loadDisplaySettings();

// In store definition:
showLabels: displaySettings.showLabels,
showIcons: displaySettings.showIcons,

toggleLabels: () => set((state) => {
  const newValue = !state.showLabels;
  saveDisplaySettings({ showLabels: newValue, showIcons: state.showIcons });
  return { showLabels: newValue };
}),

toggleIcons: () => set((state) => {
  const newValue = !state.showIcons;
  saveDisplaySettings({ showLabels: state.showLabels, showIcons: newValue });
  return { showIcons: newValue };
}),
```

**Validation:**
- [ ] `useGraphStore((s) => s.showLabels)` returns boolean
- [ ] `useGraphStore((s) => s.toggleLabels)` is a function
- [ ] Toggling saves to localStorage

### Step 3: Update ControlsPanel with Toggle Buttons
**Files:** `src/components/hud/ControlsPanel.jsx` (MODIFY)

**Changes:**
- [ ] Import `showLabels`, `showIcons`, `toggleLabels`, `toggleIcons` from store
- [ ] Add new button row after existing Fit/Reset/Help row
- [ ] Label toggle button with "ABC" text indicator
- [ ] Icon toggle button with "🖼" emoji indicator
- [ ] Active state: `bg-cyan-500/30 text-cyan-400 border-cyan-500/50`
- [ ] Inactive state: `text-cyan-500/50 border-cyan-500/20`
- [ ] Tooltips showing current state and shortcut

```jsx
{/* Display toggle buttons */}
<div className="flex gap-2 mt-2">
  <button
    onClick={toggleLabels}
    className={`flex-1 bg-black/50 border rounded p-2
                transition-colors flex items-center justify-center gap-1
                ${showLabels
                  ? 'border-cyan-500/50 text-cyan-400 bg-cyan-500/20'
                  : 'border-cyan-500/20 text-cyan-500/50'}`}
    title={`${showLabels ? 'Hide' : 'Show'} labels (L)`}
  >
    <span className="text-xs font-mono">ABC</span>
  </button>
  <button
    onClick={toggleIcons}
    className={`flex-1 bg-black/50 border rounded p-2
                transition-colors flex items-center justify-center gap-1
                ${showIcons
                  ? 'border-cyan-500/50 text-cyan-400 bg-cyan-500/20'
                  : 'border-cyan-500/20 text-cyan-500/50'}`}
    title={`${showIcons ? 'Hide' : 'Show'} icons (I)`}
  >
    <span>🖼</span>
  </button>
</div>
```

**Validation:**
- [ ] Two new toggle buttons appear below Fit/Reset/Help
- [ ] Clicking toggles visual state
- [ ] Tooltips show shortcut hint

### Step 4: Update Node3D to Respect Visibility Settings
**Files:** `src/components/canvas/Node3D.jsx` (MODIFY)

**Changes:**
- [ ] Import `showLabels`, `showIcons` from graphStore
- [ ] Wrap icon rendering with `{showIcons && iconSrc && (...)}`
- [ ] Wrap label rendering with `{showLabels && (...)}`
- [ ] If both are hidden, still render the Html container but empty (or skip entirely)

```jsx
// At top of component:
const showLabels = useGraphStore((s) => s.showLabels);
const showIcons = useGraphStore((s) => s.showIcons);

// In render, replace current icon+label block:
{(showIcons || showLabels) && (
  <Html
    position={[0, 1.4, 0]}
    center
    zIndexRange={[1, 0]}
    style={{ pointerEvents: 'none', userSelect: 'none' }}
  >
    <div className="flex flex-col items-center gap-0.5">
      {showIcons && iconSrc && (
        <img
          src={iconSrc}
          alt={getServiceName(type)}
          className="w-8 h-8"
          style={{ filter: 'drop-shadow(0 0 4px rgba(0, 255, 255, 0.5))' }}
        />
      )}
      {showLabels && (
        <div
          className="text-xs font-mono text-cyan-400 whitespace-nowrap px-1.5 py-0.5
                     bg-black/60 rounded border border-cyan-500/30"
          style={{ textShadow: '0 0 6px cyan' }}
        >
          {getServiceName(type)}
        </div>
      )}
    </div>
  </Html>
)}
```

**Validation:**
- [ ] Toggling labels hides/shows all node labels
- [ ] Toggling icons hides/shows all node icons
- [ ] Both off = just glowing nodes visible

### Step 5: Add Keyboard Shortcuts
**Files:** `src/App.jsx` (MODIFY)

**Changes:**
- [ ] Import `toggleLabels`, `toggleIcons` from store
- [ ] Add `L` key handler to toggle labels
- [ ] Add `I` key handler to toggle icons
- [ ] Add to useEffect dependency array

```javascript
// In keyboard handler:
} else if (e.key === 'l' || e.key === 'L') {
  toggleLabels();
} else if (e.key === 'i' || e.key === 'I') {
  toggleIcons();
}
```

**Validation:**
- [ ] Pressing `L` toggles labels
- [ ] Pressing `I` toggles icons
- [ ] Works regardless of case

### Step 6: Update Shortcuts Panel Data
**Files:** `src/data/shortcuts.js` (MODIFY)

**Changes:**
- [ ] Add new "Display" category
- [ ] Add `L` - Toggle labels entry
- [ ] Add `I` - Toggle icons entry

```javascript
{
  category: 'Display',
  shortcuts: [
    { keys: ['L'], description: 'Toggle node labels' },
    { keys: ['I'], description: 'Toggle node icons' },
  ],
},
```

**Validation:**
- [ ] Shortcuts panel shows Display category
- [ ] L and I shortcuts listed

### Step 7: Test Persistence
**Files:** None (manual testing)

**Changes:**
- [ ] Toggle labels off, refresh page — should stay off
- [ ] Toggle icons off, refresh page — should stay off
- [ ] Reset by clearing localStorage, refresh — both should be on

**Validation:**
- [ ] Settings persist across page refresh
- [ ] Default is both ON

## Dependencies

- No new packages required
- Uses existing Zustand store
- Uses existing localStorage utilities
- Uses existing ControlsPanel component

## Files Changed Summary

| File | Action | Description |
|------|--------|-------------|
| `src/utils/storage.js` | MODIFY | Add display settings save/load |
| `src/stores/graphStore.js` | MODIFY | Add showLabels, showIcons state |
| `src/components/hud/ControlsPanel.jsx` | MODIFY | Add toggle buttons |
| `src/components/canvas/Node3D.jsx` | MODIFY | Conditional icon/label render |
| `src/App.jsx` | MODIFY | Add L/I keyboard handlers |
| `src/data/shortcuts.js` | MODIFY | Add Display category |

## Testing Strategy

- [ ] Toggle labels button works
- [ ] Toggle icons button works
- [ ] L key toggles labels
- [ ] I key toggles icons
- [ ] Settings persist on refresh
- [ ] Default state: both ON
- [ ] Buttons show correct active/inactive state
- [ ] Shortcuts panel shows L and I
- [ ] All 4 combinations work (both on, labels only, icons only, neither)

## Rollback Plan

1. Revert changes to all 6 files
2. Clear `pulsar-display-settings` from localStorage
3. Commit revert

## Open Questions

None — requirements are clear and implementation is straightforward.

## Confidence Score: 9/10

**Reasoning:**
- **+** Clear, detailed INITIAL spec
- **+** Simple state additions to existing store
- **+** Builds on established patterns (toggleShortcuts, storage.js)
- **+** No new packages or complex logic
- **+** All affected files already understood from previous work
- **-1** Minor: persistence requires testing to ensure both values save/load correctly together

**No blockers** — Ready for implementation.
