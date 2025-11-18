import React, { useEffect } from 'react';
import './App.css';
import Sidebar from './components/layout/Sidebar';
import TopNav from './components/layout/TopNav';
import AppRouter from './routes/Router';

/**
 * PUBLIC_INTERFACE
 * App - Root application shell with sidebar, top navigation, and routed content.
 * Applies global theme variables via CSS and renders the primary routes.
 */
function App() {
  useEffect(() => {
    // Ensure initial theme variables are applied (theme.css defines :root)
    // If future: implement theme toggle, update data-theme on documentElement.
  }, []);

  return (
    <div className="app-shell" data-testid="app-shell">
      <Sidebar />
      <main className="app-main">
        <TopNav />
        <div className="app-content" role="main" aria-live="polite">
          <AppRouter />
        </div>
      </main>
    </div>
  );
}

export default App;
