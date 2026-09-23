// 관리자 계정 (설계os 로그인 이메일 기준). 필요 시 이메일을 추가한다.
export const ADMIN_EMAILS = ["harold0001@naver.com"];

/** 관리자 여부 (이메일 대소문자 무시) */
export function isAdmin(email?: string | null): boolean {
  if (!email) return false;
  return ADMIN_EMAILS.map((e) => e.toLowerCase()).includes(
    email.trim().toLowerCase(),
  );
}
