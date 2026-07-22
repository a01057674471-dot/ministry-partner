"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

const tools = [
  { icon: "🧭", title: "교회 비전 로드맵", text: "교회의 현재 상황을 진단하고 3년·1년·분기 실행계획으로 구체화합니다.", href: "/workspace" },
  { icon: "📄", title: "목회 문서 제작", text: "사역 기획서, 운영안, 교육안, 보고서를 실제 회의용 문서로 만듭니다.", href: "/workspace" },
  { icon: "📝", title: "회의 정리", text: "회의 메모를 결정사항, 담당자, 기한, 다음 행동으로 정리합니다.", href: "/workspace" },
  { icon: "🎬", title: "쇼츠 패키지", text: "대본, 자막, 썸네일, 인스타 본문과 고정댓글을 한 번에 만듭니다.", href: "/workspace" },
  { icon: "▶️", title: "영상에서 쇼츠", text: "유튜브 주소와 자막 또는 대본을 바탕으로 쇼츠 후보를 여러 개 추출합니다.", href: "/workspace" },
  { icon: "📁", title: "파일 내용 재가공", text: "업로드한 텍스트 자료를 요약하고 문서나 콘텐츠로 다시 구성합니다.", href: "/workspace" },
  { icon: "📖", title: "성경 본문 연구", text: "역사적 배경, 문맥, 구조, 핵심 주제와 원어 관찰을 정리합니다.", href: "/research" },
  { icon: "✨", title: "간단 콘텐츠 도구", text: "콘텐츠 아이디어, 묵상문, 썸네일 문구를 빠르게 만듭니다.", href: "/studio" },
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
        <nav className="nav"><a href="/workspace">AI 워크스페이스</a><a href="/research">성경 연구</a><a href="#tools">전체 기능</a></nav>
      </header>

      <div id="top" className="container">
        <section className="hero">
          <div>
            <div className="eyebrow">AI MINISTRY WORKSPACE</div>
            <h1>교회 방향부터<br />콘텐츠까지.</h1>
            <p>교회 비전 로드맵, 사역 문서, 회의 정리, 성경 연구, 유튜브·쇼츠 콘텐츠 제작을 하나의 작업 공간에서 진행합니다.</p>
            <div className="actions"><a className="button button-primary" href="/workspace">AI 워크스페이스 열기</a><a className="button button-secondary" href="#tools">기능 둘러보기</a></div>
          </div>

          <div className="hero-card">
            <div className="eyebrow">QUICK BIBLE RESEARCH</div>
            <h2>오늘 어떤 본문을 연구할까요?</h2>
            <p>예: 로마서 8장 28절, 사사기 10장 1–16절</p>
            <form className="quick-form" onSubmit={startResearch}>
              <input value={passage} onChange={(event) => setPassage(event.target.value)} placeholder="성경 본문을 입력하세요" aria-label="성경 본문" />
              <button className="button button-primary" type="submit">연구 시작</button>
            </form>
            <div className="notice">AI 결과는 목회 판단을 돕는 초안입니다. 중요한 결정과 해석은 반드시 검토하세요.</div>
          </div>
        </section>

        <section id="tools" className="section">
          <div className="section-head"><div><div className="eyebrow">MINISTRY TOOLS</div><h2>교회 사역 전체를 한곳에서</h2></div><p>카드를 누르면 해당 작업 공간으로 이동합니다.</p></div>
          <div className="grid feature-grid">{tools.map((tool) => (
            <a className="card feature-card" href={tool.href} key={tool.title}><div className="icon">{tool.icon}</div><h3>{tool.title}</h3><p>{tool.text}</p><span className="card-link">사용하기 →</span></a>
          ))}</div>
        </section>
      </div>

      <footer className="footer">© 2026 목회파트너 · 목회자의 연구, 운영, 문서, 콘텐츠 제작을 돕습니다.</footer>
    </main>
  );
}
