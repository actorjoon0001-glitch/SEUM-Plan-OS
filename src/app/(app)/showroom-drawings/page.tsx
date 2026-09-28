"use client";

import { useState } from "react";
import PageHeader from "@/components/PageHeader";
import DrawingUpload from "@/components/DrawingUpload";
import { SHOWROOM_MODELS } from "@/lib/showrooms";

type Selected = number | "all";

export default function ShowroomDrawingsPage() {
  const [selected, setSelected] = useState<Selected>("all");

  const options: { key: Selected; name: string }[] = [
    { key: "all", name: "전체" },
    ...SHOWROOM_MODELS.map((s) => ({ key: s.id as Selected, name: s.name })),
  ];

  const shown =
    selected === "all"
      ? SHOWROOM_MODELS
      : SHOWROOM_MODELS.filter((s) => s.id === selected);

  return (
    <>
      <PageHeader
        title="전시모델 도면"
        description="전시장별 전시모델 도면을 업로드·열람합니다. 전시장을 선택하세요."
      />

      {/* 전시장 선택 */}
      <div className="mb-4 flex flex-wrap gap-2">
        {options.map((o) => (
          <button
            key={String(o.key)}
            type="button"
            onClick={() => setSelected(o.key)}
            className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors ${
              selected === o.key
                ? "bg-brand-600 text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            {o.name}
          </button>
        ))}
      </div>

      {/* 선택한 전시장(들)의 도면 */}
      <div className="space-y-4">
        {shown.map((s) => (
          <DrawingUpload
            key={s.id}
            ownerId={s.id}
            source="showroom"
            bucket="construction-drawings"
            title={`${s.name} · 전시모델 도면`}
            description="이 전시장의 전시모델 도면을 업로드·열람합니다. (이미지·PDF)"
          />
        ))}
      </div>
    </>
  );
}
