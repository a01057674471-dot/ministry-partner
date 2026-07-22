"use client";

import { usePathname } from "next/navigation";
import V2Sidebar from "./V2Sidebar";

export default function GlobalChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  if (pathname.startsWith("/api") || pathname === "/roadmap" || pathname === "/image-content") return <>{children}</>;
  return <main className="v2-shell v2-global-shell"><V2Sidebar /><section className="v2-global-content">{children}</section></main>;
}
