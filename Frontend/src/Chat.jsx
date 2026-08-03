import React, { useContext, useEffect, useRef, useState } from "react";
import "./Chat.css";
import { Mycontext } from "./Mycontext";
import ReactMarkdown from "react-markdown";
import {
  Copy,
  Check,
  Pencil,
  RotateCcw,
  Sparkles,
  Feather,
  Lightbulb,
  Code2,
  TrendingUp,
} from "lucide-react";

const STARTERS = [
  {
    icon: Feather,
    color: "#ff6b9d",
    label: "Write",
    sub: "emails, stories, or anything",
    prompt: "Help me write an email, story, or something creative.",
  },
  {
    icon: Lightbulb,
    color: "#ffb020",
    label: "Explain",
    sub: "concepts and ideas clearly",
    prompt: "Explain a concept or idea to me clearly.",
  },
  {
    icon: Code2,
    color: "#b06bff",
    label: "Code",
    sub: "debug, optimize, or build",
    prompt: "Help me write, debug, or optimize some code.",
  },
  {
    icon: TrendingUp,
    color: "#3ecf8e",
    label: "Analyze",
    sub: "data, trends, and insights",
    prompt: "Help me analyze some data or trends.",
  },
];

function ThinkingDots() {
  return (
    <div className="thinking">
      <span className="portal-mark">
        <Sparkles size={9} />
      </span>
      <span className="thinking-text">Thinking</span>
    </div>
  );
}

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <button className="msg-action-btn" onClick={handleCopy}>
      {copied ? <Check size={13} /> : <Copy size={13} />}
      <span>{copied ? "Copied" : "Copy"}</span>
    </button>
  );
}

function TypedText({ text }) {
  const [shown, setShown] = useState("");

  useEffect(() => {
    setShown("");
    let i = 0;
    const step = Math.max(1, Math.floor(text.length / 120));
    const interval = setInterval(() => {
      i += step;
      setShown(text.slice(0, i));
      if (i >= text.length) clearInterval(interval);
    }, 12);
    return () => clearInterval(interval);
  }, [text]);

  return <ReactMarkdown>{shown}</ReactMarkdown>;
}

function Chat() {
  const { messages, isLoading, editLastMessage, regenerateLast, sendMessage } =
    useContext(Mycontext);
  const bottomRef = useRef(null);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");

  const lastAssistantIndex = messages
    .map((m) => m.role)
    .lastIndexOf("assistant");
  const lastUserIndex = messages.map((m) => m.role).lastIndexOf("user");

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const startEdit = () => {
    setDraft(messages[lastUserIndex].content);
    setEditing(true);
  };

  const saveEdit = () => {
    setEditing(false);
    if (draft.trim()) editLastMessage(draft.trim());
  };

  if (messages.length === 0 && !isLoading) {
    return (
      <div className="chat-empty">
        <span className="portal-mark large">
          <Sparkles size={20} />
        </span>
        <h1>
          What can I <span className="accent-text">help with?</span>
        </h1>
        <p>Ask anything. Prompt Verse remembers this conversation as you go.</p>

        <div className="starter-grid">
          {STARTERS.map((starter) => {
            const Icon = starter.icon;
            return (
              <button
                key={starter.label}
                className="starter-card"
                onClick={() => sendMessage(starter.prompt)}
              >
                <span className="starter-icon" style={{ color: starter.color }}>
                  <Icon size={18} />
                </span>
                <span className="starter-label">{starter.label}</span>
                <span className="starter-sub">{starter.sub}</span>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="chat-scroll">
      <div className="chat-inner">
        {messages.map((msg, index) => (
          <div key={index} className={`msg-row ${msg.role}`}>
            <div className={`msg-avatar ${msg.role}`}>
              <span className="msg-avatar-inner">
                {msg.role === "user" ? (
                  "Y"
                ) : (
                  <span className="portal-mark small">
                    <Sparkles size={9} />
                  </span>
                )}
              </span>
            </div>
            <div className="msg-body">
              {msg.role === "user" && editing && index === lastUserIndex ? (
                <div className="edit-box">
                  <textarea
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    autoFocus
                  />
                  <div className="edit-actions">
                    <button onClick={() => setEditing(false)}>Cancel</button>
                    <button className="save" onClick={saveEdit}>
                      Save & resend
                    </button>
                  </div>
                </div>
              ) : (
                <div className="msg-content">
                  {msg.role === "assistant" && index === lastAssistantIndex ? (
                    <TypedText text={msg.content} />
                  ) : (
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                  )}
                </div>
              )}

              <div className="msg-actions">
                {msg.role === "assistant" && <CopyButton text={msg.content} />}
                {msg.role === "assistant" &&
                  index === lastAssistantIndex &&
                  !isLoading && (
                    <button className="msg-action-btn" onClick={regenerateLast}>
                      <RotateCcw size={13} />
                      <span>Regenerate</span>
                    </button>
                  )}
                {msg.role === "user" &&
                  index === lastUserIndex &&
                  !editing &&
                  !isLoading && (
                    <button className="msg-action-btn" onClick={startEdit}>
                      <Pencil size={13} />
                      <span>Edit</span>
                    </button>
                  )}
              </div>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="msg-row assistant">
            <div className="msg-avatar assistant">
              <span className="msg-avatar-inner">
                <span className="portal-mark small">
                  <Sparkles size={9} />
                </span>
              </span>
            </div>
            <div className="msg-body">
              <ThinkingDots />
            </div>
          </div>
        )}

        <div ref={bottomRef}></div>
      </div>
    </div>
  );
}

export default Chat;
