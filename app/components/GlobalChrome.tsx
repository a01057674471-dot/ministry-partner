"use client";

import { usePathname } from "next/navigation";
import V2Sidebar, { MobileBottomNav } from "./V2Sidebar";

export default function GlobalChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const selfContainedRoutes = ["/workspace", "/roadmap", "/image-content", "/library"];
  const isSelfContained = selfContainedRoutes.some((route) => pathname === route || pathname.startsWith(`${route}/`));

  if (pathname.startsWith("/api")) return <>{children}</>;

  if (isSelfContained) {
    return (
      <>
        {children}
        {pathname === "/workspace" || pathname.startsWith("/workspace/") ? <MobileBottomNav /> : null}
      </>
    );
  }

  return <main className="v2-shell v2-global-shell"><V2Sidebar /><section className="v2-global-content">{children}</section></main>;
}