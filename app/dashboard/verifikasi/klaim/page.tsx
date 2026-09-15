"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function ClaimVerificationPage() {
  const router = useRouter();
  const [statement, setStatement] = useState("");
  const [sourceUrl, setSourceUrl] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault(); setLoading(true); setMessage("");
    try {
      const response = await fetch("/api/verification/claims", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ statement }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Gagal membuat klaim.");
      if (sourceUrl) await fetch(`/api/verification/claims/${data.data.id}/evidence`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ type: "OFFICIAL_SOURCE", title: "Sumber pendukung", sourceUrl }) });
      setMessage("Klaim berhasil dibuat dan siap diperiksa reviewer.");
      setTimeout(() => router.push("/dashboard/verifikasi"), 800);
    } catch (error) { setMessage(error instanceof Error ? error.message : "Gagal membuat klaim."); }
    finally { setLoading(false); }
  }

  return <main className="public-page"><section className="container content-section"><div className="dashboard-section"><span className="section-kicker">KLAIM</span><h1>Ajukan pernyataan untuk diperiksa</h1><p>Status klaim selalu terpisah dari status identitas atau peran Anda. Reviewer menilai pernyataan berdasarkan evidence.</p><form onSubmit={submit} className="form-stack"><label>Pernyataan<textarea value={statement} onChange={e => setStatement(e.target.value)} rows={6} required /></label><label>URL sumber pendukung<input type="url" value={sourceUrl} onChange={e => setSourceUrl(e.target.value)} placeholder="https://..." /></label>{message && <p role="status">{message}</p>}<button className="button-primary" disabled={loading}>{loading ? "Mengirim…" : "Ajukan klaim"}</button></form></div></section></main>;
}
