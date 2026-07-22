"use client";

import { useState } from "react";

const plans = [
  { name: "개인", price: "16,900원", desc: "혼자 사역을 준비하는 사역자를 위한 플랜", features: ["말씀 연구·기도·문서 지원", "AI 배경 이미지 월 40회", "프로젝트·클라우드 저장", "교단·신학 성향 설정"], recommended: true },
  { name: "교회", price: "39,900원", desc: "교역자와 사역팀이 함께 사용하는 플랜", features: ["개인 플랜의 모든 기능", "최대 5명 팀 사용", "AI 배경 이미지 월 120회", "공동 프로젝트와 자료 공유"] },
];

const trustItems = [
  ["AI 학습", "사용자가 입력한 사역 자료를 공개 학습 데이터로 판매하지 않습니다."],
  ["검토 원칙", "성경 연구와 사역 문서는 초안이며, 출처와 신학적 판단은 사용자가 최종 검토합니다."],
  ["이미지 안정성", "AI는 글자 없는 배경만 만들고 한글 문구는 편집기에서 별도로 배치합니다."],
  ["환불 안내", "정식 결제 연결 전 정책을 명확히 고지하며, 결제 후 정책은 구매 화면에서 다시 확인할 수 있습니다."],
];

export default function PricingPage() {
  const [started, setStarted] = useState(false);

  function startTrial(plan: string) {
    const trial = { plan, startedAt: new Date().toISOString(), endsAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() };
    localStorage.setItem("ministry-partner-trial", JSON.stringify(trial));
    setStarted(true);
  }

  return (
    <main className="pricing-shell">
      <header className="pricing-header"><a href="/" className="pricing-brand" aria-label="사역파트너 홈"><span aria-hidden="true">↔</span><strong>사역파트너</strong></a><a href="/">홈으로</a></header>
      <section className="pricing-hero"><p>7일 무료 체험</p><h1>한 주의 사역 흐름에서<br />충분히 사용해 보세요.</h1><span>말씀 연구, 예배 준비, 문서와 디자인을 실제 주간 업무에 적용한 뒤 필요한 플랜을 선택하세요.</span></section>
      <section className="pricing-grid">{plans.map((plan) => <article key={plan.name} className={plan.recommended ? "recommended" : ""}>{plan.recommended && <b className="pricing-badge">추천</b>}<h2>{plan.name}</h2><p>{plan.desc}</p><div className="pricing-price"><strong>{plan.price}</strong><small>/ 월</small></div><ul>{plan.features.map((feature) => <li key={feature}>✓ {feature}</li>)}</ul><button onClick={() => startTrial(plan.name)}>7일 무료로 시작</button></article>)}</section>
      {started && <div className="pricing-success"><strong>7일 무료 체험이 시작되었습니다.</strong><p>현재 기기에서 체험 상태가 유지됩니다.</p><a href="/">사역파트너 시작하기 →</a></div>}
      <section className="pricing-trust"><div className="pricing-trust-head"><p>WHY MINISTRY PARTNER</p><h2>일반 AI와 다른 점</h2><span>본문 하나에서 연구, 예배 준비, 문서와 콘텐츠까지 이어지는 사역 흐름을 제공합니다.</span></div><div className="pricing-trust-grid">{trustItems.map(([title,body])=><article key={title}><strong>{title}</strong><p>{body}</p></article>)}</div></section>
      <section className="pricing-example"><div><p>결과 예시</p><h2>무엇이 나오는지 먼저 확인하세요.</h2></div><div><article><strong>말씀 연구</strong><span>배경·문맥·원어·해석 견해·적용 질문·출처 구분</span></article><article><strong>찬양 플래너</strong><span>시작·경배·말씀 전·결단·축도 후 흐름과 추천 이유</span></article><article><strong>AI 디자인</strong><span>글자 없는 배경 생성 후 한글 제목을 직접 편집</span></article></div></section>
      <section className="pricing-note"><h2>가격을 이렇게 정한 이유</h2><p>개인 플랜은 이미지 생성 비용과 사역 자료 저장을 고려했고, 교회 플랜은 여러 명의 사용량과 공동 작업을 반영했습니다. 기능이 기대와 다르면 결제 전에 7일 동안 충분히 확인하세요.</p></section>
    </main>
  );
}
