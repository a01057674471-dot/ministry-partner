"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "./lib/supabase-client";

const quickTools = [
  ["설교 준비", "본문 연구부터 설교문까지", "/sermon", "📖"],
  ["본문 연구", "성경의 문맥과 핵심 연구", "/research", "🔎"],
  ["대표기도", "예배 상황에 맞는 기도문", "/prayer", "🙏"],
  ["이미지 콘텐츠", "카드뉴스·포스터·썸네일", "/image-content", "🎨"],
  ["유튜브 쇼츠", "긴 영상을 숏폼 기획으로", "/youtube-shorts", "▶"],
  ["문서 작성", "기획서·보고서·교육안", "/document", "📄"],
  ["회의 정리", "결정사항과 할 일 정리", "/meeting", "👥"],
  ["파일 분석", "자료를 올리고 핵심 정리", "/file-analysis", "📁"],
];

const examples = ["창세기 22장으로 25분 설교 준비해줘", "이번 주 대표기도 작성해줘", "청년부 카드뉴스 만들어줘", "회의록 정리해줘"];
const projects = [
  ["창세기 22장 설교", "설교", 65, "7분 전"],
  ["주일 대표기도", "기도", 80, "1시간 전"],
  ["청년부 카드뉴스", "카드뉴스", 40, "3시간 전"],
  ["유튜브 쇼츠", "쇼츠", 60, "어제"],
  ["주보 5월 3주", "주보", 70, "어제"],
];
const weekly = [
  ["수요예배 대표기도", "내일 마감", "D-1", 80],
  ["주일설교 준비", "3일 후 마감", "D-3", 65],
  ["청년부 모임 준비", "5일 후 마감", "D-5", 40],
  ["찬양팀 연습 자료", "6일 후 마감", "D-6", 20],
];

function displayName(value: string) {
  const cleaned = value.trim().replace(/님+$/g, "");
  return cleaned || "사역자";
}

export default function Home() {
  const router = useRouter();
  const [request, setRequest] = useState("");
  const [name, setName] = useState("사역자");

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
    <main className="partner-dashboard">
      <section className="partner-dashboard-main">
        <header className="partner-dashboard-greeting">
          <p>안녕하세요, {name}님 👋</p>
          <h1>오늘 <em>어떤 사역</em>을 함께 준비할까요?</h1>
        </header>

        <form className="partner-command" onSubmit={submit}>
          <textarea value={request} onChange={(event) => setRequest(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); routeRequest(); } }} placeholder="무엇을 도와드릴까요? 자유롭게 입력하세요." />
          <div className="partner-command-bottom"><span>✦　📎　▧　🎙</span><button type="submit">파트너에게 요청하기　→</button></div>
        </form>

        <div className="partner-example-row"><b>예시</b>{examples.map((item) => <button key={item} onClick={() => setRequest(item)}>{item}</button>)}</div>

        <section className="partner-section">
          <div className="partner-section-title"><h2>빠른 시작</h2></div>
          <div className="partner-quick-grid">{quickTools.map(([title, desc, href, icon]) => <Link href={href} key={title}><span>{icon}</span><strong>{title}</strong><small>{desc}</small></Link>)}</div>
        </section>

        <section className="partner-section">
          <div className="partner-section-title"><h2>이번 주 사역</h2><div>‹　›</div></div>
          <div className="partner-week-grid">{weekly.map(([title, due, dday, progress]) => <article key={String(title)}><div><span>◇</span><div><strong>{title}</strong><small>{due}</small></div><b>{dday}</b></div><p>진행률 {progress}%</p><i><u style={{ width: `${progress}%` }} /></i></article>)}</div>
        </section>

        <section className="partner-section">
          <div className="partner-section-title"><h2>최근 프로젝트</h2><Link href="/projects">전체 보기　›</Link></div>
          <div className="partner-recent-grid">{projects.map(([title, type, progress, time], index) => <Link href="/projects" key={String(title)}><div className={`partner-thumb thumb-${index + 1}`}><span>{type}</span></div><strong>{title}</strong><small>수정됨 {time}</small><i><u style={{ width: `${progress}%` }} /></i></Link>)}</div>
        </section>
      </section>

      <aside className="partner-dashboard-rail">
        <section className="partner-rail-card"><header><h2>프로젝트</h2><Link href="/projects">＋ 새 프로젝트</Link></header>{projects.slice(0, 5).map(([title, type, progress, time]) => <Link href="/projects" className="partner-project-row" key={String(title)}><span>{type === "설교" ? "📖" : type === "기도" ? "🙏" : type === "쇼츠" ? "▶" : "▧"}</span><div><strong>{title}</strong><i><u style={{ width: `${progress}%` }} /></i></div><small>{time}</small></Link>)}<Link className="partner-rail-more" href="/projects">모든 프로젝트 보기　›</Link></section>

        <section className="partner-rail-card partner-calendar"><header><h2>사역 캘린더</h2><Link href="/roadmap">전체 일정 보기　›</Link></header><div className="partner-calendar-days"><span>월<br/>12</span><span>화<br/>13</span><span>수<br/>14</span><b>목<br/>15</b><span>금<br/>16</span><span>토<br/>17</span><span>일<br/>18</span></div>{weekly.slice(0, 3).map(([title,,dday]) => <div className="partner-calendar-row" key={String(title)}><span>●</span><strong>{title}</strong><small>{dday}</small></div>)}<Link className="partner-rail-more" href="/roadmap">＋ 새 일정 추가</Link></section>

        <section className="partner-tip"><b>✦ 오늘의 팁</b><h3>설교에 적용할 예화가 필요하신가요?</h3><p>본문과 주제에 맞는 예화를 추천받아 보세요.</p><Link href="/library">예화 추천받기　→</Link></section>
      </aside>
    </main>
  );
}
