import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "세움 Plan OS — 설계팀",
  description:
    "세움 설계팀 전용 워크스페이스 — 계약·도면·인허가·협의·현장을 한 곳에서",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
