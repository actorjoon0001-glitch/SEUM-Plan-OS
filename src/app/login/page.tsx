import LoginForm from "./LoginForm";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export const dynamic = "force-dynamic";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string }>;
}) {
  const { redirect } = await searchParams;

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-sm">
        {/* 로고 */}
        <div className="mb-8 flex flex-col items-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-600 text-lg font-bold text-white">
            세움
          </div>
          <h1 className="mt-3 text-lg font-bold text-slate-900">Plan OS</h1>
          <p className="text-sm text-slate-400">설계팀 전용 워크스페이스</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          {isSupabaseConfigured ? (
            <LoginForm redirectTo={redirect ?? "/"} />
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
