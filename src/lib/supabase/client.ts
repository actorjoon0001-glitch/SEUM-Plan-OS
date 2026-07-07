import { createBrowserClient } from "@supabase/ssr";
import { SUPABASE_URL, SUPABASE_ANON_KEY } from "./config";

/**
 * 브라우저(클라이언트 컴포넌트)용 Supabase 클라이언트 — 로그인 등에 사용.
 *
 * auth.lock 을 통과형(pass-through)으로 지정해 navigator.locks 를 우회한다.
 * iframe(다른 도메인 임베드) 안에서 navigator.locks 가 잠겨 로그인이
 * 무한 대기하는 문제를 방지한다.
 */
export function createClient() {
  return createBrowserClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
      lock: async (_name, _acquireTimeout, fn) => fn(),
    },
  });
}
