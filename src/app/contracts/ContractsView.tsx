"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import StatusBadge from "@/components/StatusBadge";
import { Card } from "@/components/Card";
import type { Contract } from "@/types";
import { contractTitle, designOwner, designStatusLabel } from "@/lib/contract";
import { formatDate, formatMoney } from "@/lib/format";

export default function ContractsView({
  contracts,
}: {
  contracts: Contract[];
}) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<string>("전체");

  const statuses = useMemo(() => {
    const set = new Set<string>();
    contracts.forEach((c) => set.add(designStatusLabel(c)));
    return ["전체", ...[...set].sort()];
  }, [contracts]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return contracts.filter((c) => {
      if (status !== "전체" && designStatusLabel(c) !== status) return false;
      if (!q) return true;
      return [
        c.model_name,
        c.customer_name,
        c.local_id,
        designOwner(c),
        c.sales_person,
      ]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q));
    });
  }, [contracts, query, status]);

  return (
    <>
      {/* 검색 + 필터 */}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="모델명 · 고객명 · 계약번호 · 담당자 검색"
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
                <th className="px-5 py-3 font-medium">계약</th>
                <th className="px-5 py-3 font-medium">고객</th>
                <th className="px-5 py-3 font-medium">설계 담당</th>
                <th className="px-5 py-3 font-medium">계약일</th>
                <th className="px-5 py-3 font-medium">계약금액</th>
                <th className="px-5 py-3 font-medium">설계 상태</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50">
                  <td className="px-5 py-3">
                    <Link
                      href={
                        c.local_id
                          ? `/contracts/${encodeURIComponent(c.local_id)}`
                          : "#"
                      }
                      className="font-medium text-slate-800 hover:text-brand-600"
                    >
                      <span className="flex items-center gap-1.5">
                        {c.is_urgent && (
                          <span className="rounded bg-rose-100 px-1 py-0.5 text-[10px] font-bold text-rose-600">
                            긴급
                          </span>
                        )}
                        {contractTitle(c)}
                      </span>
                    </Link>
                    {c.local_id && (
                      <span className="text-[11px] text-slate-400">
                        {c.local_id}
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-3 text-slate-600">
                    {c.customer_name ?? "-"}
                  </td>
                  <td className="px-5 py-3 text-slate-600">{designOwner(c)}</td>
                  <td className="px-5 py-3 text-slate-500">
                    {formatDate(c.contract_date)}
                  </td>
                  <td className="px-5 py-3 text-slate-500">
                    {formatMoney(c.contract_amount)}
                  </td>
                  <td className="px-5 py-3">
                    <StatusBadge status={designStatusLabel(c)} />
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-5 py-10 text-center text-sm text-slate-400">
                    조건에 맞는 계약이 없습니다.
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
