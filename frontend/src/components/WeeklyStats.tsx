import React, { useEffect, useState } from 'react';
import axios from 'axios';
import type { User, Group } from '../types';
import { BarChart3, Disc, Music, UserCheck, Flame, Heart, Sparkles } from 'lucide-react';

interface WeeklyStatsProps {
  currentUser: User;
  activeGroup: Group | null;
}

interface StatsData {
  period: string;
  songs_submitted: number;
  artists_discovered: number;
  unique_albums: number;
  genres_explored: number;
  most_liked_song: {
    title: string;
    artists: string;
    album_image_url: string;
    submitted_by: string;
    reaction_count: number;
  };
  most_popular_artist: string;
  group_favorite: string;
}

export const WeeklyStats: React.FC<WeeklyStatsProps> = ({ currentUser, activeGroup }) => {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      if (!activeGroup) return;
      setLoading(true);
      try {
        const res = await axios.get(`/api/discovery/weekly-stats/${activeGroup.id}/${currentUser.id}`);
        setStats(res.data);
      } catch (err) {
        console.error('Failed to fetch weekly stats:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [activeGroup, currentUser]);

  if (loading || !stats) {
    return (
      <div className="max-w-4xl mx-auto py-12 text-center text-slate-400">
        Loading weekly music stats...
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 space-y-6">
      
      <div className="glass-panel rounded-3xl p-8 border border-emerald-500/20 bg-gradient-to-r from-slate-900/90 via-slate-900/50 to-teal-950/20 shadow-2xl">
        <div className="flex items-center space-x-2 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-1">
          <BarChart3 className="w-4 h-4" />
          <span>Weekly Recap · {stats.period}</span>
        </div>
        <h2 className="text-3xl font-black text-white">Your Week in Music</h2>
        <p className="text-slate-400 text-sm">
          Music breakdown for <span className="text-emerald-400 font-semibold">{currentUser.display_name}</span> in <span className="text-white font-semibold">{activeGroup?.name}</span>.
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="glass-card p-5 rounded-2xl border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-emerald-400">
            <Music className="w-5 h-5" />
            <span className="text-xs text-slate-500 font-mono">7 Days</span>
          </div>
          <div className="text-3xl font-black text-white">{stats.songs_submitted}</div>
          <div className="text-xs text-slate-400 font-medium">Songs Submitted</div>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-indigo-400">
            <UserCheck className="w-5 h-5" />
            <span className="text-xs text-slate-500 font-mono">Unique</span>
          </div>
          <div className="text-3xl font-black text-white">{stats.artists_discovered}</div>
          <div className="text-xs text-slate-400 font-medium">Artists Discovered</div>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-amber-400">
            <Disc className="w-5 h-5" />
            <span className="text-xs text-slate-500 font-mono">Albums</span>
          </div>
          <div className="text-3xl font-black text-white">{stats.unique_albums}</div>
          <div className="text-xs text-slate-400 font-medium">Albums Shared</div>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-pink-400">
            <Sparkles className="w-5 h-5" />
            <span className="text-xs text-slate-500 font-mono">Genres</span>
          </div>
          <div className="text-3xl font-black text-white">{stats.genres_explored}</div>
          <div className="text-xs text-slate-400 font-medium">Genres Explored</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass-card p-6 rounded-3xl border border-slate-800 space-y-4">
          <div className="flex items-center space-x-2 text-pink-400 text-xs font-bold uppercase tracking-wider">
            <Heart className="w-4 h-4 fill-pink-400" />
            <span>Most Liked Song of the Week</span>
          </div>

          <div className="flex items-center space-x-4 bg-slate-950/60 p-4 rounded-2xl border border-slate-800">
            <img
              src={stats.most_liked_song.album_image_url || "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=200&h=200&fit=crop"}
              alt={stats.most_liked_song.title}
              className="w-20 h-20 object-cover rounded-xl shadow-md border border-slate-800 shrink-0"
            />
            <div className="min-w-0">
              <h4 className="font-extrabold text-white text-lg truncate">{stats.most_liked_song.title}</h4>
              <p className="text-sm font-semibold text-emerald-400 truncate">{stats.most_liked_song.artists}</p>
              <p className="text-xs text-slate-400 mt-1">
                Submitted by <span className="text-slate-200 font-medium">{stats.most_liked_song.submitted_by}</span>
              </p>
              <div className="inline-flex items-center space-x-1 text-xs text-pink-400 font-bold mt-1">
                <Heart className="w-3.5 h-3.5 fill-pink-400" />
                <span>{stats.most_liked_song.reaction_count} reactions</span>
              </div>
            </div>
          </div>
        </div>

        <div className="glass-card p-6 rounded-3xl border border-slate-800 space-y-4">
          <div className="flex items-center space-x-2 text-emerald-400 text-xs font-bold uppercase tracking-wider">
            <Flame className="w-4 h-4 fill-emerald-400" />
            <span>Group Music Trends</span>
          </div>

          <div className="space-y-3">
            <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 flex items-center justify-between">
              <span className="text-xs text-slate-400 font-medium">Most Popular Artist</span>
              <span className="text-sm font-bold text-white bg-slate-900 px-3 py-1 rounded-lg border border-slate-700">
                {stats.most_popular_artist}
              </span>
            </div>

            <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 flex items-center justify-between">
              <span className="text-xs text-slate-400 font-medium">Group Favorite</span>
              <span className="text-sm font-bold text-emerald-400 bg-slate-900 px-3 py-1 rounded-lg border border-slate-700">
                {stats.group_favorite}
              </span>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};
