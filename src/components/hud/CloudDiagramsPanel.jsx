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
      <div className="fixed top-24 left-4 z-40 w-56">
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
                <span className="font-mono text-xs text-cyan-500/50">
                  Loading...
                </span>
              </div>
            )}

            {error && (
              <div className="px-3 py-2">
                <span className="font-mono text-xs text-red-400">{error}</span>
              </div>
            )}

            {!isLoading && diagrams.length === 0 && !error && (
              <div className="px-3 py-4 text-center">
                <span className="font-mono text-xs text-gray-500">
                  No diagrams yet
                </span>
              </div>
            )}

            {diagrams.map((diagram) => (
              <div
                key={diagram.id}
                className={`px-3 py-2 cursor-pointer transition-colors border-b border-cyan-500/10
                  ${
                    currentCloudId === diagram.id
                      ? 'bg-cyan-500/20 border-l-2 border-l-cyan-400'
                      : 'hover:bg-cyan-500/10'
                  }`}
                onClick={() => handleLoadClick(diagram)}
                onMouseEnter={() => setHoveredId(diagram.id)}
                onMouseLeave={() => setHoveredId(null)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="font-mono text-sm text-cyan-300 truncate">
                      {currentCloudId === diagram.id ? '> ' : '  '}
                      {diagram.name}
                    </div>
                    <div className="font-mono text-[10px] text-gray-500">
                      {diagram.nodeCount} nodes &middot; {diagram.edgeCount}{' '}
                      edges
                    </div>
                  </div>

                  {hoveredId === diagram.id && (
                    <button
                      onClick={(e) => handleDeleteClick(diagram, e)}
                      className="ml-2 p-1 text-gray-500 hover:text-red-400 transition-colors"
                      title="Delete diagram"
                    >
                      &#128465;
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
