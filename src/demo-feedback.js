// Local-only demo adapter. No microphone access, network calls or persistent storage.
export const SAMPLE_TRANSCRIPT = "The display feels premium and well engineered, but I would like a clearer explanation of how this separator differs from comparable components.";

export async function submitDemoFeedback(feedback, { shouldFail = false } = {}) {
  const text = feedback.trim();
  if (!text) throw new Error("Feedback cannot be empty");
  await new Promise((resolve) => setTimeout(resolve, 900));
  if (shouldFail) throw new Error("Simulated submission failure");
  return { demo: true, text };
}
