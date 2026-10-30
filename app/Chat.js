"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { MODELS } from "../lib/models";

function fmt(n) {
  if (n == null) return "n/a";
  return n < 0.01 ? `$${n.toFixed(5)}` : `$${n.toFixed(3)}`;
}

// Reveals text a few characters at a time, with a blinking caret.
function Typewriter({ text, animate, onTick }) {
  const [n, setN] = useState(animate ? 0 : text.length);

  useEffect(() => {
    if (!animate) return;
    const step = Math.max(2, Math.ceil(text.length / 220));
    const id = setInterval(() => {
      setN((v) => {
        const next = Math.min(text.length, v + step);
        if (next >= text.length) clearInterval(id);
        return next;
      });
      onTick?.();
    }, 16);
    return () => clearInterval(id);
  }, [text, animate, onTick]);

  return (
    <>
      {text.slice(0, n)}
      {n < text.length && <span className="caret" />}
    </>
  );
}

export default function Chat() {
  const router = useRouter();
  const [model, setModel] = useState("gpt-6-sol");
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [total, setTotal] = useState(0);
  const endRef = useRef(null);

  useEffect(() => {
    try {
      const m = localStorage.getItem("model");
      if (m && MODELS.some((x) => x.id === m)) setModel(m);
    } catch {}
  }, []);

  const scroll = () => endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  useEffect(scroll, [messages, busy]);

  const current = MODELS.find((m) => m.id === model);

  async function send(e) {
    e.preventDefault();
    const text = input.trim();
    if (!text || busy) return;
    const next = [...messages, { role: "user", content: text }];
    setMessages(next);
    setInput("");
    setBusy(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          model,
          messages: next.map(({ role, content }) => ({ role, content })),
        }),
      });
      if (res.status === 401) {
        router.push("/login");
        router.refresh();
        return;
      }
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`);
      if (data.cost != null) setTotal((t) => t + data.cost);
      setMessages([
        ...next,
        {
          role: "assistant",
          fresh: true,
          content: data.reply || "(empty reply)",
          meta: `${current.label} · ${data.usage?.prompt_tokens ?? "?"} in / ${data.usage?.completion_tokens ?? "?"} out · ${fmt(data.cost)} · ${data.seconds?.toFixed(1)}s`,
        },
      ]);
    } catch (err) {
      setMessages([...next, { role: "assistant", content: err.message, error: true }]);
    } finally {
      setBusy(false);
    }
  }

  async function logout() {
    await fetch("/api/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <div className="wrap">
      <header className="top glass">
        <div className="titlerow">
          <span className="dot" />
          <h1>Model Playground</h1>
          <span className="spacer" />
          <button className="btn ghost" type="button" onClick={() => { setMessages([]); setTotal(0); }}>
            Clear
          </button>
          <button className="btn ghost" type="button" onClick={logout}>
            Log out
          </button>
        </div>
        <div className="row">
          <select
            value={model}
            onChange={(e) => {
              setModel(e.target.value);
              try { localStorage.setItem("model", e.target.value); } catch {}
            }}
            aria-label="Model"
          >
            {MODELS.map((m, i) => (
              <option key={m.id} value={m.id}>
                {i + 1}. {m.label} ({m.tier})
              </option>
            ))}
          </select>
        </div>
        <div className="note">
          <span>
            {current.note} ·{" "}
            {current.input != null
              ? `$${current.input} in / $${current.output} out per 1M tokens`
              : "price not set, cost shows n/a"}
          </span>
          <span className="total">
            Session cost: <b key={total} className="pop">{fmt(total)}</b>
          </span>
        </div>
      </header>

      <main className="chat">
        {messages.length === 0 && (
          <div className="empty">
            <b>✦</b>
            Pick a model and send a message.
          </div>
        )}
        {messages.map((m, i) => (
          <div key={i} className={`msg glass ${m.role === "user" ? "user" : "bot"}`}>
            <div className={m.error ? "err" : ""}>
              {m.role === "assistant" && !m.error ? (
                <Typewriter text={m.content} animate={Boolean(m.fresh) && i === messages.length - 1} onTick={scroll} />
              ) : (
                m.content
              )}
            </div>
            {m.meta && <div className="meta">{m.meta}</div>}
          </div>
        ))}
        {busy && (
          <div className="msg glass bot">
            <span className="typing" aria-label={`${current.label} is thinking`}>
              <i /><i /><i />
            </span>
          </div>
        )}
        <div ref={endRef} />
      </main>

      <form className="composer glass" onSubmit={send}>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) send(e); }}
          placeholder="Message (Enter to send, Shift+Enter for new line)"
          rows={1}
        />
        <button className="btn" disabled={busy || !input.trim()}>
          {busy ? <span className="spinner" /> : "Send"}
        </button>
      </form>
    </div>
  );
}
