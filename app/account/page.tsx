"use client";

import { FormEvent, useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { getSupabaseBrowserClient, isSupabaseConfigured } from "../lib/supabase-client";

const SYNC_KEYS = [
  ["ministry-partner-projects-v3", "프로젝트와 작업"],
  ["ministry-partner-name", "사용자 이름"],
  ["ministry-partner-denomination", "교단 설정"],
  ["ministry-partner-theology", "신학 성향 설정"],
] as const;

const denominations = ["초교파", "장로교", "감리교", "침례교", "성결교", "순복음", "루터교", "성공회", "기타"];
const theologyOptions = ["균형적 복음주의", "개혁주의", "웨슬리안·알미니안", "오순절·은사주의", "사용자가 직접 검토"];

export default function AccountPage() {
  const [user, setUser] = useState<User | null>(null);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [denomination, setDenomination] = useState("초교파");
  const [theology, setTheology] = useState("균형적 복음주의");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const configured = isSupabaseConfigured();

  useEffect(() => {
    const savedName = localStorage.getItem("ministry-partner-name");
    const savedDenomination = localStorage.getItem("ministry-partner-denomination");
    const savedTheology = localStorage.getItem("ministry-partner-theology");
    if (savedName) setName(savedName);
    if (savedDenomination) setDenomination(savedDenomination);
    if (savedTheology) setTheology(savedTheology);
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;
    supabase.auth.getUser().then(({ data }) => applyUser(data.user));
    const { data } = supabase.auth.onAuthStateChange((_event, session) => applyUser(session?.user ?? null));
    return () => data.subscription.unsubscribe();
  }, []);

  function applyUser(nextUser: User | null) {
    setUser(nextUser);
    if (!nextUser) return;
    const userName = nextUser.user_metadata?.full_name || nextUser.user_metadata?.name || nextUser.email?.split("@")[0] || "사용자";
    setName(userName);
    localStorage.setItem("ministry-partner-name", userName);
  }

  function savePreferences() {
    localStorage.setItem("ministry-partner-denomination", denomination);
    localStorage.setItem("ministry-partner-theology", theology);
    setMessage("교단과 신학 성향을 저장했습니다. 이후 AI 결과에 참고됩니다.");
  }

  async function sendMagicLink(event: FormEvent) {
    event.preventDefault();
    const supabase = getSupabaseBrowserClient();
    if (!supabase || !email.trim()) return;
    setLoading(true); setMessage("");
    const { error } = await supabase.auth.signInWithOtp({ email: email.trim(), options: { emailRedirectTo: `${window.location.origin}/account` } });
    setMessage(error ? error.message : "로그인 링크를 이메일로 보냈습니다. 메일에서 링크를 눌러 주세요.");
    setLoading(false);
  }

  async function signInWithGoogle() {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;
    setMessage("");
    const { error } = await supabase.auth.signInWithOAuth({ provider: "google", options: { redirectTo: `${window.location.origin}/account` } });
    if (error) setMessage("Google 로그인 설정이 아직 완료되지 않았습니다. 이메일 로그인은 바로 사용할 수 있습니다.");
  }

  async function syncNow() {
    const supabase = getSupabaseBrowserClient();
    if (!supabase || !user) return;
    setLoading(true); setMessage("");
    const rows = SYNC_KEYS.flatMap(([key]) => { const value = localStorage.getItem(key); return value === null ? [] : [{ user_id: user.id, document_key: key, content: value, updated_at: new Date().toISOString() }]; });
    const { error } = rows.length ? await supabase.from("user_documents").upsert(rows, { onConflict: "user_id,document_key" }) : { error: null };
    setMessage(error ? error.message : "현재 기기의 자료와 설정을 클라우드에 저장했습니다.");
    setLoading(false);
  }

  async function signOut() {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;
    await supabase.auth.signOut(); setMessage("로그아웃했습니다.");
  }

  return (
    <main className="account-shell">
      <header className="account-header"><a href="/" className="account-brand"><span className="brand-mark">↔</span><strong>사역파트너</strong></a><div><a href="/pricing">요금제</a>　<a href="/">홈으로</a></div></header>
      <section className="account-card">
        <p className="account-kicker">계정 및 클라우드</p>
        <h1>{user ? `${name}님, 환영합니다.` : "어디서든 이어서 작업하세요"}</h1>
        <p>{user ? "오늘도 필요한 사역을 편하게 준비해 보세요." : "로그인하면 작업과 설정을 PC와 휴대폰에서 이어서 사용할 수 있습니다."}</p>
        {!configured ? <div className="account-warning"><strong>Supabase 연결이 필요합니다.</strong><p>Vercel 환경 변수를 확인해 주세요.</p></div> : user ? <div className="account-signed"><div className="account-user"><span>{name.slice(0,1)}</span><div><strong>{name}</strong><p>{user.email}</p></div></div><button className="account-primary" onClick={syncNow} disabled={loading}>{loading ? "동기화 중…" : "지금 클라우드에 저장"}</button><button className="account-secondary" onClick={signOut}>로그아웃</button></div> : <div className="account-login"><button className="account-google" onClick={signInWithGoogle}>Google로 계속하기</button><div className="account-divider"><span>또는</span></div><form onSubmit={sendMagicLink}><label>이메일</label><input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="pastor@example.com" required /><button className="account-primary" disabled={loading}>{loading ? "보내는 중…" : "이메일 로그인 링크 받기"}</button></form></div>}
        {message && <div className="account-message">{message}</div>}
      </section>
      <section className="account-data-card"><h2>교단·신학 성향</h2><p>정답을 강요하는 설정이 아니라, 결과의 표현과 관점을 조정하는 참고값입니다. 모든 결과는 직접 검토해 주세요.</p><div className="account-preference-grid"><label><strong>교단</strong><select value={denomination} onChange={(e)=>setDenomination(e.target.value)}>{denominations.map((item)=><option key={item}>{item}</option>)}</select></label><label><strong>신학 성향</strong><select value={theology} onChange={(e)=>setTheology(e.target.value)}>{theologyOptions.map((item)=><option key={item}>{item}</option>)}</select></label></div><button className="account-primary" onClick={savePreferences}>설정 저장</button></section>
      <section className="account-data-card"><h2>동기화되는 항목</h2><div>{SYNC_KEYS.map(([key, label]) => <article key={key}><span>✓</span><strong>{label}</strong></article>)}</div><small>로그인 전에는 이 기기의 브라우저에 저장됩니다.</small></section>
    </main>
  );
}
