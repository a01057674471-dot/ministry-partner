"use client";

import { ChangeEvent, PointerEvent, useEffect, useRef, useState } from "react";
import V2Sidebar from "../components/V2Sidebar";

type Layer = {
  x: number;
  y: number;
  size: number;
  color: string;
  font: string;
  weight: number;
  shadow: boolean;
  outline: boolean;
  align: "left" | "center";
};

type Target = "title" | "subtitle";

const fonts = [
  ["system", "깔끔한 고딕", "Arial, 'Apple SD Gothic Neo', sans-serif"],
  ["serif", "차분한 명조", "Georgia, 'AppleMyungjo', serif"],
  ["rounded", "둥근 고딕", "'Arial Rounded MT Bold', Arial, sans-serif"],
];

const baseTitle: Layer = { x: 50, y: 68, size: 76, color: "#ffffff", font: "system", weight: 800, shadow: true, outline: false, align: "center" };
const baseSub: Layer = { ...baseTitle, y: 80, size: 30, weight: 600 };

export default function ImageContentPage() {
  const previewRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<Target | null>(null);
  const resizeRef = useRef<{ target: Target; startX: number; startSize: number } | null>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const subtitleRef = useRef<HTMLDivElement>(null);

  const [panel, setPanel] = useState<"background" | "upload" | "text">("background");
  const [style, setStyle] = useState("photo");
  const [mood, setMood] = useState("holy");
  const [size, setSize] = useState("1024x1536");
  const [topic, setTopic] = useState("");
  const [title, setTitle] = useState("제목을 입력하세요");
  const [subtitle, setSubtitle] = useState("부제목을 입력하세요");
  const [imageUrl, setImageUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState<Target>("title");
  const [titleLayer, setTitleLayer] = useState<Layer>(baseTitle);
  const [subLayer, setSubLayer] = useState<Layer>(baseSub);

  useEffect(() => {
    const request = new URLSearchParams(location.search).get("request");
    if (request) setTopic(request);
  }, []);

  const active = selected === "title" ? titleLayer : subLayer;
  const update = (next: Partial<Layer>) => selected === "title"
    ? setTitleLayer((value) => ({ ...value, ...next }))
    : setSubLayer((value) => ({ ...value, ...next }));
  const fontFamily = (layer: Layer) => fonts.find((font) => font[0] === layer.font)?.[2] || fonts[0][2];

  function upload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) return setError("이미지 파일만 선택해 주세요.");
    const reader = new FileReader();
    reader.onload = () => {
      setImageUrl(String(reader.result));
      setError("");
      setPanel("text");
    };
    reader.readAsDataURL(file);
  }

  async function generate() {
    if (!topic.trim()) return setError("배경에 들어갈 장면과 분위기를 적어 주세요.");
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: topic, size, type: "poster", style, mood, quality: "medium" }),
      });
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.error || "생성에 실패했습니다.");
      setImageUrl(data.imageUrl);
      setPanel("text");
    } catch (event) {
      setError(event instanceof Error ? event.message : "생성 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  }

  function startDrag(event: PointerEvent<HTMLDivElement>, target: Target) {
    if ((event.target as HTMLElement).dataset.handle === "resize") return;
    dragRef.current = target;
    setSelected(target);
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function move(event: PointerEvent<HTMLDivElement>) {
    if (resizeRef.current) {
      const delta = event.clientX - resizeRef.current.startX;
      const next = Math.max(18, Math.min(140, resizeRef.current.startSize + delta / 3));
      if (resizeRef.current.target === "title") {
        setTitleLayer((value) => ({ ...value, size: next }));
      } else {
        setSubLayer((value) => ({ ...value, size: next }));
      }
      return;
    }
    if (!dragRef.current || !previewRef.current) return;
    const rect = previewRef.current.getBoundingClientRect();
    const x = Math.max(4, Math.min(96, ((event.clientX - rect.left) / rect.width) * 100));
    const y = Math.max(5, Math.min(95, ((event.clientY - rect.top) / rect.height) * 100));
    if (dragRef.current === "title") {
      setTitleLayer((value) => ({ ...value, x, y }));
    } else {
      setSubLayer((value) => ({ ...value, x, y }));
    }
  }

  function startResize(event: PointerEvent<HTMLButtonElement>, target: Target, currentSize: number) {
    event.stopPropagation();
    resizeRef.current = { target, startX: event.clientX, startSize: currentSize };
    setSelected(target);
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function end() {
    dragRef.current = null;
    resizeRef.current = null;
  }

  function focusText(target: Target) {
    setSelected(target);
    const node = target === "title" ? titleRef.current : subtitleRef.current;
    node?.focus();
    document.execCommand("selectAll", false);
  }

  async function save() {
    if (!imageUrl) return;
    const [width, height] = size.split("x").map(Number);
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext("2d");
    if (!context) return;
    const image = new Image();
    image.onload = () => {
      context.drawImage(image, 0, 0, width, height);
      const draw = (copy: string, layer: Layer) => {
        if (!copy) return;
        context.save();
        context.translate((width * layer.x) / 100, (height * layer.y) / 100);
        context.font = `${layer.weight} ${Math.round((width * layer.size) / 1024)}px ${fontFamily(layer)}`;
        context.textAlign = layer.align;
        context.textBaseline = "middle";
        context.fillStyle = layer.color;
        context.shadowColor = layer.shadow ? "rgba(0,0,0,.7)" : "transparent";
        context.shadowBlur = layer.shadow ? 16 : 0;
        if (layer.outline) {
          context.lineWidth = 8;
          context.strokeStyle = "#111";
          context.strokeText(copy, 0, 0, width * 0.9);
        }
        context.fillText(copy, 0, 0, width * 0.9);
        context.restore();
      };
      draw(title, titleLayer);
      draw(subtitle, subLayer);
      const anchor = document.createElement("a");
      anchor.download = "ministry-partner-design.png";
      anchor.href = canvas.toDataURL("image/png");
      anchor.click();
    };
    image.src = imageUrl;
  }

  const textLayer = (target: Target, copy: string, layer: Layer, ref: React.RefObject<HTMLDivElement | null>) => (
    <div
      ref={ref}
      className={`design-text-layer ${target === "subtitle" ? "subtitle" : ""} ${selected === target ? "selected" : ""} ${layer.outline ? "has-outline" : ""}`}
      contentEditable
      suppressContentEditableWarning
      spellCheck={false}
      onDoubleClick={() => focusText(target)}
      onFocus={() => setSelected(target)}
      onBlur={(event) => target === "title" ? setTitle(event.currentTarget.textContent || "") : setSubtitle(event.currentTarget.textContent || "")}
      onPointerDown={(event) => startDrag(event, target)}
      style={{
        left: `${layer.x}%`, top: `${layer.y}%`, color: layer.color,
        fontSize: `${layer.size / 10}vw`, fontFamily: fontFamily(layer), fontWeight: layer.weight,
        textAlign: layer.align, transform: `translate(${layer.align === "center" ? "-50%" : "0"},-50%)`,
        textShadow: layer.shadow ? "0 3px 16px rgba(0,0,0,.72)" : "none",
      }}
    >
      {copy}
      {selected === target && <button data-handle="resize" className="design-resize-handle" aria-label="글자 크기 조절" onPointerDown={(event) => startResize(event, target, layer.size)} />}
    </div>
  );

  return (
    <main className="v2-shell design-v2-shell">
      <V2Sidebar />
      <section className="v2-main">
        <div className="v2-page-head"><div><div className="eyebrow">DESIGN STUDIO</div><h1>디자인</h1><p>배경을 만들거나 사진을 올린 뒤, 화면에서 글자를 직접 수정하세요.</p></div></div>
        <div className="design-simple-tabs">
          <button className={panel === "background" ? "active" : ""} onClick={() => setPanel("background")}>배경 만들기</button>
          <button className={panel === "upload" ? "active" : ""} onClick={() => setPanel("upload")}>이미지 업로드</button>
          <button className={panel === "text" ? "active" : ""} onClick={() => setPanel("text")}>텍스트</button>
        </div>

        <div className="image-studio-grid image-editor-grid design-simple-grid">
          <section className="image-input-card">
            {panel === "background" && <>
              <div className="editor-step-label"><b>1</b>글자 없는 배경 만들기</div>
              <label>배경 설명<textarea value={topic} onChange={(event) => setTopic(event.target.value)} placeholder="예: 청년부 수련회, 푸른 바다와 햇살, 제목을 넣을 넓은 여백" /></label>
              <div className="image-compact-row">
                <label>스타일<select value={style} onChange={(event) => setStyle(event.target.value)}><option value="photo">실사</option><option value="cinematic">시네마틱</option><option value="minimal">미니멀</option><option value="illustration">일러스트</option><option value="watercolor">수채화</option></select></label>
                <label>분위기<select value={mood} onChange={(event) => setMood(event.target.value)}><option value="holy">경건하고 평안하게</option><option value="bright">밝고 희망차게</option><option value="warm">따뜻하게</option><option value="dynamic">역동적으로</option></select></label>
              </div>
              <label>크기<select value={size} onChange={(event) => setSize(event.target.value)}><option value="1024x1024">정사각형</option><option value="1024x1536">세로 포스터·릴스</option><option value="1536x1024">가로·유튜브</option></select></label>
              <button className="button button-primary wide" onClick={generate} disabled={loading}>{loading ? "배경 생성 중…" : "배경 만들기"}</button>
            </>}

            {panel === "upload" && <>
              <div className="editor-step-label"><b>2</b>내 이미지 열기</div>
              <label className="image-upload-box">사진 또는 교회 이미지 선택<input type="file" accept="image/*" onChange={upload} /></label>
              <p className="design-help">업로드한 이미지는 오른쪽 캔버스에서 바로 확인할 수 있습니다.</p>
            </>}

            {panel === "text" && <>
              <div className="editor-step-label"><b>3</b>선택한 글자 편집</div>
              <p className="design-help">오른쪽 글자를 더블클릭하면 그 자리에서 직접 수정할 수 있습니다.</p>
              <div className="design-layer-tabs"><button className={selected === "title" ? "active" : ""} onClick={() => setSelected("title")}>제목</button><button className={selected === "subtitle" ? "active" : ""} onClick={() => setSelected("subtitle")}>부제</button></div>
              <label>글꼴<select value={active.font} onChange={(event) => update({ font: event.target.value })}>{fonts.map((font) => <option key={font[0]} value={font[0]}>{font[1]}</option>)}</select></label>
              <div className="image-compact-row"><label>글자색<input type="color" value={active.color} onChange={(event) => update({ color: event.target.value })} /></label><label>굵기<select value={active.weight} onChange={(event) => update({ weight: Number(event.target.value) })}><option value="400">보통</option><option value="600">중간</option><option value="800">굵게</option><option value="900">매우 굵게</option></select></label></div>
              <div className="design-size-buttons"><button onClick={() => update({ size: Math.max(18, active.size - 6) })}>A−</button><strong>{Math.round(active.size)}</strong><button onClick={() => update({ size: Math.min(140, active.size + 6) })}>A＋</button></div>
              <div className="design-toggle-row"><button className={active.shadow ? "active" : ""} onClick={() => update({ shadow: !active.shadow })}>그림자</button><button className={active.outline ? "active" : ""} onClick={() => update({ outline: !active.outline })}>외곽선</button><button onClick={() => update({ align: active.align === "center" ? "left" : "center" })}>{active.align === "center" ? "가운데" : "왼쪽"}</button></div>
            </>}
            {error && <div className="ws3-error">{error}</div>}
          </section>

          <section className="image-result-card">
            <div className="result-toolbar"><strong>실시간 편집</strong><div>{imageUrl && <button onClick={save}>PNG 저장</button>}</div></div>
            {loading ? <div className="result-paper">글자 없는 배경을 만들고 있습니다.</div> : imageUrl ? <>
              <div className="design-help">글자를 끌어 이동하고, 모서리 점을 끌어 크기를 조절하세요.</div>
              <div className="image-v3-preview design-canvas" ref={previewRef} onPointerMove={move} onPointerUp={end} onPointerCancel={end}>
                {/* Generated images are data URLs and cannot use the Next image optimizer. */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={imageUrl} alt="편집할 이미지" />
                {textLayer("title", title, titleLayer, titleRef)}
                {textLayer("subtitle", subtitle, subLayer, subtitleRef)}
              </div>
            </> : <div className="result-paper">배경을 만들거나 내 이미지를 올려 시작하세요.</div>}
          </section>
        </div>
      </section>
    </main>
  );
}
