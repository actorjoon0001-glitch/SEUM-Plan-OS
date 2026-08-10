import { notFound } from "next/navigation";
import Link from "next/link";
import PageHeader from "@/components/PageHeader";
import { Card } from "@/components/Card";
import { ConnectionNotice } from "@/components/Notice";
import { getSubmissions } from "@/lib/data";
import { formatDate, formatFileSize } from "@/lib/format";
import { FIRMS, isFirmSlug, submissionFirm } from "@/lib/partners";

export const dynamic = "force-dynamic";

export default async function PartnerPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  if (!isFirmSlug(slug)) notFound();
  const firm = FIRMS[slug];

  const res = await getSubmissions();
  const items = res.data.filter((s) => submissionFirm(s) === slug);

  // 🔧 임시 진단: 전체 제출자료의 담당자/업로더 값 분포 (협력사 분류 기준 파악용)
  const byManager = new Map<string, number>();
  const byUploader = new Map<string, number>();
  for (const s of res.data) {
    const m = (s.design_manager ?? "").trim() || "(없음)";
    byManager.set(m, (byManager.get(m) ?? 0) + 1);
    const u = (s.uploaded_by_name ?? "").trim() || "(없음)";
    byUploader.set(u, (byUploader.get(u) ?? 0) + 1);
  }
  const sortDesc = (map: Map<string, number>) =>
    [...map.entries()].sort((a, b) => b[1] - a[1]);

  return (
    <>
      <PageHeader title={firm.name} description={firm.desc} />
      <ConnectionNotice configured={res.configured} error={res.error} />

      {/* 🔧 임시 진단 (협력사 분류 기준 확인 후 제거 예정) */}
      <details className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-2 text-xs text-slate-600">
        <summary className="cursor-pointer font-medium text-amber-700">
          🔧 데이터 진단 (임시) — 펼쳐서 스크린샷 보내주세요 (전체 제출자료 {res.data.length}건)
        </summary>
        <div className="mt-2 grid gap-4 sm:grid-cols-2">
          <div>
            <p className="mb-1 font-semibold text-slate-500">담당(design_manager) 값 분포</p>
            <div className="space-y-0.5 font-mono text-[11px]">
              {sortDesc(byManager).map(([k, n]) => (
                <div key={k}>{k} · {n}건</div>
              ))}
            </div>
          </div>
          <div>
            <p className="mb-1 font-semibold text-slate-500">업로더(uploaded_by_name) 값 분포</p>
            <div className="space-y-0.5 font-mono text-[11px]">
              {sortDesc(byUploader).map(([k, n]) => (
                <div key={k}>{k} · {n}건</div>
              ))}
            </div>
          </div>
        </div>
      </details>

      <p className="mb-2 text-xs text-slate-400">{items.length}건</p>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-left text-xs text-slate-400">
                <th className="px-5 py-3 font-medium">제목 / 파일</th>
                <th className="px-5 py-3 font-medium">계약</th>
                <th className="px-5 py-3 font-medium">담당</th>
                <th className="px-5 py-3 font-medium">크기</th>
                <th className="px-5 py-3 font-medium">업로드</th>
                <th className="px-5 py-3 font-medium"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {items.map((s) => (
                <tr key={s.id} className="hover:bg-slate-50">
                  <td className="px-5 py-3">
                    <p className="font-medium text-slate-800">
                      {s.title || s.file_name || "(제목 없음)"}
                    </p>
                    {s.description && (
                      <p className="text-xs text-slate-400">{s.description}</p>
                    )}
                  </td>
                  <td className="px-5 py-3">
                    {s.contract_local_id ? (
                      <Link
                        href={`/contracts/${encodeURIComponent(s.contract_local_id)}`}
                        className="text-slate-600 hover:text-brand-600 hover:underline"
                      >
                        {s.contract_local_id}
                      </Link>
                    ) : (
                      <span className="text-slate-300">-</span>
                    )}
                  </td>
                  <td className="px-5 py-3 text-slate-600">
                    {s.design_manager ?? s.uploaded_by_name ?? "-"}
                  </td>
                  <td className="px-5 py-3 text-slate-500">
                    {formatFileSize(s.file_size)}
                  </td>
                  <td className="px-5 py-3 text-slate-500">
                    {formatDate(s.uploaded_at)}
                  </td>
                  <td className="px-5 py-3 text-right">
                    {s.file_url && (
                      <a
                        href={s.file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-medium text-brand-600 hover:underline"
                      >
                        열기
                      </a>
                    )}
                  </td>
                </tr>
              ))}
              {items.length === 0 && !res.error && (
                <tr>
                  <td colSpan={6} className="px-5 py-10 text-center text-sm text-slate-400">
                    {firm.name}가 올린 자료가 아직 없습니다.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </>
  );
}
