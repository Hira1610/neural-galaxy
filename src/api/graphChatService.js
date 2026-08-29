import { generateMockGraph } from "../utils/mockData.js";
import { getSession } from "./authService.js";

const OFFLINE_REPLIES = [
  "I'm running in offline demo mode right now, so I can't think through this properly — but here's a mock concept map based on what you wrote, just so you can see how the brain view works.",
  "No live model connected at the moment, so this is a placeholder response. Add a GROQ_API_KEY in your .env to get real answers and a real thought graph.",
];

export async function sendChatMessage(messages) {
  try {
    const session = getSession();
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(session?.token ? { Authorization: `Bearer ${session.token}` } : {}),
      },
      body: JSON.stringify({ messages }),
    });

    if (!res.ok) throw new Error(`Server responded ${res.status}`);
    const data = await res.json();
    if (!data?.reply || !data?.nodes?.length) throw new Error("Incomplete response");
    return data;
  } catch (err) {
    console.warn("Falling back to offline chat mode:", err.message);
    const lastUserMessage = [...messages].reverse().find((m) => m.role === "user")?.content || "";
    const graph = generateMockGraph(lastUserMessage);
    const reply = OFFLINE_REPLIES[Math.floor(Math.random() * OFFLINE_REPLIES.length)];
    return { reply, ...graph, source: "offline" };
  }
}
