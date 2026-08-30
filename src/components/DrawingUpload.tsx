"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";

interface FileItem {
  name: string; // 저장된 파일명 (timestamp_원본명)
  label: string; // 표시용 원본명
  url: string;
  size?: number;
}

function humanSize(n?: number): string {
  if (!n) return "";
  if (n < 1024) return `${n}B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(0)}KB`;
  return `${(n / 1024 / 1024).toFixed(1)}MB`;
}

/**
 * 전자계약서별 도면 업로드/열람 (범용).
 * Supabase Storage 의 지정 버킷에 econtractId 폴더로 저장한다.
 * (협의 도면 = consult-drawings, 시공도면 = construction-drawings)
 */
export default function DrawingUpload({
  econtractId,
  bucket,
  title,
  description,
}: {
  econtractId: number;
  bucket: string;
  title: string;
  description: string;
}) {
  const prefix = String(econtractId);
  const [files, setFiles] = useState<FileItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const sb = createClient();
      const { data, error } = await sb.storage.from(bucket).list(prefix, {
        limit: 100,
        sortBy: { column: "created_at", order: "desc" },
      });
      if (error) throw error;
      const items: FileItem[] = (data ?? [])
        .filter((f) => f.name && !f.name.startsWith("."))
        .map((f) => {
          const path = `${prefix}/${f.name}`;
          const { data: pub } = sb.storage.from(bucket).getPublicUrl(path);
          return {
            name: f.name,
            label: f.name.replace(/^\d+_/, ""),
            url: pub.publicUrl,
            size: (f.metadata as { size?: number } | null)?.size,
          };
        });
      setFiles(items);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "목록을 불러오지 못했습니다");
    } finally {
      setLoading(false);
    }
  }, [prefix, bucket]);

  useEffect(() => {
    load();
  }, [load]);

  async function onFiles(fileList: FileList | null) {
    if (!fileList || fileList.length === 0) return;
    setUploading(true);
    setError(null);
    try {
      const sb = createClient();
      for (const file of Array.from(fileList)) {
        const safe = file.name.replace(/[^\w.\-가-힣()]/g, "_");
        const path = `${prefix}/${Date.now()}_${safe}`;
        const { error } = await sb.storage
          .from(bucket)
          .upload(path, file, { upsert: false });
        if (error) throw error;
      }
      await load();
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "업로드 실패 (스토리지 버킷/권한 확인)",
      );
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  async function onDelete(name: string) {
    if (!window.confirm("이 도면을 삭제할까요?")) return;
    try {
      const sb = createClient();
      const { error } = await sb.storage.from(bucket).remove([`${prefix}/${name}`]);
      if (error) throw error;
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "삭제 실패");
    }
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-slate-800">{title}</p>
          <p className="text-xs text-slate-400">{description}</p>
        </div>
        <label
          className={`inline-flex cursor-pointer items-center gap-1.5 rounded-lg px-3.5 py-2 text-sm font-medium text-white ${
            uploading ? "bg-slate-400" : "bg-brand-600 hover:bg-brand-700"
          }`}
        >
          {uploading ? "업로드 중…" : "＋ 도면 업로드"}
          <input
            ref={inputRef}
            type="file"
            multiple
            accept="image/*,application/pdf"
            className="hidden"
            disabled={uploading}
            onChange={(e) => onFiles(e.target.files)}
          />
        </label>
      </div>

      {error && (
        <p className="mb-3 rounded-md bg-rose-50 px-3 py-2 text-xs text-rose-600">
          {error}
        </p>
      )}

      {loading ? (
        <p className="py-6 text-center text-sm text-slate-400">불러오는 중…</p>
      ) : files.length === 0 ? (
        <p className="rounded-lg border border-dashed border-slate-200 py-8 text-center text-sm text-slate-400">
          업로드된 도면이 없습니다.
        </p>
      ) : (
        <ul className="divide-y divide-slate-100">
          {files.map((f) => (
            <li
              key={f.name}
              className="flex items-center justify-between gap-3 py-2.5"
            >
              <a
                href={f.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex min-w-0 flex-1 items-center gap-2 text-sm text-slate-700 hover:text-brand-600"
              >
                <span aria-hidden>📄</span>
                <span className="truncate font-medium">{f.label}</span>
                <span className="shrink-0 text-xs text-slate-400">
                  {humanSize(f.size)}
                </span>
              </a>
              <button
                type="button"
                onClick={() => onDelete(f.name)}
                className="shrink-0 rounded-md border border-slate-200 px-2 py-1 text-xs text-slate-500 hover:bg-slate-50 hover:text-rose-600"
              >
                삭제
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
