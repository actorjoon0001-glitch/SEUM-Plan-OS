import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { SUPABASE_URL, SUPABASE_ANON_KEY } from "./config";

/**
 * 서버 컴포넌트용 Supabase 클라이언트 (anon 키).
 *
 * 로그인은 클라이언트(localStorage)에서 처리하므로 서버는 사용자 세션을 갖지 않고
 * anon 키로 데이터를 읽는다. 접근 범위는 Supabase RLS 정책을 따른다.
 * (쿠키를 쓰지 않아 iframe 임베드 환경에서도 안전하게 동작한다.)
 */
export function createClient() {
  return createSupabaseClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: { persistSession: false },
  });
}
