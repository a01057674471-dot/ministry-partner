"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import "./sermon-studio.css";

const contentTypes = [
  ["📌", "핵심 요약"],
  ["📖", "QT 묵상"],
  ["💬", "소그룹 나눔"],
  ["🖼️", "카드뉴스"],
  ["📱", "SNS 게시글"],
  ["🎬", "쇼츠 대본"],
  ["🙏", "기도문"],
  ["🧒", "청소년 버전"],
  ["📰", "주보 요약"],
  ["✨", "제목·문구"],
];

const sampleSermon = `제목: 흔들리는 시대에 다시 왕을 모셔라
본문: 사사기 21장 25절

이스라엘에는 왕이 없었고 사람마다 자기 소견에 옳은 대로 행했습니다. 문제는 단지 지도자가 없었다는 데 있지 않습니다. 하나님의 통치를 삶의 중심에서 밀어냈다는 데 있습니다.

오늘 우리도 기준이 흔들리는 시대를 살아갑니다. 믿음은 내 생각을 하나님께 승인받는 일이 아니라, 하나님의 말씀 앞에서 내 생각을 다시 정렬하는 일입니다. 삶의 중심에 하나님을 다시 모실 때 혼란 속에서도 방향을 찾을 수 있습니다.

첫째, 내 판단이 언제나 옳다는 착각을 내려놓아야 합니다. 둘째, 말씀을 선택적으로 듣지 말아야 합니다. 셋째, 작은 순종부터 다시 시작해야 합니다.

이번 주에는 결정 하나를 앞두고 먼저 기도하고 말씀의 기준을 확인해 봅시다.`;

export default function StudioPage() {
  const [title, setTitle] = useState("");
  const [sermon, setSermon] = useState("");
  const [result, setResult] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  async function generate(event: FormEvent) {
    event.preventDefault();
    const text = sermon.trim();
    if (text.length < 100) {
      setError("설교 원고를 100자 이상 입력해 주세요.");
      return;
    }

    setLoading(true);
    setError("");
    setResult("");
    setCopied(false);

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tool: "sermoncontent",
          topic: `${title.trim() ? `설교 제목: ${title.trim()}\n\n` : ""}${text}`,
        }),
      });
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.error || "콘텐츠를 만들지 못했습니다.");
      setResult(data.result);
      window.setTimeout(() => document.getElementById("sermon-result")?.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
    } catch (err) {
      setError(err instanceof Error ? err.message : "오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  }

  async function copyResult() {
    if (!result) return;
    await navigator.clipboard.writeText(result);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  function loadSample() {
    setTitle("흔들리는 시대에 다시 왕을 모셔라");
    setSermon(sampleSermon);
    setError("");
    setResult("");
  }

  return (
    <main className="sermon-studio">
      <div className="sermon-studio-inner">
        <header className="sermon-studio-header">
          <Link href="/" className="sermon-studio-brand"><span>사</span><span>사역파트너</span></Link>
          <Link href="/" className="sermon-studio-back">홈으로 돌아가기 →</Link>
        </header>

        <section className="sermon-hero">
          <small>SERMON TO CONTENT</small>
          <h1>설교 한 편이<br />일주일 사역 콘텐츠가 됩니다.</h1>
          <p>설교 원고를 입력하면 핵심 메시지를 유지한 채 QT, 소그룹 나눔, 카드뉴스, SNS 글, 쇼츠 대본 등 10가지 자료로 정리합니다.</p>
          <div className="sermon-flow" aria-label="설교 콘텐츠 생성 과정">
            <div className="sermon-flow-box"><strong>① 설교 원고 입력</strong><span>작성한 설교를 그대로 붙여 넣으세요.</span></div>
            <div className="sermon-flow-arrow">→</div>
            <div className="sermon-flow-box"><strong>② 콘텐츠 10종 생성</strong><span>각 사역 현장에 맞게 검토하고 사용하세요.</span></div>
          </div>
        </section>

        <section className="sermon-generator">
          <div className="sermon-generator-head">
            <h2>설교 원고 입력</h2>
            <span>최소 100자 · 최대 50,000자</span>
          </div>
          <form onSubmit={generate}>
            <input className="sermon-title-input" value={title} onChange={(event) => setTitle(event.target.value)} placeholder="설교 제목 (선택)" aria-label="설교 제목" />
            <textarea className="sermon-textarea" value={sermon} onChange={(event) => setSermon(event.target.value)} placeholder="설교 원고를 여기에 붙여 넣어 주세요. 본문, 핵심 메시지, 대지와 적용이 포함되어 있으면 결과가 더 정확해집니다." aria-label="설교 원고" maxLength={50000} />
            <div className="sermon-actions">
              <small>{sermon.length.toLocaleString("ko-KR")} / 50,000자</small>
              <div>
                <button type="button" className="sermon-button secondary" onClick={loadSample} disabled={loading}>샘플로 체험</button>
                <button type="submit" className="sermon-button primary" disabled={loading}>{loading ? "콘텐츠를 만드는 중…" : "10가지 콘텐츠 만들기"}</button>
              </div>
            </div>
          </form>

          <div className="sermon-content-grid">
            {contentTypes.map(([icon, name]) => <div className="sermon-content-chip" key={name}><span>{icon}</span><b>{name}</b></div>)}
          </div>
          {error && <div className="sermon-notice" role="alert">{error}</div>}
          <p className="sermon-disclaimer">생성된 자료는 초안입니다. 성경 본문의 문맥, 교단의 신학적 입장, 실제 공동체 상황을 사역자가 반드시 검토해 주세요.</p>
        </section>

        {result && (
          <section className="sermon-result" id="sermon-result">
            <div className="sermon-result-head">
              <h2>콘텐츠 생성 완료</h2>
              <button type="button" onClick={copyResult}>{copied ? "복사되었습니다" : "전체 결과 복사"}</button>
            </div>
            <pre>{result}</pre>
          </section>
        )}
      </div>
    </main>
  );
}
