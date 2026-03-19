"use client";
import React, { useRef, useState, useEffect } from 'react';
import dynamic from 'next/dynamic';

// This is the magic trick to stop Next.js from crashing!
const ForceGraph2D = dynamic(() => import('react-force-graph-2d'), { ssr: false });

// NEW: We now accept repulsion and linkDistance from the dashboard
const KnowledgeGraph = ({ data, repulsion = 30, linkDistance = 40 }) => {
  const containerRef = useRef(null);
  const fgRef = useRef(); // NEW: Reference to the internal D3 physics engine
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });

  // Ensure the graph resizes to fit its container perfectly
  useEffect(() => {
    if (containerRef.current) {
      setDimensions({
        width: containerRef.current.offsetWidth,
        height: containerRef.current.offsetHeight
      });
    }
    
    const handleResize = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.offsetWidth,
          height: containerRef.current.offsetHeight
        });
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // --- DYNAMIC COLOR HASHING ---
  const colorPalette = [
    '#3b82f6', '#ef4444', '#10b981', '#f59e0b', 
    '#8b5cf6', '#ec4899', '#14b8a6', '#f97316', 
    '#06b6d4', '#84cc16', '#a855f7', '#f43f5e'
  ];

  const getNodeColor = (label) => {
    if (!label) return '#9ca3af'; 
    let hash = 0;
    for (let i = 0; i < label.length; i++) {
      hash = label.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % colorPalette.length;
    return colorPalette[index];
  };

  const graphData = {
    nodes: data?.nodes?.map(node => ({ ...node, color: getNodeColor(node.label) })) || [],
    links: data?.edges?.map(edge => ({ ...edge, name: edge.type })) || [] 
  };

  // NEW: Update D3 Physics when sliders change!
  useEffect(() => {
    if (fgRef.current) {
      // Repulsion is a negative charge in D3 physics
      fgRef.current.d3Force('charge').strength(-repulsion);
      // Set the link distance
      fgRef.current.d3Force('link').distance(linkDistance);
      // "Reheat" the simulation so it starts moving immediately when the slider is dragged
      fgRef.current.d3ReheatSimulation();
    }
  }, [repulsion, linkDistance, graphData]);

  return (
    <div ref={containerRef} className="w-full h-full min-h-[500px] bg-slate-900 rounded-xl overflow-hidden shadow-2xl border border-slate-700">
      {graphData.nodes.length > 0 ? (
        <ForceGraph2D
          ref={fgRef} // NEW: Attach the reference to the graph
          width={dimensions.width}
          height={dimensions.height}
          graphData={graphData}
          nodeLabel="name"
          nodeColor="color"
          linkColor={() => 'rgba(255,255,255,0.2)'}
          linkDirectionalArrowLength={3.5}
          linkDirectionalArrowRelPos={1}
          
          nodeCanvasObject={(node, ctx, globalScale) => {
            const label = node.name;
            const fontSize = 14 / globalScale;
            ctx.font = `${fontSize}px Sans-Serif`;
            const textWidth = ctx.measureText(label).width;
            const bckgDimensions = [textWidth, fontSize].map(n => n + fontSize * 0.2); 

            ctx.fillStyle = 'rgba(15, 23, 42, 0.8)'; 
            ctx.fillRect(node.x - bckgDimensions[0] / 2, node.y - bckgDimensions[1] / 2, ...bckgDimensions);

            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillStyle = node.color;
            ctx.fillText(label, node.x, node.y);

            node.__bckgDimensions = bckgDimensions; 
          }}
          nodePointerAreaPaint={(node, color, ctx) => {
            ctx.fillStyle = color;
            const bckgDimensions = node.__bckgDimensions;
            bckgDimensions && ctx.fillRect(node.x - bckgDimensions[0] / 2, node.y - bckgDimensions[1] / 2, ...bckgDimensions);
          }}
        />
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center text-slate-500">
          <svg className="w-16 h-16 mb-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5" />
          </svg>
          <p className="text-lg">No graph data available.</p>
          <p className="text-sm">Submit text to generate the intelligence map.</p>
        </div>
      )}
    </div>
  );
};

export default KnowledgeGraph;