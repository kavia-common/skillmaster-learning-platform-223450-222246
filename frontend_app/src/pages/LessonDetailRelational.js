import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import LoadingSpinner from "../components/common/LoadingSpinner";
import ProgressBar from "../components/common/ProgressBar";
import { getLesson } from "../api/relationalClient";

/**
 * PUBLIC_INTERFACE
 * LessonDetailRelational - Lesson detail with activities/quiz (relational backend).
 * Route: /lessons/:lessonId (coexists with LessonDetailNew)
 */
export default function LessonDetailRelational() {
  const { lessonId } = useParams();
  const location = useLocation();

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [lesson, setLesson] = useState(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setErr("");
    getLesson(lessonId, { include_nested: true })
      .then((res) => {
        if (!mounted) return;
        setLesson(res.data || null);
      })
      .catch((e) => {
        if (!mounted) return;
        setErr(e.message || "Failed to load lesson");
      })
      .finally(() => mounted && setLoading(false));
    return () => { mounted = false; };
  }, [lessonId]);

  const activities = useMemo(() => Array.isArray(lesson?.activities) ? lesson.activities : [], [lesson]);
  const hasQuiz = activities.some(a => a.type === "quiz");

  return (
    <section className="card" style={{ padding: "1rem" }} aria-label="Lesson Detail (Relational)">
      <header style={{ marginBottom: "1rem" }}>
        <h1 style={{ marginTop: 0 }}>{lesson?.title || "Lesson"}</h1>
        <p style={{ color: "var(--muted)" }}>Lesson ID: <strong>{lessonId}</strong></p>
      </header>

      {err && (
        <div role="alert" className="card" style={{ padding: ".75rem", borderColor: "var(--error)" }}>
          <strong style={{ color: "var(--error)" }}>Error:</strong> <span>{String(err)}</span>
          <div style={{ marginTop: ".5rem", color: "var(--muted)" }}>
            If this is a fresh environment, run the seeds. See <a href="/__backend_help">Backend Help</a>.
          </div>
        </div>
      )}

      {loading ? (
        <LoadingSpinner label="Loading lesson" />
      ) : (
        <>
          <div className="card" role="region" aria-label="Lesson content" style={{ padding: "1rem", marginBottom: "1rem" }}>
            <article style={{ whiteSpace: "pre-wrap" }}>
              {lesson?.content || "No content available."}
            </article>
          </div>

          <div className="card" role="region" aria-label="Activities" style={{ padding: "1rem", marginBottom: "1rem" }}>
            <h2 style={{ marginTop: 0, fontSize: "1rem" }}>Activities</h2>
            {activities.length === 0 ? (
              <p className="empty-state">No activities defined.</p>
            ) : (
              <ul style={{ marginTop: ".5rem" }}>
                {activities.map((a) => (
                  <li key={a.id} style={{ margin: ".5rem 0" }}>
                    <strong>{a.type === "quiz" ? "📝 Quiz" : "📄 Content"}:</strong> {a.title || a.id}
                    {a.type === "quiz" && Array.isArray(a.quiz_questions) && (
                      <div style={{ marginTop: ".25rem", color: "var(--muted)" }}>
                        {a.quiz_questions.length} questions — pass score {a.quiz_pass_score ?? "N/A"}
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="card" role="region" aria-label="Progress indicator" style={{ padding: "1rem" }}>
            <ProgressBar value={hasQuiz ? 50 : 25} label="Lesson progress (demo)" />
          </div>
        </>
      )}
    </section>
  );
}
