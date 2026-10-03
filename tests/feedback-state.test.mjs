import test from 'node:test';
import assert from 'node:assert/strict';
import { createFeedbackState, feedbackReducer as reduce } from '../src/feedback-state.js';
import { submitDemoFeedback } from '../src/demo-feedback.js';
const apply = (state, ...actions) => actions.reduce(reduce, state);
const withDraft = (text = 'Keep my words') => apply(createFeedbackState(), {type:'TEXT'}, {type:'EDIT', value:text});

test('switching input methods preserves even long multiline drafts', () => {
  const draft = 'One line\n' + 'Long feedback. '.repeat(60);
  const state = apply(withDraft(draft), {type:'PROMPT'}, {type:'TEXT'});
  assert.equal(state.draft, draft);
});
test('recording replacement requires consent; cancel keeps words; late sample cannot overwrite text', () => {
  let state = reduce(withDraft(), {type:'RECORD_REQUEST'});
  assert.equal(state.confirmation, 'record');
  state = reduce(state, {type:'CANCEL_CONFIRM'});
  assert.equal(state.draft, 'Keep my words');
  state = apply(state, {type:'RECORD_REQUEST'}, {type:'CONFIRM'}, {type:'RECORD_STOP'}, {type:'TEXT'}, {type:'SAMPLE_READY', sample:'Overwrite?'});
  assert.equal(state.screen, 'text');
  assert.equal(state.draft, 'Keep my words');
});
test('sample replaces draft only after completed recording and transcription', () => {
  const state = apply(withDraft(), {type:'RECORD_REQUEST'}, {type:'CONFIRM'}, {type:'RECORD_STOP', autoStopped:true}, {type:'SAMPLE_READY', sample:'Sample'});
  assert.equal(state.screen, 'review'); assert.equal(state.draft, 'Sample'); assert.equal(state.autoStopped, true);
});
test('permission simulation consumes once and keeps draft without destructive prompt', () => {
  const state = apply(withDraft(), {type:'VOICE_SCENARIO', value:'permission'}, {type:'RECORD_REQUEST'});
  assert.equal(state.permissionDenied, true); assert.equal(state.voiceScenario, 'normal');
  assert.equal(state.draft, 'Keep my words'); assert.equal(state.confirmation, null);
});
test('empty recording is recoverable without losing previous text', () => {
  let state = apply(withDraft(), {type:'VOICE_SCENARIO',value:'no-audio'}, {type:'RECORD_REQUEST'}, {type:'CONFIRM'}, {type:'RECORD_STOP'});
  assert.equal(state.screen, 'no-audio'); assert.equal(state.draft, 'Keep my words');
  state = apply(state, {type:'RECORD_RETRY'}, {type:'RECORD_STOP'}, {type:'SAMPLE_READY',sample:'New sample'});
  assert.equal(state.screen, 'review'); assert.equal(state.draft, 'New sample');
});
test('transcription failure preserves draft and retry returns a sample', () => {
  let state = apply(withDraft(), {type:'VOICE_SCENARIO',value:'transcription'}, {type:'RECORD_REQUEST'}, {type:'CONFIRM'}, {type:'RECORD_STOP'}, {type:'TRANSCRIBE_ERROR'});
  assert.equal(state.screen, 'transcription-error'); assert.equal(state.draft, 'Keep my words');
  state = apply(state, {type:'TRANSCRIBE_RETRY'}, {type:'SAMPLE_READY',sample:'Recovered'});
  assert.equal(state.draft, 'Recovered'); assert.equal(state.screen, 'review');
});
test('submission locks editing and navigation; error preserves draft and retry succeeds', () => {
  let state = apply(withDraft(), {type:'FAIL_NEXT',value:true}, {type:'SUBMIT_START'});
  assert.equal(state.failNext, false); assert.equal(state.submitStatus, 'submitting');
  for (const action of [{type:'EDIT',value:'Lost'}, {type:'TEXT'}, {type:'RESET_REQUEST'}, {type:'SUBMIT_START'}]) assert.equal(reduce(state, action), state);
  state = reduce(state, {type:'SUBMIT_ERROR'}); assert.equal(state.draft, 'Keep my words');
  state = apply(state, {type:'SUBMIT_START'}, {type:'SUBMIT_SUCCESS'}); assert.equal(state.screen, 'success');
});
test('empty or whitespace-only feedback cannot submit', () => {
  for (const draft of ['', ' \n ']) assert.equal(reduce(withDraft(draft), {type:'SUBMIT_START'}).submitStatus, 'idle');
});
test('clear and restart require consent; cancellation preserves draft', () => {
  let state = apply(withDraft(), {type:'CLEAR_REQUEST'}, {type:'CANCEL_CONFIRM'}); assert.equal(state.draft, 'Keep my words');
  state = apply(state, {type:'CLEAR_REQUEST'}, {type:'CONFIRM'}); assert.equal(state.draft, ''); assert.equal(state.screen, 'text');
  state = apply(withDraft(), {type:'RESET_REQUEST'}, {type:'CONFIRM'}); assert.deepEqual(state, createFeedbackState());
});
test('demo adapter validates input and never requires a network service', async () => {
  await assert.rejects(submitDemoFeedback('  '), /empty/);
  await assert.rejects(submitDemoFeedback('Draft', {shouldFail:true}), /Simulated/);
  assert.deepEqual(await submitDemoFeedback(' Draft '), {demo:true,text:'Draft'});
});
