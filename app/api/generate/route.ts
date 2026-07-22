import OpenAI from "openai";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

type ToolType = "shorts" | "ideas" | "thumbnail" | "devotional";

const prompts: Record<ToolType, string> = {
  shorts: "60초 이하 한국어 쇼츠 대본을 작성하세요. 첫 2초 훅, 자연스러운 본문, 마무리 질문, 화면 자막 문구 5개를 포함하세요. 과장과 신학적 단정을 피하고 실제 촬영하기 쉽게 작성하세요.",
  ideas: "입력 주제로 교회·성경 SNS 콘텐츠 아이디어 10개를 작성하세요. 각 아이디어마다 제목, 핵심 메시지, 영상 구성, 참여 유도 문장을 포함하세요.",
  thumbnail: "입력 주제에 맞는 쇼츠 썸네일 문구 10개와 이미지 생성 프롬프트 3개를 작성하세요. 문구는 짧고 가독성 있게, 이미지는 세련되고 과장되지 않게 작성하세요.",
  devotional: "입력한 성경 본문이나 주제로 짧은 묵상 콘텐츠를 작성하세요. 본문 요약, 오늘의 질문 3개, 기도문, SNS 본문을 포함하되 설교문처럼 단정하지 마세요.",
};

export async function POST(request: Request) {
  try {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ success: false, error: "OpenAI API 키가 등록되지 않았습니다." }, { status: 500 });
    }

    const body = await request.json();
    const tool = body.tool as ToolType;
    const topic = typeof body.topic === "string" ? body.topic.trim() : "";

    if (!prompts[tool] || !topic) {
      return NextResponse.json({ success: false, error: "기능과 주제를 확인해 주세요." }, { status: 400 });
    }

    const client = new OpenAI({ apiKey });
    const response = await client.responses.create({
      model: "gpt-5-mini",
      input: `${prompts[tool]}\n\n사용자 입력: ${topic}`,
    });

    return NextResponse.json({ success: true, result: response.output_text.trim() });
  } catch (error) {
    const message = error instanceof Error ? error.message : "생성 중 오류가 발생했습니다.";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
