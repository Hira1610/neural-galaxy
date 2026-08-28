import { getSession } from "./authService.js";

const OFFLINE_EXPLANATIONS = [
  "This concept connects closely to the central idea, shaping how the overall topic unfolds. It plays a supporting role in the broader structure shown here.",
  "A key piece of the puzzle — related ideas branch outward from concepts like this one. It helps explain why the surrounding nodes are linked the way they are.",
  "This represents one facet of the larger topic. Its position and connections reflect how central it is to the overall idea being explored.",
];

export async function requestNodeExplanation(label, context) {
  try {
    const session = getSession();
    const res = await fetch("/api/explain-node", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(session?.token ? { Authorization: `Bearer ${session.token}` } : {}),
      },
      body: JSON.stringify({ label, context }),
    });
    if (!res.ok) throw new Error(`Server responded ${res.status}`);
    const data = await res.json();
    if (!data?.explanation) throw new Error("Empty explanation");
    return data.explanation;
  } catch (err) {
    console.warn("Falling back to offline explanation:", err.message);
    const idx = Math.abs(hashString(label)) % OFFLINE_EXPLANATIONS.length;
    return OFFLINE_EXPLANATIONS[idx];
  }
}

function hashString(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return hash;
}
