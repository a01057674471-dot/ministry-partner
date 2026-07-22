"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

const mainTools = [
  { icon: "📖", title: "성경 연구", href: "/research", example: "사사기 10장을 연구해 주세요" },
  { icon: "✍️", title: "설교 준비", href: "/workspace?tool=sermon", example: "로마서 8장으로 장년 설교를 준비해 주세요" },
  { icon: "⛪", title: "교회 운영", href: "/workspace?tool=roadmap", example: "우리 교회의 3년 로드맵을 만들어 주세요" },
  { icon: "🎬", title: "콘텐츠 제작", href: "/workspace?tool=shorts", example: "이 설교로 60초 쇼츠를 만들어 주세요" },
  { icon: "📂", title: "파일 분석", href: "/workspace?tool=file", example: "회의자료 파일을 요약해 주세요" },
  { icon: "🤖", title: "AI에게 질문", href: "/workspace", example: "다음 주 사역을 어떻게 준비하면 좋을까요?" },
];

export default function Home() {
  const router = useRouter();
  const [request, setRequest] = useState("");

  function start(event: FormEvent) {
    event.preventDefault();
    const value = request.trim();
    if (!value) return;

    const lower = value.toLowerCase();
    if (/성경|본문|장|절|로마서|창세기|사사기|시편|복음서/.test(lower)) {
      router.push(`/research?passage=${encodeURIComponent(value)}`);
      return;
    }
    router.push(`/workspace?request=${encodeURIComponent(value)}`);
  }

  return (
    <main className="senior-home">
      <header className="senior-header">
        <a className="brand senior-brand" href="/"><span className="brand-mark">M</span><span>목회파트너</span></a>
        <a className="simple-help" href="/workspace">전체 기능</a>
      </header>

      <section className="senior-main">
        <div className="senior-intro">
          <p className="senior-kicker">목회자의 시간을 아껴주는 AI</p>
          <h1>무엇을 도와드릴까요?</h1>
          <p>하고 싶은 일을 그대로 적어 주세요.</p>
        </div>

        <form className="senior-command" onSubmit={start}>
          <label htmlFor="main-request">도움받을 내용을 입력하세요</label>
          <textarea
            id="main-request"
            value={request}
            onChange={(event) => setRequest(event.target.value)}
            placeholder="예: 2027년 교회 비전 로드맵을 만들어 주세요"
            rows={3}
          />
          <button type="submit">바로 시작하기</button>
        </form>

        <div className="senior-examples" aria-label="입력 예시">
          <button onClick={() => setRequest("사사기 10장을 쉽게 연구해 주세요")}>사사기 10장 연구</button>
          <button onClick={() => setRequest("다음 주 회의자료를 정리해 주세요")}>회의자료 만들기</button>
          <button onClick={() => setRequest("2027년 교회 비전 로드맵을 만들어 주세요")}>교회 로드맵</button>
        </div>

        <section className="senior-tools" aria-labelledby="quick-tools-title">
          <h2 id="quick-tools-title">자주 쓰는 기능</h2>
          <div className="senior-tool-grid">
            {mainTools.map((tool) => (
              <a className="senior-tool" href={tool.href} key={tool.title}>
                <span className="senior-tool-icon" aria-hidden="true">{tool.icon}</span>
                <span className="senior-tool-title">{tool.title}</span>
                <span className="senior-tool-arrow">›</span>
              </a>
            ))}
          </div>
        </section>

        <div className="senior-note">AI가 만든 내용은 초안입니다. 성경 해석과 중요한 교회 결정은 반드시 직접 확인해 주세요.</div>
      </section>
    </main>
  );
}
