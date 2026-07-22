"use client";

import { usePathname } from "next/navigation";

const items = [
  ["/", "홈", "⌂"],
  ["/projects", "프로젝트", "▣"],
  ["/workspace", "작업공간", "▤"],
  ["/transform", "변환센터", "↻"],
  ["/image-content", "이미지 스튜디오", "◫"],
  ["/library", "자료실", "▧"],
  ["/roadmap", "우리 교회", "◇"],
  ["/pricing", "요금제", "₩"],
  ["/account", "계정", "○"],
];

export default function V2Sidebar() {
  const pathname = usePathname();
  return (
    <aside className="v2-sidebar">
      <a href="/" className="v2-brand"><span className="v2-brand-mark">MP</span><span><strong>목회파트너</strong><small>Pastor Workspace</small></span></a>
      <nav>{items.map(([href,label,icon]) => <a key={href} href={href} className={pathname === href || (href !== "/" && pathname.startsWith(href)) ? "active" : ""}><span>{icon}</span>{label}</a>)}</nav>
      <div className="v2-sidebar-bottom"><p>사역을 한곳에서 준비하고<br/>이어가는 목회 워크스페이스</p><a href="/account">내 계정 열기 →</a></div>
    </aside>
  );
}