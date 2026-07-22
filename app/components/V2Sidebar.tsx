"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  ["/", "홈", "⌂"],
  ["/workspace", "프로젝트", "▤"],
  ["/research", "말씀", "⌕"],
  ["/image-content", "디자인", "◫"],
  ["/account", "내 정보", "○"],
];

const mobileItems = items;

function isActive(pathname: string, href: string) {
  return pathname === href || (href !== "/" && pathname.startsWith(href));
}

export default function V2Sidebar() {
  const pathname = usePathname();
  return (
    <>
      <aside className="v2-sidebar">
        <Link href="/" className="v2-brand v2-brand-text-only"><span><strong>사역파트너</strong><small>Ministry Partner</small></span></Link>
        <nav>{items.map(([href,label,icon]) => <Link key={href} href={href} aria-current={isActive(pathname, href) ? "page" : undefined} className={isActive(pathname, href) ? "active" : ""}><span>{icon}</span>{label}</Link>)}</nav>
        <div className="v2-sidebar-bottom"><p>사역을 대신하지 않습니다.<br/>사역에 더 집중하도록 돕습니다.</p><Link href="/account">내 정보 열기 →</Link></div>
      </aside>
      <nav className="v2-mobile-nav" aria-label="모바일 주요 메뉴">
        {mobileItems.map(([href,label,icon]) => <Link key={href} href={href} prefetch aria-current={isActive(pathname, href) ? "page" : undefined} className={isActive(pathname, href) ? "active" : ""}><span>{icon}</span><small>{label}</small></Link>)}
      </nav>
    </>
  );
}
