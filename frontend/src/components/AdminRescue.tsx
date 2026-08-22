import React, { useEffect, useState } from 'react';
import axios from 'axios';
import type { User, Group, StreakRescueItem, WebcmdLogItem } from '../types';
import { ShieldCheck, CheckCircle2, XCircle, Terminal } from 'lucide-react';

interface AdminRescueProps {
  currentUser: User;
  activeGroup: Group | null;
  onOpenWebcmdLogs: () => void;
}

export const AdminRescue: React.FC<AdminRescueProps> = ({
  currentUser,
  onOpenWebcmdLogs,
}) => {
  const [rescues, setRescues] = useState<StreakRescueItem[]>([]);
  const [webcmdLogs, setWebcmdLogs] = useState<WebcmdLogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<number | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [rescueRes, logsRes] = await Promise.all([
        axios.get('/api/streaks/rescue/list'),
        axios.get('/api/webcmd-logs?limit=5')
      ]);
      setRescues(rescueRes.data || []);
      setWebcmdLogs(logsRes.data || []);
    } catch (err) {
      console.error('Failed to fetch admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleReview = async (rescueId: number, action: 'approve' | 'reject') => {
    setProcessingId(rescueId);
    try {
      await axios.post('/api/streaks/rescue/review', {
        rescue_id: rescueId,
        admin_id: currentUser.id,
        action: action
      });
      await fetchData();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Review action failed.');
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 space-y-8">
      
      {/* Header Banner */}
      <div className="glass-panel rounded-3xl p-8 border border-purple-500/20 bg-gradient-to-r from-slate-900/90 via-slate-900/50 to-purple-950/20 shadow-2xl">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start space-x-2 text-purple-400 text-xs font-bold uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4" />
              <span>Admin & Control Panel</span>
            </div>
            <h2 className="text-3xl font-black text-white">Platform Administration</h2>
            <p className="text-slate-400 text-sm">
              Logged in as <span className="text-purple-400 font-bold">{currentUser.display_name}</span> ({currentUser.is_admin ? 'Admin' : 'Member'}). Review pending streak rescues & system activity.
            </p>
          </div>

          <button
            onClick={onOpenWebcmdLogs}
            className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-emerald-500/30 text-emerald-400 text-xs font-mono transition-all shrink-0"
          >
            <Terminal className="w-4 h-4" />
            <span>Inspect WebCMD Logs</span>
          </button>
        </div>
      </div>

      {/* Streak Rescue Requests Management Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-black text-white flex items-center space-x-2">
            <span>Pending Streak Rescue Requests</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-mono">
              {rescues.length}
            </span>
          </h3>
        </div>

        {loading ? (
          <div className="glass-panel p-8 rounded-2xl text-center text-slate-400 text-sm">
            Loading rescue requests...
          </div>
        ) : rescues.length === 0 ? (
          <div className="glass-panel p-8 rounded-2xl text-center text-slate-400 text-sm">
            No streak rescue requests pending.
          </div>
        ) : (
          <div className="space-y-3">
            {rescues.map((item) => (
              <div
                key={item.id}
                className="glass-card p-5 rounded-2xl border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
              >
                <div className="flex items-start space-x-4 min-w-0">
                  <img
                    src={item.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${item.username}`}
                    alt={item.display_name}
                    className="w-12 h-12 rounded-full bg-slate-800 border border-slate-700 shrink-0"
                  />
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-white text-base">{item.display_name}</span>
                      <span className="text-xs text-slate-400">@{item.username}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono">
                        {item.group_name}
                      </span>
                    </div>
                    <p className="text-xs text-amber-300 bg-amber-500/10 px-3 py-1.5 rounded-lg border border-amber-500/20 italic">
                      "{item.reason}"
                    </p>
                    <div className="text-[11px] text-slate-500 flex items-center space-x-3 pt-0.5">
                      <span>Target Date: <strong className="text-slate-300">{item.target_date}</strong></span>
                      <span>Requested: <strong className="text-slate-300">{new Date(item.created_at).toLocaleDateString()}</strong></span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2 shrink-0 self-end md:self-center">
                  {item.status === 'pending' ? (
                    <>
                      <button
                        onClick={() => handleReview(item.id, 'approve')}
                        disabled={processingId === item.id || !currentUser.is_admin}
                        className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold transition-all disabled:opacity-50"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Approve Rescue</span>
                      </button>

                      <button
                        onClick={() => handleReview(item.id, 'reject')}
                        disabled={processingId === item.id || !currentUser.is_admin}
                        className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 text-xs font-bold transition-all disabled:opacity-50"
                      >
                        <XCircle className="w-4 h-4" />
                        <span>Reject</span>
                      </button>
                    </>
                  ) : (
                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                      item.status === 'approved' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-red-500/20 text-red-400 border border-red-500/30'
                    }`}>
                      {item.status}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-lg font-bold text-slate-200 flex items-center space-x-2">
            <Terminal className="w-4 h-4 text-emerald-400" />
            <span>Recent WebCMD CLI Activity Log</span>
          </h4>
          <button
            onClick={onOpenWebcmdLogs}
            className="text-xs text-emerald-400 hover:underline font-mono"
          >
            View Full Log Modal
          </button>
        </div>

        <div className="space-y-2 font-mono text-xs">
          {webcmdLogs.map((log) => (
            <div
              key={log.id}
              className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex items-center justify-between gap-4"
            >
              <div className="truncate text-slate-300">
                <span className="text-emerald-400">$</span> {log.command}
              </div>
              <div className="flex items-center space-x-3 shrink-0 text-slate-500">
                <span className="text-emerald-400 font-bold">{log.duration_ms}ms</span>
                <span>STATUS {log.status_code}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
