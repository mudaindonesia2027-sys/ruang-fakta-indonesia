import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const access = await requireRole("EDITOR", "REVIEWER", "ADMIN", "SUPERADMIN");

  if (access.error === "UNAUTHENTICATED") {
    redirect("/login?next=/admin");
  }

  if (access.error === "FORBIDDEN") {
    redirect("/ruang-saya");
  }

  return (
    <div className="adminShell">
      <aside className="adminSidebar">
        <a className="brand" href="/admin">RUANG <span>FAKTA</span></a>
        <div className="adminLabel">OWNER / ADMIN · EDITORIAL CMS</div>
        <p className="adminNotice">Area internal. Perubahan di sini memengaruhi konten publik setelah proses review.</p>
        <nav aria-label="Navigasi admin">
          <a href="/admin">Overview</a>
          <a href="/admin/articles">Artikel</a>
          <a href="/admin/issues">Isu</a>
          <a href="/admin/review">Review</a>
          <a href="/admin/verification">Verifikasi</a>
          <a href="/admin/audit">Audit Trail</a>
          <a href="/admin/discussions">Diskusi</a>
          <a href="/admin/sources">Sumber</a>
          <a href="/admin/corrections">Koreksi</a>
          <a href="/admin/settings">Pengaturan</a>
        </nav>
        <div className="adminSidebarFooter">
          <a href="/">← Website publik</a>
          <a href="/ruang-saya">Ruang Saya →</a>
        </div>
      </aside>
      <main className="adminMain">{children}</main>
    </div>
  );
}
