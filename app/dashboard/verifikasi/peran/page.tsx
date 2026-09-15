"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function RoleVerificationPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [organization, setOrganization] = useState("");
  const [project, setProject] = useState("");
  const [sourceUrl, setSourceUrl] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault(); setLoading(true); setMessage("");
    try {
      const response = await fetch("/api/verification/roles", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ title, organization, project }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Gagal membuat klaim peran.");
      if (sourceUrl) {
        await fetch(`/api/verification/roles/${data.data.id}/evidence`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ type: "OFFICIAL_SOURCE", title: "Sumber pendukung", sourceUrl }) });
      }
      setMessage("Klaim peran berhasil diajukan untuk review.");
      setTimeout(() => router.push("/dashboard/verifikasi"), 800);
    } catch (error) { setMessage(error instanceof Error ? error.message : "Gagal mengajukan klaim."); }
    finally { setLoading(false); }
  }

  return <main className="public-page"><section className="container content-section"><div className="dashboard-section"><span className="section-kicker">PERAN</span><h1>Ajukan klaim peran</h1><p>Jelaskan jabatan atau peran yang ingin ditampilkan. Klaim baru berstatus menunggu sampai reviewer memeriksa evidence.</p><form onSubmit={submit} className="form-stack"><label>Jabatan / peran<input value={title} onChange={e => setTitle(e.target.value)} required /></label><label>Organisasi<input value={organization} onChange={e => setOrganization(e.target.value)} /></label><label>Proyek<input value={project} onChange={e => setProject(e.target.value)} /></label><label>URL sumber resmi<input type="url" value={sourceUrl} onChange={e => setSourceUrl(e.target.value)} placeholder="https://..." /></label>{message && <p role="status">{message}</p>}<button className="button-primary" disabled={loading}>{loading ? "Mengirim…" : "Ajukan untuk review"}</button></form></div></section></main>;
}
