"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/Card";
import DesignAssigneeCell from "@/components/DesignAssigneeCell";
import DesignStatusCell from "@/components/DesignStatusCell";
import { formatDate } from "@/lib/format";
import {
  type Contract,
} from "@/types";
import {
  type TabKey,
  type TypeKey,
  TYPE_LABEL,
  TYPE_NOTE,
  TYPE_BADGE,
  effectiveAssignee,
  effectiveStatus,
  isPriorityDone,
  projectTypeKey,
  regionOf,
  showroomOf,
  sortPriority,
  sourceOf,
} from "@/lib/priority";

const ALL = "전체";

/** 비고 (여러 후보 컬럼 대응, 없으면 -) */
function noteOf(c: Contract): string {
  const rec = c as unknown as Record<string, unknown>;
  const v = rec.note ?? rec.remark ?? rec.bigo ?? rec.priority_note;
  return v ? String(v) : "-";
}

export default function PriorityView({
  contracts,
  initialTab = "all",
  econtractRefs = [],
  reviewMode = false,
}: {
  contracts: Contract[];
  initialTab?: TabKey;
  econtractRefs?: string[];
  /** 검토자 우선순위 모드: 작업완료 목록만, 유형 탭 숨김 */
  reviewMode?: boolean;
}) {
  const router = useRouter();
  const econtractSet = useMemo(() => new Set(econtractRefs), [econtractRefs]);
  const hasEcontract = (c: Contract) =>
    Boolean(
      (c.local_id && econtractSet.has(c.local_id)) ||
        (c.customer_name && econtractSet.has(c.customer_name)),
    );
  const [year, setYear] = useState(ALL);
  const [month, setMonth] = useState(ALL);
  const [showroom, setShowroom] = useState(ALL);
  const [tab, setTab] = useState<TabKey>(initialTab);
  const [search, setSearch] = useState("");

  // 필터 옵션
  const years = useMemo(() => {
    const set = new Set<string>();
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

  // 년/월/전시장 필터 적용 (탭·검색 이전 단계)
  const base = useMemo(() => {
    return contracts.filter((c) => {
      const ymd = c.contract_date ?? "";
      if (year !== ALL && ymd.slice(0, 4) !== year) return false;
      if (month !== ALL) {
        const m = ymd.slice(5, 7);
        if (String(Number(m)) !== month) return false;
      }
      if (showroom !== ALL && showroomOf(c) !== showroom) return false;
      return true;
    });
  }, [contracts, year, month, showroom]);

  // 진행/완료 분리
  const active = useMemo(() => base.filter((c) => !isPriorityDone(c)), [base]);
  const done = useMemo(() => base.filter((c) => isPriorityDone(c)), [base]);

  // 탭 카운트
  const counts = useMemo(() => {
    const byType: Record<TypeKey, number> = {
      container: 0,
      stay: 0,
      house: 0,
      etc: 0,
    };
    let urgent = 0;
    for (const c of active) {
      byType[projectTypeKey(c)] += 1;
      if (c.is_urgent) urgent += 1;
    }
    return {
      all: active.length,
      urgent,
      ...byType,
      done: done.length,
    };
  }, [active, done]);

  // 선택 탭 목록
  const list = useMemo(() => {
    let rows: Contract[];
    if (tab === "done") rows = done;
    else if (tab === "urgent") rows = active.filter((c) => c.is_urgent);
    else if (tab === "all") rows = active;
    else rows = active.filter((c) => projectTypeKey(c) === tab);

    const q = search.trim().toLowerCase();
    if (q) {
      rows = rows.filter((c) => {
        const hay = [
          c.customer_name,
          c.model_name,
          regionOf(c),
          showroomOf(c),
          c.local_id,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        return hay.includes(q);
      });
    }
    return sortPriority(rows, tab);
  }, [tab, active, done, search]);

  const tabs: {
    key: TabKey;
    label: string;
    note?: string;
    count: number;
    danger?: boolean;
    ok?: boolean;
  }[] = [
    { key: "all", label: "전체", count: counts.all },
    { key: "urgent", label: "🚨 긴급진행", count: counts.urgent, danger: true },
    { key: "container", label: TYPE_LABEL.container, count: counts.container },
    { key: "stay", label: TYPE_LABEL.stay, note: TYPE_NOTE.stay, count: counts.stay },
    { key: "house", label: TYPE_LABEL.house, note: TYPE_NOTE.house, count: counts.house },
    { key: "etc", label: TYPE_LABEL.etc, count: counts.etc },
    { key: "done", label: "✅ 작업완료", count: counts.done, ok: true },
  ];

  const selectCls =
    "rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100";

  return (
    <div className="space-y-4">
      {/* 필터 바 */}
      <div className="flex flex-wrap items-end gap-4">
        <label className="flex flex-col gap-1">
          <span className="text-xs font-medium text-slate-500">년도</span>
          <select value={year} onChange={(e) => setYear(e.target.value)} className={selectCls}>
            <option value={ALL}>전체</option>
            {years.map((y) => (
              <option key={y} value={y}>
                {y}년
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-xs font-medium text-slate-500">월</span>
          <select value={month} onChange={(e) => setMonth(e.target.value)} className={selectCls}>
            <option value={ALL}>전체</option>
            {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
              <option key={m} value={String(m)}>
                {m}월
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-xs font-medium text-slate-500">전시장</span>
          <select
            value={showroom}
            onChange={(e) => setShowroom(e.target.value)}
            className={selectCls}
          >
            <option value={ALL}>전체</option>
            {showrooms.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </label>
        <span className="pb-2 text-xs text-slate-400">
          ※ 년·월·전시장으로 목록을 필터합니다
        </span>
      </div>

      {/* 탭 (유형별 진행 현황) — 검토자 모드에선 숨김 */}
      {!reviewMode && (
      <Card className="p-4">
        <p className="mb-3 text-sm font-semibold text-slate-800">
          우선순위 진행 현황{" "}
          <span className="font-normal text-slate-400">(계약금 수령 건)</span>
        </p>
        <div className="flex flex-wrap gap-2">
          {tabs.map((t) => {
            const activeTab = tab === t.key;
            return (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors ${
                  activeTab
                    ? t.danger
                      ? "bg-rose-600 text-white"
                      : t.ok
                        ? "bg-emerald-600 text-white"
                        : "bg-brand-600 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {t.label}
                {t.note ? (
                  <span
                    className={`text-xs font-normal ${
                      activeTab ? "text-white/80" : "text-slate-400"
                    }`}
                  >
                    ({t.note})
                  </span>
                ) : null}
                <span
                  className={`rounded-full px-1.5 text-xs ${
                    activeTab ? "bg-white/25" : "bg-white text-slate-500"
                  }`}
                >
                  {t.count}
                </span>
              </button>
            );
          })}
        </div>
      </Card>
      )}

      {/* 검색 */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.3-4.3m1.3-5.4a6.7 6.7 0 11-13.4 0 6.7 6.7 0 0113.4 0z" />
            </svg>
          </span>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="건축주명, 지역, 주소, 모델 검색"
            className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
          />
        </div>
        <span className="whitespace-nowrap text-sm text-slate-500">
          총 {list.length}건
        </span>
      </div>

      {/* 목록 테이블 */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50 text-left text-xs text-slate-500">
                <th className="px-4 py-3 font-medium">#</th>
                <th className="px-4 py-3 font-medium">계약일</th>
                <th className="px-4 py-3 font-medium">유형</th>
                <th className="px-4 py-3 font-medium">고객명</th>
                <th className="px-4 py-3 font-medium">모델명</th>
                <th className="px-4 py-3 font-medium">전시장</th>
                <th className="px-4 py-3 font-medium">지역</th>
                <th className="px-4 py-3 font-medium">담당 영업사원</th>
                <th className="px-4 py-3 font-medium">설계담당</th>
                <th className="px-4 py-3 font-medium">설계진행 상태</th>
                <th className="px-4 py-3 font-medium">검토자 승인</th>
                <th className="px-4 py-3 font-medium">비고</th>
                <th className="px-4 py-3 font-medium">액션</th>
              </tr>
            </thead>
            <tbody>
              {list.length === 0 ? (
                <tr>
                  <td colSpan={13} className="px-4 py-10 text-center text-slate-400">
                    해당하는 계약이 없습니다.
                  </td>
                </tr>
              ) : (
                list.map((c, i) => {
                  const rec = c as unknown as Record<string, unknown>;
                  const tk = projectTypeKey(c);
                  const href =
                    (rec._href as string | undefined) ??
                    (c.local_id
                      ? `/contracts/${encodeURIComponent(c.local_id)}`
                      : undefined);
                  const eco = rec._source === "econtract" || hasEcontract(c);
                  // 전자계약 건은 텍스트를 초록으로 (수기=검정과 구분)
                  const t = eco ? "text-emerald-700" : "text-slate-600";
                  const tStrong = eco ? "text-emerald-800" : "text-slate-800";
                  const tDim = eco ? "text-emerald-600" : "text-slate-400";
                  return (
                    <tr
                      key={(rec._key as string) ?? c.id}
                      onClick={href ? () => router.push(href) : undefined}
                      className={`border-b border-slate-50 ${
                        href ? "cursor-pointer hover:bg-slate-50" : ""
                      } ${eco ? "bg-emerald-50/30" : ""}`}
                    >
                      <td className={`px-4 py-3 ${tDim}`}>{i + 1}</td>
                      <td className={`whitespace-nowrap px-4 py-3 ${t}`}>
                        {formatDate(c.contract_date)}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3">
                        <span className="inline-flex items-center gap-1">
                          <span
                            className={`inline-flex whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${TYPE_BADGE[tk]}`}
                          >
                            {TYPE_LABEL[tk]}
                          </span>
                          {eco && (
                            <span className="inline-flex whitespace-nowrap items-center gap-0.5 rounded-full bg-violet-100 px-2 py-0.5 text-xs font-medium text-violet-700 ring-1 ring-inset ring-violet-600/20">
                              ⚡ 전자계약
                            </span>
                          )}
                        </span>
                      </td>
                      <td className={`px-4 py-3 font-medium ${tStrong}`}>
                        <span className="flex items-center gap-1.5">
                          {c.is_urgent && (
                            <span className="rounded bg-rose-100 px-1 text-[10px] font-bold text-rose-600">
                              긴급
                            </span>
                          )}
                          {c.customer_name ?? "-"}
                        </span>
                      </td>
                      <td className={`px-4 py-3 ${t}`}>{c.model_name ?? "-"}</td>
                      <td className={`whitespace-nowrap px-4 py-3 ${t}`}>{showroomOf(c)}</td>
                      <td className={`px-4 py-3 ${t}`}>{regionOf(c)}</td>
                      <td className={`whitespace-nowrap px-4 py-3 ${t}`}>{c.sales_person ?? "-"}</td>
                      <td className="whitespace-nowrap px-4 py-3">
                        <DesignAssigneeCell
                          source={sourceOf(c)}
                          refId={c.id}
                          initial={effectiveAssignee(c)}
                        />
                      </td>
                      <td className="px-4 py-3">
                        <DesignStatusCell
                          source={sourceOf(c)}
                          refId={c.id}
                          initial={effectiveStatus(c)}
                        />
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-medium ${
                            c.design_confirmed
                              ? "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/20"
                              : "bg-slate-100 text-slate-500"
                          }`}
                        >
                          {c.design_confirmed ? "승인" : "미승인"}
                        </span>
                      </td>
                      <td className={`px-4 py-3 ${tDim}`}>{noteOf(c)}</td>
                      <td className="whitespace-nowrap px-4 py-3">
                        <span className="flex items-center gap-1.5">
                          {isPriorityDone(c) && (
                            <span className="rounded-full bg-emerald-600 px-2 py-0.5 text-xs font-medium text-white">
                              작업완료
                            </span>
                          )}
                          {href && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                router.push(href);
                              }}
                              className="rounded-md border border-slate-200 px-2.5 py-1 text-xs font-medium text-slate-600 hover:bg-slate-50"
                            >
                              {eco ? "전자계약 보기" : "계약 상세"}
                            </button>
                          )}
                        </span>
                      </td>
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
