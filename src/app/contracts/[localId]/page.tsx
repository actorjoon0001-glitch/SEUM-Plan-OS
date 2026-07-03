import Link from "next/link";
import PageHeader from "@/components/PageHeader";
import StatusBadge from "@/components/StatusBadge";
import { Card, CardHeader } from "@/components/Card";
import Notice, { ConnectionNotice } from "@/components/Notice";
import {
  getContract,
  getDrawings,
  getSubmissions,
  getSitePhotos,
  getMessages,
  getPayments,
} from "@/lib/data";
import {
  contractTitle,
  designOwner,
  designStatusLabel,
} from "@/lib/contract";
import {
  formatDate,
  formatDateTime,
  formatMoney,
  formatFileSize,
} from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function ContractDetailPage({
  params,
}: {
  params: Promise<{ localId: string }>;
}) {
  const { localId } = await params;
  const id = decodeURIComponent(localId);

  const [contractRes, drawingsRes, submissionsRes, photosRes, messagesRes] =
    await Promise.all([
      getContract(id),
      getDrawings(id),
      getSubmissions(id),
      getSitePhotos(id),
      getMessages(id),
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

  const paymentsRes = await getPayments(c.id);

  const drawings = drawingsRes.data;
  const submissions = submissionsRes.data;
  const photos = photosRes.data;
  const messages = messagesRes.data;
  const payments = paymentsRes.data;

  const checklist: [string, boolean | null][] = [
    ["영업 확인", c.sales_confirmed],
    ["설계 확인", c.design_confirmed],
    ["시공 확인", c.construction_confirmed],
    ["최종 승인", c.final_approved],
  ];

  return (
    <>
      <BackLink />

      <PageHeader
        title={contractTitle(c)}
        description={`${c.customer_name ?? "-"} · 계약번호 ${c.local_id ?? c.id}`}
        action={<StatusBadge status={designStatusLabel(c)} />}
      />

      {/* 요약 */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="p-5 lg:col-span-2">
          <div className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-3">
            <Field label="설계 담당" value={designOwner(c)} />
            <Field label="영업 담당" value={c.sales_person ?? "-"} />
            <Field label="계약일" value={formatDate(c.contract_date)} />
            <Field label="모델명" value={c.model_name ?? "-"} />
            <Field label="쇼룸" value={c.showroom_id ?? "-"} />
            <Field label="계약 상태" value={c.status ?? "-"} />
            <Field label="계약금액" value={formatMoney(c.contract_amount)} />
            <Field label="계약금" value={formatMoney(c.deposit)} />
            <Field label="잔금" value={formatMoney(c.balance)} />
          </div>

          {/* 진행 체크리스트 */}
          <div className="mt-5 flex flex-wrap gap-2 border-t border-slate-100 pt-4">
            {checklist.map(([label, done]) => (
              <span
                key={label}
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${
                  done
                    ? "bg-emerald-50 text-emerald-700"
                    : "bg-slate-100 text-slate-400"
                }`}
              >
                <span>{done ? "✓" : "○"}</span>
                {label}
              </span>
            ))}
            {c.is_urgent && (
              <span className="inline-flex items-center rounded-full bg-rose-100 px-3 py-1 text-xs font-bold text-rose-600">
                긴급
              </span>
            )}
          </div>
        </Card>

        {/* 대금 */}
        <Card>
          <CardHeader title="대금 내역" />
          {payments.length === 0 ? (
            <p className="px-5 py-6 text-center text-sm text-slate-400">
              등록된 대금 내역이 없습니다.
            </p>
          ) : (
            <div className="divide-y divide-slate-100">
              {payments.map((p) => (
                <div key={p.id} className="flex items-center justify-between px-5 py-3 text-sm">
                  <div>
                    <p className="font-medium text-slate-700">{p.type ?? "대금"}</p>
                    <p className="text-xs text-slate-400">{formatDate(p.payment_date)}</p>
                  </div>
                  <span className="font-medium text-slate-800">
                    {formatMoney(p.amount)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* 도면 */}
      <SectionCard
        title="도면"
        count={drawings.length}
        href="/drawings"
        empty="등록된 도면이 없습니다."
      >
        {drawings.map((d) => (
          <FileRow
            key={d.id}
            name={d.file_name}
            url={d.url}
            tag={d.kind}
            meta={`${d.uploaded_by ?? "-"} · ${formatDate(d.uploaded_at)}`}
          />
        ))}
      </SectionCard>

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

      {/* 현장 사진 */}
      <SectionCard
        title="현장 사진"
        count={photos.length}
        href="/site-photos"
        empty="등록된 현장 사진이 없습니다."
      >
        {photos.map((p) => (
          <FileRow
            key={p.id}
            name={p.file_name || p.note || "사진"}
            url={p.url}
            tag={null}
            meta={`${p.uploaded_by ?? "-"} · ${formatDate(p.uploaded_at)}`}
          />
        ))}
      </SectionCard>

      {/* 협의 · 소통 */}
      <Card className="mt-6">
        <CardHeader title={`협의 · 소통 (${messages.length})`} />
        {messages.length === 0 ? (
          <p className="px-5 py-6 text-center text-sm text-slate-400">
            소통 메시지가 없습니다.
          </p>
        ) : (
          <div className="divide-y divide-slate-100">
            {messages.slice(0, 30).map((m) => (
              <div key={m.id} className="px-5 py-3">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-slate-700">
                    {m.sender_name ?? "알 수 없음"}
                  </span>
                  {m.is_pinned && (
                    <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-medium text-amber-700">
                      고정
                    </span>
                  )}
                  <span className="text-[11px] text-slate-400">
                    {formatDateTime(m.created_at)}
                  </span>
                </div>
                <p className="mt-0.5 whitespace-pre-wrap text-sm text-slate-600">
                  {m.message}
                </p>
              </div>
            ))}
          </div>
        )}
      </Card>
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

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
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
