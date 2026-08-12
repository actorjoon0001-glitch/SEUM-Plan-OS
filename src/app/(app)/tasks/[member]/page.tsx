import { notFound } from "next/navigation";
import PageHeader from "@/components/PageHeader";
import { ConnectionNotice } from "@/components/Notice";
import { getContracts, getEContracts, getDesignAssignees } from "@/lib/data";
import {
  assigneeOf,
  attachAssignees,
  depositReceived,
  econtractToPriorityItem,
  projectTypeKey,
} from "@/lib/priority";
import { memberBySlug } from "@/lib/members";
import type { Contract } from "@/types";
import PriorityView from "../../priority/PriorityView";

export const dynamic = "force-dynamic";

export default async function MemberTasksPage({
  params,
}: {
  params: Promise<{ member: string }>;
}) {
  const { member } = await params;
  const m = memberBySlug(member);
  if (!m) notFound();

  const [res, eres, ares] = await Promise.all([
    getContracts(),
    getEContracts(),
    getDesignAssignees(),
  ]);

  const assigneeMap = new Map<string, string | null>();
  for (const a of ares.data) {
    assigneeMap.set(`${a.source}:${a.ref_id}`, a.assignee);
  }

  // 우선순위 큐와 동일하게 구성 (수기 계약금 수령 건 + 전자계약 전체)
  const contractItems = res.data.filter(depositReceived);

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

  // 설계담당(배정)이 이 구성원인 건만
  const queue = attachAssignees(
    [...contractItems, ...econItems],
    assigneeMap,
  ).filter((c) => assigneeOf(c) === m.name);

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
        title={`${m.name} 설계 업무`}
        description={`${m.name} 님이 설계 담당인 진행 건입니다. (우선순위 큐 기준)`}
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
