"use client";

import { useEffect, useRef, useState } from "react";
import V2Sidebar from "../components/V2Sidebar";

const types = [
  { id: "card", icon: "▦", title: "카드뉴스" },
  { id: "feed", icon: "▣", title: "인스타 이미지" },
  { id: "thumbnail", icon: "▶", title: "썸네일" },
  { id: "poster", icon: "◇", title: "포스터" },
  { id: "banner", icon: "▬", title: "배너" },
];

export default function ImageContentPage() {
  const previewRef = useRef<HTMLDivElement>(null);
  const [type, setType] = useState("card");
  const [topic, setTopic] = useState("");
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [size, setSize] = useState("1024x1024");
  const [imageLoading, setImageLoading] = useState(false);
  const [error, setError] = useState("");
  const [align, setAlign] = useState<"left" | "center">("center");

  useEffect(() => {
    const request = new URLSearchParams(window.location.search).get("request");
    if (request) setTopic(request);
  }, []);

  async function generateImage() {
    if (!topic.trim()) return setError("만들 이미지의 배경과 분위기를 설명해 주세요.");
    const selected = types.find((item) => item.id === type)!;
    const prompt = `콘텐츠 종류: ${selected.title}\n사용자 요청: ${topic.trim()}\n\n한국 교회에서 실제 사용할 수 있는 고품질 배경 이미지를 만드세요. 가장 중요한 조건: 이미지 안에 글자, 한글, 영문, 숫자, 로고, 워터마크, 간판 문구를 절대로 넣지 마세요. 제목이 올라갈 수 있도록 충분한 여백을 남기고, 인물의 얼굴이나 핵심 피사체가 텍스트 영역과 겹치지 않게 구성하세요.`;
    setImageLoading(true); setError(""); setImageUrl("");
    try {
      const response = await fetch("/api/generate-image", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ prompt, size }) });
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.error || "이미지 생성에 실패했습니다.");
      setImageUrl(data.imageUrl);
    } catch (err) { setError(err instanceof Error ? err.message : "이미지 생성 중 오류가 발생했습니다."); }
    finally { setImageLoading(false); }
  }

  async function downloadComposed() {
    if (!imageUrl) return;
    const [width, height] = size.split("x").map(Number);
    const canvas = document.createElement("canvas");
    canvas.width = width; canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const image = new Image();
    image.crossOrigin = "anonymous";
    image.onload = () => {
      ctx.drawImage(image, 0, 0, width, height);
      const padding = Math.round(width * 0.08);
      const x = align === "center" ? width / 2 : padding;
      ctx.textAlign = align;
      ctx.fillStyle = "white";
      ctx.shadowColor = "rgba(0,0,0,.55)";
      ctx.shadowBlur = Math.round(width * 0.012);
      ctx.font = `800 ${Math.round(width * 0.075)}px Arial, sans-serif`;
      const titleY = Math.round(height * 0.72);
      ctx.fillText(title || "", x, titleY, width - padding * 2);
      ctx.font = `600 ${Math.round(width * 0.03)}px Arial, sans-serif`;
      ctx.fillText(subtitle || "", x, titleY + Math.round(height * 0.065), width - padding * 2);
      const link = document.createElement("a");
      link.download = "ministry-partner-image.png";
      link.href = canvas.toDataURL("image/png");
      link.click();
    };
    image.src = imageUrl;
  }

  return (
    <main className="v2-shell">
      <V2Sidebar />
      <section className="v2-main">
        <div className="v2-page-head"><div><div className="eyebrow">IMAGE STUDIO</div><h1>이미지 스튜디오</h1><p>AI는 배경만 만들고, 한글은 사이트에서 정확하게 올립니다.</p></div></div>
        <div className="image-type-tabs">{types.map((item) => <button key={item.id} onClick={() => setType(item.id)} className={type === item.id ? "active" : ""}><span>{item.icon}</span><strong>{item.title}</strong></button>)}</div>
        <div className="image-studio-grid image-v3-grid">
          <section className="image-input-card">
            <div className="notice"><strong>1. 배경 만들기</strong><br/>글자는 넣지 않고 배경과 분위기만 생성합니다.</div>
            <label>배경은 어떤 모습인가요?</label>
            <textarea value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="예: 청년부 여름수련회, 푸른 바다와 햇살, 밝고 세련된 분위기, 인물 없이 제목이 들어갈 넓은 여백" />
            <label>이미지 비율</label>
            <select value={size} onChange={(event) => setSize(event.target.value)}><option value="1024x1024">정사각형 1:1</option><option value="1024x1536">세로형</option><option value="1536x1024">가로형</option></select>
            <button className="button button-primary wide" onClick={generateImage} disabled={imageLoading}>{imageLoading ? "배경 생성 중…" : "글자 없는 배경 생성"}</button>
            <div className="image-v3-divider" />
            <div className="notice"><strong>2. 정확한 문구 올리기</strong><br/>입력한 글자가 그대로 적용되어 오타나 폰트 깨짐이 없습니다.</div>
            <label>제목<input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="예: 다시, 뜨겁게" /></label>
            <label>부제<input value={subtitle} onChange={(e) => setSubtitle(e.target.value)} placeholder="예: 2026 청년부 여름수련회" /></label>
            <label>글자 정렬</label>
            <div className="image-align-buttons"><button className={align === "center" ? "active" : ""} onClick={() => setAlign("center")}>가운데</button><button className={align === "left" ? "active" : ""} onClick={() => setAlign("left")}>왼쪽</button></div>
            {error && <div className="notice error"><strong>생성 실패</strong><br />{error}</div>}
          </section>

          <section className="image-result-card">
            <div className="result-toolbar"><strong>실시간 미리보기</strong><div>{imageUrl && <button onClick={downloadComposed}>완성 이미지 저장</button>}</div></div>
            {imageLoading ? <div className="result-paper">글자가 없는 배경을 만들고 있습니다. 보통 30초에서 2분 정도 걸립니다.</div> : imageUrl ? <div className={`image-v3-preview ${align}`} ref={previewRef}><img src={imageUrl} alt="생성된 배경" /><div className="image-v3-overlay"><strong>{title}</strong><span>{subtitle}</span></div></div> : <div className="result-paper">왼쪽에서 배경을 생성하면 여기에 미리보기가 나타납니다. 제목과 부제는 생성 후에도 자유롭게 수정할 수 있습니다.</div>}
          </section>
        </div>
      </section>
    </main>
  );
}
