import React, { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import LoadingSpinner from "../components/common/LoadingSpinner";
import EntityCard from "../components/common/EntityCard";
import ProgressBar from "../components/common/ProgressBar";
import { listSubjects } from "../api/relationalClient";

/**
 * PUBLIC_INTERFACE
 * SubjectsList - Lists Subjects with search and pagination.
 * Route: /subjects?search=&page=
 */
export default function SubjectsList() {
  const location = useLocation();
  const navigate = useNavigate();

  const params = new URLSearchParams(location.search);
  const searchParam = (params.get("search") || "").trim();
  const pageParam = parseInt(params.get("page") || "1", 10);
  const page = Number.isFinite(pageParam) && pageParam > 0 ? pageParam : 1;

  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(page * 20); // optimistic fallback
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const [q, setQ] = useState(searchParam);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setErr("");
    listSubjects({ search: searchParam || undefined, page, page_size: 12 })
      .then((res) => {
        if (!mounted) return;
        // Support either {items,total} or array directly
        const data = Array.isArray(res.data?.items) ? res.data.items : Array.isArray(res.data) ? res.data : [];
        const totalCount = typeof res.data?.total === "number" ? res.data.total : page * 12 + (data.length === 12 ? 12 : 0);
        setItems(data);
        setTotal(totalCount);
      })
      .catch((e) => {
        if (!mounted) return;
        setErr(e.message || "Failed to load subjects");
      })
      .finally(() => mounted && setLoading(false));
    return () => { mounted = false; };
  }, [searchParam, page]);

  const totalPages = Math.max(1, Math.ceil(total / 12));
  const setPage = (p) => {
    const next = new URLSearchParams(location.search);
    next.set("page", String(p));
    navigate({ pathname: "/subjects", search: `?${next.toString()}` });
  };
  const submitSearch = (e) => {
    e.preventDefault();
    const next = new URLSearchParams(location.search);
    if (q) next.set("search", q);
    else next.delete("search");
    next.set("page", "1");
    navigate({ pathname: "/subjects", search: `?${next.toString()}` });
  };

  const placeholderProgress = useMemo(() => Math.min(100, Math.round((items.length % 7) * 14.3)), [items.length]);

  return (
    <section className="card" style={{ padding: "1rem" }} aria-label="Subjects">
      <header style={{ marginBottom: "1rem" }}>
        <h1 style={{ marginTop: 0 }}>Subjects</h1>
        <p style={{ color: "var(--muted)" }}>Explore subjects, then drill into modules and lessons.</p>
      </header>

      <form onSubmit={submitSearch} role="search" aria-label="Subject search" style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: ".5rem", marginBottom: ".75rem" }}>
        <label className="visually-hidden" htmlFor="subject-search">Search subjects</label>
        <input
          id="subject-search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search by title…"
          type="search"
          style={{ padding: ".6rem .75rem", borderRadius: 8, border: "1px solid var(--border)", background: "var(--surface)", color: "var(--text)" }}
        />
        <button type="submit" className="btn">🔎 Search</button>
      </form>

      {err && (
        <div role="alert" className="card" style={{ padding: ".75rem", borderColor: "var(--error)" }}>
          <strong style={{ color: "var(--error)" }}>Error:</strong> <span>{String(err)}</span>
        </div>
      )}

      {loading ? (
        <LoadingSpinner label="Loading subjects" />
      ) : (
        <>
          <div role="list" aria-label="Subject list" className="grid-autofit">
            {items.map((s) => (
              <EntityCard
                key={s.id}
                title={s.title || s.slug || s.id}
                description={s.description || ""}
                meta={<ProgressBar value={placeholderProgress} label="Progress" />}
                actions={
                  <Link className="btn" to={`/subjects/${encodeURIComponent(s.id)}/modules`} aria-label={`View modules for ${s.title || s.id}`}>
                    View Modules
                  </Link>
                }
              />
            ))}
            {!items.length && !err && (
              <div className="card" style={{ padding: "1rem" }}>
                <p className="empty-state" style={{ margin: 0 }}>No subjects found.</p>
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
