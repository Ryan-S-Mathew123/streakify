import React, { useState } from 'react';
import type { User, Group } from '../types';
import { Flame, Music2, Trophy, Compass, BarChart3, ShieldCheck, Terminal, Plus, Users } from 'lucide-react';

interface NavbarProps {
  currentUser: User;
  groups: Group[];
  activeGroup: Group | null;
  activeTab: string;
  groupStreak: number;
  onSelectGroup: (group: Group) => void;
  onSelectTab: (tab: string) => void;
  onOpenWebcmdLogs: () => void;
  onOpenAuthModal: () => void;
  onOpenGroupModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  groups,
  activeGroup,
  activeTab,
  groupStreak,
  onSelectGroup,
  onSelectTab,
  onOpenWebcmdLogs,
  onOpenAuthModal,
  onOpenGroupModal,
}) => {
  const [groupDropdownOpen, setGroupDropdownOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 glass-panel border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 p-0.5 shadow-lg shadow-emerald-500/20">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Music2 className="w-5 h-5 text-emerald-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-xl tracking-tight text-white">SongStreak</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
                  WebCMD Powered
                </span>
              </div>
            </div>
          </div>

          <div className="relative">
            <button
              onClick={() => setGroupDropdownOpen(!groupDropdownOpen)}
              className="flex items-center space-x-3 px-3 py-1.5 rounded-xl glass-card hover:bg-slate-800/60 transition-all text-sm"
            >
              <Users className="w-4 h-4 text-emerald-400" />
              <span className="font-semibold text-slate-200">{activeGroup?.name || "Select Group"}</span>
              <span className="text-xs px-2 py-0.5 rounded-md bg-orange-500/15 text-orange-400 border border-orange-500/30 flex items-center space-x-1 font-bold">
                <Flame className="w-3.5 h-3.5 fill-orange-400 animate-flame" />
                <span>{groupStreak}d</span>
              </span>
            </button>

            {groupDropdownOpen && (
              <div className="absolute left-0 mt-2 w-64 glass-panel rounded-xl shadow-2xl p-2 z-50 border border-slate-700">
                <div className="text-xs font-semibold text-slate-400 px-3 py-1.5 uppercase tracking-wider">Your Groups</div>
                {groups.map((g) => (
                  <button
                    key={g.id}
                    onClick={() => {
                      onSelectGroup(g);
                      setGroupDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm flex items-center justify-between transition-colors ${
                      activeGroup?.id === g.id ? 'bg-emerald-500/20 text-emerald-300 font-semibold' : 'text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <span>{g.name}</span>
                    <span className="text-xs text-slate-500 font-mono">{g.invite_code}</span>
                  </button>
                ))}
                <div className="border-t border-slate-800 my-1"></div>
                <button
                  onClick={() => {
                    onOpenGroupModal();
                    setGroupDropdownOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 rounded-lg text-sm text-emerald-400 hover:bg-emerald-500/10 flex items-center space-x-2 font-medium"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create / Join Group</span>
                </button>
              </div>
            )}
          </div>

          <nav className="hidden md:flex items-center space-x-1 bg-slate-900/60 p-1 rounded-xl border border-slate-800">
            {[
              { id: 'feed', label: 'Feed', icon: Music2 },
              { id: 'search', label: 'Submit Song', icon: Plus },
              { id: 'discover', label: 'Discover', icon: Compass },
              { id: 'leaderboard', label: 'Leaderboard', icon: Trophy },
              { id: 'stats', label: 'Stats', icon: BarChart3 },
              { id: 'admin', label: 'Admin', icon: ShieldCheck },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => onSelectTab(tab.id)}
                  className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20 font-semibold'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>

          <div className="flex items-center space-x-3">
            <button
              onClick={onOpenWebcmdLogs}
              className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-emerald-500/30 hover:border-emerald-400 text-emerald-400 hover:bg-emerald-500/10 text-xs font-mono transition-all shadow-inner"
              title="Inspect live WebCMD CLI execution logs"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              <Terminal className="w-3.5 h-3.5" />
              <span>WebCMD Log</span>
            </button>

            <button
              onClick={onOpenAuthModal}
              className="flex items-center space-x-2 px-2.5 py-1 rounded-xl glass-card hover:border-emerald-500/50 transition-all"
            >
              <img
                src={currentUser.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUser.username}`}
                alt={currentUser.display_name}
                className="w-7 h-7 rounded-full bg-slate-800 border border-slate-700"
              />
              <span className="text-sm font-semibold text-slate-200 hidden lg:inline">{currentUser.display_name}</span>
            </button>
          </div>

        </div>
      </div>
    </header>
  );
};
