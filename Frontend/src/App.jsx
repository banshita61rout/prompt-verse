import { useEffect, useRef, useState } from "react";
import "./App.css";
import Sidebar from "./Sidebar";
import ChatWindow from "./ChatWindow";
import { Mycontext } from "./Mycontext";
import { useAuth } from "./AuthContext";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8080";

// works out today's streak from what's saved in localStorage
function calculateStreak() {
  const today = new Date().toDateString();
  const saved = JSON.parse(localStorage.getItem("pv-streak") || "null");

  if (!saved) {
    localStorage.setItem(
      "pv-streak",
      JSON.stringify({ lastDate: today, count: 1 }),
    );
    return 1;
  }
  if (saved.lastDate === today) return saved.count;

  const yesterday = new Date(Date.now() - 86400000).toDateString();
  const newCount = saved.lastDate === yesterday ? saved.count + 1 : 1;
  localStorage.setItem(
    "pv-streak",
    JSON.stringify({ lastDate: today, count: newCount }),
  );
  return newCount;
}

function App() {
  const { user, logout } = useAuth();
  const [threads, setThreads] = useState([]);
  const [currThreadId, setCurrThreadId] = useState(null);
  const [prompt, setPrompt] = useState("");
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(
    () => localStorage.getItem("pv-collapsed") === "true",
  );
  const [streak, setStreak] = useState(0);
  const abortRef = useRef(null);

  const toggleCollapse = () => {
    setIsCollapsed((prev) => {
      localStorage.setItem("pv-collapsed", String(!prev));
      return !prev;
    });
  };

  useEffect(() => {
    setStreak(calculateStreak());
  }, []);

  const getAllThreads = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/thread`, {
        credentials: "include",
      });
      const data = await res.json();
      setThreads(data);
    } catch (err) {
      console.log("failed to load threads", err);
    }
  };

  useEffect(() => {
    getAllThreads();
  }, []);

  const newChat = () => {
    setCurrThreadId(null);
    setMessages([]);
    setPrompt("");
  };

  const selectThread = async (threadId) => {
    setCurrThreadId(threadId);
    try {
      const res = await fetch(`${API_BASE}/api/thread/${threadId}`, {
        credentials: "include",
      });
      const data = await res.json();
      setMessages(data);
    } catch (err) {
      console.log("failed to load thread", err);
    }
  };

  const deleteThread = async (threadId) => {
    try {
      await fetch(`${API_BASE}/api/thread/${threadId}`, {
        method: "DELETE",
        credentials: "include",
      });
      setThreads((prev) => prev.filter((t) => t.threadId !== threadId));
      if (threadId === currThreadId) {
        newChat();
      }
    } catch (err) {
      console.log("failed to delete thread", err);
    }
  };

  const renameThread = async (threadId, title) => {
    // update on screen right away, don't make the user wait on the request
    setThreads((prev) =>
      prev.map((t) => (t.threadId === threadId ? { ...t, title } : t)),
    );
    try {
      await fetch(`${API_BASE}/api/thread/${threadId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ title }),
      });
    } catch (err) {
      console.log("failed to rename thread", err);
    }
  };

  const sendMessage = async (text) => {
    const messageToSend = text ?? prompt;
    if (!messageToSend.trim()) return;

    const threadId = currThreadId || crypto.randomUUID();
    if (!currThreadId) setCurrThreadId(threadId);

    setMessages((prev) => [...prev, { role: "user", content: messageToSend }]);
    setPrompt("");
    setIsLoading(true);

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const res = await fetch(`${API_BASE}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ threadId, message: messageToSend }),
        signal: controller.signal,
      });
      const data = await res.json();

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.reply },
      ]);
      await getAllThreads();
    } catch (err) {
      if (err.name === "AbortError") {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: "Stopped." },
        ]);
      } else {
        console.log("failed to send message", err);
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: "Something went wrong. Please try again.",
          },
        ]);
      }
    } finally {
      setIsLoading(false);
      abortRef.current = null;
    }
  };

  const stopGenerating = () => {
    abortRef.current?.abort();
  };

  // edits the last user message and asks for a fresh reply, dropping everything after it from view
  const editLastMessage = (newText) => {
    setMessages((prev) => {
      const lastUserIdx = prev.map((m) => m.role).lastIndexOf("user");
      return lastUserIdx === -1 ? prev : prev.slice(0, lastUserIdx);
    });
    sendMessage(newText);
  };

  // drops the last assistant reply and asks the same question again
  const regenerateLast = () => {
    const lastUser = [...messages].reverse().find((m) => m.role === "user");
    if (!lastUser) return;
    setMessages((prev) => prev.slice(0, -1));
    sendMessage(lastUser.content);
  };

  const providerValues = {
    threads,
    currThreadId,
    prompt,
    setPrompt,
    messages,
    setMessages,
    isLoading,
    newChat,
    selectThread,
    deleteThread,
    renameThread,
    sendMessage,
    stopGenerating,
    editLastMessage,
    regenerateLast,
    isSidebarOpen,
    setIsSidebarOpen,
    isCollapsed,
    toggleCollapse,
    streak,
    user,
    logout,
  };

  return (
    <div className="app">
      <Mycontext.Provider value={providerValues}>
        <Sidebar></Sidebar>
        <ChatWindow></ChatWindow>
      </Mycontext.Provider>
    </div>
  );
}

export default App;
