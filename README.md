# 🌌 Neural Galaxy

**A full AI chatbot — like Claude, ChatGPT, or Gemini — with one twist:
every reply is also rendered as a living 3D "brain," a glowing constellation
of the concepts the AI just talked about.**

Chat normally on the left. Watch the AI's thinking take shape in 3D on the
right. Click any node to zoom into that concept and see what it connects to.

Built for a hackathon. Works instantly in **offline demo mode** with zero
setup, and unlocks full live chat + login the moment you add two free keys.

---

## ✨ What's inside

- **Real chat interface** — message thread, conversation history, "new chat"
  button, just like the AI apps you already use.
- **Login system** — email/password (works immediately, no setup) and an
  optional "Continue with Google" button.
- **The brain view** — every AI reply produces a fresh concept graph in 3D:
  glowing nodes for ideas, curved connections for relationships, colors that
  shift with every message, numbered nodes so you can reference "how does
  #3 connect to #7."
- **Click-to-explain** — click any node in the brain and the AI explains
  that specific concept, with a list of what it's connected to.
- **Multilingual** — type in English, Urdu, Roman Urdu, Hindi, Arabic,
  Spanish, French, or more — the AI replies (and labels its brain) in the
  same language.
- **Never dead-ends** — if the API is slow or unavailable mid-demo, it falls
  back to an offline mode automatically instead of freezing.

## 🧱 Tech stack

| Layer | Choice |
|---|---|
| 3D rendering | Three.js via `@react-three/fiber` + `@react-three/drei` |
| Post-processing | `@react-three/postprocessing` (bloom/glow) |
| Frontend | React 18 + Vite |
| Backend | Express |
| AI | Groq (`openai/gpt-oss-120b`) — **free**, no card needed |
| Auth | Email/password (bcrypt + JWT) + optional Google Sign-In |
| User storage | A simple local JSON file — no database setup required |

---

## 🚀 Quick start

```bash
# 1. Install dependencies
npm install

# 2. Add your environment variables
cp .env.example .env
```

Open `.env` and fill in:

- **`GROQ_API_KEY`** — free, get one at https://console.groq.com/keys
  (no live chat without this — the app still runs in offline demo mode)
- **`JWT_SECRET`** — just type any random long string, e.g. `banana-hippo-42-secret`
- **`GOOGLE_CLIENT_ID`** / **`VITE_GOOGLE_CLIENT_ID`** — optional, see below

```bash
# 3. Run frontend + backend together
npm run dev
```

Open **http://localhost:5173** — you'll land on a login screen. Sign up
with any email/password (it's stored locally on your machine, nothing gets
sent anywhere) and you're in.

### Enabling "Continue with Google" (optional)

1. Go to https://console.cloud.google.com/apis/credentials
2. Create Credentials → **OAuth client ID** → Application type: **Web application**
3. Under "Authorized JavaScript origins," add `http://localhost:5173`
4. Copy the generated Client ID
5. Paste the **same value** into both `GOOGLE_CLIENT_ID` and
   `VITE_GOOGLE_CLIENT_ID` in your `.env`
6. Restart `npm run dev`

If you skip this, email/password login still works perfectly — the Google
button just won't appear.

---

## 📁 Project structure

```
neural-galaxy/
├── server/
│   ├── index.js          # Express app: auth routes, /api/chat, /api/explain-node
│   ├── auth.js            # Signup/login/Google verification, JWT issuing
│   └── users.json         # Local user store (auto-created, gitignored data)
├── src/
│   ├── App.jsx             # Auth gate + wires chat, brain view, explain panel
│   ├── components/
│   │   ├── AuthScreen.jsx    # Login/signup + Google button
│   │   ├── ChatSidebar.jsx    # Logo, new chat, history, message thread, input
│   │   ├── MessageBubble.jsx
│   │   ├── Scene.jsx           # Canvas, camera, stars, bloom
│   │   ├── GalaxyGraph.jsx      # Computes layout + reveal order, renders nodes/edges
│   │   ├── NodeMesh.jsx          # Glowing node + always-visible number + label
│   │   ├── EdgeLine.jsx           # Curved glowing connection
│   │   ├── ExplainPanel.jsx        # Floating overlay: explanation + connections list
│   │   ├── Header.jsx               # Live/offline badge
│   │   └── Logo.jsx                  # Neural-node SVG mark
│   ├── api/
│   │   ├── authService.js   # signup/login/Google + session persistence
│   │   ├── graphChatService.js # sends chat, gets reply + graph, offline fallback
│   │   └── graphService.js      # node explanation requests
│   └── utils/
│       ├── layout.js         # 3D force-directed layout algorithm
│       ├── graphOrder.js      # BFS reveal order + stable node numbering
│       ├── themes.js           # rotating color palettes
│       └── mockData.js          # offline fallback generator
├── .env.example
└── package.json
```

## 🎤 Demo tips for judges

1. Open on the login screen — sign up live in 5 seconds, it's real.
2. Send a message. Let the reply stream in on the left, and narrate what's
   happening on the right: "that's not decoration — those are the actual
   concepts in the answer it just gave me."
3. Click 2–3 nodes, show the numbered connections list.
4. If you're comfortable, type one message in Urdu or another language to
   show the multilingual brain.
5. Hit "+ New chat" to show conversation history works like a real app.

## 🔧 Customizing

- **Palette / theme**: edit `PALETTES` in `src/utils/themes.js`.
- **Chat + brain behavior**: edit `CHAT_SYSTEM_PROMPT` in `server/index.js`.
- **Layout feel**: tune `repelStrength`, `springStrength`, `centerPull` in
  `src/utils/layout.js`.

## 📦 Building for submission

```bash
npm run build     # outputs static frontend to dist/
```

You'll still need the backend (`node server/index.js`) running somewhere
reachable for a live demo — e.g. frontend on Vercel/Netlify, backend on
Render/Railway, with the frontend's `/api` proxy pointed at your deployed
backend URL in production.

---

Built with React Three Fiber, Express, and Groq. Good luck at the hackathon! 🚀
