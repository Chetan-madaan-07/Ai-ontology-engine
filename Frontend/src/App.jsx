import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
// Commenting out the external import to fix Canvas preview compilation:
// import ForceGraph2D from 'react-force-graph-2d';
import { Search, Activity, Database, Loader2 } from 'lucide-react';

const BACKEND_URL = 'http://localhost:5000/api';

// --- MOCK COMPONENT FOR CANVAS PREVIEW ---
// This prevents the "Could not resolve" build error in the preview environment 
// while preserving all of your original logic and ref calls.
const ForceGraph2D = React.forwardRef((props, ref) => {
  const mockForce = {
    strength: () => mockForce,
    distance: () => mockForce
  };
  
  React.useImperativeHandle(ref, () => ({
    d3Force: () => mockForce,
    centerAt: () => {},
    zoom: () => {},
    zoomToFit: () => {}
  }));

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 font-medium tracking-wide p-8 text-center border-2 border-dashed border-slate-700 m-4 rounded-xl bg-slate-800/50">
      <span className="mb-2 text-blue-400"><Activity size={32} /></span>
      Graph Visualization Placeholder
      <span className="text-xs text-slate-500 mt-2 block max-w-md">
        (The 'react-force-graph-2d' package cannot be resolved in this online preview. Run your code locally to interact with the full graph physics.)
      </span>
      <div className="mt-4 text-xs text-slate-500 text-left bg-slate-900 p-4 rounded w-full max-w-md overflow-auto border border-slate-700 max-h-64">
        <strong className="text-slate-300 block mb-2">Current Graph Data State:</strong>
        <pre className="text-[10px]">{JSON.stringify(props.graphData, null, 2)}</pre>
      </div>
    </div>
  );
});
// -----------------------------------------

export default function App() {
  const [topic, setTopic] = useState('');
  const [graphData, setGraphData] = useState({ nodes: [], links: [] });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('Enter a topic to build the knowledge graph.');
  const fgRef = useRef();

  useEffect(() => {
    fetchGraph();
  }, []);

  // Tame the physics engine when graphData changes
  useEffect(() => {
    if (fgRef.current) {
      // Push nodes further apart so it doesn't look like a messy hairball
      fgRef.current.d3Force('charge').strength(-400);
      // Make links longer for better readability
      fgRef.current.d3Force('link').distance(120);
    }
  }, [graphData]);

  const fetchGraph = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/graph`);
      setGraphData(response.data);
    } catch (error) {
      // Suppress the console.error to avoid confusing error logs in the preview environment
      console.warn("Backend is offline. Loading mock preview data...");
      
      // FALLBACK: Load mock data if local backend isn't available (useful for online preview)
      setMessage("Backend is offline. Loading mock preview data...");
      setGraphData({
        nodes: [
          { id: "United States", group: "Location" },
          { id: "China", group: "Location" },
          { id: "Semiconductors", group: "Concept" },
          { id: "TSMC", group: "Organization" }
        ],
        links: [
          { source: "United States", target: "Semiconductors", label: "IMPORTS" },
          { source: "China", target: "Semiconductors", label: "MANUFACTURES" },
          { source: "TSMC", target: "Semiconductors", label: "PRODUCES" }
        ]
      });
    }
  };

  const handleIngest = async (e) => {
    e.preventDefault();
    if (!topic) return;

    setLoading(true);
    setMessage(`Fetching global news for "${topic}" & extracting AI ontology...`);
    
    try {
      await axios.post(`${BACKEND_URL}/ingest`, { topic });
      setMessage("Success! New intelligence added to the graph.");
      setTopic('');
      fetchGraph();
    } catch (error) {
      // Suppress the console.error to avoid confusing error logs in the preview environment
      console.warn("Backend offline. Simulating AI extraction in preview mode...");
      
      // FALLBACK: Simulate ingestion if backend isn't available
      setMessage("Backend offline. Simulating AI extraction in preview mode...");
      
      // Simulate network/processing delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setGraphData(prev => {
        const newNode = { id: topic, group: "Concept" };
        const newLinks = [...prev.links];
        
        // Connect to an existing random node to build the mock graph
        if (prev.nodes.length > 0) {
          const randomTarget = prev.nodes[Math.floor(Math.random() * prev.nodes.length)].id;
          newLinks.push({ source: topic, target: randomTarget, label: "RELATED_TO" });
        }
        
        return {
          nodes: [...prev.nodes, newNode],
          links: newLinks
        };
      });
      
      setMessage("Success! Mock intelligence added to the preview graph.");
      setTopic('');
    } finally {
      setLoading(false);
    }
  };

  const getNodeColor = (node) => {
    switch(node.group) {
      case 'Location': return '#3b82f6';
      case 'Organization': return '#10b981';
      case 'Person': return '#f59e0b';
      case 'Concept': return '#ec4899';
      default: return '#9ca3af';
    }
  };

  return (
    <div className="flex h-screen w-full bg-slate-900 overflow-hidden text-white font-sans">
      
      {/* SIDEBAR */}
      <div className="w-80 bg-slate-800 border-r border-slate-700 p-6 flex flex-col z-10 shadow-xl">
        
        <div className="flex items-center gap-3 mb-8">
          <Activity className="text-blue-400 animate-pulse" size={32} />
          <h1 className="text-xl font-bold leading-tight tracking-tight">Global Ontology Engine</h1>
        </div>

        <form onSubmit={handleIngest} className="flex flex-col gap-4 mb-8">
          <div>
            <label className="text-sm font-semibold text-slate-400 mb-2 block uppercase tracking-wider">Analyze New Topic</label>
            <div className="relative">
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g. Oil Prices, Taiwan..."
                className="w-full bg-slate-900 border border-slate-700 rounded-lg py-3 px-4 pl-10 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow disabled:opacity-50"
                disabled={loading}
              />
              <Search className="absolute left-3 top-3.5 text-slate-500" size={18} />
            </div>
          </div>
          
          <button 
            type="submit" 
            disabled={loading || !topic}
            className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 disabled:text-slate-500 text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-blue-500/25 active:scale-95 disabled:active:scale-100"
          >
            {loading ? <Loader2 className="animate-spin" size={18} /> : <Database size={18} />}
            {loading ? 'Processing via AI...' : 'Ingest & Analyze'}
          </button>
        </form>

        <div className={`p-4 rounded-lg border text-sm transition-colors duration-300 ${message.includes('Success') ? 'bg-green-900/30 border-green-700/50 text-green-400' : message.includes('offline') || message.includes('gadbad') ? 'bg-yellow-900/30 border-yellow-700/50 text-yellow-400' : 'bg-slate-900 border-slate-700 text-slate-300'}`}>
          <p className="leading-relaxed">{message}</p>
        </div>

        <div className="mt-auto pt-6 border-t border-slate-700/50">
          <h3 className="text-xs font-bold text-slate-400 mb-4 uppercase tracking-widest">Node Types</h3>
          <div className="flex flex-col gap-3 text-sm font-medium">
            <div className="flex items-center gap-3"><span className="w-3 h-3 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.6)]"></span> Location</div>
            <div className="flex items-center gap-3"><span className="w-3 h-3 rounded-full bg-green-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]"></span> Organization</div>
            <div className="flex items-center gap-3"><span className="w-3 h-3 rounded-full bg-yellow-500 shadow-[0_0_8px_rgba(245,158,11,0.6)]"></span> Person</div>
            <div className="flex items-center gap-3"><span className="w-3 h-3 rounded-full bg-pink-500 shadow-[0_0_8px_rgba(236,72,153,0.6)]"></span> Concept</div>
          </div>
        </div>
      </div>

      {/* GRAPH CANVAS AREA */}
      <div className="flex-1 relative cursor-grab active:cursor-grabbing bg-[#0f172a]" style={{ backgroundImage: 'radial-gradient(circle at center, #1e293b 0%, #0f172a 100%)' }}>
        {graphData.nodes.length === 0 && !loading ? (
          <div className="absolute inset-0 flex items-center justify-center text-slate-500 font-medium tracking-wide">
            No data in the graph yet. Ingest a topic to start!
          </div>
        ) : (
          <ForceGraph2D
            ref={fgRef}
            graphData={graphData}
            nodeLabel="id"
            nodeColor={getNodeColor}
            nodeRelSize={6}
            linkColor={() => '#475569'}
            linkWidth={2}
            linkDirectionalArrowLength={5}
            linkDirectionalArrowRelPos={1}
            cooldownTicks={100}
            onEngineStop={() => {
              if (fgRef.current) {
                fgRef.current.zoomToFit(400, 50);
              }
            }}
            onNodeClick={(node) => {
              if(fgRef.current.centerAt) fgRef.current.centerAt(node.x, node.y, 1000);
              if(fgRef.current.zoom) fgRef.current.zoom(4, 2000); 
            }}
          />
        )}
      </div>
    </div>
  );
}