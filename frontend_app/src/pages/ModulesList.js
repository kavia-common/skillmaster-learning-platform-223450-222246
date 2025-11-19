import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import LoadingSpinner from "../components/common/LoadingSpinner";
import EntityCard from "../components/common/EntityCard";
import ProgressBar from "../components/common/ProgressBar";
import { getSubject, listModulesBySubject, runSeeds as runRelationalSeeds, baseUrl as apiBaseUrl } from "../api/relationalClient";

/**
 * PUBLIC_INTERFACE
 * ModulesList - Lists Modules for a given Subject.
 * Route: /subjects/:subjectId/modules?page=
 */
export default function ModulesList() {
  const { subjectId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const params = new URLSearchParams(location.search);
  const pageParam = parseInt(params.get("page") || "1", 10);
  const page = Number.isFinite(pageParam) && pageParam > 0 ? pageParam : 1;

  const [subject, setSubject] = useState(null);
  const [modules, setModules] = useState([]);
  const [total, setTotal] = useState(page * 20);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setErr("");
    Promise.all([
      getSubject(subjectId).catch(() => ({ data: null })),
      listModulesBySubject(subjectId, { page, page_size: 12 }),
    ])
      .then(([s, m]) => {
        if (!mounted) return;
        setSubject(s?.data || null);
        const items = Array.isArray(m.data?.items)
          ? m.data.items
          : Array.isArray(m.data)
          ? m.data
          : (Array.isArray(m.data?.results) ? m.data.results : []);
        setModules(items);
        const totalCount = typeof m.data?.total === "number" ? m.data.total : page * 12 + (items.length === 12 ? 12 : 0);
        setTotal(totalCount);
      })
      .catch((e) => {
        if (!mounted) return;
        setErr(e.message || "Failed to load modules");
      })
      .finally(() => mounted && setLoading(false));
    return () => { mounted = false; };
  }, [subjectId, page]);

  const totalPages = Math.max(1, Math.ceil(total / 12));
  const setPage = (p) => {
    const next = new URLSearchParams(location.search);
    next.set("page", String(p));
    navigate({ pathname: `/subjects/${encodeURIComponent(subjectId)}/modules`, search: `?${next.toString()}` });
  };

  return (
    <section className="card" style={{ padding: "1rem" }} aria-label="Modules">
      <header style={{ marginBottom: "1rem" }}>
        <h1 style={{ marginTop: 0 }}>{subject?.title || `Subject ${subjectId}`}</h1>
        <p style={{ color: "var(--muted)" }}>{subject?.description || "Modules under this subject"}</p>
      </header>

      {err && (
        <div role="alert" className="card" style={{ padding: ".75rem", borderColor: "var(--error)" }}>
          <strong style={{ color: "var(--error)" }}>Error:</strong> <span>{String(err)}</span>
        </div>
      )}

      {loading ? (
        <LoadingSpinner label="Loading modules" />
      ) : (
        <>
          <div role="list" aria-label="Module list" className="grid-autofit">
            {modules.map((m, idx) => (
              <EntityCard
                key={m.id ?? m.slug ?? idx}
                title={m.title || m.slug || m.id}
                description={m.description || ""}
                meta={<ProgressBar value={Math.min(100, (m.order_index ?? 0) * 10)} label="Progress" />}
                actions={
                  <Link
                    className="btn"
                    to={`/modules/${encodeURIComponent(m.id ?? m.slug ?? idx)}/lessons`}
                    aria-label={`View lessons for ${m.title || m.id}`}
                  >
                    View Lessons
                  </Link>
                }
              />
            ))}
            {!modules.length && !err && (
              <div className="card" style={{ padding: "1rem" }}>
                <p className="empty-state" style={{ margin: 0 }}>No modules found.</p>
                <p style={{ margin: ".5rem 0 0", color: "var(--muted)" }}>
                  Backend API base: <code>{apiBaseUrl}</code>
                </p>
                <div style={{ display: "flex", gap: ".5rem", marginTop: ".5rem", flexWrap: "wrap" }}>
                  <button
                    type="button"
                    className="btn"
                    onClick={async () => {
                      const ok = await runRelationalSeeds();
                      if (ok) {
                        navigate(0);
                      } else {
                        setErr("Seeding failed. Open Backend Help for details.");
                      }
                    }}
                  >
                    Seed data and reload
                  </button>
                  <a className="btn btn-secondary" href={`${apiBaseUrl}/__backend_help`} target="_blank" rel="noreferrer">
                    Backend Help
                  </a>
                </div>
                <p style={{ margin: ".5rem 0 0", color: "var(--muted)" }}>
                  Ensure the backend has seeded data and that subject ID <code>{String(subjectId)}</code> exists.
                </p>
                <p style={{ margin: ".25rem 0 0", color: "var(--muted)" }}>
                  Expected CORS: <code>Access-Control-Allow-Origin: {window.location.origin}</code> and <code>Access-Control-Allow-Credentials: true</code>
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
