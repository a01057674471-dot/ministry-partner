"use client";

import { useEffect } from "react";

export default function ResearchError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error("Research page error", error);
  }, [error]);

  return (
    <main className="research-page">
      <a className="brand" href="/"><span className="brand-mark">M</span><span>목회파트너</span></a>
      <section className="hero-card research-panel" style={{ marginTop: 34 }}>
        <div className="eyebrow">Research Recovery</div>
        <h1 style={{ fontSize: "clamp(36px,6vw,58px)", marginBottom: 14 }}>본문 연구 화면을 불러오지 못했습니다</h1>
        <p>입력한 내용은 브라우저에 남아 있을 수 있습니다. 다시 시도하거나 홈으로 이동해 주세요.</p>
        <div className="editor-actions">
          <button className="button button-primary" type="button" onClick={reset}>다시 시도</button>
          <a className="button button-secondary" href="/">홈으로</a>
        </div>
      </section>
    </main>
  );
}
