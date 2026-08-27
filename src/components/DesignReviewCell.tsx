"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

/**
 * 검토자 승인 토글 (우선순위/검토자 표).
 * 누르면 승인/미승인이 바뀌고 design_assignees.review_done 에 저장한다.
 * (merge upsert 로 같은 행의 담당·상태·메모 보존)
 * 승인하면 '검토 완료' 화면으로 넘어가고 검토자 대기 목록에서 사라진다.
 */
export default function DesignReviewCell({
  source,
  refId,
  initial,
}: {
  source: "contract" | "econtract";
  refId: number;
  initial: boolean;
}) {
  const [approved, setApproved] = useState(initial);
  const [state, setState] = useState<"idle" | "saving" | "done" | "error">(
    "idle",
  );

  async function toggle() {
    const next = !approved;
    setApproved(next);
    setState("saving");
    try {
      const sb = createClient();
      const { error } = await sb.from("design_assignees").upsert(
        { source, ref_id: refId, review_done: next },
        { onConflict: "source,ref_id" },
      );
      if (error) throw error;
      setState("done");
    } catch {
      setApproved(!next); // 롤백
      setState("error");
    }
  }

  return (
    <div
      className="flex items-center gap-1.5"
      onClick={(e) => e.stopPropagation()}
    >
      <button
        type="button"
        onClick={toggle}
        className={`inline-flex whitespace-nowrap items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset transition-colors ${
          approved
            ? "bg-emerald-50 text-emerald-700 ring-emerald-600/20 hover:bg-emerald-100"
            : "bg-slate-100 text-slate-500 ring-slate-300 hover:bg-slate-200"
        }`}
        title="클릭하면 승인/미승인 전환"
      >
        {approved ? "✓ 승인" : "미승인"}
      </button>
      {state === "saving" && <span className="text-xs text-slate-400">저장…</span>}
      {state === "error" && (
        <span
          className="text-xs text-rose-600"
          title="저장 실패 (design_assignees.review_done 컬럼/권한 확인)"
        >
          실패
        </span>
      )}
    </div>
  );
}
