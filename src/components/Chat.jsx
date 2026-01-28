import { useEffect, useRef, useState } from "react";
import "./chat.css";
import { API_URL } from "../config";
import AIResponse from "./AIResponse";

function isStructuredReply(reply) {
  return (
    reply &&
    typeof reply === "object" &&
    !Array.isArray(reply) &&
    ("summary" in reply || "keyPoints" in reply || "nextActions" in reply)
  );
}

const MAX_LEN = 500;

export default function Chat() {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([
    { role: "ai", text: "Hi Saikiran 👋 I am your AI assistant." },
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const sendMessage = async () => {
    if (loading) return;
    const raw = message ?? "";
    const trimmed = raw.trim();

    // Client-side validation mirrors backend (never trust client only)
    if (!trimmed) {
      setError("Please type a message before sending.");
      return;
    }
    if (trimmed.length > MAX_LEN) {
      setError(`Message too long (max ${MAX_LEN} characters).`);
      return;
    }

    const userMsg = trimmed;
    setMessages((prev) => [...prev, { role: "user", text: userMsg }]);
    setMessage("");
    setError("");
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMsg }),
      });

      // Map common server errors to friendly text
      if (!res.ok) {
        let friendly = "Something went wrong. Please try again.";
        const status = res.status;

        try {
          const errJson = await res.json();
          // Prefer server-provided message if present
          if (errJson?.error?.message) friendly = errJson.error.message;

          if (status === 400)
            friendly = errJson?.error?.message || "Invalid input.";
          if (status === 413)
            friendly = errJson?.error?.message || "Message too long.";
          if (status === 429)
            friendly =
              errJson?.error?.message || "Too many requests, slow down.";
          if (status >= 500) friendly = "Server error. Try again in a moment.";
        } catch {
          // ignore JSON parse errors; stick with default friendly message
        }

        setError(friendly);
        setMessages((prev) => [
          ...prev,
          { role: "ai", text: `⚠️ ${friendly}` },
        ]);
        return; // stop here on non-OK
      }

      const data = await res.json();
      const reply = data?.reply;

      if (isStructuredReply(reply)) {
        setMessages((prev) => [...prev, { role: "ai", data: reply }]);
      } else {
        setMessages((prev) => [
          ...prev,
          { role: "ai", text: String(reply ?? "No reply returned") },
        ]);
      }
    } catch (e) {
      console.error("sendMessage error:", e);
      const friendly = "Network error. Please check your connection.";
      setError(friendly);
      setMessages((prev) => [...prev, { role: "ai", text: `⚠️ ${friendly}` }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="chat-wrap">
      <h2 className="title">AI Chat</h2>

      <div className="chat-box">
        {messages.map((m, idx) => (
          <div key={idx} className={`msg ${m.role}`}>
            <div className="bubble">
              {m.role === "ai" && m.data ? (
                <AIResponse data={m.data} />
              ) : (
                <span>{m.text}</span>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="msg ai">
            <div className="bubble">Typing…</div>
          </div>
        )}

        <div ref={endRef} />
      </div>

      {error && <p style={{ color: "crimson", marginTop: 8 }}>{error}</p>}

      <div className="chat-input">
        <input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder={`Type a message (max ${MAX_LEN} chars)…`}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          disabled={loading}
          maxLength={MAX_LEN + 1} // soft cap in UI; backend still enforces
        />
        <button onClick={sendMessage} disabled={loading}>
          Send
        </button>
      </div>
    </div>
  );
}
