import { Canvas } from '@react-three/fiber';
import { OrbitControls, Grid } from '@react-three/drei';
import NodeGroup from './components/canvas/NodeGroup';
import EdgeGroup from './components/canvas/EdgeGroup';
import { testNodes } from './data/testNodes';
import { testEdges } from './data/testEdges';

function App() {
  return (
    <div className="w-full h-screen bg-gray-950 relative">
      <Canvas camera={{ position: [0, 8, 15], fov: 60 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} />
        <NodeGroup nodes={testNodes} />
        <EdgeGroup edges={testEdges} nodes={testNodes} />
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
        />
        <OrbitControls />
      </Canvas>

      {/* HUD Overlay */}
      <div className="absolute top-4 left-4 text-cyan-400 font-mono">
        <div className="text-2xl font-bold tracking-wider" style={{ textShadow: '0 0 10px cyan' }}>
          PULSAR
        </div>
        <div className="text-sm opacity-60 mt-1">SYSTEM ONLINE</div>
      </div>
    </div>
  );
}

export default App;
