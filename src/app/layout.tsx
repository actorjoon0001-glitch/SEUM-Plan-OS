import type { Metadata } from "next";
import "./globals.css";
import Sidebar from "@/components/Sidebar";

export const metadata: Metadata = {
  title: "세움 Plan OS",
  description:
    "세움 설계팀 전용 OS — 도면 업로드, 3D 작업, 협의도면, 인허가, 외주 소통 통합 플랫폼",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body>
        <div className="flex h-screen overflow-hidden">
          <Sidebar />
          <main className="flex-1 overflow-y-auto">
            <div className="mx-auto max-w-7xl px-8 py-8">{children}</div>
          </main>
        </div>
      </body>
    </html>
  );
}
