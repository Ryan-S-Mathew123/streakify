import React from "react";
import type { LeaderboardUser, User } from "../types";
import { Award, Flame, Heart, Trophy } from "lucide-react";

interface LeaderboardProps {
  leaderboard: LeaderboardUser[];
  groupStreak: number;
  currentUser: User;
}

export const Leaderboard: React.FC<LeaderboardProps> = ({ leaderboard, groupStreak, currentUser }) => (
  <section className="rankings-page">
    <header className="rankings-hero">
      <div>
        <p className="eyebrow">The circle, day by day</p>
        <h2>Consistency sounds good.</h2>
        <p>Every daily pick adds another day to your run.</p>
      </div>
      <div className="rankings-total"><Trophy size={18} /><span><small>Circle streak</small><strong>{groupStreak} days</strong></span></div>
    </header>
    <div className="rankings-heading"><h3>Member streaks</h3><span>{leaderboard.length} members</span></div>
    {leaderboard.length ? (
      <ol className="rankings-list">
        {leaderboard.map(member => {
          const isCurrentUser = member.user_id === currentUser.id;
          const avatarUrl = member.avatar_url && !member.avatar_url.includes("dicebear.com") ? member.avatar_url : "";
          return (
            <li className={`rankings-row${isCurrentUser ? " current" : ""}`} key={member.user_id}>
              <span className="rank-number">{member.rank < 4 ? <Award size={17} /> : `#${member.rank}`}</span>
              {avatarUrl ? <img className="account-avatar" src={avatarUrl} alt="" /> : <span className="account-avatar account-avatar-initial">{member.display_name.slice(0, 1).toUpperCase()}</span>}
              <span className="rank-member"><strong>{member.display_name}{isCurrentUser ? " (you)" : ""}</strong><small>@{member.username}</small></span>
              <span className="rank-metric"><Flame size={15} /><strong>{member.streak}</strong><small>days</small></span>
              <span className="rank-detail"><Award size={14} />{member.total_submissions}</span>
              <span className="rank-detail"><Heart size={14} />{member.reactions_received}</span>
            </li>
          );
        })}
      </ol>
    ) : (
      <div className="feed-empty"><Trophy size={26} /><h4>Your circle starts here.</h4><p>Member streaks will appear after the first daily picks.</p></div>
    )}
  </section>
);