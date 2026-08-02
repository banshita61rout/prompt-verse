import React, { useContext, useState } from "react";
import "./Sidebar.css";
import { Mycontext } from "./Mycontext";
import { SquarePen, Trash2, X, Sun, Moon, Flame, Check } from "lucide-react";

function Sidebar() {
  const {
    threads,
    currThreadId,
    newChat,
    selectThread,
    deleteThread,
    renameThread,
    isSidebarOpen,
    setIsSidebarOpen,
    theme,
    toggleTheme,
    streak,
  } = useContext(Mycontext);

  const [editingId, setEditingId] = useState(null);
  const [draftTitle, setDraftTitle] = useState("");

  const handleSelect = (threadId) => {
    selectThread(threadId);
    setIsSidebarOpen(false);
  };

  const handleDelete = (e, threadId) => {
    e.stopPropagation();
    deleteThread(threadId);
  };

  const startEditing = (e, thread) => {
    e.stopPropagation();
    setEditingId(thread.threadId);
    setDraftTitle(thread.title);
  };

  const saveTitle = (threadId) => {
    if (draftTitle.trim()) renameThread(threadId, draftTitle.trim());
    setEditingId(null);
  };

  return (
    <section className={`sidebar ${isSidebarOpen ? "sidebar-open" : ""}`}>
      <div className="sidebar-top">
        <div className="brand">
          <span className="brand-mark"></span>
          <span className="brand-name">Prompt Verse</span>
        </div>
        <button className="close-btn" onClick={() => setIsSidebarOpen(false)}>
          <X size={18} />
        </button>
      </div>

      <button className="new-chat-btn" onClick={newChat}>
        <SquarePen size={16} />
        <span>New chat</span>
      </button>

      <div className="thread-list">
        {threads.length === 0 && (
          <p className="thread-empty">Your chats will show up here</p>
        )}
        {threads.map((thread) => (
          <div
            key={thread.threadId}
            className={`thread-item ${thread.threadId === currThreadId ? "active" : ""}`}
            onClick={() => handleSelect(thread.threadId)}
          >
            {editingId === thread.threadId ? (
              <input
                className="thread-title-input"
                value={draftTitle}
                autoFocus
                onClick={(e) => e.stopPropagation()}
                onChange={(e) => setDraftTitle(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && saveTitle(thread.threadId)}
                onBlur={() => saveTitle(thread.threadId)}
              />
            ) : (
              <span
                className="thread-title"
                onDoubleClick={(e) => startEditing(e, thread)}
              >
                {thread.title}
              </span>
            )}

            {editingId === thread.threadId ? (
              <button className="thread-delete" onClick={() => saveTitle(thread.threadId)}>
                <Check size={14} />
              </button>
            ) : (
              <button
                className="thread-delete"
                onClick={(e) => handleDelete(e, thread.threadId)}
              >
                <Trash2 size={14} />
              </button>
            )}
          </div>
        ))}
      </div>

      <div className="sidebar-footer">
        <div className="footer-row">
          <button className="theme-toggle" onClick={toggleTheme}>
            {theme === "dark" ? <Sun size={14} /> : <Moon size={14} />}
            <span>{theme === "dark" ? "Light mode" : "Dark mode"}</span>
          </button>
          <div className="streak-badge">
            <Flame size={14} />
            <span>{streak}</span>
          </div>
        </div>
        <span className="credit-line">Built by Banshita, powered by curiosity</span>
      </div>
    </section>
  );
}

export default Sidebar;
