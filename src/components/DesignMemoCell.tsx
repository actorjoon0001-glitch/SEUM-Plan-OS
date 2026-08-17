"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

/**
 * 설계 메모 입력 셀 (우선순위 표).
 * 포커스를 벗어나면(또는 Enter) design_assignees.memo 에 저장한다.
 * (merge upsert 로 같은 행의 assignee/design_status 는 보존)
 */
export default function DesignMemoCell({
  source,
  refId,
  initial,
}: {
  source: "contract" | "econtract";
  refId: number;
  initial: string;
}) {
  const [value, setValue] = useState(initial);
  const [saved, setSaved] = useState(initial);
  const [state, setState] = useState<"idle" | "saving" | "done" | "error">(
    "idle",
  );

  async function save() {
    const v = value.trim();
    if (v === saved.trim()) return; // 변경 없음
    setState("saving");
    try {
      const sb = createClient();
      const { error } = await sb.from("design_assignees").upsert(
        { source, ref_id: refId, memo: v || null },
        { onConflict: "source,ref_id" },
      );
      if (error) throw error;
      setSaved(v);
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
      <input
        value={value}
        onChange={(e) => {
          setValue(e.target.value);
          if (state !== "idle") setState("idle");
        }}
        onBlur={save}
        onKeyDown={(e) => {
          if (e.key === "Enter") (e.target as HTMLInputElement).blur();
        }}
        placeholder="메모"
        className="w-36 rounded-md border border-slate-200 px-2 py-1 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
      />
      {state === "saving" && <span className="text-xs text-slate-400">저장…</span>}
      {state === "done" && <span className="text-xs text-emerald-600">✓</span>}
      {state === "error" && (
        <span
          className="text-xs text-rose-600"
          title="저장 실패 (design_assignees.memo 컬럼/권한 확인)"
        >
          실패
        </span>
      )}
    </div>
  );
}
