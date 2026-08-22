import React, { useEffect, useState } from "react";
import axios from "axios";
import type { User, Group, FeedItem, LeaderboardUser } from "./types";
import { Feed } from "./components/Feed";
import { SongSearchSubmit } from "./components/SongSearchSubmit";
import { Leaderboard } from "./components/Leaderboard";
import { Discovery } from "./components/Discovery";
import { WeeklyStats } from "./components/WeeklyStats";
import { AdminRescue } from "./components/AdminRescue";
import { WebcmdObservability } from "./components/WebcmdObservability";
import { AuthModal } from "./components/AuthModal";
import {
  Music2, Search, Trophy, Compass,
  BarChart3, ShieldCheck, Terminal, Flame,
  ChevronDown, Loader2, Users,
} from "lucide-react";

type Tab = "feed" | "search" | "discover" | "leaderboard" | "stats" | "admin";

const NAV_ITEMS: { id: Tab; label: string; Icon: React.FC<any> }[] = [
  { id: "feed",        label: "Home",         Icon: Music2      },
  { id: "search",      label: "Submit Song",  Icon: Search      },
  { id: "discover",    label: "Discover",     Icon: Compass     },
  { id: "leaderboard", label: "Leaderboard",  Icon: Trophy      },
  { id: "stats",       label: "Weekly Stats", Icon: BarChart3   },
  { id: "admin",       label: "Admin",        Icon: ShieldCheck },
];

function Sidebar({ activeTab, onSelectTab, currentUser, groups, activeGroup, onSelectGroup, groupStreak, onOpenAuth, onOpenWebcmd }: {
  activeTab: Tab; onSelectTab: (t: Tab) => void; currentUser: User | null;
  groups: Group[]; activeGroup: Group | null; onSelectGroup: (g: Group) => void;
  groupStreak: number; onOpenAuth: () => void; onOpenWebcmd: () => void;
}) {
  const [groupsOpen, setGroupsOpen] = useState(false);
  return (
    <nav className="sp-sidebar">
      {/* Logo */}
      <div style={{ padding: "24px 16px 16px", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 24 }}>
          <div style={{ width: 36, height: 36, borderRadius: 8, background: "var(--sp-green)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <Music2 size={20} color="#000" />
          </div>
          <div>
            <div style={{ fontWeight: 900, fontSize: 16, letterSpacing: "-0.02em", lineHeight: 1.1 }}>SongStreak</div>
            <div style={{ fontSize: 10, color: "var(--sp-green)", fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase" }}>WebCMD Powered</div>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {NAV_ITEMS.map(({ id, label, Icon }) => (
            <button key={id} onClick={() => onSelectTab(id)}
              className={"sp-nav-item" + (activeTab === id ? " active" : "")}
              style={{ border: "none", background: "none", textAlign: "left", width: "100%", cursor: "pointer" }}>
              <Icon size={20} className="sp-nav-icon" />
              <span>{label}</span>
            </button>
          ))}
        </div>
      </div>
      <div className="sp-divider" style={{ margin: "0 12px" }} />
      {/* Groups */}
      <div style={{ padding: "12px 16px", flexShrink: 0 }}>
        <button onClick={() => setGroupsOpen(o => !o)}
          style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%", border: "none", background: "none", cursor: "pointer", color: "var(--sp-subdued)", padding: "4px 0", marginBottom: 6 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Users size={14} />
            <span style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em" }}>Groups</span>
          </div>
          <ChevronDown size={14} style={{ transform: groupsOpen ? "rotate(180deg)" : "none", transition: "transform 150ms" }} />
        </button>
        {groupsOpen && groups.map(g => (
          <button key={g.id} onClick={() => { onSelectGroup(g); setGroupsOpen(false); }}
            style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%", border: "none", borderRadius: 6, padding: "8px 10px", cursor: "pointer", background: activeGroup?.id === g.id ? "var(--sp-elevated)" : "none", color: activeGroup?.id === g.id ? "var(--sp-green)" : "var(--sp-subdued)", fontSize: 13, fontWeight: 600, textAlign: "left" }}>
            <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{g.name}</span>
            <span style={{ fontSize: 10, fontFamily: "monospace", color: "var(--sp-highlight)", flexShrink: 0, marginLeft: 6 }}>{g.invite_code}</span>
          </button>
        ))}
      </div>
      <div style={{ flex: 1 }} />
      {activeGroup && (
        <div style={{ padding: "12px 16px", flexShrink: 0 }}>
          <div style={{ background: "var(--sp-elevated)", borderRadius: 8, padding: "10px 14px", display: "flex", alignItems: "center", gap: 8 }}>
            <Flame size={16} color="#fb923c" className="animate-flame" style={{ fill: "#fb923c", flexShrink: 0 }} />
            <div>
              <div style={{ fontSize: 11, color: "var(--sp-subdued)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em" }}>Group Streak</div>
              <div style={{ fontSize: 18, fontWeight: 900, color: "#fb923c", lineHeight: 1.1 }}>{groupStreak} Days</div>
            </div>
          </div>
        </div>
      )}
      <div className="sp-divider" style={{ margin: "0 12px" }} />
      <button onClick={onOpenAuth}
        style={{ margin: 8, padding: "8px 12px", background: "none", border: "none", cursor: "pointer", borderRadius: 6, display: "flex", alignItems: "center", gap: 10, width: "calc(100% - 16px)" }}
        onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = "var(--sp-elevated)"; }}
        onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = "none"; }}>
        <img src={currentUser?.avatar_url || ("https://api.dicebear.com/7.x/avataaars/svg?seed=" + currentUser?.username)} alt="avatar"
          style={{ width: 32, height: 32, borderRadius: "50%", background: "var(--sp-elevated)", flexShrink: 0 }} />
        <div style={{ textAlign: "left", overflow: "hidden" }}>
          <div style={{ fontWeight: 700, fontSize: 13, color: "var(--sp-text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{currentUser?.display_name}</div>
          <div style={{ fontSize: 11, color: "var(--sp-subdued)" }}>@{currentUser?.username}</div>
        </div>
      </button>
      <button onClick={onOpenWebcmd}
        style={{ margin: "4px 8px 10px", padding: "8px 12px", background: "rgba(30,215,96,0.08)", border: "1px solid rgba(30,215,96,0.2)", borderRadius: 6, cursor: "pointer", display: "flex", alignItems: "center", gap: 8 }}
        onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(30,215,96,0.15)"; }}
        onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(30,215,96,0.08)"; }}>
        <span style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--sp-green)", display: "inline-block" }} />
        <Terminal size={13} color="var(--sp-green)" />
        <span style={{ fontSize: 12, fontWeight: 700, color: "var(--sp-green)", fontFamily: "monospace", letterSpacing: "0.04em" }}>WebCMD Log</span>
      </button>
    </nav>
  );
}

function NowPlayingBar({ item }: { item: FeedItem | null }) {
  const song = item?.song;
  return (
    <div className="sp-player">
      <div style={{ display: "flex", alignItems: "center", gap: 12, width: "30%", minWidth: 0 }}>
        {song ? (
          <>
            <img src={song.album_image_url || "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=80&h=80&fit=crop"} alt={song.title}
              style={{ width: 44, height: 44, borderRadius: 4, flexShrink: 0, objectFit: "cover" }} />
            <div style={{ overflow: "hidden" }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: "var(--sp-text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{song.title}</div>
              <div style={{ fontSize: 11, color: "var(--sp-subdued)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{song.artists}</div>
            </div>
          </>
        ) : (
          <div style={{ fontSize: 12, color: "var(--sp-subdued)" }}>Submit a song to see it here</div>
        )}
      </div>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
          {[{ c: "⏮", big: false }, { c: "▶", big: true }, { c: "⏭", big: false }].map(({ c, big }, i) => (
            <button key={i} style={{ background: big ? "var(--sp-text)" : "none", border: "none", cursor: "pointer", width: big ? 32 : 24, height: big ? 32 : 24, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ color: big ? "#000" : "var(--sp-subdued)", fontSize: big ? 13 : 16 }}>{c}</span>
            </button>
          ))}
        </div>
        <div className="sp-progress-bar" style={{ width: 280 }}>
          <div className="sp-progress-fill" style={{ width: "35%" }} />
        </div>
      </div>
      <div style={{ width: "30%", display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 8 }}>
        <span style={{ fontSize: 12, color: "var(--sp-subdued)" }}>🔈</span>
        <div className="sp-progress-bar" style={{ width: 80 }}>
          <div className="sp-progress-fill" style={{ width: "70%" }} />
        </div>
      </div>
    </div>
  );
}

function Topbar({ activeTab, activeGroup, userStreak, onOpenAuth, currentUser }: {
  activeTab: Tab; activeGroup: Group | null; userStreak: number; onOpenAuth: () => void; currentUser: User | null;
}) {
  const LABELS: Record<Tab, string> = { feed: "Home", search: "Submit Song", discover: "Discover", leaderboard: "Leaderboard", stats: "Weekly Stats", admin: "Admin Panel" };
  return (
    <div className="sp-topbar">
      <div style={{ fontWeight: 800, fontSize: 20, letterSpacing: "-0.01em", flex: 1 }}>
        {LABELS[activeTab]}
        {activeGroup && activeTab === "feed" && (
          <span style={{ fontSize: 13, fontWeight: 500, color: "var(--sp-subdued)", marginLeft: 10 }}>{activeGroup.name}</span>
        )}
      </div>
      {userStreak > 0 && (
        <div style={{ display: "flex", alignItems: "center", gap: 6, background: "rgba(251,146,60,0.12)", border: "1px solid rgba(251,146,60,0.25)", borderRadius: "500px", padding: "6px 14px", flexShrink: 0 }}>
          <Flame size={14} color="#fb923c" style={{ fill: "#fb923c" }} className="animate-flame" />
          <span style={{ fontSize: 13, fontWeight: 700, color: "#fb923c" }}>{userStreak}d streak</span>
        </div>
      )}
      <button onClick={onOpenAuth} style={{ background: "none", border: "none", cursor: "pointer", padding: 0, borderRadius: "50%" }}>
        <img src={currentUser?.avatar_url || ("https://api.dicebear.com/7.x/avataaars/svg?seed=" + currentUser?.username)} alt="avatar"
          style={{ width: 32, height: 32, borderRadius: "50%", background: "var(--sp-elevated)", display: "block" }} />
      </button>
    </div>
  );
}

export const App: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [activeGroup, setActiveGroup] = useState<Group | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>("feed");
  const [feedItems, setFeedItems] = useState<FeedItem[]>([]);
  const [hasSubmittedToday, setHasSubmittedToday] = useState(false);
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);
  const [groupStreak, setGroupStreak] = useState(0);
  const [userStreak, setUserStreak] = useState(0);
  const [webcmdOpen, setWebcmdOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const usersRes = await axios.get("/api/auth/users");
        setAllUsers(usersRes.data || []);
        const defaultUser = usersRes.data.find((u: User) => u.username === "ryan") || usersRes.data[0];
        setCurrentUser(defaultUser);
        if (defaultUser) {
          const groupsRes = await axios.get("/api/groups/user/" + defaultUser.id);
          setGroups(groupsRes.data || []);
          if (groupsRes.data.length > 0) setActiveGroup(groupsRes.data[0]);
        }
      } catch (err) { console.error("Init error:", err); }
      finally { setLoading(false); }
    })();
  }, []);

  const fetchFeedAndStreaks = async () => {
    if (!activeGroup || !currentUser) return;
    try {
      const [feedRes, streaksRes] = await Promise.all([
        axios.get("/api/feed/" + activeGroup.id, { params: { current_user_id: currentUser.id } }),
        axios.get("/api/streaks/group/" + activeGroup.id),
      ]);
      setFeedItems(feedRes.data.feed || []);
      setHasSubmittedToday(feedRes.data.has_submitted_today || false);
      const lb: LeaderboardUser[] = streaksRes.data.leaderboard || [];
      setLeaderboard(lb);
      setGroupStreak(streaksRes.data.group_streak || 0);
      const me = lb.find(i => i.user_id === currentUser.id);
      setUserStreak(me?.streak || 0);
    } catch (err) { console.error("Feed/streaks error:", err); }
  };

  useEffect(() => { fetchFeedAndStreaks(); }, [activeGroup, currentUser]);

  const handleSwitchUser = async (user: User) => {
    setCurrentUser(user);
    const groupsRes = await axios.get("/api/groups/user/" + user.id);
    setGroups(groupsRes.data || []);
    if (groupsRes.data.length > 0) setActiveGroup(groupsRes.data[0]);
  };

  if (loading || !currentUser) {
    return (
      <div style={{ height: "100vh", background: "var(--sp-black)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16 }}>
        <div style={{ width: 48, height: 48, borderRadius: 12, background: "var(--sp-green)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Music2 size={28} color="#000" />
        </div>
        <Loader2 size={24} style={{ color: "var(--sp-green)", animation: "spin 1s linear infinite" }} />
        <p style={{ color: "var(--sp-subdued)", fontSize: 13, fontWeight: 600 }}>Loading SongStreak…</p>
      </div>
    );
  }

  return (
    <div className="sp-shell">
      <Sidebar activeTab={activeTab} onSelectTab={setActiveTab} currentUser={currentUser}
        groups={groups} activeGroup={activeGroup} onSelectGroup={g => setActiveGroup(g)}
        groupStreak={groupStreak} onOpenAuth={() => setAuthOpen(true)} onOpenWebcmd={() => setWebcmdOpen(true)} />

      <main className="sp-main">
        <Topbar activeTab={activeTab} activeGroup={activeGroup} userStreak={userStreak}
          onOpenAuth={() => setAuthOpen(true)} currentUser={currentUser} />
        <div className="sp-content fade-up" key={activeTab}>
          {activeTab === "feed" && <Feed feedItems={feedItems} currentUser={currentUser} activeGroup={activeGroup} hasSubmittedToday={hasSubmittedToday}
            onToggleReaction={async (id, emoji) => { if (!currentUser) return; await axios.post("/api/feed/reaction", { submission_id: id, user_id: currentUser.id, emoji }); await fetchFeedAndStreaks(); }}
            onNavigateToSubmit={() => setActiveTab("search")} />}
          {activeTab === "search" && <SongSearchSubmit currentUser={currentUser} activeGroup={activeGroup} userStreak={userStreak}
            hasSubmittedToday={hasSubmittedToday} onSongSubmitted={() => { fetchFeedAndStreaks(); setActiveTab("feed"); }} onOpenWebcmdLogs={() => setWebcmdOpen(true)} />}
          {activeTab === "discover" && <Discovery currentUser={currentUser} activeGroup={activeGroup} />}
          {activeTab === "leaderboard" && <Leaderboard leaderboard={leaderboard} groupStreak={groupStreak} currentUser={currentUser} activeGroup={activeGroup} />}
          {activeTab === "stats" && <WeeklyStats currentUser={currentUser} activeGroup={activeGroup} />}
          {activeTab === "admin" && <AdminRescue currentUser={currentUser} activeGroup={activeGroup} onOpenWebcmdLogs={() => setWebcmdOpen(true)} />}
        </div>
      </main>

      <NowPlayingBar item={feedItems[0] || null} />

      <WebcmdObservability isOpen={webcmdOpen} onClose={() => setWebcmdOpen(false)} />
      <AuthModal isOpen={authOpen} currentUser={currentUser} allUsers={allUsers}
        onClose={() => setAuthOpen(false)} onSwitchUser={handleSwitchUser}
        onGroupCreatedOrJoined={async () => { const g = await axios.get("/api/groups/user/" + currentUser.id); setGroups(g.data || []); if (g.data.length > 0) setActiveGroup(g.data[g.data.length - 1]); }} />
    </div>
  );
};

export default App;
