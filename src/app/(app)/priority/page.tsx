import PageHeader from "@/components/PageHeader";
import { ConnectionNotice } from "@/components/Notice";
import {
  getContracts,
  getEContractsLite,
  getDesignAssignees,
  getPartnerSubmissionTitles,
} from "@/lib/data";
import {
  attachPartnerFlag,
  buildAssigneeMap,
  buildDesignQueue,
  type TabKey,
} from "@/lib/priority";
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

  const [res, eres, ares, ptitles] = await Promise.all([
    getContracts(),
    getEContractsLite(),
    getDesignAssignees(),
    getPartnerSubmissionTitles(),
  ]);

  const assigneeMap = buildAssigneeMap(ares.data);

  // 담당자가 지정돼도 작업현황에는 그대로 남긴다(전체 진행 현황 한눈에).
  // 팀원 개인 페이지는 이 큐에서 담당자 기준으로 따로 필터한다.
  const queue = attachPartnerFlag(
    buildDesignQueue(res.data, eres.data, assigneeMap),
    ptitles.data,
  );

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
        title="설계팀 작업현황"
        description="설계팀 전체 작업 현황입니다. 담당자를 지정해도 목록에 그대로 남습니다. 전시장·월별로 계약 건을 확인하세요. (수기 계약금 수령 건 + 전자계약 계약완료 건)"
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
