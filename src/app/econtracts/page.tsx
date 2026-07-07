import PageHeader from "@/components/PageHeader";
import { ConnectionNotice } from "@/components/Notice";
import { getEContracts } from "@/lib/data";
import EContractsView from "./EContractsView";

export const dynamic = "force-dynamic";

export default async function EContractsPage() {
  const res = await getEContracts();

  return (
    <>
      <PageHeader
        title="전자계약서"
        description="세움os에 등록된 전자계약서입니다. 현장 주소·계약 금액 등 설계에 필요한 정보를 확인하세요."
      />
      <ConnectionNotice configured={res.configured} error={res.error} />
      <EContractsView econtracts={res.data} />
    </>
  );
}
