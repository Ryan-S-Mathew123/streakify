import React, { useState } from 'react';
import axios from 'axios';
import type { LeaderboardUser, User, Group } from '../types';
import { Trophy, Flame, Award, Heart, HelpCircle, Send, CheckCircle2 } from 'lucide-react';

interface LeaderboardProps {
  leaderboard: LeaderboardUser[];
  groupStreak: number;
  currentUser: User;
  activeGroup: Group | null;
}

export const Leaderboard: React.FC<LeaderboardProps> = ({
  leaderboard,
  groupStreak,
  currentUser,
  activeGroup,
}) => {
  const [rescueModalOpen, setRescueModalOpen] = useState(false);
  const [reason, setReason] = useState('');
  const [appliedSuccess, setAppliedSuccess] = useState(false);
  const [submittingRescue, setSubmittingRescue] = useState(false);

  const handleApplyRescue = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim() || !activeGroup) return;

    setSubmittingRescue(true);
    try {
      await axios.post('/api/streaks/rescue/apply', {
        user_id: currentUser.id,
        group_id: activeGroup.id,
        reason: reason.trim()
      });
      setAppliedSuccess(true);
    } catch (err) {
      console.error(err);
    } finally {
      setSubmittingRescue(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 space-y-6">
      
      <div className="glass-panel rounded-3xl p-8 border border-amber-500/20 bg-gradient-to-r from-slate-900/90 via-slate-900/50 to-amber-950/20 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start space-x-2 text-amber-400 text-xs font-bold uppercase tracking-wider">
              <Trophy className="w-4 h-4" />
              <span>Group Rankings</span>
            </div>
            <h2 className="text-3xl font-black text-white">{activeGroup?.name || "Group"} Leaderboard</h2>
            <p className="text-slate-400 text-sm">
              Keep your daily streak alive to top the rankings and grow the group streak!
            </p>
          </div>

          <div className="bg-slate-950/80 px-6 py-4 rounded-2xl border border-slate-800 text-center shadow-lg">
            <div className="text-xs text-slate-400 font-semibold uppercase">Group Streak</div>
            <div className="text-3xl font-black text-orange-400 flex items-center justify-center space-x-1.5 mt-0.5">
              <Flame className="w-7 h-7 fill-orange-400 animate-flame" />
              <span>{groupStreak} Days</span>
            </div>
          </div>
        </div>
      </div>

      <div className="glass-card rounded-2xl p-4 border border-slate-800 flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/30 flex items-center justify-center text-orange-400">
            <HelpCircle className="w-5 h-5" />
          </div>
          <div>
            <div className="text-sm font-bold text-slate-200">Missed a day? Apply for Streak Rescue</div>
            <div className="text-xs text-slate-400">Submit a reason for admins to review and restore your streak.</div>
          </div>
        </div>
        <button
          onClick={() => {
            setRescueModalOpen(true);
            setAppliedSuccess(false);
            setReason('');
          }}
          className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-semibold transition-all"
        >
          Apply for Rescue
        </button>
      </div>

      <div className="space-y-3">
        {leaderboard.map((item) => {
          let rankBadge = null;
          if (item.rank === 1) rankBadge = <span className="text-2xl">🥇</span>;
          else if (item.rank === 2) rankBadge = <span className="text-2xl">🥈</span>;
          else if (item.rank === 3) rankBadge = <span className="text-2xl">🥉</span>;
          else rankBadge = <span className="text-sm font-mono text-slate-500 font-bold">#{item.rank}</span>;

          const isCurrentUser = item.user_id === currentUser.id;

          return (
            <div
              key={item.user_id}
              className={`glass-card p-4 rounded-2xl flex items-center justify-between gap-4 transition-all ${
                isCurrentUser ? 'border-emerald-500/40 bg-emerald-950/20' : ''
              }`}
            >
              <div className="flex items-center space-x-4">
                <div className="w-8 text-center shrink-0">{rankBadge}</div>
                
                <img
                  src={item.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${item.username}`}
                  alt={item.display_name}
                  className="w-12 h-12 rounded-full bg-slate-800 border border-slate-700 shrink-0"
                />

                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-white text-base">{item.display_name}</span>
                    {isCurrentUser && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-semibold">
                        You
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-slate-400">@{item.username}</div>
                </div>
              </div>

              <div className="flex items-center space-x-6">
                <div className="text-right">
                  <div className="flex items-center justify-end space-x-1 text-orange-400 font-extrabold text-lg">
                    <Flame className="w-4 h-4 fill-orange-400 animate-flame" />
                    <span>{item.streak}d</span>
                  </div>
                  <div className="text-[11px] text-slate-500">Streak</div>
                </div>

                <div className="text-right hidden sm:block">
                  <div className="text-slate-200 font-bold text-sm flex items-center justify-end space-x-1">
                    <Award className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{item.total_submissions}</span>
                  </div>
                  <div className="text-[11px] text-slate-500">Submissions</div>
                </div>

                <div className="text-right hidden sm:block">
                  <div className="text-slate-200 font-bold text-sm flex items-center justify-end space-x-1">
                    <Heart className="w-3.5 h-3.5 text-pink-400" />
                    <span>{item.reactions_received}</span>
                  </div>
                  <div className="text-[11px] text-slate-500">Reactions</div>
                </div>
              </div>

            </div>
          );
        })}
      </div>

      {rescueModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-panel rounded-3xl p-6 max-w-md w-full space-y-5 border border-slate-700 shadow-2xl">
            <h3 className="text-xl font-bold text-white">Apply for Streak Rescue</h3>
            
            {appliedSuccess ? (
              <div className="text-center py-6 space-y-3">
                <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
                <div className="text-lg font-bold text-white">Request Submitted!</div>
                <p className="text-xs text-slate-400">
                  Your streak rescue application has been sent to the group admin.
                </p>
                <button
                  onClick={() => setRescueModalOpen(false)}
                  className="px-6 py-2 rounded-xl bg-emerald-500 text-slate-950 font-bold text-sm"
                >
                  Close
                </button>
              </div>
            ) : (
              <form onSubmit={handleApplyRescue} className="space-y-4">
                <p className="text-xs text-slate-400">
                  Provide a valid reason why you missed yesterday's Song of the Day submission.
                </p>

                <div>
                  <textarea
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="e.g. Traveled without cellular service all day..."
                    rows={3}
                    className="w-full p-3 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm focus:outline-none focus:border-emerald-500"
                    required
                  />
                </div>

                <div className="flex items-center justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setRescueModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submittingRescue || !reason.trim()}
                    className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center space-x-1.5"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Submit Application</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

    </div>
  );
};
