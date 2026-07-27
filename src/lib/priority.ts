// 설계팀 우선순위(설계 진행 큐) 규칙 — 세움os renderDesignPriority 로직 재현
//
// 1) 목록 대상: 계약금 받은 계약만 (deposit_received_at 있는 건)
// 2) 정렬: 계약일 빠른 순(오름차순). 단 전원주택(인허가)은 건축허가일 빠른 순 먼저.
// 3) 탭: 전체 / 긴급진행(is_urgent) / 유형 4종(project_type) / 작업완료(priority_done)
// 4) 완료 체크(priority_done)한 건은 진행 목록에서 빠지고 '작업완료' 탭으로.

import type { Contract } from "@/types";

export type TypeKey = "container" | "stay" | "house" | "etc";
export type TabKey = "all" | "urgent" | TypeKey | "done";

/** 여러 후보 컬럼명에서 첫 유효값을 읽는다 (실제 DB 컬럼명이 달라도 대응) */
function pick(c: Contract, keys: string[]): unknown {
  for (const k of keys) {
    const v = c[k];
    if (v !== undefined && v !== null && v !== "") return v;
  }
  return null;
}

/** 계약금 수령 여부 (deposit_received_at 우선, 없으면 deposit 금액 > 0) */
export function depositReceived(c: Contract): boolean {
  const at = pick(c, [
    "deposit_received_at",
    "depositReceivedAt",
    "deposit_paid_at",
    "deposit_at",
    "deposit_date",
  ]);
  if (at) return true;
  const amt = pick(c, ["deposit"]);
  const n =
    typeof amt === "string" ? Number(amt.replace(/[^0-9.-]/g, "")) : Number(amt);
  return Number.isFinite(n) && n > 0;
}

/** 건축허가 완료일 (전원주택 정렬용) */
export function permitCertDate(c: Contract): string | null {
  const v = pick(c, [
    "permit_cert_date",
    "permitCertDate",
    "permit_date",
    "permit_completed_at",
    "building_permit_date",
  ]);
  return v ? String(v) : null;
}

/** 우선순위 작업완료 체크 여부 */
export function isPriorityDone(c: Contract): boolean {
  return Boolean(pick(c, ["priority_done", "priorityDone"]));
}

/** 유형 분류 (project_type 값 기준, 없으면 기타) */
export function projectTypeKey(c: Contract): TypeKey {
  const raw = pick(c, [
    "project_type",
    "projectType",
    "category",
    "house_type",
    "product_type",
    "type",
  ]);
  const s = raw ? String(raw) : "";
  if (/컨테이너|농막|container/i.test(s)) return "container";
  if (/체류|쉼터|stay/i.test(s)) return "stay";
  if (/전원|주택|인허가|house/i.test(s)) return "house";
  return "etc";
}

/** 지역 표시 (여러 후보 컬럼 대응) */
export function regionOf(c: Contract): string {
  const v = pick(c, ["region", "site_region", "area", "site_address", "address"]);
  return v ? String(v) : "-";
}

/** 전시장(쇼룸) 표시 */
export function showroomOf(c: Contract): string {
  const v = pick(c, ["showroom", "showroom_name", "showroom_id"]);
  return v ? String(v) : "-";
}

export const TYPE_LABEL: Record<TypeKey, string> = {
  container: "컨테이너",
  stay: "체류형쉼터",
  house: "주택",
  etc: "기타",
};

/** 유형별 인허가 성격 (부가 설명) */
export const TYPE_NOTE: Record<TypeKey, string> = {
  container: "",
  stay: "가설건축물축조신고",
  house: "준공용 인허가",
  etc: "",
};

/** 유형 배지 색상 */
export const TYPE_BADGE: Record<TypeKey, string> = {
  house: "bg-amber-50 text-amber-700 ring-amber-600/20",
  stay: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  container: "bg-blue-50 text-blue-700 ring-blue-600/20",
  etc: "bg-slate-100 text-slate-600 ring-slate-500/20",
};

function cmpDateAsc(a: string | null, b: string | null): number {
  const av = a ?? "";
  const bv = b ?? "";
  if (!av && !bv) return 0;
  if (!av) return 1; // 값 없는 건 뒤로
  if (!bv) return -1;
  return av.localeCompare(bv);
}

/**
 * 우선순위 정렬.
 * 기본: 계약일 오름차순.
 * 전원주택(house) 탭: 건축허가일 있는 건이 최상단(허가일 오름차순), 나머지는 계약일 오름차순.
 */
export function sortPriority(list: Contract[], tab: TabKey): Contract[] {
  if (tab === "house") {
    return [...list].sort((a, b) => {
      const pa = permitCertDate(a);
      const pb = permitCertDate(b);
      if (!!pa !== !!pb) return pa ? -1 : 1;
      if (pa && pb) {
        const c = pa.localeCompare(pb);
        if (c !== 0) return c;
      }
      return cmpDateAsc(a.contract_date, b.contract_date);
    });
  }
  return [...list].sort((a, b) => cmpDateAsc(a.contract_date, b.contract_date));
}
