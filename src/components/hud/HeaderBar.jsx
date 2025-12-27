import { useState, useRef, useEffect } from 'react';
import { useAuthStore } from '../../stores/authStore';
import { useCloudStore } from '../../stores/cloudStore';
import { useGraphStore } from '../../stores/graphStore';
import { getLoginUrl, getLogoutUrl } from '../../utils/auth';

export function HeaderBar() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isAuthLoading = useAuthStore((s) => s.isLoading);
  const userInfo = useAuthStore((s) => s.userInfo);

  const isCloudLoading = useCloudStore((s) => s.isLoading);
  const hasUnsavedChanges = useCloudStore((s) => s.hasUnsavedChanges);
  const saveDiagram = useCloudStore((s) => s.saveDiagram);

  const nodes = useGraphStore((s) => s.nodes);
  const edges = useGraphStore((s) => s.edges);
  const diagramName = useGraphStore((s) => s.diagramName);
  const setDiagramName = useGraphStore((s) => s.setDiagramName);

  // Editable name state
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(diagramName);
  const inputRef = useRef(null);

  // Sync edit value when diagram name changes externally
  useEffect(() => {
    setEditValue(diagramName);
  }, [diagramName]);

  // Focus input when editing starts
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleNameClick = () => {
    setIsEditing(true);
  };

  const handleNameBlur = () => {
    finishEditing();
  };

  const handleNameKeyDown = (e) => {
    if (e.key === 'Enter') {
      finishEditing();
    } else if (e.key === 'Escape') {
      setEditValue(diagramName);
      setIsEditing(false);
    }
  };

  const finishEditing = () => {
    const trimmed = editValue.trim();
    if (trimmed && trimmed !== diagramName) {
      setDiagramName(trimmed);
    } else {
      setEditValue(diagramName);
    }
    setIsEditing(false);
  };

  const handleSave = async () => {
    await saveDiagram({
      name: diagramName || 'Untitled',
      nodes,
      edges,
    });
  };

  return (
    <div className="fixed top-0 left-0 right-0 h-12 z-50 bg-black/90 border-b border-cyan-500/30 flex items-center px-4 pointer-events-auto">
      {/* Left section: Logo + Diagram Name */}
      <div className="flex items-center gap-4 flex-1">
        {/* PULSAR Logo */}
        <div
          className="text-xl font-bold font-mono text-cyan-400 tracking-wider"
          style={{ textShadow: '0 0 10px cyan' }}
        >
          PULSAR
        </div>

        <span className="text-cyan-500/30">|</span>

        {/* Editable Diagram Name */}
        {isEditing ? (
          <input
            ref={inputRef}
            type="text"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={handleNameBlur}
            onKeyDown={handleNameKeyDown}
            className="bg-black/50 border border-cyan-500/50 px-2 py-1
                       font-mono text-sm text-cyan-400 outline-none
                       w-48"
            placeholder="Diagram name"
          />
        ) : (
          <button
            onClick={handleNameClick}
            className="font-mono text-sm text-cyan-400 hover:text-cyan-300
                       transition-colors text-left truncate max-w-[200px]"
            title="Click to edit diagram name"
          >
            {diagramName || 'Untitled Diagram'}
          </button>
        )}

        {/* Save Button (only when authenticated) */}
        {isAuthenticated && (
          <button
            onClick={handleSave}
            disabled={isCloudLoading}
            className={`px-3 py-1 font-mono text-xs border transition-colors
              ${
                isCloudLoading
                  ? 'border-gray-600/50 text-gray-500 cursor-not-allowed'
                  : hasUnsavedChanges
                    ? 'border-yellow-500/50 text-yellow-400 hover:bg-yellow-500/10'
                    : 'border-cyan-500/30 text-cyan-500 hover:bg-cyan-500/10'
              }`}
          >
            {isCloudLoading ? 'SAVING...' : 'SAVE'}
          </button>
        )}
      </div>

      {/* Right section: Auth Info + Mode Badge */}
      <div className="flex items-center gap-3">
        {isAuthLoading ? (
          <span className="font-mono text-sm text-cyan-400">Signing in...</span>
        ) : isAuthenticated ? (
          <>
            {/* User Email */}
            <span className="font-mono text-sm text-cyan-400 truncate max-w-[180px]">
              {userInfo?.email}
            </span>

            <span className="text-cyan-500/30">|</span>

            {/* Mode Badge */}
            <span className="font-mono text-xs text-cyan-500 flex items-center gap-1">
              CLOUD
              {hasUnsavedChanges && (
                <span className="text-yellow-400 text-[10px]">(unsaved)</span>
              )}
            </span>

            <span className="text-cyan-500/30">|</span>

            {/* Sign Out */}
            <a
              href={getLogoutUrl()}
              className="font-mono text-sm text-cyan-500 hover:text-cyan-300 transition-colors"
            >
              Sign Out
            </a>
          </>
        ) : (
          <>
            {/* Mode Badge */}
            <span className="font-mono text-xs text-gray-500">LOCAL</span>

            <span className="text-gray-600/30">|</span>

            {/* Sign In */}
            <a
              href={getLoginUrl()}
              className="font-mono text-sm text-cyan-500 hover:text-cyan-300 transition-colors"
            >
              Sign In
            </a>
          </>
        )}
      </div>
    </div>
  );
}

export default HeaderBar;
