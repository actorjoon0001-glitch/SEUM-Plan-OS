import PageHeader from "@/components/PageHeader";
import { ConnectionNotice } from "@/components/Notice";
import { getContracts, getEContractsLite, getDesignAssignees } from "@/lib/data";
import {
  buildAssigneeMap,
  buildDesignQueue,
  effectiveStatus,
} from "@/lib/priority";
import PriorityView from "../../priority/PriorityView";

export const dynamic = "force-dynamic";

export default async function DesignDonePage() {
  const [res, eres, ares] = await Promise.all([
    getContracts(),
    getEContractsLite(),
    getDesignAssignees(),
  ]);

  const assigneeMap = buildAssigneeMap(ares.data);

  // 설계진행 상태가 '완료'인 건만
  const queue = buildDesignQueue(res.data, eres.data, assigneeMap).filter(
    (c) => effectiveStatus(c) === "완료",
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
