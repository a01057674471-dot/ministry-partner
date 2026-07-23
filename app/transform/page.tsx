"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";

type Message = { id: number; role: "user" | "assistant"; content: string; createdAt: string };
type Project = { id: string; title: string; type: string; progress: number; updatedAt: string; messages: Message[] };
type Format = "ppt" | "cardnews" | "shorts" | "thumbnail" | "instagram" | "bulletin" | "smallgroup" | "prayer";
type History = { id: number; projectId: string; format: Format; label: string; result: string; source: string; updatedAt: string };

const formats: { id: Format; icon: string; label: string; desc: string }[] = [
  { id: "ppt", icon: "▤", label: "PPT", desc: "슬라이드와 발표자 메모" },
  { id: "cardnews", icon: "▦", label: "카드뉴스", desc: "장별 문구와 이미지 방향" },
  { id: "shorts", icon: "▶", label: "쇼츠", desc: "대본·자막·촬영 구성" },
  { id: "thumbnail", icon: "▧", label: "썸네일", desc: "문구와 이미지 프롬프트" },
  { id: "instagram", icon: "◎", label: "인스타", desc: "본문·댓글·해시태그" },
  { id: "bulletin", icon: "▤", label: "주보", desc: "요약·적용·기도" },
  { id: "smallgroup", icon: "◉", label: "소그룹 교재", desc: "관찰·해석·적용 질문" },
  { id: "prayer", icon: "✦", label: "기도문", desc: "메시지를 기도로 재구성" },
];

export default function TransformPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [projectId, setProjectId] = useState("");
  const [format, setFormat] = useState<Format>("ppt");
  const [source, setSource] = useState("");
  const [instruction, setInstruction] = useState("");
  const [result, setResult] = useState("");
  const [history, setHistory] = useState<History[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    try {
      const savedProjects = JSON.parse(localStorage.getItem("ministry-partner-projects-v3") || "[]") as Project[];
      const savedHistory = JSON.parse(localStorage.getItem("ministry-partner-transform-history") || "[]") as History[];
      setProjects(savedProjects);
      setHistory(savedHistory);
      if (savedProjects[0]) setProjectId(savedProjects[0].id);
    } catch {
      setProjects([]);
      setHistory([]);
    }
  }, []);

  const activeProject = useMemo(() => projects.find((project) => project.id === projectId), [projects, projectId]);
  const activeFormat = formats.find((item) => item.id === format) ?? formats[0];
  const projectHistory = history.filter((item) => !projectId || item.projectId === projectId);

  useEffect(() => {
    if (!activeProject) return;
    const latest = [...activeProject.messages].reverse().find((message) => message.role === "assistant");
    setSource(latest?.content || "");
    setResult("");
    setInstruction("");
  }, [activeProject]);

  async function transform(event?: FormEvent) {
    event?.preventDefault();
    if (!source.trim() || loading) return setError("변환할 원본을 입력해 주세요.");
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/transform", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ format, source, instruction }),
      });
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.error || "변환하지 못했습니다.");
      setResult(data.result);
      const item: History = {
        id: Date.now(), projectId: projectId || "manual", format, label: activeFormat.label,
        result: data.result, source, updatedAt: new Date().toISOString(),
      };
      const next = [item, ...history].slice(0, 50);
      setHistory(next);
      localStorage.setItem("ministry-partner-transform-history", JSON.stringify(next));
    } catch (err) {
      setError(err instanceof Error ? err.message : "오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  }

  function openHistory(item: History) {
    setFormat(item.format);
    setSource(item.source);
    setResult(item.result);
    setInstruction("");
  }

  function download() {
    if (!result) return;
    const blob = new Blob([result], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${activeProject?.title || "목회콘텐츠"}-${activeFormat.label}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <main className="tc-shell">
      <aside className="tc-sidebar">
        <Link href="/" className="tc-brand"><span>✦</span><strong>사역파트너</strong></Link>
        <nav><Link href="/">⌂ 홈</Link><Link href="/projects">▣ 프로젝트</Link><Link href="/workspace">▤ 작업공간</Link><Link className="active" href="/transform">♲ 변환센터</Link><Link href="/file-analysis">▧ 자료실</Link></nav>
        <div className="tc-projects"><p>원본 프로젝트</p>{projects.length ? projects.map((project) => <button key={project.id} className={project.id === projectId ? "active" : ""} onClick={() => setProjectId(project.id)}><strong>{project.title}</strong><small>{project.progress}% 진행</small></button>) : <div className="tc-no-project">작업공간에서 프로젝트를 먼저 만들어 주세요.</div>}</div>
      </aside>

      <section className="tc-main">
        <header className="tc-header"><div><p>CONTENT TRANSFORM</p><h1>변환센터</h1><span>한 번 만든 사역 자료를 여러 콘텐츠로 재사용하세요.</span></div><Link href="/workspace">작업공간으로 →</Link></header>

        <div className="tc-layout">
          <section className="tc-work">
            <div className="tc-source-card">
              <div className="tc-card-head"><div><small>원본</small><h2>{activeProject?.title || "직접 입력"}</h2></div><button onClick={() => setSource("")}>비우기</button></div>
              <textarea value={source} onChange={(e) => setSource(e.target.value)} placeholder="작업공간의 최근 결과가 자동으로 들어옵니다. 직접 붙여넣어도 됩니다." />
            </div>

            <section className="tc-format-section"><div className="tc-section-title"><div><small>변환 형식</small><h2>무엇으로 바꿀까요?</h2></div><span>형식을 선택한 뒤 변환 버튼을 누르세요.</span></div><div className="tc-format-grid">{formats.map((item) => <button key={item.id} className={format === item.id ? "active" : ""} onClick={() => setFormat(item.id)}><span>{item.icon}</span><strong>{item.label}</strong><small>{item.desc}</small></button>)}</div></section>

            <form className="tc-request" onSubmit={transform}><label>추가 수정 요청</label><textarea value={instruction} onChange={(e) => setInstruction(e.target.value)} placeholder={`예: ${activeFormat.label}을 청년부가 이해하기 쉬운 표현으로 만들어 주세요.`} /><button disabled={loading}>{loading ? "변환 중…" : `${activeFormat.label}로 변환하기 →`}</button>{error && <p className="tc-error">{error}</p>}</form>

            <section className="tc-result"><div className="tc-result-head"><div><small>변환 결과</small><h2>{activeFormat.label}</h2></div><div><button onClick={() => result && navigator.clipboard.writeText(result)}>복사</button><button onClick={download}>저장</button></div></div><div className="tc-result-body">{loading ? "목회파트너가 원본을 분석하고 있습니다…" : result || "변환 결과가 여기에 표시됩니다."}</div>{result && <div className="tc-refine"><strong>이어서 수정</strong><div>{["더 짧게", "더 자세하게", "청년부 버전", "이미지 추천 추가"].map((item) => <button key={item} onClick={() => setInstruction(item)}>{item}</button>)}</div></div>}</section>
          </section>

          <aside className="tc-history"><section><h2>사역 파이프라인</h2><div className="tc-pipeline">{formats.slice(0, 6).map((item, index) => { const done = projectHistory.some((historyItem) => historyItem.format === item.id); return <div key={item.id}><span className={done ? "done" : ""}>{done ? "✓" : index + 1}</span><div><strong>{item.label}</strong><small>{done ? "변환 완료" : "아직 만들지 않음"}</small></div></div>; })}</div></section><section><h2>변환 기록</h2><div className="tc-history-list">{projectHistory.length ? projectHistory.map((item) => <button key={item.id} onClick={() => openHistory(item)}><span>{formats.find((formatItem) => formatItem.id === item.format)?.icon}</span><div><strong>{item.label}</strong><small>{new Date(item.updatedAt).toLocaleString("ko-KR")}</small></div></button>) : <p>아직 변환 기록이 없습니다.</p>}</div></section></aside>
        </div>
      </section>
    </main>
  );
}
