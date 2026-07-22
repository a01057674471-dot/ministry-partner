import OpenAI from "openai";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 60;

type UnknownRecord = Record<string, unknown>;

function asString(value: unknown, fallback = "확인 필요") {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function asStringArray(value: unknown) {
  return Array.isArray(value) ? value.map((item) => asString(item, "")).filter(Boolean) : [];
}

function asObjectArray(value: unknown) {
  return Array.isArray(value) ? value.filter((item): item is UnknownRecord => Boolean(item) && typeof item === "object" && !Array.isArray(item)) : [];
}

function normalizeResult(raw: UnknownRecord, requestedPassage: string) {
  return {
    passage: asString(raw.passage, requestedPassage),
    summary: asString(raw.summary),
    historicalBackground: asString(raw.historicalBackground),
    author: asString(raw.author),
    audience: asString(raw.audience),
    literaryContext: asString(raw.literaryContext),
    structure: asStringArray(raw.structure),
    keyThemes: asStringArray(raw.keyThemes),
    exegesis: asObjectArray(raw.exegesis).map((item) => ({
      section: asString(item.section),
      explanation: asString(item.explanation),
      evidence: asString(item.evidence),
    })),
    originalLanguage: asObjectArray(raw.originalLanguage).map((item) => ({
      word: asString(item.word),
      transliteration: asString(item.transliteration),
      grammar: asString(item.grammar),
      meaning: asString(item.meaning),
      caution: asString(item.caution, ""),
    })),
    canonicalConnections: asObjectArray(raw.canonicalConnections).map((item) => ({
      reference: asString(item.reference),
      connection: asString(item.connection),
    })),
    theologicalPerspectives: asObjectArray(raw.theologicalPerspectives).map((item) => ({
      view: asString(item.view),
      strengths: asString(item.strengths),
      cautions: asString(item.cautions),
    })),
    application: asStringArray(raw.application),
    cautions: asStringArray(raw.cautions),
    sources: asObjectArray(raw.sources).map((item) => ({
      title: asString(item.title),
      authorOrOrganization: asString(item.authorOrOrganization),
      type: asString(item.type),
      url: asString(item.url, ""),
      note: asString(item.note),
    })),
    furtherStudy: asStringArray(raw.furtherStudy),
  };
}

function friendlyError(error: unknown) {
  const message = error instanceof Error ? error.message : "알 수 없는 오류가 발생했습니다.";
  const lower = message.toLowerCase();
  if (lower.includes("429") || lower.includes("quota") || lower.includes("insufficient_quota")) return "OpenAI API 사용 한도 또는 결제 상태를 확인해 주세요.";
  if (lower.includes("401") || lower.includes("api key") || lower.includes("authentication")) return "OpenAI API 키가 올바르지 않거나 만료되었습니다.";
  if (lower.includes("timeout") || lower.includes("timed out") || lower.includes("abort")) return "연구 시간이 초과되었습니다. 본문 범위를 조금 줄여 다시 시도해 주세요.";
  if (lower.includes("model")) return "현재 연구 모델을 사용할 수 없습니다. 잠시 후 다시 시도해 주세요.";
  return "연구 결과를 만드는 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.";
}

export async function GET() {
  return NextResponse.json({ success: true, message: "Research API is running" });
}

export async function POST(request: Request) {
  try {
    const key = process.env.OPENAI_API_KEY;
    if (!key) return NextResponse.json({ success: false, error: "OpenAI API 키가 설정되지 않았습니다." }, { status: 503 });

    const body = await request.json();
    const passage = typeof body?.passage === "string" ? body.passage.trim() : "";
    if (!passage) return NextResponse.json({ success: false, error: "본문을 입력해 주세요." }, { status: 400 });
    if (passage.length > 200) return NextResponse.json({ success: false, error: "본문 입력은 200자 이하로 줄여 주세요." }, { status: 400 });

    const client = new OpenAI({ apiKey: key, timeout: 52000, maxRetries: 1 });
    const model = process.env.OPENAI_RESEARCH_MODEL || "gpt-4.1-mini";

    const completion = await client.chat.completions.create({
      model,
      response_format: { type: "json_object" },
      temperature: 0.25,
      max_tokens: 6500,
      messages: [
        {
          role: "system",
          content: "당신은 목회자의 심층 본문 연구를 돕는 성경해석 조교입니다. 건강한 복음주의 개신교 범위 안에서 균형 있게 설명하세요. 원어 관찰과 AI의 해석을 구분하고, 견해 차이를 비교하세요. 확인하지 못한 책, 페이지, 직접 인용, URL을 만들지 마세요. 반드시 유효한 JSON 객체 하나만 출력하세요.",
        },
        {
          role: "user",
          content: `다음 본문을 심층 연구하세요: ${passage}\n\n반드시 다음 키를 모두 포함하세요: passage, summary, historicalBackground, author, audience, literaryContext, structure, keyThemes, exegesis, originalLanguage, canonicalConnections, theologicalPerspectives, application, cautions, sources, furtherStudy.\n배열 객체 구조: exegesis={section, explanation, evidence}, originalLanguage={word, transliteration, grammar, meaning, caution}, canonicalConnections={reference, connection}, theologicalPerspectives={view, strengths, cautions}, sources={title, authorOrOrganization, type, url, note}.\n공개 URL을 확실히 아는 경우에만 넣고, 확실하지 않으면 url은 빈 문자열로 두세요. 분량은 모바일에서 읽기 좋게 각 항목을 간결하게 작성하세요.`,
        },
      ],
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) throw new Error("empty response");
    const parsed = JSON.parse(content) as UnknownRecord;

    return NextResponse.json({ success: true, result: normalizeResult(parsed, passage) });
  } catch (error) {
    console.error("[api/research]", error);
    return NextResponse.json({ success: false, error: friendlyError(error) }, { status: 500 });
  }
}
