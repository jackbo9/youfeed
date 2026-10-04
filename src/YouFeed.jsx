import { useCallback, useEffect, useRef, useState, useReducer } from "react";
import { submitDemoFeedback } from "./demo-feedback";
import { client } from "./client-config";
import { createFeedbackState, feedbackReducer } from "./feedback-state";

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
  const mainRef = useRef(null);
  useEffect(() => {
    mainRef.current?.querySelector('h1')?.focus({ preventScroll: true });
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);
  return <main className="app-shell" ref={mainRef}>
    <header className="brand-header"><img src={client.logo} width="150" height="30" alt={client.name} /><span>{client.context}</span></header>
    <div className="screen-content">{children}</div>
    <footer className="product-footer"><span>Powered by <strong>YouFeed</strong></span><span>One product. Your perspective.</span></footer>
  </main>;
}

function SubmitActions({ draft, submitting, error, onSubmit }) {
  const submitRef = useRef(null);
  useEffect(() => { if (error) submitRef.current?.focus(); }, [error]);
  return <div className="actions" aria-busy={submitting}>
    {error && <div className="notice error" role="alert"><strong>That didn’t go through.</strong><p>This is a simulated failure. Your words are still here. Try again when you’re ready.</p></div>}
    <button ref={submitRef} className="button primary" disabled={submitting || !draft.trim()} onClick={onSubmit}>
      {submitting ? <><span className="spinner" aria-hidden="true" /> Finishing…</> : error ? 'Try again' : 'Finish feedback'}
    </button>
    <p className="fine-print" role="status">{submitting ? 'Completing the demo. Nothing is sent.' : 'Demo only — nothing is sent to Giacomini.'}</p>
  </div>;
}

function PromptScreen({ onSpeak, onType, hasDraft, permissionDenied }) {
  return <AppShell>
    <ProductContext />
    <div className="heading-group"><p className="eyebrow">Your perspective</p><h1 tabIndex={-1}>{client.question}</h1><p className="supporting">{client.invitation}</p></div>
    {permissionDenied && <div className="notice error" role="alert"><strong>Microphone unavailable · simulated</strong><p>No permission was requested. In this situation, you can write instead or retry the voice demo.</p></div>}
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
    <div className="heading-group"><p className="eyebrow">Voice · demo</p><h1 tabIndex={-1}>Take a moment.</h1><p className="supporting">{client.question}</p></div>
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
  const editButtonRef = useRef(null);
  const restoreEditFocus = useRef(false);
  useEffect(() => {
    if (isEditing) editRef.current?.focus();
    else if (restoreEditFocus.current) { editButtonRef.current?.focus(); restoreEditFocus.current = false; }
  }, [isEditing]);
  return <AppShell>
    <ProductContext compact />
    <div className="heading-group"><p className="eyebrow">Check your words</p><h1 tabIndex={-1}>Does this say what you mean?</h1><p className="supporting">{client.question}</p></div>
    {autoStopped && <p className="notice" role="status">The {client.recordingSeconds}-second demo has ended. Your sample is ready to check.</p>}
    <div className="transcript">
      <div className="transcript-heading"><span>Editable example</span>{!isEditing && <button ref={editButtonRef} className="button text-button" disabled={submitting} onClick={() => setIsEditing(true)}>Edit</button>}</div>
      {isEditing ? <><label className="sr-only" htmlFor="transcript">Your feedback</label><textarea id="transcript" ref={editRef} rows={6} value={draft} disabled={submitting} onChange={(event) => onChange(event.target.value)} /><button className="button text-button" disabled={submitting} onClick={() => { restoreEditFocus.current = true; setIsEditing(false); }}>Done editing</button></> : <p className="transcript-text">{draft || 'Nothing here yet. Select Edit to add your thought.'}</p>}
      <p className="fine-print">Sample text, not a transcription of your voice.</p>
    </div>
    <SubmitActions draft={draft} submitting={submitting} error={error} onSubmit={onSubmit} />
    <div className="secondary-actions"><button className="button text-button" disabled={submitting} onClick={onRedo}>Try speaking again</button><button className="button text-button" disabled={submitting} onClick={onType}>Continue as text</button></div>
  </AppShell>;
}

function TextFallbackScreen({ draft, onChange, onSubmit, onVoice, onClear, submitting, error }) {
  return <AppShell>
    <ProductContext compact />
    <div className="heading-group"><p className="eyebrow">Your words</p><h1 tabIndex={-1}>{client.question}</h1><p className="supporting">A sentence is enough. Add more if you’d like.</p></div>
    <div className="field"><label htmlFor="written-feedback">Your thought</label><textarea id="written-feedback" rows={6} value={draft} disabled={submitting} onChange={(event) => onChange(event.target.value)} placeholder="I’d like to understand…" />
      <div className="field-meta"><span>{draft.length} characters</span>{draft.length > 0 && <button className="button text-button" disabled={submitting} onClick={onClear}>Clear</button>}</div>
    </div>
    <SubmitActions draft={draft} submitting={submitting} error={error} onSubmit={onSubmit} />
    <button className="button text-button" disabled={submitting} onClick={onVoice}>Back to input choices</button>
    <p className="fine-print">Your draft stays when you go back. Reloading clears this demo.</p>
  </AppShell>;
}

function SuccessScreen({ onDone }) {
  return <AppShell>
    <ProductContext compact />
    <div className="completion"><span className="completion-mark" aria-hidden="true"><svg width="28" height="22" viewBox="0 0 30 22" fill="none"><path d="M2 11L10 19L28 2" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" /></svg></span><p className="eyebrow">Demo complete</p><h1 tabIndex={-1}>Thank you for your perspective.</h1><p className="supporting">You’ve reached the end of this feedback experience.</p></div>
    <div className="receipt"><span>Prepared for</span><strong>{client.recipient}</strong><p>Demonstration only. Your feedback has not been sent.</p></div>
    <button className="button secondary" onClick={onDone}>Start a new demo</button>
  </AppShell>;
}

function RecoveryScreen({ kind, onRetry, onType }) {
  const noAudio = kind === 'no-audio';
  return <AppShell><ProductContext compact />
    <div className="heading-group"><p className="eyebrow">Voice · demo</p><h1 tabIndex={-1}>{noAudio ? 'No words picked up.' : 'The transcript isn’t ready.'}</h1><p className="supporting">{noAudio ? 'Try the voice example again, or write your thought instead.' : 'Try preparing the example again, or continue by writing.'}</p></div>
    <div className="notice" role="status">Simulated {noAudio ? 'empty recording' : 'transcription failure'}. Any earlier written draft is kept.</div>
    <div className="actions"><button className="button primary" onClick={onRetry}>{noAudio ? 'Try voice again' : 'Try again'}</button><button className="button secondary" onClick={onType}>Write instead</button></div>
  </AppShell>;
}

function TranscribingScreen({ scenario, onReady, onError, onType }) {
  useEffect(() => {
    const id = setTimeout(() => scenario === 'transcription' ? onError() : onReady(), 900);
    return () => clearTimeout(id);
  }, [scenario, onReady, onError]);
  return <AppShell><ProductContext compact /><div className="heading-group"><p className="eyebrow">Voice · demo</p><h1 tabIndex={-1}>Preparing your example.</h1><p className="supporting" role="status">A sample transcript will appear here for you to edit.</p></div><div className="loading-panel" aria-hidden="true"><span className="spinner" /></div><button className="button secondary" onClick={onType}>Cancel and write instead</button><p className="fine-print">No audio is processed. Your earlier draft stays if you cancel.</p></AppShell>;
}

function ConfirmAction({ kind, onCancel, onConfirm }) {
  const dialogRef = useRef(null);
  useEffect(() => {
    const dialog = dialogRef.current;
    dialog.showModal();
    return () => dialog.close();
  }, []);
  const copy = {
    record: ['Replace this draft with a voice example?', 'Completing the voice demo replaces your current words with sample text. Canceling before the sample is ready keeps your draft.', 'Continue to voice'],
    clear: ['Clear your words?', 'This removes your current feedback. You cannot undo it.', 'Clear draft'],
    restart: ['Start a new demo?', 'Your current feedback will be cleared and the demo settings will reset.', 'Start again'],
  }[kind];
  return <dialog ref={dialogRef} className="confirm-dialog" aria-labelledby="confirm-title" aria-describedby="confirm-description" onCancel={(event) => { event.preventDefault(); onCancel(); }}>
    <h2 id="confirm-title">{copy[0]}</h2><p id="confirm-description">{copy[1]}</p><div className="actions"><button className="button secondary" onClick={onCancel}>Keep my draft</button><button className="button primary" onClick={onConfirm}>{copy[2]}</button></div>
  </dialog>;
}

function DemoControls({ failNext, onFailNext, voiceScenario, onVoiceScenario, onReset, disabled }) {
  return <aside className="demo-controls" aria-label="Demo controls"><details><summary>About this demo & controls</summary><div className="demo-controls-body">
    <p>A proposed Giacomini exhibition experience using the official {client.product.code} product image. This is not a live Giacomini service.</p>
    <label htmlFor="voice-scenario">Next voice attempt</label><select id="voice-scenario" value={voiceScenario} disabled={disabled} onChange={(event) => onVoiceScenario(event.target.value)}>
      <option value="normal">Normal sample</option><option value="permission">Microphone unavailable (simulated)</option><option value="no-audio">No words picked up (simulated)</option><option value="transcription">Transcript fails once (simulated)</option>
    </select>
    <label className="check-row"><input type="checkbox" checked={failNext} disabled={disabled} onChange={(event) => onFailNext(event.target.checked)} /> Fail the next submission, then allow retry</label>
    <p>No audio is captured and no feedback is transmitted. Drafts stay in page memory until restart or reload.</p>
    <button className="button secondary" disabled={disabled} onClick={onReset}>Restart and clear draft</button>
  </div></details></aside>;
}

export default function YouFeed() {
  const [state, dispatch] = useReducer(feedbackReducer, undefined, createFeedbackState);
  const submitLock = useRef(false);
  const submitting = state.submitStatus === 'submitting';
  const finishRecording = useCallback((autoStopped = false) => dispatch({ type: 'RECORD_STOP', autoStopped }), []);
  const sampleReady = useCallback(() => dispatch({ type: 'SAMPLE_READY', sample: client.sampleTranscript }), []);
  const transcriptFailed = useCallback(() => dispatch({ type: 'TRANSCRIBE_ERROR' }), []);

  async function handleSubmit() {
    if (submitLock.current || !state.draft.trim()) return;
    submitLock.current = true;
    dispatch({ type: 'SUBMIT_START' });
    try {
      await submitDemoFeedback(state.draft, { shouldFail: state.failNext });
      dispatch({ type: 'SUBMIT_SUCCESS' });
    } catch {
      dispatch({ type: 'SUBMIT_ERROR' });
    } finally { submitLock.current = false; }
  }

  const goText = () => dispatch({ type: 'TEXT' });
  const record = () => dispatch({ type: 'RECORD_REQUEST' });
  const reset = () => dispatch({ type: 'RESET_REQUEST' });
  const feedbackProps = { draft: state.draft, onChange: (value) => dispatch({ type: 'EDIT', value }), onSubmit: handleSubmit, submitting, error: state.submitStatus === 'error' };
  const screens = {
    prompt: <PromptScreen onSpeak={record} onType={goText} hasDraft={state.draft.length > 0} permissionDenied={state.permissionDenied} />,
    recording: <RecordingScreen onStop={finishRecording} onType={goText} />,
    transcribing: <TranscribingScreen scenario={state.captureScenario} onReady={sampleReady} onError={transcriptFailed} onType={goText} />,
    'no-audio': <RecoveryScreen kind="no-audio" onRetry={() => dispatch({ type: 'RECORD_RETRY' })} onType={goText} />,
    'transcription-error': <RecoveryScreen kind="transcription-error" onRetry={() => dispatch({ type: 'TRANSCRIBE_RETRY' })} onType={goText} />,
    review: <CapturedScreen {...feedbackProps} onRedo={record} onType={goText} autoStopped={state.autoStopped} />,
    text: <TextFallbackScreen {...feedbackProps} onVoice={() => dispatch({ type: 'PROMPT' })} onClear={() => dispatch({ type: 'CLEAR_REQUEST' })} />,
    success: <SuccessScreen onDone={reset} />,
  };
  return <div className="demo-layout">
    <div className="demo-notice"><strong>Concept demo</strong><span>No audio captured · no feedback sent</span></div>
    {screens[state.screen]}
    <DemoControls failNext={state.failNext} onFailNext={(value) => dispatch({ type: 'FAIL_NEXT', value })} voiceScenario={state.voiceScenario} onVoiceScenario={(value) => dispatch({ type: 'VOICE_SCENARIO', value })} onReset={reset} disabled={submitting || ['recording', 'transcribing'].includes(state.screen)} />
    {state.confirmation && <ConfirmAction kind={state.confirmation} onCancel={() => dispatch({ type: 'CANCEL_CONFIRM' })} onConfirm={() => dispatch({ type: 'CONFIRM' })} />}
  </div>;
}
