import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import LoadingSpinner from "../components/common/LoadingSpinner";
import { fetchSkills } from "../api/catalogClient";

/**
 * PUBLIC_INTERFACE
 * SkillsList - Lists skills from backend with category filter and pagination.
 * Routes: /skills?category=...&page=1
 */
export default function SkillsList() {
  const location = useLocation();
  const navigate = useNavigate();

  const params = new URLSearchParams(location.search);
  const category = (params.get("category") || "").trim();
  const pageParam = parseInt(params.get("page") || "1", 10);
  const page = Number.isFinite(pageParam) && pageParam > 0 ? pageParam : 1;

  const [skills, setSkills] = useState([]);
  const [total, setTotal] = useState(0); // if backend provides, otherwise infer
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const limit = 12;
  const offset = (page - 1) * limit;

  const categories = useMemo(
    () => [
      "All",
      "Digital Skills",
      "Communication Skills",
      "Career Skills",
      "Leadership",
      "Creativity",
    ],
    []
  );

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError("");
    fetchSkills({ category: category || undefined, limit, offset })
      .then((res) => {
        if (!mounted) return;
        const data = Array.isArray(res.data?.items) ? res.data.items : res.data;
        // Try to read total if present; otherwise approximate
        const totalCount =
          typeof res.data?.total === "number"
            ? res.data.total
            : (Array.isArray(data) ? data.length : 0) + offset + (data?.length === limit ? limit : 0);

        setSkills(Array.isArray(data) ? data : []);
        setTotal(totalCount);
      })
      .catch((e) => {
        if (!mounted) return;
        setError(e.message || "Failed to load skills");
      })
      .finally(() => mounted && setLoading(false));

    return () => {
      mounted = false;
    };
  }, [category, page, limit, offset]);

  const totalPages = Math.max(1, Math.ceil(total / limit));

  const setCategory = (cat) => {
    const next = new URLSearchParams(location.search);
    if (!cat || cat === "All") next.delete("category");
    else next.set("category", cat);
    next.set("page", "1");
    navigate({ pathname: "/skills", search: `?${next.toString()}` });
  };

  const setPage = (p) => {
    const next = new URLSearchParams(location.search);
    next.set("page", String(p));
    navigate({ pathname: "/skills", search: `?${next.toString()}` });
  };

  return (
    <section className="card" style={{ padding: "1rem" }} aria-label="Skills List Page">
      <header style={{ marginBottom: "1rem" }}>
        <h1 style={{ marginTop: 0 }}>Skills</h1>
        <p style={{ color: "var(--muted)" }}>
          Browse micro-skills. Filter by category and use pagination controls.
        </p>
      </header>

      {/* Category filter */}
      <div
        role="group"
        aria-label="Category filter"
        style={{ display: "flex", gap: ".5rem", flexWrap: "wrap", marginBottom: ".75rem" }}
      >
        {categories.map((c) => {
          const active = (category || "All") === c;
          return (
            <button
              key={c}
              type="button"
              className="btn btn-secondary"
              aria-pressed={active}
              onClick={() => setCategory(c)}
              style={{
                background: active ? "var(--primary)" : "var(--surface)",
                color: active ? "#fff" : "var(--text)",
              }}
            >
              {c}
            </button>
          );
        })}
      </div>

      {error && (
        <div role="alert" className="card" style={{ padding: ".75rem", borderColor: "var(--error)" }}>
          <strong style={{ color: "var(--error)" }}>Error:</strong> <span>{String(error)}</span>
        </div>
      )}

      {loading ? (
        <LoadingSpinner label="Loading skills" />
      ) : (
        <>
          <div role="list" aria-label="Skill list" className="grid-autofit">
            {skills.map((s) => (
              <article key={s.slug || s.id} role="listitem" className="card" style={{ padding: "1rem" }}>
                <h2 style={{ margin: "0 0 .5rem", fontSize: "1rem" }}>{s.title || s.name || s.slug || s.id}</h2>
                <p style={{ margin: "0 0 1rem", color: "var(--muted)" }}>
                  {s.description || "No description"}
                </p>
                <Link
                  className="btn"
                  to={`/skills/${encodeURIComponent(s.slug || s.id)}`}
                  aria-label={`Details for ${s.title || s.name || s.slug || s.id}`}
                >
                  View Skill
                </Link>
              </article>
            ))}
            {!skills.length && !error && (
              <div className="card" style={{ padding: "1rem" }}>
                <p className="empty-state" style={{ margin: 0 }}>
                  No skills found.
                </p>
              </div>
            )}
          </div>

          {/* Pagination */}
          <nav
            aria-label="Pagination"
            style={{ display: "flex", gap: ".5rem", alignItems: "center", marginTop: "1rem" }}
          >
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page <= 1}
            >
              ← Prev
            </button>
            <span style={{ color: "var(--muted)" }}>
              Page {page} of {totalPages}
            </span>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page >= totalPages}
            >
              Next →
            </button>
          </nav>
        </>
      )}
    </section>
  );
}
