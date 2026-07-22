"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "./lib/supabase-client";

const quickTools = [
  ["설교 준비", "본문부터 설교문까지", "/sermon", "책"],
  ["본문 연구", "문맥·원어·핵심 정리", "/research", "연구"],
  ["대표기도", "예배에 맞는 기도문", "/prayer", "기도"],
  ["찬양 플래너", "본문·주제에 맞는 찬양", "/worship", "찬양"],
  ["이미지 스튜디오", "포스터·주보·썸네일", "/image-content", "디자인"],
  ["숏폼 기획", "쇼츠·릴스 대본과 구성", "/youtube-shorts", "영상"],
  ["문서 작성", "기획서·보고서·교육안", "/document", "문서"],
  ["사역 로드맵", "3년·5년 비전과 실행계획", "/roadmap", "비전"],
];

const examples = ["창세기 22장으로 25분 설교 준비해줘", "고난 중 위로를 주는 찬양을 골라줘", "앞으로 5년의 선교 로드맵을 만들어줘", "청년부 수련회 포스터 만들어줘"];
const projects = [
  ["창세기 22장 설교", "설교", 65, "7분 전"],
  ["주일 대표기도", "기도", 80, "1시간 전"],
  ["청년부 카드뉴스", "디자인", 40, "3시간 전"],
  ["교회 소개 쇼츠", "영상", 60, "어제"],
  ["주보 5월 3주", "문서", 70, "어제"],
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
  const [focus, setFocus] = useState("전체");

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
    if (/찬양|복음성가|찬송가|콘티/.test(text)) return router.push(`/worship?request=${encodeURIComponent(text)}`);
    if (/로드맵|비전|3년|5년/.test(text)) return router.push(`/roadmap?request=${encodeURIComponent(text)}`);
    if (/설교|강해|말씀/.test(text)) return router.push(`/sermon?request=${encodeURIComponent(text)}`);
    if (/기도|축도/.test(text)) return router.push(`/prayer?request=${encodeURIComponent(text)}`);
    if (/유튜브|youtube|youtu\.be/i.test(text)) return router.push(`/youtube-shorts?request=${encodeURIComponent(text)}`);
    if (/카드뉴스|썸네일|이미지|인스타|포스터|배너|주보/.test(text)) return router.push(`/image-content?request=${encodeURIComponent(text)}`);
    if (/쇼츠|릴스/.test(text)) return router.push(`/shorts?request=${encodeURIComponent(text)}`);
    if (/회의/.test(text)) return router.push(`/meeting?request=${encodeURIComponent(text)}`);
    if (/문서|기획서|보고서|교육안/.test(text)) return router.push(`/document?request=${encodeURIComponent(text)}`);
    if (/성경|본문|\d+장|\d+절/.test(text)) return router.push(`/research?passage=${encodeURIComponent(text)}`);
    router.push(`/workspace?request=${encodeURIComponent(text)}`);
  }

  function submit(event: FormEvent) { event.preventDefault(); routeRequest(); }
  const visibleProjects = focus === "전체" ? projects : projects.filter((project) => project[1] === focus);

  return (
    <main className="partner-dashboard">
      <section className="partner-dashboard-main">
        <header className="partner-dashboard-greeting">
          <div><p>안녕하세요, {name}님</p><h1>오늘의 사역을 <em>더 가볍고 깊게</em> 준비하세요.</h1><span>설교, 기도, 찬양, 문서와 디자인을 한곳에서 이어갑니다.</span></div>
          <Link href="/projects" className="partner-new-project">＋ 새 프로젝트</Link>
        </header>

        <section className="partner-tip" style={{marginTop:24, padding:"22px 24px", borderRadius:16}}>
          <b>사역파트너의 약속</b>
          <h3 style={{fontSize:22, marginBottom:8}}>사역을 대신하지 않습니다. 사역에 더 집중하도록 돕습니다.</h3>
          <p style={{fontSize:13, margin:0}}>말씀과 기도, 성령님의 인도하심과 사역자의 분별이 언제나 중심입니다. 반복되는 준비와 정리를 덜어 하나님과 사람에게 더 집중하도록 돕습니다.</p>
        </section>

        <form className="partner-command" onSubmit={submit}>
          <div className="partner-command-label"><span>사역 도우미</span><small>무엇이든 편하게 요청하세요</small></div>
          <textarea value={request} onChange={(event) => setRequest(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); routeRequest(); } }} placeholder="예: 누가복음 15장으로 새가족 대상 20분 설교를 준비해줘" />
          <div className="partner-command-bottom"><span>Enter로 실행 · Shift+Enter로 줄바꿈</span><button type="submit">파트너에게 요청하기 <b>→</b></button></div>
        </form>

        <div className="partner-example-row"><b>추천 요청</b>{examples.map((item) => <button key={item} onClick={() => setRequest(item)}>{item}</button>)}</div>

        <section className="partner-section">
          <div className="partner-section-title"><div><small>QUICK START</small><h2>자주 쓰는 사역</h2></div><Link href="/workspace">전체 작업공간 보기 →</Link></div>
          <div className="partner-quick-grid">{quickTools.map(([title, desc, href, icon]) => <Link href={href} key={title}><span>{icon}</span><strong>{title}</strong><small>{desc}</small><b>→</b></Link>)}</div>
        </section>

        <section className="partner-section">
          <div className="partner-section-title"><div><small>THIS WEEK</small><h2>이번 주 사역</h2></div><Link href="/roadmap">사역 로드맵 보기 →</Link></div>
          <div className="partner-week-grid">{weekly.map(([title, due, dday, progress]) => <article key={String(title)}><header><span>{dday}</span><small>{due}</small></header><strong>{title}</strong><div className="partner-progress-copy"><span>진행률</span><b>{progress}%</b></div><i><u style={{ width: `${progress}%` }} /></i></article>)}</div>
        </section>

        <section className="partner-section">
          <div className="partner-section-title partner-project-title"><div><small>RECENT</small><h2>최근 프로젝트</h2></div><div className="partner-filter-row">{["전체", "설교", "기도", "디자인", "영상", "문서"].map((item) => <button key={item} className={focus === item ? "active" : ""} onClick={() => setFocus(item)}>{item}</button>)}</div></div>
          <div className="partner-recent-grid">{visibleProjects.map(([title, type, progress, time], index) => <Link href="/projects" key={String(title)}><div className={`partner-thumb thumb-${(index % 5) + 1}`}><span>{type}</span><b>{progress}%</b></div><strong>{title}</strong><small>마지막 수정 {time}</small><i><u style={{ width: `${progress}%` }} /></i></Link>)}</div>
        </section>
      </section>

      <aside className="partner-dashboard-rail">
        <section className="partner-rail-summary"><small>이번 주 진행률</small><strong>61%</strong><p>4개의 사역이 진행 중입니다.</p><i><u style={{ width: "61%" }} /></i><div><span><b>4</b> 진행 중</span><span><b>2</b> 완료</span><span><b>1</b> 대기</span></div></section>
        <section className="partner-rail-card"><header><h2>이어 할 프로젝트</h2><Link href="/projects">전체 보기</Link></header>{projects.slice(0, 4).map(([title, type, progress, time]) => <Link href="/projects" className="partner-project-row" key={String(title)}><span>{String(type).slice(0, 1)}</span><div><strong>{title}</strong><i><u style={{ width: `${progress}%` }} /></i></div><small>{time}</small></Link>)}</section>
        <section className="partner-rail-card partner-calendar"><header><h2>다가오는 일정</h2><Link href="/roadmap">로드맵</Link></header>{weekly.slice(0, 3).map(([title, due, dday]) => <div className="partner-calendar-row" key={String(title)}><span>{dday}</span><div><strong>{title}</strong><small>{due}</small></div></div>)}<Link className="partner-rail-more" href="/roadmap">＋ 사역 계획 추가하기</Link></section>
        <section className="partner-tip"><b>오늘의 사역 팁</b><h3>설교 주제에 맞는 찬양이 고민되나요?</h3><p>본문과 예배 흐름을 입력하면 회중과 순서에 맞는 찬양을 추천합니다.</p><Link href="/worship">찬양 플래너 열기 →</Link></section>
      </aside>
    </main>
  );
}
