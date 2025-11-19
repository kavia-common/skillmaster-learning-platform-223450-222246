import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAppState } from "../../state/store";
import { apiPost } from "../../services/apiClient";

/**
 * PUBLIC_INTERFACE
 * LoginForm - Handles user login and stores JWT token in localStorage.
 * On success: updates global user state, saves token.
 * On failure: displays error message.
 */
export default function LoginForm() {
  const { actions } = useAppState();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = e =>
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async e => {
    e.preventDefault();
    setError("");
    setLoading(true);
    actions.clearError();
    try {
      const res = await apiPost("/api/login", {
        email: form.email,
        password: form.password
      });
      if (res.ok && res.data && res.data.token) {
        localStorage.setItem("jwt_token", res.data.token);
        if (res.data.user) {
          actions.setUser(res.data.user);
        }
        navigate("/today", { replace: true });
      } else {
        setError("Invalid credentials. Please try again.");
      }
    } catch (err) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="card" style={{ maxWidth: 440, margin: "2rem auto", padding: "2rem" }}>
      <h1 style={{ marginTop: 0 }}>Login</h1>
      {error && (
        <div role="alert" className="card" style={{ padding: ".7rem", marginBottom: ".8rem", borderColor: "var(--error)" }}>
          <strong style={{ color: "var(--error)" }}>Error:</strong> {error}
        </div>
      )}
      <form onSubmit={handleSubmit} autoComplete="on">
        <label>
          Email
          <input type="email" name="email" autoComplete="username"
            value={form.email}
            onChange={handleChange} required
            style={{ marginBottom: "1rem", width: "100%" }} />
        </label>
        <label>
          Password
          <input type="password" name="password" autoComplete="current-password"
            value={form.password}
            onChange={handleChange} required
            style={{ marginBottom: "1rem", width: "100%" }} />
        </label>
        <button className="btn" type="submit" style={{ width: "100%" }} disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>
        <div style={{ marginTop: "1rem" }}>
          Don't have an account? <Link to="/register">Register here</Link>
        </div>
      </form>
    </section>
  );
}
