import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import LoadingSpinner from "../components/common/LoadingSpinner";
import EntityCard from "../components/common/EntityCard";
import ProgressBar from "../components/common/ProgressBar";
import { getModule, listLessonsByModule } from "../api/relationalClient";

/**
 * PUBLIC_INTERFACE
 * LessonsList - Lists Lessons for a given Module.
 * Route: /modules/:moduleId/lessons?page=
 */
export default function LessonsList() {
  const { moduleId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const params = new URLSearchParams(location.search);
  const pageParam = parseInt(params.get("page") || "1", 10);
  const page = Number.isFinite(pageParam) && pageParam > 0 ? pageParam : 1;

  const [mod, setMod] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [total, setTotal] = useState(page * 20);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setErr("");
    Promise.all([
      getModule(moduleId).catch(() => ({ data: null })),
      listLessonsByModule(moduleId, { page, page_size: 12 }),
    ])
      .then(([m, l]) => {
        if (!mounted) return;
        setMod(m?.data || null);
        const items = Array.isArray(l.data?.items)
          ? l.data.items
          : Array.isArray(l.data)
          ? l.data
          : (Array.isArray(l.data?.results) ? l.data.results : []);
        setLessons(items);
        const totalCount = typeof l.data?.total === "number" ? l.data.total : page * 12 + (items.length === 12 ? 12 : 0);
        setTotal(totalCount);
      })
      .catch((e) => {
        if (!mounted) return;
        setErr(e.message || "Failed to load lessons");
      })
      .finally(() => mounted && setLoading(false));
    return () => { mounted = false; };
  }, [moduleId, page]);

  const totalPages = Math.max(1, Math.ceil(total / 12));
  const setPage = (p) => {
    const next = new URLSearchParams(location.search);
    next.set("page", String(p));
    navigate({ pathname: `/modules/${encodeURIComponent(moduleId)}/lessons`, search: `?${next.toString()}` });
  };

  return (
    <section className="card" style={{ padding: "1rem" }} aria-label="Lessons">
      <header style={{ marginBottom: "1rem" }}>
        <h1 style={{ marginTop: 0 }}>{mod?.title || `Module ${moduleId}`}</h1>
        <p style={{ color: "var(--muted)" }}>{mod?.description || "Lessons under this module"}</p>
      </header>

      {err && (
        <div role="alert" className="card" style={{ padding: ".75rem", borderColor: "var(--error)" }}>
          <strong style={{ color: "var(--error)" }}>Error:</strong> <span>{String(err)}</span>
        </div>
      )}

      {loading ? (
        <LoadingSpinner label="Loading lessons" />
      ) : (
        <>
          <div role="list" aria-label="Lesson list" className="grid-autofit">
            {lessons.map((lsn, idx) => (
              <EntityCard
                key={lsn.id ?? lsn.slug ?? idx}
                title={lsn.title || lsn.slug || lsn.id}
                description={lsn.content ? `${String(lsn.content).slice(0, 120)}…` : ""}
                meta={<ProgressBar value={Math.min(100, (lsn.order_index ?? 0) * 10)} label="Progress" />}
                actions={
                  <>
                    <Link
                      className="btn"
                      to={`/lessons/${encodeURIComponent(lsn.id ?? lsn.slug ?? idx)}`}
                      aria-label={`Open lesson ${lsn.title || lsn.id}`}
                      state={{ moduleId, lessonTitle: lsn.title }}
                    >
                      ▶️ Open
                    </Link>
                    <Link
                      className="btn btn-secondary"
                      to={`/learn/${encodeURIComponent(lsn.id ?? lsn.slug ?? idx)}`}
                      aria-label={`Open interactive player for ${lsn.title || lsn.id}`}
                      state={{ moduleId, lessonTitle: lsn.title }}
                    >
                      Player
                    </Link>
                  </>
                }
              />
            ))}
            {!lessons.length && !err && (
              <div className="card" style={{ padding: "1rem" }}>
                <p className="empty-state" style={{ margin: 0 }}>No lessons found.</p>
                <p style={{ margin: ".5rem 0 0", color: "var(--muted)" }}>
                  Check module ID <code>{String(moduleId)}</code> exists and backend seed was run.
                </p>
                <p style={{ margin: ".25rem 0 0" }}>
                  See <a href="/__backend_help">Backend Help</a> for diagnostics and seeding commands.
                </p>
              </div>
            )}
          </div>

          <nav aria-label="Pagination" style={{ display: "flex", gap: ".5rem", alignItems: "center", marginTop: "1rem" }}>
            <button className="btn btn-secondary" type="button" onClick={() => setPage(Math.max(1, page - 1))} disabled={page <= 1}>← Prev</button>
            <span style={{ color: "var(--muted)" }}>Page {page} of {totalPages}</span>
            <button className="btn btn-secondary" type="button" onClick={() => setPage(Math.min(totalPages, page + 1))} disabled={page >= totalPages}>Next →</button>
          </nav>
        </>
      )}
    </section>
  );
}
