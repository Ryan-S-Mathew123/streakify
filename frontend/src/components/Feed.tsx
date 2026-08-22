import React, { useState } from "react";
import type { FeedItem, User, Group } from "../types";
import { Flame, ExternalLink, Play, Lock, CheckCircle2 } from "lucide-react";

interface FeedProps {
  feedItems: FeedItem[];
  currentUser: User;
  activeGroup: Group | null;
  hasSubmittedToday: boolean;
  onToggleReaction: (id: number, emoji: string) => void;
  onNavigateToSubmit: () => void;
}

const EMOJIS = ["❤️", "🔥", "😭", "😂", "🤮"];

export const Feed: React.FC<FeedProps> = ({ feedItems, activeGroup, hasSubmittedToday, onToggleReaction, onNavigateToSubmit }) => {
  const [locked, setLocked] = useState(false);
  const hidden = locked && !hasSubmittedToday;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* Banner */}
      <div style={{
        background: "linear-gradient(135deg, #1a3a2a 0%, #0f2318 100%)",
        borderRadius: 12, padding: "28px 32px",
        display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap",
      }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--sp-green)", marginBottom: 6 }}>
            Today's Theme
          </div>
          <h2 style={{ margin: 0, fontSize: 28, fontWeight: 900, letterSpacing: "-0.02em" }}>
            {activeGroup?.theme_of_day || "🎸 Your favourite guitar song"}
          </h2>
          <p style={{ margin: "6px 0 0", fontSize: 13, color: "var(--sp-subdued)" }}>
            {activeGroup?.name || "Music Circle"} · Submit to keep the group streak alive
          </p>
        </div>
        {hasSubmittedToday ? (
          <div style={{ display: "flex", alignItems: "center", gap: 8, background: "rgba(30,215,96,0.12)", border: "1px solid rgba(30,215,96,0.25)", borderRadius: "500px", padding: "10px 20px" }}>
            <CheckCircle2 size={16} color="var(--sp-green)" />
            <span style={{ fontSize: 14, fontWeight: 700, color: "var(--sp-green)" }}>Submitted Today</span>
          </div>
        ) : (
          <button onClick={onNavigateToSubmit} className="sp-btn-primary">
            Submit Song
          </button>
        )}
      </div>

      {/* Controls row */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <h3 style={{ margin: 0, fontSize: 20, fontWeight: 800, letterSpacing: "-0.01em" }}>
          Today's Picks
          <span style={{ marginLeft: 10, fontSize: 12, fontWeight: 600, color: "var(--sp-subdued)", background: "var(--sp-elevated)", borderRadius: 500, padding: "2px 10px" }}>
            {feedItems.length} songs
          </span>
        </h3>
        <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: 13, color: "var(--sp-subdued)", userSelect: "none" }}>
          <input type="checkbox" checked={locked} onChange={e => setLocked(e.target.checked)}
            style={{ accentColor: "var(--sp-green)", width: 14, height: 14 }} />
          Lock feed until I submit
        </label>
      </div>

      {/* Feed content */}
      {hidden ? (
        <div style={{ textAlign: "center", padding: "64px 24px", background: "var(--sp-elevated)", borderRadius: 12 }}>
          <Lock size={40} color="var(--sp-subdued)" style={{ margin: "0 auto 16px" }} />
          <h4 style={{ margin: "0 0 8px", fontSize: 20, fontWeight: 800 }}>Feed Locked</h4>
          <p style={{ color: "var(--sp-subdued)", fontSize: 13, marginBottom: 24 }}>Submit your song to see what your friends picked today.</p>
          <button onClick={onNavigateToSubmit} className="sp-btn-primary">Submit Now</button>
        </div>
      ) : feedItems.length === 0 ? (
        <div style={{ textAlign: "center", padding: "64px 24px", background: "var(--sp-elevated)", borderRadius: 12 }}>
          <Music size={40} color="var(--sp-subdued)" style={{ margin: "0 auto 16px" }} />
          <p style={{ color: "var(--sp-subdued)", marginBottom: 16 }}>No songs submitted yet today.</p>
          <button onClick={onNavigateToSubmit} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--sp-green)", fontWeight: 700, fontSize: 14 }}>
            Be the first →
          </button>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {feedItems.map(item => (
            <FeedCard key={item.id} item={item} onToggleReaction={onToggleReaction} />
          ))}
        </div>
      )}
    </div>
  );
};

function FeedCard({ item, onToggleReaction }: { item: FeedItem; onToggleReaction: (id: number, emoji: string) => void }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      style={{
        background: hovered ? "var(--sp-highlight)" : "var(--sp-elevated)",
        borderRadius: 8, padding: 16,
        transition: "background 120ms",
        display: "flex", flexDirection: "column", gap: 12,
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* User row */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <img src={item.user.avatar_url || ("https://api.dicebear.com/7.x/avataaars/svg?seed=" + item.user.username)} alt=""
            style={{ width: 36, height: 36, borderRadius: "50%", background: "var(--sp-surface)" }} />
          <div>
            <div style={{ fontWeight: 700, fontSize: 14, lineHeight: 1.2 }}>{item.user.display_name}</div>
            <div style={{ fontSize: 12, color: "var(--sp-subdued)" }}>@{item.user.username}</div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6, background: "rgba(251,146,60,0.12)", borderRadius: 500, padding: "4px 12px" }}>
          <Flame size={12} color="#fb923c" style={{ fill: "#fb923c" }} className="animate-flame" />
          <span style={{ fontSize: 12, fontWeight: 700, color: "#fb923c" }}>{item.user.streak}d</span>
        </div>
      </div>

      {/* Track row */}
      <div style={{ display: "flex", alignItems: "center", gap: 16, background: "var(--sp-surface)", borderRadius: 8, padding: "12px 16px" }}>
        <div style={{ position: "relative", flexShrink: 0 }}>
          <img src={item.song.album_image_url || "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=200&h=200&fit=crop"} alt=""
            style={{ width: 64, height: 64, borderRadius: 4, objectFit: "cover", display: "block" }} />
          <a href={item.song.spotify_url} target="_blank" rel="noopener noreferrer"
            style={{ position: "absolute", inset: 0, borderRadius: 4, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", opacity: hovered ? 1 : 0, transition: "opacity 120ms" }}>
            <Play size={20} color="#000" style={{ fill: "#000", marginLeft: 2 }} />
          </a>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 700, fontSize: 15, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.song.title}</div>
          <div style={{ fontSize: 13, color: "var(--sp-green)", fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.song.artists}</div>
          <div style={{ fontSize: 12, color: "var(--sp-subdued)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.song.album}</div>
        </div>
        <a href={item.song.spotify_url} target="_blank" rel="noopener noreferrer"
          style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "var(--sp-subdued)", textDecoration: "none", flexShrink: 0, padding: "6px 12px", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 500, transition: "all 120ms" }}
          onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.color = "var(--sp-text)"; (e.currentTarget as HTMLAnchorElement).style.borderColor = "rgba(255,255,255,0.4)"; }}
          onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.color = "var(--sp-subdued)"; (e.currentTarget as HTMLAnchorElement).style.borderColor = "rgba(255,255,255,0.15)"; }}>
          Open <ExternalLink size={11} />
        </a>
      </div>

      {/* Reactions + time */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
          {EMOJIS.map(emoji => {
            const count = item.reactions[emoji] || 0;
            const active = item.user_reacted_emojis.includes(emoji);
            return (
              <button key={emoji} onClick={() => onToggleReaction(item.id, emoji)}
                style={{
                  display: "flex", alignItems: "center", gap: 5, padding: "4px 10px", borderRadius: 500,
                  border: active ? "1px solid rgba(30,215,96,0.4)" : "1px solid rgba(255,255,255,0.1)",
                  background: active ? "rgba(30,215,96,0.12)" : "transparent",
                  cursor: "pointer", fontSize: 13, color: active ? "var(--sp-green)" : "var(--sp-subdued)",
                  fontWeight: 600, transition: "all 100ms",
                }}>
                <span>{emoji}</span>
                {count > 0 && <span style={{ fontSize: 11 }}>{count}</span>}
              </button>
            );
          })}
        </div>
        <span style={{ fontSize: 11, color: "var(--sp-subdued)", fontFamily: "monospace" }}>
          {new Date(item.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </span>
      </div>
    </div>
  );
}
