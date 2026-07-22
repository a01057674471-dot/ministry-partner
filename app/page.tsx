"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

const tools = [
  { icon: "📖", title: "본문 연구", text: "본문의 역사적 배경, 문학적 문맥, 구조와 핵심 주제를 한 번에 정리합니다." },
  { icon: "✍️", title: "연구 노트", text: "AI 결과를 그대로 설교문으로 쓰지 않고, 목회자의 해석과 통찰을 쌓도록 돕습니다." },
  { icon: "🔤", title: "원어 관찰", text: "히브리어와 헬라어의 핵심 단어를 문맥 안에서 조심스럽게 살펴봅니다." },
];

export default function Home() {
  const router = useRouter();
  const [passage, setPassage] = useState("");

  function startResearch(event: FormEvent) {
    event.preventDefault();
    const value = passage.trim();
    if (!value) return;
    router.push(`/research?passage=${encodeURIComponent(value)}`);
  }

  return (
    <main className="shell">
      <header className="header">
        <a className="brand" href="#top">
          <span className="brand-mark">M</span>
          <span>목회파트너</span>
        </a>
        <nav className="nav">
          <a href="#tools">연구 도구</a>
          <a href="/research">본문 연구</a>
          <a href="#principle">운영 원칙</a>
        </nav>
      </header>

      <div id="top" className="container">
        <section className="hero">
          <div>
            <div className="eyebrow">AI Bible Research Partner</div>
            <h1>목회자의 연구를<br />더 깊게.</h1>
            <p>
              설교를 대신 쓰지 않습니다. 성경 본문의 배경과 문맥을 살피고,
              목회자가 직접 묵상하고 판단할 수 있도록 연구 과정을 돕습니다.
            </p>
            <div className="actions">
              <a className="button button-primary" href="/research">본문 연구 시작하기</a>
              <a className="button button-secondary" href="#tools">기능 둘러보기</a>
            </div>
          </div>

          <div className="hero-card">
            <h2>오늘 어떤 본문을 연구할까요?</h2>
            <p>예: 로마서 8장 28절, 사사기 10장 1–16절</p>
            <form className="quick-form" onSubmit={startResearch}>
              <input
                value={passage}
                onChange={(event) => setPassage(event.target.value)}
                placeholder="성경 본문을 입력하세요"
                aria-label="성경 본문"
              />
              <button className="button button-primary" type="submit">연구 시작</button>
            </form>
            <div id="principle" className="notice">
              AI 답변은 연구 보조 자료입니다. 중요한 해석과 인용은 성경 본문과 신뢰할 수 있는 자료로 다시 확인하세요.
            </div>
          </div>
        </section>

        <section id="tools" className="section">
          <div className="section-head">
            <div>
              <div className="eyebrow">Research Tools</div>
              <h2>연구에 필요한 핵심 도구</h2>
            </div>
            <p>복잡한 기능보다 실제 연구 흐름에 집중했습니다.</p>
          </div>
          <div className="grid">
            {tools.map((tool) => (
              <article className="card" key={tool.title}>
                <div className="icon">{tool.icon}</div>
                <h3>{tool.title}</h3>
                <p>{tool.text}</p>
              </article>
            ))}
          </div>
        </section>
      </div>

      <footer className="footer">© 2026 목회파트너 · 목회자의 책임 있는 성경 연구를 돕습니다.</footer>
    </main>
  );
}
