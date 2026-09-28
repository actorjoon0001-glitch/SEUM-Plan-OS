"use client";

import { useEffect, useMemo, useState } from "react";
import PageHeader from "@/components/PageHeader";
import { Card } from "@/components/Card";
import { useUser } from "@/components/UserContext";
import { createClient } from "@/lib/supabase/client";
import { isAdmin } from "@/lib/admin";

interface ActRow {
  id: number;
  actor_email: string | null;
  action: string | null;
  target: string | null;
  detail: string | null;
  created_at: string | null;
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
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const ACTION_TONE: Record<string, string> = {
  "설계담당 변경": "bg-brand-50 text-brand-700",
  "설계진행 상태 변경": "bg-blue-50 text-blue-700",
  "메모 변경": "bg-slate-100 text-slate-600",
  "검토 승인": "bg-emerald-50 text-emerald-700",
  "승인 취소": "bg-amber-50 text-amber-700",
  "도면 업로드": "bg-teal-50 text-teal-700",
  "도면 삭제": "bg-rose-50 text-rose-700",
  "권한 변경": "bg-violet-50 text-violet-700",
};

export default function ActivityPage() {
  const { session } = useUser();
  const admin = isAdmin(session?.user.email);

  const [rows, setRows] = useState<ActRow[] | null>(null);
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
      const [actRes, empRes] = await Promise.all([
        sb
          .from("plan_os_activity_log")
          .select("id, actor_email, action, target, detail, created_at")
          .order("created_at", { ascending: false })
          .limit(1000),
        sb.from("employees").select("email, name, team"),
      ]);
      if (!alive) return;
      if (actRes.error) setError(actRes.error.message);
      setRows((actRes.data as ActRow[]) ?? []);
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

  function who(email: string | null): string {
    const e = email ? empMap.get(email.toLowerCase()) : undefined;
    if (e?.name) return `${e.team ? e.team + " " : ""}${e.name}`;
    return email ?? "-";
  }

  if (!admin) {
    return (
      <>
        <PageHeader title="활동 기록" description="관리자 전용 페이지입니다." />
        <Card className="p-8 text-center text-sm text-slate-500">
          이 페이지는 관리자만 접근할 수 있습니다.
        </Card>
      </>
    );
  }

  return (
    <>
      <PageHeader
        title="활동 기록"
        description="설계os 에서 누가 어떤 작업을 했는지 기록입니다."
      />

      {loading ? (
        <Card className="p-10 text-center text-sm text-slate-400">
          불러오는 중…
        </Card>
      ) : error && (rows?.length ?? 0) === 0 ? (
        <Card className="p-6">
          <p className="text-sm font-medium text-amber-700">
            활동 기록 테이블(plan_os_activity_log)이 아직 없거나 접근 권한이
            없습니다.
          </p>
          <p className="mt-2 text-xs text-slate-500">
            Supabase 에 테이블과 권한(RLS)을 먼저 만들어 주세요. (에러: {error})
          </p>
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50 text-left text-xs text-slate-500">
                  <th className="px-4 py-2.5 font-medium">시각</th>
                  <th className="px-4 py-2.5 font-medium">담당자</th>
                  <th className="px-4 py-2.5 font-medium">작업</th>
                  <th className="px-4 py-2.5 font-medium">대상</th>
                  <th className="px-4 py-2.5 font-medium">상세</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {(rows ?? []).length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-4 py-10 text-center text-slate-400"
                    >
                      기록이 없습니다.
                    </td>
                  </tr>
                ) : (
                  (rows ?? []).map((r) => (
                    <tr key={r.id}>
                      <td className="whitespace-nowrap px-4 py-2.5 text-slate-500">
                        {fmt(r.created_at)}
                      </td>
                      <td className="whitespace-nowrap px-4 py-2.5 font-medium text-slate-800">
                        {who(r.actor_email)}
                      </td>
                      <td className="whitespace-nowrap px-4 py-2.5">
                        <span
                          className={`rounded px-1.5 py-0.5 text-xs font-medium ${
                            ACTION_TONE[r.action ?? ""] ??
                            "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {r.action ?? "-"}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-slate-700">
                        {r.target || "-"}
                      </td>
                      <td className="max-w-[24rem] truncate px-4 py-2.5 text-slate-500">
                        {r.detail || ""}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </>
  );
}
