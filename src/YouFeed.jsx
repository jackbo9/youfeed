import { useCallback, useEffect, useRef, useState } from "react";
import { SAMPLE_TRANSCRIPT, submitDemoFeedback } from "./demo-feedback";


const C = {
  bg: "#F3F0E9",
  page: "#e7e2d8",
  surface: "#ffffff",
  surfaceWarm: "#faf7f0",
  surfaceTint: "#f7f2e7",
  gold: "#b5923a",
  goldMid: "#c8a54b",
  goldLight: "#eadfb2",
  goldFaint: "#f5edcc",
  goldDeep: "#7a601e",
  blue: "#3a6683",
  blueFaint: "#ebf3f9",
  red: "#b33a32",
  ink: "#171719",
  inkMid: "#45454d",
  inkSoft: "#767680",
  inkXsoft: "#aaaab4",
  rule: "#e0dbcf",
  ruleLight: "#ebe6dc",
  success: "#3d9966",
  darkBg: "#111113",
  darkCard: "#202024",
  darkRule: "#2d2d31",
  darkInk: "#f3f0e8",
  darkSoft: "#8c8c95",
  darkXsoft: "#4a4a52",
};

const EX = {
  event: "Giacomini Exhibition",
  fair: "ISH Frankfurt 2025",
  location: "Hall B / Stand 14",
  touchpoint: "ADS-03",
  product: "Air & Dirt Separator",
  zone: "Hydronic Components Wall",
  sentence: "Mounted on the live product display for visitor feedback.",
  question: "What stood out to you about this product display?",
};

const GLOBAL = `
  @import url("https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=IBM+Plex+Mono:wght@400;500&family=IBM+Plex+Sans:wght@300;400;500;600&display=swap");
  *, *::before, *::after { box-sizing: border-box; }
  html, body, #root { min-height: 100%; }
  body {
    margin: 0;
    font-family: "IBM Plex Sans", sans-serif;
    -webkit-font-smoothing: antialiased;
    background:
      radial-gradient(circle at top left, rgba(181,146,58,.16), transparent 28%),
      radial-gradient(circle at bottom right, rgba(58,102,131,.10), transparent 22%),
      ${C.page};
  }
  @keyframes riseIn {
    from { opacity: 0; transform: translateY(12px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
  @keyframes ringPulse { 0% { transform: scale(1); opacity: .34; } 100% { transform: scale(1.72); opacity: 0; } }
  @keyframes ringPulse2 { 0% { transform: scale(1); opacity: .18; } 100% { transform: scale(2.15); opacity: 0; } }
  @keyframes blinkDot { 0%, 100% { opacity: 1; } 50% { opacity: .24; } }
  @keyframes successPop { 0% { transform: scale(.78); opacity: 0; } 60% { transform: scale(1.04); opacity: 1; } 100% { transform: scale(1); } }
  @keyframes wb1 { 0%,100%{height:5px} 28%{height:22px} 68%{height:10px} }
  @keyframes wb2 { 0%,100%{height:16px} 18%{height:6px} 58%{height:28px} }
  @keyframes wb3 { 0%,100%{height:24px} 38%{height:4px} 78%{height:14px} }
  @keyframes wb4 { 0%,100%{height:8px} 48%{height:30px} 88%{height:6px} }
  @keyframes wb5 { 0%,100%{height:18px} 22%{height:4px} 62%{height:26px} }
  @keyframes wb6 { 0%,100%{height:6px} 42%{height:20px} }
  @keyframes wb7 { 0%,100%{height:26px} 32%{height:8px} 72%{height:16px} }
  @keyframes wb8 { 0%,100%{height:10px} 52%{height:24px} 72%{height:8px} }
  @keyframes wb9 { 0%,100%{height:20px} 14%{height:4px} 54%{height:30px} }
  @keyframes spin { to { transform: rotate(360deg); } }
  .screen-enter { animation: fadeIn .22s ease both; }
  .rise-1 { animation: riseIn .38s .02s ease both; }
  .rise-2 { animation: riseIn .38s .08s ease both; }
  .rise-3 { animation: riseIn .38s .15s ease both; }
  .rise-4 { animation: riseIn .38s .22s ease both; }
  .btn-gold, .btn-line, .btn-ghost, .btn-ghost-dark, textarea { font-family: "IBM Plex Sans", sans-serif; }
  .btn-gold {
    width: 100%; border: 0; border-radius: 14px; padding: 15px 18px; color: #fff;
    background: linear-gradient(180deg, ${C.goldMid}, ${C.gold}); font-size: 15px; font-weight: 600;
    letter-spacing: .01em; cursor: pointer; box-shadow: 0 10px 28px rgba(181,146,58,.22);
  }
  .btn-gold:hover { background: linear-gradient(180deg, ${C.gold}, ${C.goldDeep}); }
  .btn-gold:disabled { opacity: .38; cursor: not-allowed; }
  .btn-line {
    width: 100%; border-radius: 14px; border: 1px solid ${C.rule}; padding: 14px 18px;
    color: ${C.inkMid}; background: rgba(255,255,255,.5); font-size: 14px; font-weight: 500; cursor: pointer;
  }
  .btn-line:hover { border-color: ${C.gold}; color: ${C.gold}; }
  .btn-ghost, .btn-ghost-dark {
    border: 0; background: transparent; padding: 10px 16px; font-size: 13px; text-decoration: underline;
    text-underline-offset: 4px; cursor: pointer; border-radius: 10px; min-height: 44px; display: inline-flex; align-items: center;
  }
  .btn-ghost { color: ${C.inkSoft}; text-decoration-color: ${C.rule}; }
  .btn-ghost-dark { color: ${C.darkSoft}; text-decoration-color: ${C.darkXsoft}; }
  textarea {
    width: 100%; resize: none; border: 1px solid ${C.rule}; border-radius: 18px; padding: 18px 18px 18px 20px;
    color: ${C.ink}; background: ${C.surface}; outline: 0; line-height: 1.65; font-size: 15px;
  }
  textarea:focus { border-color: ${C.gold}; box-shadow: 0 0 0 4px rgba(181,146,58,.12); }
  textarea::placeholder { color: ${C.inkXsoft}; }
`;

const mono = { fontFamily: "'IBM Plex Mono', monospace" };

function SubmitSpinner() {
  return <div aria-hidden="true" style={{ width: 16, height: 16, borderRadius: "50%", border: `2px solid ${C.goldLight}`, borderTopColor: C.gold, animation: "spin .7s linear infinite", display: "inline-block", verticalAlign: "middle" }} />;
}

function SubmitError() {
  return <p role="alert" style={{ margin: 0, padding: 14, borderRadius: 14, background: C.surface, color: C.red, lineHeight: 1.5 }}>Demo submission failed. Your draft is still here. Retry to complete the demo.</p>;
}

function SubmitActions({ draft, submitting, error, onSubmit }) {
  return <div style={{ display: "grid", gap: 10 }}>
    {error && <SubmitError />}
    <button className="btn-gold" disabled={submitting || !draft.trim()} onClick={onSubmit}>
      {submitting ? <><SubmitSpinner /> Submitting demo…</> : error ? "Retry demo submission" : "Submit demo feedback"}
    </button>
    <span role="status" style={{ fontSize: 12, color: C.inkSoft }}>{submitting ? "Please wait. Nothing is sent to Giacomini." : "Demo only · nothing is sent to Giacomini."}</span>
  </div>;
}

function AppShell({ bg = C.bg, children }) {
  return <main className="app-shell" style={{ background: bg }}>{children}</main>;
}

function BrandBar({ dark }) {
  return (
    <div style={{ padding: "10px 22px 0", display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
      <div style={{ display: "flex", alignItems: "baseline" }}>
        <span style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontStyle: "italic", fontSize: 21, color: dark ? C.darkInk : C.ink }}>You</span>
        <span style={{ fontSize: 21, fontWeight: 600, color: C.gold }}>Feed</span>
      </div>
      <span style={{ fontSize: 11, color: dark ? C.darkSoft : C.inkSoft }}>for Giacomini</span>
    </div>
  );
}

function ExhibitionLine({ dark = false }) {
  return (
    <div style={{ margin: "12px 22px 0", fontSize: 10, lineHeight: 1.5, color: dark ? C.darkSoft : C.inkXsoft, ...mono }}>
      {EX.event} / {EX.fair}
    </div>
  );
}

function ProductThumb({ dark = false, large = false }) {
  const size = large ? 84 : 72;
  return (
    <div style={{ width: size, height: size, borderRadius: 20, background: dark ? "linear-gradient(160deg, rgba(255,255,255,.08), rgba(255,255,255,.02))" : "linear-gradient(160deg, #fdfbf7, #efe3cf)", border: `1px solid ${dark ? C.darkRule : C.goldLight}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, position: "relative", overflow: "hidden" }}>
      <span style={{ position: "absolute", top: 10, left: 10, width: 6, height: 6, borderRadius: "50%", background: C.red }} />
      <svg width={large ? 52 : 44} height={large ? 52 : 44} viewBox="0 0 44 44" fill="none">
        <rect x="10" y="14" width="24" height="16" rx="8" stroke={dark ? C.goldLight : C.gold} strokeWidth="1.5" />
        <circle cx="16" cy="22" r="3" fill={dark ? "rgba(255,255,255,.04)" : C.goldFaint} stroke={dark ? C.goldLight : C.gold} strokeWidth="1.2" />
        <circle cx="28" cy="22" r="3" fill={dark ? "rgba(255,255,255,.04)" : C.goldFaint} stroke={dark ? C.goldLight : C.gold} strokeWidth="1.2" />
        <path d="M19 22h6" stroke={dark ? C.goldLight : C.gold} strokeWidth="1.2" strokeDasharray="2 2" />
        <path d="M22 9v5M22 30v5" stroke={dark ? C.goldLight : C.gold} strokeWidth="1.2" strokeLinecap="round" />
      </svg>
    </div>
  );
}

function ObjectCard({ dark = false, compact = false }) {
  return (
    <div style={{ display: "flex", gap: 14, alignItems: compact ? "center" : "flex-start", padding: compact ? "14px 14px" : "16px 16px", borderRadius: 24, background: dark ? "rgba(255,255,255,.04)" : "rgba(255,255,255,.56)", border: `1px solid ${dark ? C.darkRule : C.ruleLight}`, boxShadow: dark ? "none" : "0 12px 30px rgba(23,23,25,.05)" }}>
      <ProductThumb dark={dark} large={!compact} />
      <div style={{ display: "grid", gap: compact ? 5 : 7, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ width: 5, height: 5, borderRadius: "50%", background: C.red, flexShrink: 0 }} />
          <span style={{ fontSize: 11, letterSpacing: ".08em", textTransform: "uppercase", color: dark ? C.darkSoft : C.inkSoft, ...mono }}>{EX.zone}</span>
        </div>
        <div style={{ fontSize: compact ? 18 : 22, lineHeight: 1.15, letterSpacing: "-.03em", fontWeight: 600, color: dark ? C.darkInk : C.ink }}>{EX.product}</div>
        <div style={{ fontSize: 13, lineHeight: 1.55, color: dark ? C.darkSoft : C.inkSoft }}>{EX.sentence}</div>
      </div>
    </div>
  );
}

function Wave({ active, dark = false, small = false }) {
  const bars = [{ name: "wb1", delay: "0s" }, { name: "wb2", delay: ".11s" }, { name: "wb3", delay: ".22s" }, { name: "wb4", delay: ".07s" }, { name: "wb5", delay: ".17s" }, { name: "wb6", delay: ".27s" }, { name: "wb7", delay: ".13s" }, { name: "wb8", delay: ".19s" }, { name: "wb9", delay: ".05s" }];
  return <div role="status" aria-live="polite" aria-label={active ? "Simulated recording in progress" : "Demo waveform idle"} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: small ? 3 : 4, height: small ? 16 : 30 }}>{bars.map((bar) => <span key={bar.name} style={{ width: small ? 2.5 : 3, height: active ? undefined : small ? 4 : 6, borderRadius: 3, background: active ? C.gold : dark ? C.darkXsoft : C.rule, animation: active ? `${bar.name} .88s ${bar.delay} ease-in-out infinite` : "none" }} />)}</div>;
}

function MicButton({ active, onClick, size = 116, disabled = false }) {
  return (
    <div style={{ position: "relative", width: size, height: size, display: "flex", alignItems: "center", justifyContent: "center" }}>
      {active && <><span style={{ position: "absolute", inset: 0, borderRadius: "50%", background: C.gold, animation: "ringPulse 1.6s ease-out infinite" }} /><span style={{ position: "absolute", inset: 0, borderRadius: "50%", background: C.gold, animation: "ringPulse2 1.6s .45s ease-out infinite" }} /></>}
      <button role="button" aria-label={active ? "Stop and review sample" : "Start voice demo"} disabled={disabled} onClick={onClick} style={{ width: size, height: size, borderRadius: "50%", border: active ? 0 : `1.5px solid ${C.rule}`, background: active ? `radial-gradient(circle at 36% 34%, ${C.goldMid}, ${C.goldDeep})` : C.surface, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: active ? "0 14px 48px rgba(181,146,58,.34)" : "0 10px 30px rgba(0,0,0,.08)", transform: active ? "scale(1.03)" : "scale(1)", transition: "transform .24s ease", cursor: disabled ? "not-allowed" : "pointer", position: "relative", zIndex: 1, opacity: disabled ? 0.38 : 1 }}>
        {active ? <span aria-hidden="true" style={{ width: 26, height: 26, borderRadius: 5, background: "white" }} /> : <svg width={size * 0.33} height={size * 0.42} viewBox="0 0 33 43" fill="none">
          <rect x="9.5" y="2" width="14" height="23" rx="7" fill={active ? "rgba(255,255,255,.95)" : C.gold} />
          <path d="M3.5 19.5C3.5 29 11 35.5 16.5 35.5S29.5 29 29.5 19.5" stroke={active ? "rgba(255,255,255,.95)" : C.gold} strokeWidth="2.2" strokeLinecap="round" />
          <line x1="16.5" y1="35.5" x2="16.5" y2="41" stroke={active ? "rgba(255,255,255,.95)" : C.gold} strokeWidth="2.2" strokeLinecap="round" />
          <line x1="10.5" y1="41" x2="22.5" y2="41" stroke={active ? "rgba(255,255,255,.95)" : C.gold} strokeWidth="2.2" strokeLinecap="round" />
        </svg>}
      </button>
    </div>
  );
}

function ScreenFrame({ dark = false, children }) {
  return <><BrandBar dark={dark} /><ExhibitionLine dark={dark} /><div className="screen-enter screen-content">{children}</div></>;
}

function PromptScreen({ onSpeak, onType, hasDraft }) {
  return <AppShell><ScreenFrame>
    <div className="rise-1" style={{ display: "grid", gap: 10 }}>
      <div style={{ fontSize: 13, color: C.inkSoft }}>{EX.product} · {EX.zone}</div>
      <h1 style={{ fontSize: 30, fontWeight: 400, lineHeight: 1.24, letterSpacing: "-.03em", margin: 0 }}>{EX.question}</h1>
      <p style={{ fontSize: 14, lineHeight: 1.6, color: C.inkSoft, margin: 0 }}>Leave one quick impression about the object you just explored.</p>
    </div>
    <div className="rise-2" style={{ display: "grid", justifyItems: "center", gap: 14, padding: "24px 0" }}>
      <MicButton active={false} onClick={onSpeak} />
      <div style={{ textAlign: "center", display: "grid", gap: 6 }}>
        <strong>Try the voice demo</strong>
        <span style={{ fontSize: 13, lineHeight: 1.5, color: C.inkSoft }}>Uses a sample transcript. Your microphone stays off.</span>
      </div>
    </div>
    <button className="btn-line" onClick={onType}>{hasDraft ? "Continue your written draft" : "Type your feedback"}</button>
    {hasDraft && <p role="status" style={{ margin: 0, fontSize: 13, color: C.inkSoft }}>Your draft is kept while you switch input methods.</p>}
  </ScreenFrame></AppShell>;
}

function RecordingScreen({ onStop, onType }) {
  const [secs, setSecs] = useState(0);
  const max = 30;
  useEffect(() => {
    let elapsed = 0;
    const id = setInterval(() => {
      elapsed += 1;
      setSecs(elapsed);
      if (elapsed >= max) {
        clearInterval(id);
        onStop(true);
      }
    }, 1000);
    return () => clearInterval(id);
  }, [onStop]);

  return <AppShell bg={C.darkBg}><ScreenFrame dark>
    <div style={{ display: "grid", gap: 8 }}>
      <span style={{ fontSize: 13, color: C.darkSoft }}>{EX.product}</span>
      <p style={{ fontSize: 16, lineHeight: 1.5, color: C.darkInk, margin: 0 }}>{EX.question}</p>
    </div>
    <div style={{ padding: "24px 0", display: "grid", justifyItems: "center", gap: 22 }}>
      <MicButton active onClick={() => onStop(false)} />
      <Wave active dark />
      <h1 style={{ fontSize: 24, color: C.darkInk, margin: 0 }}>Simulated recording</h1>
      <span style={{ ...mono, color: C.darkSoft }}>{max - secs}s remaining</span>
      <p style={{ margin: 0, color: C.darkSoft, lineHeight: 1.6, textAlign: "center" }}>No audio is being recorded. Stop to review an editable sample transcript.</p>
    </div>
    <button className="btn-gold" onClick={() => onStop(false)}>Stop and review sample</button>
    <button className="btn-ghost-dark" onClick={onType}>Cancel voice demo and type instead</button>
    <span style={{ fontSize: 12, color: C.darkSoft }}>Canceling keeps your previous written draft.</span>
  </ScreenFrame></AppShell>;
}

function CapturedScreen({ draft, onChange, onSubmit, onRedo, onType, autoStopped, submitting, error }) {
  const [isEditing, setIsEditing] = useState(false);
  const editRef = useRef(null);
  useEffect(() => {
    if (isEditing) editRef.current?.focus();
  }, [isEditing]);

  return <AppShell><ScreenFrame>
    <h1 style={{ margin: 0, fontSize: 24, fontWeight: 500 }}>Review your feedback</h1>
    <ObjectCard compact />
    {autoStopped && <p style={{ margin: 0, fontSize: 13, color: C.inkSoft }}>The 30-second demo ended. Here is the sample transcript.</p>}
    <div style={{ background: C.surface, border: `1px solid ${C.rule}`, borderRadius: 22, padding: 18, display: "grid", gap: 16 }}>
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
        <span style={{ fontSize: 12, color: C.inkSoft }}>Sample transcript · editable</span>
        {!isEditing && <button className="btn-ghost" disabled={submitting} onClick={() => setIsEditing(true)}>Edit transcript</button>}
      </div>
      {isEditing ? <>
        <label htmlFor="transcript">Your feedback</label>
        <textarea id="transcript" ref={editRef} rows={6} value={draft} disabled={submitting} onChange={(event) => onChange(event.target.value)} />
        <button className="btn-ghost" disabled={submitting} onClick={() => setIsEditing(false)}>Done editing</button>
      </> : <p style={{ margin: 0, fontSize: 22, lineHeight: 1.5, whiteSpace: "pre-wrap" }}>{draft || "No feedback yet. Edit the transcript to add your note."}</p>}
      <span style={{ fontSize: 12, color: C.inkSoft }}>This started as an example, not a transcription of your voice.</span>
    </div>
    <SubmitActions draft={draft} submitting={submitting} error={error} onSubmit={onSubmit} />
    <button className="btn-line" disabled={submitting} onClick={onRedo}>Try voice demo again</button>
    <button className="btn-ghost" disabled={submitting} onClick={onType}>Continue editing as text</button>
  </ScreenFrame></AppShell>;
}

function TextFallbackScreen({ draft, onChange, onSubmit, onVoice, submitting, error }) {
  function clearDraft() {
    if (window.confirm("Clear your written feedback? This cannot be undone.")) onChange("");
  }
  return <AppShell><ScreenFrame>
    <ObjectCard compact />
    <h1 style={{ fontSize: 27, lineHeight: 1.3, fontWeight: 400, margin: 0 }}>{EX.question}</h1>
    <label htmlFor="written-feedback" style={{ fontSize: 14 }}>Your feedback</label>
    <textarea id="written-feedback" rows={8} value={draft} disabled={submitting} onChange={(event) => onChange(event.target.value)} placeholder="Share a quick impression about the product display…" />
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <span style={{ fontSize: 12, color: C.inkSoft }}>{draft.length} characters</span>
      {draft.length > 0 && <button className="btn-ghost" disabled={submitting} onClick={clearDraft}>Clear draft</button>}
    </div>
    <SubmitActions draft={draft} submitting={submitting} error={error} onSubmit={onSubmit} />
    <button className="btn-ghost" disabled={submitting} onClick={onVoice}>Back to input choices</button>
    <span style={{ fontSize: 12, color: C.inkSoft }}>Your draft is kept when you go back. Reloading the page clears this demo.</span>
  </ScreenFrame></AppShell>;
}

function SuccessScreen({ onDone }) {
  return (
    <AppShell>
      <div aria-hidden="true" style={{ pointerEvents: "none", position: "absolute", inset: 0, background: `radial-gradient(circle at 50% 34%, ${C.goldFaint}, transparent 46%)` }} />
      <ScreenFrame>
        <div style={{ flex: 1, display: "grid", alignContent: "center", gap: 24 }}>
          <div className="rise-1" style={{ display: "grid", justifyItems: "center", gap: 18, textAlign: "center" }}>
            <div style={{ width: 80, height: 80, borderRadius: "50%", background: `linear-gradient(160deg, ${C.goldMid}, ${C.goldDeep})`, display: "grid", placeItems: "center", boxShadow: `0 0 0 11px ${C.goldFaint}, 0 18px 40px rgba(181,146,58,.24)`, animation: "successPop .48s cubic-bezier(.34,1.56,.64,1) both" }}>
              <svg width="31" height="23" viewBox="0 0 30 22" fill="none"><path d="M2 11L10 19L28 2" stroke="#fff" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </div>
            <div style={{ display: "grid", gap: 10 }}>
              <h1 style={{ margin: 0, fontFamily: "'IBM Plex Sans', sans-serif", fontSize: 38, fontWeight: 400, letterSpacing: "-.04em", color: C.ink }}>Demo complete</h1>
              <p style={{ margin: 0, fontSize: 15, lineHeight: 1.65, color: C.inkMid }}>You have completed the feedback demo. Nothing has been sent to Giacomini.</p>
              <p style={{ margin: 0, fontSize: 13, lineHeight: 1.6, color: C.inkSoft }}>Example touchpoint: Air & Dirt Separator.</p>
            </div>
          </div>
          <div className="rise-2" style={{ display: "grid", gap: 16 }}>
            <div style={{ fontSize: 12, color: C.inkXsoft, textAlign: "center" }}>{EX.fair} / {EX.location}</div>
            <button className="btn-gold" onClick={onDone}>Start a new demo</button>
          </div>
        </div>
      </ScreenFrame>
    </AppShell>
  );
}


function DemoControls({ failNext, onFailNext, onReset, disabled }) {
  return <aside className="demo-controls" aria-label="Demo controls">
    <details>
      <summary>Demo controls</summary>
      <div style={{ display: "grid", gap: 14, paddingTop: 14 }}>
        <label style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
          <input type="checkbox" checked={failNext} disabled={disabled} onChange={(event) => onFailNext(event.target.checked)} />
          Fail the next submission, then allow retry
        </label>
        <p style={{ margin: 0, fontSize: 13 }}>Normal submissions succeed. This switch simulates one failure without sending any data.</p>
        <button className="btn-line" disabled={disabled} onClick={onReset}>Restart demo and clear draft</button>
      </div>
    </details>
  </aside>;
}

export default function YouFeed() {
  const [screen, setScreen] = useState(0);
  const [draft, setDraft] = useState("");
  const [recordingAutoStopped, setRecordingAutoStopped] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(false);
  const [failNext, setFailNext] = useState(false);
  const submitLock = useRef(false);
  const captureFinished = useRef(false);

  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = GLOBAL;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  const finishRecording = useCallback((autoStopped = false) => {
    if (captureFinished.current) return;
    captureFinished.current = true;
    setDraft(SAMPLE_TRANSCRIPT);
    setRecordingAutoStopped(autoStopped);
    setScreen(2);
  }, []);

  function startRecording() {
    if (draft.trim() && !window.confirm("Completing this voice demo will replace your current draft with a sample transcript. Canceling the recording keeps your draft. Continue?")) return;
    captureFinished.current = false;
    setRecordingAutoStopped(false);
    setSubmitError(false);
    setScreen(1);
  }

  function changeDraft(value) {
    setDraft(value);
    setSubmitError(false);
  }

  function showText() {
    captureFinished.current = true;
    setScreen(3);
  }

  async function handleSubmit() {
    if (submitLock.current || !draft.trim()) return;
    submitLock.current = true;
    setSubmitting(true);
    setSubmitError(false);
    const shouldFail = failNext;
    setFailNext(false);
    try {
      await submitDemoFeedback(draft, { shouldFail });
      setScreen(4);
    } catch {
      setSubmitError(true);
    } finally {
      submitLock.current = false;
      setSubmitting(false);
    }
  }

  function resetDemo() {
    if (submitLock.current) return;
    if (draft.length && !window.confirm("Start a new demo and clear your current feedback?")) return;
    captureFinished.current = true;
    setDraft("");
    setSubmitError(false);
    setFailNext(false);
    setRecordingAutoStopped(false);
    setScreen(0);
  }

  const feedbackProps = { draft, onChange: changeDraft, onSubmit: handleSubmit, submitting, error: submitError };
  const screens = {
    0: <PromptScreen onSpeak={startRecording} onType={showText} hasDraft={draft.length > 0} />,
    1: <RecordingScreen onStop={finishRecording} onType={showText} />,
    2: <CapturedScreen {...feedbackProps} onRedo={startRecording} onType={showText} autoStopped={recordingAutoStopped} />,
    3: <TextFallbackScreen {...feedbackProps} onVoice={() => setScreen(0)} />,
    4: <SuccessScreen onDone={resetDemo} />,
  };

  return <div className="demo-layout">
    <div className="demo-notice"><strong>Interactive demo</strong> · Sample audio flow. No microphone access or real submission.</div>
    {screens[screen]}
    <DemoControls failNext={failNext} onFailNext={setFailNext} onReset={resetDemo} disabled={submitting} />
  </div>;
}
