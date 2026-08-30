import { createClient } from "./supabase/server";
import { isSupabaseConfigured } from "./supabase/config";
import type {
  Contract,
  ContractDrawing,
  HaeyoungSubmission,
  ContractChatMessage,
  SiteProgressPhoto,
  Employee,
  Payment,
  EContract,
} from "@/types";

/** 데이터 조회 공통 결과 래퍼 — 화면에서 연결/설정 상태를 안내하기 위함 */
export interface Fetched<T> {
  data: T;
  error: string | null;
  configured: boolean;
}

function notConfigured<T>(fallback: T): Fetched<T> {
  return {
    data: fallback,
    configured: false,
    error:
      "Supabase 연결 정보가 없습니다. .env.local 에 NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY 를 설정하세요.",
  };
}

async function run<T>(
  fallback: T,
  fn: () => Promise<T>,
): Promise<Fetched<T>> {
  if (!isSupabaseConfigured) return notConfigured(fallback);
  try {
    const data = await fn();
    return { data, error: null, configured: true };
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    return { data: fallback, configured: true, error: message };
  }
}

const notDeleted = <T extends { is_deleted?: boolean | null }>(rows: T[]) =>
  rows.filter((r) => !r.is_deleted);

// ─────────────────────────────────────────────────────────────
// 계약(프로젝트)
// ─────────────────────────────────────────────────────────────

/** 설계팀 대상 계약 목록 (삭제 제외, 최신 계약일 순) */
export function getContracts() {
  return run<Contract[]>([], async () => {
    const sb = await createClient();
    const { data, error } = await sb
      .from("contracts")
      .select("*")
      .order("contract_date", { ascending: false, nullsFirst: false })
      .limit(500);
    if (error) throw new Error(error.message);
    return notDeleted((data ?? []) as Contract[]);
  });
}

/** local_id 로 단일 계약 조회 */
export function getContract(localId: string) {
  return run<Contract | null>(null, async () => {
    const sb = await createClient();
    const { data, error } = await sb
      .from("contracts")
      .select("*")
      .eq("local_id", localId)
      .limit(1)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return (data as Contract) ?? null;
  });
}

// ─────────────────────────────────────────────────────────────
// 도면
// ─────────────────────────────────────────────────────────────

export function getDrawings(contractLocalId?: string) {
  return run<ContractDrawing[]>([], async () => {
    const sb = await createClient();
    let q = sb
      .from("contract_drawings")
      .select("*")
      .order("uploaded_at", { ascending: false, nullsFirst: false })
      .limit(1000);
    if (contractLocalId) q = q.eq("contract_local_id", contractLocalId);
    const { data, error } = await q;
    if (error) throw new Error(error.message);
    return (data ?? []) as ContractDrawing[];
  });
}

// ─────────────────────────────────────────────────────────────
// 인허가 / 제출 서류
// ─────────────────────────────────────────────────────────────

export function getSubmissions(contractLocalId?: string) {
  return run<HaeyoungSubmission[]>([], async () => {
    const sb = await createClient();
    let q = sb
      .from("haeyoung_submissions")
      .select("*")
      .order("uploaded_at", { ascending: false, nullsFirst: false })
      .limit(1000);
    if (contractLocalId) q = q.eq("contract_local_id", contractLocalId);
    const { data, error } = await q;
    if (error) throw new Error(error.message);
    return notDeleted((data ?? []) as HaeyoungSubmission[]);
  });
}

/** 협력사(건축사)별 제출 자료 — 건축사마다 테이블이 분리되어 있음 */
export function getPartnerSubmissions(table: string) {
  return run<HaeyoungSubmission[]>([], async () => {
    const sb = await createClient();
    const { data, error } = await sb
      .from(table)
      .select("*")
      .order("uploaded_at", { ascending: false, nullsFirst: false })
      .limit(1000);
    if (error) {
      // 아직 만들어지지 않은 테이블이면 오류 대신 빈 목록으로 처리
      if (/does not exist|could not find|relation|schema cache/i.test(error.message)) {
        return [];
      }
      throw new Error(error.message);
    }
    return notDeleted((data ?? []) as HaeyoungSubmission[]);
  });
}

/**
 * 고객명으로 협력사 제출 자료(인허가) 자동 매칭.
 * 협력사 자료엔 계약 연결키가 없어 제목(title)에 고객명이 포함된 건으로 찾는다.
 * 해영/필/토목 3개 테이블을 모두 조회한다.
 */
export function getPartnerSubmissionsByName(name: string | null) {
  return run<HaeyoungSubmission[]>([], async () => {
    const key = (name ?? "").split(/[,/·]/)[0].trim();
    if (!key || key.length < 2) return [];
    const sb = await createClient();
    const tables = [
      "haeyoung_submissions",
      "pil_submissions",
      "civil_submissions",
    ];
    const all: HaeyoungSubmission[] = [];
    for (const t of tables) {
      const { data, error } = await sb
        .from(t)
        .select("*")
        .ilike("title", `%${key}%`)
        .limit(100);
      if (error) {
        if (/does not exist|could not find|relation|schema cache/i.test(error.message)) {
          continue;
        }
        throw new Error(error.message);
      }
      for (const row of notDeleted((data ?? []) as HaeyoungSubmission[])) {
        all.push({ ...row, _table: t } as HaeyoungSubmission & { _table: string });
      }
    }
    return all;
  });
}

// ─────────────────────────────────────────────────────────────
// 협의 · 소통
// ─────────────────────────────────────────────────────────────

export function getMessages(contractId?: string, limit = 300) {
  return run<ContractChatMessage[]>([], async () => {
    const sb = await createClient();
    let q = sb
      .from("contract_chat_messages")
      .select("*")
      .order("created_at", { ascending: false, nullsFirst: false })
      .limit(limit);
    if (contractId) q = q.eq("contract_id", contractId);
    const { data, error } = await q;
    if (error) throw new Error(error.message);
    return notDeleted((data ?? []) as ContractChatMessage[]);
  });
}

// ─────────────────────────────────────────────────────────────
// 현장 사진
// ─────────────────────────────────────────────────────────────

export function getSitePhotos(contractLocalId?: string) {
  return run<SiteProgressPhoto[]>([], async () => {
    const sb = await createClient();
    let q = sb
      .from("site_progress_photos")
      .select("*")
      .order("uploaded_at", { ascending: false, nullsFirst: false })
      .limit(500);
    if (contractLocalId) q = q.eq("contract_local_id", contractLocalId);
    const { data, error } = await q;
    if (error) throw new Error(error.message);
    return (data ?? []) as SiteProgressPhoto[];
  });
}

// ─────────────────────────────────────────────────────────────
// 대금 (계약 상세용)
// ─────────────────────────────────────────────────────────────

export function getPayments(contractId: number) {
  return run<Payment[]>([], async () => {
    const sb = await createClient();
    const { data, error } = await sb
      .from("payments")
      .select("*")
      .eq("contract_id", contractId)
      .order("payment_date", { ascending: true, nullsFirst: false });
    if (error) throw new Error(error.message);
    return (data ?? []) as Payment[];
  });
}

// ─────────────────────────────────────────────────────────────
// 전자계약서 (econtracts)
// ─────────────────────────────────────────────────────────────

export function getEContracts() {
  return run<EContract[]>([], async () => {
    const sb = await createClient();
    const { data, error } = await sb
      .from("econtracts")
      .select("*")
      .order("contract_date", { ascending: false, nullsFirst: false })
      .limit(500);
    if (error) throw new Error(error.message);
    return (data ?? []) as EContract[];
  });
}

/**
 * 전자계약서 경량 조회 — 큰 data(jsonb) 컬럼 제외.
 * 우선순위/구성원/검토자 페이지처럼 목록 필드만 필요한 곳에서 사용해 전송량을 줄인다.
 */
export function getEContractsLite() {
  return run<EContract[]>([], async () => {
    const sb = await createClient();
    const { data, error } = await sb
      .from("econtracts")
      .select(
        "id, contract_no, status, client_name, site_address, showroom, salesperson, contract_date, total_amount, created_at, updated_at, stage:data->>stage",
      )
      .order("contract_date", { ascending: false, nullsFirst: false })
      .limit(500);
    if (error) throw new Error(error.message);
    return (data ?? []) as EContract[];
  });
}

export function getEContract(id: number) {
  return run<EContract | null>(null, async () => {
    const sb = await createClient();
    const { data, error } = await sb
      .from("econtracts")
      .select("*")
      .eq("id", id)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return (data as EContract) ?? null;
  });
}

/**
 * 특정 계약에 연결되는 전자계약서 조회.
 * econtracts 는 contracts 와 직접 FK 가 없어 contract_no(=local_id) 또는
 * client_name(=customer_name) 으로 매칭한다.
 */
export function getEContractsForContract(
  localId: string | null,
  customerName: string | null,
) {
  return run<EContract[]>([], async () => {
    const sb = await createClient();
    const found = new Map<number, EContract>();

    if (localId) {
      const { data, error } = await sb
        .from("econtracts")
        .select("*")
        .eq("contract_no", localId)
        .limit(20);
      if (error) throw new Error(error.message);
      for (const e of (data ?? []) as EContract[]) found.set(e.id, e);
    }
    if (customerName) {
      const { data, error } = await sb
        .from("econtracts")
        .select("*")
        .eq("client_name", customerName)
        .limit(20);
      if (error) throw new Error(error.message);
      for (const e of (data ?? []) as EContract[]) found.set(e.id, e);
    }
    return [...found.values()];
  });
}

// ─────────────────────────────────────────────────────────────
// 직원 (설계팀 담당자)
// ─────────────────────────────────────────────────────────────

// ─────────────────────────────────────────────────────────────
// 설계 담당 지정 (설계OS 전용 매핑 테이블)
// contracts/econtracts 운영 테이블을 건드리지 않고 별도 테이블에 배정 저장.
// (source: 'contract' | 'econtract', ref_id: 각 테이블 id)
// ─────────────────────────────────────────────────────────────

export interface DesignAssignee {
  source: string;
  ref_id: number;
  assignee: string | null;
  design_status?: string | null;
  memo?: string | null;
  review_done?: boolean | null;
}

export function getDesignAssignees() {
  return run<DesignAssignee[]>([], async () => {
    const sb = await createClient();
    const { data, error } = await sb
      .from("design_assignees")
      .select("source, ref_id, assignee, design_status, memo, review_done");
    if (error) {
      // 아직 테이블이 없으면 오류 대신 빈 목록으로 처리
      if (/does not exist|could not find|relation|schema cache/i.test(error.message)) {
        return [];
      }
      throw new Error(error.message);
    }
    return (data ?? []) as DesignAssignee[];
  });
}

export function getDesignTeam() {
  return run<Employee[]>([], async () => {
    const sb = await createClient();
    const { data, error } = await sb
      .from("employees")
      .select("*")
      .ilike("team", "%설계%")
      .order("name", { ascending: true });
    if (error) throw new Error(error.message);
    return (data ?? []) as Employee[];
  });
}
