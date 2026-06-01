"use client";
import { useState } from "react";

interface TimelineNode {
  sha: string;
  title: string;
  explanation: string;
  impactScore: number;
}

export default function Home() {
  const [repoUrl, setRepoUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [timeline, setTimeline] = useState<TimelineNode[]>([]);
  const [archSummary, setArchSummary] = useState("");
  const [selectedNode, setSelectedNode] = useState<TimelineNode | null>(null);

  const handleScan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!repoUrl.trim()) return;
    setLoading(true);
    try {
      const res = await fetch("/api/process-repo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ repoUrl }),
      });
      const data = await res.json();
      if (res.ok) {
        setTimeline(data.timeline || []);
        setArchSummary(data.architectureSummary || "");
        if (data.timeline?.length > 0) setSelectedNode(data.timeline[0]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#030712] text-slate-100 p-8 font-sans">
      <header className="max-w-6xl mx-auto mb-10 text-center">
        <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-cyan-400 to-emerald-400 bg-clip-text text-transparent mb-2">
          RepoBrain History Intelligence Deck
        </h1>
        <p className="text-sm text-slate-400">Map code updates into structured human insights effortlessly.</p>
      </header>

      {/* URL Dock Component */}
      <section className="max-w-3xl mx-auto mb-12">
        <form onSubmit={handleScan} className="flex gap-3">
          <input
            type="url"
            required
            value={repoUrl}
            onChange={(e) => setRepoUrl(e.target.value)}
            placeholder="Paste public GitHub repository link (e.g. https://github.com/user/repo)..."
            className="flex-1 bg-[#0b0f19] border border-slate-800 rounded-xl px-4 py-3 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 transition-colors"
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs px-6 py-3 rounded-xl disabled:opacity-40 transition-colors"
          >
            {loading ? "Analysing Codebase Changes..." : "Analyze Version Logs"}
          </button>
        </form>
      </section>

      {timeline.length > 0 && (
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Timeline Node Carousel */}
          <div className="bg-[#070b14] border border-slate-800/80 rounded-xl p-5">
            <h2 className="text-xs font-bold text-cyan-400 uppercase tracking-widest mb-4">Chronological Code Tree Slider</h2>
            <div className="flex gap-4 overflow-x-auto pb-3">
              {timeline.map((node) => (
                <button
                  key={node.sha}
                  onClick={() => setSelectedNode(node)}
                  className={`flex-shrink-0 w-60 p-4 rounded-xl border text-left transition-all ${
                    selectedNode?.sha === node.sha
                      ? "bg-[#0f172a] border-cyan-500 shadow-lg shadow-cyan-950/20"
                      : "bg-[#0b0f19] border-slate-800/60 hover:border-slate-700"
                  }`}
                >
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[10px] font-mono text-slate-500">#{node.sha.substring(0, 7)}</span>
                    <span className="text-[9px] font-bold bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full">
                      Impact: {node.impactScore}/10
                    </span>
                  </div>
                  <h3 className="font-bold text-xs line-clamp-2 text-slate-200">{node.title}</h3>
                </button>
              ))}
            </div>
          </div>

          {/* Active Node Detail Card */}
          {selectedNode && (
            <article className="bg-[#0b0f19] border border-slate-800/80 rounded-xl p-6">
              <div className="border-b border-slate-800/60 pb-3 mb-4">
                <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Active Node Analyzer</span>
                <h3 className="text-base font-extrabold text-slate-100 mt-1">{selectedNode.title}</h3>
              </div>
              <p className="text-slate-300 text-xs leading-relaxed">{selectedNode.explanation}</p>
            </article>
          )}

          {/* Core System Summary */}
          <section className="bg-[#070b14] border border-slate-800/80 rounded-xl p-5">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">High-Level System Design Overview</h3>
            <p className="text-slate-300 text-xs leading-relaxed">{archSummary}</p>
          </section>
        </div>
      )}
    </main>
  );
}