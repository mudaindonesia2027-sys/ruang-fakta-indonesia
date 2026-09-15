import Link from "next/link";

const settings = [
  { title: "Pedoman editorial", text: "Aturan publikasi, verifikasi, koreksi, dan status informasi.", href: "/admin/review", action: "Buka alur review" },
  { title: "Moderasi diskusi", text: "Tinjau komentar yang masuk dan tindakan moderasi.", href: "/admin/discussions", action: "Buka moderasi" },
  { title: "Role & akses", text: "Pahami batas kemampuan USER, CONTRIBUTOR, EDITOR, REVIEWER, ADMIN, dan OWNER.", href: "/admin", action: "Lihat ringkasan akses" },
  { title: "Audit & perubahan", text: "Jejak tindakan editorial dan perubahan penting pada sistem.", href: "/admin/audit", action: "Buka audit trail" },
  { title: "Sumber", text: "Daftar dan pemeriksaan sumber yang menjadi dasar informasi publik.", href: "/admin/sources", action: "Kelola sumber" },
];

export default function SettingsPage() {
  return <><section className="adminTop"><div><div className="eyebrow">PLATFORM · INTERNAL</div><h1>Pengaturan</h1><p>Pengaturan di sini menjelaskan dan mengarahkan proses kerja; perubahan sensitif tetap dibatasi oleh izin akun.</p></div></section><section className="settingsList">{settings.map(item => <article key={item.title}><h2>{item.title}</h2><p>{item.text}</p><Link className="secondaryButton" href={item.href}>{item.action} →</Link></article>)}</section></>;
}
