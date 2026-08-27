// 설계팀 우선순위(설계 진행 큐) 규칙 — 세움os renderDesignPriority 로직 재현
//
// 1) 목록 대상: 계약금 받은 계약만 (deposit_received_at 있는 건)
// 2) 정렬: 계약일 빠른 순(오름차순). 단 전원주택(인허가)은 건축허가일 빠른 순 먼저.
// 3) 탭: 전체 / 긴급진행(is_urgent) / 유형 4종(project_type) / 작업완료(priority_done)
// 4) 완료 체크(priority_done)한 건은 진행 목록에서 빠지고 '작업완료' 탭으로.

import type { Contract, EContract } from "@/types";
import { designOwner, designStatusLabel } from "@/lib/contract";

/** 설계진행 상태 드롭박스 옵션 (미착수 / 설계 중 / 완료) */
export const DESIGN_STATUS_OPTIONS = ["미착수", "설계 중", "완료"] as const;

/** 배정 매핑 1건 (design_assignees) */
export interface AssignRecord {
  assignee: string | null;
  design_status?: string | null;
  memo?: string | null;
  review_done?: boolean | null;
}

/** design_assignees 행 목록 → source:id 키 맵 */
export function buildAssigneeMap(
  rows: ReadonlyArray<{
    source: string;
    ref_id: number;
    assignee: string | null;
    design_status?: string | null;
    memo?: string | null;
    review_done?: boolean | null;
  }>,
): Map<string, AssignRecord> {
  const map = new Map<string, AssignRecord>();
  for (const a of rows) {
    map.set(`${a.source}:${a.ref_id}`, {
      assignee: a.assignee,
      design_status: a.design_status ?? null,
      memo: a.memo ?? null,
      review_done: a.review_done ?? null,
    });
  }
  return map;
}

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

/** 우선순위 행의 출처 (수기 계약 / 전자계약) — 설계담당 배정 키에 사용 */
export function sourceOf(c: Contract): "contract" | "econtract" {
  const rec = c as unknown as Record<string, unknown>;
  return rec._source === "econtract" ? "econtract" : "contract";
}

/** 설계담당 배정 조회 키 (source:id) */
export function assigneeKey(source: string, refId: number): string {
  return `${source}:${refId}`;
}

/** 설계OS 에서 지정한 설계담당 (design_assignees 매핑). 없으면 null */
export function assigneeOf(c: Contract): string | null {
  const rec = c as unknown as Record<string, unknown>;
  const v = rec._assignee;
  return v ? String(v) : null;
}

/**
 * 표시·필터용 실제 설계담당.
 * 1) 설계OS 배정(design_assignees) 우선
 * 2) 없으면 세움os 원본 설계담당(design_permit_designer 등) — 기존에 기입된 이름 유지
 */
export function effectiveAssignee(c: Contract): string | null {
  const direct = assigneeOf(c);
  if (direct) return direct;
  const owner = designOwner(c);
  return owner && owner !== "미지정" ? owner : null;
}

/** 설계OS 에서 지정한 설계진행 상태 (design_assignees.design_status). 없으면 null */
export function statusOf(c: Contract): string | null {
  const rec = c as unknown as Record<string, unknown>;
  const v = rec._design_status;
  return v ? String(v) : null;
}

/**
 * 표시용 실제 설계진행 상태.
 * 1) 설계OS 지정값 우선
 * 2) 없으면 세움os 원본 상태(designStatusLabel)
 */
export function effectiveStatus(c: Contract): string {
  return statusOf(c) ?? designStatusLabel(c);
}

/** 설계OS 메모 (design_assignees.memo). 없으면 빈 문자열 */
export function memoOf(c: Contract): string {
  const rec = c as unknown as Record<string, unknown>;
  const v = rec._memo;
  return v ? String(v) : "";
}

/** 설계OS 검토자 승인 지정값 (design_assignees.review_done). 미지정이면 null */
export function reviewDoneOf(c: Contract): boolean | null {
  const rec = c as unknown as Record<string, unknown>;
  const v = rec._review_done;
  return v === true ? true : v === false ? false : null;
}

/**
 * 표시용 실제 검토자 승인 여부.
 * 1) 설계OS 지정값(review_done) 우선
 * 2) 없으면 세움os 원본 승인(design_confirmed)
 */
export function effectiveApproved(c: Contract): boolean {
  const v = reviewDoneOf(c);
  if (v !== null) return v;
  return Boolean(c.design_confirmed);
}

/** 배정 매핑(담당·상태)을 각 항목에 붙인다 (서버에서 큐 구성 후 호출) */
export function attachAssignees(
  items: Contract[],
  map: Map<string, AssignRecord>,
): Contract[] {
  for (const c of items) {
    const rec = c as unknown as Record<string, unknown>;
    const r = map.get(assigneeKey(sourceOf(c), c.id));
    rec._assignee = r?.assignee ?? null;
    rec._design_status = r?.design_status ?? null;
    rec._memo = r?.memo ?? null;
    rec._review_done = r?.review_done ?? null;
  }
  return items;
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
 * 우선순위 정렬 — 모든 탭 계약일 오름차순(빠른 순).
 */
export function sortPriority(list: Contract[], _tab: TabKey): Contract[] {
  return [...list].sort((a, b) => cmpDateAsc(a.contract_date, b.contract_date));
}

/**
 * 전자계약이 설계 우선순위 대상인지 여부.
 * 진행상태가 '계약완료'(= 체결 + 계약금 10% 수령) 인 건만 대상.
 * ('협의중'=미체결, '납품완료'=완료 건은 제외)
 */
export function econtractQualifies(e: EContract): boolean {
  return (e.status?.trim() ?? "") === "계약완료";
}

/**
 * 전자계약서를 우선순위 항목(계약 형태)으로 변환.
 * 수기 계약과 한 목록에서 함께 정렬/표시하기 위함. (_source='econtract', 상세는 /econtracts/{id})
 */
export function econtractToPriorityItem(
  e: EContract,
  typeKey: TypeKey,
): Contract {
  const item: Record<string, unknown> = {
    id: e.id,
    local_id: null,
    customer_name: e.client_name,
    model_name: null,
    sales_person: e.salesperson,
    showroom: e.showroom,
    showroom_id: e.showroom,
    status: e.status,
    contract_date: e.contract_date,
    created_at: e.created_at,
    contract_amount: e.total_amount,
    site_address: e.site_address,
    project_type: typeKey === "etc" ? null : TYPE_LABEL[typeKey],
    // 우선순위 표에선 큰 data(jsonb) 가 불필요 — 지역은 site_address 로 처리.
    // 통째로 실으면 전송량만 커지므로 제외한다.
    payload: null,
    is_urgent: null,
    priority_done: null,
    design_status: null,
    design_confirmed: null,
    is_deleted: null,
    // 우선순위 표에서 전자계약 행으로 구분
    _source: "econtract",
    _href: `/econtracts/${e.id}`,
    _key: `e-${e.id}`,
  };
  return item as unknown as Contract;
}

/**
 * 설계 진행 큐 공통 구성.
 * 수기 계약(계약금 수령) + 전자계약(계약완료) 을 한 목록으로 만들고 배정 매핑을 붙인다.
 * (우선순위/팀원/완료/검토자 페이지가 모두 이 큐에서 필터만 달리해 사용)
 */
export function buildDesignQueue(
  contracts: Contract[],
  econtracts: EContract[],
  assigneeMap: Map<string, AssignRecord>,
): Contract[] {
  const contractItems = contracts.filter(depositReceived);

  const byLocalId = new Map<string, Contract>();
  const byCustomer = new Map<string, Contract>();
  for (const c of contracts) {
    if (c.local_id) byLocalId.set(c.local_id, c);
    if (c.customer_name) byCustomer.set(c.customer_name, c);
  }
  const econItems = econtracts.filter(econtractQualifies).map((e) => {
    const matched =
      (e.contract_no ? byLocalId.get(e.contract_no) : undefined) ??
      (e.client_name ? byCustomer.get(e.client_name) : undefined);
    const tk = matched ? projectTypeKey(matched) : "etc";
    return econtractToPriorityItem(e, tk);
  });

  return attachAssignees([...contractItems, ...econItems], assigneeMap);
}
