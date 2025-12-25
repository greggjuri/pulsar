import { useEffect, useRef, useState, useCallback, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Grid } from '@react-three/drei';
import { DoubleSide } from 'three';
import NodeGroup from './components/canvas/NodeGroup';
import EdgeGroup from './components/canvas/EdgeGroup';
import CameraController from './components/canvas/CameraController';
import PostProcessing from './components/canvas/PostProcessing';
import HudOverlay from './components/hud/HudOverlay';
import ShortcutsPanel from './components/hud/ShortcutsPanel';
import { useGraphStore } from './stores/graphStore';
import { useAutoSave } from './hooks/useAutoSave';

// Wrapper to access store inside Canvas (R3F context)
const SceneControls = () => {
  const controlsRef = useRef();
  const draggingNodeId = useGraphStore((s) => s.draggingNodeId);

  return (
    <>
      <OrbitControls ref={controlsRef} enabled={!draggingNodeId} />
      <CameraController controlsRef={controlsRef} />
    </>
  );
};

// Scene content with context menu handlers
const SceneContent = ({ onContextMenu }) => {
  return (
    <>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} />
      <NodeGroup onContextMenu={onContextMenu} />
      <EdgeGroup onContextMenu={onContextMenu} />
      <Grid
        infiniteGrid
        cellSize={1}
        cellThickness={0.5}
        cellColor="#1a3a3a"
        sectionSize={5}
        sectionThickness={1}
        sectionColor="#0d4a4a"
        fadeDistance={30}
        fadeStrength={1}
        side={DoubleSide}
      />
      <SceneControls />
    </>
  );
};

function App() {
  const clearSelection = useGraphStore((s) => s.clearSelection);
  const triggerFit = useGraphStore((s) => s.triggerFit);
  const triggerReset = useGraphStore((s) => s.triggerReset);
  const selectedNodeId = useGraphStore((s) => s.selectedNodeId);
  const selectedEdgeId = useGraphStore((s) => s.selectedEdgeId);
  const connectingFromNodeId = useGraphStore((s) => s.connectingFromNodeId);
  const deleteNode = useGraphStore((s) => s.deleteNode);
  const deleteEdge = useGraphStore((s) => s.deleteEdge);
  const startConnecting = useGraphStore((s) => s.startConnecting);
  const cancelConnecting = useGraphStore((s) => s.cancelConnecting);

  // Context menu state
  const [contextMenu, setContextMenu] = useState(null);

  // Shortcuts panel state
  const [showShortcuts, setShowShortcuts] = useState(false);

  // Auto-save to localStorage on changes
  useAutoSave();

  const closeContextMenu = useCallback(() => {
    setContextMenu(null);
  }, []);

  // Handle context menu from 3D objects
  const handleContextMenu = useCallback((event, type, item) => {
    // Get screen coordinates from the native event
    const nativeEvent = event.nativeEvent || event;
    const x = nativeEvent.clientX;
    const y = nativeEvent.clientY;

    let items = [];

    if (type === 'node') {
      items = [
        {
          label: 'Connect to...',
          action: () => startConnecting(item.id),
        },
        {
          label: 'Delete',
          action: () => deleteNode(item.id),
        },
      ];
    } else if (type === 'edge') {
      items = [
        {
          label: 'Delete',
          action: () => deleteEdge(item.id),
        },
      ];
    }

    setContextMenu({ x, y, items });
  }, [startConnecting, deleteNode, deleteEdge]);

  // Handle pointer missed (click on empty space)
  const handlePointerMissed = useCallback(() => {
    if (connectingFromNodeId) {
      cancelConnecting();
    } else {
      clearSelection();
    }
    closeContextMenu();
  }, [connectingFromNodeId, cancelConnecting, clearSelection, closeContextMenu]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ignore if typing in an input field
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
        return;
      }

      // Toggle shortcuts panel with ?
      if (e.key === '?') {
        setShowShortcuts((prev) => !prev);
        return;
      }

      if (e.key === 'Escape') {
        // Close shortcuts panel if open
        if (showShortcuts) {
          setShowShortcuts(false);
          return;
        }
        if (connectingFromNodeId) {
          cancelConnecting();
        } else {
          clearSelection();
        }
        closeContextMenu();
      } else if (e.key === 'f' || e.key === 'F') {
        triggerFit();
      } else if (e.key === 'r' || e.key === 'R' || e.key === 'Home') {
        triggerReset();
      } else if (e.key === 'Delete') {
        if (selectedNodeId) {
          deleteNode(selectedNodeId);
        } else if (selectedEdgeId) {
          deleteEdge(selectedEdgeId);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [clearSelection, triggerFit, triggerReset, selectedNodeId, selectedEdgeId, deleteNode, deleteEdge, connectingFromNodeId, cancelConnecting, closeContextMenu, showShortcuts]);

  return (
    <div className="w-full h-screen bg-gray-950 relative">
      <Canvas
        camera={{ position: [0, 8, 15], fov: 60 }}
        onPointerMissed={handlePointerMissed}
      >
        <SceneContent onContextMenu={handleContextMenu} />
        <Suspense fallback={null}>
          <PostProcessing />
        </Suspense>
      </Canvas>

      <HudOverlay
        contextMenu={contextMenu}
        onCloseContextMenu={closeContextMenu}
      />

      <ShortcutsPanel
        isOpen={showShortcuts}
        onClose={() => setShowShortcuts(false)}
      />
    </div>
  );
}

export default App;
