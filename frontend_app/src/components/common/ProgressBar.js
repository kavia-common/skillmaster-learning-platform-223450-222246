import React from "react";

/**
 * PUBLIC_INTERFACE
 * ProgressBar - horizontal progress indicator with label.
 *
 * @param {object} props
 * @param {number} props.value - Current progress value (0..100)
 * @param {string} [props.label] - Optional inline label
 */
export default function ProgressBar({ value = 0, label }) {
  const pct = Math.max(0, Math.min(100, Number(value) || 0));
  return (
    <div aria-label={label || "Progress"} style={{ width: "100%" }}>
      {label ? (
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
          <span style={{ color: "var(--muted)", fontSize: ".9rem" }}>{label}</span>
          <span style={{ color: "var(--muted)", fontSize: ".9rem" }}>{pct}%</span>
        </div>
      ) : null}
      <div
        style={{
          width: "100%",
          height: 10,
          borderRadius: 999,
          background: "var(--surface-2)",
          border: "1px solid var(--border)",
          boxShadow: "var(--shadow-sm)",
          overflow: "hidden",
        }}
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={pct}
      >
        <div
          style={{
            width: `${pct}%`,
            height: "100%",
            background: "linear-gradient(90deg, var(--primary-500), var(--primary))",
            transition: "width var(--transition-normal)",
          }}
        />
      </div>
    </div>
  );
}
