"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { DESIGN_STATUS_OPTIONS, designStatusTone } from "@/lib/priority";
import { useUser } from "@/components/UserContext";

/**
 * 설계진행 상태 드롭박스 (우선순위 표).
 * 미착수 / 설계 중 / 완료 중 선택하면 design_assignees 매핑 테이블의
 * design_status 컬럼에 저장한다. (assignee 값은 유지 — merge upsert)
 * 기존 세움os 원본 상태는 초기값으로 표시하고, 선택 시 설계OS 값이 우선한다.
 */
export default function DesignStatusCell({
  source,
  refId,
  initial,
}: {
  source: "contract" | "econtract";
  refId: number;
  initial: string;
}) {
  const { canEdit } = useUser();
  const [value, setValue] = useState(initial);
  const [state, setState] = useState<"idle" | "saving" | "done" | "error">(
    "idle",
  );

  // 옵션에 없는 기존 상태(설계 중·협의 중 등)도 사라지지 않게 옵션으로 추가
  const extra =
    value && !DESIGN_STATUS_OPTIONS.includes(value as never) ? value : null;

  const color = designStatusTone(value);

  // 보기 전용(영업팀 등): 상태 배지만 표시
  if (!canEdit) {
    return (
      <span
        className={`inline-flex whitespace-nowrap rounded-md border px-2 py-1 text-sm ${color}`}
      >
        {value || "-"}
      </span>
    );
  }

  async function onChange(next: string) {
    setValue(next);
    setState("saving");
    try {
      const sb = createClient();
      const { error } = await sb.from("design_assignees").upsert(
        { source, ref_id: refId, design_status: next },
        { onConflict: "source,ref_id" },
      );
      if (error) throw error;
      setState("done");
    } catch {
      setState("error");
    }
  }

  return (
    <div
      className="flex items-center gap-1.5"
      onClick={(e) => e.stopPropagation()}
    >
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
  );
}
