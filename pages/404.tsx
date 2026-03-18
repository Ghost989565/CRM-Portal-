export default function Custom404() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#020617",
        color: "#f8fafc",
        fontFamily: "system-ui, sans-serif",
        padding: "24px",
      }}
    >
      <div
        style={{
          maxWidth: "520px",
          width: "100%",
          border: "1px solid rgba(148, 163, 184, 0.2)",
          borderRadius: "16px",
          background: "#0f172a",
          padding: "32px",
          boxShadow: "0 24px 60px rgba(0, 0, 0, 0.35)",
        }}
      >
        <p style={{ margin: 0, fontSize: "12px", letterSpacing: "0.2em", textTransform: "uppercase", color: "#94a3b8" }}>
          Pantheon
        </p>
        <h1 style={{ margin: "16px 0 0", fontSize: "32px", lineHeight: 1.1 }}>Page not found</h1>
        <p style={{ margin: "12px 0 0", fontSize: "14px", lineHeight: 1.6, color: "#cbd5e1" }}>
          The page you opened isn&apos;t available. Try going back to the portal dashboard.
        </p>
        <a
          href="/portal"
          style={{
            display: "inline-block",
            marginTop: "24px",
            padding: "10px 16px",
            borderRadius: "10px",
            background: "#f8fafc",
            color: "#020617",
            textDecoration: "none",
            fontWeight: 600,
          }}
        >
          Back to dashboard
        </a>
      </div>
    </div>
  )
}
