"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type Resource = {
  id: string;
  title: string;
  category: string;
  icon: string;
  description: string;
  content: string;
  tags: string[];
  custom?: boolean;
};

const categories = ["전체", "즐겨찾기", "설교 예화", "대표기도", "절기 자료", "소그룹 교재", "주보 문구", "쇼츠 아이디어", "카드뉴스", "교회 공문", "심방 자료", "AI 프롬프트"];

const seedResources: Resource[] = [
  { id: "ill-1", title: "기다림 속에서 자라는 믿음", category: "설교 예화", icon: "💡", description: "응답이 늦어질 때 사용할 수 있는 짧은 예화", tags: ["기다림", "믿음", "인내"], content: "대나무는 땅 위로 보이는 성장이 시작되기 전까지 오랜 시간 뿌리를 내립니다. 보이지 않는 시간은 멈춘 시간이 아니라 무너지지 않기 위한 준비의 시간입니다. 하나님의 응답이 늦어 보일 때에도 믿음은 뿌리를 내리고 있습니다." },
  { id: "ill-2", title: "작은 순종이 만든 길", category: "설교 예화", icon: "💡", description: "작은 행동의 중요성을 전하는 예화", tags: ["순종", "실천", "결단"], content: "어두운 길에서 손전등은 목적지 전체를 보여 주지 않습니다. 다만 지금 내딛을 한 걸음을 비춰 줍니다. 믿음의 순종도 마찬가지입니다. 모든 답을 안 뒤 걷는 것이 아니라, 보여 주신 한 걸음을 내딛을 때 다음 길이 열립니다." },
  { id: "prayer-1", title: "주일예배 대표기도 기본문", category: "대표기도", icon: "🙏", description: "감사·회개·말씀·교회를 담은 기본 기도문", tags: ["주일", "예배", "대표기도"], content: "사랑과 은혜가 풍성하신 하나님 아버지, 거룩한 주일에 우리를 예배의 자리로 불러 주심을 감사드립니다. 지난 한 주의 말과 생각과 행동을 돌아보며 주님의 뜻보다 우리 욕심을 앞세웠던 죄를 고백합니다. 이 시간 말씀을 전하시는 목사님을 성령으로 붙드시고, 듣는 우리에게 깨닫는 마음과 순종하는 믿음을 더하여 주옵소서. 교회와 가정과 다음 세대를 지켜 주시며, 병들고 지친 성도들을 위로하여 주옵소서. 예수 그리스도의 이름으로 기도드립니다. 아멘." },
  { id: "season-1", title: "맥추감사주일 핵심 메시지", category: "절기 자료", icon: "✝", description: "감사의 의미와 설교 방향을 빠르게 정리", tags: ["맥추감사", "감사", "절기"], content: "핵심 주제: 감사는 형편이 좋아서 드리는 반응이 아니라, 하나님이 우리의 공급자이심을 인정하는 믿음의 고백입니다. 추천 본문: 신명기 16:9-12, 시편 103:1-5, 하박국 3:17-19. 적용 질문: 나는 결과보다 하나님 자신을 기뻐하고 있는가?" },
  { id: "small-1", title: "소그룹 나눔 질문 기본 틀", category: "소그룹 교재", icon: "👥", description: "아이스브레이크부터 적용까지 5단계", tags: ["소그룹", "나눔", "질문"], content: "1. 아이스브레이크: 이번 주 가장 감사했던 일은 무엇인가요?\n2. 관찰: 오늘 본문에서 반복되거나 눈에 띄는 표현은 무엇인가요?\n3. 해석: 이 말씀은 당시 사람들에게 어떤 의미였을까요?\n4. 적용: 지금 내 삶에서 순종해야 할 한 가지는 무엇인가요?\n5. 기도: 서로의 적용을 위해 한 문장씩 기도해 주세요." },
  { id: "bulletin-1", title: "새가족 환영 주보 문구", category: "주보 문구", icon: "📰", description: "처음 교회를 방문한 분을 위한 환영 문구", tags: ["새가족", "환영", "주보"], content: "오늘 처음 방문하신 모든 분을 진심으로 환영합니다. 낯선 발걸음이 편안한 쉼이 되고, 예배 가운데 하나님의 따뜻한 사랑을 경험하시길 바랍니다. 예배 후 새가족 안내를 통해 교회 생활에 필요한 도움을 받으실 수 있습니다." },
  { id: "shorts-1", title: "30초 말씀 쇼츠 구조", category: "쇼츠 아이디어", icon: "🎬", description: "훅·본문·적용·마무리로 구성된 숏폼 공식", tags: ["쇼츠", "릴스", "영상"], content: "0~3초 훅: '기도했는데 아무것도 달라지지 않았다고 느끼시나요?'\n4~12초 본문: 핵심 성경구절 한 문장\n13~23초 해설: 일상 언어로 의미 설명\n24~28초 적용: 오늘 실천할 한 가지\n29~30초 마무리: '이 말씀이 필요했던 분께 공유해 주세요.'" },
  { id: "card-1", title: "7장 카드뉴스 기본 구조", category: "카드뉴스", icon: "🎨", description: "설교 한 편을 카드뉴스로 바꾸는 구성", tags: ["카드뉴스", "인스타", "콘텐츠"], content: "1장: 강한 제목\n2장: 독자의 고민\n3장: 오늘의 본문\n4장: 본문의 핵심 의미\n5장: 오해하기 쉬운 부분\n6장: 삶의 적용\n7장: 한 문장 기도와 저장·공유 유도" },
  { id: "letter-1", title: "행사 협조 요청 공문", category: "교회 공문", icon: "📄", description: "부서와 기관에 보낼 수 있는 정중한 공문 틀", tags: ["공문", "행사", "협조"], content: "제목: ○○행사 진행을 위한 협조 요청\n주님의 은혜와 평강이 함께하시길 바랍니다. 본 교회에서는 아래와 같이 ○○행사를 진행하고자 하오니 원활한 준비를 위해 협조를 부탁드립니다.\n1. 행사명:\n2. 일시:\n3. 장소:\n4. 요청 사항:\n귀한 섬김에 감사드리며, 문의 사항은 담당자에게 연락해 주시기 바랍니다." },
  { id: "visit-1", title: "병원 심방 말씀과 기도", category: "심방 자료", icon: "🏠", description: "환우와 가족을 위로하는 짧은 심방 자료", tags: ["심방", "병원", "위로"], content: "추천 말씀: 이사야 41:10, 시편 23편, 고린도후서 1:3-4.\n위로 문장: 하나님은 고통을 가볍게 여기지 않으시며, 가장 약한 순간에도 곁을 떠나지 않으십니다.\n기도 방향: 치료 과정, 의료진, 환자의 마음, 가족의 지치지 않는 믿음과 평안을 위해 기도합니다." },
  { id: "prompt-1", title: "본문 중심 설교 작성 프롬프트", category: "AI 프롬프트", icon: "✦", description: "건강한 본문 해석을 위한 복사형 프롬프트", tags: ["프롬프트", "설교", "본문"], content: "다음 성경 본문으로 개신교 복음주의 관점의 설교를 준비해 주세요. 본문의 역사적·문학적 문맥을 먼저 설명하고, 본문이 실제로 말하는 중심 메시지를 한 문장으로 정리해 주세요. 억지 예표나 본문과 무관한 주장을 피하고, 설교 대지 3개와 각 대지의 해설·예화 방향·삶의 적용을 작성해 주세요. 대상은 [대상], 설교 시간은 [시간]분입니다. 본문: [성경 본문]" },
  { id: "prompt-2", title: "대표기도 작성 프롬프트", category: "AI 프롬프트", icon: "✦", description: "상황에 맞는 대표기도를 만드는 프롬프트", tags: ["프롬프트", "대표기도", "예배"], content: "[예배 종류] 대표기도문을 작성해 주세요. 감사, 회개, 말씀을 전하는 목회자, 교회 공동체, 다음 세대, 아픈 성도, 나라와 선교를 자연스럽게 포함하되 반복적이거나 과장된 표현은 줄여 주세요. 실제 예배에서 읽기 편한 문장과 호흡으로 작성하고, 분량은 약 [분량]분으로 맞춰 주세요." }
];

export default function LibraryPage() {
  const router = useRouter();
  const [resources, setResources] = useState<Resource[]>(seedResources);
  const [category, setCategory] = useState("전체");
  const [query, setQuery] = useState("");
  const [favorites, setFavorites] = useState<string[]>([]);
  const [selected, setSelected] = useState<Resource | null>(null);
  const [notice, setNotice] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [draft, setDraft] = useState({ title: "", category: "설교 예화", content: "", tags: "" });

  useEffect(() => {
    try {
      const savedFavorites = JSON.parse(localStorage.getItem("ministry-library-favorites") || "[]");
      const savedCustom = JSON.parse(localStorage.getItem("ministry-library-custom") || "[]");
      setFavorites(savedFavorites);
      setResources([...seedResources, ...savedCustom]);
    } catch {}
  }, []);

  useEffect(() => { localStorage.setItem("ministry-library-favorites", JSON.stringify(favorites)); }, [favorites]);

  const visible = useMemo(() => {
    const keyword = query.trim().toLowerCase();
    return resources.filter((item) => {
      const categoryMatch = category === "전체" || (category === "즐겨찾기" ? favorites.includes(item.id) : item.category === category);
      const keywordMatch = !keyword || [item.title, item.description, item.content, item.category, ...item.tags].join(" ").toLowerCase().includes(keyword);
      return categoryMatch && keywordMatch;
    });
  }, [resources, category, query, favorites]);

  function flash(message: string) {
    setNotice(message);
    window.setTimeout(() => setNotice(""), 1800);
  }

  async function copy(text: string) {
    await navigator.clipboard.writeText(text);
    flash("복사했습니다.");
  }

  function toggleFavorite(id: string) {
    setFavorites((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
  }

  function useInWorkspace(resource: Resource) {
    const prompt = `다음 자료를 바탕으로 사역 결과물을 발전시켜 주세요.\n\n[자료명] ${resource.title}\n[분류] ${resource.category}\n[내용]\n${resource.content}`;
    router.push(`/workspace?request=${encodeURIComponent(prompt)}`);
  }

  function saveCustom() {
    if (!draft.title.trim() || !draft.content.trim()) return flash("제목과 내용을 입력해 주세요.");
    const item: Resource = {
      id: `custom-${Date.now()}`,
      title: draft.title.trim(),
      category: draft.category,
      icon: "📌",
      description: "직접 저장한 자료",
      content: draft.content.trim(),
      tags: draft.tags.split(",").map((tag) => tag.trim()).filter(Boolean),
      custom: true,
    };
    const custom = [...resources.filter((resource) => resource.custom), item];
    localStorage.setItem("ministry-library-custom", JSON.stringify(custom));
    setResources([...seedResources, ...custom]);
    setDraft({ title: "", category: "설교 예화", content: "", tags: "" });
    setShowAdd(false);
    setSelected(item);
    flash("내 자료실에 저장했습니다.");
  }

  function removeCustom(item: Resource) {
    if (!item.custom) return;
    const custom = resources.filter((resource) => resource.custom && resource.id !== item.id);
    localStorage.setItem("ministry-library-custom", JSON.stringify(custom));
    setResources([...seedResources, ...custom]);
    setSelected(null);
    setFavorites((current) => current.filter((id) => id !== item.id));
  }

  return (
    <main className="lib-shell">
      <aside className="lib-sidebar">
        <a className="lib-brand" href="/"><span>✦</span><strong>목회파트너</strong></a>
        <a className="lib-back" href="/">← 홈으로</a>
        <p>자료 분류</p>
        <nav>{categories.map((item) => <button className={category === item ? "active" : ""} key={item} onClick={() => setCategory(item)}>{item === "즐겨찾기" ? "★" : ""} {item}<span>{item === "전체" ? resources.length : item === "즐겨찾기" ? favorites.length : resources.filter((r) => r.category === item).length}</span></button>)}</nav>
      </aside>

      <section className="lib-main">
        <header className="lib-header">
          <div><p>목회 지식 라이브러리</p><h1>자료실</h1><span>자주 쓰는 사역 자료를 찾고, 저장하고, 바로 활용하세요.</span></div>
          <button onClick={() => setShowAdd(true)}>＋ 내 자료 추가</button>
        </header>

        <div className="lib-search"><span>⌕</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="예화, 기도, 절기, 감사, 청년부 등을 검색하세요" />{query && <button onClick={() => setQuery("")}>×</button>}</div>

        <section className="lib-summary">
          <article><b>{resources.length}</b><span>전체 자료</span></article>
          <article><b>{favorites.length}</b><span>즐겨찾기</span></article>
          <article><b>{resources.filter((item) => item.category === "AI 프롬프트").length}</b><span>AI 프롬프트</span></article>
          <article><b>{resources.filter((item) => item.custom).length}</b><span>내가 추가한 자료</span></article>
        </section>

        <div className="lib-result-head"><div><h2>{category}</h2><span>{visible.length}개의 자료</span></div><button onClick={() => { setCategory("전체"); setQuery(""); }}>전체 보기</button></div>

        {visible.length ? <section className="lib-grid">{visible.map((item) => <article key={item.id} onClick={() => setSelected(item)}>
          <div className="lib-card-top"><span>{item.icon}</span><button onClick={(event) => { event.stopPropagation(); toggleFavorite(item.id); }}>{favorites.includes(item.id) ? "★" : "☆"}</button></div>
          <small>{item.category}</small><h3>{item.title}</h3><p>{item.description}</p>
          <div>{item.tags.slice(0, 3).map((tag) => <em key={tag}>#{tag}</em>)}</div>
          <footer><span>내용 보기</span><b>→</b></footer>
        </article>)}</section> : <section className="lib-empty"><b>검색 결과가 없습니다.</b><p>다른 단어나 분류로 찾아보세요.</p></section>}
      </section>

      {selected && <div className="lib-modal" onMouseDown={() => setSelected(null)}><section onMouseDown={(event) => event.stopPropagation()}>
        <header><div><span>{selected.icon}</span><div><small>{selected.category}</small><h2>{selected.title}</h2></div></div><button onClick={() => setSelected(null)}>×</button></header>
        <p className="lib-modal-desc">{selected.description}</p>
        <div className="lib-content">{selected.content}</div>
        <div className="lib-tags">{selected.tags.map((tag) => <span key={tag}>#{tag}</span>)}</div>
        <footer>
          {selected.custom && <button className="danger" onClick={() => removeCustom(selected)}>삭제</button>}
          <button onClick={() => toggleFavorite(selected.id)}>{favorites.includes(selected.id) ? "★ 즐겨찾기 해제" : "☆ 즐겨찾기"}</button>
          <button onClick={() => copy(selected.content)}>내용 복사</button>
          <button className="primary" onClick={() => useInWorkspace(selected)}>작업공간에서 사용 →</button>
        </footer>
      </section></div>}

      {showAdd && <div className="lib-modal" onMouseDown={() => setShowAdd(false)}><section className="lib-add" onMouseDown={(event) => event.stopPropagation()}>
        <header><div><span>📌</span><div><small>나만의 자료</small><h2>자료 추가</h2></div></div><button onClick={() => setShowAdd(false)}>×</button></header>
        <label>제목<input value={draft.title} onChange={(event) => setDraft({ ...draft, title: event.target.value })} placeholder="자료 제목" /></label>
        <label>분류<select value={draft.category} onChange={(event) => setDraft({ ...draft, category: event.target.value })}>{categories.filter((item) => !["전체", "즐겨찾기"].includes(item)).map((item) => <option key={item}>{item}</option>)}</select></label>
        <label>내용<textarea value={draft.content} onChange={(event) => setDraft({ ...draft, content: event.target.value })} placeholder="보관할 내용을 입력하세요" /></label>
        <label>태그<input value={draft.tags} onChange={(event) => setDraft({ ...draft, tags: event.target.value })} placeholder="감사, 청년부, 설교 (쉼표로 구분)" /></label>
        <footer><button onClick={() => setShowAdd(false)}>취소</button><button className="primary" onClick={saveCustom}>자료 저장</button></footer>
      </section></div>}

      {notice && <div className="lib-toast">{notice}</div>}
    </main>
  );
}
