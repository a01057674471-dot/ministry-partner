"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";

type Project = { id: string; title: string; type: string; progress: number; due: string; updated: string; icon: string; favorite?: boolean };
type WorkspaceProject = {
  id: string;
  title: string;
  type: string;
  progress: number;
  updatedAt: string;
  messages: unknown[];
  steps: { label: string; done: boolean }[];
};

const typeInfo: Record<string, { icon: string; href: string }> = {
  설교: { icon: "📖", href: "/sermon" }, 기도: { icon: "🙏", href: "/prayer" }, 이미지: { icon: "🎨", href: "/image-content" }, 쇼츠: { icon: "▶", href: "/youtube-shorts" }, 문서: { icon: "📄", href: "/document" }, 기타: { icon: "✦", href: "/workspace" },
};

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("전체");
  const [showNew, setShowNew] = useState(false);
  const [title, setTitle] = useState("");
  const [type, setType] = useState("설교");

  useEffect(() => {
    const saved = localStorage.getItem("ministry-partner-projects-v3");
    if (!saved) return;
    try {
      const parsed = JSON.parse(saved) as WorkspaceProject[];
      if (!Array.isArray(parsed)) return;
      const labels: Record<string, string> = { sermon: "설교", prayer: "기도", cardnews: "이미지", shorts: "쇼츠", document: "문서" };
      setProjects(parsed.map((project) => {
        const type = labels[project.type] || "기타";
        return {
          id: String(project.id),
          title: project.title,
          type,
          progress: project.progress || 0,
          due: "일정 미정",
          updated: project.updatedAt ? new Date(project.updatedAt).toLocaleString("ko-KR") : "저장됨",
          icon: typeInfo[type]?.icon || typeInfo.기타.icon,
        };
      }));
    } catch {
      setProjects([]);
    }
  }, []);

  function save(next: Project[]) { setProjects(next); }
  function createProject(event: FormEvent) {
    event.preventDefault();
    if (!title.trim()) return;
    const info = typeInfo[type] ?? typeInfo.기타;
    const id = String(Date.now());
    const typeIds: Record<string, string> = { 설교: "sermon", 기도: "prayer", 이미지: "cardnews", 쇼츠: "shorts", 문서: "document", 기타: "sermon" };
    const workspaceProject: WorkspaceProject = {
      id,
      title: title.trim(),
      type: typeIds[type] || "sermon",
      progress: 0,
      updatedAt: new Date().toISOString(),
      messages: [],
      steps: ["말씀 연구", "설교 초안", "예화", "PPT", "카드뉴스", "쇼츠", "완료"].map((label, index) => ({ label, done: index === 0 })),
    };
    let stored: WorkspaceProject[] = [];
    try {
      const parsed = JSON.parse(localStorage.getItem("ministry-partner-projects-v3") || "[]");
      if (Array.isArray(parsed)) stored = parsed;
    } catch {
      stored = [];
    }
    localStorage.setItem("ministry-partner-projects-v3", JSON.stringify([workspaceProject, ...stored]));
    save([{ id, title: title.trim(), type, progress: 0, due: "일정 미정", updated: "방금", icon: info.icon }, ...projects]);
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
          <div className="projects-v3-items">{visible.map((project) => <Link key={project.id} href={`/workspace?project=${encodeURIComponent(project.id)}`}><span>{project.icon}</span><div><strong>{project.title}</strong><small>{project.type} · {project.updated}</small></div><b>→</b></Link>)}</div>
          {visible.length === 0 && <div className="project-empty">조건에 맞는 프로젝트가 없습니다.</div>}
        </aside>

        <section className="projects-v3-board">
          <div className="projects-v3-board-head"><div><span>이번 주 사역</span><h2>진행 상황</h2></div><Link href="/roadmap">교회 로드맵 보기 →</Link></div>
          <div className="projects-v3-grid">{visible.map((project) => <article key={project.id}>
            <div className="project-card-top"><span className="project-card-icon">{project.icon}</span><button onClick={() => save(projects.map((item) => item.id === project.id ? { ...item, favorite: !item.favorite } : item))}>{project.favorite ? "★" : "☆"}</button></div>
            <div className="project-type">{project.type}</div><h3>{project.title}</h3><p>최근 수정 {project.updated}</p>
            <div className="project-progress-head"><span>진행률</span><strong>{project.progress}%</strong></div><div className="mp-progress"><i style={{ width: `${project.progress}%` }} /></div>
            <div className="project-card-bottom"><span>{project.due}</span><Link href={`/workspace?project=${encodeURIComponent(project.id)}`}>열기 →</Link></div>
          </article>)}</div>
        </section>
      </section>

      {showNew && <div className="project-modal" onClick={() => setShowNew(false)}><form onSubmit={createProject} onClick={(e) => e.stopPropagation()}><button type="button" className="project-close" onClick={() => setShowNew(false)}>×</button><span>NEW PROJECT</span><h2>새 사역 프로젝트</h2><label>프로젝트 이름<input autoFocus value={title} onChange={(e) => setTitle(e.target.value)} placeholder="예: 부활주일 설교 준비" /></label><label>프로젝트 종류<select value={type} onChange={(e) => setType(e.target.value)}>{Object.keys(typeInfo).map((item) => <option key={item}>{item}</option>)}</select></label><button className="button button-primary wide" type="submit">프로젝트 만들기</button></form></div>}
    </main>
  );
}
