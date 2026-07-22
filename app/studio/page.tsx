"use client";

import { FormEvent, useEffect, useState } from "react";

type ToolType = "shorts" | "ideas" | "thumbnail" | "devotional";

type SavedItem = {
  id: number;
  tool: ToolType;
  topic: string;
  result: string;
  createdAt: string;
};

const tools: Array<{ id: ToolType; icon: string; title: string; description: string; placeholder: string }> = [
  { id: "shorts", icon: "🎬", title: "쇼츠 대본", description: "60초 이하 훅·대본·자막·마무리 질문을 만듭니다.", placeholder: "예: 교회 커플이 자꾸 싸우는 이유" },
  { id: "ideas", icon: "💡", title: "콘텐츠 아이디어", description: "교회·성경 SNS 콘텐츠 아이디어 10개를 만듭니다.", placeholder: "예: 새신자들이 궁금해하는 교회 용어" },
  { id: "thumbnail", icon: "🖼️", title: "썸네일·이미지", description: "썸네일 문구와 이미지 생성 프롬프트를 만듭니다.", placeholder: "예: 믿음이 흔들릴 때 꼭 기억할 것" },
  { id: "devotional", icon: "🙏", title: "묵상 콘텐츠", description: "본문 요약·질문·기도문·SNS 본문을 만듭니다.", placeholder: "예: 시편 23편" },
];

export default function StudioPage() {
  const [tool, setTool] = useState<ToolType>("shorts");
  const [topic, setTopic] = useState("");
  const [result, setResult] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState<SavedItem[]>([]);

  useEffect(() => {
    const raw = localStorage.getItem("ministry-partner-saved");
    if (raw) {
      try { setSaved(JSON.parse(raw)); } catch { setSaved([]); }
    }
  }, []);

  const selected = tools.find((item) => item.id === tool) ?? tools[0];

  async function generate(event: FormEvent) {
    event.preventDefault();
    if (!topic.trim()) {
      setError("주제나 성경 본문을 입력해 주세요.");
      return;
    }

    setLoading(true);
    setError("");
    setResult("");

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tool, topic }),
      });
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.error || "생성하지 못했습니다.");
      setResult(data.result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  }

  function saveResult() {
    if (!result) return;
    const item: SavedItem = { id: Date.now(), tool, topic, result, createdAt: new Date().toLocaleString("ko-KR") };
    const next = [item, ...saved].slice(0, 20);
    setSaved(next);
    localStorage.setItem("ministry-partner-saved", JSON.stringify(next));
  }

  async function copyResult() {
    if (!result) return;
    await navigator.clipboard.writeText(result);
    alert("결과를 복사했습니다.");
  }

  function removeSaved(id: number) {
    const next = saved.filter((item) => item.id !== id);
    setSaved(next);
    localStorage.setItem("ministry-partner-saved", JSON.stringify(next));
  }

  return (
    <main className="studio-page">
      <header className="studio-header">
        <a className="brand" href="/"><span className="brand-mark">M</span><span>목회파트너</span></a>
        <div className="studio-links"><a href="/research">본문 연구</a><a href="#saved">저장한 결과</a></div>
      </header>

      <section className="studio-hero">
        <div className="eyebrow">MINISTRY CONTENT STUDIO</div>
        <h1>목회 콘텐츠를<br />더 빠르게 준비하세요.</h1>
        <p>쇼츠 대본, 콘텐츠 아이디어, 썸네일 문구와 묵상 콘텐츠를 한곳에서 만듭니다.</p>
      </section>

      <section className="tool-tabs" aria-label="기능 선택">
        {tools.map((item) => (
          <button key={item.id} className={`tool-tab ${tool === item.id ? "active" : ""}`} onClick={() => { setTool(item.id); setResult(""); setError(""); }}>
            <span>{item.icon}</span><strong>{item.title}</strong><small>{item.description}</small>
          </button>
        ))}
      </section>

      <section className="generator-card">
        <div>
          <div className="eyebrow">{selected.title}</div>
          <h2>{selected.description}</h2>
        </div>
        <form onSubmit={generate}>
          <textarea value={topic} onChange={(e) => setTopic(e.target.value)} placeholder={selected.placeholder} rows={5} />
          <button className="button button-primary wide" type="submit" disabled={loading}>{loading ? "만드는 중…" : `${selected.title} 만들기`}</button>
        </form>
        {error && <div className="notice error">{error}</div>}
      </section>

      {result && (
        <section className="output-card">
          <div className="output-head"><h2>생성 결과</h2><div><button onClick={copyResult}>복사</button><button onClick={saveResult}>저장</button></div></div>
          <pre>{result}</pre>
        </section>
      )}

      <section id="saved" className="saved-section">
        <div className="section-head"><div><div className="eyebrow">MY RESULTS</div><h2>저장한 결과</h2></div><p>이 기기의 브라우저에 최대 20개까지 저장됩니다.</p></div>
        {saved.length === 0 ? <div className="empty-state">아직 저장한 결과가 없습니다.</div> : (
          <div className="saved-grid">{saved.map((item) => (
            <article className="saved-card" key={item.id}>
              <div className="saved-meta"><strong>{tools.find((t) => t.id === item.tool)?.title}</strong><span>{item.createdAt}</span></div>
              <h3>{item.topic}</h3><p>{item.result.slice(0, 180)}{item.result.length > 180 ? "…" : ""}</p>
              <div className="saved-actions"><button onClick={() => { setTool(item.tool); setTopic(item.topic); setResult(item.result); window.scrollTo({ top: 0, behavior: "smooth" }); }}>열기</button><button onClick={() => removeSaved(item.id)}>삭제</button></div>
            </article>
          ))}</div>
        )}
      </section>
    </main>
  );
}
