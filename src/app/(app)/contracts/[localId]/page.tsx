import Link from "next/link";
import PageHeader from "@/components/PageHeader";
import StatusBadge from "@/components/StatusBadge";
import { Card, CardHeader } from "@/components/Card";
import SalesContractView from "@/components/SalesContractView";
import DrawingUpload from "@/components/DrawingUpload";
import Notice, { ConnectionNotice } from "@/components/Notice";
import { getContract, getSubmissions } from "@/lib/data";
import { contractTitle, designStatusLabel } from "@/lib/contract";
import { formatDate, formatFileSize } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function ContractDetailPage({
  params,
}: {
  params: Promise<{ localId: string }>;
}) {
  const { localId } = await params;
  const id = decodeURIComponent(localId);

  const [contractRes, submissionsRes] = await Promise.all([
    getContract(id),
    getSubmissions(id),
  ]);

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

  const submissions = submissionsRes.data;

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
      <Card className="p-5">
        <div className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-3">
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

      {/* 인허가 */}
      <SectionCard
        title="인허가 · 제출 서류"
        count={submissions.length}
        href="/permits"
        empty="등록된 인허가 서류가 없습니다."
      >
        {submissions.map((s) => (
          <FileRow
            key={s.id}
            name={s.title || s.file_name}
            url={s.file_url}
            tag={s.file_type}
            meta={`${s.design_manager ?? s.uploaded_by_name ?? "-"} · ${formatDate(
              s.uploaded_at,
            )} · ${formatFileSize(s.file_size)}`}
          />
        ))}
      </SectionCard>
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
    <div className={full ? "col-span-2 sm:col-span-3" : ""}>
      <p className="text-xs text-slate-400">{label}</p>
      <p className="mt-0.5 font-medium text-slate-800">{value}</p>
    </div>
  );
}

function SectionCard({
  title,
  count,
  href,
  empty,
  children,
}: {
  title: string;
  count: number;
  href: string;
  empty: string;
  children: React.ReactNode;
}) {
  return (
    <Card className="mt-6">
      <CardHeader
        title={`${title} (${count})`}
        action={
          <Link href={href} className="text-xs text-brand-600 hover:underline">
            전체 보기
          </Link>
        }
      />
      {count === 0 ? (
        <p className="px-5 py-6 text-center text-sm text-slate-400">{empty}</p>
      ) : (
        <div className="divide-y divide-slate-100">{children}</div>
      )}
    </Card>
  );
}

function FileRow({
  name,
  url,
  tag,
  meta,
}: {
  name: string | null;
  url: string | null;
  tag: string | null;
  meta: string;
}) {
  const label = name || "(파일명 없음)";
  return (
    <div className="flex items-center justify-between gap-3 px-5 py-3">
      <div className="min-w-0">
        {url ? (
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="truncate text-sm font-medium text-slate-800 hover:text-brand-600 hover:underline"
          >
            {label}
          </a>
        ) : (
          <span className="truncate text-sm font-medium text-slate-800">
            {label}
          </span>
        )}
        <p className="text-xs text-slate-400">{meta}</p>
      </div>
      {tag && (
        <span className="shrink-0 rounded bg-slate-100 px-1.5 py-0.5 text-[11px] text-slate-500">
          {tag}
        </span>
      )}
    </div>
  );
}
