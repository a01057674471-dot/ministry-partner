"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "./lib/supabase-client";

const examples = [
  "창세기 22장으로 25분 설교 준비해줘",
  "고난 중 위로를 주는 찬양을 골라줘",
  "앞으로 5년의 선교 로드맵을 만들어줘",
  "청년부 수련회 포스터 만들어줘",
];

const projects = [
  ["창세기 22장 설교", "설교", 65, "7분 전"],
  ["주일 대표기도", "기도", 80, "1시간 전"],
  ["청년부 카드뉴스", "디자인", 40, "3시간 전"],
  ["교회 소개 쇼츠", "영상", 60, "어제"],
  ["주보 5월 3주", "문서", 70, "어제"],
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
    if (/설교|강해|말씀/.test(text)) return router.push(`/sermon?request=${encodeURIComponent(text)}`);
    if (/기도|축도/.test(text)) return router.push(`/prayer?request=${encodeURIComponent(text)}`);
    if (/유튜브|youtube|youtu\.be|쇼츠|릴스/i.test(text)) return router.push(`/youtube-shorts?request=${encodeURIComponent(text)}`);
    if (/카드뉴스|썸네일|이미지|인스타|포스터|배너|주보/.test(text)) return router.push(`/image-content?request=${encodeURIComponent(text)}`);
    if (/회의/.test(text)) return router.push(`/meeting?request=${encodeURIComponent(text)}`);
    if (/문서|기획서|보고서|교육안/.test(text)) return router.push(`/document?request=${encodeURIComponent(text)}`);
    if (/성경|본문|\d+장|\d+절/.test(text)) return router.push(`/research?passage=${encodeURIComponent(text)}`);
    router.push(`/workspace?request=${encodeURIComponent(text)}`);
  }

  function submit(event: FormEvent) {
    event.preventDefault();
    routeRequest();
  }

  const visibleProjects = focus === "전체" ? projects : projects.filter((project) => project[1] === focus);

  return (
    <main className="partner-dashboard">
      <section className="partner-dashboard-main">
        <header className="partner-home-brand">
          <Link href="/" aria-label="사역파트너 홈" className="partner-home-logo">
            <span aria-hidden="true">✦</span>
            <div><strong>사역파트너</strong><small>MINISTRY PARTNER</small></div>
          </Link>
          <p>안녕하세요, {name}님</p>
        </header>

        <section className="partner-tip partner-principle" style={{ marginTop: 22, padding: "22px 24px", borderRadius: 16 }}>
          <b>사역파트너의 원칙</b>
          <h3 style={{ fontSize: 22, marginBottom: 8 }}>사역을 대신하지 않습니다. 사역에 더 집중하도록 돕습니다.</h3>
          <p style={{ fontSize: 13, margin: 0 }}>사역의 중심은 하나님입니다. 말씀과 기도, 그리고 사역자의 분별을 대신하지 않습니다.</p>
        </section>

        <form className="partner-command" onSubmit={submit}>
          <div className="partner-command-label"><span>오늘 무엇을 준비하시나요?</span><small>한 문장으로 편하게 적어주세요</small></div>
          <textarea value={request} onChange={(event) => setRequest(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); routeRequest(); } }} placeholder="예: 누가복음 15장으로 새가족 대상 20분 설교를 준비해줘" />
          <div className="partner-command-bottom"><span>Enter로 실행 · Shift+Enter로 줄바꿈</span><button type="submit">준비 시작하기 <b>→</b></button></div>
        </form>

        <div className="partner-example-row"><b>추천 요청</b>{examples.map((item) => <button key={item} type="button" onClick={() => setRequest(item)}>{item}</button>)}</div>

        <section className="partner-section">
          <div className="partner-section-title"><div><small>WORK</small><h2>사역 작업</h2></div><Link href="/workspace">전체 작업 보기 →</Link></div>
          <div className="partner-quick-grid">
            <Link href="/research"><span>말씀</span><strong>말씀 연구</strong><small>본문의 문맥과 핵심을 깊이 살펴보기</small><b>→</b></Link>
            <Link href="/sermon"><span>설교</span><strong>설교</strong><small>본문 연구부터 설교문까지</small><b>→</b></Link>
            <Link href="/prayer"><span>기도</span><strong>대표기도</strong><small>예배 상황에 맞는 기도문</small><b>→</b></Link>
            <Link href="/worship"><span>찬양</span><strong>찬양 플래너</strong><small>본문과 예배 흐름에 맞게</small><b>→</b></Link>
            <Link href="/document"><span>문서</span><strong>문서</strong><small>기획서·보고서·교육안</small><b>→</b></Link>
            <Link href="/image-content"><span>디자인</span><strong>이미지</strong><small>포스터·주보·썸네일</small><b>→</b></Link>
            <Link href="/youtube-shorts"><span>영상</span><strong>영상</strong><small>쇼츠·릴스 대본과 구성</small><b>→</b></Link>
          </div>
        </section>

        <section className="partner-section">
          <div className="partner-section-title partner-project-title"><div><small>RECENT</small><h2>최근 작업</h2></div><div className="partner-filter-row">{["전체", "설교", "기도", "디자인", "영상", "문서"].map((item) => <button key={item} type="button" className={focus === item ? "active" : ""} onClick={() => setFocus(item)}>{item}</button>)}</div></div>
          <div className="partner-recent-grid">{visibleProjects.map(([title, type, progress, time], index) => <Link href="/projects" key={String(title)}><div className={`partner-thumb thumb-${(index % 5) + 1}`}><span>{type}</span><b>{progress}%</b></div><strong>{title}</strong><small>마지막 수정 {time}</small><i><u style={{ width: `${progress}%` }} /></i></Link>)}</div>
        </section>
      </section>
    </main>
  );
}
