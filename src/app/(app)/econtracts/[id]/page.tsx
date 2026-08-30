import Link from "next/link";
import PageHeader from "@/components/PageHeader";
import StatusBadge from "@/components/StatusBadge";
import { Card } from "@/components/Card";
import Notice, { ConnectionNotice } from "@/components/Notice";
import EContractDoc from "@/components/EContractDoc";
import CurrentUserBadge from "@/components/CurrentUserBadge";
import DrawingUpload from "@/components/DrawingUpload";
import { getEContract, getPartnerSubmissionsByName } from "@/lib/data";
import { formatDate } from "@/lib/format";

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

  // 협력사가 올린 인허가 자료 (고객명 매칭)
  const permitRes = await getPartnerSubmissionsByName(e.client_name);
  const permits = permitRes.data;

  // 고객 전화번호 (data.client.phone)
  const clientObj =
    e.data && typeof e.data === "object" && !Array.isArray(e.data)
      ? ((e.data as Record<string, unknown>).client as
          | Record<string, unknown>
          | undefined)
      : undefined;
  const phone = clientObj?.phone ? String(clientObj.phone) : "-";

  return (
    <>
      <CurrentUserBadge />
      <BackLink />
      <PageHeader
        title={`전자계약서 ${e.contract_no || `#${e.id}`}`}
        description={e.client_name ?? undefined}
        action={<StatusBadge status={e.status} />}
      />

      <Card className="px-5 py-2">
        <div className="grid grid-cols-1 gap-x-12 sm:grid-cols-2">
          <Field label="고객명" value={e.client_name ?? "-"} />
          <Field label="담당 영업사원" value={e.salesperson ?? "-"} />
          <Field label="고객 전화번호" value={phone} />
          <Field label="계약일" value={formatDate(e.contract_date)} />
          <Field label="현장 주소" value={e.site_address ?? "-"} full />
        </div>
      </Card>

      {/* 원본 전자계약서 (세움 전산 계약서) — 설계OS 에서는 보기 전용 */}
      <div className="mt-6 flex items-center justify-between gap-3">
        <p className="text-sm font-semibold text-slate-800">
          원본 전자계약서{" "}
          <span className="ml-1 rounded bg-slate-100 px-1.5 py-0.5 text-xs font-medium text-slate-500">
            🔒 보기 전용
          </span>
        </p>
        <a
          href={originUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 rounded-lg bg-brand-600 px-3.5 py-2 text-sm font-medium text-white hover:bg-brand-700"
        >
          📄 새 탭에서 열기(수정)
        </a>
      </div>
      {/* 보기 전용: iframe 은 pointer-events 차단(수정 불가), 스크롤은 바깥 래퍼로 */}
      <div
        className="mt-2 overflow-y-auto rounded-xl border border-slate-200 bg-white"
        style={{ maxHeight: "calc(100vh - 12rem)" }}
      >
        <iframe
          src={originUrl}
          title="전자계약서 원본 (보기 전용)"
          scrolling="no"
          className="w-full"
          style={{ height: 1900, border: "none", pointerEvents: "none" }}
          loading="lazy"
        />
      </div>
      <p className="mt-2 text-xs text-slate-400">
        설계OS 에서는 <b>보기 전용</b> 입니다. 수정은 위 “새 탭에서 열기(수정)” 로 세움
        계약서에서 진행하세요. (원본이 안 보이면 로그인 필요)
      </p>

      {/* 협의 도면 / 시공도면 업로드 */}
      <div className="mt-6 space-y-4">
        <DrawingUpload
          ownerId={e.id}
          source="econtract"
          bucket="consult-drawings"
          title="협의 도면"
          description="이 전자계약서의 협의 도면을 업로드·열람합니다. (이미지·PDF)"
        />
        <DrawingUpload
          ownerId={e.id}
          source="econtract"
          bucket="construction-drawings"
          title="시공도면"
          description="이 전자계약서의 시공도면을 업로드·열람합니다. (이미지·PDF)"
        />
      </div>

      {/* 인허가 — 외부 건축 협력사가 올린 자료 자동 연결 (고객명 매칭, 읽기 전용) */}
      <div className="mt-4 rounded-xl border border-slate-200 bg-white p-5">
        <p className="text-sm font-semibold text-slate-800">
          인허가{" "}
          <span className="ml-1 rounded bg-slate-100 px-1.5 py-0.5 text-xs font-medium text-slate-500">
            협력사 자동 연결
          </span>
        </p>
        <p className="text-xs text-slate-400">
          외부 건축 협력사(해영·필·토목)가 올린 자료 중 고객명(
          {e.client_name ?? "-"})이 포함된 건이 자동으로 표시됩니다.
        </p>
        {permits.length === 0 ? (
          <p className="mt-3 rounded-lg border border-dashed border-slate-200 py-8 text-center text-sm text-slate-400">
            연결된 협력사 인허가 자료가 없습니다.
          </p>
        ) : (
          <ul className="mt-3 divide-y divide-slate-100">
            {permits.map((s, i) => {
              const url = s.file_url ?? undefined;
              return (
                <li
                  key={`${(s as { _table?: string })._table ?? ""}-${s.id}-${i}`}
                  className="flex items-center justify-between gap-3 py-2.5"
                >
                  {url ? (
                    <a
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex min-w-0 flex-1 items-center gap-2 text-sm text-slate-700 hover:text-brand-600"
                    >
                      <span aria-hidden>📄</span>
                      <span className="truncate font-medium">
                        {s.title || s.file_name || "(제목 없음)"}
                      </span>
                    </a>
                  ) : (
                    <span className="min-w-0 flex-1 truncate text-sm font-medium text-slate-700">
                      📄 {s.title || s.file_name || "(제목 없음)"}
                    </span>
                  )}
                  <span className="shrink-0 text-xs text-slate-400">
                    {s.uploaded_by_name ?? "협력사"}
                    {s.uploaded_at ? ` · ${formatDate(s.uploaded_at)}` : ""}
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </div>

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
