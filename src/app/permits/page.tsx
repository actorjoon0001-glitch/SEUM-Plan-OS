import Link from "next/link";
import PageHeader from "@/components/PageHeader";
import { Card } from "@/components/Card";
import { ConnectionNotice } from "@/components/Notice";
import { getSubmissions } from "@/lib/data";
import { formatDate, formatFileSize } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function PermitsPage() {
  const res = await getSubmissions();
  const items = res.data;

  return (
    <>
      <PageHeader
        title="인허가 · 제출 서류"
        description="계약별 인허가 및 제출 서류입니다."
      />
      <ConnectionNotice configured={res.configured} error={res.error} />

      <p className="mb-2 text-xs text-slate-400">{items.length}건</p>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-left text-xs text-slate-400">
                <th className="px-5 py-3 font-medium">제목 / 파일</th>
                <th className="px-5 py-3 font-medium">계약</th>
                <th className="px-5 py-3 font-medium">설계 담당</th>
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
                    등록된 인허가 서류가 없습니다.
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
