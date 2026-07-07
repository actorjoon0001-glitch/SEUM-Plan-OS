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

/** 현재 로그인한 사용자와 매칭되는 직원 정보 */
export async function getCurrentEmployee(): Promise<{
  email: string | null;
  employee: Employee | null;
}> {
  if (!isSupabaseConfigured) return { email: null, employee: null };
  try {
    const sb = await createClient();
    const {
      data: { user },
    } = await sb.auth.getUser();
    if (!user) return { email: null, employee: null };

    let employee: Employee | null = null;
    const byAuth = await sb
      .from("employees")
      .select("*")
      .eq("auth_user_id", user.id)
      .maybeSingle();
    employee = (byAuth.data as Employee) ?? null;

    if (!employee && user.email) {
      const byEmail = await sb
        .from("employees")
        .select("*")
        .eq("email", user.email)
        .maybeSingle();
      employee = (byEmail.data as Employee) ?? null;
    }

    return { email: user.email ?? null, employee };
  } catch {
    return { email: null, employee: null };
  }
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
