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

type Layer = { x: number; y: number; size: number; color: string; align: "left" | "center"; font: string; shadow: boolean; box: boolean };
type DragTarget = "title" | "subtitle" | null;

function inferCopy(value: string, typeTitle: string) {
  const cleaned = value.replace(/\s+/g, " ").trim();
  const quoted = cleaned.match(/[‘'“\"]([^’'”\"]{2,30})[’'”\"]/);
  const firstPart = cleaned.split(/[,/|\n]/)[0]?.trim() || cleaned;
  const title = quoted?.[1]?.trim() || firstPart.slice(0, 24) || "함께 준비하는 사역";
  const subtitle = cleaned.length > title.length ? cleaned.replace(title, "").replace(/^[\s,/:|-]+/, "").slice(0, 42) : `목회파트너 ${typeTitle}`;
  return { title, subtitle };
}

const presets = [
  { name: "하단 임팩트", title: { x: 50, y: 70, align: "center" as const }, subtitle: { x: 50, y: 80, align: "center" as const } },
  { name: "왼쪽 포스터", title: { x: 9, y: 22, align: "left" as const }, subtitle: { x: 9, y: 34, align: "left" as const } },
  { name: "중앙 타이틀", title: { x: 50, y: 44, align: "center" as const }, subtitle: { x: 50, y: 56, align: "center" as const } },
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
  const [titleLayer, setTitleLayer] = useState<Layer>({ x: 50, y: 70, size: 76, color: "#ffffff", align: "center", font: "system", shadow: true, box: false });
  const [subtitleLayer, setSubtitleLayer] = useState<Layer>({ x: 50, y: 80, size: 30, color: "#ffffff", align: "center", font: "system", shadow: true, box: false });

  useEffect(() => {
    const request = new URLSearchParams(window.location.search).get("request");
    if (request) { setTopic(request); const copy = inferCopy(request, types[0].title); setTitle(copy.title); setSubtitle(copy.subtitle); }
  }, []);

  async function generateImage(forceQuality?: "medium" | "high") {
    if (!topic.trim()) return setError("만들 이미지의 내용과 분위기를 설명해 주세요.");
    const selectedType = types.find((item) => item.id === type) ?? types[0];
    const copy = inferCopy(topic, selectedType.title);
    if (!title.trim()) setTitle(copy.title);
    if (!subtitle.trim()) setSubtitle(copy.subtitle);
    setImageLoading(true); setError(""); setImageUrl("");
    try {
      const response = await fetch("/api/generate-image", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ prompt: topic.trim(), size, type, style, mood, quality: forceQuality ?? quality }) });
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
  function applyPreset(index: number) {
    const preset = presets[index];
    setTitleLayer((v) => ({ ...v, ...preset.title }));
    setSubtitleLayer((v) => ({ ...v, ...preset.subtitle }));
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
        ctx.textAlign = layer.align; ctx.textBaseline = "middle";
        ctx.font = `${weight} ${Math.round(width * layer.size / 1024)}px ${family}`;
        const metrics = ctx.measureText(text); const pad = width * .018;
        if (layer.box) { ctx.fillStyle = "rgba(0,0,0,.45)"; ctx.fillRect(layer.align === "center" ? x - metrics.width / 2 - pad : x - pad, y - Number(layer.size) * .65, metrics.width + pad * 2, Number(layer.size) * 1.3); }
        ctx.fillStyle = layer.color;
        ctx.shadowColor = layer.shadow ? "rgba(0,0,0,.7)" : "transparent"; ctx.shadowBlur = layer.shadow ? Math.round(width * .014) : 0;
        ctx.fillText(text, x, y, width * .9);
      };
      drawLayer(title, titleLayer, 800); drawLayer(subtitle, subtitleLayer, 600);
      const link = document.createElement("a"); link.download = "ministry-partner-design.png"; link.href = canvas.toDataURL("image/png"); link.click();
    };
    image.src = imageUrl;
  }

  const activeLayer = selected === "title" ? titleLayer : subtitleLayer;
  const setActiveLayer = (next: Partial<Layer>) => selected === "title" ? setTitleLayer((v) => ({ ...v, ...next })) : setSubtitleLayer((v) => ({ ...v, ...next }));
  const fontFamily = (layer: Layer) => fonts.find(([id]) => id === layer.font)?.[2] ?? fonts[0][2];

  return (
    <main className="v2-shell"><V2Sidebar /><section className="v2-main">
      <div className="v2-page-head"><div><div className="eyebrow">AI DESIGN STUDIO</div><h1>이미지 디자인 스튜디오</h1><p>AI가 시안을 만들고, 문구는 화면에서 직접 움직이며 완성하세요.</p></div></div>
      <div className="image-type-tabs">{types.map((item) => <button key={item.id} onClick={() => setType(item.id)} className={type === item.id ? "active" : ""}><span>{item.icon}</span><strong>{item.title}</strong></button>)}</div>
      <div className="image-studio-grid image-v3-grid image-editor-grid">
        <section className="image-input-card">
          <div className="notice"><strong>한 번에 디자인 시작</strong><br/>장면과 제목을 적으면 배경과 문구 시안이 함께 만들어집니다.</div>
          <label>스타일</label><div className="image-align-buttons">{styles.map(([id, label]) => <button key={id} className={style === id ? "active" : ""} onClick={() => setStyle(id)}>{label}</button>)}</div>
          <label>분위기</label><div className="image-align-buttons">{moods.map(([id, label]) => <button key={id} className={mood === id ? "active" : ""} onClick={() => setMood(id)}>{label}</button>)}</div>
          <label>만들 내용을 적어 주세요</label><textarea value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="예: 청년부 여름수련회 포스터, 푸른 바다와 햇살, 제목 ‘다시, 뜨겁게’, 부제 2026 청년부 여름수련회" />
          <div className="image-compact-row"><label>생성 품질<select value={quality} onChange={(e) => setQuality(e.target.value as "medium" | "high")}><option value="medium">빠른 생성</option><option value="high">최고 품질</option></select></label><label>비율<select value={size} onChange={(e) => setSize(e.target.value)}><option value="1024x1024">1:1</option><option value="1024x1536">세로</option><option value="1536x1024">가로</option></select></label></div>
          <button className="button button-primary wide" onClick={() => generateImage()} disabled={imageLoading}>{imageLoading ? "디자인 생성 중…" : "AI 디자인 만들기"}</button>
          <div className="image-v3-divider" />
          <label>제목<input value={title} onFocus={() => setSelected("title")} onChange={(e) => setTitle(e.target.value)} /></label>
          <label>부제<input value={subtitle} onFocus={() => setSelected("subtitle")} onChange={(e) => setSubtitle(e.target.value)} /></label>
          <label>자동 배치</label><div className="design-preset-row">{presets.map((preset, i) => <button key={preset.name} onClick={() => applyPreset(i)}>{preset.name}</button>)}</div>
          <div className="design-layer-tabs"><button className={selected === "title" ? "active" : ""} onClick={() => setSelected("title")}>제목 편집</button><button className={selected === "subtitle" ? "active" : ""} onClick={() => setSelected("subtitle")}>부제 편집</button></div>
          <label>크기 <span>{activeLayer.size}</span><input type="range" min="16" max="120" value={activeLayer.size} onChange={(e) => setActiveLayer({ size: Number(e.target.value) })} /></label>
          <div className="image-compact-row"><label>글꼴<select value={activeLayer.font} onChange={(e) => setActiveLayer({ font: e.target.value })}>{fonts.map(([id, label]) => <option key={id} value={id}>{label}</option>)}</select></label><label>색상<input type="color" value={activeLayer.color} onChange={(e) => setActiveLayer({ color: e.target.value })} /></label></div>
          <div className="design-toggle-row"><button className={activeLayer.shadow ? "active" : ""} onClick={() => setActiveLayer({ shadow: !activeLayer.shadow })}>그림자</button><button className={activeLayer.box ? "active" : ""} onClick={() => setActiveLayer({ box: !activeLayer.box })}>배경 박스</button><button onClick={() => setActiveLayer({ align: activeLayer.align === "center" ? "left" : "center" })}>{activeLayer.align === "center" ? "가운데 정렬" : "왼쪽 정렬"}</button></div>
          {error && <div className="notice error"><strong>생성 실패</strong><br />{error}</div>}
        </section>
        <section className="image-result-card">
          <div className="result-toolbar"><strong>직접 편집</strong><div>{imageUrl && <><button onClick={() => generateImage("high")}>배경 다시</button><button onClick={downloadComposed}>완성 이미지 저장</button></>}</div></div>
          {imageLoading ? <div className="result-paper">AI가 배경과 문구 시안을 만들고 있습니다.</div> : imageUrl ? <>
            <div className="design-help">문구를 손가락이나 마우스로 끌어 원하는 위치에 놓으세요.</div>
            <div className="image-v3-preview design-canvas" ref={previewRef} onPointerMove={moveDrag} onPointerUp={endDrag} onPointerCancel={endDrag}>
              <img src={imageUrl} alt="생성된 배경" />
              <div className={`design-text-layer ${selected === "title" ? "selected" : ""} ${titleLayer.box ? "has-box" : ""}`} onPointerDown={(e) => startDrag(e, "title")} style={{ left: `${titleLayer.x}%`, top: `${titleLayer.y}%`, color: titleLayer.color, fontSize: `${titleLayer.size / 10}vw`, fontFamily: fontFamily(titleLayer), textAlign: titleLayer.align, transform: `translate(${titleLayer.align === "center" ? "-50%" : "0"}, -50%)`, textShadow: titleLayer.shadow ? "0 3px 16px rgba(0,0,0,.72)" : "none" }}><strong>{title}</strong></div>
              <div className={`design-text-layer subtitle ${selected === "subtitle" ? "selected" : ""} ${subtitleLayer.box ? "has-box" : ""}`} onPointerDown={(e) => startDrag(e, "subtitle")} style={{ left: `${subtitleLayer.x}%`, top: `${subtitleLayer.y}%`, color: subtitleLayer.color, fontSize: `${subtitleLayer.size / 10}vw`, fontFamily: fontFamily(subtitleLayer), textAlign: subtitleLayer.align, transform: `translate(${subtitleLayer.align === "center" ? "-50%" : "0"}, -50%)`, textShadow: subtitleLayer.shadow ? "0 3px 16px rgba(0,0,0,.72)" : "none" }}><span>{subtitle}</span></div>
            </div>
          </> : <div className="result-paper">내용을 입력하고 ‘AI 디자인 만들기’를 누르면 편집 가능한 시안이 나타납니다.</div>}
        </section>
      </div>
    </section></main>
  );
}
