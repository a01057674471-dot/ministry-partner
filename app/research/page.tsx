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
  originalLanguage: Array<{ word: string; transliteration: string; meaning: string }>;
  application: string[];
  cautions: string[];
};

export default function ResearchPage() {
  return (
    <Suspense fallback={<ResearchLoading />}>
      <ResearchContent />
    </Suspense>
  );
}

function ResearchLoading() {
  return (
    <main className="research-page">
      <a className="brand" href="/">
        <span className="brand-mark">M</span>
        <span>목회파트너</span>
      </a>
      <section className="hero-card research-panel" style={{ marginTop: 34 }}>
        <div className="eyebrow">Bible Research</div>
        <h1 style={{ fontSize: "clamp(38px,6vw,64px)", marginBottom: 14 }}>본문 연구</h1>
        <p>연구 화면을 준비하고 있습니다.</p>
      </section>
    </main>
  );
}

function ResearchContent() {
  const searchParams = useSearchParams();
  const initialPassage = searchParams.get("passage") ?? "";
  const [passage, setPassage] = useState(initialPassage);
  const [result, setResult] = useState<ResearchResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function runResearch(value: string) {
    const trimmed = value.trim();
    if (!trimmed) {
      setError("연구할 성경 본문을 입력해 주세요.");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const response = await fetch("/api/research", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ passage: trimmed }),
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || "연구 중 오류가 발생했습니다.");
      }
      setResult(data.result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "알 수 없는 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  }

  function submit(event: FormEvent) {
    event.preventDefault();
    void runResearch(passage);
  }

  useEffect(() => {
    if (initialPassage) void runResearch(initialPassage);
    // URL에 포함된 최초 본문만 자동 실행합니다.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <main className="research-page">
      <a className="brand" href="/">
        <span className="brand-mark">M</span>
        <span>목회파트너</span>
      </a>

      <section className="hero-card research-panel" style={{ marginTop: 34 }}>
        <div className="eyebrow">Bible Research</div>
        <h1 style={{ fontSize: "clamp(38px,6vw,64px)", marginBottom: 14 }}>본문 연구</h1>
        <p>연구할 구절이나 장을 입력하면 배경, 문맥, 구조, 핵심 주제와 원어 관찰을 정리합니다.</p>
        <form className="research-input" onSubmit={submit}>
          <input
            value={passage}
            onChange={(event) => setPassage(event.target.value)}
            placeholder="예: 요한복음 15장 1–8절"
          />
          <button className="button button-primary" type="submit" disabled={loading}>
            {loading ? "연구 중…" : "연구 시작"}
          </button>
        </form>
        <div className="notice">AI 결과를 최종 해석이나 설교문으로 그대로 사용하지 말고 반드시 본문과 검증된 자료를 함께 확인하세요.</div>
        {error && <div className="notice error">{error}</div>}
      </section>

      {result && (
        <section className="result">
          <ResultSection title="연구 본문"><p>{result.passage}</p></ResultSection>
          <ResultSection title="핵심 요약"><p>{result.summary}</p></ResultSection>
          <ResultSection title="역사적·문화적 배경"><p>{result.historicalBackground}</p></ResultSection>
          <ResultSection title="저자와 원래 독자">
            <p><strong>저자:</strong> {result.author}</p>
            <p><strong>독자:</strong> {result.audience}</p>
          </ResultSection>
          <ResultSection title="문학적 문맥"><p>{result.literaryContext}</p></ResultSection>
          <ListSection title="본문 구조" items={result.structure} />
          <ListSection title="핵심 주제" items={result.keyThemes} />
          <ResultSection title="원어 관찰">
            {result.originalLanguage.map((item, index) => (
              <p key={`${item.word}-${index}`}>
                <strong>{item.word}</strong> ({item.transliteration}) — {item.meaning}
              </p>
            ))}
          </ResultSection>
          <ListSection title="오늘의 적용을 위한 질문" items={result.application} />
          <ListSection title="해석 시 주의사항" items={result.cautions} />
        </section>
      )}
    </main>
  );
}

function ResultSection({ title, children }: { title: string; children: ReactNode }) {
  return <article className="result-section"><h3>{title}</h3>{children}</article>;
}

function ListSection({ title, items }: { title: string; items: string[] }) {
  return (
    <ResultSection title={title}>
      <ul>{items.map((item, index) => <li key={index}>{item}</li>)}</ul>
    </ResultSection>
  );
}
