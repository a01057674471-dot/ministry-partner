"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

const tools = [
  { icon: "📖", title: "본문 연구", text: "역사적 배경, 문맥, 구조, 핵심 주제와 원어를 정리합니다.", href: "/research" },
  { icon: "🎬", title: "쇼츠 대본", text: "60초 이하 훅·대본·자막·마무리 질문을 만듭니다.", href: "/studio" },
  { icon: "💡", title: "콘텐츠 아이디어", text: "교회와 성경을 주제로 실제 제작 가능한 아이디어를 만듭니다.", href: "/studio" },
  { icon: "🖼️", title: "썸네일·이미지", text: "눈에 잘 보이는 문구와 이미지 생성 프롬프트를 만듭니다.", href: "/studio" },
  { icon: "🙏", title: "묵상 콘텐츠", text: "본문 요약, 묵상 질문, 기도문과 SNS 본문을 준비합니다.", href: "/studio" },
  { icon: "💾", title: "결과 저장", text: "완성된 결과를 현재 브라우저에 저장하고 다시 열 수 있습니다.", href: "/studio#saved" },
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
        <a className="brand" href="#top"><span className="brand-mark">M</span><span>목회파트너</span></a>
        <nav className="nav"><a href="#tools">기능 둘러보기</a><a href="/research">본문 연구</a><a href="/studio">콘텐츠 스튜디오</a></nav>
      </header>

      <div id="top" className="container">
        <section className="hero">
          <div>
            <div className="eyebrow">AI MINISTRY PARTNER</div>
            <h1>연구부터 쇼츠까지<br />한곳에서.</h1>
            <p>성경 본문 연구, 쇼츠 대본, 콘텐츠 아이디어와 이미지 프롬프트를 실제 사역에 바로 사용할 수 있도록 정리합니다.</p>
            <div className="actions"><a className="button button-primary" href="/studio">콘텐츠 만들기</a><a className="button button-secondary" href="#tools">기능 둘러보기</a></div>
          </div>

          <div className="hero-card">
            <h2>오늘 어떤 본문을 연구할까요?</h2>
            <p>예: 로마서 8장 28절, 사사기 10장 1–16절</p>
            <form className="quick-form" onSubmit={startResearch}>
              <input value={passage} onChange={(event) => setPassage(event.target.value)} placeholder="성경 본문을 입력하세요" aria-label="성경 본문" />
              <button className="button button-primary" type="submit">연구 시작</button>
            </form>
            <div className="notice">AI 결과는 연구와 제작을 돕는 초안입니다. 중요한 해석과 인용은 반드시 다시 확인하세요.</div>
          </div>
        </section>

        <section id="tools" className="section">
          <div className="section-head"><div><div className="eyebrow">PRACTICAL TOOLS</div><h2>지금 바로 사용할 수 있는 기능</h2></div><p>각 카드를 누르면 해당 기능으로 이동합니다.</p></div>
          <div className="grid feature-grid">{tools.map((tool) => (
            <a className="card feature-card" href={tool.href} key={tool.title}><div className="icon">{tool.icon}</div><h3>{tool.title}</h3><p>{tool.text}</p><span className="card-link">사용하기 →</span></a>
          ))}</div>
        </section>
      </div>

      <footer className="footer">© 2026 목회파트너 · 목회자의 책임 있는 연구와 콘텐츠 제작을 돕습니다.</footer>
    </main>
  );
}
