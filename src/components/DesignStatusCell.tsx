"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { DESIGN_STATUS_OPTIONS, designStatusTone } from "@/lib/priority";
import { useUser } from "@/components/UserContext";
import { isAdmin } from "@/lib/admin";

/** 변경 시각 표시용 (MM/DD HH:mm) */
function fmtWhen(ts: string | null): string {
  if (!ts) return "";
  const d = new Date(ts);
  if (isNaN(d.getTime())) return "";
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const hh = String(d.getHours()).padStart(2, "0");
  const mi = String(d.getMinutes()).padStart(2, "0");
  return `${mm}/${dd} ${hh}:${mi}`;
}

/**
 * 설계진행 상태 드롭박스 (우선순위 표).
 * 선택하면 design_assignees.design_status 에 저장하고, 변경자·시각도 함께 기록한다.
 * 변경 기록은 상태 아래 작게 표시하며, 관리자는 ✕ 로 기록을 삭제할 수 있다.
 */
export default function DesignStatusCell({
  source,
  refId,
  initial,
  changedBy = null,
  changedAt = null,
}: {
  source: "contract" | "econtract";
  refId: number;
  initial: string;
  changedBy?: string | null;
  changedAt?: string | null;
}) {
  const { canEdit, session, employee } = useUser();
  const admin = isAdmin(session?.user.email);
  const [value, setValue] = useState(initial);
  const [by, setBy] = useState<string | null>(changedBy);
  const [at, setAt] = useState<string | null>(changedAt);
  const [state, setState] = useState<"idle" | "saving" | "done" | "error">(
    "idle",
  );

  // 옵션에 없는 기존 상태(설계 중·협의 중 등)도 사라지지 않게 옵션으로 추가
  const extra =
    value && !DESIGN_STATUS_OPTIONS.includes(value as never) ? value : null;

  const color = designStatusTone(value);

  async function clearRecord() {
    const prevBy = by;
    const prevAt = at;
    setBy(null);
    setAt(null);
    try {
      const sb = createClient();
      const { error } = await sb.from("design_assignees").upsert(
        { source, ref_id: refId, status_changed_by: null, status_changed_at: null },
        { onConflict: "source,ref_id" },
      );
      if (error) throw error;
    } catch {
      setBy(prevBy); // 롤백
      setAt(prevAt);
    }
  }

  // 변경 기록 표시 (있을 때)
  const record = by ? (
    <span className="mt-0.5 flex items-center gap-1 text-[11px] leading-tight text-slate-400">
      <span className="truncate">
        {by}
        {at ? ` · ${fmtWhen(at)}` : ""}
      </span>
      {admin && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            clearRecord();
          }}
          title="변경 기록 삭제 (관리자)"
          className="shrink-0 rounded px-1 text-slate-400 hover:bg-rose-50 hover:text-rose-500"
        >
          ✕
        </button>
      )}
    </span>
  ) : null;

  // 보기 전용(영업팀 등): 상태 배지 + 기록만 표시
  if (!canEdit) {
    return (
      <div className="min-w-0" onClick={(e) => e.stopPropagation()}>
        <span
          className={`inline-flex whitespace-nowrap rounded-md border px-2 py-1 text-sm ${color}`}
        >
          {value || "-"}
        </span>
        {record}
      </div>
    );
  }

  async function onChange(next: string) {
    setValue(next);
    setState("saving");
    const now = new Date().toISOString();
    const who = employee?.name || session?.user.email || "";
    try {
      const sb = createClient();
      let { error } = await sb.from("design_assignees").upsert(
        {
          source,
          ref_id: refId,
          design_status: next,
          status_changed_by: who || null,
          status_changed_at: now,
        },
        { onConflict: "source,ref_id" },
      );
      // 추적 컬럼(status_changed_*)이 아직 없으면 상태만 저장(기존 기능 유지)
      if (error && /column|schema cache|could not find/i.test(error.message)) {
        ({ error } = await sb.from("design_assignees").upsert(
          { source, ref_id: refId, design_status: next },
          { onConflict: "source,ref_id" },
        ));
        if (!error) {
          setState("done");
          return;
        }
      }
      if (error) throw error;
      setBy(who || null);
      setAt(now);
      setState("done");
    } catch {
      setState("error");
    }
  }

  return (
    <div className="min-w-0" onClick={(e) => e.stopPropagation()}>
      <div className="flex items-center gap-1.5">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`rounded-md border px-2 py-1 text-sm outline-none focus:ring-2 focus:ring-brand-100 ${color}`}
        >
          {DESIGN_STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
          {extra && <option value={extra}>{extra}</option>}
        </select>
        {state === "saving" && <span className="text-xs text-slate-400">저장…</span>}
        {state === "done" && <span className="text-xs text-emerald-600">✓</span>}
        {state === "error" && (
          <span
            className="text-xs text-rose-600"
            title="저장 실패 (design_assignees.design_status 컬럼/권한 확인)"
          >
            실패
          </span>
        )}
      </div>
      {record}
    </div>
  );
}
