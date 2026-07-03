"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Card } from "@/components/Card";
import type { ContractDrawing } from "@/types";
import { formatDate, fileExt } from "@/lib/format";

export default function DrawingsView({
  drawings,
}: {
  drawings: ContractDrawing[];
}) {
  const [query, setQuery] = useState("");
  const [kind, setKind] = useState("전체");

  const kinds = useMemo(() => {
    const set = new Set<string>();
    drawings.forEach((d) => {
      if (d.kind?.trim()) set.add(d.kind.trim());
    });
    return ["전체", ...[...set].sort()];
  }, [drawings]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return drawings.filter((d) => {
      if (kind !== "전체" && (d.kind?.trim() ?? "") !== kind) return false;
      if (!q) return true;
      return [d.file_name, d.contract_local_id, d.uploaded_by]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q));
    });
  }, [drawings, query, kind]);

  return (
    <>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="파일명 · 계약번호 · 업로더 검색"
          className="w-full rounded-lg border border-slate-200 px-3.5 py-2 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100 sm:max-w-xs"
        />
        <div className="flex flex-wrap gap-1.5">
          {kinds.map((k) => (
            <button
              key={k}
              type="button"
              onClick={() => setKind(k)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                kind === k
                  ? "bg-brand-600 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {k}
            </button>
          ))}
        </div>
      </div>

      <p className="mb-2 text-xs text-slate-400">{filtered.length}개</p>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-left text-xs text-slate-400">
                <th className="px-5 py-3 font-medium">파일명</th>
                <th className="px-5 py-3 font-medium">종류</th>
                <th className="px-5 py-3 font-medium">계약</th>
                <th className="px-5 py-3 font-medium">형식</th>
                <th className="px-5 py-3 font-medium">업로드</th>
                <th className="px-5 py-3 font-medium"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.map((d) => (
                <tr key={d.id} className="hover:bg-slate-50">
                  <td className="px-5 py-3 font-medium text-slate-800">
                    {d.file_name ?? "(파일명 없음)"}
                  </td>
                  <td className="px-5 py-3">
                    {d.kind ? (
                      <span className="rounded bg-slate-100 px-1.5 py-0.5 text-xs text-slate-500">
                        {d.kind}
                      </span>
                    ) : (
                      <span className="text-slate-300">-</span>
                    )}
                  </td>
                  <td className="px-5 py-3">
                    {d.contract_local_id ? (
                      <Link
                        href={`/contracts/${encodeURIComponent(d.contract_local_id)}`}
                        className="text-slate-600 hover:text-brand-600 hover:underline"
                      >
                        {d.contract_local_id}
                      </Link>
                    ) : (
                      <span className="text-slate-300">-</span>
                    )}
                  </td>
                  <td className="px-5 py-3 uppercase text-slate-500">
                    {fileExt(d.file_name) || "-"}
                  </td>
                  <td className="px-5 py-3 text-slate-500">
                    {d.uploaded_by ?? "-"} · {formatDate(d.uploaded_at)}
                  </td>
                  <td className="px-5 py-3 text-right">
                    {d.url && (
                      <a
                        href={d.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-medium text-brand-600 hover:underline"
                      >
                        열기
                      </a>
                    )}
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-5 py-10 text-center text-sm text-slate-400">
                    조건에 맞는 도면이 없습니다.
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
