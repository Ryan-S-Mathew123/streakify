export interface User {
  id: number;
  username: string;
  display_name: string;
  email: string;
  avatar_url: string;
  is_admin: boolean;
}

export interface Group {
  id: number;
  name: string;
  invite_code: string;
  created_by_id: number;
  theme_of_day: string;
  member_count: number;
}

export interface Song {
  id?: number;
  spotify_id: string;
  title: string;
  artists: string;
  album: string;
  album_image_url: string;
  spotify_url: string;
  duration_ms?: number;
}

export interface FeedItem {
  id: number;
  submission_date: string;
  created_at: string;
  user: {
    id: number;
    username: string;
    display_name: string;
    avatar_url: string;
    streak: number;
  };
  song: Song;
  reactions: Record<string, number>;
  user_reacted_emojis: string[];
}

export interface LeaderboardUser {
  rank: number;
  user_id: number;
  username: string;
  display_name: string;
  avatar_url: string;
  streak: number;
  total_submissions: number;
  reactions_received: number;
}

export interface WebcmdLogItem {
  id: number;
  command: string;
  query: string;
  duration_ms: number;
  status_code: number;
  output_preview: string;
  timestamp: string;
}

export interface StreakRescueItem {
  id: number;
  user_id: number;
  username: string;
  display_name: string;
  avatar_url: string;
  group_name: string;
  target_date: string;
  reason: string;
  status: string;
  created_at: string;
}
