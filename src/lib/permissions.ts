// 편집 권한 규칙.
// 기본: '설계' 팀만 수정 가능. 그 외 팀(영업·시공·경영·마케팅·정산)은 보기 전용.
// 관리자(admin)는 항상 수정 가능. 팀별 예외는 plan_os_team_perms 로 관리자가 조정.

/** 팀 기본 편집 권한 (오버라이드 없을 때) */
export function defaultTeamCanEdit(team?: string | null): boolean {
  return !!team && team.includes("설계");
}

/**
 * 최종 편집 권한 계산.
 * @param isAdminUser 관리자 여부
 * @param team 사용자 팀
 * @param overrides plan_os_team_perms (team → can_edit)
 */
export function computeCanEdit(
  isAdminUser: boolean,
  team: string | null | undefined,
  overrides: Map<string, boolean>,
): boolean {
  if (isAdminUser) return true;
  if (!team) return false;
  if (overrides.has(team)) return overrides.get(team) as boolean;
  return defaultTeamCanEdit(team);
}
