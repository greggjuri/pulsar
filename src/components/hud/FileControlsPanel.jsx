import { useGraphStore } from '../../stores/graphStore';
import { serializeGraph, validateGraph } from '../../utils/graphSchema';
import { downloadAsJson, generateFilename } from '../../utils/fileExport';
import { openFilePicker } from '../../utils/fileImport';
import { clearLocalStorage } from '../../utils/storage';

const FileControlsPanel = () => {
  const nodes = useGraphStore((s) => s.nodes);
  const edges = useGraphStore((s) => s.edges);
  const diagramName = useGraphStore((s) => s.diagramName);
  const setDiagramName = useGraphStore((s) => s.setDiagramName);
  const loadGraph = useGraphStore((s) => s.loadGraph);
  const triggerFit = useGraphStore((s) => s.triggerFit);
  const triggerReset = useGraphStore((s) => s.triggerReset);
  const addNode = useGraphStore((s) => s.addNode);

  const handleNew = () => {
    const confirmed = window.confirm(
      'Start a new diagram? Current work will be cleared.'
    );
    if (confirmed) {
      clearLocalStorage();
      loadGraph({
        nodes: [],
        edges: [],
        name: 'Untitled Diagram',
        id: null,
      });
      triggerReset();
    }
  };

  const handleExport = () => {
    let name = diagramName;

    // Prompt for name if still untitled
    if (name === 'Untitled Diagram') {
      const inputName = prompt('Enter a name for your diagram:', name);
      if (inputName === null) return; // User cancelled
      name = inputName.trim() || 'Untitled Diagram';
      setDiagramName(name);
    }

    const graph = serializeGraph(nodes, edges, name);
    const filename = generateFilename(name);
    downloadAsJson(graph, filename);
  };

  const handleImport = async () => {
    try {
      const data = await openFilePicker();

      // Validate the imported data
      const { valid, errors } = validateGraph(data);
      if (!valid) {
        alert('Invalid diagram file:\n\n' + errors.join('\n'));
        return;
      }

      // Load the graph into the store
      loadGraph(data);

      // Fit camera to show all imported nodes
      setTimeout(() => triggerFit(), 100);
    } catch (error) {
      // Ignore cancellation
      if (error.message === 'File selection cancelled') return;
      if (error.message === 'No file selected') return;

      alert('Import failed: ' + error.message);
    }
  };

  return (
    <div className="absolute top-20 left-4 bg-black/60 border border-cyan-500/30 rounded px-3 py-2 font-mono text-xs pointer-events-auto">
      <div className="flex items-center gap-2">
        <button
          onClick={handleNew}
          className="px-2 py-1 rounded text-cyan-400 hover:text-white hover:bg-cyan-500/30 transition-all"
          title="New diagram"
        >
          + NEW
        </button>
        <span className="text-cyan-500/30">|</span>
        <button
          onClick={addNode}
          className="px-2 py-1 rounded text-cyan-400 hover:text-white hover:bg-cyan-500/30 transition-all"
          title="Add node"
        >
          + NODE
        </button>
        <span className="text-cyan-500/30">|</span>
        <button
          onClick={handleExport}
          className="px-2 py-1 rounded text-cyan-400 hover:text-white hover:bg-cyan-500/30 transition-all"
          title="Export diagram"
        >
          ↓ EXPORT
        </button>
        <span className="text-cyan-500/30">|</span>
        <button
          onClick={handleImport}
          className="px-2 py-1 rounded text-cyan-400 hover:text-white hover:bg-cyan-500/30 transition-all"
          title="Import diagram"
        >
          ↑ IMPORT
        </button>
      </div>
    </div>
  );
};

export default FileControlsPanel;
