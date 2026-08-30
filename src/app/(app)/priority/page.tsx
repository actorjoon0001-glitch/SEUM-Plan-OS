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
  effectiveAssignee,
  type TabKey,
} from "@/lib/priority";
import { MEMBERS } from "@/lib/members";
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

  // 설계담당이 팀원(김철환·김성현·안준택·김찬영)으로 지정된 건은
  // 해당 팀원 페이지로 이동하므로 우선순위(배정 대기) 목록에서는 제외한다.
  const memberNames = new Set(MEMBERS.map((m) => m.name));
  const queue = attachPartnerFlag(
    buildDesignQueue(res.data, eres.data, assigneeMap).filter((c) => {
      const a = effectiveAssignee(c);
      return !a || !memberNames.has(a);
    }),
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
        title="설계팀 우선순위"
        description="설계담당 배정 대기 목록입니다. 담당자를 지정하면 해당 팀원 페이지로 이동합니다. (수기 계약금 수령 건 + 전자계약 계약완료 건 · 계약일 빠른 순)"
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
