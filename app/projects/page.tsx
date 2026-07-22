"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";

type Project = { id: number; title: string; type: string; progress: number; due: string; updated: string; icon: string; favorite?: boolean };

const starterProjects: Project[] = [
  { id: 1, title: "창세기 22장 설교", type: "설교", progress: 65, due: "D-3", updated: "7분 전", icon: "📖", favorite: true },
  { id: 2, title: "주일 대표기도", type: "기도", progress: 80, due: "D-1", updated: "1시간 전", icon: "🙏" },
  { id: 3, title: "청년부 카드뉴스", type: "이미지", progress: 40, due: "D-5", updated: "3시간 전", icon: "🎨" },
  { id: 4, title: "유튜브 쇼츠", type: "쇼츠", progress: 60, due: "이번 주", updated: "어제", icon: "▶" },
  { id: 5, title: "주보 5월 3주", type: "문서", progress: 70, due: "D-2", updated: "어제", icon: "📄" },
];

const typeInfo: Record<string, { icon: string; href: string }> = {
  설교: { icon: "📖", href: "/sermon" }, 기도: { icon: "🙏", href: "/prayer" }, 이미지: { icon: "🎨", href: "/image-content" }, 쇼츠: { icon: "▶", href: "/youtube-shorts" }, 문서: { icon: "📄", href: "/document" }, 기타: { icon: "✦", href: "/workspace" },
};

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>(starterProjects);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("전체");
  const [showNew, setShowNew] = useState(false);
  const [title, setTitle] = useState("");
  const [type, setType] = useState("설교");

  useEffect(() => {
    const saved = localStorage.getItem("ministry-partner-projects");
    if (saved) { try { setProjects(JSON.parse(saved)); } catch {} }
  }, []);

  function save(next: Project[]) { setProjects(next); localStorage.setItem("ministry-partner-projects", JSON.stringify(next)); }
  function createProject(event: FormEvent) {
    event.preventDefault();
    if (!title.trim()) return;
    const info = typeInfo[type] ?? typeInfo.기타;
    save([{ id: Date.now(), title: title.trim(), type, progress: 0, due: "일정 미정", updated: "방금", icon: info.icon }, ...projects]);
    setTitle(""); setShowNew(false);
  }

  const visible = useMemo(() => projects.filter((project) => (filter === "전체" || project.type === filter) && project.title.toLowerCase().includes(query.toLowerCase())), [projects, filter, query]);
  const average = projects.length ? Math.round(projects.reduce((sum, item) => sum + item.progress, 0) / projects.length) : 0;

  return (
    <main className="v2-main projects-v3">
      <header className="v2-page-head projects-v3-head">
        <div><div className="eyebrow">MINISTRY PROJECTS</div><h1>프로젝트</h1><p>설교부터 이미지와 쇼츠까지, 하나의 사역 흐름으로 이어서 관리하세요.</p></div>
        <button className="button button-primary" onClick={() => setShowNew(true)}>＋ 새 프로젝트</button>
      </header>

      <section className="projects-v3-summary">
        <article><span>전체 프로젝트</span><strong>{projects.length}</strong><small>진행 중인 사역</small></article>
        <article><span>평균 진행률</span><strong>{average}%</strong><div className="mp-progress"><i style={{ width: `${average}%` }} /></div></article>
        <article><span>마감 임박</span><strong>{projects.filter((item) => /D-[123]/.test(item.due)).length}</strong><small>이번 주 확인 필요</small></article>
      </section>

      <section className="projects-v3-workspace">
        <aside className="projects-v3-list">
          <div className="projects-v3-list-head"><strong>프로젝트 목록</strong><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="검색" /></div>
          <div className="projects-v3-filters">{["전체", "설교", "기도", "이미지", "쇼츠", "문서"].map((item) => <button key={item} className={filter === item ? "active" : ""} onClick={() => setFilter(item)}>{item}</button>)}</div>
          <div className="projects-v3-items">{visible.map((project) => <a key={project.id} href={`${typeInfo[project.type]?.href ?? "/workspace"}?request=${encodeURIComponent(project.title)}`}><span>{project.icon}</span><div><strong>{project.title}</strong><small>{project.type} · {project.updated}</small></div><b>→</b></a>)}</div>
          {visible.length === 0 && <div className="project-empty">조건에 맞는 프로젝트가 없습니다.</div>}
        </aside>

        <section className="projects-v3-board">
          <div className="projects-v3-board-head"><div><span>이번 주 사역</span><h2>진행 상황</h2></div><a href="/roadmap">교회 로드맵 보기 →</a></div>
          <div className="projects-v3-grid">{visible.map((project) => <article key={project.id}>
            <div className="project-card-top"><span className="project-card-icon">{project.icon}</span><button onClick={() => save(projects.map((item) => item.id === project.id ? { ...item, favorite: !item.favorite } : item))}>{project.favorite ? "★" : "☆"}</button></div>
            <div className="project-type">{project.type}</div><h3>{project.title}</h3><p>최근 수정 {project.updated}</p>
            <div className="project-progress-head"><span>진행률</span><strong>{project.progress}%</strong></div><div className="mp-progress"><i style={{ width: `${project.progress}%` }} /></div>
            <div className="project-card-bottom"><span>{project.due}</span><a href={`${typeInfo[project.type]?.href ?? "/workspace"}?request=${encodeURIComponent(project.title)}`}>열기 →</a></div>
          </article>)}</div>
        </section>
      </section>

      {showNew && <div className="project-modal" onClick={() => setShowNew(false)}><form onSubmit={createProject} onClick={(e) => e.stopPropagation()}><button type="button" className="project-close" onClick={() => setShowNew(false)}>×</button><span>NEW PROJECT</span><h2>새 사역 프로젝트</h2><label>프로젝트 이름<input autoFocus value={title} onChange={(e) => setTitle(e.target.value)} placeholder="예: 부활주일 설교 준비" /></label><label>프로젝트 종류<select value={type} onChange={(e) => setType(e.target.value)}>{Object.keys(typeInfo).map((item) => <option key={item}>{item}</option>)}</select></label><button className="button button-primary wide" type="submit">프로젝트 만들기</button></form></div>}
    </main>
  );
}
