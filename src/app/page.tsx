import Link from "next/link";
import PageHeader from "@/components/PageHeader";
import StatusBadge from "@/components/StatusBadge";
import { Card, CardHeader } from "@/components/Card";
import {
  projects,
  drawings,
  coordinationItems,
  permits,
} from "@/lib/mock-data";
import { formatDate, daysUntil } from "@/lib/format";

export default function DashboardPage() {
  const activeProjects = projects.filter((p) => p.status === "진행중");
  const openCoordination = coordinationItems.filter((c) => c.status !== "완료");
  const pendingPermits = permits.filter(
    (p) => p.status !== "승인" && p.status !== "반려",
  );

  const stats = [
    {
      label: "진행중 프로젝트",
      value: activeProjects.length,
      unit: "건",
      href: "/",
      tone: "text-brand-600",
    },
    {
      label: "등록 도면",
      value: drawings.length,
      unit: "개",
      href: "/drawings",
      tone: "text-indigo-600",
    },
    {
      label: "협의 진행",
      value: openCoordination.length,
      unit: "건",
      href: "/coordination",
      tone: "text-amber-600",
    },
    {
      label: "인허가 진행",
      value: pendingPermits.length,
      unit: "건",
      href: "/permits",
      tone: "text-emerald-600",
    },
  ];

  // 마감 임박순 정렬
  const upcoming = [...activeProjects].sort(
    (a, b) => daysUntil(a.dueDate) - daysUntil(b.dueDate),
  );

  return (
    <>
      <PageHeader
        title="대시보드"
        description="세움 설계팀 전체 프로젝트 현황을 한눈에 확인하세요."
      />

      {/* 통계 카드 */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((s) => (
          <Link key={s.label} href={s.href}>
            <Card className="p-5 transition-shadow hover:shadow-md">
              <p className="text-sm text-slate-500">{s.label}</p>
              <p className="mt-2 flex items-baseline gap-1">
                <span className={`text-3xl font-bold ${s.tone}`}>
                  {s.value}
                </span>
                <span className="text-sm text-slate-400">{s.unit}</span>
              </p>
            </Card>
          </Link>
        ))}
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* 프로젝트 목록 */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader
              title="진행 프로젝트"
              action={
                <span className="text-xs text-slate-400">
                  마감 임박순
                </span>
              }
            />
            <div className="divide-y divide-slate-100">
              {upcoming.map((p) => {
                const d = daysUntil(p.dueDate);
                return (
                  <div key={p.id} className="px-5 py-4">
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="truncate text-sm font-semibold text-slate-900">
                            {p.name}
                          </span>
                          <StatusBadge status={p.status} />
                        </div>
                        <p className="mt-0.5 text-xs text-slate-500">
                          {p.client} · {p.phase} · PM {p.manager}
                        </p>
                      </div>
                      <div className="shrink-0 text-right">
                        <p className="text-xs font-medium text-slate-700">
                          {formatDate(p.dueDate)}
                        </p>
                        <p
                          className={`text-[11px] ${
                            d < 0
                              ? "text-rose-500"
                              : d <= 14
                                ? "text-amber-600"
                                : "text-slate-400"
                          }`}
                        >
                          {d < 0 ? `${-d}일 지남` : `D-${d}`}
                        </p>
                      </div>
                    </div>
                    {/* 진행률 바 */}
                    <div className="mt-2.5 flex items-center gap-2">
                      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100">
                        <div
                          className="h-full rounded-full bg-brand-500"
                          style={{ width: `${p.progress}%` }}
                        />
                      </div>
                      <span className="w-9 text-right text-[11px] font-medium text-slate-500">
                        {p.progress}%
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>

        {/* 우측: 협의 + 인허가 요약 */}
        <div className="space-y-6">
          <Card>
            <CardHeader title="협의 필요" />
            <div className="divide-y divide-slate-100">
              {openCoordination.map((c) => (
                <div
                  key={c.id}
                  className="flex items-center justify-between px-5 py-3"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-slate-800">
                      {c.title}
                    </p>
                    <p className="text-xs text-slate-400">
                      {c.discipline} · {c.assignee}
                    </p>
                  </div>
                  <StatusBadge status={c.status} />
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <CardHeader title="인허가 진행" />
            <div className="divide-y divide-slate-100">
              {pendingPermits.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between px-5 py-3"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-slate-800">
                      {p.name}
                    </p>
                    <p className="text-xs text-slate-400">{p.authority}</p>
                  </div>
                  <StatusBadge status={p.status} />
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}
