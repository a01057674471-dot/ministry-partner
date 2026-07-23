import OpenAI from "openai";
import { NextResponse } from "next/server";
import { checkRateLimit } from "../../lib/rate-limit";

export const runtime = "nodejs";

const formats = ["ppt", "cardnews", "shorts", "thumbnail", "instagram", "bulletin", "smallgroup", "prayer"] as const;
type Format = (typeof formats)[number];

const prompts: Record<Format, string> = {
  ppt: "원본을 발표용 PPT 구성으로 재가공하세요. 10장 내외로 슬라이드 번호, 제목, 핵심 문장, 발표자 메모, 추천 이미지 방향을 작성하세요. 한 슬라이드에 문장을 과도하게 넣지 마세요.",
  cardnews: "원본을 7장 카드뉴스로 재가공하세요. 각 장마다 제목, 본문 2~3문장, 강조 문구, 이미지 방향을 작성하고 마지막 장에는 적용 질문과 참여 유도 문장을 넣으세요.",
  shorts: "원본을 45~60초 쇼츠로 재가공하세요. 0~2초 훅, 장면별 대사, 화면 자막, 장면 전환, 마무리 질문, 인스타 본문, 고정댓글을 포함하세요.",
  thumbnail: "원본의 핵심 갈등과 메시지를 분석해 썸네일 문구 10개와 AI 이미지 생성 프롬프트 3개를 작성하세요. 문구는 짧고 과장된 낚시는 피하세요.",
  instagram: "원본을 인스타그램 게시물로 재가공하세요. 첫 문장 훅, 읽기 쉬운 본문, 핵심 문장, 적용 질문, 고정댓글, 해시태그를 작성하세요.",
  bulletin: "원본을 교회 주보용 글로 재가공하세요. 제목, 본문 요약, 이번 주 적용, 함께 드릴 기도, 관련 성경구절 순서로 간결하게 작성하세요.",
  smallgroup: "원본을 소그룹 교재로 재가공하세요. 모임 목표, 아이스브레이킹, 본문 관찰, 해석 질문, 적용 질문, 나눔 유의점, 함께 드릴 기도를 포함하세요.",
  prayer: "원본의 핵심 메시지와 적용을 바탕으로 공예배 또는 소그룹에서 사용할 수 있는 자연스러운 기도문으로 재가공하세요. 원본에 없는 구체적 사건이나 인물을 만들지 마세요.",
};

export async function POST(request: Request) {
  try {
    const rateLimit = checkRateLimit(request, { key: "transform", limit: 10, windowMs: 60_000 });
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { success: false, error: "변환 요청이 많습니다. 잠시 후 다시 시도해 주세요." },
        { status: 429, headers: { "Retry-After": String(rateLimit.retryAfterSeconds) } },
      );
    }

    let body: Record<string, unknown>;
    try {
      const parsed = await request.json();
      body = parsed && typeof parsed === "object" ? parsed as Record<string, unknown> : {};
    }
    catch { return NextResponse.json({ success: false, error: "요청 형식이 올바르지 않습니다." }, { status: 400 }); }
    const format = body?.format as Format;
    const source = typeof body?.source === "string" ? body.source.trim() : "";
    const instruction = typeof body?.instruction === "string" ? body.instruction.trim() : "";
    if (!formats.includes(format)) return NextResponse.json({ success: false, error: "지원하지 않는 변환 형식입니다." }, { status: 400 });
    if (!source) return NextResponse.json({ success: false, error: "변환할 원본을 입력해 주세요." }, { status: 400 });
    if (source.length > 50000) return NextResponse.json({ success: false, error: "원본이 너무 깁니다. 5만 자 이하로 나누어 주세요." }, { status: 400 });

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) return NextResponse.json({ success: false, error: "OpenAI API 키가 등록되지 않았습니다." }, { status: 503 });

    const client = new OpenAI({ apiKey, timeout: 120000, maxRetries: 1 });
    const response = await client.responses.create({
      model: "gpt-5-mini",
      instructions: "당신은 목회 콘텐츠 재가공 전문가입니다. 원본의 신학적 의미와 핵심 메시지를 왜곡하지 말고 한국어로 실무적으로 작성하세요. 확인하지 못한 사실이나 출처를 만들지 마세요.",
      input: `${prompts[format]}\n\n추가 수정 요청:\n${instruction || "없음"}\n\n원본:\n${source}`,
    });
    const result = response.output_text?.trim();
    if (!result) return NextResponse.json({ success: false, error: "변환 결과가 비어 있습니다." }, { status: 502 });
    return NextResponse.json({ success: true, format, result });
  } catch (error) {
    console.error("[api/transform]", error);
    return NextResponse.json({ success: false, error: "변환 중 오류가 발생했습니다." }, { status: 500 });
  }
}
