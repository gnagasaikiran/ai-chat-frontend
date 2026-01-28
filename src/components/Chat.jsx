import { useEffect, useRef, useState } from "react";
import "./chat.css";
import { API_URL } from "../config";
import AIResponse from "./AIResponse";

// Type guard for safety (works for both mock & real AI replies)
function isStructuredReply(reply) {
  return (
    reply &&
    typeof reply === "object" &&
    !Array.isArray(reply) &&
    ("summary" in reply || "keyPoints" in reply || "nextActions" in reply)
  );
}

export default function Chat() {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([
    { role: "ai", text: "Hi Saikiran 👋 I am your AI assistant." },
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const endRef = useRef(null);

  // Auto-scroll to the latest message
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const sendMessage = async () => {
    if (!message.trim() || loading) return;

    const userMsg = message.trim();
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

      if (!res.ok) {
        const t = await res.text();
        throw new Error(t || "API Error");
      }

      const data = await res.json();
      const reply = data?.reply;

      // ⛔ DO NOT do: { role: "ai", text: data.reply } if reply is an object
      if (isStructuredReply(reply)) {
        setMessages((prev) => [...prev, { role: "ai", data: reply }]); // ✅ correct
      } else {
        setMessages((prev) => [
          ...prev,
          { role: "ai", text: String(reply ?? "No reply returned") },
        ]);
      }
    } catch (e) {
      console.error("sendMessage error:", e);
      setError("Something went wrong. Please try again.");
      setMessages((prev) => [
        ...prev,
        { role: "ai", text: "⚠️ Error: Could not reach backend." },
      ]);
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
              {/* Render AI structured replies using a component */}
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
          placeholder="Type a message..."
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          disabled={loading}
        />
        <button onClick={sendMessage} disabled={loading}>
          Send
        </button>
      </div>
    </div>
  );
}
