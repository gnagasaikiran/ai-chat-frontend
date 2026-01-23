import { useState } from "react";
import "./chat.css";
import { API_URL } from "../config";

export default function Chat() {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([
    { role: "ai", text: "Hi Saikiran 👋 I am your AI assistant." },
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const sendMessage = async () => {
    if (!message.trim()) return;

    const userMsg = message;
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
        const errText = await res.text();
        throw new Error(errText || "API Error");
      }

      const data = await res.json();
      setMessages((prev) => [...prev, { role: "ai", text: data.reply }]);
    } catch (e) {
      setError("Something went wrong. Please try again.");
      setMessages((prev) => [
        ...prev,
        { role: "ai", text: "⚠️ Error: Could not reach backend." },
      ]);
      console.error(e);
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
            <div className="bubble">{m.text}</div>
          </div>
        ))}

        {loading && (
          <div className="msg ai">
            <div className="bubble">Typing...</div>
          </div>
        )}
      </div>

      {error && <p style={{ color: "crimson" }}>{error}</p>}

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
