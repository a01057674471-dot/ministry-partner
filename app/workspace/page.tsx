"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";

type Message = { id: number; role: "user" | "assistant"; content: string; createdAt: string };
type Project = {
  id: string;
  title: string;
  type: string;
  progress: number;
  updatedAt: string;
  messages: Message[];
  steps: { label: string; done: boolean }[];
};

const defaultSteps = ["말씀 연구", "설교 초안", "예화", "PPT", "카드뉴스", "쇼츠", "완료"];
const quickActions = [
  ["예화 추가", "현재 결과에 실제 설교에 사용할 수 있는 예화 방향 3개를 추가해 주세요."],
  ["더 자세하게", "현재 결과를 더 구체적이고 풍성하게 확장해 주세요."],
  ["청년부 버전", "현재 결과를 청년부가 이해하기 쉬운 언어와 적용으로 바꿔 주세요."],
  ["장년부 버전", "현재 결과를 장년부 예배에 적합한 언어와 적용으로 바꿔 주세요."],
  ["성경구절 추가", "현재 결과에 관련 성경구절을 문맥에 맞게 추가해 주세요."],
  ["요약", "현재 결과를 핵심만 남겨 짧고 명확하게 요약해 주세요."],
  ["PPT 만들기", "현재 결과를 8장 분량의 PPT 슬라이드 구성으로 변환해 주세요."],
  ["카드뉴스", "현재 결과를 7장 카드뉴스 구성과 장별 문구로 변환해 주세요."],
  ["쇼츠", "현재 결과를 45초 쇼츠 대본, 자막, 썸네일 문구로 변환해 주세요."],
  ["주보", "현재 결과를 교회 주보에 실을 수 있는 짧은 글로 변환해 주세요."],
];

function newProject(title = "새 사역 프로젝트"): Project {
  return {
    id: String(Date.now()),
    title,
    type: "sermon",
    progress: 15,
    updatedAt: new Date().toISOString(),
    messages: [],
    steps: defaultSteps.map((label, index) => ({ label, done: index === 0 })),
  };
}

function relativeTime(value: string) {
  const diff = Date.now() - new Date(value).getTime();
  const minutes = Math.max(0, Math.floor(diff / 60000));
  if (minutes < 1) return "방금 전";
  if (minutes < 60) return `${minutes}분 전`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}시간 전`;
  return `${Math.floor(hours / 24)}일 전`;
}

function inferTool(text: string) {
  if (/기도/.test(text)) return "prayer";
  if (/회의/.test(text)) return "meeting";
  if (/문서|기획서|보고서|교육안|주보/.test(text)) return "document";
  if (/쇼츠|릴스/.test(text)) return "shorts";
  return "sermon";
}

export default function WorkspacePage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeId, setActiveId] = useState("");
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const raw = localStorage.getItem("ministry-partner-projects-v3");
    const params = new URLSearchParams(window.location.search);
    const request = params.get("request")?.trim();
    let next: Project[] = [];
    if (raw) {
      try { next = JSON.parse(raw); } catch { next = []; }
    }
    if (!next.length) next = [newProject(request ? request.slice(0, 30) : "창세기 22장 설교")];
    setProjects(next);
    setActiveId(next[0].id);
    if (request) setInput(request);
  }, []);

  useEffect(() => {
    if (projects.length) localStorage.setItem("ministry-partner-projects-v3", JSON.stringify(projects));
  }, [projects]);

  const active = useMemo(() => projects.find((project) => project.id === activeId) ?? projects[0], [projects, activeId]);
  const lastAssistant = active?.messages.filter((message) => message.role === "assistant").at(-1)?.content ?? "";

  function updateActive(updater: (project: Project) => Project) {
    setProjects((current) => current.map((project) => project.id === activeId ? updater(project) : project));
  }

  function addProject() {
    const project = newProject();
    setProjects((current) => [project, ...current]);
    setActiveId(project.id);
    setInput("");
  }

  async function send(text = input) {
    const trimmed = text.trim();
    if (!trimmed || loading || !active) return;
    setLoading(true);
    setError("");
    const userMessage: Message = { id: Date.now(), role: "user", content: trimmed, createdAt: new Date().toISOString() };
    updateActive((project) => ({
      ...project,
      title: project.messages.length === 0 && project.title === "새 사역 프로젝트" ? trimmed.slice(0, 32) : project.title,
      type: inferTool(trimmed),
      updatedAt: new Date().toISOString(),
      messages: [...project.messages, userMessage],
    }));
    setInput("");

    try {
      const context = active.messages.slice(-4).map((message) => `${message.role === "user" ? "사용자" : "파트너"}: ${message.content}`).join("\n\n");
      const topic = context
        ? `이전 작업 내용:\n${context}\n\n현재 요청:\n${trimmed}\n\n이전 결과를 유지하고 현재 요청에 맞게 이어서 작업하세요.`
        : trimmed;
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tool: inferTool(trimmed), topic }),
      });
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.error || "결과를 만들지 못했습니다.");
      const assistantMessage: Message = { id: Date.now() + 1, role: "assistant", content: data.result, createdAt: new Date().toISOString() };
      updateActive((project) => {
        const nextSteps = project.steps.map((step, index) => ({ ...step, done: step.done || index <= Math.min(5, Math.floor((project.messages.length + 2) / 2)) }));
        const completed = nextSteps.filter((step) => step.done).length;
        return { ...project, messages: [...project.messages, assistantMessage], updatedAt: new Date().toISOString(), steps: nextSteps, progress: Math.round(completed / nextSteps.length * 100) };
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  }

  function submit(event: FormEvent) {
    event.preventDefault();
    send();
  }

  if (!active) return null;

  return (
    <main className="ws3-shell">
      <aside className="ws3-projects">
        <button className="ws3-new" onClick={addProject}>＋ 새 프로젝트</button>
        <p className="ws3-label">프로젝트</p>
        <div className="ws3-project-list">
          {projects.map((project) => (
            <button key={project.id} className={project.id === activeId ? "active" : ""} onClick={() => setActiveId(project.id)}>
              <span>{project.type === "prayer" ? "🙏" : project.type === "shorts" ? "🎬" : project.type === "document" ? "📄" : "⌑"}</span>
              <div><strong>{project.title}</strong><small>{relativeTime(project.updatedAt)} · {project.progress}%</small></div>
            </button>
          ))}
        </div>
        <nav className="ws3-bottom-nav"><a href="/projects">▣ 모든 프로젝트</a><a href="/">⌂ 홈으로</a></nav>
      </aside>

      <section className="ws3-center">
        <header className="ws3-header">
          <div><input value={active.title} onChange={(e) => updateActive((project) => ({ ...project, title: e.target.value, updatedAt: new Date().toISOString() }))} /><p>마지막 저장 {relativeTime(active.updatedAt)} · <b>자동 저장됨</b></p></div>
          <button onClick={() => navigator.clipboard.writeText(lastAssistant)}>결과 복사</button>
        </header>

        <div className="ws3-chat">
          {active.messages.length === 0 ? (
            <section className="ws3-empty"><span>✦</span><h1>사역을 함께 시작해 볼까요?</h1><p>본문, 대상, 시간, 원하는 결과를 편하게 적어 주세요.</p><div>{["창세기 22장 설교 준비", "대표기도 작성", "청년부 카드뉴스", "회의록 정리"].map((item) => <button key={item} onClick={() => setInput(item)}>{item}</button>)}</div></section>
          ) : active.messages.map((message) => (
            <article className={`ws3-message ${message.role}`} key={message.id}>
              <div className="ws3-message-label">{message.role === "user" ? "사역자" : "사역파트너"}</div>
              <div className="ws3-message-body">{message.content}</div>
            </article>
          ))}
          {loading && <article className="ws3-message assistant"><div className="ws3-message-label">사역파트너</div><div className="ws3-thinking">내용을 이어서 준비하고 있습니다…</div></article>}
          {error && <div className="ws3-error">{error}</div>}
        </div>

        {lastAssistant && <section className="ws3-actions"><div className="ws3-actions-head"><strong>빠른 작업</strong><span>현재 결과를 이어서 발전시킵니다</span></div><div>{quickActions.map(([label, prompt]) => <button key={label} disabled={loading} onClick={() => send(prompt)}>{label}</button>)}</div></section>}

        <form className="ws3-composer" onSubmit={submit}>
          <textarea value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }} placeholder="무엇을 더 도와드릴까요?" />
          <div><span>＋ 파일　♩ 음성</span><button disabled={loading || !input.trim()}>{loading ? "준비 중…" : "전송 →"}</button></div>
        </form>
      </section>

      <aside className="ws3-progress">
        <section><p className="ws3-label">현재 프로젝트</p><h2>{active.title}</h2><div className="ws3-progress-number"><strong>{active.progress}%</strong><span>진행 중</span></div><div className="ws3-bar"><i style={{ width: `${active.progress}%` }} /></div></section>
        <section><h3>작업 진행</h3><div className="ws3-step-list">{active.steps.map((step) => <button key={step.label} onClick={() => updateActive((project) => ({ ...project, steps: project.steps.map((item) => item.label === step.label ? { ...item, done: !item.done } : item) }))}><span className={step.done ? "done" : ""}>{step.done ? "✓" : ""}</span>{step.label}</button>)}</div></section>
        <section className="ws3-next"><h3>다음 추천</h3>{["예화를 추가해 보세요", "PPT로 변환해 보세요", "카드뉴스도 만들어 보세요"].map((item, index) => <button key={item} onClick={() => send(quickActions[[0, 6, 7][index]][1])}>○ {item}</button>)}</section>
      </aside>
    </main>
  );
}
