"use client";

import { ChangeEvent, useEffect, useState } from "react";

type Mode = "roadmap" | "document" | "meeting" | "shorts" | "youtube" | "file";

type SavedItem = { id: number; mode: Mode; title: string; result: string; createdAt: string };

const modes: Array<{ id: Mode; icon: string; title: string; desc: string; placeholder: string }> = [
  { id: "roadmap", icon: "🧭", title: "교회 비전 로드맵", desc: "비전부터 3년·1년·분기 실행계획까지", placeholder: "예: 80명 규모 교회입니다. 다음세대와 새가족 정착을 중심으로 3년 로드맵을 만들고 싶습니다." },
  { id: "document", icon: "📄", title: "목회 문서 제작", desc: "기획서·운영안·교육안·보고서 작성", placeholder: "예: 가을 새생명축제 기획서. 목표, 일정, 역할, 예산, 홍보, 사후관리까지 포함" },
  { id: "meeting", icon: "📝", title: "회의 정리", desc: "회의 메모를 결정사항과 할 일로 정리", placeholder: "회의 내용을 그대로 붙여넣으세요. 결정사항, 담당자, 기한, 미결사항으로 정리합니다." },
  { id: "shorts", icon: "🎬", title: "쇼츠 패키지", desc: "대본·자막·썸네일·본문·고정댓글", placeholder: "예: 교회 안에서 자꾸 상처받는 이유. 45초, 따뜻하지만 직설적인 톤" },
  { id: "youtube", icon: "▶️", title: "영상에서 쇼츠 만들기", desc: "유튜브 주소와 자막을 넣어 쇼츠 후보 추출", placeholder: "첫 줄에 유튜브 주소를 넣고, 아래에 영상 자막이나 대본을 붙여넣으세요." },
  { id: "file", icon: "📁", title: "파일 내용 재가공", desc: "텍스트 파일을 읽어 요약·문서·쇼츠로 변환", placeholder: "파일을 올리면 텍스트가 여기에 들어옵니다. 원하는 결과도 함께 적어주세요." },
];

export default function WorkspacePage() {
  const [mode, setMode] = useState<Mode>("roadmap");
  const [topic, setTopic] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState<SavedItem[]>([]);

  const active = modes.find((item) => item.id === mode)!;

  useEffect(() => {
    const raw = localStorage.getItem("ministry-workspace-saved");
    if (raw) setSaved(JSON.parse(raw));
  }, []);

  async function generate() {
    if (!topic.trim()) return setError("내용을 입력해 주세요.");
    setLoading(true); setError(""); setResult("");
    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tool: mode, topic }),
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

  function onFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    const allowed = ["text/plain", "text/markdown", "text/csv", "application/json"];
    if (!allowed.includes(file.type) && !file.name.match(/\.(txt|md|csv|json)$/i)) {
      setError("현재는 TXT·MD·CSV·JSON 파일을 바로 읽을 수 있습니다. PDF·영상은 다음 연결 단계에서 지원합니다.");
      return;
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
        <a className="sidebar-link" href="/research">📖 성경 본문 연구</a>
        <a className="sidebar-link" href="/studio">✨ 간단 콘텐츠 도구</a>
      </aside>

      <section className="workspace-main">
        <header className="workspace-head"><div><div className="eyebrow">MINISTRY AI WORKSPACE</div><h1>{active.icon} {active.title}</h1><p>{active.desc}</p></div><a className="button button-secondary" href="/">홈으로</a></header>

        <div className="workspace-grid">
          <section className="workspace-editor">
            {mode === "file" && <label className="upload-box">파일 선택<input type="file" accept=".txt,.md,.csv,.json,text/plain,text/markdown,text/csv,application/json" onChange={onFile} /></label>}
            {mode === "youtube" && <div className="notice">유튜브 주소만으로 전체 영상을 읽지는 못합니다. 주소와 함께 자동 자막 또는 대본을 붙이면 쇼츠 구간을 정확하게 뽑습니다.</div>}
            <textarea value={topic} onChange={(e) => setTopic(e.target.value)} placeholder={active.placeholder} />
            <div className="editor-actions"><button className="button button-primary" onClick={generate} disabled={loading}>{loading ? "AI가 정리 중…" : "결과 만들기"}</button><button className="button button-secondary" onClick={() => { setTopic(""); setResult(""); setError(""); }}>비우기</button></div>
            {error && <div className="notice error">{error}</div>}
          </section>

          <section className="workspace-result">
            <div className="result-toolbar"><strong>결과</strong><div><button onClick={() => result && navigator.clipboard.writeText(result)}>복사</button><button onClick={saveResult}>저장</button></div></div>
            <div className="result-paper">{result || "왼쪽에 내용을 입력하고 ‘결과 만들기’를 누르세요."}</div>
          </section>
        </div>

        {saved.length > 0 && <section className="saved-section"><h2>최근 저장한 작업</h2><div className="saved-grid">{saved.map((item) => <button key={item.id} onClick={() => { setMode(item.mode); setTopic(item.title); setResult(item.result); }}><strong>{item.title}</strong><span>{item.createdAt}</span></button>)}</div></section>}
      </section>
    </main>
  );
}
