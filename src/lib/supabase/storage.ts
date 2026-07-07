// 인증 세션 저장소 어댑터 — 세션(브라우저) 단위 유지.
//
// sessionStorage 를 사용하므로:
//  - 로그인하면 브라우저를 켜둔 동안 유지된다 (새로고침/페이지 이동에도 유지).
//  - 브라우저(컴퓨터)를 끄면 세션이 사라져 다시 로그인해야 한다.
// 공용 PC 에서 다음 사용자가 이전 사람 계정으로 들어가는 것을 방지한다.

function ss(): Storage | null {
  try {
    return window.sessionStorage;
  } catch {
    return null;
  }
}

export const authStorage = {
  getItem(key: string): string | null {
    return ss()?.getItem(key) ?? null;
  },
  setItem(key: string, value: string): void {
    ss()?.setItem(key, value);
  },
  removeItem(key: string): void {
    ss()?.removeItem(key);
  },
};
