"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Card } from "@/components/Card";
import StatusBadge from "@/components/StatusBadge";
import type { EContract } from "@/types";
import { formatDate, formatMoney } from "@/lib/format";
import {
  type TypeKey,
  TYPE_LABEL,
  TYPE_BADGE,
  koShowroom,
} from "@/lib/priority";

const ALL = "전체";
type Tab = "all" | TypeKey;

export default function EContractsView({
  econtracts,
  types,
}: {
  econtracts: EContract[];
  types: Record<number, TypeKey>;
}) {
  const [year, setYear] = useState(ALL);
  const [month, setMonth] = useState(ALL);
  const [showroom, setShowroom] = useState(ALL);
  const [status, setStatus] = useState(ALL);
  const [tab, setTab] = useState<Tab>("all");
  const [query, setQuery] = useState("");

  const typeOf = (e: EContract): TypeKey => types[e.id] ?? "etc";

  const years = useMemo(() => {
    const set = new Set<string>();
    for (const e of econtracts) {
      const y = e.contract_date?.slice(0, 4);
      if (y) set.add(y);
    }
    return [...set].sort((a, b) => b.localeCompare(a));
  }, [econtracts]);

  const showrooms = useMemo(() => {
    const set = new Set<string>();
    for (const e of econtracts) {
      const s = koShowroom(e.showroom);
      if (s && s !== "-") set.add(s);
    }
    return [...set].sort();
  }, [econtracts]);

  const statuses = useMemo(() => {
    const set = new Set<string>();
    econtracts.forEach((e) => {
      if (e.status?.trim()) set.add(e.status.trim());
    });
    return [...set].sort();
  }, [econtracts]);

  // 년/월/전시장/상태 필터
  const base = useMemo(() => {
    return econtracts.filter((e) => {
      const ymd = e.contract_date ?? "";
      if (year !== ALL && ymd.slice(0, 4) !== year) return false;
      if (month !== ALL && String(Number(ymd.slice(5, 7))) !== month) return false;
      if (showroom !== ALL && koShowroom(e.showroom) !== showroom) return false;
      if (status !== ALL && (e.status?.trim() ?? "") !== status) return false;
      return true;
    });
  }, [econtracts, year, month, showroom, status]);

  const counts = useMemo(() => {
    const c: Record<TypeKey, number> = { container: 0, stay: 0, house: 0, etc: 0 };
    for (const e of base) c[typeOf(e)] += 1;
    return c;
  }, [base]);

  const list = useMemo(() => {
    let rows = tab === "all" ? base : base.filter((e) => typeOf(e) === tab);
    const q = query.trim().toLowerCase();
    if (q) {
      rows = rows.filter((e) =>
        [e.contract_no, e.client_name, e.site_address, e.salesperson]
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
      {/* 년/월/전시장/상태 필터 */}
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
        {statuses.length > 0 && (
          <label className="flex flex-col gap-1">
            <span className="text-xs font-medium text-slate-500">상태</span>
            <select value={status} onChange={(e) => setStatus(e.target.value)} className={selectCls}>
              <option value={ALL}>전체</option>
              {statuses.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </label>
        )}
        <span className="pb-2 text-xs text-slate-400">※ 년·월·전시장·상태로 목록을 필터합니다</span>
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
          placeholder="계약번호 · 고객명 · 현장주소 · 담당자 검색"
          className="w-full rounded-lg border border-slate-200 px-3.5 py-2 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100 sm:max-w-sm"
        />
        <span className="whitespace-nowrap text-sm text-slate-500">총 {list.length}건</span>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-left text-xs text-slate-400">
                <th className="px-5 py-3 font-medium">계약번호</th>
                <th className="px-5 py-3 font-medium">고객</th>
                <th className="px-5 py-3 font-medium">유형</th>
                <th className="px-5 py-3 font-medium">전시장</th>
                <th className="px-5 py-3 font-medium">현장 주소</th>
                <th className="px-5 py-3 font-medium">계약일</th>
                <th className="px-5 py-3 font-medium">금액</th>
                <th className="px-5 py-3 font-medium">상태</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {list.map((e) => {
                const tk = typeOf(e);
                return (
                  <tr key={e.id} className="hover:bg-slate-50">
                    <td className="whitespace-nowrap px-5 py-3">
                      <Link
                        href={`/econtracts/${e.id}`}
                        className="font-medium text-slate-800 hover:text-brand-600"
                      >
                        {e.contract_no || `#${e.id}`}
                      </Link>
                    </td>
                    <td className="px-5 py-3 text-slate-600">{e.client_name ?? "-"}</td>
                    <td className="px-5 py-3">
                      <span className={`inline-flex whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${TYPE_BADGE[tk]}`}>
                        {TYPE_LABEL[tk]}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-5 py-3 text-slate-600">{koShowroom(e.showroom)}</td>
                    <td className="px-5 py-3 text-slate-500">{e.site_address ?? "-"}</td>
                    <td className="whitespace-nowrap px-5 py-3 text-slate-500">{formatDate(e.contract_date)}</td>
                    <td className="whitespace-nowrap px-5 py-3 text-slate-500">{formatMoney(e.total_amount)}</td>
                    <td className="px-5 py-3">
                      <StatusBadge status={e.status} />
                    </td>
                  </tr>
                );
              })}
              {list.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-5 py-10 text-center text-sm text-slate-400">
                    조건에 맞는 전자계약서가 없습니다.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
