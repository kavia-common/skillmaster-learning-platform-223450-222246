import React, { useState } from "react";
import { apiPost } from "../services/apiClient";

/**
 * PUBLIC_INTERFACE
 * AdminLessonUpload - Simple interface for uploading new lessons.
 */
export default function AdminLessonUpload() {
  const [form, setForm] = useState({
    title: "",
    content: "",
    topic: "",
    dayNumber: ""
  });
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = e =>
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async e => {
    e.preventDefault();
    setStatus("");
    setError("");
    setLoading(true);
    try {
      const token = localStorage.getItem("jwt_token");
      const res = await apiPost(
        "/api/admin/lesson",
        {
          title: form.title,
          content: form.content,
          topic: form.topic,
          dayNumber: form.dayNumber
        },
        token ? { headers: { Authorization: `Bearer ${token}` } } : {}
      );
      if (res.ok) {
        setStatus("Lesson uploaded!");
        setForm({ title: "", content: "", topic: "", dayNumber: "" });
      } else {
        setError(res.data?.message || "Upload failed");
      }
    } catch (err) {
      setError(err.message || "Upload failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="card" style={{ maxWidth: 480, margin: "2rem auto", padding: "2rem" }}>
      <h1>Admin: Upload Lesson</h1>
      {status && <div style={{ color: "var(--success)", marginBottom: ".7rem" }}>{status}</div>}
      {error && <div role="alert" style={{ color: "var(--error)", marginBottom: ".7rem" }}>{error}</div>}
      <form onSubmit={handleSubmit} autoComplete="off">
        <label>
          Title
          <input type="text" name="title" value={form.title} onChange={handleChange} required style={{ marginBottom: ".9rem", width: "100%" }} />
        </label>
        <label>
          Content
          <textarea name="content" value={form.content} onChange={handleChange} rows={4} required style={{ marginBottom: "1rem", width: "100%" }} />
        </label>
        <label>
          Topic
          <input type="text" name="topic" value={form.topic} onChange={handleChange} style={{ marginBottom: "1rem", width: "100%" }} />
        </label>
        <label>
          Day Number
          <input type="number" name="dayNumber" value={form.dayNumber} onChange={handleChange} min={1}
            style={{ marginBottom: "1rem", width: "100%" }} />
        </label>
        <button className="btn" type="submit" style={{ width: "100%" }} disabled={loading}>
          {loading ? "Uploading..." : "Upload"}
        </button>
      </form>
    </section>
  );
}
