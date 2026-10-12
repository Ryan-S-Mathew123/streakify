import React, { useState } from "react";
import axios from "axios";
import type { User } from "../types";
import { ArrowRight, Loader2, Moon, Music2, Sun } from "lucide-react";

interface AuthScreenProps {
  theme: "light" | "dark";
  onToggleTheme: () => void;
  onAuthenticated: (user: User) => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ theme, onToggleTheme, onAuthenticated }) => {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const response = await axios.post(`/api/auth/${mode}`, {
        email,
        password,
        ...(mode === "register" ? { display_name: displayName } : {}),
      });
      onAuthenticated(response.data);
    } catch (requestError: any) {
      setError(requestError.response?.data?.detail || "Could not sign in. Check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="auth-screen">
      <header className="auth-header">
        <div className="auth-brand"><span><Music2 size={19} /></span><strong>Streakify</strong></div>
        <button className="theme-toggle" type="button" onClick={onToggleTheme} aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`} title={`Switch to ${theme === "light" ? "dark" : "light"} mode`}>
          {theme === "light" ? <Moon size={17} /> : <Sun size={17} />}
        </button>
      </header>
      <div className="auth-layout">
        <section className="auth-intro">
          <p className="eyebrow">A daily ritual for your circle</p>
          <h1>One song.<br />One day.<br /><em>Still going.</em></h1>
          <p>Make a daily pick, see what your friends chose, and keep the streak alive.</p>
          <div className="auth-rule"><span /> MUSIC IS BETTER SHARED</div>
        </section>
        <section className="auth-panel" aria-labelledby="auth-title">
          <div className="auth-mode" role="tablist" aria-label="Account access">
            <button type="button" role="tab" aria-selected={mode === "login"} className={mode === "login" ? "selected" : ""} onClick={() => { setMode("login"); setError(""); }}>Sign in</button>
            <button type="button" role="tab" aria-selected={mode === "register"} className={mode === "register" ? "selected" : ""} onClick={() => { setMode("register"); setError(""); }}>Create account</button>
          </div>
          <div className="auth-title-row">
            <p className="eyebrow">STREAKIFY CIRCLE</p>
            <h2 id="auth-title">{mode === "login" ? "Welcome back." : "Come join us."}</h2>
            <p>{mode === "login" ? "Sign in to make today's pick." : "Your account joins the shared circle."}</p>
          </div>
          <form className="auth-form" onSubmit={submit}>
            {mode === "register" && (
              <label>
                <span>Your name</span>
                <input autoComplete="name" value={displayName} onChange={event => setDisplayName(event.target.value)} minLength={2} maxLength={60} required />
              </label>
            )}
            <label>
              <span>Email address</span>
              <input type="email" autoComplete="email" value={email} onChange={event => setEmail(event.target.value)} required />
            </label>
            <label>
              <span>Password</span>
              <input type="password" autoComplete={mode === "login" ? "current-password" : "new-password"} value={password} onChange={event => setPassword(event.target.value)} minLength={12} required />
              {mode === "register" && <small>Use at least 12 characters.</small>}
            </label>
            {error && <p className="auth-error" role="alert">{error}</p>}
            <button className="auth-submit" type="submit" disabled={submitting}>
              {submitting ? <Loader2 className="spin" size={17} /> : <>{mode === "login" ? "Sign in" : "Create account"}<ArrowRight size={17} /></>}
            </button>
          </form>
          <p className="auth-footnote">Your account is private. Your daily pick is shared with the circle.</p>
        </section>
      </div>
    </main>
  );
};