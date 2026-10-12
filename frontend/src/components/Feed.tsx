import React, { useState } from "react";
import type { FeedItem, User, Group } from "../types";
import { Flame, Lock, CheckCircle2, Music, ArrowRight, Clock3 } from "lucide-react";

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
    <div className="feed-page">
      {/* Banner */}
      <div className="feed-hero">
        <div className="feed-hero-copy">
          <div className="eyebrow">{activeGroup?.name || "Your music circle"} / Daily prompt</div>
          <h2>{(activeGroup?.theme_of_day || "Pick a song for today").replace(/[\p{Extended_Pictographic}\uFE0F]/gu, "").trim()}</h2>
          <p>One song from each of you. One more day together.</p>
        </div>
        {hasSubmittedToday ? (
          <div className="submitted-mark">
            <CheckCircle2 size={17} />
            <span>You're in today</span>
          </div>
        ) : (
          <button onClick={onNavigateToSubmit} className="feed-pick-button">
            Make today's pick <ArrowRight size={17} />
          </button>
        )}
      </div>

      {/* Controls row */}
      <div className="feed-section-heading">
        <h3>Today's picks <span>{String(feedItems.length).padStart(2, "0")}</span></h3>
        <label>
          <input type="checkbox" checked={locked} onChange={e => setLocked(e.target.checked)} />
          Hide picks until I submit
        </label>
      </div>

      {/* Feed content */}
      {hidden ? (
        <div className="feed-empty">
          <Lock size={27} />
          <h4>Make your pick first</h4>
          <p>Your friends' songs will be waiting on the other side.</p>
          <button onClick={onNavigateToSubmit} className="feed-pick-button">Pick a song <ArrowRight size={17} /></button>
        </div>
      ) : feedItems.length === 0 ? (
        <div className="feed-empty">
          <Music size={27} />
          <h4>The day is still quiet.</h4>
          <p>No picks yet. Start the thread with a song you love.</p>
          <button onClick={onNavigateToSubmit} className="feed-pick-button">Be first <ArrowRight size={17} /></button>
        </div>
      ) : (
        <div className="feed-list">
          {feedItems.map(item => (
            <FeedCard key={item.id} item={item} onToggleReaction={onToggleReaction} />
          ))}
        </div>
      )}
    </div>
  );
};

function FeedCard({ item, onToggleReaction }: { item: FeedItem; onToggleReaction: (id: number, emoji: string) => void }) {
  return (
    <article className="feed-card">
      {/* User row */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div className="feed-author">
          {item.user.avatar_url && !item.user.avatar_url.includes("dicebear.com") ? <img src={item.user.avatar_url} alt="" /> : <span className="initial-avatar">{item.user.display_name.slice(0, 1)}</span>}
          <div>
            <div className="feed-author-name">{item.user.display_name}</div>
            <div className="feed-author-handle">@{item.user.username}</div>
          </div>
        </div>
        <div className="author-streak">
          <Flame size={14} />
          <span>{item.user.streak} day{item.user.streak === 1 ? "" : "s"}</span>
        </div>
      </div>

      {/* Track row */}
      <div className="feed-song">
        <img src={item.song.album_image_url || ""} alt={`${item.song.album} cover`} />
        <div className="feed-song-copy">
          <div className="feed-song-title">{item.song.title}</div>
          <div className="feed-song-artist">{item.song.artists}</div>
          <div className="feed-song-album">{item.song.album}</div>
        </div>
        <span className="song-note">TODAY'S PICK</span>
      </div>

      {/* Reactions + time */}
      <div className="feed-card-footer">
        <div className="reaction-list">
          {EMOJIS.map(emoji => {
            const count = item.reactions[emoji] || 0;
            const active = item.user_reacted_emojis.includes(emoji);
            return (
              <button key={emoji} onClick={() => onToggleReaction(item.id, emoji)}
                className={`reaction-button${active ? " active" : ""}`} aria-label={`React with ${emoji}${count ? `, ${count} reactions` : ""}`}>
                <span className="reaction-emoji">{emoji}</span>
                {count > 0 && <span className="reaction-count">{count}</span>}
              </button>
            );
          })}
        </div>
        <span className="feed-time"><Clock3 size={13} />
          {new Date(item.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </span>
      </div>
    </article>
  );
}
