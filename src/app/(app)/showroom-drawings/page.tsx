"use client";

import { useState } from "react";
import PageHeader from "@/components/PageHeader";
import DrawingUpload from "@/components/DrawingUpload";
import { SHOWROOM_MODELS } from "@/lib/showrooms";

export default function ShowroomDrawingsPage() {
  const [selected, setSelected] = useState(SHOWROOM_MODELS[0].id);
  const current =
    SHOWROOM_MODELS.find((s) => s.id === selected) ?? SHOWROOM_MODELS[0];

  return (
    <>
      <PageHeader
        title="전시모델 도면"
        description="전시장별 전시모델 도면을 업로드·열람합니다. 전시장을 선택하세요."
      />

      {/* 전시장 선택 */}
      <div className="mb-4 flex flex-wrap gap-2">
        {SHOWROOM_MODELS.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => setSelected(s.id)}
            className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors ${
              selected === s.id
                ? "bg-brand-600 text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            {s.name}
          </button>
        ))}
      </div>

      {/* 선택한 전시장의 도면 */}
      <DrawingUpload
        key={current.id}
        ownerId={current.id}
        source="showroom"
        bucket="construction-drawings"
        title={`${current.name} · 전시모델 도면`}
        description="이 전시장의 전시모델 도면을 업로드·열람합니다. (이미지·PDF)"
      />
    </>
  );
}
