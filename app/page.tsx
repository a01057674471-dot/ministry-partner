"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "./lib/supabase-client";

const examples = [
  "창세기 22장의 배경과 문맥을 연구해줘",
  "고난 중 위로를 주는 찬양을 골라줘",
  "앞으로 5년의 선교 로드맵을 만들어줘",
  "청년부 수련회 포스터 배경을 만들어줘",
];

function displayName(value: string) {
  const cleaned = value.trim().replace(/님+$/g, "");
  return cleaned || "사역자";
}

export default function Home() {
  const router = useRouter();
  const [request, setRequest] = useState("");
  const [name, setName] = useState("사역자");
  const [recent, setRecent] = useState<Array<{title:string;updatedAt:string}>>([]);

  useEffect(() => {
    const saved = window.localStorage.getItem("ministry-partner-name");
    if (saved) setName(displayName(saved));
    try {
      const raw = localStorage.getItem("ministry-partner-projects-v3");
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) setRecent(parsed.slice(0, 4).map((item) => ({ title: String(item.title || "이름 없는 작업"), updatedAt: String(item.updatedAt || "") })));
      }
    } catch { setRecent([]); }
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;
    supabase.auth.getUser().then(({ data }) => {
      const userName = data.user?.user_metadata?.full_name || data.user?.user_metadata?.name;
      if (!userName) return;
      const cleanName = displayName(userName);
      setName(cleanName);
      window.localStorage.setItem("ministry-partner-name", cleanName);
    });
  }, []);

  function routeRequest(value = request) {
    const text = value.trim();
    if (!text) return;
    if (/찬양|복음성가|찬송가|콘티/.test(text)) return router.push(`/worship?request=${encodeURIComponent(text)}`);
    if (/로드맵|비전|3년|5년|10년/.test(text)) return router.push(`/roadmap?request=${encodeURIComponent(text)}`);
    if (/성경|본문|배경|문맥|원어|주해|\d+장|\d+절/.test(text)) return router.push(`/research?passage=${encodeURIComponent(text)}`);
    if (/설교|강해/.test(text)) return router.push(`/sermon?request=${encodeURIComponent(text)}`);
    if (/기도|축도/.test(text)) return router.push(`/prayer?request=${encodeURIComponent(text)}`);
    if (/카드뉴스|썸네일|이미지|인스타|포스터|배너|주보/.test(text)) return router.push(`/image-content?request=${encodeURIComponent(text)}`);
    router.push(`/workspace?request=${encodeURIComponent(text)}`);
  }

  function submit(event: FormEvent) { event.preventDefault(); routeRequest(); }

  return (
    <main className="partner-dashboard">
      <section className="partner-dashboard-main">
        <header className="partner-home-brand"><Link href="/" aria-label="사역파트너 홈" className="partner-home-logo"><span className="partner-brand-symbol" aria-hidden="true"><i /><i /><i /></span><div><strong>사역파트너</strong><small>MINISTRY PARTNER</small></div></Link><p>안녕하세요, {name}님</p></header>
        <section className="partner-tip partner-principle" style={{ marginTop: 22, padding: "22px 24px", borderRadius: 16 }}><b>사역파트너의 원칙</b><h3 style={{ fontSize: 22, marginBottom: 8 }}>사역을 대신하지 않습니다. 사역에 더 집중하도록 돕습니다.</h3><p style={{ fontSize: 13, margin: 0 }}>말씀과 기도, 사역자의 신학적 검토와 분별을 중심에 둡니다.</p></section>
        <form className="partner-command" onSubmit={submit}><div className="partner-command-label"><span>오늘 무엇을 준비하시나요?</span><small>한 문장으로 편하게 적어주세요</small></div><textarea value={request} onChange={(event) => setRequest(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); routeRequest(); } }} placeholder="예: 누가복음 15장의 배경과 문맥을 연구해줘" /><div className="partner-command-bottom"><span>Enter로 실행 · Shift+Enter로 줄바꿈</span><button type="submit">준비 시작하기 <b>→</b></button></div></form>
        <div className="partner-example-row"><b>추천 요청</b>{examples.map((item) => <button key={item} type="button" onClick={() => setRequest(item)}>{item}</button>)}</div>
        <section className="partner-section"><div className="partner-section-title"><div><small>CORE WORKFLOW</small><h2>핵심 기능</h2></div></div><div className="partner-quick-grid"><Link href="/research"><span>말씀</span><strong>말씀 연구</strong><small>배경·문맥·원어·견해와 출처 확인</small><b>→</b></Link><Link href="/workspace"><span>작업</span><strong>사역 작업</strong><small>기도·문서·설교 개요를 한곳에서</small><b>→</b></Link><Link href="/worship"><span>찬양</span><strong>찬양 플래너</strong><small>본문과 예배 흐름에 맞는 추천</small><b>→</b></Link><Link href="/image-content"><span>디자인</span><strong>AI 디자인</strong><small>배경 생성과 한글 편집을 분리</small><b>→</b></Link><Link href="/roadmap"><span>비전</span><strong>사역 로드맵</strong><small>필수 질문부터 단계적으로 작성</small><b>→</b></Link></div></section>
        <section className="partner-section"><div className="partner-section-title"><div><small>RECENT</small><h2>내 최근 작업</h2></div></div>{recent.length ? <div className="partner-recent-simple">{recent.map((item)=><Link href="/workspace" key={item.title}><strong>{item.title}</strong><small>{item.updatedAt ? new Date(item.updatedAt).toLocaleString("ko-KR") : "저장된 작업"}</small></Link>)}</div> : <div className="partner-empty-state"><strong>아직 저장된 작업이 없습니다.</strong><p>첫 작업을 시작하면 이곳에 실제 작업만 표시됩니다.</p><Link href="/workspace">작업 시작하기 →</Link></div>}</section>
      </section>
    </main>
  );
}
