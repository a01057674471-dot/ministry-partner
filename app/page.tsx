"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const quickTools = [
  ["설교 준비", "본문 연구부터 설교 작성까지", "/sermon", "📖"],
  ["본문 연구", "성경을 깊이 연구해요", "/research", "🔎"],
  ["대표기도", "상황에 맞는 기도문 작성", "/prayer", "🙏"],
  ["이미지 콘텐츠", "카드뉴스와 썸네일 기획", "/shorts", "🎨"],
  ["유튜브 → 쇼츠", "유튜브 영상을 쇼츠로 변환", "/youtube-shorts", "▶"],
  ["문서 작성", "기획서·보고서·교육안 작성", "/document", "📄"],
  ["회의 정리", "회의 내용을 깔끔하게 정리", "/meeting", "👥"],
  ["파일 분석", "업로드한 파일을 분석", "/file-analysis", "📁"],
];

const projects = [
  ["창세기 22장 설교", "설교", 65, "7분 전", "📖"],
  ["주일 대표기도", "기도", 80, "1시간 전", "🙏"],
  ["청년부 카드뉴스", "카드뉴스", 40, "3시간 전", "🎨"],
  ["유튜브 쇼츠", "쇼츠", 60, "어제", "▶"],
  ["주보 5월 3주", "주보", 70, "어제", "📄"],
];

const ministry = [
  ["수요예배 대표기도", "내일 마감", "D-1", 80, "⛪"],
  ["주일설교 준비", "3일 후 마감", "D-3", 65, "📖"],
  ["청년부 모임 준비", "5일 후 마감", "D-5", 40, "👥"],
  ["찬양팀 연습 자료", "6일 후 마감", "D-6", 20, "♫"],
];

const examples = ["창세기 22장으로 25분 설교 준비해줘", "이번 주 대표기도 작성해줘", "청년부 카드뉴스 만들어줘", "유튜브 링크로 쇼츠 만들어줘", "회의록 정리해줘"];

export default function Home() {
  const router = useRouter();
  const [request, setRequest] = useState("");
  const [name, setName] = useState("목사님");

  useEffect(() => {
    const saved = window.localStorage.getItem("ministry-partner-name");
    if (saved) setName(saved);
  }, []);

  function routeRequest(value = request) {
    const text = value.trim();
    if (!text) return;
    if (/설교|강해|말씀/.test(text)) return router.push(`/sermon?request=${encodeURIComponent(text)}`);
    if (/기도|축도/.test(text)) return router.push(`/prayer?request=${encodeURIComponent(text)}`);
    if (/유튜브|youtube|youtu\.be/i.test(text)) return router.push(`/youtube-shorts?request=${encodeURIComponent(text)}`);
    if (/쇼츠|릴스|카드뉴스|썸네일|이미지/.test(text)) return router.push(`/shorts?request=${encodeURIComponent(text)}`);
    if (/회의/.test(text)) return router.push(`/meeting?request=${encodeURIComponent(text)}`);
    if (/문서|기획서|보고서|교육안|주보/.test(text)) return router.push(`/document?request=${encodeURIComponent(text)}`);
    if (/성경|본문|\d+장|\d+절/.test(text)) return router.push(`/research?passage=${encodeURIComponent(text)}`);
    router.push(`/workspace?request=${encodeURIComponent(text)}`);
  }

  function submit(event: FormEvent) {
    event.preventDefault();
    routeRequest();
  }

  return (
    <main className="mp-dashboard">
      <aside className="mp-sidebar">
        <a className="mp-brand" href="/">
          <span className="mp-logo">✦</span>
          <span><strong>목회파트너</strong><small>Pastor&apos;s Partner</small></span>
        </a>
        <nav className="mp-nav">
          <a className="active" href="/"><span>⌂</span>홈</a>
          <a href="/workspace"><span>▣</span>프로젝트</a>
          <a href="/workspace"><span>▤</span>작업공간</a>
          <a href="/workspace"><span>♲</span>변환센터</a>
          <a href="/file-analysis"><span>▧</span>자료실</a>
          <a href="/roadmap"><span>⌂</span>내 교회</a>
          <a href="/workspace"><span>⚙</span>설정</a>
        </nav>
        <div className="mp-sidebar-bottom">
          <div className="mp-profile"><span className="mp-avatar">한</span><div><strong>{name}</strong><small>화성아가페교회</small></div><b>⌄</b></div>
          <a className="mp-help" href="mailto:support@example.com">?　도움말 & 문의</a>
        </div>
      </aside>

      <section className="mp-main">
        <div className="mp-content">
          <header className="mp-topline"><div /><div className="mp-top-icons">♧ <span className="mp-mini-avatar">한</span></div></header>
          <section className="mp-hero">
            <p>안녕하세요, {name} 👋</p>
            <h1>오늘 <em>어떤 사역</em>을 함께 준비할까요?</h1>
            <form className="mp-command" onSubmit={submit}>
              <textarea value={request} onChange={(e) => setRequest(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); routeRequest(); } }} placeholder="무엇을 도와드릴까요? 자유롭게 입력하세요." />
              <div className="mp-command-actions"><div><button type="button" aria-label="파일 첨부">⌕</button><button type="button" aria-label="이미지 첨부">▧</button><button type="button" aria-label="음성 입력">♩</button></div><button className="mp-submit" type="submit">파트너에게 요청하기　→</button></div>
            </form>
            <div className="mp-example-row"><b>예시</b>{examples.map((item) => <button key={item} onClick={() => setRequest(item)}>{item}</button>)}</div>
          </section>

          <section className="mp-section">
            <h2>빠른 시작</h2>
            <div className="mp-quick-grid">{quickTools.map(([title, desc, href, icon]) => <a href={href} key={title} className="mp-quick-card"><span>{icon}</span><strong>{title}</strong><small>{desc}</small></a>)}</div>
          </section>

          <section className="mp-section">
            <div className="mp-section-title"><h2>이번 주 사역</h2><div>‹　›</div></div>
            <div className="mp-ministry-grid">{ministry.map(([title, due, dday, progress, icon]) => <article key={String(title)}><div className="mp-ministry-head"><span>{icon}</span><div><strong>{title}</strong><small>{due}</small></div></div><b>{dday}</b><div className="mp-progress-label"><span>진행률 {progress}%</span><small>07</small></div><div className="mp-progress"><i style={{width: `${progress}%`}} /></div></article>)}</div>
          </section>

          <section className="mp-section mp-recent">
            <div className="mp-section-title"><h2>최근 프로젝트</h2><a href="/workspace">전체 보기　›</a></div>
            <div className="mp-project-cards">{projects.map(([title, type, progress, time, icon]) => <a href="/workspace" key={String(title)}><div className="mp-project-image"><span>{icon}</span><b>{type}</b></div><strong>{title}</strong><small>수정됨 {time}</small><div className="mp-card-footer"><div className="mp-progress"><i style={{width: `${progress}%`}} /></div><span>☆</span></div></a>)}</div>
          </section>
        </div>

        <aside className="mp-rightbar">
          <section className="mp-panel mp-project-list"><div className="mp-panel-head"><h2>프로젝트</h2><button>＋ 새 프로젝트</button></div>{projects.map(([title,,progress,time,icon]) => <a href="/workspace" key={String(title)}><span className="mp-list-icon">{icon}</span><div><strong>{title}</strong><div className="mp-inline-progress"><i style={{width: `${progress}%`}} /></div></div><small>{time}</small><b>☆　⋯</b></a>)}<a className="mp-all" href="/workspace">모든 프로젝트 보기　›</a></section>
          <section className="mp-panel mp-calendar"><div className="mp-panel-head"><h2>사역 캘린더</h2><a href="/workspace">전체 일정 보기　›</a></div><div className="mp-calendar-week"><span>월<br/>12</span><span>화<br/>13</span><span>수<br/>14</span><span className="today">목<br/>15</span><span>금<br/>16</span><span>토<br/>17</span><span>일<br/>18</span></div>{ministry.slice(0,3).map(([title,,dday]) => <div className="mp-calendar-item" key={String(title)}><i /> <strong>{title}</strong><small>{dday}</small></div>)}<button className="mp-calendar-add">▣　새 일정 추가</button></section>
          <section className="mp-tip"><b>✦　오늘의 팁</b><h3>설교에 적용할 예화가 필요하신가요?</h3><p>본문과 주제에 맞는 예화를 추천받아 보세요.</p><a href="/sermon">예화 추천받기　→</a></section>
        </aside>
      </section>
    </main>
  );
}
