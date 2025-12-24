import { useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Grid } from '@react-three/drei';
import { DoubleSide } from 'three';
import NodeGroup from './components/canvas/NodeGroup';
import EdgeGroup from './components/canvas/EdgeGroup';
import HudOverlay from './components/hud/HudOverlay';
import { useGraphStore } from './stores/graphStore';

function App() {
  const clearSelection = useGraphStore((s) => s.clearSelection);

  // Escape key to clear selection
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        clearSelection();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [clearSelection]);

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
        <OrbitControls />
      </Canvas>

      <HudOverlay />
    </div>
  );
}

export default App;
