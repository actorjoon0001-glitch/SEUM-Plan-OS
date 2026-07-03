import type { Contract } from "@/types";

/** 계약 표시용 제목 (모델명 우선, 없으면 고객명 / local_id) */
export function contractTitle(c: Contract): string {
  return (
    c.model_name?.trim() ||
    c.customer_name?.trim() ||
    (c.local_id ? `계약 ${c.local_id}` : `계약 #${c.id}`)
  );
}

/** 설계 담당자 (설계/인허가 담당 → 설계 확인자 → 설계 연락 담당 순) */
export function designOwner(c: Contract): string {
  return (
    c.design_permit_designer?.trim() ||
    c.design_confirmed_by?.trim() ||
    c.design_contact_name?.trim() ||
    "미지정"
  );
}

/**
 * 설계 진행 상태 라벨.
 * design_status 값이 있으면 그대로, 없으면 확인 플래그로 추정.
 */
export function designStatusLabel(c: Contract): string {
  const s = c.design_status?.trim();
  if (s) return s;
  if (c.final_approved) return "최종승인";
  if (c.design_confirmed) return "설계확인";
  return "설계대기";
}

/** 설계 완료 여부 (집계용) */
export function isDesignDone(c: Contract): boolean {
  return Boolean(c.design_confirmed || c.final_approved);
}
