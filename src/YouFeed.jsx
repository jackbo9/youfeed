import { useCallback, useEffect, useRef, useState } from "react";
import { submitDemoFeedback } from "./demo-feedback";
import { client } from "./client-config";

function MicIcon() {
  return <svg aria-hidden="true" width="20" height="24" viewBox="0 0 33 43" fill="none"><rect x="9.5" y="2" width="14" height="23" rx="7" fill="currentColor" /><path d="M3.5 19.5C3.5 29 11 35.5 16.5 35.5S29.5 29 29.5 19.5M16.5 35.5V41M10.5 41H22.5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" /></svg>;
}

function ProductContext({ compact = false }) {
  return <section className={`product-context ${compact ? 'compact' : ''}`} aria-label="Product being reviewed">
    <img src={client.product.image} alt={client.product.imageAlt} width="112" height="112" />
    <div><span className="product-code">{client.product.code}</span><p>{client.product.name}</p>
      {!compact && <a className="product-link" href={client.product.url} target="_blank" rel="noreferrer">Product details <span aria-hidden="true">↗</span><span className="sr-only"> (opens a new tab)</span></a>}
    </div>
  </section>;
}

function AppShell({ children }) {
  return <main className="app-shell">
    <header className="brand-header"><img src={client.logo} width="150" height="30" alt={client.name} /><span>{client.context}</span></header>
    <div className="screen-content">{children}</div>
    <footer className="product-footer"><span>Powered by <strong>YouFeed</strong></span><span>One product. Your perspective.</span></footer>
  </main>;
}

function SubmitActions({ draft, submitting, error, onSubmit }) {
  return <div className="actions" aria-busy={submitting}>
    {error && <div className="notice error" role="alert"><strong>That didn’t go through.</strong><p>This is a simulated failure. Your words are still here. Try again when you’re ready.</p></div>}
    <button className="button primary" disabled={submitting || !draft.trim()} onClick={onSubmit}>
      {submitting ? <><span className="spinner" aria-hidden="true" /> Finishing…</> : error ? 'Try again' : 'Finish feedback'}
    </button>
    <p className="fine-print" role="status">{submitting ? 'Completing the demo. Nothing is sent.' : 'Demo only — nothing is sent to Giacomini.'}</p>
  </div>;
}

function PromptScreen({ onSpeak, onType, hasDraft }) {
  return <AppShell>
    <ProductContext />
    <div className="heading-group"><p className="eyebrow">Your perspective</p><h1>{client.question}</h1><p className="supporting">{client.invitation}</p></div>
    <div className="input-choices">
      <button className="button primary" onClick={onSpeak}><MicIcon /> Try speaking</button>
      <button className="button secondary" onClick={onType}>{hasDraft ? 'Continue your draft' : 'Write a thought'}</button>
    </div>
    <p className="fine-print">Voice uses an editable example in this demo. Your microphone stays off.</p>
    {hasDraft && <p className="notice" role="status">Your written draft is ready to continue.</p>}
  </AppShell>;
}

function RecordingScreen({ onStop, onType }) {
  const [secs, setSecs] = useState(0);
  const max = client.recordingSeconds;
  useEffect(() => {
    let elapsed = 0;
    const id = setInterval(() => {
      elapsed += 1;
      setSecs(elapsed);
      if (elapsed >= max) { clearInterval(id); onStop(true); }
    }, 1000);
    return () => clearInterval(id);
  }, [onStop, max]);

  return <AppShell>
    <ProductContext compact />
    <div className="heading-group"><p className="eyebrow">Voice · demo</p><h1>Take a moment.</h1><p className="supporting">{client.question}</p></div>
    <div className="recording-panel">
      <div className="recording-label"><span className="recording-dot" /> Simulated recording</div>
      <div className="recording-time">0:{String(secs).padStart(2, '0')}</div>
      <progress value={secs} max={max} aria-label="Demo recording elapsed" />
      <span className="fine-print">Up to {max} seconds · stop whenever you’re ready</span>
    </div>
    <div className="actions"><button className="button primary" onClick={() => onStop(false)}><span className="stop-icon" aria-hidden="true" /> Stop and review</button><button className="button text-button" onClick={onType}>Write instead</button></div>
    <p className="fine-print">No sound is recorded. Stopping opens a sample; switching to writing keeps your previous draft.</p>
  </AppShell>;
}

function CapturedScreen({ draft, onChange, onSubmit, onRedo, onType, autoStopped, submitting, error }) {
  const [isEditing, setIsEditing] = useState(false);
  const editRef = useRef(null);
  useEffect(() => { if (isEditing) editRef.current?.focus(); }, [isEditing]);
  return <AppShell>
    <ProductContext compact />
    <div className="heading-group"><p className="eyebrow">Check your words</p><h1>Does this say what you mean?</h1><p className="supporting">{client.question}</p></div>
    {autoStopped && <p className="notice" role="status">The {client.recordingSeconds}-second demo has ended. Your sample is ready to check.</p>}
    <div className="transcript">
      <div className="transcript-heading"><span>Editable example</span>{!isEditing && <button className="button text-button" disabled={submitting} onClick={() => setIsEditing(true)}>Edit</button>}</div>
      {isEditing ? <><label className="sr-only" htmlFor="transcript">Your feedback</label><textarea id="transcript" ref={editRef} rows={6} value={draft} disabled={submitting} onChange={(event) => onChange(event.target.value)} /><button className="button text-button" disabled={submitting} onClick={() => setIsEditing(false)}>Done editing</button></> : <p className="transcript-text">{draft || 'Nothing here yet. Select Edit to add your thought.'}</p>}
      <p className="fine-print">Sample text, not a transcription of your voice.</p>
    </div>
    <SubmitActions draft={draft} submitting={submitting} error={error} onSubmit={onSubmit} />
    <div className="secondary-actions"><button className="button text-button" disabled={submitting} onClick={onRedo}>Try speaking again</button><button className="button text-button" disabled={submitting} onClick={onType}>Continue as text</button></div>
  </AppShell>;
}

function TextFallbackScreen({ draft, onChange, onSubmit, onVoice, submitting, error }) {
  function clearDraft() { if (window.confirm('Clear your written feedback? This cannot be undone.')) onChange(''); }
  return <AppShell>
    <ProductContext compact />
    <div className="heading-group"><p className="eyebrow">Your words</p><h1>{client.question}</h1><p className="supporting">A sentence is enough. Add more if you’d like.</p></div>
    <div className="field"><label htmlFor="written-feedback">Your thought</label><textarea id="written-feedback" rows={6} value={draft} disabled={submitting} onChange={(event) => onChange(event.target.value)} placeholder="I’d like to understand…" />
      <div className="field-meta"><span>{draft.length} characters</span>{draft.length > 0 && <button className="button text-button" disabled={submitting} onClick={clearDraft}>Clear</button>}</div>
    </div>
    <SubmitActions draft={draft} submitting={submitting} error={error} onSubmit={onSubmit} />
    <button className="button text-button" disabled={submitting} onClick={onVoice}>Back to input choices</button>
    <p className="fine-print">Your draft stays when you go back. Reloading clears this demo.</p>
  </AppShell>;
}

function SuccessScreen({ onDone }) {
  return <AppShell>
    <ProductContext compact />
    <div className="completion"><span className="completion-mark" aria-hidden="true"><svg width="28" height="22" viewBox="0 0 30 22" fill="none"><path d="M2 11L10 19L28 2" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" /></svg></span><p className="eyebrow">Demo complete</p><h1>Thank you for your perspective.</h1><p className="supporting">You’ve reached the end of this feedback experience.</p></div>
    <div className="receipt"><span>Prepared for</span><strong>{client.recipient}</strong><p>Demonstration only. Your feedback has not been sent.</p></div>
    <button className="button secondary" onClick={onDone}>Start a new demo</button>
  </AppShell>;
}

function DemoControls({ failNext, onFailNext, onReset, disabled }) {
  return <aside className="demo-controls" aria-label="Demo controls"><details><summary>About this demo & controls</summary><div className="demo-controls-body">
    <p>A proposed Giacomini exhibition experience using the official {client.product.code} product image. This is not a live Giacomini service.</p>
    <label className="check-row"><input type="checkbox" checked={failNext} disabled={disabled} onChange={(event) => onFailNext(event.target.checked)} /> Fail the next submission, then allow retry</label>
    <p>No audio is captured and no feedback is transmitted. Drafts stay in page memory until restart or reload.</p>
    <button className="button secondary" disabled={disabled} onClick={onReset}>Restart and clear draft</button>
  </div></details></aside>;
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

  const finishRecording = useCallback((autoStopped = false) => {
    if (captureFinished.current) return;
    captureFinished.current = true;
    setDraft(client.sampleTranscript);
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
    <div className="demo-notice"><strong>Concept demo</strong><span>No audio captured · no feedback sent</span></div>
    {screens[screen]}
    <DemoControls failNext={failNext} onFailNext={setFailNext} onReset={resetDemo} disabled={submitting} />
  </div>;
}
