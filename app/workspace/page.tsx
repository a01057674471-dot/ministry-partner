"use client";

import { ChangeEvent, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";

type Mode = "sermon" | "roadmap" | "document" | "meeting" | "shorts" | "youtube" | "file";
type SavedItem = { id: number; mode: Mode; title: string; result: string; createdAt: string };

const modes: Array<{ id: Mode; icon: string; title: string; desc: string; placeholder: string }> = [
  { id: "sermon", icon: "🎤", title: "설교 준비", desc: "본문 연구부터 개요·적용·설교문까지", placeholder: "예: 본문은 사사기 10장 1-16절, 청년부 대상, 20분 설교, 주제는 회개와 하나님의 긍휼" },
  { id: "roadmap", icon: "🧭", title: "교회 비전 로드맵", desc: "구체적인 질문에 답하며 3년 실행계획 완성", placeholder: "아래 질문에 답하면 더 현실적인 로드맵이 만들어집니다." },
  { id: "document", icon: "📄", title: "목회 문서 제작", desc: "기획서·운영안·교육안·기도문 작성", placeholder: "무엇을 만들지 구체적으로 적어 주세요. 예: 7월 첫째 주 주일예배 대표기도문, 3분 분량, 감사와 다음세대를 위한 기도 포함" },
  { id: "meeting", icon: "📝", title: "회의 정리", desc: "회의 메모를 결정사항과 할 일로 정리", placeholder: "회의 내용을 그대로 붙여넣으세요. 결정사항, 담당자, 기한, 미결사항으로 정리합니다." },
  { id: "shorts", icon: "🎬", title: "쇼츠 패키지", desc: "대본·자막·썸네일·본문·고정댓글", placeholder: "주제 / 대상 / 영상 길이 / 원하는 분위기를 적어 주세요. 예: 교회에서 상처받는 이유, 30대 크리스천, 45초, 따뜻하지만 직설적" },
  { id: "youtube", icon: "▶️", title: "유튜브에서 쇼츠 만들기", desc: "유튜브 주소로 숏폼 기획과 대본 생성", placeholder: "유튜브 주소를 붙여넣으세요. 예: https://www.youtube.com/watch?v=..." },
  { id: "file", icon: "📁", title: "파일 내용 재가공", desc: "텍스트 파일을 읽어 요약·문서·쇼츠로 변환", placeholder: "파일을 올린 뒤 원하는 결과를 적어 주세요. 예: 이 회의록을 결정사항과 담당자 표로 정리" },
];

const roadmapQuestions = [
  "현재 출석 인원과 연령대 구성은 어떻게 되나요?",
  "교회가 위치한 지역과 지역 주민의 특징은 무엇인가요?",
  "현재 가장 잘되고 있는 사역 3가지는 무엇인가요?",
  "가장 시급하게 개선해야 할 문제 3가지는 무엇인가요?",
  "담임목회자와 공동체가 절대 놓치고 싶지 않은 핵심 가치는 무엇인가요?",
  "3년 뒤 교회가 어떤 모습이 되기를 바라나요? 숫자와 장면으로 적어 주세요.",
  "다음세대·새가족·제자훈련·선교 중 가장 우선할 분야는 무엇인가요?",
  "현재 사역자와 핵심 리더는 몇 명이며 실제로 투입 가능한 시간은 어느 정도인가요?",
  "연간 사용 가능한 신규 사역 예산 범위는 어느 정도인가요?",
  "변화를 추진할 때 예상되는 가장 큰 저항이나 위험은 무엇인가요?",
];

export default function WorkspacePage() {
  const searchParams = useSearchParams();
  const requestedTool = searchParams.get("tool") as Mode | null;
  const requestedText = searchParams.get("request") ?? "";
  const [mode, setMode] = useState<Mode>("sermon");
  const [topic, setTopic] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState<SavedItem[]>([]);
  const [roadmapAnswers, setRoadmapAnswers] = useState<string[]>(roadmapQuestions.map(() => ""));

  const active = useMemo(() => modes.find((item) => item.id === mode) ?? modes[0], [mode]);

  useEffect(() => {
    const raw = localStorage.getItem("ministry-workspace-saved");
    if (raw) setSaved(JSON.parse(raw));
    if (requestedTool && modes.some((item) => item.id === requestedTool)) setMode(requestedTool);
    if (requestedText) setTopic(requestedText);
  }, [requestedTool, requestedText]);

  function buildInput() {
    if (mode !== "roadmap") return topic.trim();
    const answers = roadmapQuestions.map((question, index) => `${index + 1}. ${question}\n답변: ${roadmapAnswers[index].trim() || "미입력"}`).join("\n\n");
    return `${answers}${topic.trim() ? `\n\n추가 요청:\n${topic.trim()}` : ""}`;
  }

  async function generate() {
    const input = buildInput();
    if (!input || (mode === "roadmap" && roadmapAnswers.every((answer) => !answer.trim()))) return setError("내용을 입력해 주세요.");
    setLoading(true); setError(""); setResult("");
    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tool: mode, topic: input }),
      });
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.error || "생성에 실패했습니다.");
      setResult(data.result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "오류가 발생했습니다.");
    } finally { setLoading(false); }
  }

  function saveResult() {
    if (!result) return;
    const item: SavedItem = { id: Date.now(), mode, title: topic.slice(0, 42) || active.title, result, createdAt: new Date().toLocaleString("ko-KR") };
    const next = [item, ...saved].slice(0, 30);
    setSaved(next); localStorage.setItem("ministry-workspace-saved", JSON.stringify(next));
  }

  function downloadResult() {
    if (!result) return;
    const blob = new Blob([`# ${active.title}\n\n${result}`], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url; anchor.download = `${active.title}-${new Date().toISOString().slice(0, 10)}.md`; anchor.click();
    URL.revokeObjectURL(url);
  }

  async function shareResult() {
    if (!result) return;
    if (navigator.share) await navigator.share({ title: active.title, text: result });
    else { await navigator.clipboard.writeText(result); alert("공유용 내용이 복사되었습니다."); }
  }

  function onFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    const allowed = ["text/plain", "text/markdown", "text/csv", "application/json"];
    if (!allowed.includes(file.type) && !file.name.match(/\.(txt|md|csv|json)$/i)) {
      setError("현재는 TXT·MD·CSV·JSON 파일을 읽을 수 있습니다."); return;
    }
    const reader = new FileReader();
    reader.onload = () => setTopic(`파일명: ${file.name}\n\n${String(reader.result).slice(0, 50000)}`);
    reader.readAsText(file, "utf-8");
  }

  return (
    <main className="workspace-shell">
      <aside className="workspace-sidebar">
        <a href="/" className="brand"><span className="brand-mark">M</span><span>목회파트너</span></a>
        <p className="sidebar-label">AI WORKSPACE</p>
        <nav className="workspace-nav">
          {modes.map((item) => <button key={item.id} className={mode === item.id ? "active" : ""} onClick={() => { setMode(item.id); setResult(""); setError(""); }}><span>{item.icon}</span><div><strong>{item.title}</strong><small>{item.desc}</small></div></button>)}
        </nav>
        <a className="sidebar-link" href="/research">📖 심층 성경 본문 연구</a>
      </aside>

      <section className="workspace-main">
        <header className="workspace-head"><div><div className="eyebrow">MINISTRY AI WORKSPACE</div><h1>{active.icon} {active.title}</h1><p>{active.desc}</p></div><a className="button button-secondary" href="/">홈으로</a></header>

        <div className="workspace-grid">
          <section className="workspace-editor">
            {mode === "roadmap" ? (
              <div style={{ display: "grid", gap: 14 }}>
                <div className="notice">모든 질문에 완벽히 답하지 않아도 됩니다. 아는 것부터 구체적으로 적어 주세요.</div>
                {roadmapQuestions.map((question, index) => (
                  <label key={question} style={{ display: "grid", gap: 7 }}><strong>{index + 1}. {question}</strong><textarea rows={2} value={roadmapAnswers[index]} onChange={(event) => setRoadmapAnswers((current) => current.map((value, i) => i === index ? event.target.value : value))} placeholder="예: 주일 출석 80명, 50대 이상 55%, 청년 10명, 유초등부 12명" /></label>
                ))}
                <textarea value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="추가로 반영할 요청이 있다면 적어 주세요." />
              </div>
            ) : (
              <>
                {mode === "file" && <label className="upload-box">파일 선택<input type="file" accept=".txt,.md,.csv,.json,text/plain,text/markdown,text/csv,application/json" onChange={onFile} /></label>}
                {mode === "youtube" && <div className="notice">유튜브 주소만 붙여넣으면 제목과 채널 정보를 확인해 쇼츠 기획을 만듭니다. 영상 자막까지 자동 확보되지 않는 경우에는 메타데이터 기반 기획임을 결과에 표시합니다.</div>}
                {mode === "sermon" && <div className="notice">본문 / 청중 / 설교 시간 / 예배 상황 / 강조할 주제를 적으면 더 정확합니다. 예: 요한복음 15:1-8, 장년부, 25분, 주일예배, 열매 맺는 삶</div>}
                <textarea value={topic} onChange={(e) => setTopic(e.target.value)} placeholder={active.placeholder} />
              </>
            )}
            <div className="editor-actions"><button className="button button-primary" onClick={generate} disabled={loading}>{loading ? "AI가 정리 중…" : "결과 만들기"}</button><button className="button button-secondary" onClick={() => { setTopic(""); setResult(""); setError(""); }}>비우기</button></div>
            {error && <div className="notice error">{error}</div>}
          </section>

          <section className="workspace-result">
            <div className="result-toolbar"><strong>결과</strong><div><button onClick={() => result && navigator.clipboard.writeText(result)}>복사</button><button onClick={saveResult}>저장</button><button onClick={downloadResult}>문서화</button><button onClick={shareResult}>공유</button></div></div>
            <div className="result-paper">{result || "왼쪽 안내에 따라 내용을 입력하고 ‘결과 만들기’를 누르세요."}</div>
          </section>
        </div>

        {saved.length > 0 && <section className="saved-section"><h2>최근 저장한 작업</h2><div className="saved-grid">{saved.map((item) => <button key={item.id} onClick={() => { setMode(item.mode); setTopic(item.title); setResult(item.result); }}><strong>{item.title}</strong><span>{item.createdAt}</span></button>)}</div></section>}
      </section>
    </main>
  );
}
