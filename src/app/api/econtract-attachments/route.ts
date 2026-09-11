import { NextResponse } from "next/server";
import { getEContract } from "@/lib/data";

export const dynamic = "force-dynamic";

/** 전자계약서 첨부파일 1건 (data URI) */
interface Attachment {
  kind: "drawing" | "idcard";
  name: string;
  dataUri: string;
  uploadedAt: string | null;
}

function pickUri(o: Record<string, unknown>): string {
  if (typeof o.data === "string" && o.data) return o.data;
  if (typeof o.image === "string" && o.image) return o.image;
  if (typeof o.url === "string" && o.url) return o.url;
  return "";
}

/**
 * 전자계약서(econtracts.data)의 첨부파일 추출 — 요청 시점에만 조회.
 * data URI(base64) 가 커서 목록 경량 조회엔 싣지 않고 이 라우트에서 개별 조회한다.
 * - drawings[]: 첨부 도면 ({ data, name, uploadedAt })
 * - idCards[]: 신분증 ({ image, label, uploadedAt })
 */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = Number(searchParams.get("id"));
  if (!id) return NextResponse.json({ items: [] });

  try {
    const res = await getEContract(id);
    const d = res.data?.data;
    const items: Attachment[] = [];

    if (d && typeof d === "object" && !Array.isArray(d)) {
      const rec = d as Record<string, unknown>;

      const drawings = Array.isArray(rec.drawings) ? rec.drawings : [];
      drawings.forEach((it, i) => {
        if (it && typeof it === "object") {
          const o = it as Record<string, unknown>;
          const uri = pickUri(o);
          if (uri) {
            items.push({
              kind: "drawing",
              name: String(o.name || o.label || `도면 ${i + 1}`),
              dataUri: uri,
              uploadedAt: o.uploadedAt ? String(o.uploadedAt) : null,
            });
          }
        }
      });

      const idCards = Array.isArray(rec.idCards) ? rec.idCards : [];
      idCards.forEach((it, i) => {
        if (it && typeof it === "object") {
          const o = it as Record<string, unknown>;
          const uri = pickUri(o);
          if (uri) {
            items.push({
              kind: "idcard",
              name: String(o.label || o.name || `신분증 ${i + 1}`),
              dataUri: uri,
              uploadedAt: o.uploadedAt ? String(o.uploadedAt) : null,
            });
          }
        }
      });
    }

    return NextResponse.json({ items });
  } catch {
    return NextResponse.json({ items: [] });
  }
}
