// 인증 세션 저장소 어댑터 — "자동 로그인" 여부에 따라 저장 위치가 달라진다.
//
//  - 자동 로그인 ON (기본): localStorage 에 저장 → 브라우저/컴퓨터를 껐다 켜도 로그인 유지.
//  - 자동 로그인 OFF: sessionStorage 에 저장 → 브라우저 종료 시 로그아웃 (공용 PC 용).
//
// 선택값(REMEMBER_KEY)은 localStorage 에 보관해 다음 방문에도 유지된다.

const REMEMBER_KEY = "seum.plan-os.remember";

function ls(): Storage | null {
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}
function ss(): Storage | null {
  try {
    return window.sessionStorage;
  } catch {
    return null;
  }
}

/** 자동 로그인 사용 여부 설정 (로그인 직전에 호출) */
export function setRemember(remember: boolean): void {
  ls()?.setItem(REMEMBER_KEY, remember ? "true" : "false");
}

/** 저장된 선택값 조회 (기본값: 자동 로그인 ON) */
export function getRemember(): boolean {
  const store = ls();
  return store ? store.getItem(REMEMBER_KEY) !== "false" : true;
}

export const authStorage = {
  getItem(key: string): string | null {
    return ls()?.getItem(key) ?? ss()?.getItem(key) ?? null;
  },
  setItem(key: string, value: string): void {
    if (getRemember()) {
      ls()?.setItem(key, value);
      ss()?.removeItem(key);
    } else {
      ss()?.setItem(key, value);
      ls()?.removeItem(key);
    }
  },
  removeItem(key: string): void {
    ls()?.removeItem(key);
    ss()?.removeItem(key);
  },
};
