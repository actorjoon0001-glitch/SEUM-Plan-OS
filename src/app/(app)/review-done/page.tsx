import PageHeader from "@/components/PageHeader";
import { ConnectionNotice } from "@/components/Notice";
import { getContracts, getEContractsLite, getDesignAssignees } from "@/lib/data";
import {
  buildAssigneeMap,
  buildDesignQueue,
  effectiveApproved,
} from "@/lib/priority";
import PriorityView from "../priority/PriorityView";

export const dynamic = "force-dynamic";

export default async function ReviewDonePage() {
  const [res, eres, ares] = await Promise.all([
    getContracts(),
    getEContractsLite(),
    getDesignAssignees(),
  ]);

  const assigneeMap = buildAssigneeMap(ares.data);

  // 검토자 승인된 건만
  const queue = buildDesignQueue(res.data, eres.data, assigneeMap).filter((c) =>
    effectiveApproved(c),
  );

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
        title="검토 완료"
        description="검토자 승인이 완료된 건입니다."
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
