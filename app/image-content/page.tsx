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

function inferCopy(value: string, typeTitle: string) {
  const cleaned = value.replace(/\s+/g, " ").trim();
  const quoted = cleaned.match(/[‘'“\"]([^’'”\"]{2,30})[’'”\"]/);
  const firstPart = cleaned.split(/[,/|\n]/)[0]?.trim() || cleaned;
  const title = quoted?.[1]?.trim() || firstPart.slice(0, 24) || "함께 준비하는 사역";
  const subtitle = cleaned.length > title.length
    ? cleaned.replace(title, "").replace(/^[\s,/:|-]+/, "").slice(0, 42)
    : `목회파트너 ${typeTitle}`;
  return { title, subtitle };
}

export default function ImageContentPage() {
  const previewRef = useRef<HTMLDivElement>(null);
  const [type, setType] = useState("card");
  const [style, setStyle] = useState("photo");
  const [mood, setMood] = useState("premium");
  const [quality, setQuality] = useState<"medium" | "high">("medium");
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
    if (request) {
      setTopic(request);
      const selected = types.find((item) => item.id === type) ?? types[0];
      const copy = inferCopy(request, selected.title);
      setTitle(copy.title);
      setSubtitle(copy.subtitle);
    }
  }, [type]);

  async function generateImage(forceQuality?: "medium" | "high") {
    if (!topic.trim()) return setError("만들 이미지의 내용과 분위기를 설명해 주세요.");
    const selected = types.find((item) => item.id === type) ?? types[0];
    const copy = inferCopy(topic, selected.title);
    if (!title.trim()) setTitle(copy.title);
    if (!subtitle.trim()) setSubtitle(copy.subtitle);

    const requestedQuality = forceQuality ?? quality;
    setImageLoading(true); setError(""); setImageUrl("");
    try {
      const response = await fetch("/api/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: topic.trim(), size, type, style, mood, quality: requestedQuality }),
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
      ctx.shadowColor = "rgba(0,0,0,.65)";
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
        <div className="v2-page-head"><div><div className="eyebrow">IMAGE STUDIO</div><h1>이미지 스튜디오</h1><p>내용을 한 번 입력하면 이미지와 한글 문구가 함께 완성됩니다.</p></div></div>
        <div className="image-type-tabs">{types.map((item) => <button key={item.id} onClick={() => setType(item.id)} className={type === item.id ? "active" : ""}><span>{item.icon}</span><strong>{item.title}</strong></button>)}</div>
        <div className="image-studio-grid image-v3-grid">
          <section className="image-input-card">
            <div className="notice"><strong>한 번에 완성하기</strong><br/>장면과 넣을 문구를 함께 적으면 사이트가 제목을 뽑아 이미지 위에 정확하게 합성합니다.</div>
            <label>스타일</label>
            <div className="image-align-buttons">{styles.map(([id, label]) => <button key={id} className={style === id ? "active" : ""} onClick={() => setStyle(id)}>{label}</button>)}</div>
            <label>분위기</label>
            <div className="image-align-buttons">{moods.map(([id, label]) => <button key={id} className={mood === id ? "active" : ""} onClick={() => setMood(id)}>{label}</button>)}</div>
            <label>만들 내용을 한 번에 적어 주세요</label>
            <textarea value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="예: 청년부 여름수련회 포스터, 푸른 바다와 햇살, 한국인 청년들이 함께 걷는 모습, 제목 ‘다시, 뜨겁게’, 부제 2026 청년부 여름수련회" />
            <label>생성 속도</label>
            <div className="image-align-buttons"><button className={quality === "medium" ? "active" : ""} onClick={() => setQuality("medium")}>빠른 생성</button><button className={quality === "high" ? "active" : ""} onClick={() => setQuality("high")}>최고 품질</button></div>
            <label>이미지 비율</label>
            <select value={size} onChange={(event) => setSize(event.target.value)}><option value="1024x1024">정사각형 1:1</option><option value="1024x1536">세로형</option><option value="1536x1024">가로형</option></select>
            <button className="button button-primary wide" onClick={() => generateImage()} disabled={imageLoading}>{imageLoading ? "이미지와 문구를 함께 만드는 중…" : "이미지 한 번에 만들기"}</button>
            <div className="image-v3-divider" />
            <details>
              <summary><strong>문구를 직접 수정하기</strong></summary>
              <label>제목<input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="자동으로 채워집니다" /></label>
              <label>부제<input value={subtitle} onChange={(e) => setSubtitle(e.target.value)} placeholder="자동으로 채워집니다" /></label>
              <label>글자 정렬</label>
              <div className="image-align-buttons"><button className={align === "center" ? "active" : ""} onClick={() => setAlign("center")}>가운데</button><button className={align === "left" ? "active" : ""} onClick={() => setAlign("left")}>왼쪽</button></div>
            </details>
            {error && <div className="notice error"><strong>생성 실패</strong><br />{error}</div>}
          </section>

          <section className="image-result-card">
            <div className="result-toolbar"><strong>완성 결과</strong><div>{imageUrl && <><button onClick={() => generateImage("high")}>최고 품질로 다시</button><button onClick={downloadComposed}>완성 이미지 저장</button></>}</div></div>
            {imageLoading ? <div className="result-paper">{quality === "high" ? "최고 품질 이미지를 만드는 중입니다. 잠시만 기다려 주세요." : "빠른 이미지와 한글 문구를 함께 만드는 중입니다."}</div> : imageUrl ? <div className={`image-v3-preview ${align}`} ref={previewRef}><img src={imageUrl} alt="생성된 배경" /><div className="image-v3-overlay"><strong>{title}</strong><span>{subtitle}</span></div></div> : <div className="result-paper">내용을 한 번만 입력하고 ‘이미지 한 번에 만들기’를 누르세요. 제목과 부제가 자동으로 올라간 완성 결과가 나타납니다.</div>}
          </section>
        </div>
      </section>
    </main>
  );
}
