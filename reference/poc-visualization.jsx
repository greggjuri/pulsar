import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

const AWS3DArchitecture = () => {
  const containerRef = useRef(null);
  const sceneRef = useRef(null);
  const [selectedNode, setSelectedNode] = useState(null);
  const [isRotating, setIsRotating] = useState(true);

  useEffect(() => {
    if (!containerRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(
      60,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.set(0, 5, 15);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setClearColor(0x0a0a0f, 1);
    containerRef.current.appendChild(renderer.domElement);

    // AWS Node definitions with positions
    const nodes = [
      { id: 'frontend', label: 'React\nFrontend', color: 0x61dafb, position: [-8, 0, 0], type: 'frontend' },
      { id: 'apigateway', label: 'API\nGateway', color: 0xff9900, position: [-4, 0, 0], type: 'aws' },
      { id: 'lambda1', label: 'Lambda\nHandler', color: 0xff9900, position: [0, 0, 0], type: 'aws' },
      { id: 'dynamodb', label: 'DynamoDB', color: 0x3b48cc, position: [4, 0, 0], type: 'aws' },
      { id: 'eventbridge', label: 'Event\nBridge', color: 0xff4f8b, position: [0, -3, 2], type: 'aws' },
      { id: 'sqs', label: 'SQS\nQueue', color: 0xff9900, position: [3, -3, 4], type: 'aws' },
      { id: 'stepfn', label: 'Step\nFunctions', color: 0xff4f8b, position: [6, -3, 4], type: 'aws' },
      { id: 'lambda2', label: 'Notify\nLambda', color: 0xff9900, position: [9, -1, 3], type: 'aws' },
      { id: 'lambda3', label: 'Process\nLambda', color: 0xff9900, position: [9, -3, 5], type: 'aws' },
      { id: 'lambda4', label: 'Cleanup\nLambda', color: 0xff9900, position: [9, -5, 3], type: 'aws' },
    ];

    const edges = [
      { from: 'frontend', to: 'apigateway', animated: true },
      { from: 'apigateway', to: 'lambda1', animated: true },
      { from: 'lambda1', to: 'dynamodb', animated: true },
      { from: 'lambda1', to: 'eventbridge', animated: true, dashed: true },
      { from: 'eventbridge', to: 'sqs', animated: true },
      { from: 'sqs', to: 'stepfn', animated: true },
      { from: 'stepfn', to: 'lambda2', animated: true },
      { from: 'stepfn', to: 'lambda3', animated: true },
      { from: 'stepfn', to: 'lambda4', animated: true },
    ];

    // Create glowing nodes
    const nodeObjects = [];
    const nodeMeshes = {};

    nodes.forEach((node) => {
      const group = new THREE.Group();
      group.position.set(...node.position);
      group.userData = { id: node.id, label: node.label, type: node.type };

      // Core sphere
      const coreGeometry = new THREE.IcosahedronGeometry(0.5, 2);
      const coreMaterial = new THREE.MeshBasicMaterial({
        color: node.color,
        transparent: true,
        opacity: 0.9,
      });
      const core = new THREE.Mesh(coreGeometry, coreMaterial);
      group.add(core);

      // Outer glow sphere
      const glowGeometry = new THREE.IcosahedronGeometry(0.7, 2);
      const glowMaterial = new THREE.MeshBasicMaterial({
        color: node.color,
        transparent: true,
        opacity: 0.2,
        side: THREE.BackSide,
      });
      const glow = new THREE.Mesh(glowGeometry, glowMaterial);
      group.add(glow);

      // Wireframe ring
      const ringGeometry = new THREE.TorusGeometry(0.8, 0.02, 8, 32);
      const ringMaterial = new THREE.MeshBasicMaterial({
        color: node.color,
        transparent: true,
        opacity: 0.6,
      });
      const ring = new THREE.Mesh(ringGeometry, ringMaterial);
      ring.rotation.x = Math.PI / 2;
      group.add(ring);

      // Second ring
      const ring2 = ring.clone();
      ring2.rotation.x = Math.PI / 4;
      ring2.rotation.y = Math.PI / 4;
      group.add(ring2);

      scene.add(group);
      nodeObjects.push(group);
      nodeMeshes[node.id] = group;
    });

    // Create animated edges with particles
    const edgeObjects = [];
    const particleSystems = [];

    edges.forEach((edge) => {
      const fromNode = nodes.find((n) => n.id === edge.from);
      const toNode = nodes.find((n) => n.id === edge.to);

      if (!fromNode || !toNode) return;

      const start = new THREE.Vector3(...fromNode.position);
      const end = new THREE.Vector3(...toNode.position);

      // Create curved line
      const mid = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5);
      mid.y += 0.5;

      const curve = new THREE.QuadraticBezierCurve3(start, mid, end);
      const points = curve.getPoints(50);

      const lineGeometry = new THREE.BufferGeometry().setFromPoints(points);
      const lineMaterial = new THREE.LineBasicMaterial({
        color: edge.dashed ? 0x00ffff : 0x00ff88,
        transparent: true,
        opacity: edge.dashed ? 0.3 : 0.5,
      });

      if (edge.dashed) {
        const dashedMaterial = new THREE.LineDashedMaterial({
          color: 0x00ffff,
          transparent: true,
          opacity: 0.4,
          dashSize: 0.3,
          gapSize: 0.15,
        });
        const line = new THREE.Line(lineGeometry, dashedMaterial);
        line.computeLineDistances();
        scene.add(line);
        edgeObjects.push(line);
      } else {
        const line = new THREE.Line(lineGeometry, lineMaterial);
        scene.add(line);
        edgeObjects.push(line);
      }

      // Animated particles along the edge
      if (edge.animated) {
        const particleCount = 5;
        const particleGeometry = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);
        particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

        const particleMaterial = new THREE.PointsMaterial({
          color: 0x00ffff,
          size: 0.15,
          transparent: true,
          opacity: 0.8,
          blending: THREE.AdditiveBlending,
        });

        const particles = new THREE.Points(particleGeometry, particleMaterial);
        scene.add(particles);

        particleSystems.push({
          particles,
          curve,
          offsets: Array.from({ length: particleCount }, (_, i) => i / particleCount),
        });
      }
    });

    // Grid
    const gridHelper = new THREE.GridHelper(30, 30, 0x00ffff, 0x001a1a);
    gridHelper.position.y = -6;
    gridHelper.material.opacity = 0.3;
    gridHelper.material.transparent = true;
    scene.add(gridHelper);

    // Ambient particles (floating dust)
    const dustGeometry = new THREE.BufferGeometry();
    const dustCount = 500;
    const dustPositions = new Float32Array(dustCount * 3);
    for (let i = 0; i < dustCount * 3; i += 3) {
      dustPositions[i] = (Math.random() - 0.5) * 40;
      dustPositions[i + 1] = (Math.random() - 0.5) * 20;
      dustPositions[i + 2] = (Math.random() - 0.5) * 40;
    }
    dustGeometry.setAttribute('position', new THREE.BufferAttribute(dustPositions, 3));

    const dustMaterial = new THREE.PointsMaterial({
      color: 0x00ffff,
      size: 0.05,
      transparent: true,
      opacity: 0.4,
      blending: THREE.AdditiveBlending,
    });
    const dust = new THREE.Points(dustGeometry, dustMaterial);
    scene.add(dust);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    // Camera controls
    let isDragging = false;
    let previousMousePosition = { x: 0, y: 0 };
    let cameraDistance = 15;
    let cameraTheta = 0;
    let cameraPhi = Math.PI / 4;
    let autoRotate = true;

    const updateCamera = () => {
      camera.position.x = cameraDistance * Math.sin(cameraPhi) * Math.cos(cameraTheta);
      camera.position.y = cameraDistance * Math.cos(cameraPhi);
      camera.position.z = cameraDistance * Math.sin(cameraPhi) * Math.sin(cameraTheta);
      camera.lookAt(0, -1, 2);
    };
    updateCamera();

    const onMouseDown = (e) => {
      isDragging = true;
      autoRotate = false;
      setIsRotating(false);
      previousMousePosition = { x: e.clientX, y: e.clientY };
    };

    const onMouseUp = () => {
      isDragging = false;
    };

    const onMouseMove = (e) => {
      if (!isDragging) return;

      const deltaX = e.clientX - previousMousePosition.x;
      const deltaY = e.clientY - previousMousePosition.y;

      cameraTheta += deltaX * 0.01;
      cameraPhi = Math.max(0.1, Math.min(Math.PI - 0.1, cameraPhi + deltaY * 0.01));

      updateCamera();
      previousMousePosition = { x: e.clientX, y: e.clientY };
    };

    const onWheel = (e) => {
      e.preventDefault();
      cameraDistance = Math.max(5, Math.min(30, cameraDistance + e.deltaY * 0.02));
      updateCamera();
    };

    // Click detection for nodes
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const onClick = (e) => {
      const rect = containerRef.current.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(nodeObjects, true);

      if (intersects.length > 0) {
        let obj = intersects[0].object;
        while (obj.parent && !obj.userData.id) {
          obj = obj.parent;
        }
        if (obj.userData.id) {
          setSelectedNode(obj.userData);
        }
      } else {
        setSelectedNode(null);
      }
    };

    renderer.domElement.addEventListener('mousedown', onMouseDown);
    renderer.domElement.addEventListener('mouseup', onMouseUp);
    renderer.domElement.addEventListener('mousemove', onMouseMove);
    renderer.domElement.addEventListener('wheel', onWheel, { passive: false });
    renderer.domElement.addEventListener('click', onClick);

    // Animation loop
    let time = 0;
    const animate = () => {
      requestAnimationFrame(animate);
      time += 0.016;

      // Auto-rotate
      if (autoRotate) {
        cameraTheta += 0.002;
        updateCamera();
      }

      // Animate node rings
      nodeObjects.forEach((group, i) => {
        group.children.forEach((child, j) => {
          if (j > 1) {
            child.rotation.z += 0.01 + i * 0.002;
          }
        });
        // Subtle bob
        group.position.y = nodes[i].position[1] + Math.sin(time * 2 + i) * 0.1;
      });

      // Animate particles along edges
      particleSystems.forEach((system) => {
        const positions = system.particles.geometry.attributes.position.array;
        system.offsets = system.offsets.map((offset, i) => {
          const newOffset = (offset + 0.005) % 1;
          const point = system.curve.getPoint(newOffset);
          positions[i * 3] = point.x;
          positions[i * 3 + 1] = point.y;
          positions[i * 3 + 2] = point.z;
          return newOffset;
        });
        system.particles.geometry.attributes.position.needsUpdate = true;
      });

      // Animate dust
      dust.rotation.y += 0.0003;

      renderer.render(scene, camera);
    };
    animate();

    // Handle resize
    const handleResize = () => {
      if (!containerRef.current) return;
      camera.aspect = containerRef.current.clientWidth / containerRef.current.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      renderer.domElement.removeEventListener('mousedown', onMouseDown);
      renderer.domElement.removeEventListener('mouseup', onMouseUp);
      renderer.domElement.removeEventListener('mousemove', onMouseMove);
      renderer.domElement.removeEventListener('wheel', onWheel);
      renderer.domElement.removeEventListener('click', onClick);
      if (containerRef.current && renderer.domElement) {
        containerRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  const toggleRotation = () => {
    setIsRotating(!isRotating);
  };

  return (
    <div className="relative w-full h-screen bg-gray-950 overflow-hidden">
      {/* 3D Canvas Container */}
      <div ref={containerRef} className="w-full h-full" />

      {/* Scanlines overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-5"
        style={{
          background:
            'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0, 255, 255, 0.03) 2px, rgba(0, 255, 255, 0.03) 4px)',
        }}
      />

      {/* Header HUD */}
      <div className="absolute top-4 left-4 text-cyan-400 font-mono">
        <div className="text-2xl font-bold tracking-wider" style={{ textShadow: '0 0 10px cyan' }}>
          PULSAR
        </div>
        <div className="text-sm opacity-60 mt-1">AWS ARCHITECTURE VIEWER</div>
      </div>

      {/* Controls Panel */}
      <div className="absolute top-4 right-4 bg-black/50 border border-cyan-500/30 rounded-lg p-4 backdrop-blur-sm">
        <div className="text-cyan-400 font-mono text-sm mb-3">CONTROLS</div>
        <div className="text-gray-400 text-xs space-y-1">
          <div>🖱️ Drag to rotate</div>
          <div>🔍 Scroll to zoom</div>
          <div>👆 Click node for info</div>
        </div>
        <button
          onClick={toggleRotation}
          className="mt-3 w-full py-2 px-3 bg-cyan-500/20 border border-cyan-500/50 rounded text-cyan-400 text-xs hover:bg-cyan-500/30 transition-all"
        >
          {isRotating ? '⏸ PAUSE' : '▶ AUTO-ROTATE'}
        </button>
      </div>

      {/* Node Info Panel */}
      {selectedNode && (
        <div className="absolute bottom-4 left-4 bg-black/70 border border-cyan-500/50 rounded-lg p-4 backdrop-blur-sm min-w-64">
          <div className="flex justify-between items-start mb-2">
            <div className="text-cyan-400 font-mono text-lg" style={{ textShadow: '0 0 5px cyan' }}>
              {selectedNode.label.replace('\n', ' ')}
            </div>
            <button
              onClick={() => setSelectedNode(null)}
              className="text-gray-500 hover:text-cyan-400 text-xl leading-none"
            >
              ×
            </button>
          </div>
          <div className="text-gray-400 text-sm">
            <div className="flex justify-between py-1 border-b border-gray-700">
              <span>Type:</span>
              <span className="text-cyan-300">{selectedNode.type.toUpperCase()}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-gray-700">
              <span>ID:</span>
              <span className="text-cyan-300">{selectedNode.id}</span>
            </div>
            <div className="flex justify-between py-1">
              <span>Status:</span>
              <span className="text-green-400">● ACTIVE</span>
            </div>
          </div>
        </div>
      )}

      {/* Stats Panel */}
      <div className="absolute bottom-4 right-4 bg-black/50 border border-cyan-500/30 rounded-lg p-4 backdrop-blur-sm font-mono text-xs">
        <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-gray-400">
          <span>Nodes:</span>
          <span className="text-cyan-400">10</span>
          <span>Connections:</span>
          <span className="text-cyan-400">9</span>
          <span>Data Flow:</span>
          <span className="text-green-400">ACTIVE</span>
        </div>
      </div>

      {/* Corner decorations */}
      <div className="absolute top-0 left-0 w-16 h-16 border-l-2 border-t-2 border-cyan-500/30" />
      <div className="absolute top-0 right-0 w-16 h-16 border-r-2 border-t-2 border-cyan-500/30" />
      <div className="absolute bottom-0 left-0 w-16 h-16 border-l-2 border-b-2 border-cyan-500/30" />
      <div className="absolute bottom-0 right-0 w-16 h-16 border-r-2 border-b-2 border-cyan-500/30" />
    </div>
  );
};

export default AWS3DArchitecture;
