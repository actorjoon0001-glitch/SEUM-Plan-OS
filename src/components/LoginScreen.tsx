"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";

/**
 * 전체 화면 로그인. 성공 시 onAuthStateChange 로 AppShell 이 앱을 보여준다.
 * (리다이렉트/쿠키 없이 localStorage 세션 사용 → iframe 안에서도 동작)
 */
export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (error) {
        setError(
          error.message === "Invalid login credentials"
            ? "이메일 또는 비밀번호가 올바르지 않습니다."
            : `로그인 실패: ${error.message}`,
        );
        setLoading(false);
      }
      // 성공 시: 상태 변경은 AppShell 이 감지 → 로딩 유지된 채 화면 전환
    } catch (err) {
      setError(`연결 오류: ${err instanceof Error ? err.message : String(err)}`);
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-600 text-lg font-bold text-white">
            세움
          </div>
          <h1 className="mt-3 text-lg font-bold text-slate-900">Plan OS</h1>
          <p className="text-sm text-slate-400">설계팀 전용 워크스페이스</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          {isSupabaseConfigured ? (
            <form onSubmit={onSubmit} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  이메일
                </label>
                <input
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="세움os 이메일"
                  className="w-full rounded-lg border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  비밀번호
                </label>
                <input
                  type="password"
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="세움os 비밀번호"
                  className="w-full rounded-lg border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
                />
              </div>

              {error && (
                <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-600">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-lg bg-brand-600 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-700 disabled:opacity-60"
              >
                {loading ? "로그인 중..." : "로그인"}
              </button>
            </form>
          ) : (
            <p className="text-center text-sm text-amber-600">
              Supabase 연결 설정이 필요합니다. 환경변수를 확인하세요.
            </p>
          )}
          <p className="mt-4 text-center text-xs text-slate-400">
            세움os 계정(이메일·비밀번호)으로 로그인하세요.
          </p>
        </div>
      </div>
    </div>
  );
}
