import Link from "next/link";
import { IssueStatus } from "@prisma/client";
import { db } from "@/lib/db";
import PublicShell from "@/components/PublicShell";

export const dynamic = "force-dynamic";

const allowedStatuses = ["OPEN", "MONITORING", "INVESTIGATING", "VERIFIED", "RESOLVED"] as const;
const allowedLevels = ["nasional", "provinsi", "kabupaten", "kecamatan", "desa", "dusun"] as const;
type RegionLevel = typeof allowedLevels[number];

function statusLabel(status: string) {
  const labels: Record<string, string> = { OPEN: "Terbuka", MONITORING: "Dipantau", INVESTIGATING: "Ditindaklanjuti", VERIFIED: "Terverifikasi", RESOLVED: "Selesai" };
  return labels[status] || status;
}
function verificationLabel(status: string) {
  const labels: Record<string, string> = { UNVERIFIED: "Belum diverifikasi", IN_REVIEW: "Sedang ditinjau", VERIFIED: "Terverifikasi", DISPUTED: "Diperdebatkan" };
  return labels[status] || status;
}
function formatDate(date: Date) {
  return new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "short", year: "numeric" }).format(date);
}

function regionFilter(level: RegionLevel) {
  if (level === "nasional") return {};
  if (level === "provinsi") return { province: { not: null } };
  if (level === "kabupaten") return { regency: { not: null } };
  if (level === "kecamatan") return { district: { not: null } };
  if (level === "desa") return { village: { not: null } };
  return { hamlet: { not: null } };
}

export default async function IsuPage({ searchParams }: { searchParams?: Promise<{ q?: string; wilayah?: string; status?: string; tingkat?: string }> }) {
  const params = (await searchParams) || {};
  const q = params.q?.trim() || "";
  const wilayah = params.wilayah?.trim() || "";
  const selectedStatus = allowedStatuses.includes(params.status as (typeof allowedStatuses)[number]) ? params.status : "";
  const selectedLevel = allowedLevels.includes(params.tingkat as RegionLevel) ? params.tingkat as RegionLevel : "";
  const filters = [
    ...(q ? [{ OR: [{ title: { contains: q, mode: "insensitive" as const } }, { description: { contains: q, mode: "insensitive" as const } }] }] : []),
    ...(wilayah ? [{ OR: [{ province: { contains: wilayah, mode: "insensitive" as const } }, { regency: { contains: wilayah, mode: "insensitive" as const } }, { district: { contains: wilayah, mode: "insensitive" as const } }, { village: { contains: wilayah, mode: "insensitive" as const } }, { hamlet: { contains: wilayah, mode: "insensitive" as const } }] }] : []),
    ...(selectedLevel ? [regionFilter(selectedLevel)] : []),
  ];
  const where = {
    status: selectedStatus ? (selectedStatus as IssueStatus) : { in: allowedStatuses as unknown as IssueStatus[] },
    ...(filters.length ? { AND: filters } : {}),
  };

  const issues = await db.issue.findMany({
    where,
    orderBy: { updatedAt: "desc" },
    take: 24,
    include: {
      category: { select: { name: true } },
      sources: { select: { source: { select: { title: true, publisher: true, publishedAt: true } } }, orderBy: { createdAt: "desc" }, take: 1 },
      updates: { select: { title: true, content: true, createdAt: true }, orderBy: { createdAt: "desc" }, take: 1 },
      _count: { select: { updates: true, comments: true } },
    },
  });

  return <PublicShell><main className="public-page">
    <section className="public-hero"><div className="container"><span className="section-kicker">RUANG PUBLIK · ISU</span><h1>Isu dari nasional hingga dusun</h1><p>Pantau persoalan publik berdasarkan wilayah, status, sumber, perkembangan, dan diskusi masyarakat.</p></div></section>
    <section className="container content-section">
      <form className="public-filters" method="get"><label><span>Cari isu</span><input name="q" defaultValue={q} placeholder="Contoh: pendidikan, jalan, harga…" /></label><label><span>Wilayah</span><input name="wilayah" defaultValue={wilayah} placeholder="Provinsi / kabupaten / kecamatan" /></label><label><span>Tingkat wilayah</span><select name="tingkat" defaultValue={selectedLevel}><option value="">Semua tingkat</option><option value="nasional">Nasional</option><option value="provinsi">Provinsi</option><option value="kabupaten">Kabupaten / Kota</option><option value="kecamatan">Kecamatan</option><option value="desa">Desa</option><option value="dusun">Dusun</option></select></label><label><span>Status</span><select name="status" defaultValue={selectedStatus}><option value="">Semua status</option>{allowedStatuses.map((value) => <option value={value} key={value}>{statusLabel(value)}</option>)}</select></label><button className="button-primary" type="submit">Terapkan</button>{(q || wilayah || selectedStatus || selectedLevel) && <Link className="filter-reset" href="/isu">Reset</Link>}</form>
      <div className="public-section-head"><div><span className="section-kicker">HASIL PEMANTAUAN</span><h2>{issues.length} isu ditampilkan</h2></div><Link className="button-secondary" href="/ruang-saya">Laporkan / kontribusi</Link></div>
      {issues.length === 0 ? <div className="empty-state"><h2>Belum ada isu yang cocok</h2><p>Coba kata kunci, wilayah, atau tingkat wilayah lain. Isu baru akan muncul setelah masuk dan melewati proses pemeriksaan.</p><Link href="/isu" className="button-primary">Lihat semua isu</Link></div> : <div className="issue-grid">{issues.map((issue) => { const source = issue.sources[0]?.source; const latestUpdate = issue.updates[0]; return <article key={issue.id} className="issue-card">{issue.coverImage ? <img src={issue.coverImage} alt="" className="issue-image" loading="lazy" /> : <div className="issue-image-placeholder">RUANG FAKTA</div>}<div className="issue-card-content"><div className="issue-meta"><span>{issue.category?.name || "ISU PUBLIK"}</span><span className="status">{statusLabel(issue.status)}</span></div><h2><Link href={`/isu/${issue.slug}`}>{issue.title}</Link></h2><p className="issue-summary">{issue.summary || issue.description.slice(0, 180)}</p><div className="issue-verification"><span className="verification-label">Verifikasi</span><span className={`verification verification-${issue.verificationStatus.toLowerCase()}`}>{verificationLabel(issue.verificationStatus)}</span></div><div className="issue-location"><span className="issue-location-label">Wilayah</span><span>{[issue.hamlet, issue.village, issue.district, issue.regency, issue.province].filter(Boolean).join(", ") || "Indonesia"}</span></div>{source && <div className="issue-source"><div className="issue-source-label">Sumber utama</div><div className="issue-source-link">{source.publisher || source.title}</div><div className="issue-source-date">{source.publishedAt ? formatDate(source.publishedAt) : "Tanggal tidak tersedia"}</div></div>}{latestUpdate && <div className="issue-timeline"><div className="issue-timeline-header"><span>Perkembangan terbaru</span><span>{issue._count.updates} update</span></div><div className="issue-timeline-item"><div className="issue-timeline-dot" /><div className="issue-timeline-content"><div className="issue-timeline-date">{formatDate(latestUpdate.createdAt)}</div><strong>{latestUpdate.title || "Pembaruan isu"}</strong><p>{latestUpdate.content.length > 150 ? `${latestUpdate.content.slice(0, 150)}…` : latestUpdate.content}</p></div></div></div>}<div className="issue-public-stats"><span>💬 {issue._count.comments} diskusi</span><span>↕ {issue._count.updates} update</span></div><div className="issue-footer"><span>Diperbarui {formatDate(issue.updatedAt)}</span><Link href={`/isu/${issue.slug}`}>Buka isu →</Link></div></div></article>; })}</div>}
    </section>
  </main></PublicShell>;
}
