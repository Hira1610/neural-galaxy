import { useState, useCallback, useEffect } from "react";
import Scene from "./components/Scene.jsx";
import Header from "./components/Header.jsx";
import ChatSidebar from "./components/ChatSidebar.jsx";
import LoadingOverlay from "./components/LoadingOverlay.jsx";
import ExplainPanel from "./components/ExplainPanel.jsx";
import AuthScreen from "./components/AuthScreen.jsx";
import { getSession, clearSession } from "./api/authService.js";
import { sendChatMessage } from "./api/graphChatService.js";
import { generateMockGraph } from "./utils/mockData.js";
import { randomPalette, DEFAULT_PALETTE } from "./utils/themes.js";

let convoIdCounter = 0;

function newConversation() {
  return { id: ++convoIdCounter, title: "New chat", messages: [] };
}

export default function App() {
  const [session, setSession] = useState(() => getSession());
  const [conversations, setConversations] = useState(() => [newConversation()]);
  const [activeConversationId, setActiveConversationId] = useState(() => conversations[0]?.id);
  const [graph, setGraph] = useState(() => generateMockGraph("neural galaxy"));
  const [lastTopic, setLastTopic] = useState("neural galaxy");
  const [palette, setPalette] = useState(DEFAULT_PALETTE);
  const [mode, setMode] = useState("offline");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedNode, setSelectedNode] = useState(null);

  useEffect(() => {
    if (!conversations.length) {
      const c = newConversation();
      setConversations([c]);
      setActiveConversationId(c.id);
    }
  }, [conversations.length]);

  const handleNewChat = useCallback(() => {
    const c = newConversation();
    setConversations((prev) => [c, ...prev]);
    setActiveConversationId(c.id);
    setSelectedNode(null);
  }, []);

  const handleSelectConversation = useCallback((id) => {
    setActiveConversationId(id);
    setSelectedNode(null);
  }, []);

  const handleSendMessage = useCallback(
    async (text) => {
      setError(null);
      setSelectedNode(null);
      setLoading(true);

      const activeId = activeConversationId;
      setConversations((prev) =>
        prev.map((c) =>
          c.id === activeId
            ? {
                ...c,
                title: c.messages.length === 0 ? text.slice(0, 40) : c.title,
                messages: [...c.messages, { role: "user", content: text }],
              }
            : c
        )
      );

      try {
        const current = conversations.find((c) => c.id === activeId);
        const history = (current?.messages || []).map((m) => ({ role: m.role, content: m.content }));
        const payload = [...history, { role: "user", content: text }];

        const result = await sendChatMessage(payload);

        setConversations((prev) =>
          prev.map((c) =>
            c.id === activeId
              ? { ...c, messages: [...c.messages, { role: "assistant", content: result.reply }] }
              : c
          )
        );

        setGraph(result);
        setLastTopic(text);
        setMode(result.source === "live" ? "live" : "offline");
        setPalette(randomPalette());
      } catch (err) {
        setError("Something went wrong. Try again.");
      } finally {
        setLoading(false);
      }
    },
    [activeConversationId, conversations]
  );

  const handleNodeSelect = useCallback((node) => {
    setSelectedNode((cur) => (cur?.id === node.id ? null : node));
  }, []);

  const handleLogout = useCallback(() => {
    clearSession();
    setSession(null);
  }, []);

  if (!session) {
    return <AuthScreen onAuthenticated={setSession} />;
  }

  return (
    <div style={{ display: "flex", width: "100vw", height: "100vh", background: "var(--void)" }}>
      <ChatSidebar
        user={session.user}
        conversations={conversations}
        activeConversationId={activeConversationId}
        onNewChat={handleNewChat}
        onSelectConversation={handleSelectConversation}
        onSendMessage={handleSendMessage}
        onLogout={handleLogout}
        loading={loading}
        error={error}
        palette={palette}
      />

      {/* Only two flex children in this row (sidebar + this pane), so the
          graph pane's own box is always the true remaining space — the 3D
          scene centers within it and never drifts, regardless of whether
          the explain overlay (which is absolutely positioned INSIDE this
          same pane) is open or closed. */}
      <div style={{ position: "relative", flex: 1, minWidth: 0, height: "100vh" }}>
        <Scene graph={graph} onNodeSelect={handleNodeSelect} selectedNodeId={selectedNode?.id} palette={palette} />
        <Header mode={mode} />
        <LoadingOverlay visible={loading} />
        <ExplainPanel
          node={selectedNode}
          graph={graph}
          context={lastTopic}
          onClose={() => setSelectedNode(null)}
          onSelectRelated={handleNodeSelect}
          palette={palette}
        />
      </div>
    </div>
  );
}
