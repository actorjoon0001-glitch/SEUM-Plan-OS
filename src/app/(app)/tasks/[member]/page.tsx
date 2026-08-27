import { notFound } from "next/navigation";
import PageHeader from "@/components/PageHeader";
import { ConnectionNotice } from "@/components/Notice";
import { getContracts, getEContractsLite, getDesignAssignees } from "@/lib/data";
import {
  buildAssigneeMap,
  buildDesignQueue,
  effectiveAssignee,
  effectiveStatus,
} from "@/lib/priority";
import { memberBySlug } from "@/lib/members";
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
    getEContractsLite(),
    getDesignAssignees(),
  ]);

  const assigneeMap = buildAssigneeMap(ares.data);

  // 이 구성원 담당 & 아직 완료 아닌 건 (완료되면 '설계 완료' 화면으로 이동)
  const queue = buildDesignQueue(res.data, eres.data, assigneeMap).filter(
    (c) => effectiveAssignee(c) === m.name && effectiveStatus(c) !== "완료",
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
        title={`${m.name} 설계 업무`}
        description={`${m.name} 님이 설계 담당인 진행 건입니다. (완료 건은 '설계 완료' 화면으로 이동)`}
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
