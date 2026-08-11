import PageHeader from "@/components/PageHeader";
import { ConnectionNotice } from "@/components/Notice";
import { getContracts, getEContracts } from "@/lib/data";
import { depositReceived, isPriorityDone } from "@/lib/priority";
import PriorityView from "../priority/PriorityView";

export const dynamic = "force-dynamic";

export default async function ReviewPriorityPage() {
  const [res, eres] = await Promise.all([getContracts(), getEContracts()]);

  // 계약금 받은 건 중 작업완료(priority_done)된 건만 → 검토자 승인 대기 목록
  const queue = res.data
    .filter(depositReceived)
    .filter(isPriorityDone);

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
        title="검토자 우선순위"
        description="설계 작업완료된 건들입니다. 계약일 빠른 순으로 검토자 승인을 진행하세요."
      />
      <ConnectionNotice configured={res.configured} error={res.error} />
      <PriorityView
        contracts={queue}
        initialTab="done"
        econtractRefs={econtractRefs}
        reviewMode
      />
    </>
  );
}
