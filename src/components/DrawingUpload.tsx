"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";

interface FileItem {
  id: number;
  path: string;
  label: string; // 원본 파일명 (한글 포함)
  url: string;
  uploadedBy?: string | null;
  uploadedAt?: string | null;
}

/** Storage 키에 쓸 수 있는 안전한(영문) 확장자만 추출 */
function safeExt(name: string): string {
  const m = name.match(/\.[A-Za-z0-9]{1,8}$/);
  return m ? m[0].toLowerCase() : "";
}

/**
 * 전자계약서별 도면 업로드/열람 (범용).
 * 파일은 Supabase Storage 버킷에 안전한 키로 저장하고,
 * 원본 파일명(한글 포함)·메타데이터는 econtract_drawings 테이블에 기록한다.
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
  const [files, setFiles] = useState<FileItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const sb = createClient();
      const { data, error } = await sb
        .from("econtract_drawings")
        .select("id, path, file_name, uploaded_by, uploaded_at")
        .eq("econtract_id", econtractId)
        .eq("bucket", bucket)
        .order("uploaded_at", { ascending: false });
      if (error) throw error;
      const items: FileItem[] = (data ?? []).map((r) => {
        const { data: pub } = sb.storage
          .from(bucket)
          .getPublicUrl(r.path as string);
        return {
          id: r.id as number,
          path: r.path as string,
          label: (r.file_name as string) ?? (r.path as string),
          url: pub.publicUrl,
          uploadedBy: r.uploaded_by as string | null,
          uploadedAt: r.uploaded_at as string | null,
        };
      });
      setFiles(items);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "목록을 불러오지 못했습니다");
    } finally {
      setLoading(false);
    }
  }, [econtractId, bucket]);

  useEffect(() => {
    load();
  }, [load]);

  async function onFiles(fileList: FileList | null) {
    if (!fileList || fileList.length === 0) return;
    setUploading(true);
    setError(null);
    try {
      const sb = createClient();
      const { data: userData } = await sb.auth.getUser();
      const uploader = userData.user?.email ?? null;
      for (const file of Array.from(fileList)) {
        const key = `${econtractId}/${Date.now()}_${Math.random()
          .toString(36)
          .slice(2, 8)}${safeExt(file.name)}`;
        const up = await sb.storage
          .from(bucket)
          .upload(key, file, { upsert: false });
        if (up.error) throw up.error;
        const ins = await sb.from("econtract_drawings").insert({
          econtract_id: econtractId,
          bucket,
          path: key,
          file_name: file.name,
          uploaded_by: uploader,
        });
        if (ins.error) {
          // 메타 기록 실패 시 올린 파일 정리
          await sb.storage.from(bucket).remove([key]);
          throw ins.error;
        }
      }
      await load();
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "업로드 실패 (버킷/테이블/권한 확인)",
      );
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  async function onDelete(item: FileItem) {
    if (!window.confirm("이 도면을 삭제할까요?")) return;
    try {
      const sb = createClient();
      await sb.storage.from(bucket).remove([item.path]);
      const { error } = await sb
        .from("econtract_drawings")
        .delete()
        .eq("id", item.id);
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
              key={f.id}
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
                {f.uploadedBy && (
                  <span className="shrink-0 text-xs text-slate-400">
                    {f.uploadedBy}
                  </span>
                )}
              </a>
              <button
                type="button"
                onClick={() => onDelete(f)}
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
