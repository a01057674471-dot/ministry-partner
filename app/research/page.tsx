"use client";

import { FormEvent, ReactNode, Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

type ResearchResult = {
  passage: string;
  summary: string;
  historicalBackground: string;
  author: string;
  audience: string;
  literaryContext: string;
  structure: string[];
  keyThemes: string[];
  exegesis: Array<{ section: string; explanation: string; evidence: string }>;
  originalLanguage: Array<{ word: string; transliteration: string; grammar: string; meaning: string; caution: string }>;
  canonicalConnections: Array<{ reference: string; connection: string }>;
  theologicalPerspectives: Array<{ view: string; strengths: string; cautions: string }>;
  application: string[];
  cautions: string[];
  sources: Array<{ title: string; authorOrOrganization: string; type: string; url: string; note: string }>;
  furtherStudy: string[];
};

type SavedResearch = { id: number; passage: string; result: ResearchResult; createdAt: string };

export default function ResearchPage() {
  return <Suspense fallback={<ResearchLoading />}><ResearchContent /></Suspense>;
}

function ResearchLoading() {
  return <main className="research-page"><a className="brand" href="/"><span className="brand-mark">M</span><span>목회파트너</span></a><section className="hero-card research-panel" style={{ marginTop: 34 }}><div className="eyebrow">Bible Research</div><h1 style={{ fontSize: "clamp(38px,6vw,64px)", marginBottom: 14 }}>심층 본문 연구</h1><p>연구 화면을 준비하고 있습니다.</p></section></main>;
}

function ResearchContent() {
  const searchParams = useSearchParams();
  const initialPassage = searchParams.get("passage") ?? "";
  const [passage, setPassage] = useState(initialPassage);
  const [result, setResult] = useState<ResearchResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState<SavedResearch[]>([]);

  useEffect(() => {
    const raw = localStorage.getItem("ministry-research-saved");
    if (raw) setSaved(JSON.parse(raw));
    if (initialPassage) void runResearch(initialPassage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function runResearch(value: string) {
    const trimmed = value.trim();
    if (!trimmed) return setError("연구할 성경 본문을 입력해 주세요.");
    setLoading(true); setError(""); setResult(null);
    try {
      const response = await fetch("/api/research", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ passage: trimmed }) });
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.error || "연구 중 오류가 발생했습니다.");
      setResult(data.result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "알 수 없는 오류가 발생했습니다.");
    } finally { setLoading(false); }
  }

  function submit(event: FormEvent) { event.preventDefault(); void runResearch(passage); }

  function serializeResearch(value: ResearchResult) {
    const lines = [
      `# ${value.passage} 심층 본문 연구`,
      `\n## 핵심 요약\n${value.summary}`,
      `\n## 역사적·문화적 배경\n${value.historicalBackground}`,
      `\n## 저자와 원래 독자\n저자: ${value.author}\n독자: ${value.audience}`,
      `\n## 문학적 문맥\n${value.literaryContext}`,
      `\n## 본문 구조\n${value.structure.map((item) => `- ${item}`).join("\n")}`,
      `\n## 핵심 주제\n${value.keyThemes.map((item) => `- ${item}`).join("\n")}`,
      `\n## 상세 주해\n${value.exegesis.map((item) => `### ${item.section}\n${item.explanation}\n근거: ${item.evidence}`).join("\n\n")}`,
      `\n## 원어 관찰\n${value.originalLanguage.map((item) => `- ${item.word} (${item.transliteration}) / ${item.grammar}: ${item.meaning}${item.caution ? ` / 주의: ${item.caution}` : ""}`).join("\n")}`,
      `\n## 정경적 연결\n${value.canonicalConnections.map((item) => `- ${item.reference}: ${item.connection}`).join("\n")}`,
      `\n## 주요 해석 견해\n${value.theologicalPerspectives.map((item) => `### ${item.view}\n강점: ${item.strengths}\n주의: ${item.cautions}`).join("\n\n")}`,
      `\n## 적용 질문\n${value.application.map((item) => `- ${item}`).join("\n")}`,
      `\n## 해석 시 주의사항\n${value.cautions.map((item) => `- ${item}`).join("\n")}`,
      `\n## 참고자료\n${value.sources.map((item) => `- ${item.title} — ${item.authorOrOrganization} (${item.type})${item.url ? ` ${item.url}` : ""}\n  ${item.note}`).join("\n")}`,
      `\n## 추가 연구 질문\n${value.furtherStudy.map((item) => `- ${item}`).join("\n")}`,
    ];
    return lines.join("\n");
  }

  function saveResearch() {
    if (!result) return;
    const next = [{ id: Date.now(), passage: result.passage, result, createdAt: new Date().toLocaleString("ko-KR") }, ...saved].slice(0, 30);
    setSaved(next); localStorage.setItem("ministry-research-saved", JSON.stringify(next));
  }

  function downloadResearch() {
    if (!result) return;
    const blob = new Blob([serializeResearch(result)], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url; anchor.download = `${result.passage.replace(/\s+/g, "-")}-본문연구.md`; anchor.click();
    URL.revokeObjectURL(url);
  }

  async function shareResearch() {
    if (!result) return;
    const text = serializeResearch(result);
    if (navigator.share) await navigator.share({ title: `${result.passage} 본문 연구`, text });
    else { await navigator.clipboard.writeText(text); alert("공유용 연구 내용이 복사되었습니다."); }
  }

  return (
    <main className="research-page">
      <a className="brand" href="/"><span className="brand-mark">M</span><span>목회파트너</span></a>
      <section className="hero-card research-panel" style={{ marginTop: 34 }}>
        <div className="eyebrow">Deep Bible Research</div>
        <h1 style={{ fontSize: "clamp(38px,6vw,64px)", marginBottom: 14 }}>심층 본문 연구</h1>
        <p>배경·문맥·원어·절별 주해·주요 견해·검증 가능한 참고자료까지 한 번에 정리합니다.</p>
        <form className="research-input" onSubmit={submit}><input value={passage} onChange={(event) => setPassage(event.target.value)} placeholder="예: 요한복음 15장 1–8절" /><button className="button button-primary" type="submit" disabled={loading}>{loading ? "심층 연구 중…" : "연구 시작"}</button></form>
        <div className="notice">AI가 제시한 출처는 링크와 서지정보를 직접 확인하세요. 확인하지 못한 페이지나 직접 인용은 결과에 포함하지 않도록 설계했습니다.</div>
        {error && <div className="notice error">{error}</div>}
      </section>

      {result && (
        <>
          <section className="result">
            <ResultSection title="연구 본문"><p>{result.passage}</p></ResultSection>
            <ResultSection title="핵심 요약"><p>{result.summary}</p></ResultSection>
            <ResultSection title="역사적·문화적 배경"><p>{result.historicalBackground}</p></ResultSection>
            <ResultSection title="저자와 원래 독자"><p><strong>저자:</strong> {result.author}</p><p><strong>독자:</strong> {result.audience}</p></ResultSection>
            <ResultSection title="문학적 문맥"><p>{result.literaryContext}</p></ResultSection>
            <ListSection title="본문 구조" items={result.structure} />
            <ListSection title="핵심 주제" items={result.keyThemes} />
            <ResultSection title="절·단락별 상세 주해">{result.exegesis?.map((item, index) => <div key={index} style={{ marginBottom: 22 }}><h4>{item.section}</h4><p>{item.explanation}</p><p><strong>본문 근거:</strong> {item.evidence}</p></div>)}</ResultSection>
            <ResultSection title="원어 관찰">{result.originalLanguage?.map((item, index) => <div key={`${item.word}-${index}`} style={{ marginBottom: 16 }}><p><strong>{item.word}</strong> ({item.transliteration}) · {item.grammar}</p><p>{item.meaning}</p>{item.caution && <p><strong>주의:</strong> {item.caution}</p>}</div>)}</ResultSection>
            <ResultSection title="정경적·병행 본문 연결">{result.canonicalConnections?.map((item, index) => <p key={index}><strong>{item.reference}</strong> — {item.connection}</p>)}</ResultSection>
            <ResultSection title="주요 해석 견해 비교">{result.theologicalPerspectives?.map((item, index) => <div key={index} style={{ marginBottom: 18 }}><h4>{item.view}</h4><p><strong>강점:</strong> {item.strengths}</p><p><strong>주의:</strong> {item.cautions}</p></div>)}</ResultSection>
            <ListSection title="오늘의 적용을 위한 질문" items={result.application} />
            <ListSection title="해석 시 주의사항" items={result.cautions} />
            <ResultSection title="검증·추가 연구 자료">{result.sources?.map((item, index) => <div key={index} style={{ marginBottom: 16 }}><p><strong>{item.title}</strong> — {item.authorOrOrganization} · {item.type}</p><p>{item.note}</p>{item.url && <a href={item.url} target="_blank" rel="noreferrer">자료 열기 ↗</a>}</div>)}</ResultSection>
            <ListSection title="더 깊이 연구할 질문" items={result.furtherStudy} />
          </section>
          <section className="result-section" style={{ position: "sticky", bottom: 16, marginTop: 18 }}><div className="editor-actions"><button className="button button-primary" onClick={saveResearch}>저장</button><button className="button button-secondary" onClick={downloadResearch}>문서로 받기</button><button className="button button-secondary" onClick={shareResearch}>공유</button><button className="button button-secondary" onClick={() => navigator.clipboard.writeText(serializeResearch(result))}>전체 복사</button></div></section>
        </>
      )}

      {saved.length > 0 && <section className="saved-section"><h2>저장한 본문 연구</h2><div className="saved-grid">{saved.map((item) => <button key={item.id} onClick={() => { setPassage(item.passage); setResult(item.result); }}><strong>{item.passage}</strong><span>{item.createdAt}</span></button>)}</div></section>}
    </main>
  );
}

function ResultSection({ title, children }: { title: string; children: ReactNode }) { return <article className="result-section"><h3>{title}</h3>{children}</article>; }
function ListSection({ title, items }: { title: string; items?: string[] }) { return <ResultSection title={title}><ul>{(items ?? []).map((item, index) => <li key={index}>{item}</li>)}</ul></ResultSection>; }
