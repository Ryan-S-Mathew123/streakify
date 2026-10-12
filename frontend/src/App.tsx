import React, { startTransition, useCallback, useEffect, useState } from "react";
import axios from "axios";
import type { User, Group, FeedItem, LeaderboardUser } from "./types";
import { Feed } from "./components/Feed";
import { SongSearchSubmit } from "./components/SongSearchSubmit";
import { Leaderboard } from "./components/Leaderboard";
import { Discovery } from "./components/Discovery";
import { WeeklyStats } from "./components/WeeklyStats";
import { AuthScreen } from "./components/AuthScreen";
import {
  Music2, Search, Trophy, Compass, BarChart3, Flame,
  Loader2, LogOut, Moon, Sun,
} from "lucide-react";

type Tab = "feed" | "search" | "discover" | "leaderboard" | "stats";
type Theme = "light" | "dark";

const NAV_ITEMS: { id: Tab; label: string; Icon: React.FC<any> }[] = [
  { id: "feed", label: "Home", Icon: Music2 },
  { id: "search", label: "Submit Song", Icon: Search },
  { id: "discover", label: "Discover", Icon: Compass },
  { id: "leaderboard", label: "Leaderboard", Icon: Trophy },
  { id: "stats", label: "Weekly Stats", Icon: BarChart3 },
];

function UserAvatar({ user, size }: { user: User; size: number }) {
  const avatarUrl = user.avatar_url && !user.avatar_url.includes("dicebear.com") ? user.avatar_url : "";
  if (avatarUrl) return <img className="account-avatar" src={avatarUrl} alt="" style={{ width: size, height: size }} />;
  return <span className="account-avatar account-avatar-initial" style={{ width: size, height: size }}>{user.display_name.slice(0, 1).toUpperCase()}</span>;
}

function ThemeButton({ theme, onToggle }: { theme: Theme; onToggle: () => void }) {
  const nextTheme = theme === "light" ? "dark" : "light";
  return (
    <button className="theme-toggle" type="button" onClick={onToggle} aria-label={`Switch to ${nextTheme} mode`} title={`Switch to ${nextTheme} mode`}>
      {theme === "light" ? <Moon size={17} /> : <Sun size={17} />}
    </button>
  );
}

function Sidebar({ activeTab, onSelectTab, currentUser, groupStreak }: {
  activeTab: Tab; onSelectTab: (tab: Tab) => void; currentUser: User; groupStreak: number;
}) {
  return (
    <nav className="sp-sidebar">
      <div className="sidebar-brand">
        <div className="brand-lockup">
          <div className="brand-mark"><Music2 size={19} /></div>
          <div><strong>Streakify</strong><span>Daily music club</span></div>
        </div>
        <div className="sidebar-nav">
          {NAV_ITEMS.map(({ id, label, Icon }) => (
            <button key={id} type="button" onClick={() => onSelectTab(id)} className={`sp-nav-item${activeTab === id ? " active" : ""}`}>
              <Icon size={18} className="sp-nav-icon" /><span>{label}</span>
            </button>
          ))}
        </div>
      </div>
      <div className="sidebar-bottom">
        <div className="circle-streak">
          <span className="circle-streak-icon"><Flame size={16} /></span>
          <span><small>Circle streak</small><strong>{groupStreak} days</strong></span>
        </div>
        <div className="sidebar-member">
          <UserAvatar user={currentUser} size={34} />
          <span><strong>{currentUser.display_name}</strong><small>{currentUser.email}</small></span>
        </div>
      </div>
    </nav>
  );
}

export const App: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeGroup, setActiveGroup] = useState<Group | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>("feed");
  const [feedItems, setFeedItems] = useState<FeedItem[]>([]);
  const [hasSubmittedToday, setHasSubmittedToday] = useState(false);
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);
  const [groupStreak, setGroupStreak] = useState(0);
  const [userStreak, setUserStreak] = useState(0);
  const [theme, setTheme] = useState<Theme>(() => localStorage.getItem("streakify-theme") === "dark" || (!localStorage.getItem("streakify-theme") && localStorage.getItem("songstreak-theme") === "dark") ? "dark" : "light");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem("streakify-theme", theme);
  }, [theme]);

  useEffect(() => {
    (async () => {
      try {
        setError(null);
        const response = await axios.get("/api/auth/me");
        if (response.data) {
          const circle = await axios.get("/api/groups/main");
          startTransition(() => {
            setCurrentUser(response.data);
            setActiveGroup(circle.data);
          });
        }
      } catch (error: any) {
        if (error.response?.status !== 401) {
          console.error("Could not restore the session:", error);
          setError("We couldn’t restore your session. Please refresh or sign in again.");
        }
      } finally {
        startTransition(() => setLoading(false));
      }
    })();
  }, []);

  const fetchFeedAndStreaks = useCallback(async () => {
    if (!activeGroup || !currentUser) return;
    try {
      setError(null);
      const [feedResponse, streakResponse] = await Promise.all([
        axios.get(`/api/feed/${activeGroup.id}`, { params: { current_user_id: currentUser.id } }),
        axios.get(`/api/streaks/group/${activeGroup.id}`),
      ]);
      const members: LeaderboardUser[] = streakResponse.data.leaderboard || [];
      startTransition(() => {
        setFeedItems(feedResponse.data.feed || []);
        setHasSubmittedToday(feedResponse.data.has_submitted_today || false);
        setLeaderboard(members);
        setGroupStreak(streakResponse.data.group_streak || 0);
        setUserStreak(members.find(member => member.user_id === currentUser.id)?.streak || 0);
      });
    } catch (error) {
      console.error("Could not load circle activity:", error);
      setError("We couldn't load the circle feed and stats. Please try again.");
    }
  }, [activeGroup, currentUser]);

  useEffect(() => { void fetchFeedAndStreaks(); }, [fetchFeedAndStreaks]);

  const handleAuthenticated = async (user: User) => {
    setCurrentUser(user);
    setError(null);
    try {
      const circle = await axios.get("/api/groups/main");
      setActiveGroup(circle.data);
    } catch (error) {
      console.error("Could not open the shared circle:", error);
      setError("The shared circle opened but could not be loaded. Please refresh and try again.");
      await axios.post("/api/auth/logout");
      setCurrentUser(null);
    }
  };

  const handleLogout = async () => {
    await axios.post("/api/auth/logout");
    setCurrentUser(null);
    setActiveGroup(null);
    setFeedItems([]);
    setLeaderboard([]);
  };

  if (loading) {
    return <div className="app-loading"><Loader2 className="spin" size={25} /><span>Opening your circle</span></div>;
  }

  if (!currentUser) {
    return <AuthScreen theme={theme} onToggleTheme={() => setTheme(theme === "light" ? "dark" : "light")} onAuthenticated={handleAuthenticated} />;
  }

  return (
    <div className="sp-shell">
      <Sidebar activeTab={activeTab} onSelectTab={setActiveTab} currentUser={currentUser} groupStreak={groupStreak} />
      <main className="sp-main">
        <header className="sp-topbar">
          <div>{activeTab === "feed" ? "Home" : activeTab === "search" ? "Submit Song" : activeTab === "discover" ? "Discover" : activeTab === "leaderboard" ? "Leaderboard" : "Weekly Stats"}</div>
          <div className="topbar-actions">
            {userStreak > 0 && <span className="user-streak"><Flame size={15} />{userStreak} day streak</span>}
            <ThemeButton theme={theme} onToggle={() => setTheme(theme === "light" ? "dark" : "light")} />
            <button className="logout-button" type="button" onClick={handleLogout} aria-label="Sign out" title="Sign out"><LogOut size={17} /></button>
          </div>
        </header>
        {error && (
          <div className="sp-content" style={{ paddingBottom: 0 }}>
            <div className="pick-error" style={{ margin: '18px 0 0' }}>{error}</div>
          </div>
        )}
        <div className="sp-content fade-up" key={activeTab}>
          {activeTab === "feed" && <Feed feedItems={feedItems} currentUser={currentUser} activeGroup={activeGroup} hasSubmittedToday={hasSubmittedToday}
            onToggleReaction={async (id, emoji) => { await axios.post("/api/feed/reaction", { submission_id: id, user_id: currentUser.id, emoji }); await fetchFeedAndStreaks(); }}
            onNavigateToSubmit={() => setActiveTab("search")} />}
          {activeTab === "search" && <SongSearchSubmit currentUser={currentUser} activeGroup={activeGroup} userStreak={userStreak}
            hasSubmittedToday={hasSubmittedToday} onSongSubmitted={async () => { await fetchFeedAndStreaks(); setActiveTab("feed"); }} />}
          {activeTab === "discover" && <Discovery currentUser={currentUser} activeGroup={activeGroup} />}
          {activeTab === "leaderboard" && <Leaderboard leaderboard={leaderboard} groupStreak={groupStreak} currentUser={currentUser} />}
          {activeTab === "stats" && <WeeklyStats currentUser={currentUser} activeGroup={activeGroup} />}
        </div>
      </main>
    </div>
  );
};

export default App;