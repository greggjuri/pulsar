import { useAuthStore } from '../../stores/authStore';
import { useCloudStore } from '../../stores/cloudStore';
import { useGraphStore } from '../../stores/graphStore';

export function SaveCloudButton() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isLoading = useCloudStore((s) => s.isLoading);
  const hasUnsavedChanges = useCloudStore((s) => s.hasUnsavedChanges);
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
          ${
            isLoading
              ? 'border-gray-600/50 text-gray-500 cursor-not-allowed'
              : hasUnsavedChanges
                ? 'border-yellow-500/50 text-yellow-400 hover:bg-yellow-500/10 animate-pulse'
                : 'border-cyan-500/30 text-cyan-500 hover:bg-cyan-500/10'
          }`}
      >
        {isLoading ? 'SAVING...' : 'SAVE'}
      </button>
      {hasUnsavedChanges && !isLoading && (
        <div className="mt-1 font-mono text-[10px] text-yellow-400/70 text-center">
          unsaved changes
        </div>
      )}
    </div>
  );
}
