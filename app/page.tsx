"use client";

import { FormEvent, ReactNode, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Tool = {
  title: string;
  description: string;
  href: string;
  example: string;
  icon: ReactNode;
};

const tools: Tool[] = [
  {
    title: "성경 연구",
    description: "본문·배경·원어를 깊이 있게",
    href: "/research",
    example: "사사기 10장의 역사적 배경과 핵심 메시지를 연구해 주세요",
    icon: <BookIcon />,
  },
  {
    title: "설교 준비",
    description: "개요부터 적용까지 한 번에",
    href: "/workspace?tool=sermon",
    example: "로마서 8장으로 장년 예배 설교를 준비해 주세요",
    icon: <PenIcon />,
  },
  {
    title: "기도문 작성",
    description: "예배와 상황에 맞는 기도문",
    href: "/workspace?tool=prayer",
    example: "이번 주일예배 대표기도문을 작성해 주세요",
    icon: <HandsIcon />,
  },
  {
    title: "교회 운영",
    description: "공지·회의·사역 계획을 간편하게",
    href: "/workspace?tool=roadmap",
    example: "교회 리더 회의자료를 읽기 쉽게 정리해 주세요",
    icon: <ChurchIcon />,
  },
  {
    title: "콘텐츠 제작",
    description: "쇼츠·카드뉴스·SNS 문구",
    href: "/workspace?tool=shorts",
    example: "이 설교 내용을 60초 쇼츠 대본으로 만들어 주세요",
    icon: <PlayIcon />,
  },
  {
    title: "파일 분석",
    description: "PDF와 문서를 빠르게 요약",
    href: "/workspace?tool=file",
    example: "회의자료 파일의 핵심 내용을 요약해 주세요",
    icon: <FileIcon />,
  },
];

const suggestions = [
  "사사기 10장을 쉽게 연구해 주세요",
  "이번 주일 설교 개요를 만들어 주세요",
  "주일예배 대표기도문을 작성해 주세요",
  "새가족 환영 인사말을 만들어 주세요",
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

    if (/성경|본문|장|절|로마서|창세기|사사기|시편|복음서/.test(trimmed)) {
      router.push(`/research?passage=${encodeURIComponent(trimmed)}`);
      return;
    }

    router.push(`/workspace?request=${encodeURIComponent(trimmed)}`);
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    submitRequest();
  }

  function chooseSuggestion(value: string) {
    setRequest(value);
  }

  return (
    <main className="home-v4">
      <header className="home-v4-header">
        <a className="home-v4-brand" href="/" aria-label="목회파트너 홈">
          <span className="home-v4-logo">M</span>
          <span>
            <strong>목회파트너</strong>
            <small>목회를 위한 AI 파트너</small>
          </span>
        </a>
        <a className="home-v4-all" href="/workspace">
          전체 기능 <ArrowIcon />
        </a>
      </header>

      <section className="home-v4-hero">
        <p className="home-v4-greeting">{greeting}</p>
        <h1>오늘은 무엇을<br className="mobile-break" /> 함께 준비할까요?</h1>
        <p className="home-v4-description">
          성경 연구부터 설교와 교회 사역까지, 필요한 내용을 편하게 말씀해 주세요.
        </p>

        <form className="home-v4-command" onSubmit={handleSubmit}>
          <div className="home-v4-input-wrap">
            <textarea
              value={request}
              onChange={(event) => setRequest(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault();
                  submitRequest();
                }
              }}
              placeholder="예: 사사기 10장을 연구해 주세요"
              rows={2}
              aria-label="AI에게 요청할 내용"
            />
            <button type="submit" className="home-v4-submit" aria-label="AI에게 요청하기">
              <ArrowUpIcon />
            </button>
          </div>
          <div className="home-v4-command-footer">
            <span>Enter로 바로 요청할 수 있습니다</span>
            <strong>AI에게 요청하기</strong>
          </div>
        </form>

        <div className="home-v4-suggestions" aria-label="추천 질문">
          {suggestions.map((suggestion) => (
            <button type="button" key={suggestion} onClick={() => chooseSuggestion(suggestion)}>
              {suggestion}
            </button>
          ))}
        </div>
      </section>

      <section className="home-v4-quick" aria-labelledby="quick-title">
        <div className="home-v4-section-head">
          <div>
            <span>빠른 시작</span>
            <h2 id="quick-title">자주 쓰는 사역 도구</h2>
          </div>
          <p>원하는 항목을 누르면 바로 시작됩니다.</p>
        </div>

        <div className="home-v4-grid">
          {tools.map((tool) => (
            <a
              className="home-v4-tool"
              href={tool.href}
              key={tool.title}
              onClick={(event) => {
                if (tool.href === "/research") return;
                if (!tool.href.includes("request=")) return;
                event.preventDefault();
                submitRequest(tool.example);
              }}
            >
              <span className="home-v4-tool-icon">{tool.icon}</span>
              <span className="home-v4-tool-copy">
                <strong>{tool.title}</strong>
                <small>{tool.description}</small>
              </span>
              <ArrowIcon />
            </a>
          ))}
        </div>
      </section>

      <footer className="home-v4-footer">
        <span>목회파트너</span>
        <p>AI가 작성한 내용은 초안입니다. 성경 해석과 중요한 교회 결정은 반드시 직접 확인해 주세요.</p>
      </footer>
    </main>
  );
}

function BookIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H11a2 2 0 0 1 2 2v15a2.5 2.5 0 0 0-2.5-2.5H4V5.5Z"/><path d="M20 5.5A2.5 2.5 0 0 0 17.5 3H13v17a2.5 2.5 0 0 1 2.5-2.5H20V5.5Z"/></svg>;
}
function PenIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m14.5 5.5 4 4M4 20l4.2-1 10.9-10.9a1.8 1.8 0 0 0 0-2.6l-.6-.6a1.8 1.8 0 0 0-2.6 0L5 15.8 4 20Z"/></svg>;
}
function HandsIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8.5 4.5 12 9l3.5-4.5M12 9v11M7 13l5 7 5-7"/></svg>;
}
function ChurchIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2v5M9.5 4.5h5M5 21v-9l7-5 7 5v9M3 21h18M10 21v-5h4v5"/></svg>;
}
function PlayIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="3"/><path d="m10 9 5 3-5 3V9Z"/></svg>;
}
function FileIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 2h8l4 4v16H6V2Z"/><path d="M14 2v5h5M9 12h6M9 16h6"/></svg>;
}
function ArrowIcon() {
  return <svg className="home-v4-arrow" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M14 7l5 5-5 5"/></svg>;
}
function ArrowUpIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 19V5M7 10l5-5 5 5"/></svg>;
}
