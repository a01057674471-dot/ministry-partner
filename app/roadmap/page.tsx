import WorkspaceTool from "../components/WorkspaceTool";
import V2Sidebar from "../components/V2Sidebar";

export default function RoadmapPage() {
  return (
    <main className="v2-shell">
      <V2Sidebar />
      <section className="v2-main">
        <div className="v2-page-head">
          <div><div className="eyebrow">MINISTRY ROADMAP</div><h1>사역 로드맵</h1><p>목회자·전도사·간사·선교사·평신도 사역자의 현재를 정리하고 향후 3년과 5년의 비전과 실행계획을 설계합니다.</p></div>
        </div>
        <WorkspaceTool fixedMode="roadmap" />
      </section>
    </main>
  );
}
