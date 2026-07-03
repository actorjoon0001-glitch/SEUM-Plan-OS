import Link from "next/link";
import PageHeader from "@/components/PageHeader";
import StatusBadge from "@/components/StatusBadge";
import { Card, CardHeader } from "@/components/Card";
import { ConnectionNotice } from "@/components/Notice";
import { getContracts, getDrawings, getSubmissions } from "@/lib/data";
import {
  contractTitle,
  designOwner,
  designStatusLabel,
  isDesignDone,
} from "@/lib/contract";
import { formatDate } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const [contractsRes, drawingsRes, submissionsRes] = await Promise.all([
    getContracts(),
    getDrawings(),
    getSubmissions(),
  ]);

  const contracts = contractsRes.data;
  const drawings = drawingsRes.data;
  const submissions = submissionsRes.data;

  const designPending = contracts.filter((c) => !isDesignDone(c));
  const urgent = contracts.filter((c) => c.is_urgent && !isDesignDone(c));

  const stats = [
    { label: "설계 대상 계약", value: contracts.length, unit: "건", href: "/contracts", tone: "text-brand-600" },
    { label: "설계 진행 필요", value: designPending.length, unit: "건", href: "/contracts", tone: "text-amber-600" },
    { label: "등록 도면", value: drawings.length, unit: "개", href: "/drawings", tone: "text-indigo-600" },
    { label: "인허가 서류", value: submissions.length, unit: "건", href: "/permits", tone: "text-emerald-600" },
  ];

  // 설계 상태별 집계
  const byStatus = new Map<string, number>();
  for (const c of contracts) {
    const s = designStatusLabel(c);
    byStatus.set(s, (byStatus.get(s) ?? 0) + 1);
  }
  const pipeline = [...byStatus.entries()].sort((a, b) => b[1] - a[1]);

  // 설계 필요 계약 (급한 것 우선, 최근 계약일 순)
  const attention = [...designPending]
    .sort((a, b) => {
      if (!!b.is_urgent !== !!a.is_urgent) return b.is_urgent ? 1 : -1;
      return (b.contract_date ?? "").localeCompare(a.contract_date ?? "");
    })
    .slice(0, 8);

  const recentDrawings = drawings.slice(0, 6);

  return (
    <>
      <PageHeader
        title="설계팀 대시보드"
        description="세움os 실데이터 기준 설계 진행 현황입니다."
      />

      <ConnectionNotice
        configured={contractsRes.configured}
        error={contractsRes.error}
      />

      {/* 통계 */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((s) => (
          <Link key={s.label} href={s.href}>
            <Card className="p-5 transition-shadow hover:shadow-md">
              <p className="text-sm text-slate-500">{s.label}</p>
              <p className="mt-2 flex items-baseline gap-1">
                <span className={`text-3xl font-bold ${s.tone}`}>{s.value}</span>
                <span className="text-sm text-slate-400">{s.unit}</span>
              </p>
            </Card>
          </Link>
        ))}
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* 설계 필요 계약 */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader
              title="설계 진행 필요"
              action={<span className="text-xs text-slate-400">급한 건 우선</span>}
            />
            {attention.length === 0 ? (
              <p className="px-5 py-8 text-center text-sm text-slate-400">
                설계 대기 중인 계약이 없습니다.
              </p>
            ) : (
              <div className="divide-y divide-slate-100">
                {attention.map((c) => (
                  <Link
                    key={c.id}
                    href={c.local_id ? `/contracts/${encodeURIComponent(c.local_id)}` : "/contracts"}
                    className="flex items-center justify-between gap-3 px-5 py-4 hover:bg-slate-50"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        {c.is_urgent && (
                          <span className="rounded bg-rose-100 px-1.5 py-0.5 text-[10px] font-bold text-rose-600">
                            긴급
                          </span>
                        )}
                        <span className="truncate text-sm font-semibold text-slate-900">
                          {contractTitle(c)}
                        </span>
                      </div>
                      <p className="mt-0.5 text-xs text-slate-500">
                        {c.customer_name ?? "-"} · 담당 {designOwner(c)}
                        {c.contract_date ? ` · ${formatDate(c.contract_date)}` : ""}
                      </p>
                    </div>
                    <StatusBadge status={designStatusLabel(c)} />
                  </Link>
                ))}
              </div>
            )}
          </Card>

          {/* 최근 도면 */}
          <Card className="mt-6">
            <CardHeader
              title="최근 도면"
              action={
                <Link href="/drawings" className="text-xs text-brand-600 hover:underline">
                  전체 보기
                </Link>
              }
            />
            {recentDrawings.length === 0 ? (
              <p className="px-5 py-8 text-center text-sm text-slate-400">
                등록된 도면이 없습니다.
              </p>
            ) : (
              <div className="divide-y divide-slate-100">
                {recentDrawings.map((d) => (
                  <div key={d.id} className="flex items-center justify-between px-5 py-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-slate-800">
                        {d.file_name ?? "(파일명 없음)"}
                      </p>
                      <p className="text-xs text-slate-400">
                        계약 {d.contract_local_id ?? "-"} · {d.uploaded_by ?? "-"}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {d.kind && (
                        <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[11px] text-slate-500">
                          {d.kind}
                        </span>
                      )}
                      <span className="text-xs text-slate-400">
                        {formatDate(d.uploaded_at)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* 설계 상태 분포 */}
        <div>
          <Card>
            <CardHeader title="설계 상태 분포" />
            {pipeline.length === 0 ? (
              <p className="px-5 py-8 text-center text-sm text-slate-400">
                데이터가 없습니다.
              </p>
            ) : (
              <div className="space-y-3 px-5 py-4">
                {pipeline.map(([status, count]) => {
                  const pct = contracts.length
                    ? Math.round((count / contracts.length) * 100)
                    : 0;
                  return (
                    <div key={status}>
                      <div className="mb-1 flex items-center justify-between text-sm">
                        <StatusBadge status={status} />
                        <span className="font-medium text-slate-600">{count}건</span>
                      </div>
                      <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
                        <div
                          className="h-full rounded-full bg-brand-500"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>

          <Card className="mt-6 p-5">
            <p className="text-sm font-semibold text-slate-800">긴급 설계 건</p>
            <p className="mt-2 text-3xl font-bold text-rose-600">
              {urgent.length}
              <span className="ml-1 text-sm font-normal text-slate-400">건</span>
            </p>
            <p className="mt-1 text-xs text-slate-500">
              긴급 표시된 계약 중 설계 미완료 건
            </p>
          </Card>
        </div>
      </div>
    </>
  );
}
