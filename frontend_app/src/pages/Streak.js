import React, { useEffect, useState } from "react";
import { apiGet } from "../services/apiClient";

/**
 * PUBLIC_INTERFACE
 * Streak - Shows user streak from GET /api/streak.
 */
export default function Streak() {
  const [streak, setStreak] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError("");
    const token = localStorage.getItem("jwt_token");
    apiGet("/api/streak", token ? { headers: { Authorization: `Bearer ${token}` } } : {})
      .then(res => { if (mounted && res.ok) setStreak(res.data); })
      .catch(err => { if (mounted) setError(err.message || "Failed to fetch streak."); })
      .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, []);
  return (
    <section className="card" style={{ maxWidth: 400, margin: "2rem auto", padding: "2rem" }}>
      <h1>Your Streak</h1>
      {loading ? <p>Loading...</p> : 
        streak ? <div style={{ fontSize: "2.2rem", color: "var(--primary)" }}>{streak.streak ?? streak}🔥</div>
        : <p>No streak data found.</p>}
      {error && <div role="alert" style={{ color: "var(--error)", marginTop: ".5rem" }}>{error}</div>}
    </section>
  );
}
