import WorkspaceTool from "../components/WorkspaceTool";
import V2Sidebar from "../components/V2Sidebar";

export default function RoadmapPage() {
  return (
    <main className="v2-shell">
      <V2Sidebar />
      <section className="v2-main">
        <div className="v2-page-head">
          <div><div className="eyebrow">CHURCH ROADMAP</div><h1>교회 로드맵</h1><p>교회의 현재를 돌아보고 비전과 실행계획을 차근차근 세웁니다.</p></div>
        </div>
        <WorkspaceTool fixedMode="roadmap" />
      </section>
    </main>
  );
}
