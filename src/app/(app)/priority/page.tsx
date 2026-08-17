import PageHeader from "@/components/PageHeader";
import { ConnectionNotice } from "@/components/Notice";
import { getContracts, getEContractsLite, getDesignAssignees } from "@/lib/data";
import {
  attachAssignees,
  depositReceived,
  econtractToPriorityItem,
  projectTypeKey,
  type TabKey,
} from "@/lib/priority";
import type { Contract } from "@/types";
import PriorityView from "./PriorityView";

export const dynamic = "force-dynamic";

const VALID_TABS: TabKey[] = [
  "all",
  "urgent",
  "container",
  "stay",
  "house",
  "etc",
  "done",
];

export default async function PriorityPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string }>;
}) {
  const { type } = await searchParams;
  const initialTab: TabKey =
    type && VALID_TABS.includes(type as TabKey) ? (type as TabKey) : "all";

  const [res, eres, ares] = await Promise.all([
    getContracts(),
    getEContractsLite(),
    getDesignAssignees(),
  ]);

  // 설계담당 배정 매핑 (source:id → 이름)
  const assigneeMap = new Map<string, string | null>();
  for (const a of ares.data) {
    assigneeMap.set(`${a.source}:${a.ref_id}`, a.assignee);
  }

  // 1) 수기 계약: 계약금 받은 건
  const contractItems = res.data.filter(depositReceived);

  // 2) 전자계약: 전부 포함 (각각 별도 줄). 유형은 계약과 매칭해 추정
  const byLocalId = new Map<string, Contract>();
  const byCustomer = new Map<string, Contract>();
  for (const c of res.data) {
    if (c.local_id) byLocalId.set(c.local_id, c);
    if (c.customer_name) byCustomer.set(c.customer_name, c);
  }
  const econItems = eres.data.map((e) => {
    const matched =
      (e.contract_no ? byLocalId.get(e.contract_no) : undefined) ??
      (e.client_name ? byCustomer.get(e.client_name) : undefined);
    const tk = matched ? projectTypeKey(matched) : "etc";
    return econtractToPriorityItem(e, tk);
  });

  const queue = attachAssignees([...contractItems, ...econItems], assigneeMap);

  // 전자계약서가 있는 (수기) 계약 참조값 → 전자계약 뱃지용
  const econtractRefs = Array.from(
    new Set(
      eres.data
        .flatMap((e) => [e.contract_no, e.client_name])
        .filter((v): v is string => Boolean(v)),
    ),
  );

  return (
    <>
      <PageHeader
        title="설계팀 우선순위"
        description="설계 진행 우선순위 목록입니다. (수기 계약금 수령 건 + 전자계약 전체 · 계약일 빠른 순)"
      />
      <ConnectionNotice configured={res.configured} error={res.error} />
      <PriorityView
        key={initialTab}
        contracts={queue}
        initialTab={initialTab}
        econtractRefs={econtractRefs}
      />
    </>
  );
}
