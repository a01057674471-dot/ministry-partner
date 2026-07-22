import type { Metadata } from "next";
import "./globals.css";
import "./home-v4.css";
import "./workspace-links.css";
import "./project-image-pages.css";
import "./workspace-v3.css";
import "./transform-center.css";
import "./library.css";
import "./account-cloud.css";
import "./product-upgrades.css";
import "./v2.css";
import CloudSyncBridge from "./components/CloudSyncBridge";
import GlobalChrome from "./components/GlobalChrome";

export const metadata: Metadata = {
  title: "목회파트너",
  description: "목회자의 설교, 기도, 문서와 이미지 콘텐츠 준비를 돕는 사역 파트너",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko">
      <body><CloudSyncBridge /><GlobalChrome>{children}</GlobalChrome></body>
    </html>
  );
}
