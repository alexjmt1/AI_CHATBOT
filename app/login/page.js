"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [shake, setShake] = useState(false);

  async function submit(e) {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Login failed.");
      router.push("/");
      router.refresh();
    } catch (err) {
      setError(err.message);
      setShake(true);
      setTimeout(() => setShake(false), 600);
      setBusy(false);
    }
  }

  return (
    <div className="login-wrap">
      <form className={`login-card glass ${shake ? "shake" : ""}`} onSubmit={submit}>
        <div className="logo">✦</div>
        <h1>Welcome back</h1>
        <p className="sub">Sign in to open the Model Playground</p>

        <label className="field">
          <span>Username</span>
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="username"
            autoFocus
            required
          />
        </label>
        <label className="field">
          <span>Password</span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            required
          />
        </label>

        <button className="btn" disabled={busy}>
          {busy ? <span className="spinner" /> : "Sign in"}
        </button>
        <div className="error" role="alert">{error}</div>
      </form>
    </div>
  );
}
