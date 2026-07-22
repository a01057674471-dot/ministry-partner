"use client";

import { FormEvent, useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { getSupabaseBrowserClient, isSupabaseConfigured } from "../lib/supabase-client";

const SYNC_KEYS = [
  ["ministry-partner-projects-v3", "프로젝트와 작업공간"],
  ["ministry-library-favorites", "자료실 즐겨찾기"],
  ["ministry-library-custom", "직접 추가한 자료"],
  ["ministry-transform-history-v1", "변환 기록"],
  ["ministry-partner-name", "사용자 이름"],
] as const;

export default function AccountPage() {
  const [user, setUser] = useState<User | null>(null);
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const configured = isSupabaseConfigured();

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    const { data } = supabase.auth.onAuthStateChange((_event, session) => setUser(session?.user ?? null));
    return () => data.subscription.unsubscribe();
  }, []);

  async function sendMagicLink(event: FormEvent) {
    event.preventDefault();
    const supabase = getSupabaseBrowserClient();
    if (!supabase || !email.trim()) return;
    setLoading(true);
    setMessage("");
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: { emailRedirectTo: `${window.location.origin}/account` },
    });
    setMessage(error ? error.message : "로그인 링크를 이메일로 보냈습니다. 메일에서 링크를 눌러 주세요.");
    setLoading(false);
  }

  async function signInWithGoogle() {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/account` },
    });
  }

  async function syncNow() {
    const supabase = getSupabaseBrowserClient();
    if (!supabase || !user) return;
    setLoading(true);
    setMessage("");
    const rows = SYNC_KEYS.flatMap(([key]) => {
      const value = localStorage.getItem(key);
      return value === null ? [] : [{ user_id: user.id, document_key: key, content: value, updated_at: new Date().toISOString() }];
    });
    const { error } = rows.length
      ? await supabase.from("user_documents").upsert(rows, { onConflict: "user_id,document_key" })
      : { error: null };
    setMessage(error ? error.message : "현재 기기의 자료를 클라우드에 저장했습니다.");
    setLoading(false);
  }

  async function signOut() {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;
    await supabase.auth.signOut();
    setMessage("로그아웃했습니다.");
  }

  return (
    <main className="account-shell">
      <header className="account-header">
        <a href="/" className="account-brand">✦ <strong>목회파트너</strong></a>
        <a href="/">홈으로</a>
      </header>

      <section className="account-card">
        <p className="account-kicker">계정 및 클라우드</p>
        <h1>어디서든 이어서 작업하세요</h1>
        <p>로그인하면 프로젝트, 자료실, 변환 기록이 PC와 휴대폰에서 자동으로 동기화됩니다.</p>

        {!configured ? (
          <div className="account-warning">
            <strong>Supabase 연결이 필요합니다.</strong>
            <p>Vercel 환경 변수에 NEXT_PUBLIC_SUPABASE_URL과 NEXT_PUBLIC_SUPABASE_ANON_KEY를 등록한 뒤 다시 배포해 주세요.</p>
          </div>
        ) : user ? (
          <div className="account-signed">
            <div className="account-user"><span>{(user.email || "사용자").slice(0, 1).toUpperCase()}</span><div><strong>로그인됨</strong><p>{user.email}</p></div></div>
            <button className="account-primary" onClick={syncNow} disabled={loading}>{loading ? "동기화 중…" : "지금 클라우드에 저장"}</button>
            <button className="account-secondary" onClick={signOut}>로그아웃</button>
          </div>
        ) : (
          <div className="account-login">
            <button className="account-google" onClick={signInWithGoogle}>Google로 계속하기</button>
            <div className="account-divider"><span>또는</span></div>
            <form onSubmit={sendMagicLink}>
              <label>이메일</label>
              <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="pastor@example.com" required />
              <button className="account-primary" disabled={loading}>{loading ? "보내는 중…" : "이메일 로그인 링크 받기"}</button>
            </form>
          </div>
        )}

        {message && <div className="account-message">{message}</div>}
      </section>

      <section className="account-data-card">
        <h2>동기화되는 항목</h2>
        <div>{SYNC_KEYS.map(([key, label]) => <article key={key}><span>✓</span><strong>{label}</strong></article>)}</div>
        <small>로그인 전에는 기존처럼 이 기기의 브라우저에 저장됩니다.</small>
      </section>
    </main>
  );
}
