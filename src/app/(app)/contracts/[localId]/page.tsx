import Link from "next/link";
import PageHeader from "@/components/PageHeader";
import StatusBadge from "@/components/StatusBadge";
import { Card, CardHeader } from "@/components/Card";
import SalesContractView from "@/components/SalesContractView";
import DrawingUpload from "@/components/DrawingUpload";
import PartnerPermitList from "@/components/PartnerPermitList";
import Notice, { ConnectionNotice } from "@/components/Notice";
import { getContract, getPartnerSubmissionsByName } from "@/lib/data";
import { contractTitle, designStatusLabel } from "@/lib/contract";
import { formatDate } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function ContractDetailPage({
  params,
}: {
  params: Promise<{ localId: string }>;
}) {
  const { localId } = await params;
  const id = decodeURIComponent(localId);

  const contractRes = await getContract(id);
  const c = contractRes.data;

  if (contractRes.error) {
    return (
      <>
        <BackLink />
        <ConnectionNotice
          configured={contractRes.configured}
          error={contractRes.error}
        />
      </>
    );
  }

  if (!c) {
    return (
      <>
        <BackLink />
        <Notice
          tone="empty"
          title="계약을 찾을 수 없습니다"
          detail={`local_id: ${id}`}
        />
      </>
    );
  }

  // 인허가: 협력사(해영·필·토목)가 올린 자료 중 고객명 매칭 건 자동 연결
  // (협력사 자료엔 contract_local_id 가 없어 제목의 고객명으로만 매칭됨)
  const permitRes = await getPartnerSubmissionsByName(c.customer_name);
  const permits = permitRes.data;

  // 고객 전화번호 · 현장 주소 (payload)
  const payload =
    c.payload && typeof c.payload === "object" && !Array.isArray(c.payload)
      ? (c.payload as Record<string, unknown>)
      : {};
  const phone = payload.phone ? String(payload.phone) : "-";
  const siteAddr =
    String(
      payload.siteAddress ??
        payload.address ??
        c.site_address ??
        c.address ??
        "",
    ) || "-";

  return (
    <>
      <BackLink />

      <PageHeader
        title={contractTitle(c)}
        description={`${c.customer_name ?? "-"} · 계약번호 ${c.local_id ?? c.id}`}
        action={<StatusBadge status={designStatusLabel(c)} />}
      />

      {/* 요약 */}
      <Card className="px-5 py-2">
        <div className="grid grid-cols-1 gap-x-12 sm:grid-cols-2">
          <Field label="고객명" value={c.customer_name ?? "-"} />
          <Field label="담당 영업사원" value={c.sales_person ?? "-"} />
          <Field label="고객 전화번호" value={phone} />
          <Field label="계약일" value={formatDate(c.contract_date)} />
          <Field label="현장 주소" value={siteAddr} full />
        </div>
      </Card>

      {/* 영업팀 작성 계약 상세 (원본 데이터) */}
      <Card className="mt-6">
        <CardHeader
          title="영업팀 작성 계약 상세"
          action={
            <span className="text-xs text-slate-400">세움os 계약목록 입력 내용</span>
          }
        />
        <div className="px-5 py-4">
          <SalesContractView payload={c.payload} />
        </div>
      </Card>

      {/* 협의 도면 / 시공도면 업로드 */}
      <div className="mt-6 space-y-4">
        <DrawingUpload
          ownerId={c.id}
          source="contract"
          bucket="consult-drawings"
          title="협의 도면"
          description="이 계약의 협의 도면을 업로드·열람합니다. (이미지·PDF)"
        />
        <DrawingUpload
          ownerId={c.id}
          source="contract"
          bucket="construction-drawings"
          title="시공도면"
          description="이 계약의 시공도면을 업로드·열람합니다. (이미지·PDF)"
        />
      </div>

      {/* 인허가 — 외부 건축 협력사가 올린 자료 자동 연결 (고객명 매칭, 읽기 전용) */}
      <div className="mt-6 rounded-xl border border-slate-200 bg-white p-5">
        <p className="text-sm font-semibold text-slate-800">
          인허가{" "}
          <span className="ml-1 rounded bg-slate-100 px-1.5 py-0.5 text-xs font-medium text-slate-500">
            협력사 자동 연결
          </span>
        </p>
        <p className="text-xs text-slate-400">
          외부 건축 협력사(해영·필·토목)가 올린 자료 중 고객명(
          {c.customer_name ?? "-"})이 포함된 건이 자동으로 표시됩니다.
        </p>
        {permits.length === 0 ? (
          <p className="mt-3 rounded-lg border border-dashed border-slate-200 py-8 text-center text-sm text-slate-400">
            연결된 협력사 인허가 자료가 없습니다.
          </p>
        ) : (
          <PartnerPermitList
            items={permits.map((s, i) => ({
              key: `${(s as { _table?: string })._table ?? ""}-${s.id}-${i}`,
              title: s.title || s.file_name || "(제목 없음)",
              fileUrl: s.file_url ?? null,
              by: s.uploaded_by_name ?? "협력사",
              at: s.uploaded_at ?? null,
            }))}
          />
        )}
      </div>
    </>
  );
}

function BackLink() {
  return (
    <Link
      href="/contracts"
      className="mb-4 inline-flex items-center gap-1 text-sm text-slate-500 hover:text-brand-600"
    >
      <span aria-hidden>←</span> 계약 목록
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
    <div
      className={`border-b border-slate-100 py-3 ${
        full ? "sm:col-span-2" : ""
      }`}
    >
      <p className="text-sm text-slate-400">{label}</p>
      <p className="mt-1 text-[15px] font-semibold text-slate-800">{value}</p>
    </div>
  );
}

