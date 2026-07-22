import OpenAI from "openai";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET() {
  return NextResponse.json({ success: true, message: "API is running" });
}

export async function POST(request: Request) {
  try {
    const key = process.env.OPENAI_API_KEY;
    if (!key) {
      return NextResponse.json({ success: false, error: "OPENAI_API_KEY is missing" }, { status: 500 });
    }

    const { passage } = await request.json();
    if (typeof passage !== "string" || !passage.trim()) {
      return NextResponse.json({ success: false, error: "본문을 입력해 주세요." }, { status: 400 });
    }

    const client = new OpenAI({ apiKey: key });
    const response = await client.responses.create({
      model: "gpt-5-mini",
      input: `다음 성경 본문을 건강한 복음주의 개신교 관점에서 한국어로 연구해 주세요: ${passage}. 설교문을 대신 작성하지 말고, 반드시 다음 키를 가진 JSON만 출력하세요: passage, summary, historicalBackground, author, audience, literaryContext, structure, keyThemes, originalLanguage, application, cautions. structure, keyThemes, application, cautions는 문자열 배열이고 originalLanguage는 word, transliteration, meaning을 가진 객체 배열입니다.`,
    });

    const text = response.output_text.trim().replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/\s*```$/i, "");
    const result = JSON.parse(text);
    return NextResponse.json({ success: true, result });
  } catch (error) {
    const message = error instanceof Error ? error.message : "알 수 없는 오류가 발생했습니다.";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
