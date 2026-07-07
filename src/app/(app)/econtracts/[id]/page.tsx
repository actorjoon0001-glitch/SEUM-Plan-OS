import Link from "next/link";
import PageHeader from "@/components/PageHeader";
import StatusBadge from "@/components/StatusBadge";
import { Card, CardHeader } from "@/components/Card";
import Notice, { ConnectionNotice } from "@/components/Notice";
import JsonView from "@/components/JsonView";
import CurrentUserBadge from "@/components/CurrentUserBadge";
import { getEContract } from "@/lib/data";
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
          <Field label="쇼룸" value={e.showroom ?? "-"} />
          <Field label="계약일" value={formatDate(e.contract_date)} />
          <Field label="계약 금액" value={formatMoney(e.total_amount)} />
          <Field label="현장 주소" value={e.site_address ?? "-"} full />
        </div>
      </Card>

      <Card className="mt-6">
        <CardHeader title="계약서 상세 내용" />
        <div className="px-5 py-4">
          <JsonView data={e.data} />
        </div>
      </Card>
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
