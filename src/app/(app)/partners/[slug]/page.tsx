import { notFound } from "next/navigation";
import PageHeader from "@/components/PageHeader";
import { Card } from "@/components/Card";

export const dynamic = "force-dynamic";

/** 외부 건축 협력사 정의 */
const PARTNERS: Record<string, { name: string; desc: string }> = {
  haeyoung: {
    name: "해영 건축사",
    desc: "해영 건축사와 협력하는 인허가·설계 건입니다.",
  },
  pil: {
    name: "필건축사",
    desc: "필 건축사와 협력하는 인허가·설계 건입니다.",
  },
  civil: {
    name: "토목건축사",
    desc: "토목 건축사와 협력하는 인허가·설계 건입니다.",
  },
};

export default async function PartnerPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const partner = PARTNERS[slug];
  if (!partner) notFound();

  return (
    <>
      <PageHeader title={partner.name} description={partner.desc} />

      <Card className="p-8 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-brand-50 text-brand-600">
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.7} stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3 21h18M5 21V7l8-4v18M19 21V11l-6-3M9 9h.01M9 12h.01M9 15h.01M9 18h.01"
            />
          </svg>
        </div>
        <p className="mt-4 text-sm font-semibold text-slate-800">
          {partner.name} 협력 화면 준비 중
        </p>
        <p className="mx-auto mt-1 max-w-md text-sm text-slate-500">
          이 협력사가 담당하는 계약·인허가·도면을 연결할 예정입니다. 어떤 정보를
          보여줄지 알려주시면 세움os 데이터로 채워 드리겠습니다.
        </p>
      </Card>
    </>
  );
}
