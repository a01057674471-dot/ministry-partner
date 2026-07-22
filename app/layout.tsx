import type { Metadata, Viewport } from "next";
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
import "./v2-global.css";
import "./v3-polish.css";
import "./mobile-hotfix.css";
import "./workspace-mobile-fix.css";
import "./image-editor.css";
import "./partner-dashboard.css";
import CloudSyncBridge from "./components/CloudSyncBridge";
import GlobalChrome from "./components/GlobalChrome";

export const metadata: Metadata = {
  title: "사역파트너",
  description: "사역을 준비하는 모든 사람을 위한 AI 업무 플랫폼",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko">
      <body><CloudSyncBridge /><GlobalChrome>{children}</GlobalChrome></body>
    </html>
  );
}
