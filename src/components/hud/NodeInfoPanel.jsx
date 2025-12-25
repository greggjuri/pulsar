import { useState, useEffect, useRef } from 'react';
import { useGraphStore } from '../../stores/graphStore';

const COLOR_PRESETS = [
  { name: 'Cyan', value: '#00ffff' },
  { name: 'Orange', value: '#ff9900' },
  { name: 'Magenta', value: '#ff4f8b' },
  { name: 'Blue', value: '#3b48cc' },
  { name: 'Green', value: '#00ff88' },
  { name: 'White', value: '#ffffff' },
];

const NodeInfoPanel = ({ node, onClose }) => {
  const updateNode = useGraphStore((s) => s.updateNode);

  // Label editing state
  const [isEditingLabel, setIsEditingLabel] = useState(false);
  const [labelValue, setLabelValue] = useState(node?.label || '');
  const labelInputRef = useRef(null);

  // Color picker state
  const [showColorPicker, setShowColorPicker] = useState(false);
  const colorPickerRef = useRef(null);

  // Reset label value when node changes
  useEffect(() => {
    if (node) {
      setLabelValue(node.label);
      setIsEditingLabel(false);
      setShowColorPicker(false);
    }
  }, [node?.id]);

  // Focus input when entering edit mode
  useEffect(() => {
    if (isEditingLabel && labelInputRef.current) {
      labelInputRef.current.focus();
      labelInputRef.current.select();
    }
  }, [isEditingLabel]);

  // Close color picker on outside click
  useEffect(() => {
    if (!showColorPicker) return;

    const handleClickOutside = (e) => {
      if (colorPickerRef.current && !colorPickerRef.current.contains(e.target)) {
        setShowColorPicker(false);
      }
    };

    // Delay to prevent immediate close from the same click
    const timeoutId = setTimeout(() => {
      document.addEventListener('click', handleClickOutside);
    }, 0);

    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener('click', handleClickOutside);
    };
  }, [showColorPicker]);

  if (!node) return null;

  const handleLabelClick = () => {
    setLabelValue(node.label);
    setIsEditingLabel(true);
  };

  const handleLabelSave = () => {
    const trimmedValue = labelValue.trim();
    if (trimmedValue && trimmedValue !== node.label) {
      updateNode(node.id, { label: trimmedValue });
    } else {
      // Revert to original if empty
      setLabelValue(node.label);
    }
    setIsEditingLabel(false);
  };

  const handleLabelKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleLabelSave();
    } else if (e.key === 'Escape') {
      setLabelValue(node.label);
      setIsEditingLabel(false);
    }
  };

  const handleColorSelect = (color) => {
    updateNode(node.id, { color });
    setShowColorPicker(false);
  };

  return (
    <div className="absolute bottom-4 left-4 bg-black/70 border border-cyan-500/50 rounded-lg p-4 backdrop-blur-sm min-w-64 font-mono pointer-events-auto animate-in fade-in slide-in-from-bottom-2 duration-200">
      <div className="flex justify-between items-start mb-3">
        {isEditingLabel ? (
          <input
            ref={labelInputRef}
            type="text"
            value={labelValue}
            onChange={(e) => setLabelValue(e.target.value)}
            onBlur={handleLabelSave}
            onKeyDown={handleLabelKeyDown}
            className="bg-black/50 border border-cyan-500/50 text-cyan-400 px-2 py-1
                       text-lg font-mono outline-none focus:border-cyan-400 rounded
                       w-full max-w-48"
            style={{ textShadow: '0 0 8px cyan' }}
          />
        ) : (
          <div
            onClick={handleLabelClick}
            className="text-cyan-400 text-lg cursor-pointer hover:text-white transition-colors"
            style={{ textShadow: '0 0 8px cyan' }}
            title="Click to edit"
          >
            {node.label}
          </div>
        )}
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-cyan-400 text-xl leading-none transition-colors ml-4"
        >
          ×
        </button>
      </div>
      <div className="text-sm space-y-1">
        <div className="flex justify-between py-1 border-b border-gray-700">
          <span className="text-gray-400">Type:</span>
          <span className="text-cyan-300">{node.type?.toUpperCase() || 'SERVICE'}</span>
        </div>
        <div className="flex justify-between py-1 border-b border-gray-700">
          <span className="text-gray-400">ID:</span>
          <span className="text-cyan-300">{node.id}</span>
        </div>
        <div className="flex justify-between py-1 border-b border-gray-700">
          <span className="text-gray-400">Color:</span>
          <div className="relative" ref={colorPickerRef}>
            <button
              onClick={() => setShowColorPicker(!showColorPicker)}
              className="w-6 h-6 rounded border border-cyan-500/50 hover:border-cyan-400
                         transition-colors cursor-pointer"
              style={{ backgroundColor: node.color || '#00ffff' }}
              title="Click to change color"
            />
            {showColorPicker && (
              <div className="absolute left-0 bottom-8 bg-black/90 border border-cyan-500/50
                              rounded p-3 flex gap-3 z-10">
                {COLOR_PRESETS.map(({ name, value }) => (
                  <button
                    key={value}
                    onClick={() => handleColorSelect(value)}
                    className={`w-10 h-10 rounded-lg border-2 transition-all cursor-pointer
                              hover:scale-110 hover:border-cyan-400
                              ${node.color === value ? 'border-white ring-2 ring-cyan-400/50' : 'border-gray-600'}`}
                    style={{ backgroundColor: value }}
                    title={name}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
        <div className="flex justify-between py-1">
          <span className="text-gray-400">Status:</span>
          <span className="text-green-400 flex items-center gap-1">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            ACTIVE
          </span>
        </div>
      </div>
    </div>
  );
};

export default NodeInfoPanel;
