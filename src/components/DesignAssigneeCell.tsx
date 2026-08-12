"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { MEMBERS } from "@/lib/members";

/**
 * 설계담당 배정 드롭박스 (우선순위 표).
 * 설계팀 구성원 중 선택하면 design_assignees 매핑 테이블에 저장한다.
 * (source: 'contract'|'econtract', ref_id: 각 테이블 id)
 * 지정하면 해당 구성원의 '설계 업무 리스트' 페이지에 나타난다.
 */
export default function DesignAssigneeCell({
  source,
  refId,
  initial,
}: {
  source: "contract" | "econtract";
  refId: number;
  initial: string | null;
}) {
  const [value, setValue] = useState(initial ?? "");
  const [state, setState] = useState<"idle" | "saving" | "done" | "error">(
    "idle",
  );

  async function onChange(next: string) {
    setValue(next);
    setState("saving");
    try {
      const sb = createClient();
      if (!next) {
        const { error } = await sb
          .from("design_assignees")
          .delete()
          .eq("source", source)
          .eq("ref_id", refId);
        if (error) throw error;
      } else {
        const { error } = await sb.from("design_assignees").upsert(
          { source, ref_id: refId, assignee: next },
          { onConflict: "source,ref_id" },
        );
        if (error) throw error;
      }
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
        className={`rounded-md border px-2 py-1 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100 ${
          value
            ? "border-brand-200 bg-brand-50 text-brand-700"
            : "border-slate-200 bg-white text-slate-500"
        }`}
      >
        <option value="">미지정</option>
        {MEMBERS.map((m) => (
          <option key={m.slug} value={m.name}>
            {m.name}
          </option>
        ))}
      </select>
      {state === "saving" && <span className="text-xs text-slate-400">저장…</span>}
      {state === "done" && <span className="text-xs text-emerald-600">✓</span>}
      {state === "error" && (
        <span
          className="text-xs text-rose-600"
          title="저장 실패 (design_assignees 테이블/권한 확인)"
        >
          실패
        </span>
      )}
    </div>
  );
}
