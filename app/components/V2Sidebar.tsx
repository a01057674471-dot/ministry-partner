"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  ["/", "홈", "⌂"],
  ["/projects", "프로젝트", "▣"],
  ["/workspace", "작업공간", "▤"],
  ["/transform", "변환센터", "↻"],
  ["/image-content", "이미지 스튜디오", "◫"],
  ["/library", "자료실", "▧"],
  ["/roadmap", "교회 로드맵", "◇"],
  ["/pricing", "요금제", "₩"],
  ["/account", "계정", "○"],
];

const mobileItems = [
  ["/", "홈", "⌂"],
  ["/workspace", "작업", "▤"],
  ["/image-content", "이미지", "◫"],
  ["/roadmap", "로드맵", "◇"],
  ["/account", "계정", "○"],
];

function isActive(pathname: string, href: string) {
  return pathname === href || (href !== "/" && pathname.startsWith(href));
}

export default function V2Sidebar() {
  const pathname = usePathname();
  return (
    <>
      <aside className="v2-sidebar">
        <Link href="/" className="v2-brand"><span className="v2-brand-mark">MP</span><span><strong>목회파트너</strong><small>사역을 함께 준비하는 동역자</small></span></Link>
        <nav>{items.map(([href,label,icon]) => <Link key={href} href={href} aria-current={isActive(pathname, href) ? "page" : undefined} className={isActive(pathname, href) ? "active" : ""}><span>{icon}</span>{label}</Link>)}</nav>
        <div className="v2-sidebar-bottom"><p>말씀과 성도를 섬기는 일에<br/>더 집중할 수 있도록 돕습니다.</p><Link href="/account">내 계정 열기 →</Link></div>
      </aside>
      <nav className="v2-mobile-nav" aria-label="모바일 주요 메뉴">
        {mobileItems.map(([href,label,icon]) => <Link key={href} href={href} prefetch aria-current={isActive(pathname, href) ? "page" : undefined} className={isActive(pathname, href) ? "active" : ""}><span>{icon}</span><small>{label}</small></Link>)}
      </nav>
    </>
  );
}