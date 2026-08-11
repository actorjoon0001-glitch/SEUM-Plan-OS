"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import type { Session } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import Sidebar from "@/components/Sidebar";
import LoginScreen from "@/components/LoginScreen";
import { UserProvider } from "@/components/UserContext";
import type { Employee } from "@/types";

/**
 * 클라이언트 인증 게이트.
 * - 세션 없음 → 로그인 화면
 * - 세션 있음 → 사이드바 + 앱
 * localStorage 세션이라 통합플랫폼 iframe 안에서도 그대로 동작한다.
 */
export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(false);
  const [employee, setEmployee] = useState<Employee | null>(null);

  // 넓은 표/임베드가 있는 페이지는 전체 폭 사용 (수기 계약서 · 우선순위 · 전자계약서)
  const fullWidth =
    pathname.startsWith("/contracts") ||
    pathname.startsWith("/priority") ||
    pathname.startsWith("/review-priority") ||
    pathname.startsWith("/econtracts");

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setReady(true);
      return;
    }
    const supabase = createClient();
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setReady(true);
    });
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, s) => setSession(s));
    return () => subscription.unsubscribe();
  }, []);

  // 로그인한 사용자의 직원 정보(이름/팀) 조회
  useEffect(() => {
    if (!session) {
      setEmployee(null);
      return;
    }
    const supabase = createClient();
    (async () => {
      const uid = session.user.id;
      const mail = session.user.email;
      let { data } = await supabase
        .from("employees")
        .select("*")
        .eq("auth_user_id", uid)
        .maybeSingle();
      if (!data && mail) {
        ({ data } = await supabase
          .from("employees")
          .select("*")
          .eq("email", mail)
          .maybeSingle());
      }
      setEmployee((data as Employee) ?? null);
    })();
  }, [session]);

  // 초기 세션 확인 중
  if (!ready) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-300 border-t-brand-600" />
      </div>
    );
  }

  // 미로그인 (설정이 없으면 로그인 화면에서 안내)
  if (!session && isSupabaseConfigured) {
    return <LoginScreen />;
  }

  return (
    <UserProvider value={{ session, employee }}>
      <div className="flex h-screen overflow-hidden">
        <Sidebar
          userName={employee?.name}
          userEmail={session?.user.email}
          userTeam={employee?.team}
        />
        <main className="flex-1 overflow-y-auto">
          <div
            className={`px-6 py-8 lg:px-8 ${fullWidth ? "" : "mx-auto max-w-7xl"}`}
          >
            {children}
          </div>
        </main>
      </div>
    </UserProvider>
  );
}
