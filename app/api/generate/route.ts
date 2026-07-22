import OpenAI from "openai";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

type ToolType = "shorts" | "ideas" | "thumbnail" | "devotional" | "roadmap" | "document" | "meeting" | "youtube" | "file";

const prompts: Record<ToolType, string> = {
  shorts: "60초 이하 한국어 쇼츠 대본을 작성하세요. 첫 2초 훅, 장면별 대사, 화면 자막, 촬영 지시, 마무리 질문, 인스타 본문, 고정댓글, 썸네일 문구 5개를 포함하세요. 교회 현장에서 실제 촬영하기 쉽게 작성하세요.",
  ideas: "입력 주제로 교회·성경 SNS 콘텐츠 아이디어 10개를 작성하세요. 각 아이디어마다 제목, 핵심 메시지, 영상 구성, 참여 유도 문장을 포함하세요.",
  thumbnail: "입력 주제에 맞는 쇼츠 썸네일 문구 10개와 이미지 생성 프롬프트 3개를 작성하세요. 문구는 짧고 가독성 있게 작성하세요.",
  devotional: "입력한 성경 본문이나 주제로 짧은 묵상 콘텐츠를 작성하세요. 본문 요약, 오늘의 질문 3개, 기도문, SNS 본문을 포함하되 설교문처럼 단정하지 마세요.",
  roadmap: "당신은 한국 교회의 전략기획 컨설턴트입니다. 입력된 교회 상황을 바탕으로 실행 가능한 교회 비전 로드맵을 만드세요. 반드시 1) 현재 진단 2) 핵심 문제 3) 성경적 사명문 4) 3년 비전 5) 연도별 목표 6) 첫 1년 분기별 실행계획 7) 사역 분야별 계획(예배, 다음세대, 새가족, 제자훈련, 선교, 지역사회, 미디어) 8) 담당 조직 9) 측정 지표 10) 예상 위험과 대응 11) 첫 30일 행동목록 순서로 구체적으로 작성하세요. 추상적 구호보다 인원, 일정, 담당, 측정방법을 제시하세요.",
  document: "당신은 교회 행정과 목회 문서 전문가입니다. 사용자 요청을 실제 회의와 결재에 바로 사용할 수 있는 완성 문서로 작성하세요. 문서 제목, 목적, 배경, 목표, 대상, 세부 일정, 역할분담, 예산 항목, 홍보계획, 위험관리, 체크리스트, 사후평가 항목을 포함하세요. 해당하지 않는 항목은 자연스럽게 조정하세요.",
  meeting: "입력된 회의 메모를 정확히 정리하세요. 1) 회의 요약 2) 결정사항 3) 실행할 일 표(업무/담당자/기한/우선순위) 4) 미결사항 5) 다음 회의 안건 6) 구성원에게 보낼 공지문 순서로 작성하세요. 입력에 없는 담당자나 날짜는 임의로 만들지 말고 '미정'으로 표시하세요.",
  youtube: "입력에는 유튜브 주소와 영상 자막 또는 대본이 포함될 수 있습니다. 제공된 실제 텍스트만 분석하여 쇼츠 후보 8개를 뽑으세요. 각 후보마다 제목, 사용할 원문 구간, 핵심 메시지, 45~60초 재구성 대본, 첫 2초 훅, 자막 5개, 썸네일 문구 3개, 인스타 본문, 고정댓글을 작성하세요. 자막이 없고 주소만 있다면 영상을 읽었다고 주장하지 말고 자막을 추가해 달라고 명확히 안내하세요.",
  file: "업로드된 텍스트 파일의 내용을 분석해 사용자가 원하는 형태로 재가공하세요. 요청이 불명확하면 1) 핵심 요약 2) 중요한 결정·주장 3) 실행 항목 4) 문서 목차 5) 쇼츠 소재 5개를 기본으로 제공하세요. 원문에 없는 사실을 만들지 마세요.",
};

export async function POST(request: Request) {
  try {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) return NextResponse.json({ success: false, error: "OpenAI API 키가 등록되지 않았습니다." }, { status: 500 });

    const body = await request.json();
    const tool = body.tool as ToolType;
    const topic = typeof body.topic === "string" ? body.topic.trim() : "";
    if (!prompts[tool] || !topic) return NextResponse.json({ success: false, error: "기능과 입력 내용을 확인해 주세요." }, { status: 400 });
    if (topic.length > 50000) return NextResponse.json({ success: false, error: "입력 내용이 너무 깁니다. 5만 자 이하로 나누어 주세요." }, { status: 400 });

    const client = new OpenAI({ apiKey });
    const response = await client.responses.create({
      model: "gpt-5-mini",
      instructions: "한국어로 명확하고 실무적으로 답하세요. 교단과 신학적 입장이 입력되지 않았다면 건강한 복음주의 개신교의 일반적 범위에서 균형 있게 작성하고, AI가 최종 목회 판단을 대신한다고 표현하지 마세요.",
      input: `${prompts[tool]}\n\n사용자 입력:\n${topic}`,
    });

    return NextResponse.json({ success: true, result: response.output_text.trim() });
  } catch (error) {
    const message = error instanceof Error ? error.message : "생성 중 오류가 발생했습니다.";
    const friendly = message.includes("quota") || message.includes("429") ? "OpenAI API 사용 한도 또는 결제 잔액을 확인해 주세요." : message;
    return NextResponse.json({ success: false, error: friendly }, { status: 500 });
  }
}
