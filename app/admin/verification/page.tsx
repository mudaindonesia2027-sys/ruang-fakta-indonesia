"use client";

import { useEffect, useState } from "react";

type Item = any;

async function load(path: string) {
  const response = await fetch(path, { cache: "no-store" });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "Gagal memuat data.");
  return data.items || [];
}

export default function VerificationReviewPage() {
  const [tab, setTab] = useState<"roles" | "claims" | "identity">("roles");
  const [items, setItems] = useState<Item[]>([]);
  const [message, setMessage] = useState("");

  async function refresh() {
    setMessage("");
    try {
      const endpoint = tab === "roles" ? "/api/verification/roles/review" : tab === "claims" ? "/api/verification/claims/review" : "/api/verification/identity/review";
      setItems(await load(endpoint));
    } catch (error) { setMessage(error instanceof Error ? error.message : "Gagal memuat review."); }
  }

  useEffect(() => { refresh(); }, [tab]);

  async function review(item: Item, value: string | boolean) {
    const endpoint = tab === "roles" ? "/api/verification/roles/review" : tab === "claims" ? "/api/verification/claims/review" : "/api/verification/identity/review";
    const body = tab === "roles" ? { roleClaimId: item.id, approved: value === "VERIFIED" } : tab === "claims" ? { claimId: item.id, status: value } : { verificationId: item.id, approved: value === "VERIFIED", failureCode: value === "FAILED" ? "REVIEW_REJECTED" : undefined };
    const response = await fetch(endpoint, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const data = await response.json();
    if (!response.ok) { setMessage(data.error || "Review gagal."); return; }
    refresh();
  }

  return <main className="adminPage"><header className="adminPageHeader"><div><div className="adminKicker">VERIFICATION</div><h1>Review verifikasi</h1><p>Periksa evidence sebelum memberikan status. Identitas, peran, dan klaim dinilai secara terpisah.</p></div></header><div className="adminTabs"><button onClick={() => setTab("roles")}>Peran</button><button onClick={() => setTab("claims")}>Klaim</button><button onClick={() => setTab("identity")}>Identitas</button></div>{message && <p role="alert">{message}</p>}<section className="adminList">{items.length === 0 ? <p>Tidak ada antrean review.</p> : items.map(item => <article className="adminCard" key={item.id}><div><small>{item.id}</small><h2>{tab === "roles" ? item.title : tab === "claims" ? item.statement : `User ${item.userId}`}</h2>{tab !== "identity" && <p>{item.evidence?.length || 0} evidence</p>}</div><div className="adminActions">{tab === "claims" ? <><button onClick={() => review(item, "VERIFIED")}>Verified</button><button onClick={() => review(item, "SUPPORTED")}>Supported</button><button onClick={() => review(item, "NOT_PROVEN")}>Belum terbukti</button><button onClick={() => review(item, "FALSE")}>Tidak benar</button></> : <><button onClick={() => review(item, "VERIFIED")}>Verifikasi</button><button onClick={() => review(item, "FAILED")}>Tolak</button></>}</div></article>)}</section></main>;
}
