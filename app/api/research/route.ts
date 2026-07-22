import OpenAI from "openai";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET() {
  return NextResponse.json({ success: true, message: "API is running" });
}

export async function POST(request: Request) {
  try {
    const key = process.env.OPENAI_API_KEY;
    if (!key) return NextResponse.json({ success: false, error: "OPENAI_API_KEY is missing" }, { status: 500 });

    const { passage } = await request.json();
    if (typeof passage !== "string" || !passage.trim()) return NextResponse.json({ success: false, error: "본문을 입력해 주세요." }, { status: 400 });

    const client = new OpenAI({ apiKey: key });
    const response = await client.responses.create({
      model: "gpt-5-mini",
      instructions: `당신은 목회자의 심층 본문 연구를 돕는 성경해석 조교입니다. 건강한 복음주의 개신교 범위 안에서 균형 있게 설명하되, 학계에 견해 차이가 있으면 숨기지 말고 비교하세요. 실제로 확인하지 못한 책, 저자, 페이지, 직접 인용을 절대로 만들어내지 마세요. 출처는 공개적으로 확인 가능한 자료와 널리 알려진 표준 참고자료를 구분해 제시하고, 정확한 페이지를 확인하지 못하면 페이지를 쓰지 마세요. 설교문을 대신 쓰기보다 주해와 연구를 제공하세요. 반드시 유효한 JSON만 출력하세요.`,
      input: `다음 본문을 심층 연구하세요: ${passage}

반드시 다음 키를 포함한 JSON으로 출력하세요.
passage: 연구 본문
summary: 핵심 메시지를 충분히 설명한 요약
historicalBackground: 정치·사회·종교·문화 배경
author: 저자 및 저자 논의
 audience: 원래 독자와 상황
literaryContext: 앞뒤 문맥과 책 전체에서의 위치
structure: 본문 단락 구조 배열
keyThemes: 핵심 신학 주제 배열
exegesis: 절 또는 단락별 상세 주해 배열. 각 항목은 section, explanation, evidence 키
originalLanguage: 핵심 원어 배열. 각 항목은 word, transliteration, grammar, meaning, caution 키
canonicalConnections: 정경적·병행 본문 연결 배열. 각 항목은 reference, connection 키
theologicalPerspectives: 주요 해석 견해 배열. 각 항목은 view, strengths, cautions 키
application: 오늘의 적용 질문 배열
cautions: 해석상 주의사항 배열
sources: 참고자료 배열. 각 항목은 title, authorOrOrganization, type, url, note 키. url은 실제로 확실히 아는 공개 URL만 쓰고, 모르면 빈 문자열로 두세요. BibleProject, NET Bible notes, STEP Bible, Blue Letter Bible, Bible Odyssey 등 공개 자료를 필요할 때 활용하되 특정 전통을 절대화하지 마세요.
furtherStudy: 추가 연구 질문 배열`,
    });

    const text = response.output_text.trim().replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/\s*```$/i, "");
    const result = JSON.parse(text);
    return NextResponse.json({ success: true, result });
  } catch (error) {
    const message = error instanceof Error ? error.message : "알 수 없는 오류가 발생했습니다.";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
