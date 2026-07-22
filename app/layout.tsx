import type { Metadata } from "next";
import "./globals.css";
import "./home-v4.css";
import "./workspace-links.css";
import "./project-image-pages.css";

export const metadata: Metadata = {
  title: "목회파트너",
  description: "목회자를 위한 AI 성경 연구 파트너",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
