"use client";

import { useEffect } from "react";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("RUANG FAKTA runtime error:", error);
  }, [error]);

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        padding: "32px",
        background: "#f7f4ee",
        color: "#1f2933",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <section style={{ maxWidth: 680, textAlign: "center" }}>
        <p style={{ fontSize: 14, letterSpacing: "0.12em", fontWeight: 700 }}>
          RUANG FAKTA
        </p>
        <h1 style={{ fontSize: 42, margin: "12px 0" }}>
          Terjadi gangguan sementara.
        </h1>
        <p style={{ fontSize: 18, lineHeight: 1.6, color: "#5b6570" }}>
          Server mengalami kesalahan saat memuat halaman. Silakan coba lagi.
        </p>
        {error.digest ? (
          <p
            style={{
              marginTop: 18,
              fontFamily: "monospace",
              fontSize: 13,
              color: "#7a828b",
            }}
          >
            Digest: {error.digest}
          </p>
        ) : null}
        <button
          type="button"
          onClick={() => reset()}
          style={{
            marginTop: 24,
            border: 0,
            borderRadius: 10,
            padding: "12px 20px",
            background: "#111827",
            color: "white",
            fontSize: 16,
            cursor: "pointer",
          }}
        >
          Coba lagi
        </button>
      </section>
    </main>
  );
}
