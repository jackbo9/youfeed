import { useEffect, useRef, useState } from "react";

const PHONE_WIDTH = 390;
const PHONE_HEIGHT = 844;

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

export let mockSubmitShouldReject = true;

export function setMockSubmitShouldReject(value) {
  mockSubmitShouldReject = value;
}

export function submitFeedback(feedback) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (mockSubmitShouldReject) {
        reject(new Error("Mock submit failed"));
        return;
      }
      resolve();
    }, 1400);
  });
}

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

function SubmitError({ onRetry, onTextFallback }) {
  return (
    <div style={{ display: "grid", gap: 10, padding: "12px 14px", borderRadius: 18, border: `1px solid ${C.ruleLight}`, background: "rgba(255,255,255,.72)" }}>
      <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
        <span style={{ flexShrink: 0, width: 16, height: 16, borderRadius: "50%", background: C.red, display: "grid", placeItems: "center", color: "#fff", fontSize: 11, fontWeight: 600 }}>!</span>
        <span style={{ fontSize: 12, lineHeight: 1.5, color: C.inkSoft }}>Couldn't send your feedback. Check your connection and try again.</span>
      </div>
      <div style={{ display: "grid", gap: 8 }}>
        <button className="btn-line" onClick={onRetry}>Retry</button>
        {onTextFallback ? <div style={{ textAlign: "center" }}><button className="btn-ghost" onClick={onTextFallback}>Submit as text instead</button></div> : null}
      </div>
    </div>
  );
}

function AppShell({ bg = C.bg, children }) {
  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "28px 16px 88px" }}>
      <div style={{ width: PHONE_WIDTH, height: PHONE_HEIGHT, borderRadius: 36, border: bg === C.darkBg ? "1px solid #232326" : "1px solid rgba(23,23,25,.08)", background: bg, position: "relative", overflow: "hidden", boxShadow: bg === C.darkBg ? "0 26px 70px rgba(0,0,0,.35)" : "0 26px 70px rgba(26,22,12,.18)" }}>
        {children}
      </div>
    </div>
  );
}

function StatusBar({ dark }) {
  const clr = dark ? C.darkSoft : C.inkSoft;
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 22px 0", color: clr, fontSize: 11, ...mono }}>
      <span>9:41</span>
      <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
        {[8, 11, 14].map((h) => <span key={h} style={{ width: 3, height: h, borderRadius: 2, background: clr }} />)}
        <span style={{ width: 24, height: 12, borderRadius: 4, border: `1.5px solid ${clr}`, padding: 1.5, display: "flex", alignItems: "center" }}>
          <span style={{ width: "75%", height: "100%", borderRadius: 2, background: clr }} />
        </span>
      </div>
    </div>
  );
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
  return <div role="status" aria-live="polite" aria-label={active ? "Recording in progress" : "Audio waveform idle"} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: small ? 3 : 4, height: small ? 16 : 30 }}>{bars.map((bar) => <span key={bar.name} style={{ width: small ? 2.5 : 3, height: active ? undefined : small ? 4 : 6, borderRadius: 3, background: active ? C.gold : dark ? C.darkXsoft : C.rule, animation: active ? `${bar.name} .88s ${bar.delay} ease-in-out infinite` : "none" }} />)}</div>;
}

function MicButton({ active, onClick, size = 116, disabled = false }) {
  return (
    <div style={{ position: "relative", width: size, height: size, display: "flex", alignItems: "center", justifyContent: "center" }}>
      {active && <><span style={{ position: "absolute", inset: 0, borderRadius: "50%", background: C.gold, animation: "ringPulse 1.6s ease-out infinite" }} /><span style={{ position: "absolute", inset: 0, borderRadius: "50%", background: C.gold, animation: "ringPulse2 1.6s .45s ease-out infinite" }} /></>}
      <button role="button" aria-label={active ? "Stop recording" : "Start recording"} disabled={disabled} onClick={onClick} style={{ width: size, height: size, borderRadius: "50%", border: active ? 0 : `1.5px solid ${C.rule}`, background: active ? `radial-gradient(circle at 36% 34%, ${C.goldMid}, ${C.goldDeep})` : C.surface, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: active ? "0 14px 48px rgba(181,146,58,.34)" : "0 10px 30px rgba(0,0,0,.08)", transform: active ? "scale(1.03)" : "scale(1)", transition: "transform .24s ease", cursor: disabled ? "not-allowed" : "pointer", position: "relative", zIndex: 1, opacity: disabled ? 0.38 : 1 }}>
        <svg width={size * 0.33} height={size * 0.42} viewBox="0 0 33 43" fill="none">
          <rect x="9.5" y="2" width="14" height="23" rx="7" fill={active ? "rgba(255,255,255,.95)" : C.gold} />
          <path d="M3.5 19.5C3.5 29 11 35.5 16.5 35.5S29.5 29 29.5 19.5" stroke={active ? "rgba(255,255,255,.95)" : C.gold} strokeWidth="2.2" strokeLinecap="round" />
          <line x1="16.5" y1="35.5" x2="16.5" y2="41" stroke={active ? "rgba(255,255,255,.95)" : C.gold} strokeWidth="2.2" strokeLinecap="round" />
          <line x1="10.5" y1="41" x2="22.5" y2="41" stroke={active ? "rgba(255,255,255,.95)" : C.gold} strokeWidth="2.2" strokeLinecap="round" />
        </svg>
      </button>
    </div>
  );
}

function ScreenFrame({ dark = false, children }) {
  return <><StatusBar dark={dark} /><BrandBar dark={dark} /><ExhibitionLine dark={dark} /><div className="screen-enter" style={{ height: PHONE_HEIGHT - 126, padding: "18px 22px 26px", display: "flex", flexDirection: "column", gap: 18, position: "relative" }}>{children}</div></>;
}
function PromptScreen({ onSpeak, onType }) {
  const [micPermission, setMicPermission] = useState("idle");

  async function handleSpeak() {
    if (micPermission === "denied") return;
    if (!navigator.mediaDevices?.getUserMedia) {
      setMicPermission("denied");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach((track) => track.stop());
      setMicPermission("granted");
      onSpeak();
    } catch {
      setMicPermission("denied");
    }
  }

  return (
    <AppShell>
      <div style={{ position: "absolute", top: -46, right: -40, width: 180, height: 180, borderRadius: "50%", background: `radial-gradient(circle, ${C.goldFaint}, transparent 70%)`, opacity: 0.85 }} />
      <ScreenFrame>
        <div className="rise-1" style={{ display: "grid", gap: 10 }}>
          <div style={{ display: "grid", gap: 6 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ width: 5, height: 5, borderRadius: "50%", background: C.red }} />
              <span style={{ ...mono, fontSize: 10, color: C.inkXsoft }}>{EX.product}</span>
            </div>
            <div style={{ fontSize: 13, color: C.inkSoft }}>{EX.zone}</div>
          </div>
          <p style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontStyle: "italic", fontSize: 30, lineHeight: 1.24, letterSpacing: "-.03em", color: C.ink, margin: 0 }}>{EX.question}</p>
          <p id="prompt-subtitle" style={{ fontSize: 14, lineHeight: 1.6, color: C.inkSoft, margin: 0 }}>Leave one quick impression about the object you just explored.</p>
        </div>
        <div className="rise-3" style={{ marginTop: 24, display: "grid", justifyItems: "center", gap: 14, minHeight: 328, alignContent: "start" }}>
          <MicButton active={false} onClick={handleSpeak} disabled={micPermission === "denied"} />
          <div style={{ textAlign: "center", display: "grid", gap: 4 }}>
            <div style={{ fontSize: 16, fontWeight: 600, color: C.ink }}>Speak your feedback</div>
            <div style={{ fontSize: 12, color: C.inkSoft }}>Fast enough for exhibition traffic</div>
          </div>
          {micPermission === "denied" && (
            <div style={{ width: "100%", display: "flex", alignItems: "flex-start", gap: 8, padding: "10px 12px", borderRadius: 14, border: `1px solid ${C.ruleLight}`, background: "rgba(255,255,255,.72)" }}>
              <span style={{ flexShrink: 0, width: 16, height: 16, borderRadius: "50%", background: C.red, display: "grid", placeItems: "center", color: "#fff", fontSize: 11, fontWeight: 600 }}>!</span>
              <span style={{ fontSize: 12, lineHeight: 1.5, color: C.inkSoft }}>Microphone access was denied. Please allow access in your browser settings, or use text input below.</span>
            </div>
          )}
        </div>
        <div className="rise-4" style={{ marginTop: "auto", display: "grid", gap: 14 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ flex: 1, height: 1, background: C.ruleLight }} />
            <span style={{ ...mono, fontSize: 10, color: C.inkXsoft }}>or</span>
            <div style={{ flex: 1, height: 1, background: C.ruleLight }} />
          </div>
          <div style={{ textAlign: "center" }}>
            <button className={micPermission === "denied" ? "btn-line" : "btn-ghost"} onClick={onType} aria-describedby="prompt-subtitle">
              {micPermission === "denied" ? "Continue with text input" : "Prefer typing? Use text input"}
            </button>
          </div>
        </div>
      </ScreenFrame>
    </AppShell>
  );
}

function RecordingScreen({ onStop, onType }) {
  const [secs, setSecs] = useState(0);
  const [hasAudio, setHasAudio] = useState(false);
  const [autoStopped, setAutoStopped] = useState(false);
  const [noAudioDetected, setNoAudioDetected] = useState(false);
  const [sessionKey, setSessionKey] = useState(0);
  const max = 30;

  useEffect(() => {
    if (noAudioDetected) return;

    const id = setInterval(() => {
      setSecs((current) => {
        if (current >= max) {
          clearInterval(id);
          setAutoStopped(true);
          if (!hasAudio) {
            setNoAudioDetected(true);
            return current;
          }
          onStop(true);
          return current;
        }
        return current + 1;
      });
    }, 1000);

    // TODO: replace with real AudioContext / analyser node in production.
    const audioId = setTimeout(() => {
      setHasAudio(true);
    }, 3000);

    return () => {
      clearInterval(id);
      clearTimeout(audioId);
    };
  }, [hasAudio, max, noAudioDetected, onStop, sessionKey]);

  function handleStop() {
    if (!hasAudio) {
      setNoAudioDetected(true);
      return;
    }
    onStop(autoStopped);
  }

  function handleRetry() {
    setSecs(0);
    setHasAudio(false);
    setAutoStopped(false);
    setNoAudioDetected(false);
    setSessionKey((current) => current + 1);
  }

  const radius = 88;
  const circumference = 2 * Math.PI * radius;
  const progress = secs / max;
  const remain = max - secs;

  return (
    <AppShell bg={C.darkBg}>
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(circle at 50% 42%, rgba(181,146,58,.18), transparent 34%)" }} />
      <ScreenFrame dark>
        <div className="rise-1" style={{ display: "grid", gap: 6 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ width: 5, height: 5, borderRadius: "50%", background: C.red }} />
            <span style={{ ...mono, fontSize: 10, color: C.darkSoft }}>{EX.product}</span>
          </div>
          <p style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontStyle: "italic", fontSize: 16, lineHeight: 1.45, color: C.darkSoft, margin: 0 }}>{EX.question}</p>
        </div>
        <div className="rise-2" style={{ marginTop: 24, display: "grid", justifyItems: "center", gap: 22, minHeight: 328, alignContent: "start" }}>
          <div role="progressbar" aria-valuemin={0} aria-valuemax={30} aria-valuenow={secs} aria-label="Recording time remaining" style={{ position: "relative", width: 220, height: 220, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="220" height="220" style={{ position: "absolute", inset: 0, transform: "rotate(-90deg)" }}>
              <circle cx="110" cy="110" r={radius} fill="none" stroke={C.darkRule} strokeWidth="2" />
              <circle cx="110" cy="110" r={radius} fill="none" stroke={remain <= 5 ? C.red : C.gold} strokeWidth="2.4" strokeDasharray={circumference} strokeDashoffset={circumference * (1 - progress)} strokeLinecap="round" style={{ transition: "stroke-dashoffset .9s linear, stroke .4s ease" }} />
            </svg>
            <div style={{ position: "absolute", top: 24, ...mono, fontSize: 10, color: C.red, letterSpacing: ".1em", textTransform: "uppercase" }}>Live capture</div>
            <div style={{ position: "absolute", bottom: 24, ...mono, fontSize: 12, color: remain <= 5 ? C.gold : C.darkSoft, letterSpacing: ".06em" }}>{remain}s remaining</div>
            <MicButton active onClick={handleStop} size={116} />
          </div>
          {noAudioDetected ? <Wave active={false} dark /> : <Wave active dark />}
          <div style={{ textAlign: "center", display: "grid", gap: 6 }}>
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 7 }}>
              {!noAudioDetected ? <span style={{ width: 7, height: 7, borderRadius: "50%", background: C.red, animation: "blinkDot 1.2s ease-in-out infinite" }} /> : null}
              <span style={{ fontSize: 18, fontWeight: 600, color: noAudioDetected ? C.red : C.darkInk }}>{noAudioDetected ? "No audio detected" : "Listening"}</span>
            </div>
            <span style={{ fontSize: 13, color: C.darkSoft }}>{noAudioDetected ? "Make sure your microphone is not muted." : "Keep it short and natural. Tap again when finished."}</span>
            {!noAudioDetected && remain <= 5 ? <span style={{ fontSize: 12, color: C.gold, animation: "fadeIn .22s ease both" }}>Almost done - wrapping up soon</span> : null}
          </div>
          {noAudioDetected ? (
            <div style={{ width: "100%", display: "grid", gap: 10 }}>
              <button className="btn-gold" onClick={handleRetry}>Try again</button>
              <button className="btn-line" onClick={onType}>Use text input instead</button>
            </div>
          ) : null}
        </div>
        <div className="rise-3" style={{ marginTop: "auto", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, paddingTop: 12, borderTop: `1px solid ${C.darkRule}` }}>
          <span style={{ ...mono, fontSize: 9, color: C.darkXsoft }}>{EX.touchpoint}</span>
          <button className="btn-ghost-dark" onClick={onType} aria-label="Switch to text input instead">Switch to typing</button>
        </div>
      </ScreenFrame>
    </AppShell>
  );
}

function CapturedScreen({ onSubmit, onRedo, onType, autoStopped }) {
  const transcript = "The display feels premium and well engineered, but I would like a clearer explanation of how this separator differs from comparable components.";
  const [editedTranscript, setEditedTranscript] = useState(transcript);
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(false);
  const editRef = useRef(null);

  useEffect(() => {
    if (isEditing) {
      editRef.current?.focus();
    }
  }, [isEditing]);

  async function handleSubmit() {
    if (isSubmitting) return;
    setIsSubmitting(true);
    setSubmitError(false);

    try {
      await submitFeedback(editedTranscript);
      onSubmit();
    } catch {
      setSubmitError(true);
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleDoneEditing() {
    setEditedTranscript((current) => current.trim());
    setIsEditing(false);
  }

  return (
    <AppShell>
      <div style={{ position: "absolute", top: -40, right: -32, width: 160, height: 160, borderRadius: "50%", background: `radial-gradient(circle, ${C.goldFaint}, transparent 70%)`, opacity: 0.8 }} />
      <ScreenFrame>
        <div className="rise-1" style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ width: 22, height: 22, borderRadius: "50%", background: C.success, display: "grid", placeItems: "center" }}>
            <svg width="11" height="8" viewBox="0 0 11 8" fill="none"><path d="M1 4L4 7L10 1" stroke="#fff" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </span>
          <span style={{ ...mono, fontSize: 10, letterSpacing: ".08em", color: C.success, textTransform: "uppercase" }}>Voice captured</span>
        </div>
        <div className="rise-2" style={{ display: "grid", gap: 14 }}>
          <ObjectCard compact />
          {autoStopped ? (
            <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 11, color: C.inkSoft, ...mono }}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <circle cx="7" cy="7" r="5.5" stroke={C.gold} />
                <path d="M7 6.2v3.1" stroke={C.gold} strokeWidth="1.2" strokeLinecap="round" />
                <circle cx="7" cy="4.2" r="0.7" fill={C.gold} />
              </svg>
              <span>Recording reached the 30s limit and was saved automatically.</span>
            </div>
          ) : null}
          <div aria-label="Transcript preview" style={{ background: C.surface, border: `1px solid ${C.rule}`, borderRadius: 22, overflow: "hidden", boxShadow: "0 18px 36px rgba(23,23,25,.06)" }}>
            <div style={{ height: 3, background: `linear-gradient(90deg, ${C.success}, ${C.gold} 70%, rgba(179,58,50,.65))` }} />
            <div style={{ padding: "18px 18px 16px", display: "grid", gap: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
                <span style={{ ...mono, fontSize: 9, letterSpacing: ".08em", color: C.inkXsoft, textTransform: "uppercase" }}>Transcript preview</span>
                {!isEditing ? (
                  <button aria-label="Edit transcript" onClick={() => setIsEditing(true)} style={{ width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 8, background: "transparent", border: "none", cursor: "pointer", padding: 8, color: C.inkSoft }}>
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <path d="M9.917 2.083a1.473 1.473 0 1 1 2.083 2.084L5.01 11.155l-2.677.594.594-2.677 6.99-6.989Z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                ) : null}
              </div>
              {isEditing ? (
                <div style={{ display: "grid", gap: 8 }}>
                  <textarea
                    ref={editRef}
                    rows={4}
                    value={editedTranscript}
                    onChange={(event) => setEditedTranscript(event.target.value)}
                    placeholder="Describe what you just experienced..."
                    style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontStyle: "italic", fontSize: 15, lineHeight: 1.5, color: C.ink, border: `1px solid ${C.gold}`, borderRadius: 12, padding: 12, resize: "none", minHeight: 80 }}
                  />
                  <div style={{ textAlign: "left" }}><button className="btn-ghost" onClick={handleDoneEditing}>Done editing</button></div>
                </div>
              ) : (
                <p aria-label="Transcript text, tap to edit" style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontStyle: "italic", fontSize: 22, lineHeight: 1.5, color: C.ink, margin: 0 }}>
                  "{editedTranscript}"
                </p>
              )}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, paddingTop: 12, borderTop: `1px solid ${C.ruleLight}` }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <Wave active={false} small />
                  <span style={{ ...mono, fontSize: 9, color: C.inkXsoft }}>Auto-transcribed from stand audio</span>
                  {editedTranscript !== transcript ? <span style={{ display: "flex", alignItems: "center", gap: 4, ...mono, fontSize: 10, color: C.gold }}><span style={{ width: 5, height: 5, borderRadius: "50%", background: C.gold }} /><span>Edited</span></span> : null}
                </div>
                <span style={{ fontSize: 12, color: C.inkSoft }}>{EX.touchpoint}</span>
              </div>
            </div>
          </div>
        </div>
        <div className="rise-3" style={{ marginTop: "auto", display: "grid", gap: 10 }}>
          <button className="btn-gold" onClick={handleSubmit} disabled={isSubmitting} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, opacity: isSubmitting ? 0.7 : 1, background: !isSubmitting && submitError ? "linear-gradient(180deg, #c44, #a33)" : undefined }}>
            {isSubmitting ? <><SubmitSpinner /><span>Submitting...</span></> : submitError ? "Try again" : "Submit feedback"}
          </button>
          <button className="btn-line" onClick={onRedo} disabled={isSubmitting}>Record again</button>
          {submitError ? <SubmitError onRetry={handleSubmit} onTextFallback={onType} /> : null}
        </div>
      </ScreenFrame>
    </AppShell>
  );
}
function TextFallbackScreen({ onSubmit, onVoice }) {
  const [text, setText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(false);
  const max = 280;

  async function handleSubmit() {
    if (text.trim().length === 0 || isSubmitting) return;
    setIsSubmitting(true);
    setSubmitError(false);

    try {
      await submitFeedback(text);
      onSubmit();
    } catch {
      setSubmitError(true);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AppShell>
      <div style={{ position: "absolute", top: -36, right: -36, width: 160, height: 160, borderRadius: "50%", background: `radial-gradient(circle, ${C.blueFaint}, transparent 70%)`, opacity: 0.85 }} />
      <ScreenFrame>
        <div className="rise-1" style={{ display: "grid", gap: 14 }}>
          <ObjectCard compact />
          <div style={{ display: "grid", gap: 8 }}>
            <p style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontStyle: "italic", fontSize: 27, lineHeight: 1.3, letterSpacing: "-.03em", color: C.ink, margin: 0 }}>Same prompt, typed instead of spoken.</p>
            <p style={{ fontSize: 14, lineHeight: 1.6, color: C.inkSoft, margin: 0 }}>Useful if the stand is crowded or you prefer to leave a written note.</p>
          </div>
        </div>
        <div className="rise-2" style={{ display: "grid", gap: 10 }}>
          <div style={{ padding: "14px 16px", borderRadius: 18, background: C.surfaceTint, border: `1px solid ${C.ruleLight}`, display: "grid", gap: 4 }}>
            <span style={{ ...mono, fontSize: 9, color: C.red, textTransform: "uppercase", letterSpacing: ".08em" }}>Voice-first fallback</span>
            <span style={{ fontSize: 13, color: C.inkSoft }}>Your note will be attached to the same product touchpoint session.</span>
          </div>
          <div style={{ position: "relative" }}>
            <div style={{ position: "absolute", left: 14, top: 14, bottom: 14, width: 3, borderRadius: 3, background: C.goldLight }} />
            <textarea rows={8} value={text} onChange={(event) => { if (event.target.value.length <= max) setText(event.target.value); }} placeholder="Share a quick impression about the product display..." autoFocus style={{ paddingLeft: 24 }} />
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
            <span style={{ ...mono, fontSize: 10, color: text.length > max * 0.8 ? C.gold : C.inkXsoft }}>{text.length}/{max}</span>
            {text.length > 0 ? <button className="btn-ghost" onClick={() => setText("")} disabled={isSubmitting} aria-label="Clear text input">Clear</button> : <span style={{ ...mono, fontSize: 9, color: C.inkXsoft }}>{EX.touchpoint}</span>}
          </div>
        </div>
        <div className="rise-3" style={{ marginTop: "auto", display: "grid", gap: 10 }}>
          <button className="btn-gold" onClick={handleSubmit} disabled={text.trim().length === 0 || isSubmitting} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, opacity: isSubmitting ? 0.7 : 1, background: !isSubmitting && submitError ? "linear-gradient(180deg, #c44, #a33)" : undefined }}>
            {isSubmitting ? <><SubmitSpinner /><span>Submitting...</span></> : submitError ? "Try again" : "Submit feedback"}
          </button>
          {submitError ? <SubmitError onRetry={handleSubmit} /> : null}
          <div style={{ textAlign: "center" }}><button className="btn-ghost" onClick={onVoice} disabled={isSubmitting} aria-label="Go back to voice input">Back to voice input</button></div>
        </div>
      </ScreenFrame>
    </AppShell>
  );
}

function SuccessScreen({ onDone }) {
  return (
    <AppShell>
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(circle at 50% 34%, ${C.goldFaint}, transparent 46%)` }} />
      <ScreenFrame>
        <div style={{ flex: 1, display: "grid", alignContent: "center", gap: 24 }}>
          <div className="rise-1" style={{ display: "grid", justifyItems: "center", gap: 18, textAlign: "center" }}>
            <div style={{ width: 80, height: 80, borderRadius: "50%", background: `linear-gradient(160deg, ${C.goldMid}, ${C.goldDeep})`, display: "grid", placeItems: "center", boxShadow: `0 0 0 11px ${C.goldFaint}, 0 18px 40px rgba(181,146,58,.24)`, animation: "successPop .48s cubic-bezier(.34,1.56,.64,1) both" }}>
              <svg width="31" height="23" viewBox="0 0 30 22" fill="none"><path d="M2 11L10 19L28 2" stroke="#fff" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </div>
            <div style={{ display: "grid", gap: 10 }}>
              <h1 style={{ margin: 0, fontFamily: "'IBM Plex Sans', sans-serif", fontSize: 38, fontWeight: 400, letterSpacing: "-.04em", color: C.ink }}>Thank you</h1>
              <p style={{ margin: 0, fontSize: 15, lineHeight: 1.65, color: C.inkMid }}>Your feedback has been sent to the Giacomini exhibition team.</p>
              <p style={{ margin: 0, fontSize: 13, lineHeight: 1.6, color: C.inkSoft }}>Shared from the Air & Dirt Separator touchpoint.</p>
            </div>
          </div>
          <div className="rise-2" style={{ display: "grid", gap: 16 }}>
            <div style={{ fontSize: 12, color: C.inkXsoft, textAlign: "center" }}>{EX.fair} / {EX.location}</div>
            <button className="btn-gold" onClick={onDone}>Done</button>
          </div>
        </div>
      </ScreenFrame>
    </AppShell>
  );
}


const screenOrder = [0, 1, 2, 3, 4];
const labels = ["Prompt", "Recording", "Captured", "Text input", "Success"];

function Navigator({ current, go }) {
  const currentIndex = Math.max(screenOrder.indexOf(current), 0);

  return (
    <div style={{ width: PHONE_WIDTH, background: "rgba(255,255,255,.62)", backdropFilter: "blur(14px)", border: "1px solid rgba(23,23,25,.08)", borderRadius: 20, padding: "12px 16px 14px", display: "grid", gap: 8, boxShadow: "0 12px 24px rgba(23,23,25,.08)", marginTop: -8 }}>
      <div style={{ ...mono, fontSize: 9, letterSpacing: ".08em", color: C.inkXsoft, textTransform: "uppercase", textAlign: "center" }}>Prototype navigator</div>
      <div style={{ display: "flex", justifyContent: "center", gap: 7 }}>{labels.map((label, index) => <button key={label} onClick={() => go(screenOrder[index])} title={label} style={{ minWidth: 24, height: 32, display: "flex", alignItems: "center", justifyContent: "center", border: 0, background: "transparent", padding: 0, cursor: "pointer" }}><span style={{ width: index === currentIndex ? 24 : 7, height: 7, borderRadius: 999, background: index === currentIndex ? C.gold : C.rule, display: "block" }} /></button>)}</div>
      <div style={{ ...mono, fontSize: 9, color: C.inkSoft, textAlign: "center" }}>{labels[currentIndex]} / {currentIndex + 1}/{labels.length}</div>
    </div>
  );
}

export default function YouFeed() {
  const [screen, setScreen] = useState(0);
  const [recordingAutoStopped, setRecordingAutoStopped] = useState(false);


  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = GLOBAL;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  const screens = {
    0: <PromptScreen key="prompt" onSpeak={() => { setRecordingAutoStopped(false); setScreen(1); }} onType={() => setScreen(3)} />,
    1: <RecordingScreen key="recording" onStop={(autoStopped = false) => { setRecordingAutoStopped(autoStopped); setScreen(2); }} onType={() => setScreen(3)} />,
    2: <CapturedScreen key="captured" onSubmit={() => setScreen(4)} onRedo={() => { setRecordingAutoStopped(false); setScreen(1); }} onType={() => setScreen(3)} autoStopped={recordingAutoStopped} />,
    3: <TextFallbackScreen key="text" onSubmit={() => setScreen(4)} onVoice={() => setScreen(0)} />,
    4: <SuccessScreen key="success" onDone={() => setScreen(0)} />,

  };

  return (
    <div style={{ display: "grid", justifyItems: "center" }}>
      {screens[screen]}
      <Navigator current={screen} go={setScreen} />
    </div>
  );
}


















