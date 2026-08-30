"use client";

import { useState } from "react";
import { formatDate } from "@/lib/format";

/** 협력사 인허가 자료 1건 (미리보기용 직렬화 형태) */
export interface PermitItem {
  key: string;
  title: string;
  fileUrl: string | null;
  by: string;
  at: string | null;
}

function kindOf(url: string | null): "image" | "pdf" | "other" {
  const s = (url ?? "").toLowerCase();
  if (/\.(png|jpe?g|gif|webp|bmp|svg)(\?|$)/.test(s)) return "image";
  if (/\.pdf(\?|$)/.test(s)) return "pdf";
  return "other";
}

/**
 * 외부 건축 협력사가 올린 인허가 자료 목록 + 인라인 미리보기.
 * 이미지·PDF 는 바로 미리보기로 펼쳐 보여주고, 그 외 형식은 링크만 제공한다.
 */
export default function PartnerPermitList({ items }: { items: PermitItem[] }) {
  return (
    <ul className="mt-3 space-y-3">
      {items.map((it) => (
        <PermitRow key={it.key} item={it} />
      ))}
    </ul>
  );
}

function PermitRow({ item }: { item: PermitItem }) {
  const kind = kindOf(item.fileUrl);
  const canPreview = Boolean(item.fileUrl) && kind !== "other";
  const [open, setOpen] = useState(true);

  return (
    <li className="overflow-hidden rounded-lg border border-slate-200">
      <div className="flex items-center justify-between gap-3 px-3 py-2.5">
        {item.fileUrl ? (
          <a
            href={item.fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex min-w-0 flex-1 items-center gap-2 text-sm text-slate-700 hover:text-brand-600"
          >
            <span aria-hidden>📄</span>
            <span className="truncate font-medium">{item.title}</span>
          </a>
        ) : (
          <span className="min-w-0 flex-1 truncate text-sm font-medium text-slate-700">
            📄 {item.title}
          </span>
        )}
        <div className="flex shrink-0 items-center gap-2">
          <span className="text-xs text-slate-400">
            {item.by}
            {item.at ? ` · ${formatDate(item.at)}` : ""}
          </span>
          {canPreview && (
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              className="rounded border border-slate-200 px-2 py-0.5 text-xs text-slate-500 hover:bg-slate-50"
            >
              {open ? "미리보기 닫기" : "미리보기"}
            </button>
          )}
        </div>
      </div>
      {canPreview && open && (
        <div className="border-t border-slate-100 bg-slate-50 p-2">
          {kind === "image" ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={item.fileUrl as string}
              alt={item.title}
              className="mx-auto max-h-[520px] w-auto rounded"
              loading="lazy"
            />
          ) : (
            <iframe
              src={item.fileUrl as string}
              title={item.title}
              className="h-[600px] w-full rounded bg-white"
              style={{ border: "none" }}
              loading="lazy"
            />
          )}
        </div>
      )}
    </li>
  );
}
