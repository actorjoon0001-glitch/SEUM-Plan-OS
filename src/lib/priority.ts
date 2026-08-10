// 설계팀 우선순위(설계 진행 큐) 규칙 — 세움os renderDesignPriority 로직 재현
//
// 1) 목록 대상: 계약금 받은 계약만 (deposit_received_at 있는 건)
// 2) 정렬: 계약일 빠른 순(오름차순). 단 전원주택(인허가)은 건축허가일 빠른 순 먼저.
// 3) 탭: 전체 / 긴급진행(is_urgent) / 유형 4종(project_type) / 작업완료(priority_done)
// 4) 완료 체크(priority_done)한 건은 진행 목록에서 빠지고 '작업완료' 탭으로.

import type { Contract } from "@/types";

export type TypeKey = "container" | "stay" | "house" | "etc";
export type TabKey = "all" | "urgent" | TypeKey | "done";

/** 여러 후보 키에서 첫 유효값을 읽는다. 계약 컬럼 → payload(jsonb) 순으로 탐색 */
function pick(c: Contract, keys: string[]): unknown {
  const payload =
    c.payload && typeof c.payload === "object" && !Array.isArray(c.payload)
      ? (c.payload as Record<string, unknown>)
      : null;
  for (const k of keys) {
    const v = c[k];
    if (v !== undefined && v !== null && v !== "") return v;
    if (payload) {
      const pv = payload[k];
      if (pv !== undefined && pv !== null && pv !== "") return pv;
    }
  }
  return null;
}

/** 계약금 수령 여부 — 세움os 기준: 계약금 수령일(depositReceivedAt)이 있는 건만 */
export function depositReceived(c: Contract): boolean {
  const at = pick(c, [
    "deposit_received_at",
    "depositReceivedAt",
    "deposit_paid_at",
    "deposit_at",
    "deposit_date",
  ]);
  return Boolean(at);
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
  // 1) project_type 값(한글)으로 분류
  if (/컨테이너|농막/.test(s)) return "container";
  if (/체류|쉼터/.test(s)) return "stay";
  if (/전원|주택|인허가/.test(s)) return "house";
  // 2) 모델명 패턴으로 분류 (STAY=주택, FOREST=체류형쉼터, CUBE=컨테이너)
  const m = (c.model_name ?? "").toString().toUpperCase();
  if (/CUBE|컨테이너|농막/.test(m)) return "container";
  if (/FOREST/.test(m)) return "stay";
  if (/STAY/.test(m)) return "house";
  return "etc";
}

/** 주소에서 지역(앞 2어절)만 추출 — "인천광역시 강화도 화전면 …" → "인천광역시 강화도" */
function shortRegion(addr: string): string {
  const parts = addr.trim().split(/\s+/);
  return parts.length >= 2 ? `${parts[0]} ${parts[1]}` : addr.trim();
}

/** 지역 표시 — 계약 컬럼 → payload(지역/시공주소) 순으로 탐색 */
export function regionOf(c: Contract): string {
  // 1) 계약 컬럼의 지역
  const direct = pick(c, ["region", "site_region", "area"]);
  if (direct) return String(direct);

  // 2) payload 내부의 지역/시공주소
  const p = c.payload;
  if (p && typeof p === "object" && !Array.isArray(p)) {
    const rec = p as Record<string, unknown>;
    const pr =
      rec.region ?? rec.siteRegion ?? rec.area ?? rec.district ?? rec.addressRegion;
    if (pr) return String(pr);
    const addr = rec.siteAddress ?? rec.address;
    if (addr) return shortRegion(String(addr));
  }

  // 3) 계약 컬럼의 주소에서 추출
  const addr = pick(c, ["site_address", "address"]);
  if (addr) return shortRegion(String(addr));
  return "-";
}

// 전시장 영문 코드 → 한글 표시
const SHOWROOM_KO: Record<string, string> = {
  headquarters: "본사",
  head_office: "본사",
  hq: "본사",
  main: "본사",
  bonsa: "본사",
  ganghwa: "강화",
  gimpo: "김포",
  yangpyeong: "양평",
  jecheon: "제천",
};

/** 전시장 코드(문자열/값) → 한글. 모르는 값은 원문 유지 */
export function koShowroom(v: unknown): string {
  if (v === null || v === undefined || v === "") return "-";
  const raw = String(v).trim();
  if (!raw) return "-";
  const key = raw.toLowerCase();
  if (SHOWROOM_KO[key]) return SHOWROOM_KO[key];
  const m = key.match(/^showroom\s*_?(\d+)$/); // showroom1 → 1전시장
  if (m) return `${m[1]}전시장`;
  return raw;
}

/** 전시장(쇼룸) 표시 — 계약 컬럼에서 읽어 한글화 */
export function showroomOf(c: Contract): string {
  return koShowroom(pick(c, ["showroom", "showroom_name", "showroom_id"]));
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
