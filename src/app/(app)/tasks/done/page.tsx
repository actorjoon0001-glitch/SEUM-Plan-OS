import PageHeader from "@/components/PageHeader";
import { ConnectionNotice } from "@/components/Notice";
import { getContracts, getEContractsLite, getDesignAssignees } from "@/lib/data";
import {
  attachAssignees,
  depositReceived,
  econtractQualifies,
  econtractToPriorityItem,
  effectiveStatus,
  projectTypeKey,
} from "@/lib/priority";
import type { Contract } from "@/types";
import PriorityView from "../../priority/PriorityView";

export const dynamic = "force-dynamic";

export default async function DesignDonePage() {
  const [res, eres, ares] = await Promise.all([
    getContracts(),
    getEContractsLite(),
    getDesignAssignees(),
  ]);

  const assigneeMap = new Map<
    string,
    {
      assignee: string | null;
      design_status: string | null;
      memo: string | null;
    }
  >();
  for (const a of ares.data) {
    assigneeMap.set(`${a.source}:${a.ref_id}`, {
      assignee: a.assignee,
      design_status: a.design_status ?? null,
      memo: a.memo ?? null,
    });
  }

  // 우선순위 큐와 동일하게 구성 (수기 계약금 수령 건 + 전자계약 계약완료 건)
  const contractItems = res.data.filter(depositReceived);

  const byLocalId = new Map<string, Contract>();
  const byCustomer = new Map<string, Contract>();
  for (const c of res.data) {
    if (c.local_id) byLocalId.set(c.local_id, c);
    if (c.customer_name) byCustomer.set(c.customer_name, c);
  }
  const econItems = eres.data.filter(econtractQualifies).map((e) => {
    const matched =
      (e.contract_no ? byLocalId.get(e.contract_no) : undefined) ??
      (e.client_name ? byCustomer.get(e.client_name) : undefined);
    const tk = matched ? projectTypeKey(matched) : "etc";
    return econtractToPriorityItem(e, tk);
  });

  // 설계진행 상태가 '완료'인 건만
  const queue = attachAssignees(
    [...contractItems, ...econItems],
    assigneeMap,
  ).filter((c) => effectiveStatus(c) === "완료");

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
        title="설계 완료"
        description="설계진행 상태가 '완료'로 처리된 건입니다."
      />
      <ConnectionNotice configured={res.configured} error={res.error} />
      <PriorityView
        contracts={queue}
        initialTab="all"
        econtractRefs={econtractRefs}
        reviewMode
      />
    </>
  );
}
