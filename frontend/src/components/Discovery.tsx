import React, { startTransition, useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import type { User, Group, Song } from '../types';
import { Compass, Sparkles, RefreshCw } from 'lucide-react';

interface DiscoveryProps {
  currentUser: User;
  activeGroup: Group | null;
}

interface RecommendedSong extends Song {
  recommended_because: string;
}

export const Discovery: React.FC<DiscoveryProps> = ({ currentUser, activeGroup }) => {
  const [loading, setLoading] = useState(true);
  const [topArtists, setTopArtists] = useState<string[]>([]);
  const [recommendations, setRecommendations] = useState<RecommendedSong[]>([]);

  const fetchDiscoveryData = useCallback(async () => {
    if (!activeGroup) return;
    startTransition(() => setLoading(true));
    try {
      const res = await axios.get(`/api/discovery/friends/${activeGroup.id}/${currentUser.id}`);
      startTransition(() => {
        setTopArtists(res.data.top_friend_artists || []);
        setRecommendations(res.data.recommendations || []);
      });
    } catch (err) {
      console.error('Failed to fetch discovery recommendations:', err);
    } finally {
      startTransition(() => setLoading(false));
    }
  }, [activeGroup, currentUser]);

  useEffect(() => {
    void fetchDiscoveryData();
  }, [fetchDiscoveryData]);

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 space-y-6">
      
      <div className="glass-panel rounded-3xl p-8 border border-indigo-500/20 bg-gradient-to-r from-slate-900/90 via-slate-900/50 to-indigo-950/20 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start space-x-2 text-indigo-400 text-xs font-bold uppercase tracking-wider">
              <Compass className="w-4 h-4" />
              <span>Smart Recommendation Engine</span>
            </div>
            <h2 className="text-3xl font-black text-white">Discover From My Friends</h2>
            <p className="text-slate-400 text-sm max-w-xl">
              Builds suggestions from the artists your friends have picked in <span className="text-indigo-400 font-semibold">{activeGroup?.name}</span>.
            </p>
          </div>

          <button
            onClick={fetchDiscoveryData}
            disabled={loading}
            className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-semibold transition-all shrink-0"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh Discovery</span>
          </button>
        </div>
      </div>

      {topArtists.length > 0 && (
        <div className="glass-card p-4 rounded-2xl border border-slate-800 flex items-center space-x-3 flex-wrap gap-y-2">
          <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Your friends listen to:</span>
          {topArtists.map((artist) => (
            <span
              key={artist}
              className="px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/30 text-xs font-semibold flex items-center space-x-1"
            >
              <Sparkles className="w-3 h-3 text-indigo-400" />
              <span>{artist}</span>
            </span>
          ))}
        </div>
      )}

      {loading ? (
        <div className="glass-panel p-12 rounded-3xl text-center text-slate-400 space-y-3">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto text-indigo-400" />
            <p className="text-sm">Finding songs connected to your friends’ recent picks...</p>
        </div>
      ) : recommendations.length === 0 ? (
        <div className="glass-panel p-12 rounded-3xl text-center text-slate-400">
          No new recommendations found at this moment.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {recommendations.map((rec, idx) => (
            <div
              key={rec.catalog_id || idx}
              className="glass-card p-4 rounded-2xl flex items-center space-x-4 border border-slate-800/80 hover:border-indigo-500/30 transition-all group"
            >
              <img
                src={rec.album_image_url || "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=200&h=200&fit=crop"}
                alt={rec.title}
                className="w-20 h-20 object-cover rounded-xl shadow-md border border-slate-800 shrink-0 group-hover:scale-105 transition-transform"
              />

              <div className="flex-1 min-w-0 space-y-1">
                <div className="text-[10px] uppercase font-bold text-indigo-400 truncate">
                  {rec.recommended_because}
                </div>
                <h4 className="font-extrabold text-white text-base truncate group-hover:text-indigo-300 transition-colors">
                  {rec.title}
                </h4>
                <p className="text-xs font-medium text-emerald-400 truncate">{rec.artists}</p>
                
                <span className="inline-flex items-center text-[11px] text-slate-400 pt-1">A friend-favorite artist</span>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
};
