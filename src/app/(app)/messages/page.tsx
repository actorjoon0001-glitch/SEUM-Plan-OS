import Link from "next/link";
import PageHeader from "@/components/PageHeader";
import { Card } from "@/components/Card";
import { ConnectionNotice } from "@/components/Notice";
import { getMessages } from "@/lib/data";
import { formatDateTime } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function MessagesPage() {
  const res = await getMessages(undefined, 200);
  const messages = res.data;

  return (
    <>
      <PageHeader
        title="협의 · 소통"
        description="계약별 협의 및 외주 소통 메시지입니다. (최근 200건)"
      />
      <ConnectionNotice configured={res.configured} error={res.error} />

      {messages.length === 0 && !res.error ? (
        <Card className="p-8 text-center text-sm text-slate-400">
          소통 메시지가 없습니다.
        </Card>
      ) : (
        <Card>
          <div className="divide-y divide-slate-100">
            {messages.map((m) => (
              <div key={m.id} className="px-5 py-3.5">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-slate-800">
                    {m.sender_name ?? "알 수 없음"}
                  </span>
                  {m.contract_id && (
                    <Link
                      href={`/contracts/${encodeURIComponent(m.contract_id)}`}
                      className="rounded bg-slate-100 px-1.5 py-0.5 text-[11px] text-slate-500 hover:bg-slate-200"
                    >
                      {m.contract_id}
                    </Link>
                  )}
                  {m.is_pinned && (
                    <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-medium text-amber-700">
                      고정
                    </span>
                  )}
                  <span className="ml-auto text-[11px] text-slate-400">
                    {formatDateTime(m.created_at)}
                  </span>
                </div>
                <p className="mt-1 whitespace-pre-wrap text-sm text-slate-600">
                  {m.message}
                </p>
              </div>
            ))}
          </div>
        </Card>
      )}
    </>
  );
}
