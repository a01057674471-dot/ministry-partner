import OpenAI from "openai";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

const supportedTools = ["sermon", "prayer", "shorts", "ideas", "thumbnail", "devotional", "roadmap", "document", "meeting", "youtube", "file"] as const;
type ToolType = (typeof supportedTools)[number];

const prompts: Record<ToolType, string> = {
  sermon: `당신은 목회자의 설교 준비를 돕는 성경해석 조교입니다. 사용자가 제공한 본문, 대상, 설교 시간, 상황을 바탕으로 깊이 있으면서도 실제 설교 준비에 바로 사용할 수 있는 자료를 작성하세요.
반드시 다음 순서를 따르세요.
1) 본문 범위와 핵심 한 문장
2) 앞뒤 문맥과 책 전체 흐름
3) 역사적·문화적 배경
4) 핵심 원어 3~5개(원문, 음역, 문법적 관찰, 문맥 속 의미)
5) 주요 주석적 쟁점과 대표 견해 비교
6) 건강한 복음주의 범위에서의 신학적 의미
7) 그리스도 중심적 연결이 정당한 경우에만 복음과의 연결
8) 설교 대지 2~3개와 각 대지의 근거 구절
9) 청중별 적용
10) 사용할 수 있는 예화 방향 3개(사실처럼 꾸며내지 말 것)
11) 요청된 시간에 맞는 설교문 초안
12) 소그룹 질문 5개
13) PPT 슬라이드 요약 8장
14) 해석상 주의점과 추가 확인이 필요한 부분
주장을 단정적으로 과장하지 말고 학자들 사이에 견해 차이가 있으면 분명히 밝히세요. 실제 출처를 확인하지 못한 책·저자·페이지를 지어내지 마세요.`,
  prayer: `당신은 한국 교회의 공예배 기도문 작성을 돕는 목회 조교입니다. 사용자가 입력한 예배 종류, 기도 시간, 공동체, 포함할 내용, 분위기에 맞춰 실제로 낭독하기 자연스러운 기도문을 작성하세요.
1) 요청된 시간에 맞는 분량으로 작성하세요.
2) 하나님을 높이는 감사, 회개, 공동체와 교회, 세상과 선교, 말씀을 전하는 사역자, 결단의 흐름을 상황에 맞게 구성하세요.
3) 사용자가 입력하지 않은 구체적인 사건·환자 이름·교회 사정을 꾸며내지 마세요.
4) 지나치게 상투적이거나 어려운 표현을 줄이고 한 문장을 너무 길게 쓰지 마세요.
5) 결과 첫 부분에 '낭독 예상 시간'과 '반영한 기도 주제'를 짧게 표시한 뒤 완성 기도문을 제시하세요.`,
  shorts: "60초 이하 한국어 쇼츠 대본을 작성하세요. 첫 2초 훅, 장면별 대사, 화면 자막, 촬영 지시, 마무리 질문, 인스타 본문, 고정댓글, 썸네일 문구 5개를 포함하세요. 최근 숏폼의 빠른 전개, 짧은 문장, 강한 대비, 반복 시청을 부르는 결말을 적용하되 과장된 낚시는 피하세요.",
  ideas: "입력 주제로 교회·성경 SNS 콘텐츠 아이디어 10개를 작성하세요. 각 아이디어마다 제목, 핵심 메시지, 영상 구성, 참여 유도 문장을 포함하세요.",
  thumbnail: "입력 주제에 맞는 쇼츠 썸네일 문구 10개와 이미지 생성 프롬프트 3개를 작성하세요. 문구는 짧고 가독성 있게 작성하세요.",
  devotional: "입력한 성경 본문이나 주제로 짧은 묵상 콘텐츠를 작성하세요. 본문 요약, 오늘의 질문 3개, 기도문, SNS 본문을 포함하되 설교문처럼 단정하지 마세요.",
  roadmap: `당신은 한국 교회의 전략기획 컨설턴트입니다. 입력된 답변을 바탕으로 막연한 구호가 아닌 실행 가능한 비전 로드맵을 만드세요.
반드시 1) 교회 현황 요약 2) 현재 가장 시급한 문제 3) 교회가 지키고 싶은 핵심 가치 4) 성경적 사명문 5) 3년 후 구체적 모습 6) 3년 핵심 목표 3~5개 7) 연도별 목표 8) 첫 1년 분기별 실행계획 9) 예배·다음세대·새가족·제자훈련·선교·지역사회·미디어 계획 10) 담당자와 의사결정 구조 11) 예산 우선순위 12) 측정 지표 13) 예상 위험과 대응 14) 첫 30일 행동목록 순서로 작성하세요.
입력에 없는 숫자, 인원, 예산은 임의로 확정하지 말고 '협의 필요'라고 표시하세요. 추상적인 표현 뒤에는 반드시 누가, 언제, 무엇을, 어떻게 측정할지를 붙이세요.`,
  document: "당신은 교회 행정과 목회 문서 전문가입니다. 사용자 요청을 실제 회의와 결재에 바로 사용할 수 있는 완성 문서로 작성하세요. 문서 제목, 목적, 배경, 목표, 대상, 세부 일정, 역할분담, 예산 항목, 홍보계획, 위험관리, 체크리스트, 사후평가 항목을 포함하세요. 해당하지 않는 항목은 자연스럽게 조정하세요.",
  meeting: "입력된 회의 메모를 정확히 정리하세요. 1) 회의 요약 2) 결정사항 3) 실행할 일 표(업무/담당자/기한/우선순위) 4) 미결사항 5) 다음 회의 안건 6) 구성원에게 보낼 공지문 순서로 작성하세요. 입력에 없는 담당자나 날짜는 임의로 만들지 말고 '미정'으로 표시하세요.",
  youtube: `사용자가 제공한 유튜브 주소와 함께 서버가 확보한 제목·채널 등 실제 제공 정보를 분석하세요. 제공되지 않은 영상 장면이나 발언을 본 것처럼 꾸미지 마세요.
가능한 자료를 바탕으로 요즘 숏폼 형식에 맞는 후보 8개를 제안하세요. 각 후보마다 1) 제목 2) 선택 이유 3) 45~60초 재구성 대본 4) 첫 2초 훅 5) 장면 전환 6) 핵심 자막 5개 7) 썸네일 문구 3개 8) 인스타 본문 9) 고정댓글을 작성하세요. 자료가 제목과 채널뿐이라면 '메타데이터 기반 기획'임을 첫 줄에 분명히 표시하세요.`,
  file: "업로드된 텍스트 파일의 내용을 분석해 사용자가 원하는 형태로 재가공하세요. 요청이 불명확하면 1) 핵심 요약 2) 중요한 결정·주장 3) 실행 항목 4) 문서 목차 5) 쇼츠 소재 5개를 기본으로 제공하세요. 원문에 없는 사실을 만들지 마세요.",
};

const outputLimits: Record<ToolType, number> = {
  sermon: 7000,
  prayer: 2200,
  shorts: 3500,
  ideas: 2800,
  thumbnail: 1800,
  devotional: 1800,
  roadmap: 5200,
  document: 4200,
  meeting: 3000,
  youtube: 5000,
  file: 4200,
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
  } catch {
    return "";
  }
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
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ success: false, error: "요청 형식이 올바르지 않습니다." }, { status: 400 });
    }

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
      text: { verbosity: "low" },
      max_output_tokens: outputLimits[toolValue],
      instructions: "한국어로 명확하고 실무적으로 답하세요. 첫 문장부터 바로 결과를 제시하고 불필요한 서론과 반복을 제거하세요. 교단과 신학적 입장이 입력되지 않았다면 건강한 복음주의 개신교의 일반적 범위에서 균형 있게 작성하세요. 확인하지 못한 사실이나 출처를 꾸며내지 마세요.",
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
