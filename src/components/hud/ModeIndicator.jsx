import { useAuthStore } from '../../stores/authStore';
import { useCloudStore } from '../../stores/cloudStore';

export function ModeIndicator() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const hasUnsavedChanges = useCloudStore((s) => s.hasUnsavedChanges);

  if (isAuthenticated) {
    return (
      <div className="fixed top-16 right-4 z-40">
        <div
          className="bg-black/80 border border-cyan-500/30 px-3 py-1.5
                        font-mono text-xs flex items-center gap-2"
        >
          <span className="text-cyan-400">&#9729;</span>
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
      <div
        className="bg-black/80 border border-gray-600/30 px-3 py-1.5
                      font-mono text-xs flex items-center gap-2"
      >
        <span className="text-gray-400">&#128190;</span>
        <span className="text-gray-500">LOCAL MODE</span>
      </div>
    </div>
  );
}
