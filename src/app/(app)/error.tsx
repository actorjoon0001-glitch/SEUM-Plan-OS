"use client";

import { useEffect } from "react";

/**
 * (app) 세그먼트 에러 바운더리.
 * 새 배포로 청크 파일 해시가 바뀌면, 기존에 열려있던 화면이 옛 청크를 불러오다
 * 실패(ChunkLoadError)해 "Application error" 가 뜬다. 이 경우 자동으로 한 번
 * 새로고침해 최신 청크를 받아온다. (그 외 오류는 안내 + 새로고침 버튼)
 */
export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const msg = error?.message || "";
  const isChunk =
    /ChunkLoadError|Loading chunk|dynamically imported module|module script failed|Failed to fetch/i.test(
      msg,
    );

  useEffect(() => {
    if (!isChunk) return;
    // 짧은 시간 내 반복 새로고침(무한 루프) 방지: 10초 내 재발이면 자동 새로고침 생략
    try {
      const last = Number(sessionStorage.getItem("chunkReloadAt") || 0);
      if (Date.now() - last > 10000) {
        sessionStorage.setItem("chunkReloadAt", String(Date.now()));
        window.location.reload();
      }
    } catch {
      window.location.reload();
    }
  }, [isChunk]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
      <p className="text-sm text-slate-500">
        {isChunk
          ? "새 버전이 배포되어 화면을 새로고침합니다…"
          : "화면을 불러오는 중 문제가 발생했습니다."}
      </p>
      <div className="flex gap-2">
        <button
          onClick={() => reset()}
          className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
        >
          다시 시도
        </button>
        <button
          onClick={() => window.location.reload()}
          className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
        >
          새로고침
        </button>
      </div>
    </div>
  );
}
