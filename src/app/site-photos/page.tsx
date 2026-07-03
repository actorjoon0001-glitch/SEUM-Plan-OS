import Link from "next/link";
import PageHeader from "@/components/PageHeader";
import { Card } from "@/components/Card";
import { ConnectionNotice } from "@/components/Notice";
import { getSitePhotos } from "@/lib/data";
import { formatDate } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function SitePhotosPage() {
  const res = await getSitePhotos();
  const photos = res.data;

  return (
    <>
      <PageHeader
        title="현장 사진"
        description="계약별 현장 진행 사진입니다."
      />
      <ConnectionNotice configured={res.configured} error={res.error} />

      {photos.length === 0 && !res.error ? (
        <Card className="p-8 text-center text-sm text-slate-400">
          등록된 현장 사진이 없습니다.
        </Card>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {photos.map((p) => (
            <Card key={p.id} className="overflow-hidden">
              <a
                href={p.url ?? undefined}
                target="_blank"
                rel="noopener noreferrer"
                className="block"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={p.url ?? ""}
                  alt={p.file_name ?? "현장 사진"}
                  className="aspect-[4/3] w-full bg-slate-100 object-cover"
                  loading="lazy"
                />
              </a>
              <div className="p-3">
                <p className="truncate text-xs font-medium text-slate-700">
                  {p.note || p.file_name || "사진"}
                </p>
                <div className="mt-1 flex items-center justify-between text-[11px] text-slate-400">
                  {p.contract_local_id ? (
                    <Link
                      href={`/contracts/${encodeURIComponent(p.contract_local_id)}`}
                      className="hover:text-brand-600 hover:underline"
                    >
                      {p.contract_local_id}
                    </Link>
                  ) : (
                    <span>-</span>
                  )}
                  <span>{formatDate(p.uploaded_at)}</span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </>
  );
}
