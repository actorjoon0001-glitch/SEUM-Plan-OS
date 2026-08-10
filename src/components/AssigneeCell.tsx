"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

/**
 * 설계 담당자 인라인 입력 셀.
 * 입력 후 포커스를 벗어나면(또는 Enter) 해당 협력사 테이블의 assignee 컬럼을 업데이트한다.
 */
export default function AssigneeCell({
  table,
  id,
  initial,
}: {
  table: string;
  id: number;
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
      const { error } = await sb
        .from(table)
        .update({ assignee: v || null })
        .eq("id", id);
      if (error) throw error;
      setSaved(v);
      setState("done");
    } catch {
      setState("error");
    }
  }

  return (
    <div className="flex items-center gap-1.5">
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
        placeholder="담당자 입력"
        className="w-28 rounded-md border border-slate-200 px-2 py-1 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
      />
      {state === "saving" && <span className="text-xs text-slate-400">저장…</span>}
      {state === "done" && <span className="text-xs text-emerald-600">✓</span>}
      {state === "error" && (
        <span className="text-xs text-rose-600" title="저장 실패 (권한 확인)">
          실패
        </span>
      )}
    </div>
  );
}
