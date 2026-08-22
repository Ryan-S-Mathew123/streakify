import React, { useState } from "react";
import axios from "axios";
import type { Song, User, Group } from "../types";
import { Search, Check, Flame, Loader2, Terminal, ArrowLeft, Sparkles } from "lucide-react";

interface Props {
  currentUser: User; activeGroup: Group | null; userStreak: number;
  hasSubmittedToday: boolean; onSongSubmitted: () => void; onOpenWebcmdLogs: () => void;
}

export const SongSearchSubmit: React.FC<Props> = ({ currentUser, activeGroup, userStreak, hasSubmittedToday, onSongSubmitted, onOpenWebcmdLogs }) => {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<Song[]>([]);
  const [lastCmd, setLastCmd] = useState<{ command: string; duration_ms: number } | null>(null);
  const [selected, setSelected] = useState<Song | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const doSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!query.trim()) return;
    setLoading(true); setError("");
    try {
      const res = await axios.get("/api/songs/search", { params: { query: query.trim(), limit: 8 } });
      setResults(res.data.results || []);
      setLastCmd({ command: res.data.command || ("webcmd webcmd-plugin-spotify search \"" + query.trim() + "\" -f json"), duration_ms: res.data.duration_ms || 0 });
    } catch (err: any) { setError(err.response?.data?.detail || "WebCMD search failed."); }
    finally { setLoading(false); }
  };

  const doSubmit = async () => {
    if (!selected || !activeGroup) return;
    setSubmitting(true); setError("");
    try {
      await axios.post("/api/songs/submit", { user_id: currentUser.id, group_id: activeGroup.id, spotify_id: selected.spotify_id, title: selected.title, artists: selected.artists, album: selected.album, album_image_url: selected.album_image_url, spotify_url: selected.spotify_url, duration_ms: selected.duration_ms || 0 });
      onSongSubmitted();
    } catch (err: any) { setError(err.response?.data?.detail || "Submit failed."); }
    finally { setSubmitting(false); }
  };

  if (hasSubmittedToday) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: 400, gap: 20 }}>
        <div style={{ width: 72, height: 72, borderRadius: "50%", background: "rgba(30,215,96,0.12)", border: "2px solid rgba(30,215,96,0.25)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Check size={32} color="var(--sp-green)" strokeWidth={3} />
        </div>
        <div style={{ textAlign: "center" }}>
          <h3 style={{ margin: "0 0 8px", fontSize: 24, fontWeight: 900 }}>Song Submitted!</h3>
          <p style={{ color: "var(--sp-subdued)", margin: "0 0 16px", fontSize: 14 }}>
            You have already submitted for <span style={{ color: "var(--sp-green)", fontWeight: 700 }}>{activeGroup?.name}</span> today.
          </p>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(251,146,60,0.12)", border: "1px solid rgba(251,146,60,0.25)", borderRadius: 500, padding: "8px 20px" }}>
            <Flame size={14} color="#fb923c" style={{ fill: "#fb923c" }} className="animate-flame" />
            <span style={{ fontSize: 14, fontWeight: 700, color: "#fb923c" }}>Streak: {userStreak} Days</span>
          </div>
        </div>
      </div>
    );
  }

  if (selected) {
    return (
      <div style={{ maxWidth: 520, margin: "0 auto", display: "flex", flexDirection: "column", gap: 20 }}>
        <button onClick={() => setSelected(null)} style={{ display: "flex", alignItems: "center", gap: 8, background: "none", border: "none", cursor: "pointer", color: "var(--sp-subdued)", fontSize: 13, fontWeight: 600, padding: 0, alignSelf: "flex-start" }}>
          <ArrowLeft size={16} /> Back to results
        </button>

        <div style={{ textAlign: "center", marginBottom: 8 }}>
          <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--sp-green)", marginBottom: 6 }}>Confirm Selection</div>
          <h3 style={{ margin: 0, fontSize: 24, fontWeight: 900 }}>Today's Song of the Day</h3>
        </div>

        <div style={{ background: "var(--sp-elevated)", borderRadius: 12, padding: 32, display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
          <img src={selected.album_image_url || "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=400&h=400&fit=crop"} alt=""
            style={{ width: 160, height: 160, borderRadius: 8, objectFit: "cover", boxShadow: "0 16px 48px rgba(0,0,0,0.5)" }} />
          <div style={{ textAlign: "center" }}>
            <div style={{ fontWeight: 900, fontSize: 20, marginBottom: 4 }}>{selected.title}</div>
            <div style={{ color: "var(--sp-green)", fontWeight: 600, fontSize: 15, marginBottom: 4 }}>{selected.artists}</div>
            <div style={{ color: "var(--sp-subdued)", fontSize: 12 }}>{selected.album}</div>
          </div>
        </div>

        {error && <div style={{ background: "rgba(220,38,38,0.1)", border: "1px solid rgba(220,38,38,0.3)", borderRadius: 8, padding: 12, fontSize: 13, color: "#f87171", textAlign: "center" }}>{error}</div>}

        <button onClick={doSubmit} disabled={submitting} className="sp-btn-primary"
          style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, padding: "16px 32px", fontSize: 15 }}>
          {submitting ? <><Loader2 size={18} style={{ animation: "spin 1s linear infinite" }} /> Submitting...</> : <><Sparkles size={18} /> Submit Song of the Day</>}
        </button>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20, maxWidth: 680, margin: "0 auto" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(30,215,96,0.1)", border: "1px solid rgba(30,215,96,0.2)", borderRadius: 500, padding: "5px 14px", marginBottom: 12 }}>
          <Terminal size={13} color="var(--sp-green)" />
          <span style={{ fontSize: 12, fontWeight: 700, color: "var(--sp-green)", fontFamily: "monospace", letterSpacing: "0.06em" }}>WebCMD Spotify Workflow</span>
        </div>
        <h2 style={{ margin: "0 0 8px", fontSize: 28, fontWeight: 900, letterSpacing: "-0.02em" }}>Find Today's Song</h2>
        <p style={{ color: "var(--sp-subdued)", fontSize: 14, margin: 0 }}>Search powered by WebCMD CLI → iTunes Search API</p>
      </div>

      <form onSubmit={doSearch} style={{ position: "relative" }}>
        <Search size={16} color="var(--sp-subdued)" style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
        <input value={query} onChange={e => setQuery(e.target.value)} type="text"
          placeholder="Search songs, artists, albums…" className="sp-input"
          style={{ paddingLeft: 42, paddingRight: 100, fontSize: 15 }} />
        <button type="submit" disabled={loading || !query.trim()}
          style={{ position: "absolute", right: 6, top: "50%", transform: "translateY(-50%)", background: "var(--sp-green)", border: "none", borderRadius: 6, color: "#000", fontWeight: 700, fontSize: 13, padding: "8px 18px", cursor: "pointer", opacity: loading || !query.trim() ? 0.5 : 1 }}>
          {loading ? <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} /> : "Search"}
        </button>
      </form>

      {/* WebCMD execution badge */}
      {lastCmd && (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "var(--sp-elevated)", borderRadius: 8, padding: "10px 14px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, fontFamily: "monospace", fontSize: 12, color: "var(--sp-green)", minWidth: 0 }}>
            <Terminal size={12} style={{ flexShrink: 0 }} />
            <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>$ {lastCmd.command}</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12, flexShrink: 0, marginLeft: 12 }}>
            <span style={{ fontSize: 11, color: "var(--sp-subdued)" }}>{lastCmd.duration_ms}ms</span>
            <button onClick={onOpenWebcmdLogs} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--sp-green)", fontSize: 11, fontWeight: 700, fontFamily: "monospace", padding: 0 }}>View Log</button>
          </div>
        </div>
      )}

      {error && <div style={{ background: "rgba(220,38,38,0.1)", border: "1px solid rgba(220,38,38,0.3)", borderRadius: 8, padding: 12, fontSize: 13, color: "#f87171" }}>{error}</div>}

      {/* Results */}
      {results.length > 0 && (
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--sp-subdued)", marginBottom: 8 }}>
            Results via WebCMD
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            {results.map((track, idx) => (
              <SearchRow key={track.spotify_id || idx} track={track} onSelect={() => setSelected(track)} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

function SearchRow({ track, onSelect }: { track: Song; onSelect: () => void }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div className="sp-track-row" style={{ background: hovered ? "var(--sp-elevated)" : "transparent" }}
      onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
      <img src={track.album_image_url || "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=100&h=100&fit=crop"} alt=""
        style={{ width: 48, height: 48, borderRadius: 4, objectFit: "cover", flexShrink: 0 }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 600, fontSize: 14, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", color: hovered ? "var(--sp-green)" : "var(--sp-text)" }}>{track.title}</div>
        <div style={{ fontSize: 12, color: "var(--sp-subdued)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{track.artists} · {track.album}</div>
      </div>
      <button onClick={onSelect}
        style={{ background: hovered ? "var(--sp-green)" : "transparent", border: hovered ? "none" : "1px solid rgba(255,255,255,0.2)", color: hovered ? "#000" : "var(--sp-subdued)", borderRadius: 500, padding: "6px 18px", fontSize: 13, fontWeight: 700, cursor: "pointer", flexShrink: 0, transition: "all 120ms", letterSpacing: "0.02em" }}>
        Select
      </button>
    </div>
  );
}
