"use client";

import { createClient } from "@/lib/supabase/client";

/**
 * 로그인 기록 저장 (plan_os_login_log).
 * 실제 로그인(SIGNED_IN) 시 1회 기록한다. 같은 세션에서 중복 기록은 방지.
 * 테이블/권한이 없으면 조용히 무시(앱 동작에 영향 없음).
 */
export async function recordLogin(
  email: string,
  accessToken?: string,
): Promise<void> {
  const marker = `login-logged:${accessToken?.slice(-24) ?? email}`;
  try {
    if (sessionStorage.getItem(marker)) return;
    sessionStorage.setItem(marker, "1");
  } catch {}

  try {
    const sb = createClient();
    await sb.from("plan_os_login_log").insert({
      email,
      user_agent:
        typeof navigator !== "undefined" ? navigator.userAgent : null,
    });
  } catch {
    // 테이블 없음/권한 없음 등은 무시
  }
}
