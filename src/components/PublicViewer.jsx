import { useEffect, useState, useCallback, useRef, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Grid } from '@react-three/drei';
import { DoubleSide } from 'three';
import NodeGroup from './canvas/NodeGroup';
import EdgeGroup from './canvas/EdgeGroup';
import CameraController from './canvas/CameraController';
import PostProcessing from './canvas/PostProcessing';
import { useGraphStore } from '../stores/graphStore';
import { diagramsApi } from '../utils/api';

// Simplified scene controls for read-only viewing
const ViewerSceneControls = () => {
  const controlsRef = useRef();
  const draggingNodeId = useGraphStore((s) => s.draggingNodeId);

  return (
    <>
      <OrbitControls ref={controlsRef} enabled={!draggingNodeId} />
      <CameraController controlsRef={controlsRef} />
    </>
  );
};

// Scene content - read only (no context menu handlers)
const ViewerSceneContent = () => {
  return (
    <>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} />
      <NodeGroup onContextMenu={() => {}} />
      <EdgeGroup onContextMenu={() => {}} />
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
      <ViewerSceneControls />
    </>
  );
};

export function PublicViewer({ diagramId }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [diagramName, setDiagramName] = useState('');

  const loadGraph = useGraphStore((s) => s.loadGraph);
  const clearSelection = useGraphStore((s) => s.clearSelection);
  const triggerFit = useGraphStore((s) => s.triggerFit);
  const toggleLabels = useGraphStore((s) => s.toggleLabels);
  const toggleIcons = useGraphStore((s) => s.toggleIcons);

  // Fetch diagram on mount
  useEffect(() => {
    const fetchDiagram = async () => {
      setLoading(true);
      setError(null);

      try {
        const diagram = await diagramsApi.getPublic(diagramId);
        setDiagramName(diagram.name || 'Untitled');
        loadGraph({
          nodes: diagram.nodes || [],
          edges: diagram.edges || [],
          name: diagram.name,
          id: diagram.id,
        });
        // Fit camera to content after a brief delay for rendering
        setTimeout(() => triggerFit(), 100);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchDiagram();
  }, [diagramId, loadGraph, triggerFit]);

  // Handle pointer missed (click on empty space)
  const handlePointerMissed = useCallback(() => {
    clearSelection();
  }, [clearSelection]);

  // Keyboard shortcuts (limited set for viewer)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        clearSelection();
      } else if (e.key === 'l' || e.key === 'L') {
        toggleLabels();
      } else if (e.key === 'i' || e.key === 'I') {
        toggleIcons();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [clearSelection, toggleLabels, toggleIcons]);

  // Loading state
  if (loading) {
    return (
      <div className="w-full h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <div className="font-mono text-cyan-400 text-lg mb-2">PULSAR</div>
          <div className="font-mono text-sm text-cyan-500/50">Loading diagram...</div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="w-full h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <div className="font-mono text-cyan-400 text-lg mb-2">PULSAR</div>
          <div className="font-mono text-sm text-red-400 mb-4">{error}</div>
          <a
            href="/"
            className="font-mono text-xs text-cyan-500 hover:text-cyan-400 underline"
          >
            Go to main app
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-screen bg-gray-950 relative">
      <Canvas
        camera={{ position: [0, 8, 15], fov: 60 }}
        onPointerMissed={handlePointerMissed}
      >
        <ViewerSceneContent />
        <Suspense fallback={null}>
          <PostProcessing />
        </Suspense>
      </Canvas>

      {/* Header bar */}
      <div className="fixed top-0 left-0 right-0 h-12 bg-black/80 border-b border-cyan-500/30 z-50 flex items-center justify-between px-4">
        {/* Left: Logo and title */}
        <div className="flex items-center gap-4">
          <a
            href="/"
            className="font-mono text-lg text-cyan-400 font-bold tracking-widest hover:text-cyan-300"
          >
            PULSAR
          </a>
          <span className="font-mono text-sm text-gray-500">|</span>
          <span className="font-mono text-sm text-gray-300 truncate max-w-md">
            {diagramName}
          </span>
        </div>

        {/* Right: View Only badge */}
        <div className="flex items-center gap-4">
          <span className="font-mono text-xs text-yellow-500/80 bg-yellow-500/10 border border-yellow-500/30 px-2 py-1">
            VIEW ONLY
          </span>
        </div>
      </div>

      {/* Corner brackets (minimal) */}
      <div className="fixed top-16 left-2 w-4 h-4 border-l-2 border-t-2 border-cyan-500/30 pointer-events-none" />
      <div className="fixed top-16 right-2 w-4 h-4 border-r-2 border-t-2 border-cyan-500/30 pointer-events-none" />
      <div className="fixed bottom-2 left-2 w-4 h-4 border-l-2 border-b-2 border-cyan-500/30 pointer-events-none" />
      <div className="fixed bottom-2 right-2 w-4 h-4 border-r-2 border-b-2 border-cyan-500/30 pointer-events-none" />

      {/* Made with Pulsar footer */}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40">
        <a
          href="/"
          className="font-mono text-xs text-gray-500 hover:text-cyan-400 transition-colors"
        >
          Made with PULSAR
        </a>
      </div>

      {/* Keyboard hints */}
      <div className="fixed bottom-4 right-4 z-40">
        <div className="font-mono text-[10px] text-gray-600">
          L: Labels &middot; I: Icons &middot; Drag: Rotate
        </div>
      </div>
    </div>
  );
}
