import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { SUPABASE_URL, SUPABASE_ANON_KEY } from "./config";

/**
 * 서버 컴포넌트 / 라우트 핸들러용 Supabase 클라이언트.
 * 쿠키에 저장된 세션을 읽어 인증된 요청을 보낸다.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          );
        } catch {
          // 서버 컴포넌트에서 호출된 경우 set 이 무시될 수 있음 (미들웨어가 갱신 담당)
        }
      },
    },
  });
}
