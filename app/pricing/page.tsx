"use client";

import { useState } from "react";

const plans = [
  { name: "개인", price: "16,900원", desc: "혼자 사역을 준비하는 목회자", features: ["설교·기도·문서 생성", "이미지 생성 월 40회", "프로젝트·클라우드 저장", "변환센터 전체 이용"], recommended: true },
  { name: "교회", price: "39,900원", desc: "교역자와 사역팀이 함께 사용하는 플랜", features: ["개인 플랜의 모든 기능", "최대 5명 팀 사용", "이미지 생성 월 120회", "공동 프로젝트와 자료실"] },
];

export default function PricingPage() {
  const [started, setStarted] = useState(false);

  function startTrial(plan: string) {
    const trial = { plan, startedAt: new Date().toISOString(), endsAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString() };
    localStorage.setItem("ministry-partner-trial", JSON.stringify(trial));
    setStarted(true);
  }

  return (
    <main className="pricing-shell">
      <header className="pricing-header"><a href="/" className="pricing-brand"><span>ㅁ</span><strong>목회파트너</strong></a><a href="/">홈으로</a></header>
      <section className="pricing-hero">
        <p>3일 무료 체험</p>
        <h1>사역에 실제로 도움이 되는지<br/>충분히 사용해 보세요.</h1>
        <span>체험 기간에는 개인 플랜의 핵심 기능을 이용할 수 있습니다. 결제 기능은 다음 단계에서 연결됩니다.</span>
      </section>
      <section className="pricing-grid">
        {plans.map((plan) => <article key={plan.name} className={plan.recommended ? "recommended" : ""}>{plan.recommended && <b className="pricing-badge">추천</b>}<h2>{plan.name}</h2><p>{plan.desc}</p><div className="pricing-price"><strong>{plan.price}</strong><small>/ 월</small></div><ul>{plan.features.map((feature) => <li key={feature}>✓ {feature}</li>)}</ul><button onClick={() => startTrial(plan.name)}>3일 무료로 시작</button></article>)}
      </section>
      {started && <div className="pricing-success"><strong>무료 체험이 시작되었습니다.</strong><p>현재 기기에서 3일 동안 체험 상태가 유지됩니다.</p><a href="/">목회파트너 시작하기 →</a></div>}
      <section className="pricing-note"><h2>가격을 이렇게 정한 이유</h2><p>개인 플랜은 이미지 생성 비용을 감당하면서도 목회자가 부담 없이 시작할 수 있는 수준으로 잡았습니다. 교회 플랜은 여러 명이 함께 쓰는 사용량과 공동 작업을 고려했습니다.</p></section>
    </main>
  );
}
