"use client";

import { FormEvent, ReactNode, Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

type ResearchResult = {
  passage: string; summary: string; historicalBackground: string; author: string; audience: string; literaryContext: string;
  structure: string[]; keyThemes: string[];
  exegesis: Array<{ section: string; explanation: string; evidence: string }>;
  originalLanguage: Array<{ word: string; transliteration: string; grammar: string; meaning: string; caution: string }>;
  canonicalConnections: Array<{ reference: string; connection: string }>;
  theologicalPerspectives: Array<{ view: string; strengths: string; cautions: string }>;
  application: string[]; cautions: string[];
  sources: Array<{ title: string; authorOrOrganization: string; type: string; url: string; note: string }>;
  furtherStudy: string[];
};

type SavedResearch = { id: number; passage: string; result: ResearchResult; createdAt: string };

const list = <T,>(value: T[] | null | undefined): T[] => Array.isArray(value) ? value : [];
const text = (value: unknown, fallback = "확인 필요") => typeof value === "string" && value.trim() ? value : fallback;

export default function ResearchPage() {
  return <Suspense fallback={<ResearchLoading />}><ResearchContent /></Suspense>;
}

function ResearchLoading() {
  return <main className="research-modern"><section className="research-hero"><div className="research-kicker">BIBLE RESEARCH</div><h1>말씀 연구</h1><p>연구 화면을 준비하고 있습니다.</p></section></main>;
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
    try {
      const raw = localStorage.getItem("ministry-research-saved");
      if (raw) {
        const parsed = JSON.parse(raw);
        setSaved(Array.isArray(parsed) ? parsed : []);
      }
    } catch {
      localStorage.removeItem("ministry-research-saved");
      setSaved([]);
    }
    if (initialPassage) void runResearch(initialPassage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function runResearch(value: string) {
    const trimmed = value.trim();
    if (!trimmed) return setError("연구할 성경 본문을 입력해 주세요.");
    setLoading(true); setError(""); setResult(null);
    try {
      const response = await fetch("/api/research", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ passage: trimmed }) });
      const data = await response.json().catch(() => null);
      if (!response.ok || !data?.success || !data?.result) throw new Error(data?.error || "연구 결과를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.");
      setResult(data.result as ResearchResult);
    } catch (err) {
      setError(err instanceof Error ? err.message : "연구 중 오류가 발생했습니다. 다시 시도해 주세요.");
    } finally { setLoading(false); }
  }

  function submit(event: FormEvent) { event.preventDefault(); void runResearch(passage); }

  function serializeResearch(value: ResearchResult) {
    return [
      `# ${text(value.passage)} 말씀 연구`,
      `\n## 핵심 요약\n${text(value.summary)}`,
      `\n## 역사적·문화적 배경\n${text(value.historicalBackground)}`,
      `\n## 저자와 원래 독자\n저자: ${text(value.author)}\n독자: ${text(value.audience)}`,
      `\n## 문학적 문맥\n${text(value.literaryContext)}`,
      `\n## 본문 구조\n${list(value.structure).map((item) => `- ${item}`).join("\n")}`,
      `\n## 핵심 주제\n${list(value.keyThemes).map((item) => `- ${item}`).join("\n")}`,
      `\n## 상세 주해\n${list(value.exegesis).map((item) => `### ${text(item?.section)}\n${text(item?.explanation)}\n근거: ${text(item?.evidence)}`).join("\n\n")}`,
      `\n## 원어 관찰\n${list(value.originalLanguage).map((item) => `- ${text(item?.word)} (${text(item?.transliteration)}) / ${text(item?.grammar)}: ${text(item?.meaning)}${item?.caution ? ` / 주의: ${item.caution}` : ""}`).join("\n")}`,
      `\n## 정경적 연결\n${list(value.canonicalConnections).map((item) => `- ${text(item?.reference)}: ${text(item?.connection)}`).join("\n")}`,
      `\n## 주요 해석 견해\n${list(value.theologicalPerspectives).map((item) => `### ${text(item?.view)}\n강점: ${text(item?.strengths)}\n주의: ${text(item?.cautions)}`).join("\n\n")}`,
      `\n## 적용 질문\n${list(value.application).map((item) => `- ${item}`).join("\n")}`,
      `\n## 해석 시 주의사항\n${list(value.cautions).map((item) => `- ${item}`).join("\n")}`,
      `\n## 참고자료\n${list(value.sources).map((item) => `- ${text(item?.title)} — ${text(item?.authorOrOrganization)} (${text(item?.type)})${item?.url ? ` ${item.url}` : ""}\n  ${text(item?.note)}`).join("\n")}`,
      `\n## 추가 연구 질문\n${list(value.furtherStudy).map((item) => `- ${item}`).join("\n")}`,
    ].join("\n");
  }

  function saveResearch() {
    if (!result) return;
    const next = [{ id: Date.now(), passage: text(result.passage, passage), result, createdAt: new Date().toLocaleString("ko-KR") }, ...saved].slice(0, 30);
    setSaved(next); localStorage.setItem("ministry-research-saved", JSON.stringify(next)); alert("말씀 연구를 저장했습니다.");
  }

  function downloadResearch() {
    if (!result) return;
    const blob = new Blob([serializeResearch(result)], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob); const anchor = document.createElement("a");
    anchor.href = url; anchor.download = `${text(result.passage, "말씀연구").replace(/\s+/g, "-")}-말씀연구.md`; anchor.click(); URL.revokeObjectURL(url);
  }

  async function shareResearch() {
    if (!result) return;
    const shareText = serializeResearch(result);
    try {
      if (navigator.share) await navigator.share({ title: `${text(result.passage)} 말씀 연구`, text: shareText });
      else { await navigator.clipboard.writeText(shareText); alert("공유용 연구 내용이 복사되었습니다."); }
    } catch {}
  }

  return (
    <main className="research-modern">
      <section className="research-hero">
        <div className="research-kicker">BIBLE RESEARCH</div>
        <h1>말씀 연구</h1>
        <p>본문의 배경과 문맥, 원어, 절별 주해와 주요 견해를 한눈에 정리합니다.</p>
      </section>

      <section className="research-search-card">
        <div><strong>연구할 본문</strong><span>성경 구절을 정확히 입력해 주세요.</span></div>
        <form className="research-search-form" onSubmit={submit}>
          <input value={passage} onChange={(event) => setPassage(event.target.value)} placeholder="예: 요한복음 15장 1–8절" />
          <button type="submit" disabled={loading}>{loading ? "연구 중…" : "연구 시작 →"}</button>
        </form>
      </section>

      <section className="research-feature-grid">
        <article><b>01</b><strong>배경과 문맥</strong><span>저자, 독자, 시대적 상황과 책 전체 흐름</span></article>
        <article><b>02</b><strong>원어와 구조</strong><span>핵심 단어, 문법, 단락과 논리 전개</span></article>
        <article><b>03</b><strong>해석과 적용</strong><span>주요 견해 비교, 주의점과 묵상 질문</span></article>
      </section>

      {loading && <div className="research-status">본문의 문맥과 원어, 주요 견해를 정리하고 있습니다.</div>}
      {!loading && !error && <div className="research-note">AI가 제시한 출처는 링크와 서지정보를 직접 확인해 주세요.</div>}
      {error && <div className="research-error"><strong>연구를 완료하지 못했습니다.</strong><p>{error}</p><button type="button" onClick={() => void runResearch(passage)}>다시 시도</button></div>}

      {result && <><section className="research-results">
        <ResultSection title="연구 본문"><p>{text(result.passage)}</p></ResultSection>
        <ResultSection title="핵심 요약"><p>{text(result.summary)}</p></ResultSection>
        <ResultSection title="역사적·문화적 배경"><p>{text(result.historicalBackground)}</p></ResultSection>
        <ResultSection title="저자와 원래 독자"><p><strong>저자:</strong> {text(result.author)}</p><p><strong>독자:</strong> {text(result.audience)}</p></ResultSection>
        <ResultSection title="문학적 문맥"><p>{text(result.literaryContext)}</p></ResultSection>
        <ListSection title="본문 구조" items={result.structure} />
        <ListSection title="핵심 주제" items={result.keyThemes} />
        <ResultSection title="절·단락별 상세 주해">{list(result.exegesis).map((item, index) => <div key={index} className="research-block"><h4>{text(item?.section)}</h4><p>{text(item?.explanation)}</p><p><strong>본문 근거:</strong> {text(item?.evidence)}</p></div>)}</ResultSection>
        <ResultSection title="원어 관찰">{list(result.originalLanguage).map((item, index) => <div key={index} className="research-block"><p><strong>{text(item?.word)}</strong> ({text(item?.transliteration)}) · {text(item?.grammar)}</p><p>{text(item?.meaning)}</p>{item?.caution && <p><strong>주의:</strong> {item.caution}</p>}</div>)}</ResultSection>
        <ResultSection title="정경적·병행 본문 연결">{list(result.canonicalConnections).map((item, index) => <p key={index}><strong>{text(item?.reference)}</strong> — {text(item?.connection)}</p>)}</ResultSection>
        <ResultSection title="주요 해석 견해 비교">{list(result.theologicalPerspectives).map((item, index) => <div key={index} className="research-block"><h4>{text(item?.view)}</h4><p><strong>강점:</strong> {text(item?.strengths)}</p><p><strong>주의:</strong> {text(item?.cautions)}</p></div>)}</ResultSection>
        <ListSection title="오늘의 적용을 위한 질문" items={result.application} />
        <ListSection title="해석 시 주의사항" items={result.cautions} />
        <ResultSection title="검증·추가 연구 자료">{list(result.sources).map((item, index) => <div key={index} className="research-block"><p><strong>{text(item?.title)}</strong> — {text(item?.authorOrOrganization)} · {text(item?.type)}</p><p>{text(item?.note)}</p>{item?.url && <a href={item.url} target="_blank" rel="noreferrer">자료 열기 ↗</a>}</div>)}</ResultSection>
        <ListSection title="더 깊이 연구할 질문" items={result.furtherStudy} />
      </section><section className="research-result-actions"><button onClick={saveResearch}>저장</button><button onClick={downloadResearch}>문서로 받기</button><button onClick={shareResearch}>공유</button><button onClick={() => navigator.clipboard.writeText(serializeResearch(result))}>전체 복사</button></section></>}

      {saved.length > 0 && <section className="research-saved"><h2>저장한 말씀 연구</h2><div>{saved.map((item) => <button key={item.id} onClick={() => { setPassage(item.passage); setResult(item.result); }}><strong>{item.passage}</strong><span>{item.createdAt}</span></button>)}</div></section>}
    </main>
  );
}

function ResultSection({ title, children }: { title: string; children: ReactNode }) { return <article className="research-result-card"><h3>{title}</h3>{children}</article>; }
function ListSection({ title, items }: { title: string; items?: string[] }) { const safe = list(items); return <ResultSection title={title}>{safe.length ? <ul>{safe.map((item, index) => <li key={index}>{item}</li>)}</ul> : <p>확인 가능한 항목이 없습니다.</p>}</ResultSection>; }
