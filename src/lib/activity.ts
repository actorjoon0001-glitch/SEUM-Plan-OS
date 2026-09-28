"use client";

import { createClient } from "@/lib/supabase/client";

/**
 * 활동(작업) 기록 저장 (plan_os_activity_log).
 * 누가 어떤 작업을 했는지 남긴다. 테이블/권한이 없으면 조용히 무시.
 */
export async function logActivity(entry: {
  actorEmail?: string | null;
  action: string;
  target?: string | null;
  detail?: string | null;
}): Promise<void> {
  try {
    const sb = createClient();
    await sb.from("plan_os_activity_log").insert({
      actor_email: entry.actorEmail ?? null,
      action: entry.action,
      target: entry.target ?? null,
      detail: entry.detail ?? null,
    });
  } catch {
    // 테이블 없음/권한 없음 등은 무시
  }
}
