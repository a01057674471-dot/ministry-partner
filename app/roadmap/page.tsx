import WorkspaceTool from "../components/WorkspaceTool";
import V2Sidebar from "../components/V2Sidebar";

export default function RoadmapPage() {
  return (
    <main className="v2-shell">
      <V2Sidebar />
      <section className="v2-main">
        <div className="v2-page-head">
          <div><div className="eyebrow">MY CHURCH</div><h1>내 교회</h1><p>교회 현황을 정리하고 비전과 실행계획을 한곳에서 준비합니다.</p></div>
        </div>
        <WorkspaceTool fixedMode="roadmap" />
      </section>
    </main>
  );
}
