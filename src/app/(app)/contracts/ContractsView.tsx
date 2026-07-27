"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import StatusBadge from "@/components/StatusBadge";
import { Card } from "@/components/Card";
import type { Contract } from "@/types";
import { contractTitle, designStatusLabel } from "@/lib/contract";
import { formatDate, formatMoney } from "@/lib/format";
import {
  type TypeKey,
  TYPE_LABEL,
  TYPE_BADGE,
  projectTypeKey,
  regionOf,
  showroomOf,
} from "@/lib/priority";

const ALL = "전체";
type Tab = "all" | TypeKey;

export default function ContractsView({
  contracts,
}: {
  contracts: Contract[];
}) {
  const router = useRouter();
  // 기본값: 현재(해당) 년·월
  const [year, setYear] = useState(() => String(new Date().getFullYear()));
  const [month, setMonth] = useState(() => String(new Date().getMonth() + 1));
  const [showroom, setShowroom] = useState(ALL);
  const [tab, setTab] = useState<Tab>("all");
  const [query, setQuery] = useState("");

  const years = useMemo(() => {
    const set = new Set<string>();
    set.add(String(new Date().getFullYear())); // 현재 년도는 항상 포함
    for (const c of contracts) {
      const y = c.contract_date?.slice(0, 4);
      if (y) set.add(y);
    }
    return [...set].sort((a, b) => b.localeCompare(a));
  }, [contracts]);

  const showrooms = useMemo(() => {
    const set = new Set<string>();
    for (const c of contracts) {
      const s = showroomOf(c);
      if (s && s !== "-") set.add(s);
    }
    return [...set].sort();
  }, [contracts]);

  // 년/월/전시장 필터
  const base = useMemo(() => {
    return contracts.filter((c) => {
      const ymd = c.contract_date ?? "";
      if (year !== ALL && ymd.slice(0, 4) !== year) return false;
      if (month !== ALL && String(Number(ymd.slice(5, 7))) !== month) return false;
      if (showroom !== ALL && showroomOf(c) !== showroom) return false;
      return true;
    });
  }, [contracts, year, month, showroom]);

  // 유형별 카운트
  const counts = useMemo(() => {
    const c: Record<TypeKey, number> = { container: 0, stay: 0, house: 0, etc: 0 };
    for (const x of base) c[projectTypeKey(x)] += 1;
    return c;
  }, [base]);

  // 탭 + 검색 적용
  const list = useMemo(() => {
    let rows = tab === "all" ? base : base.filter((c) => projectTypeKey(c) === tab);
    const q = query.trim().toLowerCase();
    if (q) {
      rows = rows.filter((c) =>
        [c.customer_name, c.model_name, regionOf(c), showroomOf(c), c.sales_person, c.local_id]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(q),
      );
    }
    return rows;
  }, [base, tab, query]);

  const tabs: { key: Tab; label: string; count: number }[] = [
    { key: "all", label: "전체", count: base.length },
    { key: "container", label: TYPE_LABEL.container, count: counts.container },
    { key: "stay", label: TYPE_LABEL.stay, count: counts.stay },
    { key: "house", label: TYPE_LABEL.house, count: counts.house },
    { key: "etc", label: TYPE_LABEL.etc, count: counts.etc },
  ];

  const selectCls =
    "rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100";

  return (
    <div className="space-y-4">
      {/* 년/월/전시장 필터 */}
      <div className="flex flex-wrap items-end gap-4">
        <label className="flex flex-col gap-1">
          <span className="text-xs font-medium text-slate-500">년도</span>
          <select value={year} onChange={(e) => setYear(e.target.value)} className={selectCls}>
            <option value={ALL}>전체</option>
            {years.map((y) => (
              <option key={y} value={y}>{y}년</option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-xs font-medium text-slate-500">월</span>
          <select value={month} onChange={(e) => setMonth(e.target.value)} className={selectCls}>
            <option value={ALL}>전체</option>
            {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
              <option key={m} value={String(m)}>{m}월</option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-xs font-medium text-slate-500">전시장</span>
          <select value={showroom} onChange={(e) => setShowroom(e.target.value)} className={selectCls}>
            <option value={ALL}>전체</option>
            {showrooms.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </label>
        <span className="pb-2 text-xs text-slate-400">※ 년·월·전시장으로 목록을 필터합니다</span>
      </div>

      {/* 유형 탭 */}
      <div className="flex flex-wrap gap-2">
        {tabs.map((t) => {
          const activeTab = tab === t.key;
          return (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors ${
                activeTab
                  ? "bg-brand-600 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {t.label}
              <span className={`rounded-full px-1.5 text-xs ${activeTab ? "bg-white/25" : "bg-white text-slate-500"}`}>
                {t.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* 검색 */}
      <div className="flex items-center gap-3">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="건축주명 · 지역 · 주소 · 담당자 · 모델 검색"
          className="w-full rounded-lg border border-slate-200 px-3.5 py-2 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100 sm:max-w-sm"
        />
        <span className="whitespace-nowrap text-sm text-slate-500">총 {list.length}건</span>
      </div>

      {/* 목록 */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1100px] text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50 text-left text-xs text-slate-500">
                <th className="px-4 py-3 font-medium">#</th>
                <th className="px-4 py-3 font-medium">전시장</th>
                <th className="px-4 py-3 font-medium">주택유형</th>
                <th className="px-4 py-3 font-medium">모델</th>
                <th className="px-4 py-3 font-medium">계약일</th>
                <th className="px-4 py-3 font-medium">건축주</th>
                <th className="px-4 py-3 font-medium">주소</th>
                <th className="px-4 py-3 font-medium">영업담당</th>
                <th className="px-4 py-3 text-right font-medium">공사금액</th>
                <th className="px-4 py-3 text-right font-medium">계약금</th>
                <th className="px-4 py-3 text-right font-medium">중도금</th>
                <th className="px-4 py-3 text-right font-medium">잔금</th>
                <th className="px-4 py-3 font-medium">설계상태</th>
              </tr>
            </thead>
            <tbody>
              {list.length === 0 ? (
                <tr>
                  <td colSpan={13} className="px-4 py-10 text-center text-slate-400">
                    조건에 맞는 계약이 없습니다.
                  </td>
                </tr>
              ) : (
                list.map((c, i) => {
                  const tk = projectTypeKey(c);
                  const href = c.local_id
                    ? `/contracts/${encodeURIComponent(c.local_id)}`
                    : undefined;
                  return (
                    <tr
                      key={c.id}
                      onClick={href ? () => router.push(href) : undefined}
                      className={`border-b border-slate-50 ${href ? "cursor-pointer hover:bg-slate-50" : ""}`}
                    >
                      <td className="px-4 py-3 text-slate-400">{i + 1}</td>
                      <td className="whitespace-nowrap px-4 py-3 text-slate-600">{showroomOf(c)}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${TYPE_BADGE[tk]}`}>
                          {TYPE_LABEL[tk]}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 font-medium text-slate-800">
                        <span className="flex items-center gap-1.5">
                          {c.is_urgent && (
                            <span className="rounded bg-rose-100 px-1 text-[10px] font-bold text-rose-600">긴급</span>
                          )}
                          {c.model_name ?? contractTitle(c)}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-slate-500">{formatDate(c.contract_date)}</td>
                      <td className="whitespace-nowrap px-4 py-3 text-slate-700">{c.customer_name ?? "-"}</td>
                      <td className="px-4 py-3 text-slate-600">{regionOf(c)}</td>
                      <td className="whitespace-nowrap px-4 py-3 text-slate-600">{c.sales_person ?? "-"}</td>
                      <td className="whitespace-nowrap px-4 py-3 text-right text-slate-700">{formatMoney(c.contract_amount)}</td>
                      <td className="whitespace-nowrap px-4 py-3 text-right text-slate-500">{formatMoney(c.deposit)}</td>
                      <td className="whitespace-nowrap px-4 py-3 text-right text-slate-500">{formatMoney(c.middle_payment)}</td>
                      <td className="whitespace-nowrap px-4 py-3 text-right text-slate-500">{formatMoney(c.balance)}</td>
                      <td className="px-4 py-3"><StatusBadge status={designStatusLabel(c)} /></td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
