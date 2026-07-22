import OpenAI from "openai";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

function friendlyError(message: string) {
  const lower = message.toLowerCase();
  if (lower.includes("quota") || lower.includes("429") || lower.includes("insufficient_quota")) return "이미지 생성 한도 또는 OpenAI 결제 잔액을 확인해 주세요.";
  if (lower.includes("api key") || lower.includes("401") || lower.includes("authentication")) return "OpenAI API 키 설정을 확인해 주세요.";
  return "이미지를 만드는 중 오류가 발생했습니다. 내용을 조금 바꿔 다시 시도해 주세요.";
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const prompt = typeof body?.prompt === "string" ? body.prompt.trim() : "";
    const size = body?.size === "1024x1536" || body?.size === "1536x1024" ? body.size : "1024x1024";

    if (!prompt) return NextResponse.json({ success: false, error: "만들 이미지 내용을 입력해 주세요." }, { status: 400 });
    if (prompt.length > 5000) return NextResponse.json({ success: false, error: "이미지 설명은 5,000자 이하로 줄여 주세요." }, { status: 400 });

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) return NextResponse.json({ success: false, error: "OpenAI API 키가 등록되지 않았습니다." }, { status: 503 });

    const client = new OpenAI({ apiKey, timeout: 180000, maxRetries: 1 });
    const response = await client.images.generate({
      model: "gpt-image-1",
      prompt: `한국 교회와 목회 현장에서 실제 사용할 수 있는 고품질 이미지를 제작하세요. 사용자가 요청하지 않은 로고나 워터마크는 넣지 마세요. 이미지 안에 한글 문구가 필요하다면 짧고 정확하게 표현하세요.\n\n사용자 요청:\n${prompt}`,
      size,
      quality: "medium",
    });

    const image = response.data?.[0];
    if (!image?.b64_json) return NextResponse.json({ success: false, error: "생성된 이미지 데이터가 비어 있습니다." }, { status: 502 });

    return NextResponse.json({ success: true, imageUrl: `data:image/png;base64,${image.b64_json}` });
  } catch (error) {
    const message = error instanceof Error ? error.message : "이미지 생성 오류";
    console.error("[api/generate-image]", message);
    return NextResponse.json({ success: false, error: friendlyError(message) }, { status: 500 });
  }
}
