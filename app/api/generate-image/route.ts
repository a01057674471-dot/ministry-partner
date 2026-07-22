import OpenAI from "openai";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

function friendlyError(message: string) {
  const lower = message.toLowerCase();
  if (lower.includes("quota") || lower.includes("429") || lower.includes("insufficient_quota")) return "이미지 생성 한도 또는 OpenAI 결제 잔액을 확인해 주세요.";
  if (lower.includes("api key") || lower.includes("401") || lower.includes("authentication")) return "OpenAI API 키 설정을 확인해 주세요.";
  return "이미지를 만드는 중 오류가 발생했습니다. 내용을 조금 바꿔 다시 시도해 주세요.";
}

const typeDirections: Record<string, string> = {
  card: "Premium Korean church card-news background, clean editorial composition, calm visual rhythm, generous negative space for a short headline, sophisticated and easy to read.",
  feed: "High-end Instagram feed visual for a Korean church, polished lifestyle editorial composition, balanced subject placement, modern and refined.",
  thumbnail: "Attention-grabbing YouTube or short-form thumbnail background, strong focal point, bold cinematic lighting, high contrast, clear empty area for a large title.",
  poster: "Professional church event poster background, premium editorial art direction, dramatic but tasteful composition, large intentional typography zone, event-ready visual hierarchy.",
  banner: "Wide church banner background, panoramic composition, strong left-to-right flow, clean central or side typography area, suitable for web and stage screens.",
};

const styleDirections: Record<string, string> = {
  photo: "Photorealistic professional photography, natural skin texture when people appear, realistic anatomy, premium commercial retouching, cinematic depth and lighting.",
  cinematic: "Cinematic still, emotionally resonant lighting, rich depth, controlled contrast, premium film-like color grading, visually powerful but not excessive.",
  minimal: "Minimal contemporary design, restrained elements, elegant whitespace, subtle texture, premium Korean editorial sensibility.",
  illustration: "High-quality contemporary editorial illustration, refined shapes, coherent palette, polished details, not childish unless requested.",
  watercolor: "Soft premium watercolor illustration, translucent layers, natural paper texture, gentle edges, tasteful and emotionally warm.",
  threeD: "Premium stylized 3D render, clean geometry, soft studio lighting, refined materials, modern and professional rather than toy-like.",
};

const moodDirections: Record<string, string> = {
  bright: "Bright, hopeful, welcoming, airy natural light, fresh and uplifting atmosphere.",
  warm: "Warm, sincere, pastoral, comforting light, gentle emotional tone.",
  holy: "Reverent, sacred, peaceful, restrained, luminous atmosphere without visual clichés or kitsch.",
  dynamic: "Energetic, youthful, dynamic movement, modern contrast, strong visual momentum.",
  premium: "Elegant, premium, sophisticated, restrained luxury, polished commercial finish.",
};

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const prompt = typeof body?.prompt === "string" ? body.prompt.trim() : "";
    const size = body?.size === "1024x1536" || body?.size === "1536x1024" ? body.size : "1024x1024";
    const type = typeof body?.type === "string" ? body.type : "card";
    const style = typeof body?.style === "string" ? body.style : "photo";
    const mood = typeof body?.mood === "string" ? body.mood : "premium";
    const quality = body?.quality === "high" ? "high" : "medium";

    if (!prompt) return NextResponse.json({ success: false, error: "만들 이미지 내용을 입력해 주세요." }, { status: 400 });
    if (prompt.length > 5000) return NextResponse.json({ success: false, error: "이미지 설명은 5,000자 이하로 줄여 주세요." }, { status: 400 });

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) return NextResponse.json({ success: false, error: "OpenAI API 키가 등록되지 않았습니다." }, { status: 503 });

    const expandedPrompt = `
Create a production-ready visual asset for a Korean church ministry platform.

FORMAT AND PURPOSE
- ${typeDirections[type] ?? typeDirections.card}
- ${styleDirections[style] ?? styleDirections.photo}
- ${moodDirections[mood] ?? moodDirections.premium}

USER'S VISUAL BRIEF
${prompt}

ART DIRECTION
- Premium, contemporary, refined Korean visual sensibility.
- Strong focal point and intentional composition.
- Leave generous clean negative space where a Korean title can later be overlaid by the website.
- Keep faces, hands, and important subjects away from the title area.
- Use realistic anatomy and natural proportions whenever people appear.
- Use Korean people and Korean church context when people or a church setting are relevant.
- Avoid dated church-poster aesthetics, clip-art, cheesy symbolism, clutter, and generic stock-photo appearance.
- Do not automatically insert crosses, Bibles, church buildings, doves, light rays, or praying hands unless the user specifically requests them.
- High detail, polished lighting, coherent palette, professional commercial finish.

ABSOLUTE EXCLUSIONS
- No text of any kind.
- No Korean, English, numbers, symbols, captions, signs, labels, logos, watermarks, signatures, UI elements, or typographic shapes.
- No malformed hands, extra fingers, distorted faces, duplicated people, blurry subjects, compression artifacts, or low-resolution details.

Return one clean finished image only.`.trim();

    const client = new OpenAI({ apiKey, timeout: quality === "high" ? 180000 : 120000, maxRetries: 0 });
    const response = await client.images.generate({
      model: "gpt-image-1",
      prompt: expandedPrompt,
      size,
      quality,
    });

    const image = response.data?.[0];
    if (!image?.b64_json) return NextResponse.json({ success: false, error: "생성된 이미지 데이터가 비어 있습니다." }, { status: 502 });

    return NextResponse.json({ success: true, quality, imageUrl: `data:image/png;base64,${image.b64_json}` });
  } catch (error) {
    const message = error instanceof Error ? error.message : "이미지 생성 오류";
    console.error("[api/generate-image]", message);
    return NextResponse.json({ success: false, error: friendlyError(message) }, { status: 500 });
  }
}
