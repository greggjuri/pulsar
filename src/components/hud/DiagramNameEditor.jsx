import { useState, useRef, useEffect } from 'react';
import { useGraphStore } from '../../stores/graphStore';

export function DiagramNameEditor() {
  const diagramName = useGraphStore((s) => s.diagramName);
  const setDiagramName = useGraphStore((s) => s.setDiagramName);

  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(diagramName);
  const inputRef = useRef(null);

  // Update edit value when diagram changes (e.g., loading from cloud)
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

  const handleClick = () => {
    setIsEditing(true);
  };

  const handleBlur = () => {
    finishEditing();
  };

  const handleKeyDown = (e) => {
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

  return (
    <div className="absolute top-4 left-4 z-50">
      {isEditing ? (
        <input
          ref={inputRef}
          type="text"
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          className="bg-black/80 border border-cyan-500/50 px-3 py-1.5
                     font-mono text-sm text-cyan-400 outline-none
                     min-w-[200px] max-w-[300px]"
          placeholder="Diagram name"
        />
      ) : (
        <button
          onClick={handleClick}
          className="bg-black/80 border border-cyan-500/30 px-3 py-1.5
                     font-mono text-sm text-cyan-400 hover:border-cyan-500/50
                     hover:text-cyan-300 transition-colors text-left
                     min-w-[200px] max-w-[300px] truncate"
          title="Click to edit diagram name"
        >
          {diagramName || 'Untitled Diagram'}
        </button>
      )}
    </div>
  );
}
