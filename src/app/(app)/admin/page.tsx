"use client";

import { useEffect, useMemo, useState } from "react";
import PageHeader from "@/components/PageHeader";
import { Card } from "@/components/Card";
import { useUser } from "@/components/UserContext";
import { createClient } from "@/lib/supabase/client";
import { isAdmin } from "@/lib/admin";

interface LoginRow {
  id: number;
  email: string | null;
  logged_in_at: string | null;
  user_agent: string | null;
  ip: string | null;
}
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

type Kind = "login" | "activity";
interface Event {
  key: string;
  kind: Kind;
  time: string | null;
  email: string | null;
  action: string;
  detail: string;
  device: string; // 기기 (login)
  ip: string; // 접속 IP (login)
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

/** UA → 기기/브라우저 요약 */
function shortUA(ua: string | null): string {
  if (!ua) return "";
  const os = /iPhone|iPad/.test(ua)
    ? "iPhone/iPad"
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
  const mobile = /Mobile|Android|iPhone/.test(ua);
  const dev = mobile ? "📱" : "💻";
  return `${dev} ${[os, br].filter(Boolean).join(" · ") || "기타"}`;
}

const ACTION_TONE: Record<string, string> = {
  로그인: "bg-emerald-50 text-emerald-700",
  "설계담당 변경": "bg-brand-50 text-brand-700",
  "설계진행 상태 변경": "bg-blue-50 text-blue-700",
  "메모 변경": "bg-slate-100 text-slate-600",
  "검토 승인": "bg-emerald-50 text-emerald-700",
  "승인 취소": "bg-amber-50 text-amber-700",
  "도면 업로드": "bg-teal-50 text-teal-700",
  "도면 삭제": "bg-rose-50 text-rose-700",
  "권한 변경": "bg-violet-50 text-violet-700",
};

const TABS: { key: "all" | Kind; label: string }[] = [
  { key: "all", label: "전체" },
  { key: "login", label: "로그인 기록" },
  { key: "activity", label: "작업 내역" },
];

export default function AdminPage() {
  const { session } = useUser();
  const admin = isAdmin(session?.user.email);

  const [logins, setLogins] = useState<LoginRow[]>([]);
  const [acts, setActs] = useState<ActRow[]>([]);
  const [emps, setEmps] = useState<Emp[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<"all" | Kind>("all");
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (!admin) {
      setLoading(false);
      return;
    }
    let alive = true;
    (async () => {
      const sb = createClient();
      // ip 컬럼이 없을 수 있어 실패 시 ip 없이 재조회
      let loginData: LoginRow[] = [];
      let loginErr: string | null = null;
      {
        const r1 = await sb
          .from("plan_os_login_log")
          .select("id, email, logged_in_at, user_agent, ip")
          .order("logged_in_at", { ascending: false })
          .limit(500);
        if (
          r1.error &&
          /column|schema cache|could not find/i.test(r1.error.message)
        ) {
          const r2 = await sb
            .from("plan_os_login_log")
            .select("id, email, logged_in_at, user_agent")
            .order("logged_in_at", { ascending: false })
            .limit(500);
          loginData = (r2.data as LoginRow[]) ?? [];
          loginErr = r2.error?.message ?? null;
        } else {
          loginData = (r1.data as LoginRow[]) ?? [];
          loginErr = r1.error?.message ?? null;
        }
      }
      const [actRes, empRes] = await Promise.all([
        sb
          .from("plan_os_activity_log")
          .select("id, actor_email, action, target, detail, created_at")
          .order("created_at", { ascending: false })
          .limit(1000),
        sb.from("employees").select("email, name, team"),
      ]);
      if (!alive) return;
      if (loginErr) setError(loginErr);
      setLogins(loginData);
      setActs((actRes.data as ActRow[]) ?? []);
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

  function nameOf(email: string | null): string {
    const e = email ? empMap.get(email.toLowerCase()) : undefined;
    if (e?.name) return `${e.team ? e.team + " " : ""}${e.name}`;
    return email ?? "-";
  }

  const events = useMemo<Event[]>(() => {
    const evs: Event[] = [];
    for (const r of logins) {
      evs.push({
        key: `l-${r.id}`,
        kind: "login",
        time: r.logged_in_at,
        email: r.email,
        action: "로그인",
        detail: "",
        device: shortUA(r.user_agent),
        ip: r.ip ?? "",
      });
    }
    for (const r of acts) {
      const detail = [r.target, r.detail].filter(Boolean).join(" · ");
      evs.push({
        key: `a-${r.id}`,
        kind: "activity",
        time: r.created_at,
        email: r.actor_email,
        action: r.action ?? "작업",
        detail,
        device: "",
        ip: "",
      });
    }
    return evs.sort((a, b) => (b.time ?? "").localeCompare(a.time ?? ""));
  }, [logins, acts]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return events.filter((e) => {
      if (tab !== "all" && e.kind !== tab) return false;
      if (!q) return true;
      return [nameOf(e.email), e.action, e.detail, e.ip]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q));
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [events, tab, query, empMap]);

  if (!admin) {
    return (
      <>
        <PageHeader title="로그인 기록" description="관리자 전용 페이지입니다." />
        <Card className="p-8 text-center text-sm text-slate-500">
          이 페이지는 관리자만 접근할 수 있습니다.
        </Card>
      </>
    );
  }

  return (
    <>
      <PageHeader
        title="로그인 기록"
        description={`최근 로그인·작업 기록입니다. (${events.length}건)`}
      />

      {loading ? (
        <Card className="p-10 text-center text-sm text-slate-400">
          불러오는 중…
        </Card>
      ) : (
        <>
          <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap gap-1.5">
              {TABS.map((t) => (
                <button
                  key={t.key}
                  type="button"
                  onClick={() => setTab(t.key)}
                  className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors ${
                    tab === t.key
                      ? "bg-brand-600 text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="이름 · 작업 · 상세 검색"
              className="w-full rounded-lg border border-slate-200 px-3.5 py-2 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100 sm:max-w-xs"
            />
          </div>

          {error && logins.length === 0 && acts.length === 0 && (
            <Card className="mb-3 p-4">
              <p className="text-sm text-amber-700">
                기록 테이블이 아직 없거나 접근 권한이 없습니다. (에러: {error})
              </p>
            </Card>
          )}

          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50 text-left text-xs text-slate-500">
                    <th className="px-4 py-2.5 font-medium">시각(KST)</th>
                    <th className="px-4 py-2.5 font-medium">이름</th>
                    <th className="px-4 py-2.5 font-medium">작업</th>
                    <th className="px-4 py-2.5 font-medium">기기 · 접속 IP</th>
                    <th className="px-4 py-2.5 font-medium">상세</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filtered.length === 0 ? (
                    <tr>
                      <td
                        colSpan={5}
                        className="px-4 py-10 text-center text-slate-400"
                      >
                        기록이 없습니다.
                      </td>
                    </tr>
                  ) : (
                    filtered.map((e) => (
                      <tr key={e.key}>
                        <td className="whitespace-nowrap px-4 py-2.5 text-slate-600">
                          {fmt(e.time)}
                        </td>
                        <td className="whitespace-nowrap px-4 py-2.5 font-medium text-slate-800">
                          {nameOf(e.email)}
                        </td>
                        <td className="whitespace-nowrap px-4 py-2.5">
                          <span
                            className={`rounded px-1.5 py-0.5 text-xs font-medium ${
                              ACTION_TONE[e.action] ??
                              "bg-slate-100 text-slate-600"
                            }`}
                          >
                            {e.action}
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-4 py-2.5 text-slate-500">
                          {e.kind === "login" ? (
                            <div className="leading-tight">
                              <div>{e.device || "-"}</div>
                              {e.ip && (
                                <div className="text-xs text-slate-400">
                                  {e.ip}
                                </div>
                              )}
                            </div>
                          ) : (
                            <span className="text-slate-300">-</span>
                          )}
                        </td>
                        <td className="max-w-[24rem] truncate px-4 py-2.5 text-slate-500">
                          {e.detail || (e.kind === "login" ? "로그인" : "")}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </>
      )}
    </>
  );
}
