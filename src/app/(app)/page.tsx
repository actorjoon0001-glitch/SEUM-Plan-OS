"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import PageHeader from "@/components/PageHeader";
import { Card } from "@/components/Card";
import { formatDate } from "@/lib/format";

interface PriorityItem {
  key: string;
  customer: string;
  model: string;
  date: string;
  status: string;
  eco: boolean;
  href: string | null;
}

interface FirmItem {
  id: number | string;
  title: string;
  by: string;
  at: string;
  url: string;
  assigned: boolean;
}

interface Firm {
  name: string;
  slug: string;
  unassigned: number;
  total: number;
  ts: string[];
  items: FirmItem[];
}

interface DashData {
  priority: { unassigned: number; ts: string[]; items: PriorityItem[] };
  partners: Record<string, Firm>;
}

/** 신규(N) 계산 — localStorage seen:{key} 기준. 읽기 전용(사이드바 baseline 미간섭) */
function newCountOf(key: string, ts: string[]): number {
  const maxTs = ts.reduce((a, b) => (b > a ? b : a), "");
  let baseline = "";
  try {
    baseline = localStorage.getItem(`seen:${key}`) ?? "";
  } catch {}
  if (!baseline) baseline = maxTs; // 처음 보는 경우: 기존 자료는 신규 아님
  return ts.filter((t) => t > baseline).length;
}

export default function DashboardPage() {
  const [data, setData] = useState<DashData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    fetch("/api/dashboard")
      .then((r) => r.json())
      .then((d: DashData) => {
        if (alive) setData(d);
      })
      .catch(() => {})
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, []);

  const priority = data?.priority;
  const partners = data?.partners
    ? (Object.values(data.partners) as Firm[])
    : [];
  const priorityNew = priority ? newCountOf("priority", priority.ts) : 0;

  return (
    <>
      <PageHeader
        title="설계팀 대시보드"
        description="담당자 미배정 건과 새로 들어온 건을 한눈에 봅니다."
      />

      {loading ? (
        <p className="py-16 text-center text-sm text-slate-400">
          불러오는 중…
        </p>
      ) : (
        <div className="space-y-8">
          {/* 설계팀 우선순위 */}
          <section>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900">
                <span aria-hidden>⭐</span> 설계팀 우선순위
              </h2>
              <Link
                href="/priority"
                className="text-sm font-medium text-brand-600 hover:underline"
              >
                전체 보기 →
              </Link>
            </div>

            <div className="mb-4 grid grid-cols-2 gap-4">
              <StatTile
                label="담당자 미배정"
                value={priority?.unassigned ?? 0}
                tone="rose"
                sub="설계담당 지정 대기"
              />
              <StatTile
                label="신규 유입"
                value={priorityNew}
                prefix="N"
                tone="emerald"
                sub="최근 확인 이후 새 건"
              />
            </div>

            <Card>
              {priority && priority.items.length > 0 ? (
                <ul className="divide-y divide-slate-100">
                  {priority.items.map((it) => (
                    <li key={it.key}>
                      <Link
                        href={it.href ?? "/priority"}
                        className="flex items-center justify-between gap-3 px-5 py-3.5 hover:bg-slate-50"
                      >
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            {it.eco && (
                              <span className="shrink-0 rounded bg-emerald-100 px-1.5 py-0.5 text-[10px] font-bold text-emerald-700">
                                ⚡전자계약
                              </span>
                            )}
                            <span className="truncate text-sm font-semibold text-slate-900">
                              {it.customer}
                            </span>
                            {it.model && (
                              <span className="truncate text-xs text-slate-400">
                                {it.model}
                              </span>
                            )}
                          </div>
                          <p className="mt-0.5 text-xs text-slate-400">
                            {it.date ? formatDate(it.date) : "계약일 미상"}
                          </p>
                        </div>
                        <span className="shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-500">
                          {it.status}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="px-5 py-10 text-center text-sm text-slate-400">
                  배정 대기 중인 건이 없습니다.
                </p>
              )}
            </Card>
          </section>

          {/* 외부 건축 협력사 */}
          <section>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900">
                <span aria-hidden>🏢</span> 외부 건축 협력사
              </h2>
            </div>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
              {partners.map((f) => {
                const fNew = newCountOf(f.slug, f.ts);
                return (
                  <Card key={f.slug} className="flex flex-col p-5">
                    <div className="flex items-center justify-between">
                      <Link
                        href={`/partners/${f.slug}`}
                        className="text-base font-bold text-slate-900 hover:text-brand-600"
                      >
                        {f.name}
                      </Link>
                      <span className="text-xs text-slate-400">
                        총 {f.total}건
                      </span>
                    </div>

                    <div className="mt-3 flex gap-2">
                      <Pill
                        label="미배정"
                        value={f.unassigned}
                        tone={f.unassigned > 0 ? "rose" : "slate"}
                      />
                      <Pill
                        label="신규"
                        value={fNew}
                        prefix="N"
                        tone={fNew > 0 ? "emerald" : "slate"}
                      />
                    </div>

                    <div className="mt-4 flex-1 border-t border-slate-100 pt-3">
                      {f.items.length > 0 ? (
                        <ul className="space-y-2">
                          {f.items.map((s) => (
                            <li key={String(s.id)} className="min-w-0">
                              {s.url ? (
                                <a
                                  href={s.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="block truncate text-sm text-slate-700 hover:text-brand-600"
                                >
                                  📄 {s.title}
                                </a>
                              ) : (
                                <span className="block truncate text-sm text-slate-700">
                                  📄 {s.title}
                                </span>
                              )}
                              <span className="text-[11px] text-slate-400">
                                {s.by || "협력사"}
                                {s.at ? ` · ${formatDate(s.at)}` : ""}
                              </span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="py-4 text-center text-xs text-slate-400">
                          등록된 자료가 없습니다.
                        </p>
                      )}
                    </div>

                    <Link
                      href={`/partners/${f.slug}`}
                      className="mt-3 text-xs font-medium text-brand-600 hover:underline"
                    >
                      전체 보기 →
                    </Link>
                  </Card>
                );
              })}
            </div>
          </section>
        </div>
      )}
    </>
  );
}

function StatTile({
  label,
  value,
  prefix = "",
  tone,
  sub,
}: {
  label: string;
  value: number;
  prefix?: string;
  tone: "rose" | "emerald";
  sub?: string;
}) {
  const color =
    tone === "rose"
      ? value > 0
        ? "text-rose-600"
        : "text-slate-300"
      : value > 0
        ? "text-emerald-600"
        : "text-slate-300";
  return (
    <Card className="p-5">
      <p className="text-sm text-slate-500">{label}</p>
      <p className={`mt-1 text-4xl font-bold ${color}`}>
        {prefix}
        {value}
      </p>
      {sub && <p className="mt-1 text-xs text-slate-400">{sub}</p>}
    </Card>
  );
}

function Pill({
  label,
  value,
  prefix = "",
  tone,
}: {
  label: string;
  value: number;
  prefix?: string;
  tone: "rose" | "emerald" | "slate";
}) {
  const cls =
    tone === "rose"
      ? "bg-rose-50 text-rose-700 ring-rose-600/20"
      : tone === "emerald"
        ? "bg-emerald-50 text-emerald-700 ring-emerald-600/20"
        : "bg-slate-50 text-slate-500 ring-slate-500/20";
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-semibold ring-1 ${cls}`}
    >
      {label}
      <b className="text-sm">
        {prefix}
        {value}
      </b>
    </span>
  );
}
