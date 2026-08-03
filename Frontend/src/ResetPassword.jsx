import React, { useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import "./AuthPages.css";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8080";

function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/auth/reset-password/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong");
      setSuccess(true);
      setTimeout(() => navigate("/login"), 1800);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-brand">
          <span className="auth-brand-mark"></span>
          <span className="auth-brand-name">Prompt Verse</span>
        </div>

        <h1>Set a new password</h1>
        <p className="auth-sub">Make it something you'll remember</p>

        {error && <div className="auth-error">{error}</div>}
        {success && <div className="auth-success">Password updated. Taking you to login...</div>}

        {!success && (
          <form onSubmit={handleSubmit}>
            <div className="auth-field">
              <label>New password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>
            <button className="auth-submit" disabled={loading}>
              {loading ? "Updating..." : "Update password"}
            </button>
          </form>
        )}

        <p className="auth-footer-link">
          <Link to="/login">Back to login</Link>
        </p>
      </div>
    </div>
  );
}

export default ResetPassword;
