import { createContext } from "react";

export const Mycontext = createContext({
  threads: [],
  currThreadId: null,
  prompt: "",
  setPrompt: () => {},
  messages: [],
  setMessages: () => {},
  isLoading: false,
  newChat: () => {},
  selectThread: () => {},
  deleteThread: () => {},
  renameThread: () => {},
  sendMessage: () => {},
  stopGenerating: () => {},
  editLastMessage: () => {},
  regenerateLast: () => {},
  theme: "dark",
  toggleTheme: () => {},
  streak: 0,
});
