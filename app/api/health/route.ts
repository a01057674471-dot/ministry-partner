import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const routes = [
  "/",
  "/research",
  "/sermon",
  "/prayer",
  "/roadmap",
  "/document",
  "/meeting",
  "/shorts",
  "/youtube-shorts",
  "/file-analysis",
  "/workspace",
];

export async function GET() {
  return NextResponse.json({
    success: true,
    service: "ministry-partner",
    timestamp: new Date().toISOString(),
    openAIConfigured: Boolean(process.env.OPENAI_API_KEY),
    routes,
    APIs: ["/api/generate", "/api/research", "/api/health"],
  });
}
