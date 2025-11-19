import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAppState } from "./state/store";
import AppRouter from "./routes/Router";

/**
 * PUBLIC_INTERFACE
 * Main App component with navigation bar, showing login/logout/profile state.
 */
export default function App() {
  const { state, actions } = useAppState();
  const navigate = useNavigate();
  // Check JWT
  const token = (() => {
    try { return (typeof localStorage !== "undefined" && localStorage.getItem("jwt_token")) || null; } catch { return null; }
  })();

  function handleLogout() {
    if (window.confirm("Log out?")) {
      localStorage.removeItem("jwt_token");
      actions.setUser(null);
      navigate("/login");
    }
  }

  return (
    <div>
      <header style={{
        background: "linear-gradient(90deg, #2563EB10, #F59E0B06)",
        borderBottom: "1px solid var(--border)",
        marginBottom: "2rem",
        padding: "1rem 0"
      }}>
        <nav style={{
          maxWidth: 900,
          margin: "0 auto",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "1.1rem"
        }}>
          <div>
            <Link to="/" style={{ fontWeight: 700, color: "var(--primary)", fontSize: "1.1rem", marginRight: "1.2rem" }}>
              DailyByte
            </Link>
            <Link to="/today" style={{ marginRight: ".8rem" }}>Today's Lesson</Link>
            <Link to="/streak" style={{ marginRight: ".8rem" }}>Streak</Link>
            <Link to="/admin">Admin</Link>
          </div>
          <div>
            {token
              ? (
                <>
                  <span style={{ fontWeight: 600, color: "var(--secondary)", marginRight: "1.2rem" }}>
                    {state.currentUser?.name || "User"}
                  </span>
                  <button className="btn btn-secondary" type="button" onClick={handleLogout} style={{ marginLeft: ".6rem" }}>
                    Logout
                  </button>
                </>
              )
              : (
                <>
                  <Link to="/login" className="btn" style={{ marginRight: "1rem" }}>Login</Link>
                  <Link to="/register" className="btn btn-secondary">Register</Link>
                </>
              )}
          </div>
        </nav>
      </header>
      <main>
        <AppRouter />
      </main>
    </div>
  );
}
