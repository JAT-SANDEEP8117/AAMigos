import { useMemo, useRef, useState } from "react";
import { sendChatbotMessage } from "../../services/api";
import "./ChatbotWidget.css";

const STARTER_MESSAGES = [
  {
    role: "assistant",
    content: "Hi, I can help with AAMigos features, workflows, modules, and FAQs.",
  },
];

export default function ChatbotWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState(STARTER_MESSAGES);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef(null);

  const visibleMessages = useMemo(() => messages.slice(-20), [messages]);

  const handleToggle = () => {
    setOpen((current) => !current);
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const text = input.trim();
    if (!text || loading) return;

    const nextMessages = [...messages, { role: "user", content: text }];
    setMessages(nextMessages);
    setInput("");
    setError("");
    setLoading(true);

    try {
      const history = nextMessages.filter((item) => item.role !== "assistant" || item.content !== STARTER_MESSAGES[0].content);
      const data = await sendChatbotMessage(text, history.slice(0, -1));
      setMessages([...nextMessages, { role: "assistant", content: data.reply }]);
    } catch (err) {
      setError(err.message || "Chatbot is unavailable right now");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="chatbot">
      {open && (
        <section className="chatbot__panel" aria-label="AAMigos chatbot">
          <div className="chatbot__header">
            <div>
              <p className="chatbot__title">AAMigos Help</p>
              <p className="chatbot__subtitle">Project questions only</p>
            </div>
            <button type="button" className="chatbot__close" onClick={handleToggle} aria-label="Close chatbot">
              x
            </button>
          </div>

          <div className="chatbot__messages">
            {visibleMessages.map((message, index) => (
              <div
                key={`${message.role}-${index}`}
                className={`chatbot__message chatbot__message--${message.role}`}
              >
                {message.content}
              </div>
            ))}
            {loading && <div className="chatbot__message chatbot__message--assistant">Thinking...</div>}
          </div>

          {error && <p className="chatbot__error">{error}</p>}

          <form className="chatbot__form" onSubmit={handleSubmit}>
            <input
              ref={inputRef}
              className="chatbot__input"
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Ask about AAMigos..."
              disabled={loading}
            />
            <button type="submit" className="chatbot__send" disabled={loading || !input.trim()}>
              Send
            </button>
          </form>
        </section>
      )}

      <button type="button" className="chatbot__toggle" onClick={handleToggle} aria-label="Open AAMigos chatbot">
        Chat
      </button>
    </div>
  );
}
