"use client";

import { FormEvent, ReactNode, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Tool = {
  title: string;
  description: string;
  href: string;
  icon: ReactNode;
};

const tools: Tool[] = [
  {
    title: "성경 연구",
    description: "본문·배경·원어·신학 자료를 깊이 있게",
    href: "/research",
    icon: <BookIcon />,
  },
  {
    title: "설교 준비",
    description: "본문 연구부터 개요·적용·설교문까지",
    href: "/sermon",
    icon: <PenIcon />,
  },
  {
    title: "기도문 작성",
    description: "예배와 상황에 맞는 기도문",
    href: "/prayer",
    icon: <HandsIcon />,
  },
  {
    title: "교회 비전 로드맵",
    description: "구체적인 질문으로 3년 실행계획 완성",
    href: "/roadmap",
    icon: <ChurchIcon />,
  },
  {
    title: "유튜브 쇼츠 제작",
    description: "유튜브 주소로 쇼츠 기획과 대본 생성",
    href: "/youtube-shorts",
    icon: <PlayIcon />,
  },
  {
    title: "파일 분석",
    description: "문서를 요약하고 필요한 자료로 재구성",
    href: "/file-analysis",
    icon: <FileIcon />,
  },
];

const suggestions = [
  "사사기 10장으로 청년부 설교 준비",
  "요한복음 15장 1-8절을 깊이 연구",
  "이번 주일예배 3분 대표기도문 작성",
  "80명 교회의 3년 비전 로드맵 만들기",
];

function getGreeting(hour: number) {
  if (hour < 12) return "좋은 아침입니다, 목사님.";
  if (hour < 18) return "좋은 오후입니다, 목사님.";
  return "좋은 저녁입니다, 목사님.";
}

export default function Home() {
  const router = useRouter();
  const [request, setRequest] = useState("");
  const [greeting, setGreeting] = useState("안녕하세요, 목사님.");

  useEffect(() => {
    setGreeting(getGreeting(new Date().getHours()));
  }, []);

  function submitRequest(value = request) {
    const trimmed = value.trim();
    if (!trimmed) return;

    if (/설교|강해|주일말씀|새벽말씀|수요말씀|메시지.*준비/.test(trimmed)) {
      router.push(`/sermon?request=${encodeURIComponent(trimmed)}`);
      return;
    }
    if (/대표기도|기도문|헌금기도|개회기도|폐회기도|축도/.test(trimmed)) {
      router.push(`/prayer?request=${encodeURIComponent(trimmed)}`);
      return;
    }
    if (/유튜브|youtube|youtu\.be/.test(trimmed.toLowerCase())) {
      router.push(`/youtube-shorts?request=${encodeURIComponent(trimmed)}`);
      return;
    }
    if (/쇼츠|릴스|카드뉴스|썸네일/.test(trimmed)) {
      router.push(`/shorts?request=${encodeURIComponent(trimmed)}`);
      return;
    }
    if (/비전|로드맵|교회운영|사역계획|중장기계획/.test(trimmed)) {
      router.push(`/roadmap?request=${encodeURIComponent(trimmed)}`);
      return;
    }
    if (/회의|회의록|결정사항/.test(trimmed)) {
      router.push(`/meeting?request=${encodeURIComponent(trimmed)}`);
      return;
    }
    if (/기획서|운영안|교육안|보고서|행사계획/.test(trimmed)) {
      router.push(`/document?request=${encodeURIComponent(trimmed)}`);
      return;
    }
    if (/성경|본문|\d+장|\d+절|로마서|창세기|사사기|시편|복음서|요한복음|마태복음|마가복음|누가복음/.test(trimmed)) {
      router.push(`/research?passage=${encodeURIComponent(trimmed)}`);
      return;
    }

    router.push(`/workspace?request=${encodeURIComponent(trimmed)}`);
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    submitRequest();
  }

  return (
    <main className="home-v4">
      <header className="home-v4-header">
        <a className="home-v4-brand" href="/" aria-label="목회파트너 홈">
          <span className="home-v4-logo">M</span>
          <span><strong>목회파트너</strong><small>목회를 위한 AI 파트너</small></span>
        </a>
        <a className="home-v4-all" href="/workspace">전체 기능 <ArrowIcon /></a>
      </header>

      <section className="home-v4-hero">
        <p className="home-v4-greeting">{greeting}</p>
        <h1>오늘은 무엇을<br className="mobile-break" /> 함께 준비할까요?</h1>
        <p className="home-v4-description">성경 연구부터 설교와 교회 사역까지, 필요한 내용을 파트너에게 편하게 말씀해 주세요.</p>

        <form className="home-v4-command" onSubmit={handleSubmit}>
          <div className="home-v4-input-wrap">
            <textarea value={request} onChange={(event) => setRequest(event.target.value)} onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); submitRequest(); }
            }} placeholder="예: 사사기 10장으로 청년부 20분 설교 준비" rows={2} aria-label="파트너에게 요청할 내용" />
            <button type="submit" className="home-v4-submit" aria-label="파트너에게 요청하기"><ArrowUpIcon /></button>
          </div>
          <div className="home-v4-command-footer"><span>Enter로 바로 요청할 수 있습니다</span><strong>파트너에게 요청하기</strong></div>
        </form>

        <div className="home-v4-suggestions" aria-label="추천 질문">
          {suggestions.map((suggestion) => <button type="button" key={suggestion} onClick={() => setRequest(suggestion)}>{suggestion}</button>)}
        </div>
      </section>

      <section className="home-v4-quick" aria-labelledby="quick-title">
        <div className="home-v4-section-head"><div><span>빠른 시작</span><h2 id="quick-title">자주 쓰는 사역 도구</h2></div><p>원하는 항목을 누르면 해당 기능으로 바로 이동합니다.</p></div>
        <div className="home-v4-grid">
          {tools.map((tool) => <a className="home-v4-tool" href={tool.href} key={tool.title}><span className="home-v4-tool-icon">{tool.icon}</span><span className="home-v4-tool-copy"><strong>{tool.title}</strong><small>{tool.description}</small></span><ArrowIcon /></a>)}
        </div>
      </section>

      <footer className="home-v4-footer"><span>목회파트너</span><p>AI가 작성한 내용은 초안입니다. 성경 해석과 중요한 교회 결정은 반드시 직접 확인해 주세요.</p></footer>
    </main>
  );
}

function BookIcon() { return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H11a2 2 0 0 1 2 2v15a2.5 2.5 0 0 0-2.5-2.5H4V5.5Z"/><path d="M20 5.5A2.5 2.5 0 0 0 17.5 3H13v17a2.5 2.5 0 0 1 2.5-2.5H20V5.5Z"/></svg>; }
function PenIcon() { return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m14.5 5.5 4 4M4 20l4.2-1 10.9-10.9a1.8 1.8 0 0 0 0-2.6l-.6-.6a1.8 1.8 0 0 0-2.6 0L5 15.8 4 20Z"/></svg>; }
function HandsIcon() { return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8.5 4.5 12 9l3.5-4.5M12 9v11M7 13l5 7 5-7"/></svg>; }
function ChurchIcon() { return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2v5M9.5 4.5h5M5 21v-9l7-5 7 5v9M3 21h18M10 21v-5h4v5"/></svg>; }
function PlayIcon() { return <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="3"/><path d="m10 9 5 3-5 3V9Z"/></svg>; }
function FileIcon() { return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 2h8l4 4v16H6V2Z"/><path d="M14 2v5h5M9 12h6M9 16h6"/></svg>; }
function ArrowIcon() { return <svg className="home-v4-arrow" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M14 7l5 5-5 5"/></svg>; }
function ArrowUpIcon() { return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 19V5M7 10l5-5 5 5"/></svg>; }
