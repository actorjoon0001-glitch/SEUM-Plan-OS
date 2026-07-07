"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LoginForm({ redirectTo }: { redirectTo: string }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [embedded, setEmbedded] = useState(false);

  // 다른 도메인의 iframe 안에 임베드되었는지 감지
  // (임베드 상태에서는 서드파티 쿠키 차단으로 로그인 세션이 유지되지 않음)
  useEffect(() => {
    try {
      setEmbedded(window.self !== window.top);
    } catch {
      // window.top 접근이 막히면 교차 도메인 iframe 이 확실함
      setEmbedded(true);
    }
  }, []);

  if (embedded) {
    return (
      <div className="space-y-4 text-center">
        <p className="text-sm text-slate-600">
          통합플랫폼 안에서는 보안(쿠키) 정책으로 로그인이 제한됩니다.
          <br />
          아래 버튼으로 새 탭에서 열어 로그인하세요.
        </p>
        <a
          href={typeof window !== "undefined" ? window.location.origin : "/"}
          target="_blank"
          rel="noopener noreferrer"
          className="block w-full rounded-lg bg-brand-600 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-700"
        >
          새 탭에서 설계 OS 열기
        </a>
      </div>
    );
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const supabase = createClient();

      // 응답이 없어 무한 대기하는 것을 방지 (15초 타임아웃)
      const signIn = supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      const timeout = new Promise<never>((_, reject) =>
        setTimeout(
          () =>
            reject(
              new Error(
                "서버 응답 시간 초과 — Supabase 연결(URL/키) 또는 네트워크를 확인하세요.",
              ),
            ),
          15000,
        ),
      );

      const { error } = await Promise.race([signIn, timeout]);

      if (error) {
        // 원인 파악을 위해 실제 메시지를 표시
        const msg =
          error.message === "Invalid login credentials"
            ? "이메일 또는 비밀번호가 올바르지 않습니다."
            : `로그인 실패: ${error.message}`;
        setError(msg);
        setLoading(false);
        return;
      }

      router.push(redirectTo || "/");
      router.refresh();
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      setError(`연결 오류: ${message}`);
      setLoading(false);
    }
  }

  return (
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
  );
}
