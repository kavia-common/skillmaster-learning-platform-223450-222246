import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import LoadingSpinner from "../components/common/LoadingSpinner";
import { fetchLessonById } from "../api/catalogClient";

/**
 * PUBLIC_INTERFACE
 * LessonDetailNew - Renders lesson content (text/video) and a simple 3-question quiz.
 * Route: /lessons/:id
 */
export default function LessonDetailNew() {
  const { id } = useParams();
  const location = useLocation();
  const skillSlug = location.state?.skillSlug;

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [lesson, setLesson] = useState(null);

  // Simple quiz state
  const [answers, setAnswers] = useState({ q1: "", q2: "", q3: "" });
  const [score, setScore] = useState(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setErr("");
    fetchLessonById(id, { skillSlug })
      .then((res) => {
        if (!mounted) return;
        setLesson(res.data || null);
      })
      .catch((e) => {
        if (!mounted) return;
        setErr(e.message || "Failed to load lesson");
      })
      .finally(() => mounted && setLoading(false));

    return () => {
      mounted = false;
    };
  }, [id, skillSlug]);

  const hasVideo = useMemo(() => {
    const c = lesson?.content || "";
    return /https?:\/\/(www\.)?(youtube\.com|youtu\.be|vimeo\.com)\//i.test(c);
  }, [lesson]);

  const videoEmbed = useMemo(() => {
    if (!hasVideo) return null;
    const c = lesson?.content || "";
    const yt = c.match(/https?:\/\/(?:www\.)?youtu(?:be\.com\/watch\?v=|\.be\/)([A-Za-z0-9_\-]+)/i);
    if (yt) {
      const vid = yt[1];
      return (
        <iframe
          title="Lesson video"
          width="100%"
          height="360"
          src={`https://www.youtube.com/embed/${vid}`}
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          style={{ borderRadius: "12px" }}
        />
      );
    }
    // Fallback: link out
    return (
      <a href={c} target="_blank" rel="noreferrer" className="btn">
        Open Video
      </a>
    );
  }, [hasVideo, lesson]);

  const evaluateQuiz = (e) => {
    e.preventDefault();
    // Demo keys; in real data, quiz would come from lesson payload
    const correct = { q1: "a", q2: "b", q3: "c" };
    let s = 0;
    if (answers.q1 === correct.q1) s += 1;
    if (answers.q2 === correct.q2) s += 1;
    if (answers.q3 === correct.q3) s += 1;
    setScore(s);
  };

  return (
    <section className="card" style={{ padding: "1rem" }} aria-label="Lesson Detail">
      <header style={{ marginBottom: "1rem" }}>
        <h1 style={{ marginTop: 0 }}>{lesson?.title || "Lesson"}</h1>
        <p style={{ color: "var(--muted)" }}>Lesson ID: <strong>{id}</strong></p>
      </header>

      {err && (
        <div role="alert" className="card" style={{ padding: ".75rem", borderColor: "var(--error)" }}>
          <strong style={{ color: "var(--error)" }}>Error:</strong> <span>{String(err)}</span>
        </div>
      )}

      {loading ? (
        <LoadingSpinner label="Loading lesson" />
      ) : (
        <>
          <div className="card" role="region" aria-label="Lesson content" style={{ padding: "1rem", marginBottom: "1rem" }}>
            {hasVideo ? (
              videoEmbed
            ) : (
              <article style={{ whiteSpace: "pre-wrap" }}>
                {lesson?.content || "No content provided."}
              </article>
            )}
          </div>

          <form className="card" onSubmit={evaluateQuiz} role="region" aria-label="Lesson quiz" style={{ padding: "1rem" }}>
            <h2 style={{ marginTop: 0, fontSize: "1rem" }}>Quick Quiz</h2>

            <div style={{ display: "grid", gap: ".75rem" }}>
              <div>
                <label htmlFor="q1">1) Select option A</label>
                <select
                  id="q1"
                  value={answers.q1}
                  onChange={(e) => setAnswers((p) => ({ ...p, q1: e.target.value }))}
                  style={{ marginLeft: ".5rem" }}
                >
                  <option value="">--</option>
                  <option value="a">A</option>
                  <option value="b">B</option>
                  <option value="c">C</option>
                </select>
              </div>
              <div>
                <label htmlFor="q2">2) Select option B</label>
                <select
                  id="q2"
                  value={answers.q2}
                  onChange={(e) => setAnswers((p) => ({ ...p, q2: e.target.value }))}
                  style={{ marginLeft: ".5rem" }}
                >
                  <option value="">--</option>
                  <option value="a">A</option>
                  <option value="b">B</option>
                  <option value="c">C</option>
                </select>
              </div>
              <div>
                <label htmlFor="q3">3) Select option C</label>
                <select
                  id="q3"
                  value={answers.q3}
                  onChange={(e) => setAnswers((p) => ({ ...p, q3: e.target.value }))}
                  style={{ marginLeft: ".5rem" }}
                >
                  <option value="">--</option>
                  <option value="a">A</option>
                  <option value="b">B</option>
                  <option value="c">C</option>
                </select>
              </div>
            </div>

            <div style={{ marginTop: "1rem", display: "flex", alignItems: "center", gap: ".75rem" }}>
              <button className="btn" type="submit">Check Answers</button>
              {score != null && (
                <span aria-live="polite" style={{ color: "var(--muted)" }}>
                  Score: {score}/3
                </span>
              )}
            </div>
          </form>
        </>
      )}
    </section>
  );
}
