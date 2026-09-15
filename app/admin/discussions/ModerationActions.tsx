"use client";

import { useState } from "react";

export default function ModerationActions({ commentId, status }: { commentId: string; status: string }) {
  const [busy, setBusy] = useState(false);
  const [current, setCurrent] = useState(status);
  const [error, setError] = useState("");

  async function moderate(nextStatus: "APPROVED" | "REJECTED" | "HIDDEN") {
    setBusy(true);
    setError("");
    try {
      const response = await fetch(`/api/comments/${commentId}/moderate`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });
      const data = await response.json().catch(() => null);
      if (!response.ok) throw new Error(data?.error || "Gagal memperbarui moderasi.");
      setCurrent(nextStatus);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal memperbarui moderasi.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="moderation-actions">
      <span className={`adminStatus ${current}`}>{current}</span>
      <button className="secondaryButton" type="button" disabled={busy} onClick={() => moderate("APPROVED")}>{busy ? "Memproses…" : "Setujui"}</button>
      <button className="dangerButton" type="button" disabled={busy} onClick={() => moderate("REJECTED")}>Tolak</button>
      <button className="secondaryButton" type="button" disabled={busy} onClick={() => moderate("HIDDEN")}>Sembunyikan</button>
      {error && <small role="alert">{error}</small>}
    </div>
  );
}
