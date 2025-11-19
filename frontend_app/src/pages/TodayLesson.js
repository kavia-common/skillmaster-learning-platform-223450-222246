import React, { useEffect, useState } from "react";
import { useAppState } from "../state/store";
import { apiGet, apiPost } from "../services/apiClient";

/**
 * PUBLIC_INTERFACE
 * TodayLesson - Shows today's lesson; allow user to mark as complete.
 * Uses GET /api/lesson/today and POST /api/lesson/complete.
 */
export default function TodayLesson() {
  const { actions } = useAppState();
  const [lesson, setLesson] = useState(null);
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState(false);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError("");
    actions.clearError();
    apiGet("/api/lesson/today", addAuth())
      .then(res => {
        if (res.ok && mounted) setLesson(res.data);
      })
      .catch(err => {
        if (mounted) setError(err.message || "Failed to load lesson.");
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => { mounted = false; };
  }, []);

  const markComplete = async () => {
    setCompleting(true);
    setMsg(""); setError("");
    try {
      const res = await apiPost("/api/lesson/complete", {}, addAuth());
      if (res.ok) setMsg("Marked complete!");
      else setError("Failed to mark as complete.");
    } catch (err) {
      setError(err.message || "Mark complete failed.");
    } finally {
      setCompleting(false);
    }
  };

  function addAuth() {
    const token = localStorage.getItem("jwt_token");
    return token ? { headers: { Authorization: `Bearer ${token}` } } : {};
  }

  return (
    <section className="card" style={{ maxWidth: 540, margin: "1.5rem auto", padding: "2rem" }}>
      <h1>Today's Lesson</h1>
      {loading
        ? <p>Loading...</p>
        : lesson
          ? (
            <>
              <h2 style={{ fontSize: "1.3rem" }}>{lesson.title}</h2>
              <div style={{ margin: "1rem 0" }}>
                <p>{lesson.content}</p>
                {lesson.topic && <span className="card" style={{ padding: ".2rem .7rem", fontSize: ".85rem" }}>{lesson.topic}</span>}
                {lesson.dayNumber && <span style={{ marginLeft: "1.2rem", color: "var(--muted)" }}>Day {lesson.dayNumber}</span>}
              </div>
              <button className="btn" type="button" onClick={markComplete} disabled={completing} style={{ background: "var(--success)" }}>
                {completing ? "Marking..." : "Mark Complete"}
              </button>
              {msg && <span style={{ color: "var(--success)", marginLeft: "2rem" }}>{msg}</span>}
            </>
          ) : <div>No lesson found.</div>
      }
      {error && <div role="alert" style={{ color: "var(--error)", marginTop: ".5rem" }}>{error}</div>}
    </section>
  );
}
