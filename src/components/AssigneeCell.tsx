"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { MEMBERS } from "@/lib/members";

/**
 * 협력사 제출 자료의 설계 담당자 드롭박스.
 * 설계팀 4명(김철환/김성현/안준택/김찬영) 중 선택하면 해당 테이블의
 * assignee 컬럼을 업데이트한다.
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
  const [value, setValue] = useState(initial ?? "");
  const [state, setState] = useState<"idle" | "saving" | "done" | "error">(
    "idle",
  );

  // 구성원 목록에 없는 기존 이름도 옵션으로 유지
  const extra =
    value && !MEMBERS.some((m) => m.name === value) ? value : null;

  async function onChange(next: string) {
    setValue(next);
    setState("saving");
    try {
      const sb = createClient();
      const { error } = await sb
        .from(table)
        .update({ assignee: next || null })
        .eq("id", id);
      if (error) throw error;
      setState("done");
    } catch {
      setState("error");
    }
  }

  return (
    <div className="flex items-center gap-1.5">
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
        {extra && <option value={extra}>{extra}</option>}
      </select>
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
