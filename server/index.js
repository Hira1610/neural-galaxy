import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { signup, login, googleSignIn, softAuth } from "./auth.js";

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
app.use(cors());
app.use(express.json());
app.use(softAuth);

const PORT = process.env.PORT || 3001;
const API_KEY = process.env.GROQ_API_KEY;
const MODEL = "openai/gpt-oss-120b";
const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";

// ---------------------------------------------------------------------------
// Auth routes
// ---------------------------------------------------------------------------

app.post("/api/auth/signup", async (req, res) => {
  try {
    const result = await signup(req.body || {});
    res.json(result);
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
});

app.post("/api/auth/login", async (req, res) => {
  try {
    const result = await login(req.body || {});
    res.json(result);
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
});

app.post("/api/auth/google", async (req, res) => {
  try {
    const result = await googleSignIn(req.body || {});
    res.json(result);
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
});

app.get("/api/auth/config", (_req, res) => {
  res.json({ googleEnabled: Boolean(process.env.GOOGLE_CLIENT_ID) });
});

// ---------------------------------------------------------------------------
// Chat + "brain" graph — one call returns both a normal conversational reply
// and a small concept graph representing the ideas in that reply, so the
// visualization is always literally what the assistant just said.
// ---------------------------------------------------------------------------

const CHAT_SYSTEM_PROMPT = `You are Neural Galaxy, a helpful, friendly AI assistant. You chat normally and answer the user's question or message like any good assistant would — clear, direct, conversational, genuinely helpful.

Alongside your reply, you also produce a small "thought graph": a set of nodes and edges representing the key concepts in the reply you just gave, like a visual map of your own thinking.

CRITICAL LANGUAGE RULE: Detect the language the user is writing in (English, Urdu, Roman Urdu, Hindi, Spanish, French, Arabic, or anything else) and write your ENTIRE reply AND all graph node labels in that same language. Never switch to English unless the user is writing in English.

Respond with ONLY raw JSON, no markdown fences, no commentary, matching exactly this shape:
{
  "reply": "your natural conversational answer, in the user's language, no markdown formatting",
  "nodes": [{ "id": "short slug, unique, ASCII only", "label": "2-4 word concept, in the user's language", "importance": number 0-1 }],
  "edges": [{ "source": "node id", "target": "node id", "weight": number 0-1 }]
}

Rules for the graph:
- Always include one root node with id "root" and importance 1, representing the core topic of your reply.
- Produce between 6 and 12 nodes total including root.
- Every non-root node needs at least one edge back to root (directly or indirectly).
- Add a few cross-links between non-root nodes where concepts genuinely relate.
- Keep labels short, concrete, and specific to what you actually said — never generic placeholders.`;

app.post("/api/chat", async (req, res) => {
  const { messages } = req.body || {};

  if (!Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: "Missing 'messages' array in request body." });
  }

  if (!API_KEY) {
    return res.status(503).json({
      error: "GROQ_API_KEY not configured on the server. Add it to .env to enable live chat.",
    });
  }

  try {
    const response = await fetch(GROQ_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 1600,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: CHAT_SYSTEM_PROMPT },
          ...messages.slice(-16), // keep recent context bounded
        ],
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("Groq API error:", response.status, errText);
      return res.status(502).json({ error: "Upstream AI API error", detail: errText });
    }

    const data = await response.json();
    const raw = data.choices?.[0]?.message?.content?.trim() ?? "";
    const cleaned = raw.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/```\s*$/i, "").trim();

    let parsed;
    try {
      parsed = JSON.parse(cleaned);
    } catch {
      console.error("Failed to parse model output as JSON:", cleaned);
      return res.status(502).json({ error: "Model did not return valid JSON", raw: cleaned });
    }

    if (!parsed.reply || !Array.isArray(parsed.nodes) || !Array.isArray(parsed.edges)) {
      return res.status(502).json({ error: "Model JSON missing reply/nodes/edges" });
    }

    return res.json({ ...parsed, source: "live" });
  } catch (err) {
    console.error("Unexpected error calling Groq API:", err);
    return res.status(500).json({ error: "Unexpected server error", detail: err.message });
  }
});

// ---------------------------------------------------------------------------
// Node explanation ("what does this concept in my brain mean")
// ---------------------------------------------------------------------------

app.post("/api/explain-node", async (req, res) => {
  const { label, context } = req.body || {};

  if (!label || typeof label !== "string") {
    return res.status(400).json({ error: "Missing 'label' string in request body." });
  }

  if (!API_KEY) {
    return res.status(503).json({ error: "GROQ_API_KEY not configured on the server." });
  }

  try {
    const response = await fetch(GROQ_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 400,
        messages: [
          {
            role: "system",
            content:
              "You explain a single concept thoroughly in 3-5 clear sentences, plain language, no markdown, no preamble, no headers. You are given the concept and the broader topic/reply it belongs to, for context. CRITICAL: detect the language used in the broader topic / concept text and write your ENTIRE explanation in that exact same language.",
          },
          {
            role: "user",
            content: `Broader topic: "${context || "general"}"\nExplain this concept: "${label}"`,
          },
        ],
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      return res.status(502).json({ error: "Upstream AI API error", detail: errText });
    }

    const data = await response.json();
    const explanation = data.choices?.[0]?.message?.content?.trim() || "No explanation available.";
    return res.json({ explanation, source: "live" });
  } catch (err) {
    console.error("Error in /api/explain-node:", err);
    return res.status(500).json({ error: "Unexpected server error", detail: err.message });
  }
});

app.get("/api/health", (_req, res) => {
  res.json({
    ok: true,
    apiKeyConfigured: Boolean(API_KEY),
    googleEnabled: Boolean(process.env.GOOGLE_CLIENT_ID),
  });
});

// ---------------------------------------------------------------------------
// Serve the built frontend (npm run build -> dist/) so this single backend
// is also a complete, publicly-deployable website — one URL, no separate
// frontend host, no CORS/proxy config needed in production.
// ---------------------------------------------------------------------------

const distPath = path.join(__dirname, "..", "dist");
app.use(express.static(distPath));
app.get("*", (req, res, next) => {
  if (req.path.startsWith("/api")) return next();
  res.sendFile(path.join(distPath, "index.html"), (err) => {
    if (err) next();
  });
});

app.listen(PORT, () => {
  console.log(`Neural Galaxy backend running on http://localhost:${PORT}`);
  console.log(API_KEY ? "✔ GROQ_API_KEY detected — live chat enabled." : "⚠ No GROQ_API_KEY found — frontend will use offline demo mode.");
  console.log(process.env.GOOGLE_CLIENT_ID ? "✔ Google sign-in enabled." : "○ Google sign-in not configured (email/password still works).");
});
