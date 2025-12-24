import { useEffect, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Grid } from '@react-three/drei';
import { DoubleSide } from 'three';
import NodeGroup from './components/canvas/NodeGroup';
import EdgeGroup from './components/canvas/EdgeGroup';
import CameraController from './components/canvas/CameraController';
import HudOverlay from './components/hud/HudOverlay';
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

function App() {
  const clearSelection = useGraphStore((s) => s.clearSelection);
  const triggerFit = useGraphStore((s) => s.triggerFit);
  const triggerReset = useGraphStore((s) => s.triggerReset);
  const selectedNodeId = useGraphStore((s) => s.selectedNodeId);
  const deleteNode = useGraphStore((s) => s.deleteNode);

  // Auto-save to localStorage on changes
  useAutoSave();

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ignore if typing in an input field
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
        return;
      }

      if (e.key === 'Escape') {
        clearSelection();
      } else if (e.key === 'f' || e.key === 'F') {
        triggerFit();
      } else if (e.key === 'r' || e.key === 'R' || e.key === 'Home') {
        triggerReset();
      } else if (e.key === 'Delete' && selectedNodeId) {
        deleteNode(selectedNodeId);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [clearSelection, triggerFit, triggerReset, selectedNodeId, deleteNode]);

  return (
    <div className="w-full h-screen bg-gray-950 relative">
      <Canvas
        camera={{ position: [0, 8, 15], fov: 60 }}
        onPointerMissed={clearSelection}
      >
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} />
        <NodeGroup />
        <EdgeGroup />
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
      </Canvas>

      <HudOverlay />
    </div>
  );
}

export default App;
