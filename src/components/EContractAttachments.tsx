"use client";

import { useState } from "react";

interface Attachment {
  kind: "drawing" | "idcard";
  name: string;
  dataUri: string;
  uploadedAt: string | null;
}

function isImage(uri: string): boolean {
  return /^data:image\//i.test(uri) || /\.(png|jpe?g|gif|webp|bmp|svg)(\?|$)/i.test(uri);
}

/**
 * 전자계약서 첨부파일(도면·신분증) 열람 버튼 + 모달.
 * 목록에는 첨부 수만 있고 실제 파일(data URI)은 크므로, 열 때 /api/econtract-attachments 로 개별 조회한다.
 */
export default function EContractAttachments({
  econtractId,
  count,
}: {
  econtractId: number;
  count: number;
}) {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<Attachment[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  async function load() {
    if (items || loading) return;
    setLoading(true);
    setError(false);
    try {
      const r = await fetch(`/api/econtract-attachments?id=${econtractId}`);
      const d = await r.json();
      setItems(Array.isArray(d.items) ? (d.items as Attachment[]) : []);
    } catch {
      setError(true);
      setItems([]);
    } finally {
      setLoading(false);
    }
  }

  function openModal(e: React.MouseEvent) {
    e.stopPropagation();
    setOpen(true);
    load();
  }

  return (
    <>
      <button
        type="button"
        onClick={openModal}
        className="inline-flex items-center gap-1 whitespace-nowrap rounded-md border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700 hover:bg-emerald-100"
      >
        📎 첨부 {count}
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-900/50 p-4 sm:p-8"
          onClick={() => setOpen(false)}
        >
          <div
            className="w-full max-w-3xl rounded-2xl bg-white shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
              <h2 className="text-sm font-semibold text-slate-800">
                전자계약서 첨부파일
              </h2>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-lg px-2 py-1 text-sm text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                ✕ 닫기
              </button>
            </div>

            <div className="max-h-[75vh] overflow-y-auto p-5">
              {loading ? (
                <p className="py-12 text-center text-sm text-slate-400">
                  불러오는 중…
                </p>
              ) : error ? (
                <p className="py-12 text-center text-sm text-rose-500">
                  첨부파일을 불러오지 못했습니다.
                </p>
              ) : items && items.length > 0 ? (
                <ul className="space-y-5">
                  {items.map((it, i) => (
                    <li key={i} className="overflow-hidden rounded-xl border border-slate-200">
                      <div className="flex items-center justify-between gap-3 border-b border-slate-100 bg-slate-50 px-4 py-2.5">
                        <span className="flex min-w-0 items-center gap-2">
                          <span
                            className={`shrink-0 rounded px-1.5 py-0.5 text-[10px] font-bold ${
                              it.kind === "drawing"
                                ? "bg-emerald-100 text-emerald-700"
                                : "bg-slate-200 text-slate-600"
                            }`}
                          >
                            {it.kind === "drawing" ? "도면" : "신분증"}
                          </span>
                          <span className="truncate text-sm font-medium text-slate-800">
                            {it.name}
                          </span>
                        </span>
                        <a
                          href={it.dataUri}
                          download={it.name}
                          className="shrink-0 text-xs font-medium text-brand-600 hover:underline"
                          onClick={(e) => e.stopPropagation()}
                        >
                          ⬇ 저장
                        </a>
                      </div>
                      <div className="bg-slate-50 p-2">
                        {isImage(it.dataUri) ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={it.dataUri}
                            alt={it.name}
                            className="mx-auto max-h-[70vh] w-auto rounded"
                          />
                        ) : (
                          <iframe
                            src={it.dataUri}
                            title={it.name}
                            className="h-[70vh] w-full rounded bg-white"
                            style={{ border: "none" }}
                          />
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="py-12 text-center text-sm text-slate-400">
                  첨부파일이 없습니다.
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
