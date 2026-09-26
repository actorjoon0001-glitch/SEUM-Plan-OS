"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { DESIGN_STATUS_OPTIONS, designStatusTone } from "@/lib/priority";
import { useUser } from "@/components/UserContext";
import { isAdmin } from "@/lib/admin";

/** 상태 변경 이력 1건 (design_status_log) */
export interface StatusLogEntry {
  id: number;
  source: string;
  ref_id: number;
  status: string | null;
  changed_by: string | null;
  changed_at: string | null;
}

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
 * 선택하면 design_assignees.design_status 에 현재 상태를 저장하고,
 * design_status_log 에 변경 이력(변경자·시각·상태)을 '추가'로 기록한다(덮어쓰지 않음).
 * 이력은 상태 아래 누적 표시하며, 관리자는 각 이력을 ✕ 로 삭제할 수 있다.
 */
export default function DesignStatusCell({
  source,
  refId,
  initial,
  log = [],
  onLogChanged,
}: {
  source: "contract" | "econtract";
  refId: number;
  initial: string;
  log?: StatusLogEntry[];
  onLogChanged?: () => void;
}) {
  const { canEdit, session, employee } = useUser();
  const admin = isAdmin(session?.user.email);
  const [value, setValue] = useState(initial);
  const [state, setState] = useState<"idle" | "saving" | "done" | "error">(
    "idle",
  );

  // 옵션에 없는 기존 상태(설계 중·협의 중 등)도 사라지지 않게 옵션으로 추가
  const extra =
    value && !DESIGN_STATUS_OPTIONS.includes(value as never) ? value : null;

  const color = designStatusTone(value);

  // 최신 이력 먼저
  const entries = [...log].sort((a, b) =>
    (b.changed_at ?? "").localeCompare(a.changed_at ?? ""),
  );

  async function deleteEntry(id: number) {
    try {
      const sb = createClient();
      const { error } = await sb.from("design_status_log").delete().eq("id", id);
      if (error) throw error;
      onLogChanged?.();
    } catch {
      // 무시(권한 없음 등)
    }
  }

  // 변경 이력 목록 (누적)
  const history =
    entries.length > 0 ? (
      <div className="mt-0.5 space-y-0.5">
        {entries.map((e) => (
          <span
            key={e.id}
            className="flex items-center gap-1 text-[11px] leading-tight text-slate-400"
          >
            <span className="truncate">
              {e.changed_by || "?"}
              {e.changed_at ? ` · ${fmtWhen(e.changed_at)}` : ""}
              {e.status ? ` → ${e.status}` : ""}
            </span>
            {admin && (
              <button
                type="button"
                onClick={(ev) => {
                  ev.stopPropagation();
                  deleteEntry(e.id);
                }}
                title="이 기록 삭제 (관리자)"
                className="shrink-0 rounded px-1 text-slate-400 hover:bg-rose-50 hover:text-rose-500"
              >
                ✕
              </button>
            )}
          </span>
        ))}
      </div>
    ) : null;

  // 보기 전용(영업팀 등): 상태 배지 + 이력만 표시
  if (!canEdit) {
    return (
      <div className="min-w-0" onClick={(e) => e.stopPropagation()}>
        <span
          className={`inline-flex whitespace-nowrap rounded-md border px-2 py-1 text-sm ${color}`}
        >
          {value || "-"}
        </span>
        {history}
      </div>
    );
  }

  async function onChange(next: string) {
    setValue(next);
    setState("saving");
    const who = employee?.name || session?.user.email || "";
    try {
      const sb = createClient();
      // 1) 현재 상태 저장(필터·집계·라우팅용)
      const { error } = await sb.from("design_assignees").upsert(
        { source, ref_id: refId, design_status: next },
        { onConflict: "source,ref_id" },
      );
      if (error) throw error;
      // 2) 변경 이력 추가(덮어쓰지 않고 누적) — 테이블 없으면 무시
      try {
        await sb.from("design_status_log").insert({
          source,
          ref_id: refId,
          status: next,
          changed_by: who || null,
        });
        onLogChanged?.();
      } catch {}
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
      {history}
    </div>
  );
}
