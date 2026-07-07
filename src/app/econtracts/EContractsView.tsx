"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Card } from "@/components/Card";
import StatusBadge from "@/components/StatusBadge";
import type { EContract } from "@/types";
import { formatDate, formatMoney } from "@/lib/format";

export default function EContractsView({
  econtracts,
}: {
  econtracts: EContract[];
}) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("전체");

  const statuses = useMemo(() => {
    const set = new Set<string>();
    econtracts.forEach((e) => {
      if (e.status?.trim()) set.add(e.status.trim());
    });
    return ["전체", ...[...set].sort()];
  }, [econtracts]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return econtracts.filter((e) => {
      if (status !== "전체" && (e.status?.trim() ?? "") !== status) return false;
      if (!q) return true;
      return [e.contract_no, e.client_name, e.site_address, e.salesperson]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q));
    });
  }, [econtracts, query, status]);

  return (
    <>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="계약번호 · 고객명 · 현장주소 · 담당자 검색"
          className="w-full rounded-lg border border-slate-200 px-3.5 py-2 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100 sm:max-w-xs"
        />
        <div className="flex flex-wrap gap-1.5">
          {statuses.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setStatus(s)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                status === s
                  ? "bg-brand-600 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <p className="mb-2 text-xs text-slate-400">{filtered.length}건</p>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-left text-xs text-slate-400">
                <th className="px-5 py-3 font-medium">계약번호</th>
                <th className="px-5 py-3 font-medium">고객</th>
                <th className="px-5 py-3 font-medium">현장 주소</th>
                <th className="px-5 py-3 font-medium">계약일</th>
                <th className="px-5 py-3 font-medium">금액</th>
                <th className="px-5 py-3 font-medium">상태</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.map((e) => (
                <tr key={e.id} className="hover:bg-slate-50">
                  <td className="px-5 py-3">
                    <Link
                      href={`/econtracts/${e.id}`}
                      className="font-medium text-slate-800 hover:text-brand-600"
                    >
                      {e.contract_no || `#${e.id}`}
                    </Link>
                  </td>
                  <td className="px-5 py-3 text-slate-600">
                    {e.client_name ?? "-"}
                  </td>
                  <td className="px-5 py-3 text-slate-500">
                    {e.site_address ?? "-"}
                  </td>
                  <td className="px-5 py-3 text-slate-500">
                    {formatDate(e.contract_date)}
                  </td>
                  <td className="px-5 py-3 text-slate-500">
                    {formatMoney(e.total_amount)}
                  </td>
                  <td className="px-5 py-3">
                    <StatusBadge status={e.status} />
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-5 py-10 text-center text-sm text-slate-400">
                    조건에 맞는 전자계약서가 없습니다.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </>
  );
}
