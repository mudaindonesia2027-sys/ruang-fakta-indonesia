export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="adminShell">
      <aside className="adminSidebar">
        <a className="brand" href="/admin">RUANG <span>FAKTA</span></a>
        <div className="adminLabel">EDITORIAL CMS</div>
        <nav>
          <a href="/admin">Overview</a>
          <a href="/admin/articles">Artikel</a>
          <a href="/admin/issues">Isu</a>
          <a href="/admin/review">Review</a>
          <a href="/admin/discussions">Diskusi</a>
          <a href="/admin/sources">Sumber</a>
          <a href="/admin/corrections">Koreksi</a>
          <a href="/admin/settings">Pengaturan</a>
        </nav>
        <div className="adminSidebarFooter">
          <a href="/">← Lihat website</a>
        </div>
      </aside>
      <main className="adminMain">{children}</main>
    </div>
  );
}
