// Local-only demo adapter. No microphone access, network calls or persistent storage.

export async function submitDemoFeedback(feedback, { shouldFail = false } = {}) {
  const text = feedback.trim();
  if (!text) throw new Error("Feedback cannot be empty");
  await new Promise((resolve) => setTimeout(resolve, 900));
  if (shouldFail) throw new Error("Simulated submission failure");
  return { demo: true, text };
}
