import WorkspaceTool from "../components/WorkspaceTool";
import V2Sidebar from "../components/V2Sidebar";

export default function WorshipPage() {
  return (
    <main className="v2-shell">
      <V2Sidebar />
      <section className="v2-main">
        <div className="v2-page-head">
          <div><div className="eyebrow">WORSHIP PLANNER</div><h1>찬양 플래너</h1><p>설교 본문과 예배 주제, 회중과 순서에 맞는 찬양과 복음성가를 추천합니다.</p></div>
        </div>
        <WorkspaceTool fixedMode="worship" />
      </section>
    </main>
  );
}
