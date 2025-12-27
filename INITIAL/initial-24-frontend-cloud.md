# INITIAL-24: Frontend Cloud Integration

## Overview

Connect the Pulsar frontend to the backend API, enabling authenticated users to save, load, and manage diagrams in the cloud. Unauthenticated users continue working in "Local Mode" with localStorage.

**Phase:** 6 (Backend Integration)
**Depends On:** INITIAL-22 (Cognito Auth), INITIAL-23 (Backend API)
**Unlocks:** INITIAL-25 (Public Sharing)

## Goals

1. Create API client with authentication handling
2. Add Cloud Diagrams panel (left sidebar) for listing/loading diagrams
3. Add "Save to Cloud" functionality
4. Add mode indicator (Local Mode vs Cloud Sync)
5. Add confirmation dialog for unsaved changes
6. Add delete diagram from cloud UI

## Non-Goals

- Auto-save to cloud (manual save only for MVP)
- Offline sync queue (work offline, sync when online)
- Conflict resolution between local and cloud versions
- Public sharing UI (INITIAL-25)

## User Experience

### Unauthenticated (Local Mode)

```
┌─────────────────────────────────────────────────────────────┐
│ PULSAR                                          [Sign In]   │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────────┐                                       │
│  │ 💾 LOCAL MODE    │  ← subtle indicator                   │
│  └──────────────────┘                                       │
│                                                             │
│  (No cloud panel - just existing local editor)              │
│                                                             │
│  ┌────────────────────────────────────────────┐             │
│  │ Export │ Import │ New │ + Node             │             │
│  └────────────────────────────────────────────┘             │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

- Full editor functionality
- localStorage auto-save (existing)
- JSON export/import (existing)
- "Sign In" button in top-right
- "Local Mode" indicator shows data is device-only

### Authenticated (Cloud Sync)

```
┌─────────────────────────────────────────────────────────────┐
│ PULSAR                                user@email [Sign Out] │
├─────────────────────────────────────────────────────────────┤
│ ┌─────────────────┐                                         │
│ │ ☁️ CLOUD SYNC   │  ← mode indicator                       │
│ └─────────────────┘                                         │
│                                                             │
│ ┌─────────────────┐                                         │
│ │ MY DIAGRAMS     │                                         │
│ ├─────────────────┤                                         │
│ │ ▸ Prod Arch     │  ← click to load, shows node count     │
│ │   12 nodes      │                                         │
│ │   [🗑️]          │  ← delete button on hover              │
│ ├─────────────────┤                                         │
│ │ ▸ Dev Setup     │                                         │
│ │   8 nodes       │                                         │
│ ├─────────────────┤                                         │
│ │ ▸ Demo v2       │                                         │
│ │   5 nodes       │                                         │
│ ├─────────────────┤                                         │
│ │ [+ NEW DIAGRAM] │  ← creates new cloud diagram            │
│ └─────────────────┘                                         │
│                                                             │
│ ┌─────────────────┐                                         │
│ │ [☁️ SAVE]       │  ← save current to cloud                │
│ │ (unsaved)       │  ← shows when local changes exist       │
│ └─────────────────┘                                         │
│                                                             │
│  ┌────────────────────────────────────────────┐             │
│  │ Export │ Import │ New │ + Node             │             │
│  └────────────────────────────────────────────┘             │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## Technical Specification

### 1. API Client

`src/utils/api.js`:

```javascript
import { authConfig } from '../config/auth';
import { useAuthStore } from '../stores/authStore';

const API_URL = authConfig.apiUrl;

/**
 * Make authenticated API request
 */
async function apiRequest(path, options = {}) {
  const accessToken = useAuthStore.getState().getAccessToken();
  
  if (!accessToken) {
    throw new Error('Not authenticated');
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`,
      ...options.headers,
    },
  });

  if (response.status === 401) {
    // Token expired or invalid - trigger logout
    useAuthStore.getState().logout();
    throw new Error('Session expired');
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || `API error: ${response.status}`);
  }

  // Handle 204 No Content
  if (response.status === 204) {
    return null;
  }

  return response.json();
}

/**
 * Diagram API methods
 */
export const diagramsApi = {
  // List all user's diagrams (metadata only)
  async list() {
    const data = await apiRequest('/diagrams');
    return data.diagrams;
  },

  // Get single diagram with full content
  async get(id) {
    return apiRequest(`/diagrams/${id}`);
  },

  // Create new diagram
  async create(diagram) {
    return apiRequest('/diagrams', {
      method: 'POST',
      body: JSON.stringify(diagram),
    });
  },

  // Update existing diagram
  async update(id, diagram) {
    return apiRequest(`/diagrams/${id}`, {
      method: 'PUT',
      body: JSON.stringify(diagram),
    });
  },

  // Delete diagram
  async delete(id) {
    return apiRequest(`/diagrams/${id}`, {
      method: 'DELETE',
    });
  },
};
```

### 2. Cloud Store

`src/stores/cloudStore.js`:

```javascript
import { create } from 'zustand';
import { diagramsApi } from '../utils/api';

export const useCloudStore = create((set, get) => ({
  // State
  diagrams: [],           // List of diagram metadata
  isLoading: false,
  error: null,
  currentCloudId: null,   // ID of currently loaded cloud diagram
  hasUnsavedChanges: false,

  // Actions
  setLoading: (loading) => set({ isLoading: loading, error: null }),
  setError: (error) => set({ error, isLoading: false }),
  setUnsavedChanges: (hasChanges) => set({ hasUnsavedChanges: hasChanges }),
  setCurrentCloudId: (id) => set({ currentCloudId: id, hasUnsavedChanges: false }),

  // Fetch diagram list
  fetchDiagrams: async () => {
    set({ isLoading: true, error: null });
    try {
      const diagrams = await diagramsApi.list();
      set({ diagrams, isLoading: false });
    } catch (error) {
      set({ error: error.message, isLoading: false });
    }
  },

  // Load diagram from cloud
  loadDiagram: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const diagram = await diagramsApi.get(id);
      set({ isLoading: false, currentCloudId: id, hasUnsavedChanges: false });
      return diagram;
    } catch (error) {
      set({ error: error.message, isLoading: false });
      return null;
    }
  },

  // Save current diagram to cloud
  saveDiagram: async (diagram) => {
    const { currentCloudId } = get();
    set({ isLoading: true, error: null });
    
    try {
      let result;
      if (currentCloudId) {
        // Update existing
        result = await diagramsApi.update(currentCloudId, diagram);
      } else {
        // Create new
        result = await diagramsApi.create(diagram);
        set({ currentCloudId: result.id });
      }
      
      // Refresh list
      await get().fetchDiagrams();
      set({ isLoading: false, hasUnsavedChanges: false });
      return result;
    } catch (error) {
      set({ error: error.message, isLoading: false });
      return null;
    }
  },

  // Delete diagram from cloud
  deleteDiagram: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await diagramsApi.delete(id);
      
      // If we deleted the current diagram, clear it
      if (get().currentCloudId === id) {
        set({ currentCloudId: null });
      }
      
      // Refresh list
      await get().fetchDiagrams();
      set({ isLoading: false });
      return true;
    } catch (error) {
      set({ error: error.message, isLoading: false });
      return false;
    }
  },

  // Clear cloud state (on logout)
  clear: () => set({
    diagrams: [],
    isLoading: false,
    error: null,
    currentCloudId: null,
    hasUnsavedChanges: false,
  }),
}));
```

### 3. Mode Indicator Component

`src/components/hud/ModeIndicator.jsx`:

```jsx
import { useAuthStore } from '../../stores/authStore';
import { useCloudStore } from '../../stores/cloudStore';

export function ModeIndicator() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const hasUnsavedChanges = useCloudStore((s) => s.hasUnsavedChanges);

  if (isAuthenticated) {
    return (
      <div className="fixed top-16 right-4 z-40">
        <div className="bg-black/80 border border-cyan-500/30 px-3 py-1.5 
                        font-mono text-xs flex items-center gap-2">
          <span className="text-cyan-400">☁️</span>
          <span className="text-cyan-500">CLOUD SYNC</span>
          {hasUnsavedChanges && (
            <span className="text-yellow-400 text-[10px]">(unsaved)</span>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="fixed top-16 right-4 z-40">
      <div className="bg-black/80 border border-gray-600/30 px-3 py-1.5 
                      font-mono text-xs flex items-center gap-2">
        <span className="text-gray-400">💾</span>
        <span className="text-gray-500">LOCAL MODE</span>
      </div>
    </div>
  );
}
```

### 4. Cloud Diagrams Panel

`src/components/hud/CloudDiagramsPanel.jsx`:

```jsx
import { useEffect, useState } from 'react';
import { useAuthStore } from '../../stores/authStore';
import { useCloudStore } from '../../stores/cloudStore';
import { useGraphStore } from '../../stores/graphStore';
import { ConfirmDialog } from './ConfirmDialog';

export function CloudDiagramsPanel() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const diagrams = useCloudStore((s) => s.diagrams);
  const isLoading = useCloudStore((s) => s.isLoading);
  const error = useCloudStore((s) => s.error);
  const currentCloudId = useCloudStore((s) => s.currentCloudId);
  const hasUnsavedChanges = useCloudStore((s) => s.hasUnsavedChanges);
  const fetchDiagrams = useCloudStore((s) => s.fetchDiagrams);
  const loadDiagram = useCloudStore((s) => s.loadDiagram);
  const deleteDiagram = useCloudStore((s) => s.deleteDiagram);
  const setCurrentCloudId = useCloudStore((s) => s.setCurrentCloudId);
  
  const loadGraph = useGraphStore((s) => s.loadGraph);
  const nodes = useGraphStore((s) => s.nodes);
  const edges = useGraphStore((s) => s.edges);
  const diagramName = useGraphStore((s) => s.diagramName);

  const [confirmLoad, setConfirmLoad] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [hoveredId, setHoveredId] = useState(null);

  // Fetch diagrams on mount and when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchDiagrams();
    }
  }, [isAuthenticated, fetchDiagrams]);

  // Don't render if not authenticated
  if (!isAuthenticated) {
    return null;
  }

  const handleLoadClick = (diagram) => {
    if (hasUnsavedChanges) {
      setConfirmLoad(diagram);
    } else {
      handleConfirmLoad(diagram);
    }
  };

  const handleConfirmLoad = async (diagram) => {
    setConfirmLoad(null);
    const content = await loadDiagram(diagram.id);
    if (content) {
      loadGraph({
        nodes: content.nodes,
        edges: content.edges,
        name: content.name,
        id: content.id,
      });
    }
  };

  const handleDeleteClick = (diagram, e) => {
    e.stopPropagation();
    setConfirmDelete(diagram);
  };

  const handleConfirmDelete = async () => {
    if (confirmDelete) {
      await deleteDiagram(confirmDelete.id);
      setConfirmDelete(null);
    }
  };

  const handleNewDiagram = () => {
    // Clear current cloud ID and create fresh diagram
    setCurrentCloudId(null);
    loadGraph({
      nodes: [],
      edges: [],
      name: 'Untitled',
      id: null,
    });
  };

  return (
    <>
      <div className="fixed top-32 left-4 z-40 w-56">
        <div className="bg-black/80 border border-cyan-500/30">
          {/* Header */}
          <div className="px-3 py-2 border-b border-cyan-500/20">
            <h3 className="font-mono text-xs text-cyan-400 uppercase tracking-wider">
              My Diagrams
            </h3>
          </div>

          {/* Content */}
          <div className="max-h-64 overflow-y-auto">
            {isLoading && diagrams.length === 0 && (
              <div className="px-3 py-4 text-center">
                <span className="font-mono text-xs text-cyan-500/50">Loading...</span>
              </div>
            )}

            {error && (
              <div className="px-3 py-2">
                <span className="font-mono text-xs text-red-400">{error}</span>
              </div>
            )}

            {!isLoading && diagrams.length === 0 && !error && (
              <div className="px-3 py-4 text-center">
                <span className="font-mono text-xs text-gray-500">No diagrams yet</span>
              </div>
            )}

            {diagrams.map((diagram) => (
              <div
                key={diagram.id}
                className={`px-3 py-2 cursor-pointer transition-colors border-b border-cyan-500/10
                  ${currentCloudId === diagram.id 
                    ? 'bg-cyan-500/20 border-l-2 border-l-cyan-400' 
                    : 'hover:bg-cyan-500/10'}`}
                onClick={() => handleLoadClick(diagram)}
                onMouseEnter={() => setHoveredId(diagram.id)}
                onMouseLeave={() => setHoveredId(null)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="font-mono text-sm text-cyan-300 truncate">
                      {currentCloudId === diagram.id ? '▸ ' : '  '}
                      {diagram.name}
                    </div>
                    <div className="font-mono text-[10px] text-gray-500">
                      {diagram.nodeCount} nodes · {diagram.edgeCount} edges
                    </div>
                  </div>
                  
                  {hoveredId === diagram.id && (
                    <button
                      onClick={(e) => handleDeleteClick(diagram, e)}
                      className="ml-2 p-1 text-gray-500 hover:text-red-400 transition-colors"
                      title="Delete diagram"
                    >
                      🗑️
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* New Diagram Button */}
          <div className="px-3 py-2 border-t border-cyan-500/20">
            <button
              onClick={handleNewDiagram}
              className="w-full py-1.5 font-mono text-xs text-cyan-500 
                         border border-cyan-500/30 hover:bg-cyan-500/10 
                         transition-colors"
            >
              + NEW DIAGRAM
            </button>
          </div>
        </div>
      </div>

      {/* Confirm Load Dialog */}
      {confirmLoad && (
        <ConfirmDialog
          title="Unsaved Changes"
          message={`You have unsaved changes. Load "${confirmLoad.name}" anyway?`}
          confirmLabel="Load"
          cancelLabel="Cancel"
          onConfirm={() => handleConfirmLoad(confirmLoad)}
          onCancel={() => setConfirmLoad(null)}
        />
      )}

      {/* Confirm Delete Dialog */}
      {confirmDelete && (
        <ConfirmDialog
          title="Delete Diagram"
          message={`Are you sure you want to delete "${confirmDelete.name}"? This cannot be undone.`}
          confirmLabel="Delete"
          cancelLabel="Cancel"
          variant="danger"
          onConfirm={handleConfirmDelete}
          onCancel={() => setConfirmDelete(null)}
        />
      )}
    </>
  );
}
```

### 5. Confirm Dialog Component

`src/components/hud/ConfirmDialog.jsx`:

```jsx
export function ConfirmDialog({
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'default',
  onConfirm,
  onCancel,
}) {
  const confirmColor = variant === 'danger' 
    ? 'bg-red-500/20 border-red-500/50 text-red-400 hover:bg-red-500/30'
    : 'bg-cyan-500/20 border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/30';

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60"
        onClick={onCancel}
      />
      
      {/* Dialog */}
      <div className="relative bg-black/95 border border-cyan-500/30 p-6 max-w-md mx-4">
        <h3 className="font-mono text-lg text-cyan-400 mb-3">
          {title}
        </h3>
        <p className="font-mono text-sm text-gray-300 mb-6">
          {message}
        </p>
        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            className="px-4 py-2 font-mono text-sm text-gray-400 
                       border border-gray-600/50 hover:bg-gray-600/20 
                       transition-colors"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className={`px-4 py-2 font-mono text-sm border transition-colors ${confirmColor}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
```

### 6. Save to Cloud Button

`src/components/hud/SaveCloudButton.jsx`:

```jsx
import { useAuthStore } from '../../stores/authStore';
import { useCloudStore } from '../../stores/cloudStore';
import { useGraphStore } from '../../stores/graphStore';

export function SaveCloudButton() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isLoading = useCloudStore((s) => s.isLoading);
  const hasUnsavedChanges = useCloudStore((s) => s.hasUnsavedChanges);
  const currentCloudId = useCloudStore((s) => s.currentCloudId);
  const saveDiagram = useCloudStore((s) => s.saveDiagram);
  
  const nodes = useGraphStore((s) => s.nodes);
  const edges = useGraphStore((s) => s.edges);
  const diagramName = useGraphStore((s) => s.diagramName);

  if (!isAuthenticated) {
    return null;
  }

  const handleSave = async () => {
    await saveDiagram({
      name: diagramName || 'Untitled',
      nodes,
      edges,
    });
  };

  return (
    <div className="fixed bottom-24 left-4 z-40">
      <button
        onClick={handleSave}
        disabled={isLoading}
        className={`px-4 py-2 font-mono text-sm border transition-colors
          ${isLoading 
            ? 'border-gray-600/50 text-gray-500 cursor-not-allowed'
            : hasUnsavedChanges
              ? 'border-yellow-500/50 text-yellow-400 hover:bg-yellow-500/10 animate-pulse'
              : 'border-cyan-500/30 text-cyan-500 hover:bg-cyan-500/10'
          }`}
      >
        {isLoading ? '☁️ Saving...' : '☁️ SAVE TO CLOUD'}
      </button>
      {hasUnsavedChanges && !isLoading && (
        <div className="mt-1 font-mono text-[10px] text-yellow-400/70 text-center">
          unsaved changes
        </div>
      )}
    </div>
  );
}
```

### 7. Track Unsaved Changes

Update `src/stores/graphStore.js` to notify cloud store of changes:

```javascript
// In graphStore, after any mutation (addNode, deleteNode, updateNode, addEdge, deleteEdge, etc.)
// Call: useCloudStore.getState().setUnsavedChanges(true);
```

Alternatively, create a hook `useTrackChanges.js`:

```jsx
import { useEffect, useRef } from 'react';
import { useGraphStore } from '../stores/graphStore';
import { useCloudStore } from '../stores/cloudStore';
import { useAuthStore } from '../stores/authStore';

export function useTrackChanges() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const nodes = useGraphStore((s) => s.nodes);
  const edges = useGraphStore((s) => s.edges);
  const diagramName = useGraphStore((s) => s.diagramName);
  const setUnsavedChanges = useCloudStore((s) => s.setUnsavedChanges);
  
  const isFirstRender = useRef(true);
  const lastSavedState = useRef(null);

  useEffect(() => {
    // Skip first render (initial load)
    if (isFirstRender.current) {
      isFirstRender.current = false;
      lastSavedState.current = JSON.stringify({ nodes, edges, diagramName });
      return;
    }

    if (!isAuthenticated) return;

    const currentState = JSON.stringify({ nodes, edges, diagramName });
    if (currentState !== lastSavedState.current) {
      setUnsavedChanges(true);
    }
  }, [nodes, edges, diagramName, isAuthenticated, setUnsavedChanges]);

  // Reset tracking when cloud save happens
  useEffect(() => {
    const unsubscribe = useCloudStore.subscribe(
      (state) => state.hasUnsavedChanges,
      (hasUnsavedChanges) => {
        if (!hasUnsavedChanges) {
          const { nodes, edges, diagramName } = useGraphStore.getState();
          lastSavedState.current = JSON.stringify({ nodes, edges, diagramName });
        }
      }
    );
    return unsubscribe;
  }, []);
}
```

### 8. Update Auth Store for Logout Cleanup

Update `src/stores/authStore.js` logout action:

```javascript
import { useCloudStore } from './cloudStore';

// In logout action:
logout: () => {
  localStorage.removeItem(STORAGE_KEY);
  useCloudStore.getState().clear();  // Clear cloud state on logout
  set({
    isAuthenticated: false,
    accessToken: null,
    idToken: null,
    refreshToken: null,
    userInfo: null,
  });
},
```

### 9. App Integration

Update `src/App.jsx`:

```jsx
import { useTrackChanges } from './hooks/useTrackChanges';
import { ModeIndicator } from './components/hud/ModeIndicator';
import { CloudDiagramsPanel } from './components/hud/CloudDiagramsPanel';
import { SaveCloudButton } from './components/hud/SaveCloudButton';

function App() {
  useAuthCallback();
  useTrackChanges();  // Track changes for unsaved indicator

  return (
    <>
      {/* ... existing components ... */}
      <AuthPanel />
      <ModeIndicator />
      <CloudDiagramsPanel />
      <SaveCloudButton />
    </>
  );
}
```

## Implementation Steps

### Step 1: Create API Client

Create `src/utils/api.js` with authenticated fetch wrapper and diagramsApi methods.

### Step 2: Create Cloud Store

Create `src/stores/cloudStore.js` with diagram list, load, save, delete state management.

### Step 3: Create Confirm Dialog Component

Create `src/components/hud/ConfirmDialog.jsx` reusable dialog component.

### Step 4: Create Mode Indicator

Create `src/components/hud/ModeIndicator.jsx` showing Local Mode vs Cloud Sync.

### Step 5: Create Cloud Diagrams Panel

Create `src/components/hud/CloudDiagramsPanel.jsx` with list, load, delete functionality.

### Step 6: Create Save Cloud Button

Create `src/components/hud/SaveCloudButton.jsx` with save functionality.

### Step 7: Create Change Tracking Hook

Create `src/hooks/useTrackChanges.js` to detect unsaved changes.

### Step 8: Update Auth Store

Update `src/stores/authStore.js` to clear cloud state on logout.

### Step 9: Update Graph Store

Ensure `loadGraph` action properly resets state for cloud diagrams.

### Step 10: Integrate in App

Update `src/App.jsx` to include all new components and hooks.

### Step 11: Test Full Flow

1. Sign in
2. Create diagram, add nodes
3. Save to cloud
4. Refresh page, verify diagram appears in list
5. Load diagram from list
6. Make changes, verify unsaved indicator
7. Delete diagram from list

## Acceptance Criteria

- [ ] API client handles authentication and errors correctly
- [ ] Unauthenticated users see "Local Mode" indicator
- [ ] Authenticated users see "Cloud Sync" indicator
- [ ] Cloud Diagrams panel appears when authenticated
- [ ] Diagram list loads on sign in
- [ ] Clicking diagram loads it into editor
- [ ] Unsaved changes show warning before loading another diagram
- [ ] "Save to Cloud" saves current diagram
- [ ] New diagrams get created, existing diagrams get updated
- [ ] Delete button removes diagram from cloud
- [ ] Delete confirms before proceeding
- [ ] Unsaved changes indicator shows when diagram modified
- [ ] Logout clears cloud state
- [ ] All components match sci-fi aesthetic

## Cost Estimate

| Service | Usage Estimate | Monthly Cost |
|---------|----------------|--------------|
| API Gateway | <1K additional requests | $0.00 |
| Lambda | <1K additional invocations | $0.00 |
| DynamoDB | <100 items | $0.00 |
| S3 | <10MB | $0.00 |
| **Total** | | **$0.00** |

**Note:** This is frontend-only work. Backend already deployed in INITIAL-23.

## Testing Strategy

### Manual Testing Checklist

- [ ] **Unauthenticated**: Local Mode indicator shown, no cloud panel
- [ ] **Sign in**: Cloud Sync indicator shown, panel appears, list loads
- [ ] **Empty state**: "No diagrams yet" shown when list empty
- [ ] **Create**: Add nodes, save to cloud, appears in list
- [ ] **Load**: Click diagram in list, loads into editor
- [ ] **Unsaved warning**: Make changes, try to load another, see confirm dialog
- [ ] **Update**: Modify loaded diagram, save, verify changes persist
- [ ] **Delete**: Click delete, confirm, diagram removed from list
- [ ] **Current indicator**: Active diagram highlighted in list
- [ ] **Error handling**: Disconnect network, verify errors displayed
- [ ] **Sign out**: Cloud state cleared, shows Local Mode

## Rollback Plan

1. All cloud features are additive—local mode continues to work
2. Can remove new components from App.jsx to disable
3. No database migrations or breaking changes

## Future Extensions

- **INITIAL-25**: Public sharing toggle in diagram settings
- **Later**: Auto-save option (with debounce)
- **Later**: Last modified timestamps in list
- **Later**: Search/filter diagrams
- **Later**: Diagram thumbnails/previews
