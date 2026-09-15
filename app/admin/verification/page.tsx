"use client";

import { useEffect, useState } from "react";

type ReviewTab = "roles" | "claims";
type ReviewItem = {
  id: string;
  title?: string;
  statement?: string;
  evidence?: unknown[];
};

async function loadItems(path: string): Promise<ReviewItem[]> {
  const response = await fetch(path, { cache: "no-store" });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "Gagal memuat data.");
  return Array.isArray(data.items) ? data.items : [];
}

export default function VerificationReviewPage() {
  const [tab, setTab] = useState<ReviewTab>("roles");
  const [items, setItems] = useState<ReviewItem[]>([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    let active = true;
    const endpoint = tab === "roles" ? "/api/verification/roles/review" : "/api/verification/claims/review";

    void loadItems(endpoint)
      .then((nextItems) => {
        if (active) {
          setItems(nextItems);
          setMessage("");
        }
      })
      .catch((error: unknown) => {
        if (active) setMessage(error instanceof Error ? error.message : "Gagal memuat review.");
      });

    return () => {
      active = false;
    };
  }, [tab]);

  async function review(item: ReviewItem, value: string) {
    const endpoint = tab === "roles" ? "/api/verification/roles/review" : "/api/verification/claims/review";
    const body = tab === "roles"
      ? { roleClaimId: item.id, approved: value === "VERIFIED" }
      : { claimId: item.id, status: value };

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await response.json();
      if (!response.ok) {
        setMessage(data.error || "Review gagal.");
        return;
      }

      setItems((current) => current.filter((currentItem) => currentItem.id !== item.id));
      setMessage("Review berhasil disimpan.");
    } catch (error: unknown) {
      setMessage(error instanceof Error ? error.message : "Review gagal.");
    }
  }

  return (
    <main className="adminPage">
      <header className="adminPageHeader">
        <div>
          <div className="adminKicker">VERIFICATION</div>
          <h1>Review verifikasi</h1>
          <p>Periksa evidence sebelum memberikan status. Peran dan klaim dinilai secara terpisah.</p>
        </div>
      </header>

      <div className="adminTabs">
        <button onClick={() => setTab("roles")} aria-pressed={tab === "roles">Peran</button>
        <button onClick={() => setTab("claims")} aria-pressed={tab === "claims">Klaim</button>
      </div>

      {message && <p role="status">{message}</p>}

      <section className="adminList">
        {items.length === 0 ? (
          <p>Tidak ada antrean review.</p>
        ) : (
          items.map((item) => (
            <article className="adminCard" key={item.id}>
              <div>
                <small>{item.id}</small>
                <h2>{tab === "roles" ? item.title : item.statement}</h2>
                <p>{item.evidence?.length || 0} evidence</p>
              </div>
              <div className="adminActions">
                {tab === "claims" ? (
                  <>
                    <button onClick={() => review(item, "VERIFIED")}>Verified</button>
                    <button onClick={() => review(item, "SUPPORTED")}>Supported</button>
                    <button onClick={() => review(item, "NOT_PROVEN")}>Belum terbukti</button>
                    <button onClick={() => review(item, "FALSE")}>Tidak benar</button>
                  </>
                ) : (
                  <>
                    <button onClick={() => review(item, "VERIFIED")}>Verifikasi</button>
                    <button onClick={() => review(item, "REJECTED")}>Tolak</button>
                  </>
                )}
              </div>
            </article>
          ))
        )}
      </section>
    </main>
  );
}
