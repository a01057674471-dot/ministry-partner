"use client";

import { useEffect, useState } from "react";

const types = [
  { id: "card", icon: "▦", title: "카드뉴스", desc: "슬라이드별 문구와 이미지 방향" },
  { id: "feed", icon: "▣", title: "인스타 이미지", desc: "피드 이미지 구성과 캡션" },
  { id: "thumbnail", icon: "▶", title: "썸네일", desc: "눈에 띄는 문구와 시각 콘셉트" },
  { id: "prompt", icon: "✦", title: "이미지 프롬프트", desc: "AI 이미지 제작용 상세 명령어" },
  { id: "caption", icon: "✎", title: "SNS 캡션", desc: "본문·해시태그·참여 유도 문구" },
  { id: "plan", icon: "☷", title: "콘텐츠 기획", desc: "한 주 분량의 이미지 콘텐츠 계획" },
];

export default function ImageContentPage() {
  const [type, setType] = useState("card");
  const [topic, setTopic] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const request = new URLSearchParams(window.location.search).get("request");
    if (request) setTopic(request);
  }, []);

  async function generate() {
    if (!topic.trim()) return setError("만들고 싶은 주제와 대상을 입력해 주세요.");
    setLoading(true); setError(""); setResult("");
    const selected = types.find((item) => item.id === type)!;
    const instruction = `이미지 콘텐츠 종류: ${selected.title}\n다음 내용을 반드시 포함하세요: 핵심 메시지, 화면 구성, 이미지 스타일, 색상 방향, 슬라이드별 문구 또는 대표 문구, AI 이미지 생성 프롬프트, SNS 캡션, 참여 유도 문장. 한글 오타가 생기지 않도록 이미지 안의 문구는 짧게 제안하세요.\n\n사용자 요청: ${topic.trim()}`;
    try {
      const response = await fetch("/api/generate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ tool: type === "thumbnail" || type === "prompt" ? "thumbnail" : "ideas", topic: instruction }) });
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.error || "준비에 실패했습니다.");
      setResult(data.result);
    } catch (err) { setError(err instanceof Error ? err.message : "오류가 발생했습니다."); }
    finally { setLoading(false); }
  }

  return (
    <main className="image-studio">
      <aside className="image-studio-side">
        <a className="mp-brand" href="/"><span className="mp-logo">✦</span><span><strong>목회파트너</strong><small>Pastor&apos;s Partner</small></span></a>
        <a className="image-back" href="/">← 홈으로</a>
        <h2>이미지 콘텐츠</h2>
        <p>교회 SNS에 바로 활용할 기획과 문구를 함께 준비합니다.</p>
        <nav>{types.map((item) => <button key={item.id} onClick={() => setType(item.id)} className={type === item.id ? "active" : ""}><span>{item.icon}</span><div><strong>{item.title}</strong><small>{item.desc}</small></div></button>)}</nav>
      </aside>

      <section className="image-studio-main">
        <header><span>IMAGE CONTENT STUDIO</span><h1>🎨 {types.find((item) => item.id === type)?.title}</h1><p>영상 대본이 아니라, 이미지 중심 콘텐츠를 만드는 공간입니다.</p></header>
        <div className="image-studio-grid">
          <section className="image-input-card">
            <div className="notice">주제 / 대상 / 사용할 채널 / 원하는 분위기를 적어 주세요.</div>
            <label>무엇을 만들까요?</label>
            <textarea value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="예: 청년부 수련회 홍보 카드뉴스 / 20대 청년 / 인스타그램 / 밝고 세련된 여름 분위기 / 5장" />
            <div className="image-example-row"><button onClick={() => setTopic("창세기 22장 핵심 메시지 카드뉴스 / 초신자 / 인스타그램 / 따뜻하고 미니멀 / 6장")}>성경 카드뉴스</button><button onClick={() => setTopic("이번 주일예배 초대 인스타 이미지 / 전 연령 / 단정하고 밝은 분위기")}>예배 초대 이미지</button><button onClick={() => setTopic("청년부 수련회 썸네일 / 20대 / 역동적이고 세련된 분위기")}>행사 썸네일</button></div>
            <div className="editor-actions"><button className="button button-primary" onClick={generate} disabled={loading}>{loading ? "파트너가 준비 중…" : "함께 준비하기"}</button><button className="button button-secondary" onClick={() => { setTopic(""); setResult(""); setError(""); }}>비우기</button></div>
            {error && <div className="notice error">{error}</div>}
          </section>
          <section className="image-result-card">
            <div className="result-toolbar"><strong>파트너의 제안</strong><div><button onClick={() => result && navigator.clipboard.writeText(result)}>복사</button></div></div>
            <div className="result-paper">{result || "왼쪽에 만들고 싶은 이미지 콘텐츠를 입력해 주세요. 결과에는 구성, 문구, 이미지 프롬프트와 SNS 캡션이 함께 제공됩니다."}</div>
          </section>
        </div>
      </section>
    </main>
  );
}
