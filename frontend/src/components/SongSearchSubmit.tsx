import React, { useState } from "react";
import axios from "axios";
import type { Song, User, Group } from "../types";
import { Search, Check, Flame, Loader2, ArrowLeft, ArrowUpRight } from "lucide-react";

interface Props {
  currentUser: User;
  activeGroup: Group | null;
  userStreak: number;
  hasSubmittedToday: boolean;
  onSongSubmitted: () => void;
}

export const SongSearchSubmit: React.FC<Props> = ({ currentUser, activeGroup, userStreak, hasSubmittedToday, onSongSubmitted }) => {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<Song[]>([]);
  const [selected, setSelected] = useState<Song | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const doSearch = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    setError("");
    try {
      const response = await axios.get("/api/songs/search", { params: { query: query.trim(), limit: 8 } });
      setResults(response.data.results || []);
    } catch (err: any) {
      setError(err.response?.data?.detail || "Song search is unavailable right now.");
    } finally {
      setLoading(false);
    }
  };

  const doSubmit = async () => {
    if (!selected || !activeGroup) return;
    setSubmitting(true);
    setError("");
    try {
      await axios.post("/api/songs/submit", {
        user_id: currentUser.id,
        group_id: activeGroup.id,
        catalog_id: selected.catalog_id,
        title: selected.title,
        artists: selected.artists,
        album: selected.album,
        album_image_url: selected.album_image_url,
        catalog_url: selected.catalog_url,
        duration_ms: selected.duration_ms || 0,
      });
      onSongSubmitted();
    } catch (err: any) {
      setError(err.response?.data?.detail || "Could not save your pick. Try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (hasSubmittedToday) {
    return (
      <section className="pick-complete">
        <div className="pick-complete-mark"><Check size={27} strokeWidth={2.5} /></div>
        <p className="eyebrow">Today's pick is in</p>
        <h2>See you tomorrow.</h2>
        <p className="pick-copy">You showed up for {activeGroup?.name || "your group"}. Your streak is still growing.</p>
        <div className="streak-count"><Flame size={18} /><strong>{userStreak}</strong><span>day streak</span></div>
      </section>
    );
  }

  return (
    <section className="pick-page">
      <header className="pick-heading">
        <p className="eyebrow">A small ritual, every day</p>
        <h2>What are you<br /><em>listening to?</em></h2>
        <p>Pick one song. Keep your streak. Let your friends in on it.</p>
      </header>

      {selected ? (
        <div className="pick-confirm">
          <button type="button" className="back-link" onClick={() => setSelected(null)}><ArrowLeft size={16} /> Back to songs</button>
          <div className="confirm-song">
            <img src={selected.album_image_url || ""} alt={`${selected.album} cover`} />
            <div className="confirm-info">
              <p className="eyebrow">Your pick for today</p>
              <h3>{selected.title}</h3>
              <p>{selected.artists}</p>
              <span>{selected.album}</span>
            </div>
          </div>
          {error && <p className="pick-error" role="alert">{error}</p>}
          <button type="button" className="submit-pick" onClick={doSubmit} disabled={submitting}>
            {submitting ? <Loader2 size={18} className="spin" /> : <Flame size={18} />}
            {submitting ? "Saving your pick" : "Lock in today's streak"}
          </button>
        </div>
      ) : (
        <>
          <form className="song-search" onSubmit={doSearch}>
            <Search size={19} aria-hidden="true" />
            <input value={query} onChange={event => setQuery(event.target.value)} type="search" placeholder="Song, artist, or album" aria-label="Search songs" />
            <button type="submit" disabled={loading || !query.trim()}>{loading ? <Loader2 size={17} className="spin" /> : <ArrowUpRight size={18} />}</button>
          </form>

          {error && <p className="pick-error" role="alert">{error}</p>}
          {results.length > 0 && (
            <div className="search-results">
              <div className="results-heading"><span>Choose your song</span><span>{results.length} results</span></div>
              {results.map(song => (
                <button className="song-result" key={song.catalog_id} type="button" onClick={() => setSelected(song)}>
                  {song.album_image_url ? <img src={song.album_image_url} alt="" /> : <span className="cover-fallback"><Search size={18} /></span>}
                  <span className="result-copy"><strong>{song.title}</strong><span>{song.artists}</span><small>{song.album}</small></span>
                  <span className="result-action">Pick <ArrowUpRight size={15} /></span>
                </button>
              ))}
            </div>
          )}
          {!results.length && !loading && (
            <div className="search-hint"><span className="hint-marker">01</span><p>Search the music catalog, then choose a track to add to today's feed.</p></div>
          )}
        </>
      )}
    </section>
  );
};