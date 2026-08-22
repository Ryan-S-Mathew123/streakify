import React, { useEffect, useState } from 'react';
import axios from 'axios';
import type { WebcmdLogItem } from '../types';
import { Terminal, X, RefreshCw, CheckCircle2, Cpu, Code } from 'lucide-react';

interface WebcmdObservabilityProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WebcmdObservability: React.FC<WebcmdObservabilityProps> = ({ isOpen, onClose }) => {
  const [logs, setLogs] = useState<WebcmdLogItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedLog, setSelectedLog] = useState<WebcmdLogItem | null>(null);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/webcmd-logs?limit=30');
      setLogs(res.data || []);
      if (res.data && res.data.length > 0 && !selectedLog) {
        setSelectedLog(res.data[0]);
      }
    } catch (err) {
      console.error('Failed to fetch WebCMD logs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchLogs();
      const interval = setInterval(fetchLogs, 4000);
      return () => clearInterval(interval);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="glass-panel rounded-3xl max-w-5xl w-full h-[85vh] flex flex-col border border-emerald-500/30 shadow-2xl overflow-hidden">
        
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/90">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Terminal className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-extrabold text-xl text-white">WebCMD Activity Log & Observability</h3>
                <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-mono">
                  Live Stream
                </span>
              </div>
              <p className="text-xs text-slate-400">Real-time CLI subprocess execution logs powering Spotify song discovery.</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={fetchLogs}
              className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
              title="Refresh logs"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex-1 flex flex-col md:flex-row min-h-0 divide-y md:divide-y-0 md:divide-x divide-slate-800">
          
          <div className="w-full md:w-5/12 overflow-y-auto p-3 space-y-2 bg-slate-950/50">
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-2 py-1">
              Execution History ({logs.length})
            </div>

            {logs.map((log) => {
              const isSelected = selectedLog?.id === log.id;
              return (
                <button
                  key={log.id}
                  onClick={() => setSelectedLog(log)}
                  className={`w-full text-left p-3 rounded-xl transition-all border font-mono text-xs ${
                    isSelected
                      ? 'bg-emerald-500/15 border-emerald-500/50 text-slate-100 shadow-md'
                      : 'bg-slate-900/60 border-slate-800/80 text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-emerald-400 flex items-center space-x-1">
                      <Cpu className="w-3.5 h-3.5" />
                      <span>Query: "{log.query}"</span>
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold">
                      {log.duration_ms}ms
                    </span>
                  </div>
                  <div className="truncate text-[11px] text-slate-400 mb-1">
                    {log.command}
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-slate-500">
                    <span>EXIT CODE: {log.status_code}</span>
                    <span>{new Date(log.timestamp).toLocaleTimeString()}</span>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="flex-1 flex flex-col overflow-y-auto p-5 space-y-4 bg-slate-900/30">
            {selectedLog ? (
              <>
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="space-y-0.5">
                    <div className="text-xs text-slate-400 uppercase font-bold tracking-wider">Log Record #{selectedLog.id}</div>
                    <div className="text-lg font-black text-white font-mono">
                      Query: <span className="text-emerald-400">"{selectedLog.query}"</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs font-mono font-bold flex items-center space-x-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Code 0 (OK)</span>
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 font-mono text-xs">
                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                    <div className="text-slate-500 text-[10px]">EXECUTION TIME</div>
                    <div className="text-emerald-400 font-bold text-base">{selectedLog.duration_ms} ms</div>
                  </div>
                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                    <div className="text-slate-500 text-[10px]">SUBPROCESS EXIT</div>
                    <div className="text-slate-200 font-bold text-base">{selectedLog.status_code}</div>
                  </div>
                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 col-span-2 sm:col-span-1">
                    <div className="text-slate-500 text-[10px]">TIMESTAMP</div>
                    <div className="text-slate-300 text-xs mt-1">{new Date(selectedLog.timestamp).toLocaleTimeString()}</div>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="text-xs text-slate-400 font-semibold flex items-center space-x-1">
                    <Code className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Executed CLI Command:</span>
                  </div>
                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 font-mono text-xs text-emerald-300 break-all select-all">
                    $ {selectedLog.command}
                  </div>
                </div>

                <div className="flex-1 flex flex-col space-y-1 min-h-0">
                  <div className="text-xs text-slate-400 font-semibold">WebCMD Stdout Response Payload:</div>
                  <pre className="flex-1 p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-slate-300 overflow-auto whitespace-pre-wrap">
                    {selectedLog.output_preview || "No stdout output captured."}
                  </pre>
                </div>
              </>
            ) : (
              <div className="text-center text-slate-500 my-auto">Select a log entry to inspect.</div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};
