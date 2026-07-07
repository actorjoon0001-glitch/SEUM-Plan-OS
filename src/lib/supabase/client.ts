import { createClient as createSupabaseClient, type SupabaseClient } from "@supabase/supabase-js";
import { SUPABASE_URL, SUPABASE_ANON_KEY } from "./config";
import { authStorage } from "./storage";

/**
 * 브라우저용 Supabase 클라이언트 (싱글턴).
 *
 * 세션을 localStorage 에 저장한다 (쿠키 아님). 이렇게 하면 통합플랫폼의
 * iframe(교차 도메인) 안에서도 서드파티 쿠키 차단에 걸리지 않고 로그인이 유지된다.
 * auth.lock 통과형으로 navigator.locks 우회 (iframe 무한 대기 방지).
 */
let browserClient: SupabaseClient | null = null;

export function createClient(): SupabaseClient {
  if (!browserClient) {
    browserClient = createSupabaseClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        storage: authStorage,
        lock: async (_name, _acquireTimeout, fn) => fn(),
      },
    });
  }
  return browserClient;
}
