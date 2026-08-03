import React, { useContext, useState } from "react";
import "./Sidebar.css";
import { Mycontext } from "./Mycontext";
import {
  SquarePen,
  Trash2,
  X,
  Flame,
  Check,
  Rows3,
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
  MessageSquare,
  ChevronRight,
} from "lucide-react";

// turns a timestamp into "2m ago", "3h ago", "5d ago" etc
function timeAgo(dateString) {
  if (!dateString) return "";
  const diffMs = Date.now() - new Date(dateString).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function ThreadRow({ thread, isActive, onSelect, onDelete, onRename }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(thread.title);

  const startEdit = (e) => {
    e.stopPropagation();
    setDraft(thread.title);
    setEditing(true);
  };

  const save = () => {
    if (draft.trim()) onRename(thread.threadId, draft.trim());
    setEditing(false);
  };

  return (
    <div
      className={`thread-item ${isActive ? "active" : ""}`}
      onClick={() => onSelect(thread.threadId)}
    >
      <MessageSquare size={14} className="thread-icon" />
      {editing ? (
        <input
          className="thread-title-input"
          value={draft}
          autoFocus
          onClick={(e) => e.stopPropagation()}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && save()}
          onBlur={save}
        />
      ) : (
        <span className="thread-title" onDoubleClick={startEdit}>
          {thread.title}
        </span>
      )}

      {!editing && (
        <span className="thread-time">{timeAgo(thread.updatedAt)}</span>
      )}

      {editing ? (
        <button className="thread-delete" onClick={save}>
          <Check size={14} />
        </button>
      ) : (
        <button
          className="thread-delete"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(thread.threadId);
          }}
        >
          <Trash2 size={14} />
        </button>
      )}
    </div>
  );
}

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
    isCollapsed,
    toggleCollapse,
    streak,
    user,
    logout,
  } = useContext(Mycontext);

  const [browseOpen, setBrowseOpen] = useState(false);

  const handleSelect = (threadId) => {
    selectThread(threadId);
    setIsSidebarOpen(false);
    setBrowseOpen(false);
  };

  const handleNewChat = () => {
    newChat();
    setBrowseOpen(false);
  };

  return (
    <>
      <section
        className={`sidebar ${isSidebarOpen ? "sidebar-open" : ""} ${isCollapsed ? "sidebar-collapsed" : ""}`}
      >
        <div className="sidebar-top">
          {!isCollapsed && (
            <div className="brand">
              <span className="brand-mark"></span>
              <span className="brand-name">Prompt Verse</span>
            </div>
          )}
          <button
            className="collapse-btn"
            onClick={toggleCollapse}
            title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isCollapsed ? (
              <PanelLeftOpen size={18} />
            ) : (
              <PanelLeftClose size={18} />
            )}
          </button>
          <button className="close-btn" onClick={() => setIsSidebarOpen(false)}>
            <X size={18} />
          </button>
        </div>

        <button
          className="new-chat-btn"
          onClick={handleNewChat}
          title="New chat"
        >
          <SquarePen size={16} />
          {!isCollapsed && <span>New chat</span>}
        </button>

        <button
          className="browse-block"
          onClick={() => setBrowseOpen(true)}
          title="Browse all chats"
        >
          <Rows3 size={16} />
          {!isCollapsed && <span>Browse all chats</span>}
        </button>

        {!isCollapsed && (
          <div className="thread-list">
            {threads.length > 0 && <span className="recent-label">Recent</span>}
            {threads.length === 0 && (
              <p className="thread-empty">Your chats will show up here</p>
            )}
            {threads.slice(0, 6).map((thread) => (
              <ThreadRow
                key={thread.threadId}
                thread={thread}
                isActive={thread.threadId === currThreadId}
                onSelect={handleSelect}
                onDelete={deleteThread}
                onRename={renameThread}
              />
            ))}
          </div>
        )}

        <div className={`sidebar-footer ${isCollapsed ? "collapsed" : ""}`}>
          <div className="user-row">
            <span className="user-avatar">
              {(user?.name || user?.email || "?")[0].toUpperCase()}
            </span>
            {!isCollapsed && (
              <span className="user-text">
                <span className="user-email">{user?.name || user?.email}</span>
                <span className="user-sub">Free plan</span>
              </span>
            )}
            {!isCollapsed && <ChevronRight size={15} className="row-chevron" />}
            <button className="logout-btn" onClick={logout} title="Log out">
              <LogOut size={15} />
            </button>
          </div>
          {!isCollapsed && (
            <div className="streak-badge">
              <span className="streak-icon">
                <Flame size={14} />
              </span>
              <span className="user-text">
                <span className="user-email">{streak} day streak</span>
                <span className="user-sub">Keep it going!</span>
              </span>
              <ChevronRight size={15} className="row-chevron" />
            </div>
          )}
        </div>
      </section>

      {browseOpen && (
        <div className="browse-overlay">
          <div className="browse-header">
            <span className="browse-title">All chats</span>
            <button
              className="close-btn visible"
              onClick={() => setBrowseOpen(false)}
            >
              <X size={20} />
            </button>
          </div>

          <button className="new-chat-btn wide" onClick={handleNewChat}>
            <SquarePen size={16} />
            <span>New chat</span>
          </button>

          <div className="browse-grid">
            {threads.map((thread) => (
              <ThreadRow
                key={thread.threadId}
                thread={thread}
                isActive={thread.threadId === currThreadId}
                onSelect={handleSelect}
                onDelete={deleteThread}
                onRename={renameThread}
              />
            ))}
          </div>
        </div>
      )}
    </>
  );
}

export default Sidebar;
