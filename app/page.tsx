"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "./lib/supabase-client";

const quickTools = [
  ["설교 준비", "본문 연구부터 설교문까지", "/sermon", "📖"],
  ["대표기도", "예배 상황에 맞는 기도문", "/prayer", "🙏"],
  ["이미지 만들기", "포스터·카드뉴스·썸네일", "/image-content", "🎨"],
  ["본문 연구", "성경의 문맥과 핵심 연구", "/research", "🔎"],
  ["문서 작성", "기획서·보고서·교육안", "/document", "📄"],
  ["우리 교회", "비전과 사역 계획 정리", "/roadmap", "◇"],
];

const examples = ["창세기 22장으로 25분 설교 준비해줘", "이번 주 대표기도 작성해줘", "청년부 수련회 포스터 이미지 만들어줘"];

function displayName(value: string) {
  const cleaned = value.trim().replace(/님+$/g, "");
  return cleaned || "목사";
}

export default function Home() {
  const router = useRouter();
  const [request, setRequest] = useState("");
  const [name, setName] = useState("목사");

  useEffect(() => {
    const saved = window.localStorage.getItem("ministry-partner-name");
    if (saved) setName(displayName(saved));
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;
    supabase.auth.getUser().then(({ data }) => {
      const userName = data.user?.user_metadata?.full_name || data.user?.user_metadata?.name;
      if (userName) {
        const cleanName = displayName(userName);
        setName(cleanName);
        window.localStorage.setItem("ministry-partner-name", cleanName);
      }
    });
  }, []);

  function routeRequest(value = request) {
    const text = value.trim();
    if (!text) return;
    if (/설교|강해|말씀/.test(text)) return router.push(`/sermon?request=${encodeURIComponent(text)}`);
    if (/기도|축도/.test(text)) return router.push(`/prayer?request=${encodeURIComponent(text)}`);
    if (/유튜브|youtube|youtu\.be/i.test(text)) return router.push(`/youtube-shorts?request=${encodeURIComponent(text)}`);
    if (/카드뉴스|썸네일|이미지|인스타|포스터|배너/.test(text)) return router.push(`/image-content?request=${encodeURIComponent(text)}`);
    if (/쇼츠|릴스/.test(text)) return router.push(`/shorts?request=${encodeURIComponent(text)}`);
    if (/회의/.test(text)) return router.push(`/meeting?request=${encodeURIComponent(text)}`);
    if (/문서|기획서|보고서|교육안|주보/.test(text)) return router.push(`/document?request=${encodeURIComponent(text)}`);
    if (/성경|본문|\d+장|\d+절/.test(text)) return router.push(`/research?passage=${encodeURIComponent(text)}`);
    router.push(`/workspace?request=${encodeURIComponent(text)}`);
  }

  function submit(event: FormEvent) { event.preventDefault(); routeRequest(); }

  return (
    <main className="home-v2-page">
      <header className="home-v2-top">
        <div><span>오늘의 사역 준비</span><strong>{name}님, 반갑습니다.</strong></div>
        <div className="home-v2-top-actions"><a href="/pricing">3일 무료 체험</a><a className="home-v2-avatar" href="/account">{name.slice(0,1)}</a></div>
      </header>

      <section className="home-v2-hero">
        <p>목회 준비를 더 단순하게</p>
        <h1>오늘 무엇을<br/><em>함께 준비할까요?</em></h1>
        <form className="home-v2-command" onSubmit={submit}>
          <textarea value={request} onChange={(e) => setRequest(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); routeRequest(); } }} placeholder="설교, 기도문, 이미지, 문서 등 필요한 내용을 편하게 적어 주세요." />
          <div><span>입력한 내용에 맞는 작업공간으로 바로 연결합니다.</span><button type="submit">요청하기 →</button></div>
        </form>
        <div className="home-v2-examples">{examples.map((item) => <button key={item} onClick={() => setRequest(item)}>{item}</button>)}</div>
      </section>

      <section className="home-v2-tools">
        <div className="home-v2-section-head"><div><span>QUICK START</span><h2>자주 쓰는 기능</h2></div><a href="/workspace">전체 작업공간 보기 →</a></div>
        <div className="home-v2-tool-grid">{quickTools.map(([title, desc, href, icon]) => <a href={href} key={title}><span>{icon}</span><div><strong>{title}</strong><small>{desc}</small></div><b>→</b></a>)}</div>
      </section>
    </main>
  );
}