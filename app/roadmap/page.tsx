"use client";

import { useEffect, useState } from "react";
import V2Sidebar from "../components/V2Sidebar";

type RoadmapItem = { id: string; title: string; href: string };

const sections: { title: string; subtitle: string; items: RoadmapItem[] }[] = [
  { title: "오늘", subtitle: "오늘 먼저 붙들 사역", items: [
    { id: "today-qt", title: "말씀 묵상", href: "/research" },
    { id: "today-prayer", title: "기도문", href: "/prayer" },
    { id: "today-visit", title: "심방 준비", href: "/document" },
  ]},
  { title: "이번 주", subtitle: "주일과 주간 사역 준비", items: [
    { id: "week-sermon", title: "주일 설교", href: "/sermon" },
    { id: "week-prayer", title: "대표기도", href: "/prayer" },
    { id: "week-bulletin", title: "주보·광고", href: "/document" },
    { id: "week-ppt", title: "예배 PPT", href: "/transform" },
    { id: "week-card", title: "카드뉴스", href: "/image-content" },
    { id: "week-video", title: "쇼츠·유튜브", href: "/youtube-shorts" },
  ]},
  { title: "이번 달", subtitle: "교회 공동체를 돌보는 사역", items: [
    { id: "month-new", title: "새가족", href: "/document" },
    { id: "month-small", title: "소그룹·양육", href: "/document" },
    { id: "month-youth", title: "청년·다음세대", href: "/projects" },
    { id: "month-event", title: "행사 기획", href: "/projects" },
    { id: "month-visit", title: "심방 일정", href: "/projects" },
  ]},
  { title: "올해", subtitle: "절기와 연간 사역의 큰 흐름", items: [
    { id: "year-easter", title: "부활절", href: "/projects" },
    { id: "year-summer", title: "여름사역", href: "/projects" },
    { id: "year-thanks", title: "추수감사절", href: "/projects" },
    { id: "year-christmas", title: "성탄절", href: "/projects" },
    { id: "year-vision", title: "연간 비전", href: "/workspace" },
  ]},
];

export default function RoadmapPage() {
  const [done, setDone] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const saved = localStorage.getItem("ministry-partner-roadmap");
    if (saved) { try { setDone(JSON.parse(saved)); } catch {} }
  }, []);

  function toggle(id: string) {
    const next = { ...done, [id]: !done[id] };
    setDone(next);
    localStorage.setItem("ministry-partner-roadmap", JSON.stringify(next));
  }

  const allItems = sections.flatMap((section) => section.items);
  const completed = allItems.filter((item) => done[item.id]).length;
  const progress = Math.round((completed / allItems.length) * 100);

  return (
    <main className="v2-shell">
      <V2Sidebar />
      <section className="v2-main roadmap-v3">
        <div className="v2-page-head"><div><div className="eyebrow">CHURCH ROADMAP</div><h1>교회 로드맵</h1><p>교회의 사역을 오늘, 이번 주, 이번 달, 올해의 흐름으로 이어서 준비합니다.</p></div></div>

        <section className="roadmap-v3-progress"><div><span>전체 사역 진행률</span><strong>{progress}%</strong></div><div className="mp-progress"><i style={{ width: `${progress}%` }} /></div><small>{completed}개 완료 · {allItems.length - completed}개 남음</small></section>

        <div className="roadmap-v3-sections">{sections.map((section) => <section key={section.title} className="roadmap-v3-section">
          <header><div><span>{section.title}</span><p>{section.subtitle}</p></div><strong>{section.items.filter((item) => done[item.id]).length}/{section.items.length}</strong></header>
          <div className="roadmap-v3-grid">{section.items.map((item) => <article key={item.id} className={done[item.id] ? "done" : ""}>
            <button className="roadmap-check" onClick={() => toggle(item.id)} aria-label={`${item.title} 완료 표시`}>{done[item.id] ? "✓" : ""}</button>
            <div><strong>{item.title}</strong><small>{done[item.id] ? "준비 완료" : "준비가 필요합니다"}</small></div>
            <a href={`${item.href}?request=${encodeURIComponent(item.title + " 준비")}`}>준비하기 →</a>
          </article>)}</div>
        </section>)}</div>
      </section>
    </main>
  );
}
