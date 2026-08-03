import PageHeader from "@/components/PageHeader";
import { ConnectionNotice } from "@/components/Notice";
import CurrentUserBadge from "@/components/CurrentUserBadge";
import { getEContracts, getContracts } from "@/lib/data";
import { projectTypeKey, type TypeKey } from "@/lib/priority";
import type { Contract } from "@/types";
import EContractsView from "./EContractsView";

export const dynamic = "force-dynamic";

export default async function EContractsPage() {
  const [res, cres] = await Promise.all([getEContracts(), getContracts()]);

  // 전자계약서 유형 분류용: 계약(local_id/고객명)과 매칭해 계약의 유형을 사용
  const byLocalId = new Map<string, Contract>();
  const byCustomer = new Map<string, Contract>();
  for (const c of cres.data) {
    if (c.local_id) byLocalId.set(c.local_id, c);
    if (c.customer_name) byCustomer.set(c.customer_name, c);
  }
  const types: Record<number, TypeKey> = {};
  for (const e of res.data) {
    const c =
      (e.contract_no ? byLocalId.get(e.contract_no) : undefined) ??
      (e.client_name ? byCustomer.get(e.client_name) : undefined);
    types[e.id] = c ? projectTypeKey(c) : "etc";
  }

  return (
    <>
      <CurrentUserBadge />
      <PageHeader
        title="전자계약서"
        description="세움os에 등록된 전자계약서입니다. 년·월·전시장·유형·상태로 필터할 수 있습니다."
      />
      <ConnectionNotice configured={res.configured} error={res.error} />
      <EContractsView econtracts={res.data} types={types} />
    </>
  );
}
