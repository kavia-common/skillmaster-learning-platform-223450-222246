import React, { useEffect, useMemo, useState } from "react";
import LoadingSpinner from "../components/common/LoadingSpinner";
import ProgressBar from "../components/common/ProgressBar";
import { Link } from "react-router-dom";
import { useAppState } from "../state/store";
import { fetchSkills as fetchCatalogSkills } from "../api/catalogClient";
import relationalApi, { baseUrl as apiBaseUrl } from "../api/relationalClient";
import { getApiBase } from "../services/apiClient";

/**
 * PUBLIC_INTERFACE
 * SkillsProgress - Lists skills grouped by progressive levels with per-skill progress bars.
 */
export default function SkillsProgress() {
  const { state, actions } = useAppState();
  const userId = state.currentUser.id;

  const [skills, setSkills] = useState([]);
  const [progressEntries, setProgressEntries] = useState([]);
  const [error, setError] = useState("");
  const [hint, setHint] = useState("");
  const [apiBase, setApiBase] = useState(getApiBase());

  // Fetch skills once and user progress
  useEffect(() => {
    let mounted = true;
    setError("");
    setHint("");
    actions.setLoading(true);

    const load = async () => {
      try {
        // Probe backend openapi.json quickly to surface CORS/health early
        try {
          const head = await fetch(`${apiBase}/openapi.json`, {
            method: "HEAD",
            credentials: "include",
            mode: "cors",
          });
          if (!head.ok) {
            const get = await fetch(`${apiBase}/openapi.json`, {
              method: "GET",
              credentials: "include",
              mode: "cors",
            });
            if (!get.ok) {
              throw new Error(`Backend openapi.json probe failed with status ${get.status}`);
            }
          }
        } catch (e) {
          throw new Error(
            `Cannot reach backend at ${apiBase}. ${e?.message || e}. Check server, CORS, or REACT_APP_API_BASE.`
          );
        }

        // Load skills
        const resSkills = await fetchCatalogSkills({ limit: 100, offset: 0 });
        const skillsArr = Array.isArray(resSkills?.data) ? resSkills.data : [];

        // Load progress entries for the user
        const resProgress = await relationalApi
          .getUserProgress(userId)
          .catch(async (e) => {
            // fallback to list progress endpoint
            const alt = await fetch(
              `${apiBase}/progress?user_id=${encodeURIComponent(userId)}&page_size=200`,
              {
                method: "GET",
                credentials: "include",
                headers: { Accept: "application/json" },
                mode: "cors",
              }
            );
            const data = alt.ok ? await alt.json() : { items: [] };
            const items = Array.isArray(data?.progress?.entries)
              ? data.progress.entries
              : Array.isArray(data?.items)
              ? data.items
              : Array.isArray(data)
              ? data
              : [];
            return { data: { progress: { entries: items } } };
          });

        if (!mounted) return;
        setSkills(skillsArr);
        const entries = resProgress?.data?.progress?.entries || [];
        setProgressEntries(Array.isArray(entries) ? entries : []);
      } catch (e) {
        if (!mounted) return;
        setError(e?.message || "Failed to load skills or progress");
        if (e?.uiHint) setHint(e.uiHint);
      } finally {
        if (mounted) actions.setLoading(false);
      }
    };

    load();
    return () => {
      mounted = false;
    };
  }, [userId, actions, apiBase]);

  // Index progress by skill_id and compute completion percentage
  const progressBySkill = useMemo(() => {
    const map = new Map();
    for (const e of progressEntries) {
      const sid = String(e.skill_id || "");
      if (!sid) continue;
      const current = map.get(sid) || { total: 0, completed: 0 };
      current.total += 1;
      if (e.completed) current.completed += 1;
      map.set(sid, current);
    }
    return map;
  }, [progressEntries]);

  function getSkillProgress(skill) {
    const keys = [skill?.id, skill?.slug, skill?.name].map((x) => (x == null ? "" : String(x)));
    for (const k of keys) {
      if (!k) continue;
      const stat = progressBySkill.get(k);
      if (stat && stat.total > 0) {
        return Math.round((stat.completed / stat.total) * 100);
      }
    }
    return 0;
  }

  const grouped = useMemo(() => {
    const groups = {
      Beginner: [],
      Intermediate: [],
      Advanced: [],
      Unknown: [],
    };
    (Array.isArray(skills) ? skills : []).forEach((s) => {
      const level = (s.level || s.difficulty || "").toString().toLowerCase() || "unknown";
      const key =
        level.startsWith("beginner")
          ? "Beginner"
          : level.startsWith("intermediate")
          ? "Intermediate"
          : level.startsWith("advanced")
          ? "Advanced"
          : "Unknown";
      groups[key].push(s);
    });
    return groups;
  }, [skills]);

  const LevelSection = ({ title, items }) => {
    if (!items || items.length === 0) return null;
    return (
      <div className="card" style={{ padding: "1rem", marginBottom: "1rem" }} role="region" aria-label={`${title} skills`}>
        <h2 style={{ margin: 0, fontSize: "1rem" }}>{title}</h2>
        <div className="grid-autofit" style={{ marginTop: ".75rem" }}>
          {items.map((s, idx) => {
            const idOrSlug = s?.id ?? s?.slug ?? s?.name ?? idx;
            const name = s?.name || s?.title || idOrSlug;
            const desc = s?.description || "No description";
            const pct = getSkillProgress(s);
            return (
              <article key={idOrSlug} className="card" role="listitem" style={{ padding: "1rem" }}>
                <header style={{ marginBottom: ".5rem" }}>
                  <h3 style={{ margin: 0, fontSize: "1rem" }}>{name}</h3>
                  {s?.tags && Array.isArray(s.tags) && s.tags.length > 0 && (
                    <div style={{ display: "flex", gap: ".35rem", flexWrap: "wrap", marginTop: ".35rem" }}>
                      {s.tags.slice(0, 3).map((t) => (
                        <span key={t} className="card" style={{ padding: ".15rem .5rem", fontSize: ".75rem" }}>
                          {t}
                        </span>
                      ))}
                    </div>
                  )}
                </header>
                <p style={{ margin: "0 0 .75rem", color: "var(--muted)" }}>{desc}</p>
                <div style={{ marginBottom: ".75rem" }}>
                  <ProgressBar value={pct} label="Your progress" />
                </div>
                <div className="card-footer" style={{ display: "flex", gap: ".5rem", flexWrap: "wrap" }}>
                  <Link
                    className="btn"
                    to={`/skills/${encodeURIComponent(s.id ?? s.slug ?? idOrSlug)}`}
                    aria-label={`View modules for ${name}`}
                  >
                    View Modules
                  </Link>
                  {s?.slug ? (
                    <Link
                      className="btn btn-secondary"
                      to={`/skills/${encodeURIComponent(s.slug)}`}
                      aria-label={`View lessons for ${name}`}
                    >
                      Browse Lessons
                    </Link>
                  ) : null}
                </div>
              </article>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <section className="card" style={{ padding: "1rem" }} aria-label="Skills with Progress">
      <header style={{ marginBottom: "1rem" }}>
        <h1 style={{ marginTop: 0 }}>Skills</h1>
        <p style={{ color: "var(--muted)" }}>
          Explore micro-skills grouped by level. Track your progress for each skill.
        </p>
        <p style={{ color: "var(--muted)", fontSize: ".9rem" }}>
          API base: <code>{apiBase}</code> • <a href={`${apiBase}/__backend_help`} target="_blank" rel="noreferrer">Backend Help</a>
        </p>
      </header>

      {error && (
        <div role="alert" className="card" style={{ padding: ".75rem", borderColor: "var(--error)", marginBottom: ".75rem", whiteSpace: "pre-wrap" }}>
          <strong style={{ color: "var(--error)" }}>Error:</strong> <span>{String(error)}</span>
          {hint ? (
            <div style={{ marginTop: ".5rem", color: "var(--muted)" }}>
              {hint}
            </div>
          ) : (
            <div style={{ marginTop: ".5rem", color: "var(--muted)" }}>
              Ensure the backend is running and seeded. See <a href="/__backend_help">Backend Help</a>.
            </div>
          )}
        </div>
      )}

      {state.ui.loading ? (
        <LoadingSpinner label="Loading skills" />
      ) : (
        <>
          <LevelSection title="Beginner" items={grouped.Beginner} />
          <LevelSection title="Intermediate" items={grouped.Intermediate} />
          <LevelSection title="Advanced" items={grouped.Advanced} />
          {grouped.Unknown && grouped.Unknown.length > 0 && (
            <LevelSection title="Other" items={grouped.Unknown} />
          )}
          {!skills.length && !error && (
            <div className="card" style={{ padding: "1rem" }}>
              <p className="empty-state" style={{ margin: 0 }}>
                No skills available yet.
              </p>
              <p style={{ margin: ".5rem 0 0", color: "var(--muted)" }}>
                Try running backend seeds or review integration at <a href="/__backend_help">Backend Help</a>.
              </p>
            </div>
          )}
        </>
      )}
    </section>
  );
}
