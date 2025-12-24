import { useEffect, useRef } from 'react';

const ContextMenu = ({ x, y, items, onClose }) => {
  const menuRef = useRef(null);

  // Close on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        onClose();
      }
    };
    // Use capture to catch before stopPropagation
    window.addEventListener('click', handleClick, true);
    return () => window.removeEventListener('click', handleClick, true);
  }, [onClose]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Adjust position to keep menu in viewport
  const adjustedPosition = () => {
    const menuWidth = 160;
    const menuHeight = items.length * 36 + 8; // Approximate height
    const padding = 8;

    let adjustedX = x;
    let adjustedY = y;

    // Keep within horizontal bounds
    if (x + menuWidth > window.innerWidth - padding) {
      adjustedX = window.innerWidth - menuWidth - padding;
    }

    // Keep within vertical bounds
    if (y + menuHeight > window.innerHeight - padding) {
      adjustedY = window.innerHeight - menuHeight - padding;
    }

    return { left: adjustedX, top: adjustedY };
  };

  const position = adjustedPosition();

  return (
    <div
      ref={menuRef}
      className="fixed bg-black/90 border border-cyan-500/50 rounded shadow-lg py-1 z-50 min-w-40 backdrop-blur-sm"
      style={position}
    >
      {items.map((item, i) => (
        <button
          key={i}
          onClick={(e) => {
            e.stopPropagation();
            item.action();
            onClose();
          }}
          className="block w-full px-4 py-2 text-left text-sm text-cyan-400
                     hover:bg-cyan-500/20 hover:text-white font-mono transition-colors"
        >
          {item.label}
        </button>
      ))}
    </div>
  );
};

export default ContextMenu;
