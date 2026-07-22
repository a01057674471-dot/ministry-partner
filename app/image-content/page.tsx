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

const styles = [
  ["photo", "실사"], ["cinematic", "시네마틱"], ["minimal", "미니멀"],
  ["illustration", "일러스트"], ["watercolor", "수채화"], ["threeD", "3D"],
];

const moods = [
  ["premium", "고급스럽게"], ["bright", "밝고 희망차게"], ["warm", "따뜻하게"],
  ["holy", "경건하고 평안하게"], ["dynamic", "역동적으로"],
];

export default function ImageContentPage() {
  const previewRef = useRef<HTMLDivElement>(null);
  const [type, setType] = useState("card");
  const [style, setStyle] = useState("photo");
  const [mood, setMood] = useState("premium");
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
    setImageLoading(true); setError(""); setImageUrl("");
    try {
      const response = await fetch("/api/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: topic.trim(), size, type, style, mood }),
      });
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
      ctx.shadowColor = "rgba(0,0,0,.6)";
      ctx.shadowBlur = Math.round(width * 0.014);
      ctx.font = `800 ${Math.round(width * 0.075)}px Arial, Apple SD Gothic Neo, sans-serif`;
      const titleY = Math.round(height * 0.72);
      ctx.fillText(title || "", x, titleY, width - padding * 2);
      ctx.font = `600 ${Math.round(width * 0.03)}px Arial, Apple SD Gothic Neo, sans-serif`;
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
        <div className="v2-page-head"><div><div className="eyebrow">IMAGE STUDIO</div><h1>이미지 스튜디오</h1><p>고품질 배경을 만든 뒤 한글 문구는 정확하게 직접 올립니다.</p></div></div>
        <div className="image-type-tabs">{types.map((item) => <button key={item.id} onClick={() => setType(item.id)} className={type === item.id ? "active" : ""}><span>{item.icon}</span><strong>{item.title}</strong></button>)}</div>
        <div className="image-studio-grid image-v3-grid">
          <section className="image-input-card">
            <div className="notice"><strong>1. 고품질 배경 만들기</strong><br/>용도·스타일·분위기에 맞는 전문 프롬프트가 자동 적용됩니다.</div>
            <label>스타일</label>
            <div className="image-align-buttons">{styles.map(([id, label]) => <button key={id} className={style === id ? "active" : ""} onClick={() => setStyle(id)}>{label}</button>)}</div>
            <label>분위기</label>
            <div className="image-align-buttons">{moods.map(([id, label]) => <button key={id} className={mood === id ? "active" : ""} onClick={() => setMood(id)}>{label}</button>)}</div>
            <label>어떤 장면을 만들까요?</label>
            <textarea value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="예: 청년부 여름수련회, 푸른 바다와 햇살, 한국인 청년들이 멀리서 함께 걷는 모습, 제목이 들어갈 넓은 하늘 여백" />
            <label>이미지 비율</label>
            <select value={size} onChange={(event) => setSize(event.target.value)}><option value="1024x1024">정사각형 1:1</option><option value="1024x1536">세로형</option><option value="1536x1024">가로형</option></select>
            <button className="button button-primary wide" onClick={generateImage} disabled={imageLoading}>{imageLoading ? "고품질 이미지 생성 중…" : "고품질 배경 생성"}</button>
            <div className="image-v3-divider" />
            <div className="notice"><strong>2. 정확한 문구 올리기</strong><br/>입력한 문구를 사이트가 직접 합성하므로 한글이 깨지지 않습니다.</div>
            <label>제목<input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="예: 다시, 뜨겁게" /></label>
            <label>부제<input value={subtitle} onChange={(e) => setSubtitle(e.target.value)} placeholder="예: 2026 청년부 여름수련회" /></label>
            <label>글자 정렬</label>
            <div className="image-align-buttons"><button className={align === "center" ? "active" : ""} onClick={() => setAlign("center")}>가운데</button><button className={align === "left" ? "active" : ""} onClick={() => setAlign("left")}>왼쪽</button></div>
            {error && <div className="notice error"><strong>생성 실패</strong><br />{error}</div>}
          </section>

          <section className="image-result-card">
            <div className="result-toolbar"><strong>실시간 미리보기</strong><div>{imageUrl && <><button onClick={generateImage}>다시 만들기</button><button onClick={downloadComposed}>완성 이미지 저장</button></>}</div></div>
            {imageLoading ? <div className="result-paper">고품질 이미지 생성은 보통 1~3분 정도 걸릴 수 있습니다.</div> : imageUrl ? <div className={`image-v3-preview ${align}`} ref={previewRef}><img src={imageUrl} alt="생성된 배경" /><div className="image-v3-overlay"><strong>{title}</strong><span>{subtitle}</span></div></div> : <div className="result-paper">왼쪽에서 스타일과 분위기를 고른 뒤 배경을 생성해 주세요. 제목과 부제는 생성 후에도 자유롭게 수정할 수 있습니다.</div>}
          </section>
        </div>
      </section>
    </main>
  );
}
