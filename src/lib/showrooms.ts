// 전시모델 도면용 전시장 목록. id 는 도면 저장 키에 쓰이므로 고정(변경 금지).
export interface ShowroomModel {
  id: number;
  name: string;
}

export const SHOWROOM_MODELS: ShowroomModel[] = [
  { id: 1, name: "본사 전시장" },
  { id: 2, name: "1전시장" },
  { id: 3, name: "3전시장" },
  { id: 4, name: "4전시장" },
  { id: 5, name: "강화전시장" },
  { id: 6, name: "광주전시장" },
  { id: 7, name: "안동전시장" },
];
