"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "./lib/supabase-client";

const examples = [
  "창세기 22장의 배경과 문맥을 연구해줘",
  "고난 중 위로를 주는 찬양을 골라줘",
  "앞으로 5년의 선교 로드맵을 만들어줘",
  "청년부 카드뉴스를 만들어줘",
];

const coreTools = [
  { href: "/research", icon: "▤", tone: "mint", title: "말씀 연구", copy: "배경·문맥·원어와 해석 견해를 확인합니다." },
  { href: "/sermon", icon: "✦", tone: "blue", title: "설교 준비", copy: "본문 연구에서 설교 개요와 초안까지 이어갑니다." },
  { href: "/prayer", icon: "♢", tone: "orange", title: "기도문 작성", copy: "예배와 상황에 맞는 기도문을 준비합니다." },
  { href: "/worship", icon: "♫", tone: "purple", title: "찬양 플래너", copy: "본문과 예배 흐름에 맞춰 선곡합니다." },
  { href: "/image-content", icon: "▧", tone: "pink", title: "카드뉴스·디자인", copy: "포스터와 카드뉴스 배경을 만들고 편집합니다." },
  { href: "/workspace?request=45초 쇼츠 대본을 만들어줘", icon: "▶", tone: "red", title: "쇼츠 기획", copy: "훅·대사·자막·썸네일까지 구성합니다." },
  { href: "/workspace?request=사역 기획서를 작성해줘", icon: "▦", tone: "sand", title: "사역 문서", copy: "기획서·보고서·교육안과 회의록을 정리합니다." },
  { href: "/roadmap", icon: "◎", tone: "teal", title: "사역 로드맵", copy: "3년·5년 비전과 실행 계획을 세웁니다." },
];

type ScheduleItem = { id: number; time: string; title: string };

function displayName(value: string) {
  const cleaned = value.trim().replace(/님+$/g, "");
  return cleaned || "사역자";
}

function BrandMark() {
  return (
    <svg className="partner-brand-svg" viewBox="0 0 64 64" role="img" aria-label="MP 로고">
      <path d="M8 47V17h9l15 19 15-19h9v30H46V31L32 49 18 31v16z" fill="currentColor" />
      <path d="M50 5l2.1 5L57 12l-4.9 2.1L50 19l-2.1-4.9L43 12l4.9-2z" fill="#f59e0b" />
    </svg>
  );
}

export default function Home() {
  const router = useRouter();
  const [request, setRequest] = useState("");
  const [name, setName] = useState("사역자");
  const [recent, setRecent] = useState<Array<{ title: string; updatedAt: string }>>([]);
  const [schedule, setSchedule] = useState<ScheduleItem[]>([]);
  const [eventTime, setEventTime] = useState("09:00");
  const [eventTitle, setEventTitle] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem("ministry-partner-name");
    if (saved) setName(displayName(saved));

    try {
      const raw = localStorage.getItem("ministry-partner-projects-v3");
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          setRecent(parsed.slice(0, 4).map((item) => ({
            title: String(item.title || "이름 없는 작업"),
            updatedAt: String(item.updatedAt || ""),
          })));
        }
      }
    } catch {
      setRecent([]);
    }

    try {
      const raw = localStorage.getItem("ministry-partner-schedule-v1");
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) setSchedule(parsed);
      }
    } catch {
      setSchedule([]);
    }

    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;
    supabase.auth.getUser().then(({ data }) => {
      const userName = data.user?.user_metadata?.full_name || data.user?.user_metadata?.name;
      if (!userName) return;
      const cleanName = displayName(userName);
      setName(cleanName);
      localStorage.setItem("ministry-partner-name", cleanName);
    });
  }, []);

  function saveSchedule(next: ScheduleItem[]) {
    const sorted = [...next].sort((a, b) => a.time.localeCompare(b.time));
    setSchedule(sorted);
    localStorage.setItem("ministry-partner-schedule-v1", JSON.stringify(sorted));
  }

  function addEvent(e: FormEvent) {
    e.preventDefault();
    if (!eventTitle.trim()) return;
    saveSchedule([...schedule, { id: Date.now(), time: eventTime, title: eventTitle.trim() }]);
    setEventTitle("");
  }

  function routeRequest(value = request) {
    const text = value.trim();
    if (!text) return;
    if (/찬양|복음성가|찬송가|콘티/.test(text)) return router.push(`/worship?request=${encodeURIComponent(text)}`);
    if (/로드맵|비전|3년|5년|10년/.test(text)) return router.push(`/roadmap?request=${encodeURIComponent(text)}`);
    if (/카드뉴스|카드 뉴스|인스타 카드/.test(text)) return router.push(`/workspace?request=${encodeURIComponent(text)}`);
    if (/성경|본문|배경|문맥|원어|주해|\d+장|\d+절/.test(text)) return router.push(`/research?passage=${encodeURIComponent(text)}`);
    if (/설교|강해/.test(text)) return router.push(`/sermon?request=${encodeURIComponent(text)}`);
    if (/기도|축도/.test(text)) return router.push(`/prayer?request=${encodeURIComponent(text)}`);
    if (/썸네일|이미지|인스타|포스터|배너|주보/.test(text)) return router.push(`/image-content?request=${encodeURIComponent(text)}`);
    router.push(`/workspace?request=${encodeURIComponent(text)}`);
  }

  function submit(e: FormEvent) {
    e.preventDefault();
    routeRequest();
  }

  return (
    <main className="partner-dashboard">
      <div className="partner-home-layout">
        <header className="partner-home-brand">
          <Link href="/" className="partner-home-logo" aria-label="사역파트너 홈">
            <span className="partner-brand-symbol" aria-hidden="true"><BrandMark /></span>
            <span><strong>사역파트너</strong><small>MINISTRY PARTNER</small></span>
          </Link>
          <p>안녕하세요, {name}님</p>
        </header>

        <section className="partner-hero-grid">
          <section className="partner-principle">
            <span className="partner-principle-label">사역파트너의 원칙</span>
            <h1>사역을 대신하지 않습니다.<br />사역에 더 집중하도록 돕습니다.</h1>
            <p>말씀과 기도, 사역자의 신학적 검토와 분별을 중심에 둡니다.</p>
            <span className="partner-principle-watermark" aria-hidden="true">MP</span>
          </section>

          <aside className="partner-hero-side">
            <small>QUICK START</small>
            <h2>바로 시작하기</h2>
            <Link href="/sermon"><span>설교 준비</span><b>→</b></Link>
            <Link href="/prayer"><span>대표기도 작성</span><b>→</b></Link>
            <Link href="/workspace?request=청년부 카드뉴스를 만들어줘"><span>청년부 카드뉴스</span><b>→</b></Link>
          </aside>
        </section>

        <form className="partner-command" onSubmit={submit}>
          <div className="partner-command-label">
            <span>오늘 무엇을 준비하시나요?</span>
            <small>한 문장으로 편하게 적어주세요</small>
          </div>
          <textarea
            value={request}
            onChange={(e) => setRequest(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                routeRequest();
              }
            }}
            placeholder="예: 누가복음 15장의 배경과 문맥을 연구해줘"
          />
          <div className="partner-command-bottom">
            <span>Enter로 실행 · Shift+Enter로 줄바꿈</span>
            <button type="submit">준비 시작하기 <b>→</b></button>
          </div>
        </form>

        <div className="partner-example-row" aria-label="추천 요청">
          <b>추천 요청</b>
          {examples.map((item, index) => (
            <button key={item} type="button" onClick={() => setRequest(item)}>
              <span aria-hidden="true">{["▤", "♢", "◎", "▧"][index]}</span>{item}
            </button>
          ))}
        </div>

        <section className="partner-section">
          <div className="partner-section-title">
            <div><small>CORE WORKFLOW</small><h2>핵심 기능</h2></div>
          </div>
          <div className="partner-quick-grid partner-quick-grid-wide">
            {coreTools.map((tool) => (
              <Link href={tool.href} key={tool.title} className={`partner-tool-card tone-${tool.tone}`}>
                <span className="partner-tool-icon" aria-hidden="true">{tool.icon}</span>
                <div><strong>{tool.title}</strong><small>{tool.copy}</small></div>
                <b aria-hidden="true">→</b>
              </Link>
            ))}
          </div>
        </section>

        <section className="partner-section partner-lower-grid">
          <div>
            <div className="partner-section-title"><div><small>RECENT</small><h2>내 최근 작업</h2></div></div>
            {recent.length ? (
              <div className="partner-recent-simple">
                {recent.map((item) => (
                  <Link href="/workspace" key={item.title}>
                    <span aria-hidden="true">▤</span>
                    <div><strong>{item.title}</strong><small>{item.updatedAt ? new Date(item.updatedAt).toLocaleString("ko-KR") : "저장된 작업"}</small></div>
                    <b aria-hidden="true">→</b>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="partner-empty-state">
                <strong>아직 저장된 작업이 없습니다.</strong>
                <p>첫 작업을 시작하면 이곳에 실제 작업만 표시됩니다.</p>
                <Link href="/workspace">작업 시작하기 →</Link>
              </div>
            )}
          </div>

          <section className="partner-calendar">
            <header><div><small>SCHEDULE</small><h2>오늘 일정</h2></div><time>{new Date().toLocaleDateString("ko-KR", { month: "long", day: "numeric", weekday: "short" })}</time></header>
            <form className="calendar-add" onSubmit={addEvent}>
              <input type="time" value={eventTime} onChange={(e) => setEventTime(e.target.value)} aria-label="일정 시간" />
              <input value={eventTitle} onChange={(e) => setEventTitle(e.target.value)} placeholder="예: 심방, 회의, 설교 준비" aria-label="일정 제목" />
              <button type="submit">추가</button>
            </form>
            <div className="calendar-list">
              {schedule.length ? schedule.map((item) => (
                <div className="calendar-item" key={item.id}>
                  <b>{item.time}</b><span>{item.title}</span>
                  <button type="button" aria-label={`${item.title} 삭제`} onClick={() => saveSchedule(schedule.filter((v) => v.id !== item.id))}>×</button>
                </div>
              )) : <div className="calendar-empty">오늘 일정을 추가해 보세요.</div>}
            </div>
          </section>
        </section>
      </div>
    </main>
  );
}
