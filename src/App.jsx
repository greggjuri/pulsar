import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import TestBox from './components/canvas/TestBox';

function App() {
  return (
    <div className="w-full h-screen bg-gray-950 relative">
      <Canvas camera={{ position: [0, 0, 5], fov: 60 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} />
        <TestBox />
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
