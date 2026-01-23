import { useState } from "react";
import "./chat.css";

export default function Chat() {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([
    { role: "ai", text: "Hi Saikiran 👋 I am your AI assistant (mock)." },
  ]);

  const sendMessage = () => {
    if (!message.trim()) return;

    setMessages((prev) => [...prev, { role: "user", text: message }]);
    setMessage("");

    // Temporary mock AI reply (Day 4 will connect backend)
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        { role: "ai", text: "Mock reply: I received your message ✅" },
      ]);
    }, 400);
  };

  return (
    <div className="chat-wrap">
      <h2 className="title">AI Chat (Frontend)</h2>

      <div className="chat-box">
        {messages.map((m, idx) => (
          <div key={idx} className={`msg ${m.role}`}>
            <div className="bubble">{m.text}</div>
          </div>
        ))}
      </div>

      <div className="chat-input">
        <input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type a message..."
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        />
        <button onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
}
