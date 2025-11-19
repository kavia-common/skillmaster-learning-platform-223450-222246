import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAppState } from "../../state/store";
import { apiPost } from "../../services/apiClient";

/**
 * PUBLIC_INTERFACE
 * RegisterForm - Handles user registration and stores JWT token on success.
 * Fields: name, email, password, topics (optional).
 */
export default function RegisterForm() {
  const { actions } = useAppState();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    topics: ""
  });
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
      const res = await apiPost("/api/register", {
        name: form.name,
        email: form.email,
        password: form.password,
        topics: form.topics
          ? form.topics.split(",").map(t => t.trim()).filter(Boolean)
          : []
      });
      if (res.ok && res.data && res.data.token) {
        localStorage.setItem("jwt_token", res.data.token);
        if (res.data.user) {
          actions.setUser(res.data.user);
        }
        navigate("/today", { replace: true });
      } else {
        setError(res.data?.message || "Registration failed. Try again.");
      }
    } catch (err) {
      setError(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="card" style={{ maxWidth: 460, margin: "2rem auto", padding: "2.1rem" }}>
      <h1 style={{ marginTop: 0 }}>Register</h1>
      {error && (
        <div role="alert" className="card" style={{ padding: ".7rem", marginBottom: ".8rem", borderColor: "var(--error)" }}>
          <strong style={{ color: "var(--error)" }}>Error:</strong> {error}
        </div>
      )}
      <form onSubmit={handleSubmit} autoComplete="on">
        <label>
          Name
          <input type="text" name="name" autoComplete="name"
            value={form.name} onChange={handleChange} required style={{ marginBottom: "1rem", width: "100%" }} />
        </label>
        <label>
          Email
          <input type="email" name="email" autoComplete="username"
            value={form.email} onChange={handleChange} required style={{ marginBottom: "1rem", width: "100%" }} />
        </label>
        <label>
          Password
          <input type="password" name="password" autoComplete="new-password"
            value={form.password} onChange={handleChange} required minLength={6} style={{ marginBottom: "1rem", width: "100%" }} />
        </label>
        <label>
          Topics (comma-separated)
          <input type="text" name="topics"
            placeholder="e.g. JavaScript, Leadership, SQL"
            value={form.topics} onChange={handleChange} style={{ marginBottom: "1rem", width: "100%" }} />
        </label>
        <button className="btn" type="submit" style={{ width: "100%" }} disabled={loading}>
          {loading ? "Registering..." : "Register"}
        </button>
        <div style={{ marginTop: "1rem" }}>
          Already have an account? <Link to="/login">Login here</Link>
        </div>
      </form>
    </section>
  );
}
