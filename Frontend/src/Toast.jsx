import React, { useEffect, useState } from "react";
import "./Toast.css";

function Toast({ message, duration = 4000 }) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(false), duration);
    return () => clearTimeout(timer);
  }, [duration]);

  if (!visible) return null;

  return (
    <div className="toast">
      <span className="toast-mark"></span>
      <span>{message}</span>
    </div>
  );
}

export default Toast;
