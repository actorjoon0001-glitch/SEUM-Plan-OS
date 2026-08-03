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

  const listUrl = "https://seum-contract-os.netlify.app/#/";

  return (
    <>
      <CurrentUserBadge />
      <PageHeader
        title="전자계약서"
        description="세움 전산 계약서(Contract-OS) 원본 목록입니다."
      />
      <ConnectionNotice configured={res.configured} error={res.error} />

      {/* 원본 전산 계약서 목록 임베드 */}
      <div className="mb-2 flex items-center justify-between gap-3">
        <p className="text-sm font-semibold text-slate-800">
          전산 계약서 목록
        </p>
        <a
          href={listUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 rounded-lg bg-brand-600 px-3.5 py-2 text-sm font-medium text-white hover:bg-brand-700"
        >
          📄 새 탭에서 열기
        </a>
      </div>
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <iframe
          src={listUrl}
          title="전산 계약서 목록"
          className="w-full"
          style={{ height: 1600, border: "none" }}
          loading="lazy"
        />
      </div>
      <p className="mt-2 text-xs text-slate-400">
        원본이 안 보이면(로그인 필요 등) 위 “새 탭에서 열기” 를 눌러 확인하세요.
      </p>

      {/* 간략 목록 (예비) */}
      <details className="mt-6">
        <summary className="cursor-pointer text-sm font-medium text-slate-500">
          간략 목록 보기 (필터·유형 탭)
        </summary>
        <div className="mt-3">
          <EContractsView econtracts={res.data} types={types} />
        </div>
      </details>
    </>
  );
}
