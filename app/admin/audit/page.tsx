"use client";

import { useEffect, useState } from "react";

type Audit = {
  id: string;
  action: string;
  entity: string | null;
  entityId: string | null;
  details: unknown;
  createdAt: string;
  user: { id: string; name: string | null; username: string | null; role: string } | null;
};

export default function AuditPage() {
  const [logs, setLogs] = useState<Audit[]>([]);
  const [action, setAction] = useState("");
  const [entity, setEntity] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function load(nextPage = page) {
    setLoading(true);
    setError("");
    const params = new URLSearchParams({ page: String(nextPage), limit: "50" });
    if (action.trim()) params.set("action", action.trim());
    if (entity.trim()) params.set("entity", entity.trim());
    try {
      const response = await fetch(`/api/admin/audit?${params.toString()}`, { cache: "no-store" });
      const json = await response.json();
      if (!response.ok || !json.success) throw new Error(json.error || "Gagal memuat audit trail.");
      setLogs(json.data || []);
      setTotalPages(json.pagination?.totalPages || 1);
      setPage(nextPage);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal memuat audit trail.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void load(1); }, []);

  return (
    <section>
      <header className="adminPageHeader">
        <div>
          <p className="adminEyebrow">KEAMANAN & AKUNTABILITAS</p>
          <h1>Audit Trail</h1>
          <p>Riwayat tindakan penting sistem dan pengguna. Data ini hanya tersedia untuk reviewer/editor berwenang.</p>
        </div>
      </header>

      <div className="adminCard" style={{ marginBottom: 20 }}>
        <form onSubmit={(event) => { event.preventDefault(); void load(1); }} style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <input aria-label="Filter aksi" placeholder="Aksi, mis. ARTICLE_CREATED" value={action} onChange={(e) => setAction(e.target.value)} />
          <input aria-label="Filter entitas" placeholder="Entitas, mis. Article" value={entity} onChange={(e) => setEntity(e.target.value)} />
          <button type="submit">Filter</button>
          <button type="button" onClick={() => { setAction(""); setEntity(""); void load(1); }}>Reset</button>
        </form>
      </div>

      {error && <div className="adminCard">{error}</div>}
      <div className="adminCard" style={{ overflowX: "auto" }}>
        {loading ? <p>Memuat audit trail…</p> : logs.length === 0 ? <p>Belum ada catatan audit yang cocok.</p> : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead><tr><th align="left">Waktu</th><th align="left">Aksi</th><th align="left">Entitas</th><th align="left">Pelaku</th><th align="left">Detail</th></tr></thead>
            <tbody>{logs.map((log) => (
              <tr key={log.id}>
                <td>{new Date(log.createdAt).toLocaleString("id-ID")}</td>
                <td><strong>{log.action}</strong></td>
                <td>{log.entity || "—"}{log.entityId ? ` · ${log.entityId.slice(0, 12)}` : ""}</td>
                <td>{log.user?.name || log.user?.username || "Sistem"} {log.user?.role ? `(${log.user.role})` : ""}</td>
                <td><code style={{ whiteSpace: "pre-wrap" }}>{log.details ? JSON.stringify(log.details) : "—"}</code></td>
              </tr>
            ))}</tbody>
          </table>
        )}
      </div>
      <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
        <button disabled={page <= 1 || loading} onClick={() => void load(page - 1)}>← Sebelumnya</button>
        <span style={{ padding: "8px 0" }}>Halaman {page} / {totalPages}</span>
        <button disabled={page >= totalPages || loading} onClick={() => void load(page + 1)}>Berikutnya →</button>
      </div>
    </section>
  );
}
