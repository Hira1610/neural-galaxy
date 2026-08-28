import { useEffect, useRef, useState } from "react";
import Logo from "./Logo.jsx";
import { signup, login, googleSignIn, getAuthConfig } from "../api/authService.js";

export default function AuthScreen({ onAuthenticated }) {
  const [mode, setMode] = useState("login"); // "login" | "signup"
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [googleEnabled, setGoogleEnabled] = useState(false);
  const googleBtnRef = useRef(null);

  useEffect(() => {
    getAuthConfig().then((cfg) => setGoogleEnabled(cfg.googleEnabled));
  }, []);

  useEffect(() => {
    if (!googleEnabled || !window.google || !googleBtnRef.current) return;
    window.google.accounts.id.initialize({
      client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
      callback: async (response) => {
        try {
          setLoading(true);
          const data = await googleSignIn(response.credential);
          onAuthenticated(data);
        } catch (err) {
          setError(err.message);
        } finally {
          setLoading(false);
        }
      },
    });
    window.google.accounts.id.renderButton(googleBtnRef.current, {
      theme: "filled_black",
      size: "large",
      width: 320,
      shape: "pill",
    });
  }, [googleEnabled, onAuthenticated]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const data = mode === "login" ? await login({ email, password }) : await signup({ name, email, password });
      onAuthenticated(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "radial-gradient(ellipse at 50% 30%, #12162a 0%, #05060a 70%)",
        fontFamily: "var(--font-body)",
      }}
    >
      <div
        style={{
          width: 360,
          maxWidth: "90vw",
          background: "var(--panel)",
          border: "1px solid var(--panel-border)",
          borderRadius: 20,
          padding: "34px 30px",
          backdropFilter: "blur(14px)",
          boxShadow: "0 30px 80px rgba(0,0,0,0.5)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
          <Logo size={30} />
          <h1
            style={{
              fontFamily: "var(--font-display)",
              fontSize: 22,
              fontWeight: 600,
              margin: 0,
              color: "var(--ink)",
            }}
          >
            Neural Galaxy
          </h1>
        </div>
        <p style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--ink-dim)", margin: "0 0 26px" }}>
          {mode === "login" ? "welcome back — sign in to continue" : "create an account to get started"}
        </p>

        {googleEnabled && (
          <>
            <div ref={googleBtnRef} style={{ display: "flex", justifyContent: "center", marginBottom: 16 }} />
            <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "4px 0 20px" }}>
              <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.1)" }} />
              <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--ink-dim)" }}>OR</span>
              <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.1)" }} />
            </div>
          </>
        )}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {mode === "signup" && (
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Full name"
              required
              style={inputStyle}
            />
          )}
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            type="email"
            required
            style={inputStyle}
          />
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            type="password"
            required
            minLength={6}
            style={inputStyle}
          />

          {error && <p style={{ color: "#ff8a8a", fontSize: 12, margin: 0 }}>{error}</p>}

          <button
            type="submit"
            disabled={loading}
            style={{
              background: loading ? "rgba(139,127,255,0.3)" : "var(--violet)",
              border: "none",
              borderRadius: 12,
              color: "#05060a",
              fontWeight: 600,
              fontSize: 14,
              padding: "11px 0",
              cursor: loading ? "wait" : "pointer",
              marginTop: 4,
            }}
          >
            {loading ? "Please wait…" : mode === "login" ? "Sign In" : "Create Account"}
          </button>
        </form>

        <p style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--ink-dim)", textAlign: "center", marginTop: 20 }}>
          {mode === "login" ? "Don't have an account? " : "Already have an account? "}
          <button
            onClick={() => {
              setMode((m) => (m === "login" ? "signup" : "login"));
              setError(null);
            }}
            style={{ background: "none", border: "none", color: "var(--cyan)", cursor: "pointer", fontFamily: "var(--font-mono)", fontSize: 11 }}
          >
            {mode === "login" ? "Sign up" : "Sign in"}
          </button>
        </p>
      </div>
    </div>
  );
}

const inputStyle = {
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: 10,
  outline: "none",
  color: "var(--ink)",
  fontFamily: "var(--font-body)",
  fontSize: 14,
  padding: "11px 13px",
};
