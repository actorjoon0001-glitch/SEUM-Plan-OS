/**
 * Supabase 클라이언트 (추후 연동 예정)
 *
 * 사용 준비:
 *   1) npm install @supabase/supabase-js
 *   2) .env.example 을 참고해 .env.local 에 키 입력
 *   3) 아래 createClient 주석을 해제
 *
 * 현재는 개발용 mock-data 를 사용하므로 환경변수만 노출해 둡니다.
 */

export const supabaseConfig = {
  url: process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
  anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
  storageBucket: process.env.NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET ?? "drawings",
};

export const isSupabaseConfigured =
  Boolean(supabaseConfig.url) && Boolean(supabaseConfig.anonKey);

// import { createClient } from "@supabase/supabase-js";
//
// export const supabase = createClient(
//   supabaseConfig.url,
//   supabaseConfig.anonKey,
// );
