"use client";

import { PointerEvent, useEffect, useRef, useState } from "react";
import V2Sidebar from "../components/V2Sidebar";

const types = [
  { id: "card", icon: "▦", title: "카드뉴스" },
  { id: "feed", icon: "▣", title: "인스타 이미지" },
  { id: "thumbnail", icon: "▶", title: "썸네일" },
  { id: "poster", icon: "◇", title: "포스터" },
  { id: "banner", icon: "▬", title: "배너" },
];
const styles = [["photo", "실사"], ["cinematic", "시네마틱"], ["minimal", "미니멀"], ["illustration", "일러스트"], ["watercolor", "수채화"], ["threeD", "3D"]];
const moods = [["premium", "고급스럽게"], ["bright", "밝고 희망차게"], ["warm", "따뜻하게"], ["holy", "경건하고 평안하게"], ["dynamic", "역동적으로"]];
const fonts = [
  ["system", "기본 고딕", "Arial, 'Apple SD Gothic Neo', sans-serif"],
  ["serif", "명조", "Georgia, 'AppleMyungjo', serif"],
  ["rounded", "둥근 고딕", "'Arial Rounded MT Bold', Arial, sans-serif"],
];

type Layer = { x: number; y: number; size: number; color: string; align: "left" | "center"; font: string; shadow: boolean; box: boolean; outline: boolean; spacing: number; rotate: number };
type DragTarget = "title" | "subtitle" | null;

type DesignRecipe = {
  name: string;
  description: string;
  title: Partial<Layer>;
  subtitle: Partial<Layer>;
};

function inferCopy(value: string, typeTitle: string) {
  const cleaned = value.replace(/\s+/g, " ").trim();
  const quoted = cleaned.match(/[‘'“\"]([^’'”\"]{2,30})[’'”\"]/);
  const firstPart = cleaned.split(/[,/|\n]/)[0]?.trim() || cleaned;
  const title = quoted?.[1]?.trim() || firstPart.slice(0, 24) || "함께 준비하는 사역";
  const subtitle = cleaned.length > title.length ? cleaned.replace(title, "").replace(/^[\s,/:|-]+/, "").slice(0, 42) : `목회파트너 ${typeTitle}`;
  return { title, subtitle };
}

const recipes: DesignRecipe[] = [
  { name: "미니멀", description: "여백이 넓고 단정한 구성", title: { x: 9, y: 22, align: "left", size: 72, font: "system", shadow: false, box: false, outline: false, spacing: -1 }, subtitle: { x: 9, y: 34, align: "left", size: 27, shadow: false, box: false, outline: false, spacing: 0 } },
  { name: "감성", description: "명조와 중앙 여백 중심", title: { x: 50, y: 43, align: "center", size: 68, font: "serif", shadow: true, box: false, outline: false, spacing: 1 }, subtitle: { x: 50, y: 55, align: "center", size: 26, font: "serif", shadow: true, box: false, outline: false, spacing: 2 } },
  { name: "프리미엄", description: "절제된 하단 포스터 구성", title: { x: 50, y: 68, align: "center", size: 78, font: "serif", shadow: true, box: false, outline: false, spacing: 0 }, subtitle: { x: 50, y: 79, align: "center", size: 27, font: "system", shadow: true, box: false, outline: false, spacing: 2 } },
  { name: "강한 썸네일", description: "큰 제목과 외곽선 강조", title: { x: 50, y: 58, align: "center", size: 94, font: "system", shadow: true, box: false, outline: true, spacing: -2 }, subtitle: { x: 50, y: 75, align: "center", size: 30, font: "system", shadow: true, box: true, outline: false, spacing: 0 } },
  { name: "교회 포스터", description: "경건하고 안정적인 중앙 구성", title: { x: 50, y: 37, align: "center", size: 73, font: "serif", shadow: true, box: false, outline: false, spacing: 1 }, subtitle: { x: 50, y: 51, align: "center", size: 28, font: "system", shadow: true, box: true, outline: false, spacing: 1 } },
  { name: "젊은 인스타", description: "비대칭과 둥근 글꼴 구성", title: { x: 10, y: 65, align: "left", size: 82, font: "rounded", shadow: true, box: false, outline: true, spacing: -2, rotate: -2 }, subtitle: { x: 10, y: 79, align: "left", size: 28, font: "system", shadow: true, box: true, outline: false, spacing: 0, rotate: 0 } },
];

const formats = [
  { label: "인스타", size: "1024x1024" },
  { label: "릴스", size: "1024x1536" },
  { label: "유튜브", size: "1536x1024" },
  { label: "카톡", size: "1024x1024" },
  { label: "주보", size: "1024x1536" },
];

export default function ImageContentPage() {
  const previewRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{ target: DragTarget; offsetX: number; offsetY: number }>({ target: null, offsetX: 0, offsetY: 0 });
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
  const [selected, setSelected] = useState<"title" | "subtitle">("title");
  const [titleLayer, setTitleLayer] = useState<Layer>({ x: 50, y: 70, size: 76, color: "#ffffff", align: "center", font: "system", shadow: true, box: false, outline: false, spacing: -1, rotate: 0 });
  const [subtitleLayer, setSubtitleLayer] = useState<Layer>({ x: 50, y: 80, size: 30, color: "#ffffff", align: "center", font: "system", shadow: true, box: false, outline: false, spacing: 0, rotate: 0 });

  useEffect(() => {
    const request = new URLSearchParams(window.location.search).get("request");
    if (request) { setTopic(request); const copy = inferCopy(request, types[0].title); setTitle(copy.title); setSubtitle(copy.subtitle); }
  }, []);

  async function generateImage(forceQuality?: "medium" | "high", overrideSize?: string) {
    if (!topic.trim()) return setError("만들 이미지의 내용과 분위기를 설명해 주세요.");
    const selectedType = types.find((item) => item.id === type) ?? types[0];
    const copy = inferCopy(topic, selectedType.title);
    if (!title.trim()) setTitle(copy.title);
    if (!subtitle.trim()) setSubtitle(copy.subtitle);
    const nextSize = overrideSize ?? size;
    if (overrideSize) setSize(overrideSize);
    setImageLoading(true); setError(""); setImageUrl("");
    try {
      const response = await fetch("/api/generate-image", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ prompt: topic.trim(), size: nextSize, type, style, mood, quality: forceQuality ?? quality }) });
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.error || "이미지 생성에 실패했습니다.");
      setImageUrl(data.imageUrl);
    } catch (err) { setError(err instanceof Error ? err.message : "이미지 생성 중 오류가 발생했습니다."); }
    finally { setImageLoading(false); }
  }

  function startDrag(event: PointerEvent<HTMLDivElement>, target: "title" | "subtitle") {
    const rect = previewRef.current?.getBoundingClientRect();
    if (!rect) return;
    const layer = target === "title" ? titleLayer : subtitleLayer;
    dragRef.current = { target, offsetX: event.clientX - (rect.left + rect.width * layer.x / 100), offsetY: event.clientY - (rect.top + rect.height * layer.y / 100) };
    setSelected(target); event.currentTarget.setPointerCapture(event.pointerId);
  }

  function moveDrag(event: PointerEvent<HTMLDivElement>) {
    const rect = previewRef.current?.getBoundingClientRect();
    const target = dragRef.current.target;
    if (!rect || !target) return;
    const x = Math.max(4, Math.min(96, ((event.clientX - rect.left - dragRef.current.offsetX) / rect.width) * 100));
    const y = Math.max(5, Math.min(94, ((event.clientY - rect.top - dragRef.current.offsetY) / rect.height) * 100));
    const update = (current: Layer) => ({ ...current, x, y });
    target === "title" ? setTitleLayer(update) : setSubtitleLayer(update);
  }

  function endDrag() { dragRef.current.target = null; }
  function applyRecipe(recipe: DesignRecipe) {
    setTitleLayer((value) => ({ ...value, ...recipe.title }));
    setSubtitleLayer((value) => ({ ...value, ...recipe.subtitle }));
  }

  async function downloadComposed() {
    if (!imageUrl) return;
    const [width, height] = size.split("x").map(Number);
    const canvas = document.createElement("canvas"); canvas.width = width; canvas.height = height;
    const ctx = canvas.getContext("2d"); if (!ctx) return;
    const image = new Image(); image.crossOrigin = "anonymous";
    image.onload = () => {
      ctx.drawImage(image, 0, 0, width, height);
      const drawLayer = (text: string, layer: Layer, weight: number) => {
        if (!text) return;
        const x = width * layer.x / 100, y = height * layer.y / 100;
        const family = fonts.find(([id]) => id === layer.font)?.[2] ?? fonts[0][2];
        const fontSize = Math.round(width * layer.size / 1024);
        ctx.save(); ctx.translate(x, y); ctx.rotate(layer.rotate * Math.PI / 180);
        ctx.textAlign = layer.align; ctx.textBaseline = "middle";
        ctx.font = `${weight} ${fontSize}px ${family}`;
        (ctx as CanvasRenderingContext2D & { letterSpacing?: string }).letterSpacing = `${layer.spacing}px`;
        const metrics = ctx.measureText(text); const pad = width * .018;
        if (layer.box) { ctx.fillStyle = "rgba(0,0,0,.45)"; ctx.fillRect(layer.align === "center" ? -metrics.width / 2 - pad : -pad, -fontSize * .65, metrics.width + pad * 2, fontSize * 1.3); }
        ctx.fillStyle = layer.color;
        ctx.shadowColor = layer.shadow ? "rgba(0,0,0,.7)" : "transparent"; ctx.shadowBlur = layer.shadow ? Math.round(width * .014) : 0;
        if (layer.outline) { ctx.lineWidth = Math.max(3, fontSize * .08); ctx.strokeStyle = "rgba(0,0,0,.82)"; ctx.strokeText(text, 0, 0, width * .9); }
        ctx.fillText(text, 0, 0, width * .9); ctx.restore();
      };
      drawLayer(title, titleLayer, 800); drawLayer(subtitle, subtitleLayer, 600);
      const link = document.createElement("a"); link.download = "ministry-partner-design.png"; link.href = canvas.toDataURL("image/png"); link.click();
    };
    image.src = imageUrl;
  }

  const activeLayer = selected === "title" ? titleLayer : subtitleLayer;
  const setActiveLayer = (next: Partial<Layer>) => selected === "title" ? setTitleLayer((value) => ({ ...value, ...next })) : setSubtitleLayer((value) => ({ ...value, ...next }));
  const fontFamily = (layer: Layer) => fonts.find(([id]) => id === layer.font)?.[2] ?? fonts[0][2];

  return (
    <main className="v2-shell"><V2Sidebar /><section className="v2-main">
      <div className="v2-page-head"><div><div className="eyebrow">AI CONTENT STUDIO</div><h1>AI 콘텐츠 스튜디오</h1><p>AI가 디자인을 먼저 제안하고, 필요한 부분만 직접 손보세요.</p></div></div>
      <div className="image-type-tabs">{types.map((item) => <button key={item.id} onClick={() => setType(item.id)} className={type === item.id ? "active" : ""}><span>{item.icon}</span><strong>{item.title}</strong></button>)}</div>
      <div className="image-studio-grid image-v3-grid image-editor-grid">
        <section className="image-input-card">
          <div className="notice"><strong>한 번에 디자인 시작</strong><br/>장면과 제목을 적으면 배경과 문구 시안이 함께 만들어집니다.</div>
          <label>스타일</label><div className="image-align-buttons">{styles.map(([id, label]) => <button key={id} className={style === id ? "active" : ""} onClick={() => setStyle(id)}>{label}</button>)}</div>
          <label>분위기</label><div className="image-align-buttons">{moods.map(([id, label]) => <button key={id} className={mood === id ? "active" : ""} onClick={() => setMood(id)}>{label}</button>)}</div>
          <label>만들 내용을 적어 주세요</label><textarea value={topic} onChange={(event) => setTopic(event.target.value)} placeholder="예: 청년부 여름수련회 포스터, 푸른 바다와 햇살, 제목 ‘다시, 뜨겁게’, 부제 2026 청년부 여름수련회" />
          <div className="image-compact-row"><label>생성 품질<select value={quality} onChange={(event) => setQuality(event.target.value as "medium" | "high")}><option value="medium">빠른 생성</option><option value="high">최고 품질</option></select></label><label>비율<select value={size} onChange={(event) => setSize(event.target.value)}><option value="1024x1024">1:1</option><option value="1024x1536">세로</option><option value="1536x1024">가로</option></select></label></div>
          <button className="button button-primary wide" onClick={() => generateImage()} disabled={imageLoading}>{imageLoading ? "디자인 생성 중…" : "AI 디자인 만들기"}</button>
          <div className="image-v3-divider" />
          <label>AI 추천 디자인</label><div className="ai-recipe-grid">{recipes.map((recipe) => <button key={recipe.name} onClick={() => applyRecipe(recipe)}><strong>{recipe.name}</strong><span>{recipe.description}</span></button>)}</div>
          <label>제목<input value={title} onFocus={() => setSelected("title")} onChange={(event) => setTitle(event.target.value)} /></label>
          <label>부제<input value={subtitle} onFocus={() => setSelected("subtitle")} onChange={(event) => setSubtitle(event.target.value)} /></label>
          <div className="design-layer-tabs"><button className={selected === "title" ? "active" : ""} onClick={() => setSelected("title")}>제목 편집</button><button className={selected === "subtitle" ? "active" : ""} onClick={() => setSelected("subtitle")}>부제 편집</button></div>
          <label>크기 <span>{activeLayer.size}</span><input type="range" min="16" max="120" value={activeLayer.size} onChange={(event) => setActiveLayer({ size: Number(event.target.value) })} /></label>
          <div className="image-compact-row"><label>글꼴<select value={activeLayer.font} onChange={(event) => setActiveLayer({ font: event.target.value })}>{fonts.map(([id, label]) => <option key={id} value={id}>{label}</option>)}</select></label><label>색상<input type="color" value={activeLayer.color} onChange={(event) => setActiveLayer({ color: event.target.value })} /></label></div>
          <label>자간 <span>{activeLayer.spacing}</span><input type="range" min="-4" max="8" value={activeLayer.spacing} onChange={(event) => setActiveLayer({ spacing: Number(event.target.value) })} /></label>
          <label>회전 <span>{activeLayer.rotate}°</span><input type="range" min="-12" max="12" value={activeLayer.rotate} onChange={(event) => setActiveLayer({ rotate: Number(event.target.value) })} /></label>
          <div className="design-toggle-row"><button className={activeLayer.shadow ? "active" : ""} onClick={() => setActiveLayer({ shadow: !activeLayer.shadow })}>그림자</button><button className={activeLayer.outline ? "active" : ""} onClick={() => setActiveLayer({ outline: !activeLayer.outline })}>외곽선</button><button className={activeLayer.box ? "active" : ""} onClick={() => setActiveLayer({ box: !activeLayer.box })}>배경 박스</button><button onClick={() => setActiveLayer({ align: activeLayer.align === "center" ? "left" : "center" })}>{activeLayer.align === "center" ? "가운데" : "왼쪽"}</button></div>
          {imageUrl && <><div className="image-v3-divider" /><label>다른 크기로 자동 변환</label><div className="format-convert-row">{formats.map((format) => <button key={format.label} onClick={() => generateImage(undefined, format.size)} disabled={imageLoading}>{format.label}</button>)}</div></>}
          {error && <div className="notice error"><strong>생성 실패</strong><br />{error}</div>}
        </section>
        <section className="image-result-card">
          <div className="result-toolbar"><strong>직접 편집</strong><div>{imageUrl && <><button onClick={() => generateImage("high")}>배경 다시</button><button onClick={downloadComposed}>완성 이미지 저장</button></>}</div></div>
          {imageLoading ? <div className="result-paper">AI가 배경과 문구 시안을 만들고 있습니다.</div> : imageUrl ? <>
            <div className="design-help">문구를 손가락이나 마우스로 끌어 원하는 위치에 놓으세요.</div>
            <div className="image-v3-preview design-canvas" ref={previewRef} onPointerMove={moveDrag} onPointerUp={endDrag} onPointerCancel={endDrag}>
              <img src={imageUrl} alt="생성된 배경" />
              <div className={`design-text-layer ${selected === "title" ? "selected" : ""} ${titleLayer.box ? "has-box" : ""} ${titleLayer.outline ? "has-outline" : ""}`} onPointerDown={(event) => startDrag(event, "title")} style={{ left: `${titleLayer.x}%`, top: `${titleLayer.y}%`, color: titleLayer.color, fontSize: `${titleLayer.size / 10}vw`, fontFamily: fontFamily(titleLayer), textAlign: titleLayer.align, letterSpacing: `${titleLayer.spacing}px`, transform: `translate(${titleLayer.align === "center" ? "-50%" : "0"}, -50%) rotate(${titleLayer.rotate}deg)`, textShadow: titleLayer.shadow ? "0 3px 16px rgba(0,0,0,.72)" : "none" }}><strong>{title}</strong></div>
              <div className={`design-text-layer subtitle ${selected === "subtitle" ? "selected" : ""} ${subtitleLayer.box ? "has-box" : ""} ${subtitleLayer.outline ? "has-outline" : ""}`} onPointerDown={(event) => startDrag(event, "subtitle")} style={{ left: `${subtitleLayer.x}%`, top: `${subtitleLayer.y}%`, color: subtitleLayer.color, fontSize: `${subtitleLayer.size / 10}vw`, fontFamily: fontFamily(subtitleLayer), textAlign: subtitleLayer.align, letterSpacing: `${subtitleLayer.spacing}px`, transform: `translate(${subtitleLayer.align === "center" ? "-50%" : "0"}, -50%) rotate(${subtitleLayer.rotate}deg)`, textShadow: subtitleLayer.shadow ? "0 3px 16px rgba(0,0,0,.72)" : "none" }}><span>{subtitle}</span></div>
            </div>
          </> : <div className="result-paper">내용을 입력하고 ‘AI 디자인 만들기’를 누르면 편집 가능한 시안이 나타납니다.</div>}
        </section>
      </div>
    </section></main>
  );
}
