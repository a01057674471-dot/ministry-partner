"use client";

import { ChangeEvent, useEffect, useMemo, useState } from "react";

type Mode = "sermon" | "prayer" | "roadmap" | "worship" | "document" | "meeting" | "shorts" | "youtube" | "file";
type SavedItem = { id: number; mode: Mode; title: string; result: string; createdAt: string };
type ModeConfig = { id: Mode; icon: string; title: string; desc: string; href: string; placeholder: string };

const modes: ModeConfig[] = [
  { id: "sermon", icon: "🎤", title: "설교 개요", desc: "본문 연구 결과를 바탕으로 개요와 적용을 정리", href: "/sermon", placeholder: "예: 사사기 10장 1-16절 / 청년부 / 20분 / 회개와 하나님의 긍휼" },
  { id: "prayer", icon: "🙏", title: "기도문 작성", desc: "예배와 상황에 맞는 기도문", href: "/prayer", placeholder: "추가로 꼭 포함할 내용이 있다면 적어 주세요." },
  { id: "worship", icon: "🎵", title: "찬양 플래너", desc: "본문·주제·예배 종류에 맞는 찬양 추천", href: "/worship", placeholder: "" },
  { id: "roadmap", icon: "🧭", title: "사역 로드맵", desc: "필수 질문부터 시작하는 3년·5년 실행계획", href: "/roadmap", placeholder: "추가로 반영할 사역 환경이나 요청을 적어 주세요." },
  { id: "document", icon: "📄", title: "사역 문서", desc: "기획서·운영안·교육안·보고서 작성", href: "/document", placeholder: "예: 새생명축제 기획서 / 대상 / 예산 / 준비기간" },
  { id: "meeting", icon: "📝", title: "회의 정리", desc: "회의 메모를 결정사항과 할 일로 정리", href: "/meeting", placeholder: "회의 내용을 그대로 붙여넣으세요." },
  { id: "shorts", icon: "🎬", title: "쇼츠 패키지", desc: "대본·자막·본문·고정댓글", href: "/shorts", placeholder: "예: 교회에서 상처받는 이유 / 45초 / 따뜻하지만 직설적" },
  { id: "youtube", icon: "▶️", title: "유튜브 재구성", desc: "유튜브 주소로 숏폼 기획 생성", href: "/youtube-shorts", placeholder: "유튜브 주소를 붙여넣으세요." },
  { id: "file", icon: "📁", title: "파일 재가공", desc: "텍스트 파일을 요약·문서·쇼츠로 변환", href: "/file-analysis", placeholder: "파일을 올린 뒤 원하는 결과를 적어 주세요." },
];

const roadmapQuestions = [
  "현재 맡고 있는 역할과 사역 대상은 누구인가요?",
  "지금 가장 잘되고 있는 부분과 가장 시급한 문제는 무엇인가요?",
  "사역에서 놓치고 싶지 않은 핵심 가치와 소명은 무엇인가요?",
  "3년 뒤 이루고 싶은 구체적인 모습은 무엇인가요?",
  "이번 달부터 시작할 수 있는 가장 작은 행동은 무엇인가요?",
  "5년 뒤 이루고 싶은 사역의 모습과 영향력은 무엇인가요?",
  "함께할 동역자·팀과 사용할 수 있는 시간은 어느 정도인가요?",
  "사용 가능한 예산·공간·기술·자료는 무엇인가요?",
  "필요한 훈련·공부·네트워크는 무엇인가요?",
  "예상되는 소진·관계·재정 위험은 무엇인가요?",
];
const essentialRoadmapCount = 5;

const prayerQuestions = [
  { label: "예배 또는 상황", placeholder: "예: 주일예배 대표기도, 수요예배, 장례예배" },
  { label: "기도 시간", placeholder: "예: 3분" },
  { label: "공동체", placeholder: "예: 장년부, 청년부, 전교인" },
  { label: "꼭 포함할 내용", placeholder: "예: 감사, 회개, 환우, 다음세대, 선교" },
  { label: "원하는 분위기", placeholder: "예: 따뜻하고 진중하게" },
];

const worshipQuestions = [
  { label: "본문", placeholder: "예: 시편 23편 / 요한복음 15장" },
  { label: "주제", placeholder: "예: 은혜, 위로, 회개, 감사, 헌신" },
  { label: "예배 종류", placeholder: "예: 주일예배, 청년예배, 수련회, 기도회" },
];

export default function WorkspaceTool({ fixedMode }: { fixedMode?: Mode }) {
  const [mode, setMode] = useState<Mode>(fixedMode ?? "sermon");
  const [topic, setTopic] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState<SavedItem[]>([]);
  const [showAdvancedRoadmap, setShowAdvancedRoadmap] = useState(false);
  const [roadmapAnswers, setRoadmapAnswers] = useState<string[]>(roadmapQuestions.map(() => ""));
  const [prayerAnswers, setPrayerAnswers] = useState<string[]>(prayerQuestions.map(() => ""));
  const [worshipAnswers, setWorshipAnswers] = useState<string[]>(worshipQuestions.map(() => ""));
  const active = useMemo(() => modes.find((item) => item.id === mode) ?? modes[0], [mode]);

  useEffect(() => {
    const raw = localStorage.getItem("ministry-workspace-saved");
    if (raw) { try { setSaved(JSON.parse(raw)); } catch { setSaved([]); } }
    const params = new URLSearchParams(window.location.search);
    const request = params.get("request");
    if (request) setTopic(request);
    if (!fixedMode) {
      const requestedTool = params.get("tool") as Mode | null;
      if (requestedTool && modes.some((item) => item.id === requestedTool)) setMode(requestedTool);
    }
  }, [fixedMode]);

  function preferenceContext() {
    const denomination = localStorage.getItem("ministry-partner-denomination") || "초교파";
    const theology = localStorage.getItem("ministry-partner-theology") || "균형적 복음주의";
    return `교단 참고: ${denomination}\n신학 성향 참고: ${theology}\n이 설정을 절대적 정답으로 단정하지 말고 다른 주요 견해와 주의점을 함께 제시하세요.`;
  }

  function buildInput() {
    const preference = preferenceContext();
    if (mode === "roadmap") return `${preference}\n\n${roadmapQuestions.map((q, i) => `${i + 1}. ${q}\n답변: ${roadmapAnswers[i].trim() || "미입력"}`).join("\n\n")}${topic.trim() ? `\n\n추가 요청:\n${topic.trim()}` : ""}`;
    if (mode === "prayer") return `${preference}\n\n${prayerQuestions.map((q, i) => `${q.label}: ${prayerAnswers[i].trim() || "미입력"}`).join("\n")}${topic.trim() ? `\n추가 요청: ${topic.trim()}` : ""}`;
    if (mode === "worship") return `${preference}\n\n${worshipQuestions.map((q, i) => `${q.label}: ${worshipAnswers[i].trim() || "미입력"}`).join("\n")}\n\n결과는 반드시 다음 순서로 구성하세요: 시작 찬양, 경배, 말씀 전, 결단, 축도 후.`;
    return `${preference}\n\n사용자 요청:\n${topic.trim()}`;
  }

  async function generate() {
    const input = buildInput();
    const empty = (mode === "roadmap" && roadmapAnswers.every((a) => !a.trim()) && !topic.trim()) || (mode === "prayer" && prayerAnswers.every((a) => !a.trim()) && !topic.trim()) || (mode === "worship" && worshipAnswers.every((a) => !a.trim())) || (!topic.trim() && !["roadmap","prayer","worship"].includes(mode));
    if (empty) return setError("안내된 항목 중 아는 내용부터 입력해 주세요.");
    setLoading(true); setError(""); setResult("");
    try {
      const response = await fetch("/api/generate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ tool: mode, topic: input }) });
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.error || "생성에 실패했습니다.");
      setResult(data.result);
    } catch (err) { setError(err instanceof Error ? err.message : "오류가 발생했습니다."); }
    finally { setLoading(false); }
  }

  function clearAll() { setTopic(""); setResult(""); setError(""); setRoadmapAnswers(roadmapQuestions.map(() => "")); setPrayerAnswers(prayerQuestions.map(() => "")); setWorshipAnswers(worshipQuestions.map(() => "")); }
  async function copyResult() { if (result) { await navigator.clipboard.writeText(result); alert("결과를 복사했습니다."); } }
  function saveResult() { if (!result) return; const item: SavedItem = { id: Date.now(), mode, title: topic.slice(0, 42) || active.title, result, createdAt: new Date().toLocaleString("ko-KR") }; const next = [item, ...saved].slice(0, 30); setSaved(next); localStorage.setItem("ministry-workspace-saved", JSON.stringify(next)); alert("보관함에 저장했습니다."); }
  function downloadDocument() { if (!result) return; const safe = result.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\n/g, "<br>"); const blob = new Blob([`<html><head><meta charset="utf-8"><title>${active.title}</title></head><body><h1>${active.title}</h1><p>${safe}</p></body></html>`], { type: "application/msword;charset=utf-8" }); const url = URL.createObjectURL(blob); const a = document.createElement("a"); a.href = url; a.download = `${active.title}-${new Date().toISOString().slice(0, 10)}.doc`; a.click(); URL.revokeObjectURL(url); }
  async function shareResult() { if (!result) return; try { if (navigator.share) await navigator.share({ title: active.title, text: result }); else { await navigator.clipboard.writeText(result); alert("공유할 내용이 복사되었습니다."); } } catch {} }
  function onFile(event: ChangeEvent<HTMLInputElement>) { const file = event.target.files?.[0]; if (!file) return; const reader = new FileReader(); reader.onload = () => setTopic(`파일명: ${file.name}\n\n${String(reader.result).slice(0, 50000)}`); reader.readAsText(file, "utf-8"); }

  const renderFields = (questions: {label:string; placeholder:string}[], values: string[], setter: (v:string[])=>void) => <div className="question-form"><div className="notice">모르는 항목은 비워도 됩니다.</div>{questions.map((q,i)=><label key={q.label}><strong>{q.label}</strong><input value={values[i]} onChange={(e)=>setter(values.map((v,n)=>n===i?e.target.value:v))} placeholder={q.placeholder}/></label>)}<textarea value={topic} onChange={(e)=>setTopic(e.target.value)} placeholder={active.placeholder}/></div>;
  const roadmapVisible = showAdvancedRoadmap ? roadmapQuestions : roadmapQuestions.slice(0, essentialRoadmapCount);

  return <main className="workspace-shell">
    {!fixedMode && <aside className="workspace-sidebar"><a href="/" className="brand"><span className="brand-mark">↔</span><span>사역파트너</span></a><p className="sidebar-label">PARTNER WORKSPACE</p><nav className="workspace-nav">{modes.map((item)=><a key={item.id} className={mode===item.id?"active":""} href={item.href}><span>{item.icon}</span><div><strong>{item.title}</strong><small>{item.desc}</small></div></a>)}</nav></aside>}
    <section className="workspace-main"><header className="workspace-head"><div><div className="eyebrow">MINISTRY PARTNER</div><h1>{active.icon} {active.title}</h1><p>{active.desc}</p></div><a className="button button-secondary" href="/">홈으로</a></header>
      <div className="workspace-grid"><section className="workspace-editor">
        {mode==="roadmap" ? <div className="question-form"><div className="notice"><strong>필수 질문 5개부터 시작합니다.</strong><br/>나머지는 더 정교한 계획이 필요할 때만 작성하세요.</div>{roadmapVisible.map((q,i)=><label key={q}><strong>{i+1}. {q}</strong><textarea rows={2} value={roadmapAnswers[i]} onChange={(e)=>setRoadmapAnswers(roadmapAnswers.map((v,n)=>n===i?e.target.value:v))} placeholder="간단히 적어도 됩니다."/></label>)}<button type="button" className="button button-secondary roadmap-more" onClick={()=>setShowAdvancedRoadmap(!showAdvancedRoadmap)}>{showAdvancedRoadmap ? "추가 질문 접기" : "추가 질문 5개 열기"}</button><textarea value={topic} onChange={(e)=>setTopic(e.target.value)} placeholder={active.placeholder}/></div> : mode==="prayer" ? renderFields(prayerQuestions, prayerAnswers, setPrayerAnswers) : mode==="worship" ? <div className="question-form"><div className="notice">본문, 주제, 예배 종류만 입력하면 됩니다.</div>{worshipQuestions.map((q,i)=><label key={q.label}><strong>{q.label}</strong><input value={worshipAnswers[i]} onChange={(e)=>setWorshipAnswers(worshipAnswers.map((v,n)=>n===i?e.target.value:v))} placeholder={q.placeholder}/></label>)}</div> : <>{mode==="file"&&<label className="upload-box">파일 선택<input type="file" accept=".txt,.md,.csv,.json" onChange={onFile}/></label>}<textarea value={topic} onChange={(e)=>setTopic(e.target.value)} placeholder={active.placeholder}/></>}
        <div className="editor-actions"><button className="button button-primary" onClick={generate} disabled={loading}>{loading?"파트너가 준비 중…":"파트너에게 요청하기"}</button><button className="button button-secondary" onClick={clearAll}>비우기</button></div>{error&&<div className="notice error">{error}</div>}
      </section><section className="workspace-result"><div className="result-toolbar"><strong>결과</strong><div className="result-actions"><button onClick={copyResult} disabled={!result}>복사</button><button onClick={saveResult} disabled={!result}>저장</button><button onClick={downloadDocument} disabled={!result}>문서</button><button onClick={shareResult} disabled={!result}>공유</button></div></div><div className="result-paper">{result||"내용을 입력하고 요청하면 결과가 여기에 나타납니다."}</div></section></div>
      {saved.length>0&&<section className="saved-section"><h2>최근 저장한 작업</h2><div className="saved-grid">{saved.map((item)=><button key={item.id} onClick={()=>{setMode(item.mode);setTopic(item.title);setResult(item.result)}}><strong>{item.title}</strong><span>{item.createdAt}</span></button>)}</div></section>}
    </section>
  </main>;
}
