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
 * 설계 진행 상태 라벨 (세움os designStatus 기준 한글화).
 * 미착수 / 설계 중 / 협의 중 / 협의 완료 / 완료
 */
const DESIGN_STATUS_KO: Record<string, string> = {
  none: "미착수",
  not_started: "미착수",
  in_progress: "설계 중",
  designing: "설계 중",
  negotiating: "협의 중",
  negotiated: "협의 완료",
  done: "완료",
  completed: "완료",
};

export function designStatusLabel(c: Contract): string {
  const s = c.design_status?.trim();
  if (s) return DESIGN_STATUS_KO[s.toLowerCase()] ?? s;
  if (c.final_approved) return "완료";
  if (c.design_confirmed) return "협의 완료";
  return "미착수";
}

/** 설계 완료 여부 (집계용) */
export function isDesignDone(c: Contract): boolean {
  return Boolean(c.design_confirmed || c.final_approved);
}
