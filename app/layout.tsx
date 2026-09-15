import type { Metadata } from "next";
import "./globals.css";
import "./ui-overrides.css";
import "./workspace.css";

export const metadata: Metadata = {
  title: { default: "Ruang Fakta", template: "%s | Ruang Fakta" },
  description: "Ruang informasi publik Indonesia dari tingkat nasional hingga desa dan dusun.",
  keywords: ["Indonesia", "informasi publik", "data Indonesia", "isu masyarakat", "desa", "dusun", "kebijakan", "fakta"],
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="id"><body>{children}</body></html>;
}
