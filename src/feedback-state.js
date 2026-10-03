export function createFeedbackState() {
  return {
    screen: 'prompt', draft: '', voiceScenario: 'normal', captureScenario: 'normal',
    permissionDenied: false, autoStopped: false, submitStatus: 'idle', failNext: false, confirmation: null,
  };
}

function startRecording(state) {
  if (state.voiceScenario === 'permission') {
    return { ...state, screen: 'prompt', permissionDenied: true, voiceScenario: 'normal', confirmation: null };
  }
  return { ...state, screen: 'recording', captureScenario: state.voiceScenario, voiceScenario: 'normal',
    permissionDenied: false, autoStopped: false, submitStatus: 'idle', confirmation: null };
}

export function feedbackReducer(state, action) {
  // No navigation, editing or reset while the current submission is in flight.
  if (state.submitStatus === 'submitting' && !['SUBMIT_SUCCESS', 'SUBMIT_ERROR'].includes(action.type)) return state;
  switch (action.type) {
    case 'VOICE_SCENARIO': return { ...state, voiceScenario: action.value };
    case 'FAIL_NEXT': return { ...state, failNext: action.value };
    case 'EDIT': return { ...state, draft: action.value, submitStatus: 'idle' };
    case 'TEXT': return { ...state, screen: 'text', permissionDenied: false };
    case 'PROMPT': return { ...state, screen: 'prompt', permissionDenied: false };
    case 'RECORD_REQUEST':
      return state.draft.length && state.voiceScenario !== 'permission'
        ? { ...state, confirmation: 'record' } : startRecording(state);
    case 'RECORD_STOP':
      if (state.screen !== 'recording') return state;
      return { ...state, screen: state.captureScenario === 'no-audio' ? 'no-audio' : 'transcribing', autoStopped: action.autoStopped };
    case 'RECORD_RETRY': return startRecording({ ...state, voiceScenario: 'normal' });
    case 'TRANSCRIBE_RETRY': return { ...state, screen: 'transcribing', captureScenario: 'normal' };
    case 'TRANSCRIBE_ERROR':
      return state.screen === 'transcribing' ? { ...state, screen: 'transcription-error' } : state;
    case 'SAMPLE_READY':
      return state.screen === 'transcribing' ? { ...state, draft: action.sample, screen: 'review' } : state;
    case 'SUBMIT_START':
      if (!state.draft.trim() || !['review', 'text'].includes(state.screen)) return state;
      return { ...state, submitStatus: 'submitting', failNext: false };
    case 'SUBMIT_SUCCESS':
      return state.submitStatus === 'submitting' ? { ...state, screen: 'success', submitStatus: 'idle' } : state;
    case 'SUBMIT_ERROR':
      return state.submitStatus === 'submitting' ? { ...state, submitStatus: 'error' } : state;
    case 'CLEAR_REQUEST': return state.draft.length ? { ...state, confirmation: 'clear' } : state;
    case 'RESET_REQUEST': return state.draft.length ? { ...state, confirmation: 'restart' } : createFeedbackState();
    case 'CANCEL_CONFIRM': return { ...state, confirmation: null };
    case 'CONFIRM':
      if (state.confirmation === 'record') return startRecording(state);
      if (state.confirmation === 'restart') return createFeedbackState();
      if (state.confirmation === 'clear') return { ...state, draft: '', submitStatus: 'idle', confirmation: null };
      return state;
    default: return state;
  }
}
