import PageHeader from "@/components/PageHeader";
import { ConnectionNotice } from "@/components/Notice";
import CurrentUserBadge from "@/components/CurrentUserBadge";
import { getEContracts } from "@/lib/data";
import EContractsView from "./EContractsView";

export const dynamic = "force-dynamic";

export default async function EContractsPage() {
  const res = await getEContracts();

  return (
    <>
      <CurrentUserBadge />
      <PageHeader
        title="전자계약서"
        description="세움os에 등록된 전자계약서입니다. 상단 상태 필터로 원하는 상태만 볼 수 있습니다."
      />
      <ConnectionNotice configured={res.configured} error={res.error} />
      <EContractsView econtracts={res.data} />
    </>
  );
}
