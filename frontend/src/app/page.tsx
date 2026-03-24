"use client";

import { useState, useEffect, useRef } from "react";

export default function Home() {
  const [logs, setLogs] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  // History State with LocalStorage
  const [history, setHistory] = useState<any[]>([]);
  const [isMounted, setIsMounted] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setIsMounted(true);
    const saved = localStorage.getItem("lumina_history");
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse history", e);
      }
    } else {
      setHistory([
        { id: 1, title: "Auth Timeout error", time: "2m ago", status: "Resolved" },
        { id: 2, title: "Redis OOM Kill", time: "45m ago", status: "Critical" },
        { id: 3, title: "Null Pointer Exception", time: "2h ago", status: "Fixed" },
      ]);
    }
  }, []);

  useEffect(() => {
    if (isMounted) {
      localStorage.setItem("lumina_history", JSON.stringify(history));
    }
  }, [history, isMounted]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result;
      if (typeof text === "string") {
        setLogs(text);
      }
    };
    reader.readAsText(file);
    // Reset file input so the same file could be uploaded again
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const copyToClipboard = () => {
    if (!result) return;
    const reportText = `
=== Lumina AI Diagnostic Report ===
ISSUE: ${result.issue}
FINGERPRINT: ${result.stack_fingerprint}
SEVERITY: ${result.severity || "MEDIUM"}

HYPOTHESES:
${(Array.isArray(result.hypotheses) ? result.hypotheses : []).map((h: any, i: number) => `[H${i+1} - ${h.confidence_score}% CONFIDENCE]
- Root Cause: ${h.root_cause}
- Justification: ${h.justification}`).join('\n\n')}

FIX RECOMMENDATIONS:
${(Array.isArray(result.fixes) ? result.fixes : [result.fixes]).map((f: string, i: number) => `${i + 1}. ${f}`).join('\n')}

BEGINNER EXPLANATION:
"${result.explanation_for_beginner}"
`.trim();

    navigator.clipboard.writeText(reportText);
    alert("Full diagnostic report copied to clipboard!");
  };

  const clearHistory = () => {
    if (confirm("Are you sure you want to clear your local history?")) {
      setHistory([]);
    }
  };

  const analyzeLogs = async () => {
    if (!logs.trim()) return;
    setLoading(true);
    setResult(null);

    try {
      const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      const response = await fetch(`${backendUrl}/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ logs })
      });
      const data = await response.json();
      if (data.error_details || data.error || !response.ok) {
        alert("API Notice: " + (data.error_details || data.error || data.issue || "Failed to analyze"));
      }
      setResult(data);
      
      const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setHistory(prev => [
        { id: Date.now(), title: data.issue || "New Analysis", time: timeStr, status: "Analyzed" },
        ...prev.slice(0, 9) // Keep last 10
      ]);
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const getSeverityBadge = (sev: string) => {
    const s = sev?.toUpperCase() || "MEDIUM";
    if (s === "HIGH") {
      return (
        <div className="px-3 py-1 bg-tertiary text-white text-xs font-black uppercase tracking-widest border-2 border-tertiary rounded shadow-[0_0_15px_rgba(249,18,5,0.4)]">
          {s} SEVERITY
        </div>
      );
    }
    if (s === "LOW") {
      return (
        <div className="px-3 py-1 bg-transparent text-secondary text-xs font-black uppercase tracking-widest border-2 border-secondary rounded">
          {s} SEVERITY
        </div>
      );
    }
    return (
      <div className="px-3 py-1 bg-transparent text-primary text-xs font-black uppercase tracking-widest border-2 border-primary rounded">
        {s} SEVERITY
      </div>
    );
  };

  return (
    <main className="min-h-screen bg-background text-foreground font-body bg-dots flex flex-col items-center pb-20">
      {/* Top Navbar */}
      <header className="w-full h-20 border-b border-surface-border glass-panel z-50 sticky top-0 px-8 flex justify-between items-center">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3 pr-6 border-r border-surface-border">
            <div className="w-10 h-10 bg-primary flex items-center justify-center rounded">
              <span className="material-symbols-outlined text-white">terminal</span>
            </div>
            <h1 className="text-2xl font-black tracking-tight text-white uppercase hidden sm:block">Lumina Core</h1>
          </div>
          <nav className="hidden md:flex gap-6">
            <a href="#" className="text-primary font-bold text-sm tracking-widest uppercase border-b-2 border-primary pb-1">Dashboard</a>
            <a href="#" className="text-muted hover:text-white transition-colors font-bold text-sm tracking-widest uppercase pb-1">Endpoints</a>
            <a href="#" className="text-muted hover:text-white transition-colors font-bold text-sm tracking-widest uppercase pb-1">Integrations</a>
          </nav>
        </div>
        <div className="flex items-center gap-6">
          <div className="hidden sm:flex items-center gap-2 border border-surface-border bg-surface px-4 py-2 rounded">
             <span className="w-2 h-2 rounded-full bg-primary animate-pulse shadow-[0_0_10px_rgba(19,8,255,0.8)]"></span>
             <span className="text-xs font-bold text-muted uppercase tracking-widest">v2.4.1 Online</span>
          </div>
          <div className="w-10 h-10 rounded-full bg-surface-border overflow-hidden border border-primary">
            <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Admin" alt="Admin Avatar" className="w-full h-full object-cover opacity-80" />
          </div>
        </div>
      </header>

      <div className="w-full max-w-[1400px] px-6 py-12 space-y-10">
        
        {/* Hero Section & Info Widgets */}
        <section className="space-y-8">
          <div className="space-y-2">
            <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter">
              AI Diagnostic <span className="text-primary">Engine</span>
            </h2>
            <p className="text-muted max-w-2xl text-lg">
              Insert raw server logs or stack traces below. The agent parses, diagnoses, and constructs remediation protocols asynchronously in real-time.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
             <div className="brutalist-border glass-panel rounded-lg p-5 flex flex-col justify-between">
                <span className="text-xs uppercase tracking-widest text-muted font-bold mb-4">Total Scans Today</span>
                <span className="text-4xl font-black text-white">2,110</span>
                <div className="mt-2 text-xs text-secondary font-bold flex items-center gap-1">
                   <span className="material-symbols-outlined !text-sm">trending_up</span> +14% vs yesterday
                </div>
             </div>
             <div className="brutalist-border glass-panel rounded-lg p-5 flex flex-col justify-between">
                <span className="text-xs uppercase tracking-widest text-muted font-bold mb-4">Engine Accuracy</span>
                <span className="text-4xl font-black text-white">99.4<span className="text-xl">%</span></span>
                <div className="mt-2 text-xs text-muted font-bold flex items-center gap-1">
                   <span className="material-symbols-outlined !text-sm">verified</span> Gemini 2.5 Active
                </div>
             </div>
             <div className="brutalist-border glass-panel rounded-lg p-5 flex flex-col justify-between">
                <span className="text-xs uppercase tracking-widest text-muted font-bold mb-4">Avg Processing Time</span>
                <span className="text-4xl font-black text-white">420<span className="text-xl">ms</span></span>
                <div className="mt-2 text-xs text-primary font-bold flex items-center gap-1">
                   <span className="material-symbols-outlined !text-sm">speed</span> Ultra Low Latency
                </div>
             </div>
             <div className="brutalist-border glass-panel rounded-lg p-5 flex flex-col justify-between hidden md:flex">
                <span className="text-xs uppercase tracking-widest text-muted font-bold mb-4">Active Modules</span>
                <div className="flex gap-2 mt-1">
                   <span className="px-2 py-1 bg-surface-border text-[10px] font-bold uppercase rounded text-muted">Postgres</span>
                   <span className="px-2 py-1 bg-surface-border text-[10px] font-bold uppercase rounded text-muted">Redis</span>
                   <span className="px-2 py-1 bg-surface-border text-[10px] font-bold uppercase rounded text-muted">AWS</span>
                </div>
                <div className="mt-auto text-xs text-white/50 font-bold hover:text-white cursor-pointer transition-colors pt-2">
                   + View All Integrations
                </div>
             </div>
          </div>
        </section>

        {/* Modular Layout for Input + Features */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
           
           <div className="lg:col-span-3 space-y-8">
              {/* Console Input Area */}
              <div className="brutalist-border rounded-xl overflow-hidden glass-panel">
                <div className="bg-surface flex items-center justify-between px-4 py-3 border-b border-surface-border">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-tertiary opacity-80"></div>
                    <div className="w-3 h-3 rounded-full bg-secondary opacity-80"></div>
                    <div className="w-3 h-3 rounded-full bg-primary opacity-80"></div>
                    <span className="ml-4 text-xs font-mono text-muted">terminal / input</span>
                  </div>
                  {/* Hidden file input */}
                  <input 
                    type="file" 
                    accept=".log,.txt,text/plain" 
                    ref={fileInputRef} 
                    onChange={handleFileUpload} 
                    className="hidden" 
                  />
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="text-xs uppercase font-bold tracking-widest text-muted hover:text-white flex items-center gap-1 transition-colors"
                  >
                    <span className="material-symbols-outlined !text-sm">upload_file</span>
                    Upload .log file
                  </button>
                </div>
                <textarea
                  className="w-full h-[256px] focus:h-[350px] bg-transparent text-white font-mono text-sm p-6 focus:outline-none resize-y placeholder:text-surface-border transition-all duration-300"
                  placeholder="[root@cluster] ~/ paste logs, stack traces, or upload a .log file..."
                  value={logs}
                  onChange={(e) => setLogs(e.target.value)}
                />
                <div className="bg-surface border-t border-surface-border p-4 flex justify-between items-center">
                  <span className="text-[10px] md:text-xs text-muted font-mono uppercase flex items-center gap-2">
                     <span className="material-symbols-outlined !text-sm text-primary">analytics</span> Parsing enabled
                  </span>
                  <button
                    disabled={loading || !logs.trim()}
                    onClick={analyzeLogs}
                    className={`px-6 md:px-8 py-3 bg-primary text-white font-black uppercase tracking-wider text-xs md:text-sm flex items-center gap-2 transition-all shadow-[0_4px_14px_0_rgba(19,8,255,0.39)] hover:shadow-[0_6px_20px_rgba(19,8,255,0.5)] hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none`}
                  >
                    {loading ? (
                      <span className="material-symbols-outlined animate-spin text-base">sync</span>
                    ) : (
                      <span className="material-symbols-outlined text-base">bolt</span>
                    )}
                    {loading ? "Processing..." : "Execute Analysis"}
                  </button>
                </div>
              </div>

              {loading && (
                <div className="brutalist-border glass-panel rounded-xl p-8 animate-pulse text-center space-y-4 border-l-4 border-l-primary">
                  <span className="material-symbols-outlined text-primary text-5xl animate-spin">data_usage</span>
                  <h3 className="text-xl font-bold uppercase tracking-widest text-primary">Diagnosing Anomalies</h3>
                  <p className="text-sm text-muted">Applying machine learning patterns across log structures...</p>
                </div>
              )}

              {result && !loading && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-500">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1">
                      <div className="h-px flex-1 bg-surface-border"></div>
                      <span className="text-muted font-black uppercase text-[10px] tracking-widest">Diagnostic Report</span>
                      <div className="h-px w-8 bg-surface-border"></div>
                    </div>
                    {/* Exoprt Button */}
                    <button 
                      onClick={copyToClipboard}
                      className="ml-4 flex items-center gap-2 px-3 py-1.5 border border-surface-border rounded hover:bg-surface-border hover:text-white transition-colors text-[10px] font-black uppercase tracking-widest text-muted"
                    >
                      <span className="material-symbols-outlined !text-sm">content_copy</span>
                      Export Report
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2 brutalist-border glass-panel rounded-xl p-8 border-t-4 border-t-primary flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start mb-6">
                          <span className="text-primary font-bold text-xs uppercase tracking-widest flex items-center gap-2">
                             <span className="material-symbols-outlined text-sm">warning</span> Detected Issue
                          </span>
                          <div className="flex flex-col gap-2 items-end">
                            {getSeverityBadge(result.severity)}
                            {result.stack_fingerprint && (
                              <div className="px-3 py-1 bg-surface-border/50 text-white text-[10px] font-mono tracking-widest border border-surface-border rounded">
                                ID: {result.stack_fingerprint}
                              </div>
                            )}
                          </div>
                        </div>
                        <h3 className="text-3xl font-black uppercase tracking-tight mb-8">
                          {result.issue || "Undetermined Issue"}
                        </h3>
                      </div>
                      <div className="space-y-4">
                        <span className="text-muted font-bold text-xs uppercase tracking-widest mb-2 block">Root Cause Hypotheses</span>
                        {(Array.isArray(result.hypotheses) ? result.hypotheses : []).map((hypothesis: any, idx: number) => (
                           <div key={idx} className="bg-surface-border/20 border border-surface-border rounded-lg p-4 ml-2 border-l-2 border-l-primary relative overflow-hidden group">
                              <div className="absolute top-0 right-0 bg-primary/20 text-primary text-[10px] font-black px-2 py-1 rounded-bl-lg border-b border-l border-surface-border z-10">
                                {hypothesis.confidence_score}% CONFIDENCE
                              </div>
                              <h5 className="font-bold text-white mb-2 text-sm pr-16">{hypothesis.root_cause}</h5>
                              <p className="text-white/60 text-xs italic leading-relaxed">{hypothesis.justification}</p>
                           </div>
                        ))}
                      </div>
                    </div>

                    <div className="brutalist-border glass-panel rounded-xl p-8 border-t-4 border-t-secondary relative">
                      <span className="text-secondary font-bold text-xs uppercase tracking-widest flex items-center gap-2 mb-6">
                        <span className="material-symbols-outlined text-sm">build</span> Remediation Protocol
                      </span>
                      <ul className="space-y-5">
                        {(Array.isArray(result.fixes) ? result.fixes : [result.fixes]).map((fix: string, i: number) => (
                          <li key={i} className="flex items-start gap-4">
                            <div className="w-6 h-6 rounded bg-secondary/10 flex items-center justify-center shrink-0 border border-secondary/30">
                              <span className="text-secondary font-mono text-xs font-bold">{i+1}</span>
                            </div>
                            <span className="text-sm text-white/90 leading-relaxed">{fix}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="brutalist-border glass-panel rounded-xl p-8 border-t-4 border-t-tertiary flex flex-col justify-center relative overflow-hidden">
                      <div className="absolute right-[-20%] bottom-[-20%] opacity-5 pointer-events-none">
                        <span className="material-symbols-outlined !text-[200px]">translate</span>
                      </div>
                      <div className="relative z-10">
                        <div className="w-10 h-10 bg-tertiary rounded flex items-center justify-center shadow-[0_0_20px_rgba(249,18,5,0.4)] mb-4">
                          <span className="material-symbols-outlined text-white">psychology</span>
                        </div>
                        <h4 className="text-tertiary font-bold text-xs uppercase tracking-widest mb-3">Layman Definition</h4>
                        <p className="text-lg font-medium text-white italic">
                          "{result.explanation_for_beginner || "N/A"}"
                        </p>
                      </div>
                    </div>

                  </div>
                </div>
              )}
           </div>

           {/* Right Sidebar */}
           <div className="lg:col-span-1 space-y-6">
              
              <div className="brutalist-border glass-panel rounded-xl overflow-hidden">
                 <div className="bg-surface border-b border-surface-border px-4 py-3 flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-widest text-primary flex items-center gap-2">
                       <span className="material-symbols-outlined !text-sm">history</span> Scan History
                    </span>
                    <button 
                      onClick={clearHistory}
                      className="px-2 py-[2px] bg-tertiary/20 text-tertiary hover:bg-tertiary/40 rounded text-[10px] font-bold tracking-widest uppercase transition-colors"
                      title="Clear History"
                    >
                      Clear
                    </button>
                 </div>
                 <div className="p-4 space-y-4">
                    {history.length === 0 && (
                      <div className="text-xs text-muted text-center italic py-2">No past scans yet.</div>
                    )}
                    {history.map((item, idx) => (
                      <div key={idx} className="group cursor-pointer">
                         <div className="flex justify-between items-start mb-1">
                            <span className="text-sm font-bold text-white group-hover:text-primary transition-colors line-clamp-1">{item.title}</span>
                         </div>
                         <div className="flex justify-between items-center text-[10px] uppercase font-bold tracking-widest">
                            <span className={`px-2 py-[2px] rounded border ${item.status === 'Critical' ? 'border-tertiary text-tertiary bg-tertiary/10' : item.status === 'Analyzed' ? 'border-primary text-primary bg-primary/10' : 'border-surface-border text-muted'}`}>
                              {item.status}
                            </span>
                            <span className="text-muted">{item.time}</span>
                         </div>
                      </div>
                    ))}
                 </div>
                 <div className="border-t border-surface-border p-3 text-center">
                    <button className="text-xs text-muted hover:text-white uppercase font-bold tracking-widest transition-colors w-full">View Full Archive</button>
                 </div>
              </div>

              <div className="brutalist-border glass-panel rounded-xl p-5 border-l-4 border-l-secondary">
                 <span className="text-xs font-bold uppercase tracking-widest text-secondary flex items-center gap-2 mb-3">
                    <span className="material-symbols-outlined !text-sm">hub</span> Webhook Integration
                 </span>
                 <p className="text-xs text-muted mb-4">Automatically stream and analyze your Kubernetes or Docker logs via the incoming webhook API.</p>
                 <button className="w-full py-2 bg-transparent border border-secondary text-secondary hover:bg-secondary/10 uppercase font-black text-[10px] tracking-widest rounded transition-colors">
                    Configure Webhook
                 </button>
              </div>

           </div>
        </div>

      </div>
    </main>
  );
}
