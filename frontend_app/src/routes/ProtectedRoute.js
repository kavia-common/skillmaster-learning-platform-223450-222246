import React from "react";
import { Navigate, useLocation } from "react-router-dom";

/**
 * PUBLIC_INTERFACE
 * ProtectedRoute - Renders children only if user is authenticated (JWT in localStorage).
 * Otherwise redirects to login.
 */
export default function ProtectedRoute({ children }) {
  const location = useLocation();

  const token = localStorage.getItem("jwt_token");
  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return children;
}
