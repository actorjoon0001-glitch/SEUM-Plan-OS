import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * 세움os Supabase 클라이언트.
 *
 * URL / publishable(anon) 키는 .env.local 에 설정합니다.
 * publishable 키는 클라이언트 노출용이라 NEXT_PUBLIC_ 접두어를 사용합니다.
 * 실제 데이터 접근 권한은 Supabase 의 RLS 정책을 따릅니다.
 */

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(url && anonKey);

let cached: SupabaseClient | null = null;

/** 설정되어 있으면 Supabase 클라이언트를, 아니면 null 을 반환 */
export function getSupabase(): SupabaseClient | null {
  if (!url || !anonKey) return null;
  if (!cached) {
    cached = createClient(url, anonKey, {
      auth: { persistSession: false },
    });
  }
  return cached;
}
