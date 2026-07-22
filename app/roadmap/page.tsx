import WorkspaceTool from "../components/WorkspaceTool";
import V2Sidebar from "../components/V2Sidebar";

export default function RoadmapPage() {
  return (
    <main className="v2-shell">
      <V2Sidebar />
      <section className="v2-main">
        <div className="v2-page-head">
          <div><div className="eyebrow">CHURCH ROADMAP</div><h1>교회 로드맵</h1><p>교회의 현재를 질문에 따라 정리하면 3년 비전과 실행계획을 만들어 드립니다.</p></div>
        </div>
        <WorkspaceTool fixedMode="roadmap" />
      </section>
    </main>
  );
}
