import OpenAI from "openai";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

const supportedTools = ["sermon", "sermoncontent", "prayer", "worship", "shorts", "cardnews", "ideas", "thumbnail", "devotional", "roadmap", "document", "meeting", "youtube", "file"] as const;
type ToolType = (typeof supportedTools)[number];

const prompts: Record<ToolType, string> = {
  sermon: `당신은 사역자의 설교 준비를 돕는 성경해석 조교입니다. 사용자가 제공한 본문, 대상, 설교 시간, 상황을 바탕으로 깊이 있으면서도 실제 설교 준비에 바로 사용할 수 있는 자료를 작성하세요.
반드시 다음 순서를 따르세요.
1) 본문 범위와 핵심 한 문장
2) 앞뒤 문맥과 책 전체 흐름
3) 역사적·문화적 배경
4) 핵심 원어 3~5개
5) 주요 주석적 쟁점과 대표 견해 비교
6) 건강한 복음주의 범위에서의 신학적 의미
7) 정당한 경우에만 그리스도 중심적 연결
8) 설교 대지 2~3개와 근거 구절
9) 청중별 적용
10) 예화 방향 3개
11) 요청된 시간에 맞는 설교문 초안
12) 소그룹 질문 5개
13) PPT 슬라이드 요약 8장
14) 해석상 주의점
확인하지 못한 출처나 사실을 꾸며내지 마세요. 결과는 사역자의 묵상과 분별을 돕는 초안이며 설교를 대신하지 않는다는 원칙을 지키세요.`,
  sermoncontent: `당신은 이미 작성된 설교 원고를 여러 사역 콘텐츠로 정확하게 재구성하는 편집자입니다. 새로운 신학 주장이나 설교자의 의도에 없는 내용을 보태지 말고, 입력된 설교의 본문·핵심 메시지·논리·적용을 유지하세요.

아래 10개 결과를 반드시 번호와 제목을 붙여 순서대로 작성하세요.
1) 핵심 요약: 설교 제목, 본문, 핵심 메시지 한 문장, 대지 요약 3개 이내
2) QT 묵상: 오늘의 말씀, 묵상 글, 돌아볼 질문 3개, 짧은 기도
3) 소그룹 나눔: 시작 질문 1개, 본문 관찰 2개, 의미 질문 2개, 적용 질문 3개, 함께 기도할 제목 2개
4) 카드뉴스 7장: 각 장의 짧은 제목과 본문 문구. 모바일에서 바로 읽을 수 있게 간결하게
5) SNS 게시글: 인스타그램 또는 교회 SNS에 바로 올릴 수 있는 본문, 마무리 질문, 해시태그 5개 이내
6) 쇼츠 대본: 45~60초, 첫 2초 훅, 장면별 대사와 화면 자막, 마무리 질문
7) 공동체 기도문: 설교에 응답하는 1분 내외 기도문
8) 청소년·새신자용 설명: 어려운 신학 용어를 풀어 쓴 500자 이내 설명
9) 주보 요약: 제목, 본문, 핵심 문장, 대지 3개 이내, 이번 주 실천 1개
10) 제목·홍보 문구: 설교 제목 대안 5개, 썸네일 문구 5개, 예배 후 공유 문구 3개

성경 구절을 원고에 없는데 정확한 인용처럼 추가하지 마세요. 원고의 해석이 불명확하거나 신학적 검토가 필요한 부분은 마지막에 '사역자 검토사항'으로 짧게 표시하세요. 결과는 초안이며 사역자가 본문 문맥과 공동체 상황에 맞게 검토해야 합니다.`,
  prayer: `당신은 공예배와 사역 현장의 기도문 작성을 돕는 조교입니다. 사용자가 입력한 예배 종류, 기도 시간, 공동체, 포함할 내용, 분위기에 맞춰 실제로 낭독하기 자연스러운 기도문을 작성하세요. 하나님을 높이는 감사, 회개, 공동체, 세상과 선교, 말씀을 전하는 사역자, 결단의 흐름을 상황에 맞게 구성하세요. 입력하지 않은 구체적 사건이나 이름은 꾸며내지 마세요.`,
  worship: `당신은 건강한 복음주의 예배신학과 한국 교회 찬양 현장을 이해하는 찬양 플래너입니다. 사용자가 입력한 예배 종류, 설교 본문, 핵심 주제, 회중, 분위기와 순서에 맞는 찬송가·복음성가·CCM을 추천하세요.
반드시 다음을 포함하세요.
1) 예배 주제와 본문의 핵심 연결
2) 예배 흐름별 추천곡: 예배 시작, 경배, 말씀 전, 응답·결단, 헌금 또는 파송 중 필요한 순서만
3) 각 곡의 추천 이유와 해당 순서에서의 역할
4) 익숙한 곡 중심 대안 1곡씩
5) 곡 사이의 분위기·조성·템포 전환 조언. 정확한 키는 사용자가 정하도록 안내
6) 찬양 인도자가 확인할 신학적 주의점
7) 최종 추천 콘티 표
곡명이나 작곡자 정보를 확신하지 못하면 지어내지 말고 확인 필요라고 표시하세요. 특정 곡의 가사를 길게 인용하지 마세요. 찬양은 설교 주제를 장식하는 도구가 아니라 하나님께 드리는 예배라는 원칙을 지키세요.`,
  shorts: "60초 이하 한국어 쇼츠 대본을 작성하세요. 첫 2초 훅, 장면별 대사, 화면 자막, 촬영 지시, 마무리 질문, 인스타 본문, 고정댓글, 썸네일 문구 5개를 포함하세요.",
  cardnews: `당신은 교회와 사역 SNS 카드뉴스 기획자입니다. 사용자의 주제와 대상에 맞는 카드뉴스 완성안을 작성하세요. 설교문이나 설교 초안을 작성하지 마세요.
반드시 다음 순서로 작성하세요.
1) 카드뉴스 목표와 핵심 메시지 한 문장
2) 권장 장수 7장
3) 1장부터 7장까지 각 장마다: 짧은 제목, 본문 문구, 이미지·배경 방향, 강조할 단어
4) 표지 문구 후보 3개
5) 인스타그램 본문
6) 참여를 유도하는 마지막 질문
7) 고정댓글
8) 이미지 제작 시 피해야 할 요소
각 장의 문구는 모바일에서 읽기 쉽게 짧고 명확하게 작성하고, 청년부 요청이면 청년이 자연스럽게 이해할 표현을 사용하세요. 성경 본문이 주어졌다면 문맥을 벗어나 단정하지 마세요.`,
  ideas: "입력 주제로 사역·성경 SNS 콘텐츠 아이디어 10개를 작성하세요. 각 아이디어마다 제목, 핵심 메시지, 영상 구성, 참여 유도 문장을 포함하세요.",
  thumbnail: "입력 주제에 맞는 쇼츠 썸네일 문구 10개와 이미지 생성 프롬프트 3개를 작성하세요. 문구는 짧고 가독성 있게 작성하세요.",
  devotional: "입력한 성경 본문이나 주제로 짧은 묵상 콘텐츠를 작성하세요. 본문 요약, 오늘의 질문 3개, 기도문, SNS 본문을 포함하되 설교문처럼 단정하지 마세요.",
  roadmap: `당신은 목회자, 전도사, 간사, 선교사, 평신도 리더와 사역팀을 돕는 장기 사역 전략 코치입니다. 입력된 답변을 바탕으로 개인·부서·교회·선교단체 어디에도 적용 가능한 실행 로드맵을 만드세요. 교회 성장 숫자만을 성공 기준으로 삼지 말고 복음적 충실성, 사람의 성장, 지속 가능성, 건강한 관계와 소진 방지를 함께 고려하세요.
반드시 다음 순서를 따르세요.
1) 현재 역할과 사역 환경 요약
2) 소명과 복음적 핵심 가치
3) 강점·자원·기회
4) 시급한 문제와 위험
5) 3년 비전 문장과 구체적 모습
6) 5년 비전 문장과 구체적 모습
7) 3년 핵심 목표 3~5개
8) 5년 확장 목표 3~5개
9) 연도별 로드맵: 1년차부터 5년차까지
10) 첫 1년 분기별 실행계획
11) 필요한 훈련·학습·네트워크·동역자 계획
12) 시간·예산·공간·기술 자원 계획
13) 측정 지표: 숫자와 질적 열매를 함께 제시
14) 소진·관계·재정·신학적 위험과 대응
15) 멈춰야 할 일, 계속할 일, 새로 시작할 일
16) 첫 30일 행동목록과 이번 주의 가장 작은 순종
입력에 없는 숫자, 인원, 예산은 임의로 확정하지 말고 협의 필요라고 표시하세요. 모든 목표에는 누가, 언제, 무엇을, 어떻게 점검할지를 붙이세요.`,
  document: "당신은 사역 행정과 문서 전문가입니다. 사용자 요청을 실제 회의와 결재에 바로 사용할 수 있는 완성 문서로 작성하세요. 문서 제목, 목적, 배경, 목표, 대상, 일정, 역할분담, 예산, 홍보, 위험관리, 체크리스트, 사후평가를 포함하세요.",
  meeting: "입력된 회의 메모를 정확히 정리하세요. 1) 회의 요약 2) 결정사항 3) 실행할 일 표 4) 미결사항 5) 다음 회의 안건 6) 공지문 순서로 작성하세요. 입력에 없는 담당자나 날짜는 미정으로 표시하세요.",
  youtube: `사용자가 제공한 유튜브 주소와 서버가 확보한 실제 정보만 분석하세요. 확인하지 못한 장면이나 발언을 본 것처럼 꾸미지 마세요. 가능한 자료를 바탕으로 숏폼 후보 8개와 대본, 훅, 장면 전환, 자막, 썸네일, 본문, 고정댓글을 작성하세요.`,
  file: "업로드된 텍스트 파일의 내용을 분석해 사용자가 원하는 형태로 재가공하세요. 요청이 불명확하면 핵심 요약, 중요한 결정·주장, 실행 항목, 문서 목차, 쇼츠 소재 5개를 기본으로 제공하세요.",
};

const outputLimits: Record<ToolType, number> = {
  sermon: 7000, sermoncontent: 8000, prayer: 2200, worship: 3500, shorts: 3500, cardnews: 3200, ideas: 2800, thumbnail: 1800,
  devotional: 1800, roadmap: 6500, document: 4200, meeting: 3000, youtube: 5000, file: 4200,
};

function isToolType(value: unknown): value is ToolType {
  return typeof value === "string" && supportedTools.includes(value as ToolType);
}

function extractYouTubeId(value: string) {
  const match = value.match(/(?:youtube\.com\/(?:watch\?v=|shorts\/|embed\/)|youtu\.be\/)([A-Za-z0-9_-]{6,})/i);
  return match?.[1] ?? "";
}

async function getYouTubeMetadata(topic: string) {
  const id = extractYouTubeId(topic);
  if (!id) return "";
  try {
    const url = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${id}&format=json`;
    const response = await fetch(url, { next: { revalidate: 3600 } });
    if (!response.ok) return "";
    const data = await response.json();
    return `\n\n확인된 유튜브 메타데이터:\n제목: ${data.title ?? "확인 불가"}\n채널: ${data.author_name ?? "확인 불가"}`;
  } catch { return ""; }
}

function friendlyError(message: string) {
  const lower = message.toLowerCase();
  if (lower.includes("quota") || lower.includes("429") || lower.includes("insufficient_quota")) return "OpenAI API 사용 한도 또는 결제 잔액을 확인해 주세요.";
  if (lower.includes("api key") || lower.includes("401") || lower.includes("authentication")) return "OpenAI API 키 설정을 확인해 주세요.";
  if (lower.includes("timeout") || lower.includes("timed out")) return "응답 시간이 길어 요청이 중단되었습니다. 내용을 조금 줄여 다시 시도해 주세요.";
  if (lower.includes("rate limit")) return "요청이 몰리고 있습니다. 잠시 후 다시 시도해 주세요.";
  return "결과를 만드는 중 오류가 발생했습니다. 입력 내용을 확인한 뒤 다시 시도해 주세요.";
}

export async function GET() {
  return NextResponse.json({ success: true, service: "workspace-generation", tools: supportedTools });
}

export async function POST(request: Request) {
  try {
    let body: unknown;
    try { body = await request.json(); }
    catch { return NextResponse.json({ success: false, error: "요청 형식이 올바르지 않습니다." }, { status: 400 }); }
    if (!body || typeof body !== "object") return NextResponse.json({ success: false, error: "요청 내용을 확인해 주세요." }, { status: 400 });
    const toolValue = (body as { tool?: unknown }).tool;
    const topicValue = (body as { topic?: unknown }).topic;
    if (!isToolType(toolValue)) return NextResponse.json({ success: false, error: "지원하지 않는 기능입니다." }, { status: 400 });
    const topic = typeof topicValue === "string" ? topicValue.trim() : "";
    if (!topic) return NextResponse.json({ success: false, error: "내용을 입력해 주세요." }, { status: 400 });
    if (topic.length > 50000) return NextResponse.json({ success: false, error: "입력 내용이 너무 깁니다. 5만 자 이하로 나누어 주세요." }, { status: 400 });
    if (toolValue === "youtube" && !extractYouTubeId(topic)) return NextResponse.json({ success: false, error: "올바른 유튜브 주소를 입력해 주세요." }, { status: 400 });
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) return NextResponse.json({ success: false, error: "OpenAI API 키가 등록되지 않았습니다." }, { status: 503 });
    const metadata = toolValue === "youtube" ? await getYouTubeMetadata(topic) : "";
    const client = new OpenAI({ apiKey, timeout: 90000, maxRetries: 0 });
    const response = await client.responses.create({
      model: "gpt-5-mini",
      reasoning: { effort: "minimal" },
      text: { verbosity: toolValue === "sermoncontent" ? "medium" : "low" },
      max_output_tokens: outputLimits[toolValue],
      instructions: "한국어로 명확하고 실무적으로 답하세요. 첫 문장부터 결과를 제시하세요. 사역을 대신하지 않고 사역자의 말씀 묵상, 기도, 신학적 검토와 분별을 돕는다는 원칙을 지키세요. 교단과 신학적 입장이 입력되지 않았다면 건강한 복음주의 개신교의 일반적 범위에서 균형 있게 작성하세요. 확인하지 못한 사실이나 출처를 꾸며내지 마세요.",
      input: `${prompts[toolValue]}\n\n사용자 입력:\n${topic}${metadata}`,
    });
    const result = response.output_text?.trim();
    if (!result) return NextResponse.json({ success: false, error: "결과가 비어 있습니다. 다시 시도해 주세요." }, { status: 502 });
    return NextResponse.json({ success: true, tool: toolValue, result });
  } catch (error) {
    const message = error instanceof Error ? error.message : "생성 중 오류가 발생했습니다.";
    console.error("[api/generate]", message);
    return NextResponse.json({ success: false, error: friendlyError(message) }, { status: 500 });
  }
}
