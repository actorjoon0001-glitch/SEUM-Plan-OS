"use client";

import { createClient } from "@/lib/supabase/client";

/** 공인 IP 조회 (실패 시 null) */
async function fetchIp(): Promise<string | null> {
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 3000);
    const r = await fetch("https://api.ipify.org?format=json", {
      signal: ctrl.signal,
    });
    clearTimeout(t);
    const d = await r.json();
    return typeof d?.ip === "string" ? d.ip : null;
  } catch {
    return null;
  }
}

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

  const ip = await fetchIp();

  try {
    const sb = createClient();
    // ip 컬럼이 없을 수 있어 실패 시 ip 없이 재시도
    const base = {
      email,
      user_agent:
        typeof navigator !== "undefined" ? navigator.userAgent : null,
    };
    const { error } = await sb
      .from("plan_os_login_log")
      .insert({ ...base, ip });
    if (error && /column|schema cache|could not find/i.test(error.message)) {
      await sb.from("plan_os_login_log").insert(base);
    }
  } catch {
    // 테이블 없음/권한 없음 등은 무시
  }
}
