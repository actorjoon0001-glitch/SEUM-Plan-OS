// 영업팀이 계약목록(payload jsonb)에 입력한 내용을 한글 라벨/값으로 정리해 보여준다.

const LABELS: Record<string, string> = {
  // 기본/담당
  phone: "건축주 연락처",
  customerName: "건축주",
  salesPerson: "담당 영업사원",
  salesManager: "영업 담당자",
  designManager: "설계 담당자",
  constructionManager: "시공 담당자",
  salesShowroom: "영업사원 전시장",
  showroomId: "전시장",
  modelShowroom: "계약 모델 전시장",
  modelShowroomId: "계약 모델 전시장",
  model: "모델",
  modelName: "모델 이름",
  contractModel: "계약 모델",
  contractModelName: "계약 모델명",
  houseType: "주택 유형",
  designType: "설계 유형",
  projectType: "주택 유형",
  contractDate: "계약일",
  // 금액/평수
  amountUnit: "금액 단위",
  supplyPrice: "공급가(만원)",
  supplyAmount: "공급가(만원)",
  vat: "부가세(만원)",
  vatAmount: "부가세(만원)",
  totalAmount: "총 금액(만원)",
  depositAmount: "계약금(만원)",
  balanceAmount: "잔금(만원)",
  basePyeong: "기초공사 평수",
  baseConstructionPyeong: "기초공사 평수",
  foundationPyeong: "기초공사 평수",
  housePyeong: "주택 평수",
  buildingPyeong: "주택 평수",
  pyeong: "평수",
  // 현장/시공
  siteAddress: "시공 주소",
  address: "시공 주소",
  installType: "시공 방식",
  constructionMethod: "시공 방식",
  constructionType: "시공 방식",
  method: "시공 방식",
  constructionProgress: "시공 진행",
  constructionStages: "시공 단계",
  constructionStartOk: "착공 가능",
  constructionDrawings: "시공 도면",
  // 옵션
  options: "옵션",
  porch: "포치",
  deck: "데크",
  sunroom: "썬룸",
  repair: "집수리",
  interior: "인테리어",
  demolition: "철거",
  removal: "철거",
  yard: "마당",
  parking: "주차",
  enabled: "선택",
  externalDeck: "외부 데크",
  externalPorch: "외부 포치",
  externalYard: "외부 마당",
  externalParking: "외부 주차",
  // 설계 요청 / 내부공간
  designRequest: "설계 요청 사항",
  interiorSpace: "내부 공간",
  exteriorSpace: "외부 공간",
  bedroomMode: "침실/방",
  bedroom: "침실/방",
  room: "방",
  kitchenMode: "주방",
  kitchen: "주방",
  livingMode: "거실",
  livingRoom: "거실",
  bathMode: "욕실/화장실",
  bathroom: "욕실/화장실",
  window: "창호 변경",
  windowChange: "창호 변경",
  exteriorMaterial: "외장재 변경",
  exteriorMaterialType: "외장재 종류",
  facility: "설비/전기",
  electric: "설비/전기",
  etcRequest: "기타 요청사항",
  additionalContent: "추가 내용",
  extraContent: "추가 내용",
  memo: "설계 메모",
  memoEtc: "기타 메모",
  designHandoverSummary: "설계 인계 요약",
  discussionDrawings: "협의 도면",
  designDrawing1Final: "설계도면 1차 최종",
  designDrawing2Final: "설계도면 2차 최종",
  designDrawing3Final: "설계도면 3차 최종",
  // 진행/확인 플래그
  isUrgent: "긴급",
  priorityDone: "작업 완료",
  designStatus: "설계 상태",
  designConfirmed: "설계 확인",
  designConfirmedBy: "설계 확인자",
  salesConfirmed: "영업 확인",
  salesConfirmedBy: "영업 확인자",
  constructionConfirmed: "시공 확인",
  balanceConfirmed: "잔금 확인",
  depositConfirmed: "계약금 확인",
  depositReceivedAt: "계약금 수령일",
  finalApproved: "최종 승인",
  progress2Confirmed: "2차 진행 확인",
  progress3Confirmed: "3차 진행 확인",
  // 인허가
  permitRequired: "인허가 필요",
  permitInProgress: "인허가 진행중",
  hasPermitCert: "건축허가 필증",
  hasCompletionCert: "준공 필증",
  // 첨부
  attachments: "첨부 파일",
  files: "첨부 파일",
  contractFile: "계약서 첨부",
  additionalFiles: "추가 자료",
  fileName: "파일명",
  url: "파일",
};

// 자주 쓰이는 영문 값 → 한글
const VALUES: Record<string, string> = {
  basic: "기본",
  default: "기본",
  none: "없음",
  manwon: "만원",
  done: "완료",
  in_progress: "설계 중",
  not_started: "미착수",
  negotiating: "협의 중",
  negotiated: "협의 완료",
  headquarters: "본사",
  ganghwa: "강화",
  field: "현장시공",
  mobile: "이동설치",
};

function label(k: string): string {
  return LABELS[k] ?? k;
}

/** 영문 값(코드)을 한글로. 전시장 번호형(showroom1)도 처리. 아니면 원문 유지 */
function koValue(v: string): string {
  const key = v.trim().toLowerCase();
  if (VALUES[key]) return VALUES[key];
  const m = key.match(/^showroom\s*_?(\d+)$/);
  if (m) return `${m[1]}전시장`;
  return v;
}

function isUrl(v: string): boolean {
  return /^https?:\/\//i.test(v.trim());
}

function isEnabled(v: unknown): boolean {
  return v === true || v === "예" || v === "Y" || v === "true";
}

function OptionChips({ options }: { options: Record<string, unknown> }) {
  const on = Object.entries(options).filter(
    ([, o]) => o && typeof o === "object" && isEnabled((o as Record<string, unknown>).enabled),
  );
  if (on.length === 0) {
    return <span className="text-sm text-slate-400">선택된 옵션 없음</span>;
  }
  return (
    <div className="flex flex-wrap gap-1.5">
      {on.map(([k, o]) => {
        const p = (o as Record<string, unknown>).pyeong;
        const hasP = p != null && p !== "" && p !== "-";
        return (
          <span
            key={k}
            className="rounded-full bg-brand-50 px-2.5 py-1 text-xs font-medium text-brand-700"
          >
            {label(k)}
            {hasP ? ` · ${p}평` : ""}
          </span>
        );
      })}
    </div>
  );
}

function Val({ value }: { value: unknown }) {
  if (value === null || value === undefined || value === "" || value === "-") {
    return <span className="text-slate-300">-</span>;
  }
  if (typeof value === "boolean") {
    return <span className="text-slate-700">{value ? "예" : "아니오"}</span>;
  }
  if (typeof value === "number") {
    return <span className="text-slate-700">{value.toLocaleString()}</span>;
  }
  if (typeof value === "string") {
    if (isUrl(value)) {
      return (
        <a
          href={value}
          target="_blank"
          rel="noopener noreferrer"
          className="break-all text-brand-600 hover:underline"
        >
          {value}
        </a>
      );
    }
    return (
      <span className="whitespace-pre-wrap break-words text-slate-700">
        {koValue(value)}
      </span>
    );
  }
  if (Array.isArray(value)) {
    if (value.length === 0) return <span className="text-slate-300">(없음)</span>;
    return (
      <div className="space-y-1.5">
        {value.map((item, i) => (
          <div key={i} className="rounded-lg border border-slate-100 p-2">
            <Val value={item} />
          </div>
        ))}
      </div>
    );
  }
  if (typeof value === "object") {
    return <Fields data={value as Record<string, unknown>} nested />;
  }
  return <span className="text-slate-700">{String(value)}</span>;
}

function Fields({
  data,
  nested = false,
}: {
  data: Record<string, unknown>;
  nested?: boolean;
}) {
  const entries = Object.entries(data).filter(
    ([k, v]) => v !== null && v !== undefined && v !== "" && k !== "id",
  );
  if (entries.length === 0) {
    return <p className="text-sm text-slate-400">내용이 없습니다.</p>;
  }
  return (
    <dl
      className={
        nested ? "space-y-2" : "grid grid-cols-1 gap-x-8 gap-y-3 sm:grid-cols-2"
      }
    >
      {entries.map(([key, val]) => (
        <div key={key}>
          <dt className="text-xs font-medium text-slate-400">{label(key)}</dt>
          <dd className="mt-0.5 text-sm">
            {key === "options" && val && typeof val === "object" && !Array.isArray(val) ? (
              <OptionChips options={val as Record<string, unknown>} />
            ) : (
              <Val value={val} />
            )}
          </dd>
        </div>
      ))}
    </dl>
  );
}

export default function SalesContractView({ payload }: { payload: unknown }) {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    return (
      <p className="text-sm text-slate-400">
        영업팀이 입력한 상세 내용이 없습니다.
      </p>
    );
  }
  return <Fields data={payload as Record<string, unknown>} />;
}
