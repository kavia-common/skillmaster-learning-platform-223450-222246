import React, { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import LoadingSpinner from "../components/common/LoadingSpinner";
import { fetchSkillBySlug, fetchLessonsBySkillSlug } from "../api/catalogClient";

/**
 * PUBLIC_INTERFACE
 * SkillDetailNew - Skill detail by slug, listing lessons from catalog API.
 * Route: /skills/:slug
 */
export default function SkillDetailNew() {
  const { slug } = useParams();
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [skill, setSkill] = useState(null);
  const [lessons, setLessons] = useState([]);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setErr("");
    Promise.all([fetchSkillBySlug(slug), fetchLessonsBySkillSlug(slug)])
      .then(([s, l]) => {
        if (!mounted) return;
        setSkill(s.data || null);
        setLessons(Array.isArray(l.data) ? l.data : []);
      })
      .catch((e) => {
        if (!mounted) return;
        setErr(e.message || "Failed to load skill");
      })
      .finally(() => mounted && setLoading(false));

    return () => {
      mounted = false;
    };
  }, [slug]);

  const title = skill?.title || skill?.name || slug;

  const grouped = useMemo(() => {
    // If lessons carry module info, could group; else keep flat
    return lessons;
  }, [lessons]);

  return (
    <section className="card" style={{ padding: "1rem" }} aria-label="Skill Detail">
      <header style={{ marginBottom: "1rem" }}>
        <h1 style={{ marginTop: 0 }}>{title}</h1>
        <p style={{ color: "var(--muted)" }}>{skill?.description || "Skill details and lessons"}</p>
      </header>

      {err && (
        <div role="alert" className="card" style={{ padding: ".75rem", borderColor: "var(--error)" }}>
          <strong style={{ color: "var(--error)" }}>Error:</strong> <span>{String(err)}</span>
        </div>
      )}

      {loading ? (
        <LoadingSpinner label="Loading skill" />
      ) : (
        <>
          <div className="card" role="region" aria-label="Lessons" style={{ padding: "1rem" }}>
            <h2 style={{ marginTop: 0, fontSize: "1rem" }}>Lessons</h2>
            <ul style={{ marginTop: ".5rem" }}>
              {grouped.map((lsn) => (
                <li key={lsn.id} style={{ margin: ".5rem 0" }}>
                  <Link
                    className="btn"
                    to={`/lessons/${encodeURIComponent(lsn.id)}`}
                    aria-label={`Open lesson ${lsn.title || lsn.id}`}
                    state={{
                      skillSlug: slug,
                      lessonTitle: lsn.title,
                    }}
                  >
                    ▶️ Start {lsn.title || lsn.id}
                  </Link>
                </li>
              ))}
              {!grouped.length && <li style={{ color: "var(--muted)" }}>No lessons available.</li>}
            </ul>
          </div>
        </>
      )}
    </section>
  );
}
