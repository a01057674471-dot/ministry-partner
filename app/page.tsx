"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "./lib/supabase-client";

const quickTools = [
  ["설교 준비", "본문 연구부터 설교 작성까지", "/sermon", "📖"],
  ["본문 연구", "성경을 깊이 연구해요", "/research", "🔎"],
  ["대표기도", "상황에 맞는 기도문 작성", "/prayer", "🙏"],
  ["이미지 만들기", "기획부터 실제 이미지 생성까지", "/image-content", "🎨"],
  ["유튜브 → 쇼츠", "유튜브 영상을 쇼츠로 변환", "/youtube-shorts", "▶"],
  ["문서 작성", "기획서·보고서·교육안 작성", "/document", "📄"],
  ["회의 정리", "회의 내용을 깔끔하게 정리", "/meeting", "👥"],
  ["자료실", "예화·기도·프롬프트 검색", "/library", "📚"],
];

const projects = [
  ["창세기 22장 설교", "설교", 65, "7분 전", "📖"],
  ["주일 대표기도", "기도", 80, "1시간 전", "🙏"],
  ["청년부 카드뉴스", "카드뉴스", 40, "3시간 전", "🎨"],
];

const ministry = [
  ["수요예배 대표기도", "내일 마감", "D-1", 80, "⛪"],
  ["주일설교 준비", "3일 후 마감", "D-3", 65, "📖"],
  ["청년부 모임 준비", "5일 후 마감", "D-5", 40, "👥"],
];

const examples = ["창세기 22장으로 25분 설교 준비해줘", "이번 주 대표기도 작성해줘", "청년부 수련회 포스터 이미지 만들어줘"];

export default function Home() {
  const router = useRouter();
  const [request, setRequest] = useState("");
  const [name, setName] = useState("목사님");

  useEffect(() => {
    const saved = window.localStorage.getItem("ministry-partner-name");
    if (saved) setName(saved);
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;
    supabase.auth.getUser().then(({ data }) => {
      const userName = data.user?.user_metadata?.full_name || data.user?.user_metadata?.name;
      if (userName) {
        setName(userName);
        window.localStorage.setItem("ministry-partner-name", userName);
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
    <main className="mp-dashboard">
      <aside className="mp-sidebar">
        <a className="mp-brand" href="/"><span className="mp-logo">ㅁ</span><span><strong>목회파트너</strong><small>사역을 함께 준비하는 공간</small></span></a>
        <nav className="mp-nav">
          <a className="active" href="/"><span>⌂</span>홈</a><a href="/projects"><span>▣</span>프로젝트</a><a href="/workspace"><span>▤</span>작업공간</a><a href="/transform"><span>♲</span>변환센터</a><a href="/library"><span>▧</span>자료실</a><a href="/roadmap"><span>⌂</span>내 교회</a><a href="/pricing"><span>₩</span>요금제</a><a href="/account"><span>⚙</span>계정</a>
        </nav>
        <div className="mp-sidebar-bottom"><a className="mp-profile" href="/account"><span className="mp-avatar">{name.slice(0,1)}</span><div><strong>{name}</strong><small>나의 작업공간</small></div><b>⌄</b></a></div>
      </aside>

      <section className="mp-main">
        <div className="mp-content">
          <header className="mp-topline"><div /><div className="mp-top-icons"><a href="/pricing">3일 무료 체험</a><a href="/account" className="mp-mini-avatar">{name.slice(0,1)}</a></div></header>
          <section className="mp-hero">
            <p>{name}님, 환영합니다.</p><h1>오늘 무엇을<br/><em>함께 준비할까요?</em></h1>
            <form className="mp-command" onSubmit={submit}><textarea value={request} onChange={(e) => setRequest(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); routeRequest(); } }} placeholder="설교, 기도문, 이미지, 문서 등 필요한 내용을 적어 주세요." /><div className="mp-command-actions"><span>요청을 분석해 알맞은 작업공간으로 연결합니다.</span><button className="mp-submit" type="submit">요청하기　→</button></div></form>
            <div className="mp-example-row"><b>예시</b>{examples.map((item) => <button key={item} onClick={() => setRequest(item)}>{item}</button>)}</div>
          </section>

          <section className="mp-section"><div className="mp-section-title"><h2>바로 시작하기</h2><a href="/image-content">이미지 바로 만들기　›</a></div><div className="mp-quick-grid">{quickTools.map(([title, desc, href, icon]) => <a href={href} key={title} className="mp-quick-card"><span>{icon}</span><strong>{title}</strong><small>{desc}</small></a>)}</div></section>
          <section className="mp-section"><div className="mp-section-title"><h2>이번 주 사역</h2></div><div className="mp-ministry-grid">{ministry.map(([title, due, dday, progress, icon]) => <article key={String(title)}><div className="mp-ministry-head"><span>{icon}</span><div><strong>{title}</strong><small>{due}</small></div></div><b>{dday}</b><div className="mp-progress-label"><span>진행률 {progress}%</span></div><div className="mp-progress"><i style={{width: `${progress}%`}} /></div></article>)}</div></section>
          <section className="mp-section mp-recent"><div className="mp-section-title"><h2>최근 프로젝트</h2><a href="/projects">전체 보기　›</a></div><div className="mp-project-cards">{projects.map(([title, type, progress, time, icon]) => <a href="/projects" key={String(title)}><div className="mp-project-image"><span>{icon}</span><b>{type}</b></div><strong>{title}</strong><small>수정됨 {time}</small><div className="mp-card-footer"><div className="mp-progress"><i style={{width: `${progress}%`}} /></div><span>☆</span></div></a>)}</div></section>
        </div>

        <aside className="mp-rightbar">
          <section className="mp-panel mp-project-list"><div className="mp-panel-head"><h2>프로젝트</h2><a href="/projects">＋ 새 프로젝트</a></div>{projects.map(([title,,progress,time,icon]) => <a href="/projects" key={String(title)}><span className="mp-list-icon">{icon}</span><div><strong>{title}</strong><div className="mp-inline-progress"><i style={{width: `${progress}%`}} /></div></div><small>{time}</small></a>)}</section>
          <section className="mp-tip"><b>새 기능</b><h3>이제 이미지도 바로 만들 수 있어요.</h3><p>기획안 작성부터 실제 이미지 생성과 저장까지 한 화면에서 진행하세요.</p><a href="/image-content">이미지 스튜디오 열기　→</a></section>
          <section className="mp-tip"><b>3일 무료 체험</b><h3>필요한 만큼 충분히 사용해 보세요.</h3><p>체험 후 개인용 월 16,900원부터 이용할 수 있습니다.</p><a href="/pricing">요금제 보기　→</a></section>
        </aside>
      </section>
    </main>
  );
}
