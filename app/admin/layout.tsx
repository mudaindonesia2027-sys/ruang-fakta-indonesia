import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth";
import "./admin.css";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const access = await requireRole("EDITOR", "REVIEWER", "ADMIN", "SUPERADMIN");

  if (access.error === "UNAUTHENTICATED") {
    redirect("/login?next=/admin");
  }

  if (access.error === "FORBIDDEN") {
    redirect("/ruang-saya");
  }

  const role = access.user?.role ?? "EDITOR";

  return (
    <div className="adminShell">
      <aside className="adminSidebar">
        <a className="brand" href="/admin" aria-label="Ruang Fakta CMS">RUANG <span>FAKTA</span></a>
        <div className="adminLabel">{role} · EDITORIAL CMS</div>
        <p className="adminNotice">Area internal. Perubahan di sini memengaruhi konten publik setelah proses review dan verifikasi.</p>
        <nav aria-label="Navigasi ruang editorial">
          <span className="adminNavHeading">Workspace</span>
          <a href="/admin">Overview</a>
          <a href="/admin/review">Review & antrean</a>

          <span className="adminNavHeading">Konten</span>
          <a href="/admin/articles">Artikel</a>
          <a href="/admin/issues">Isu publik</a>
          <a href="/admin/sources">Sumber</a>

          <span className="adminNavHeading">Kepercayaan</span>
          <a href="/admin/verification">Verifikasi</a>
          <a href="/admin/corrections">Koreksi</a>
          <a href="/admin/discussions">Moderasi diskusi</a>
          <a href="/admin/audit">Audit trail</a>

          <span className="adminNavHeading">Konfigurasi</span>
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
