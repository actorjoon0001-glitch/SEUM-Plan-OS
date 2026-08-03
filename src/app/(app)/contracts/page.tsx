import PageHeader from "@/components/PageHeader";
import { ConnectionNotice } from "@/components/Notice";
import { getContracts } from "@/lib/data";
import ContractsView from "./ContractsView";

export const dynamic = "force-dynamic";

export default async function ContractsPage() {
  const res = await getContracts();

  const listUrl = "https://seum-os.netlify.app/dashboard.html";

  return (
    <>
      <PageHeader
        title="수기 계약서"
        description="세움os 원본 계약 목록입니다. (전자계약서는 별도 메뉴)"
      />
      <ConnectionNotice configured={res.configured} error={res.error} />

      {/* 세움os 원본 임베드 */}
      <div className="mb-2 flex items-center justify-between gap-3">
        <p className="text-sm font-semibold text-slate-800">세움os 계약 목록</p>
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
          title="세움os 계약 목록"
          className="w-full"
          style={{ height: "calc(100vh - 12rem)", minHeight: 700, border: "none" }}
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
          <ContractsView contracts={res.data} />
        </div>
      </details>
    </>
  );
}
