import React, { useState } from 'react';
import axios from 'axios';
import type { User } from '../types';
import { X, Check, Plus, UserPlus, Shield } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  currentUser: User;
  allUsers: User[];
  onClose: () => void;
  onSwitchUser: (user: User) => void;
  onGroupCreatedOrJoined: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  currentUser,
  allUsers,
  onClose,
  onSwitchUser,
  onGroupCreatedOrJoined,
}) => {
  const [activeTab, setActiveTab] = useState<'users' | 'group'>('users');
  const [customUsername, setCustomUsername] = useState('');
  const [groupName, setGroupName] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleCustomLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const usernameClean = customUsername.trim();
    if (!usernameClean) return;
    setErrorMsg('');
    try {
      const res = await axios.post('/api/auth/login', null, {
        params: { username: usernameClean }
      });
      onSwitchUser(res.data);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.response?.data?.detail || 'Login failed.');
    }
  };

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!groupName.trim()) return;
    setErrorMsg('');
    try {
      await axios.post('/api/groups/create', {
        name: groupName.trim(),
        user_id: currentUser.id
      });
      onGroupCreatedOrJoined();
      onClose();
    } catch (err: any) {
      setErrorMsg(err.response?.data?.detail || 'Group creation failed.');
    }
  };

  const handleJoinGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteCode.trim()) return;
    setErrorMsg('');
    try {
      await axios.post('/api/groups/join', {
        invite_code: inviteCode.trim(),
        user_id: currentUser.id
      });
      onGroupCreatedOrJoined();
      onClose();
    } catch (err: any) {
      setErrorMsg(err.response?.data?.detail || 'Failed to join group.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="glass-panel rounded-3xl max-w-md w-full p-6 space-y-6 border border-slate-700 shadow-2xl">
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setActiveTab('users')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'users' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400 hover:text-white'
              }`}
            >
              Switch Account
            </button>
            <button
              onClick={() => setActiveTab('group')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'group' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400 hover:text-white'
              }`}
            >
              Group Settings
            </button>
          </div>

          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMsg && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-xs p-3 rounded-xl">
            {errorMsg}
          </div>
        )}

        {activeTab === 'users' && (
          <div className="space-y-5">
            <div className="space-y-1">
              <h4 className="text-lg font-bold text-white">Select Active User</h4>
              <p className="text-xs text-slate-400">Quickly switch profiles for testing friend interactions.</p>
            </div>

            <div className="space-y-2">
              {allUsers.map((u) => {
                const isActive = u.id === currentUser.id;
                return (
                  <button
                    key={u.id}
                    onClick={() => {
                      onSwitchUser(u);
                      onClose();
                    }}
                    className={`w-full flex items-center justify-between p-3 rounded-xl transition-all border ${
                      isActive
                        ? 'bg-emerald-500/20 border-emerald-500/50 text-white'
                        : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <img
                        src={u.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.username}`}
                        alt={u.display_name}
                        className="w-9 h-9 rounded-full bg-slate-800 border border-slate-700"
                      />
                      <div className="text-left">
                        <div className="font-bold text-sm flex items-center space-x-1">
                          <span>{u.display_name}</span>
                          {u.is_admin && <Shield className="w-3.5 h-3.5 text-purple-400" />}
                        </div>
                        <div className="text-[11px] text-slate-400">@{u.username}</div>
                      </div>
                    </div>
                    {isActive && <Check className="w-5 h-5 text-emerald-400" />}
                  </button>
                );
              })}
            </div>

            <form onSubmit={handleCustomLogin} className="pt-2 border-t border-slate-800 space-y-3">
              <label className="text-xs text-slate-400 font-semibold block">Or Login as Custom User:</label>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={customUsername}
                  onChange={(e) => setCustomUsername(e.target.value)}
                  placeholder="Enter username..."
                  className="flex-1 px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-emerald-500"
                />
                <button
                  type="submit"
                  disabled={!customUsername.trim()}
                  className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs"
                >
                  Login
                </button>
              </div>
            </form>
          </div>
        )}

        {activeTab === 'group' && (
          <div className="space-y-6">
            <form onSubmit={handleCreateGroup} className="space-y-3">
              <div className="text-sm font-bold text-white flex items-center space-x-2">
                <Plus className="w-4 h-4 text-emerald-400" />
                <span>Create a New Private Group</span>
              </div>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  placeholder="Group Name (e.g. Chill Beats Circle)..."
                  className="flex-1 px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-emerald-500"
                />
                <button
                  type="submit"
                  disabled={!groupName.trim()}
                  className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shrink-0"
                >
                  Create
                </button>
              </div>
            </form>

            <form onSubmit={handleJoinGroup} className="pt-4 border-t border-slate-800 space-y-3">
              <div className="text-sm font-bold text-white flex items-center space-x-2">
                <UserPlus className="w-4 h-4 text-indigo-400" />
                <span>Join Group via Invite Code</span>
              </div>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={inviteCode}
                  onChange={(e) => setInviteCode(e.target.value)}
                  placeholder="Invite Code (e.g. SONG-8X29)..."
                  className="flex-1 px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs font-mono uppercase focus:outline-none focus:border-indigo-500"
                />
                <button
                  type="submit"
                  disabled={!inviteCode.trim()}
                  className="px-4 py-2 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white font-bold text-xs shrink-0"
                >
                  Join
                </button>
              </div>
            </form>
          </div>
        )}

      </div>
    </div>
  );
};
