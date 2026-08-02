import React, { useContext, useRef, useState } from "react";
import "./ChatWindow.css";
import Chat from "./Chat";
import { Mycontext } from "./Mycontext";
import { Menu, ArrowUp, Square, Mic, MicOff } from "lucide-react";

// browser's built-in speech recognition, works free with no API
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

function ChatWindow() {
  const { prompt, setPrompt, sendMessage, stopGenerating, isLoading, setIsSidebarOpen } =
    useContext(Mycontext);
  const textareaRef = useRef(null);
  const recognitionRef = useRef(null);
  const [isListening, setIsListening] = useState(false);

  const handleChange = (e) => {
    setPrompt(e.target.value);
    const el = textareaRef.current;
    if (el) {
      el.style.height = "auto";
      el.style.height = Math.min(el.scrollHeight, 160) + "px";
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSend = () => {
    if (isLoading) return;
    sendMessage();
    if (textareaRef.current) textareaRef.current.style.height = "auto";
  };

  const toggleMic = () => {
    if (!SpeechRecognition) {
      alert("Voice input isn't supported in this browser. Try Chrome.");
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-US";

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setPrompt((prev) => (prev ? prev + " " + transcript : transcript));
    };
    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);

    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
  };

  return (
    <section className="chat-window">
      <header className="chat-header">
        <button className="menu-btn" onClick={() => setIsSidebarOpen(true)}>
          <Menu size={20} />
        </button>
        <span className="chat-header-title">Prompt Verse</span>
        <span className="model-badge">Llama 3.3 70B</span>
      </header>

      <Chat />

      <div className="input-area">
        <div className="input-pill">
          <button
            className={`mic-btn ${isListening ? "listening" : ""}`}
            onClick={toggleMic}
            type="button"
          >
            {isListening ? <MicOff size={17} /> : <Mic size={17} />}
          </button>

          <textarea
            ref={textareaRef}
            rows={1}
            placeholder="Message Prompt Verse..."
            value={prompt}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
          />

          {isLoading ? (
            <button className="send-btn stop" onClick={stopGenerating}>
              <Square size={14} fill="currentColor" />
            </button>
          ) : (
            <button
              className="send-btn"
              onClick={handleSend}
              disabled={!prompt.trim()}
            >
              <ArrowUp size={18} />
            </button>
          )}
        </div>
        <p className="input-hint">Prompt Verse is an AI. Double-check anything important.</p>
      </div>
    </section>
  );
}

export default ChatWindow;
