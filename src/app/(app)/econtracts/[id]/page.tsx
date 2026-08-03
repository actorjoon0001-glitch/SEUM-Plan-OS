import Link from "next/link";
import PageHeader from "@/components/PageHeader";
import StatusBadge from "@/components/StatusBadge";
import { Card } from "@/components/Card";
import Notice, { ConnectionNotice } from "@/components/Notice";
import EContractDoc from "@/components/EContractDoc";
import CurrentUserBadge from "@/components/CurrentUserBadge";
import { getEContract } from "@/lib/data";
import { koShowroom } from "@/lib/priority";
import { formatDate, formatMoney } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function EContractDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const numId = Number(id);

  const res = await getEContract(numId);
  const e = res.data;

  if (res.error) {
    return (
      <>
        <BackLink />
        <ConnectionNotice configured={res.configured} error={res.error} />
      </>
    );
  }

  if (!e) {
    return (
      <>
        <BackLink />
        <Notice tone="empty" title="전자계약서를 찾을 수 없습니다" detail={`id: ${id}`} />
      </>
    );
  }

  // 원본 전자계약서(세움 전산 계약서) 주소 — 같은 econtracts.id 사용
  const originUrl = `https://seum-contract-os.netlify.app/#/edit/${e.id}`;

  return (
    <>
      <CurrentUserBadge />
      <BackLink />
      <PageHeader
        title={`전자계약서 ${e.contract_no || `#${e.id}`}`}
        description={e.client_name ?? undefined}
        action={<StatusBadge status={e.status} />}
      />

      <Card className="p-5">
        <div className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-3">
          <Field label="계약번호" value={e.contract_no ?? "-"} />
          <Field label="고객명" value={e.client_name ?? "-"} />
          <Field label="담당자" value={e.salesperson ?? "-"} />
          <Field label="전시장" value={koShowroom(e.showroom)} />
          <Field label="계약일" value={formatDate(e.contract_date)} />
          <Field label="계약 금액" value={formatMoney(e.total_amount)} />
          <Field label="현장 주소" value={e.site_address ?? "-"} full />
        </div>
      </Card>

      {/* 원본 전자계약서 (세움 전산 계약서) */}
      <div className="mt-6 flex items-center justify-between gap-3">
        <p className="text-sm font-semibold text-slate-800">원본 전자계약서</p>
        <a
          href={originUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 rounded-lg bg-brand-600 px-3.5 py-2 text-sm font-medium text-white hover:bg-brand-700"
        >
          📄 새 탭에서 열기
        </a>
      </div>
      <Card className="mt-2 overflow-hidden p-0">
        <iframe
          src={originUrl}
          title="전자계약서 원본"
          className="w-full"
          style={{ height: 1500, border: "none" }}
          loading="lazy"
        />
      </Card>
      <p className="mt-2 text-xs text-slate-400">
        원본이 안 보이면(로그인 필요 등) 위 “새 탭에서 열기” 를 눌러 세움 계약서에서 확인하세요.
      </p>

      {/* 간략 내용 (예비) */}
      <details className="mt-6">
        <summary className="cursor-pointer text-sm font-medium text-slate-500">
          간략 내용 보기
        </summary>
        <EContractDoc data={e.data} />
      </details>
    </>
  );
}

function BackLink() {
  return (
    <Link
      href="/econtracts"
      className="mb-4 inline-flex items-center gap-1 text-sm text-slate-500 hover:text-brand-600"
    >
      <span aria-hidden>←</span> 전자계약서 목록
    </Link>
  );
}

function Field({
  label,
  value,
  full = false,
}: {
  label: string;
  value: string;
  full?: boolean;
}) {
  return (
    <div className={full ? "col-span-2 sm:col-span-3" : ""}>
      <p className="text-xs text-slate-400">{label}</p>
      <p className="mt-0.5 font-medium text-slate-800">{value}</p>
    </div>
  );
}
