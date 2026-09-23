"use client";

import { useEffect, useMemo, useState } from "react";
import PageHeader from "@/components/PageHeader";
import { Card, CardHeader } from "@/components/Card";
import { useUser } from "@/components/UserContext";
import { createClient } from "@/lib/supabase/client";
import { isAdmin } from "@/lib/admin";

interface LoginRow {
  id: number;
  email: string | null;
  logged_in_at: string | null;
  user_agent: string | null;
}

interface Emp {
  email: string | null;
  name: string | null;
  team: string | null;
}

function fmt(ts: string | null): string {
  if (!ts) return "-";
  const d = new Date(ts);
  if (isNaN(d.getTime())) return ts;
  return d.toLocaleString("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** UA 문자열 → 간단한 기기/브라우저 요약 */
function shortUA(ua: string | null): string {
  if (!ua) return "-";
  const os = /iPhone|iPad/.test(ua)
    ? "iOS"
    : /Android/.test(ua)
      ? "Android"
      : /Windows/.test(ua)
        ? "Windows"
        : /Mac OS X|Macintosh/.test(ua)
          ? "Mac"
          : "";
  const br = /Edg\//.test(ua)
    ? "Edge"
    : /Chrome\//.test(ua)
      ? "Chrome"
      : /Safari\//.test(ua)
        ? "Safari"
        : /Firefox\//.test(ua)
          ? "Firefox"
          : "";
  return [os, br].filter(Boolean).join(" · ") || "기타";
}

export default function AdminPage() {
  const { session } = useUser();
  const email = session?.user.email ?? null;
  const admin = isAdmin(email);

  const [rows, setRows] = useState<LoginRow[] | null>(null);
  const [emps, setEmps] = useState<Emp[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!admin) {
      setLoading(false);
      return;
    }
    let alive = true;
    (async () => {
      const sb = createClient();
      const [logRes, empRes] = await Promise.all([
        sb
          .from("plan_os_login_log")
          .select("id, email, logged_in_at, user_agent")
          .order("logged_in_at", { ascending: false })
          .limit(500),
        sb.from("employees").select("email, name, team"),
      ]);
      if (!alive) return;
      if (logRes.error) setError(logRes.error.message);
      setRows((logRes.data as LoginRow[]) ?? []);
      setEmps((empRes.data as Emp[]) ?? []);
      setLoading(false);
    })();
    return () => {
      alive = false;
    };
  }, [admin]);

  const empMap = useMemo(() => {
    const m = new Map<string, Emp>();
    for (const e of emps) if (e.email) m.set(e.email.toLowerCase(), e);
    return m;
  }, [emps]);

  // 사용자별 요약 (횟수 · 최근 로그인)
  const perUser = useMemo(() => {
    const m = new Map<string, { count: number; last: string | null }>();
    for (const r of rows ?? []) {
      const key = (r.email ?? "").toLowerCase();
      const cur = m.get(key) ?? { count: 0, last: null };
      cur.count += 1;
      if (!cur.last || (r.logged_in_at ?? "") > cur.last)
        cur.last = r.logged_in_at;
      m.set(key, cur);
    }
    return [...m.entries()]
      .map(([em, v]) => ({ email: em, ...v }))
      .sort((a, b) => (b.last ?? "").localeCompare(a.last ?? ""));
  }, [rows]);

  function nameOf(em: string | null): string {
    const e = em ? empMap.get(em.toLowerCase()) : undefined;
    return e?.name ?? "-";
  }
  function teamOf(em: string | null): string {
    const e = em ? empMap.get(em.toLowerCase()) : undefined;
    return e?.team ?? "";
  }

  if (!admin) {
    return (
      <>
        <PageHeader title="관리자" description="관리자 전용 페이지입니다." />
        <Card className="p-8 text-center text-sm text-slate-500">
          이 페이지는 관리자만 접근할 수 있습니다.
        </Card>
      </>
    );
  }

  return (
    <>
      <PageHeader
        title="관리자"
        description="설계os 로그인 기록을 확인합니다."
      />

      {loading ? (
        <Card className="p-10 text-center text-sm text-slate-400">
          불러오는 중…
        </Card>
      ) : error && (rows?.length ?? 0) === 0 ? (
        <Card className="p-6">
          <p className="text-sm font-medium text-amber-700">
            로그인 기록 테이블(plan_os_login_log)이 아직 없거나 접근 권한이
            없습니다.
          </p>
          <p className="mt-2 text-xs text-slate-500">
            Supabase 에 테이블과 권한(RLS)을 먼저 만들어 주세요. (에러: {error})
          </p>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* 요약 */}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            <Card className="p-5">
              <p className="text-sm text-slate-500">전체 로그인</p>
              <p className="mt-1 text-3xl font-bold text-brand-600">
                {rows?.length ?? 0}
              </p>
            </Card>
            <Card className="p-5">
              <p className="text-sm text-slate-500">접속 사용자 수</p>
              <p className="mt-1 text-3xl font-bold text-slate-800">
                {perUser.length}
              </p>
            </Card>
          </div>

          {/* 사용자별 요약 */}
          <Card>
            <CardHeader title={`사용자별 요약 (${perUser.length})`} />
            <div className="overflow-x-auto">
              <table className="w-full min-w-[560px] text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50 text-left text-xs text-slate-500">
                    <th className="px-4 py-2.5 font-medium">이름</th>
                    <th className="px-4 py-2.5 font-medium">팀</th>
                    <th className="px-4 py-2.5 font-medium">이메일</th>
                    <th className="px-4 py-2.5 text-right font-medium">로그인 횟수</th>
                    <th className="px-4 py-2.5 font-medium">최근 로그인</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {perUser.map((u) => (
                    <tr key={u.email}>
                      <td className="px-4 py-2.5 font-medium text-slate-800">
                        {nameOf(u.email)}
                      </td>
                      <td className="px-4 py-2.5 text-slate-500">
                        {teamOf(u.email)}
                      </td>
                      <td className="px-4 py-2.5 text-slate-500">{u.email}</td>
                      <td className="px-4 py-2.5 text-right font-semibold text-slate-700">
                        {u.count}
                      </td>
                      <td className="whitespace-nowrap px-4 py-2.5 text-slate-500">
                        {fmt(u.last)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {/* 로그인 이력 */}
          <Card>
            <CardHeader title={`로그인 이력 (최근 ${rows?.length ?? 0}건)`} />
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50 text-left text-xs text-slate-500">
                    <th className="px-4 py-2.5 font-medium">#</th>
                    <th className="px-4 py-2.5 font-medium">로그인 시각</th>
                    <th className="px-4 py-2.5 font-medium">이름</th>
                    <th className="px-4 py-2.5 font-medium">팀</th>
                    <th className="px-4 py-2.5 font-medium">이메일</th>
                    <th className="px-4 py-2.5 font-medium">기기</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {(rows ?? []).map((r, i) => (
                    <tr key={r.id}>
                      <td className="px-4 py-2.5 text-slate-400">{i + 1}</td>
                      <td className="whitespace-nowrap px-4 py-2.5 text-slate-700">
                        {fmt(r.logged_in_at)}
                      </td>
                      <td className="px-4 py-2.5 font-medium text-slate-800">
                        {nameOf(r.email)}
                      </td>
                      <td className="px-4 py-2.5 text-slate-500">
                        {teamOf(r.email)}
                      </td>
                      <td className="px-4 py-2.5 text-slate-500">{r.email}</td>
                      <td className="px-4 py-2.5 text-slate-400">
                        {shortUA(r.user_agent)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}
    </>
  );
}
