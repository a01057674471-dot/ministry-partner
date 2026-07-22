"use client";

import { usePathname } from "next/navigation";
import V2Sidebar from "./V2Sidebar";

export default function GlobalChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const selfContainedRoutes = ["/workspace", "/roadmap", "/image-content", "/library"];
  if (pathname.startsWith("/api") || selfContainedRoutes.some((route) => pathname === route || pathname.startsWith(`${route}/`))) {
    return <>{children}</>;
  }
  return <main className="v2-shell v2-global-shell"><V2Sidebar /><section className="v2-global-content">{children}</section></main>;
}
