# 세움 Plan OS

세움 설계팀 전용 OS. 도면 업로드 · 3D 도면 작업 · 협의도면 · 인허가 · 외주 건축설계사 소통을
한 곳에서 진행하는 사내 통합 워크스페이스입니다.

## 기술 스택

- **Next.js 15** (App Router) + **React 19**
- **TypeScript**
- **Tailwind CSS**
- **Supabase** (DB · Storage · Auth) — _추후 연동 예정_

## 시작하기

```bash
npm install
npm run dev
```

→ http://localhost:3000

기타 명령어:

```bash
npm run build      # 프로덕션 빌드
npm run start      # 프로덕션 실행
npm run lint       # ESLint
npm run typecheck  # 타입 검사
```

## 모듈 구성

| 모듈 | 경로 | 설명 |
| --- | --- | --- |
| 대시보드 | `/` | 전체 프로젝트 현황, 마감 임박, 협의·인허가 요약 |
| 도면 업로드 | `/drawings` | 도면 파일 업로드 및 버전·공종 관리 |
| 3D 도면 작업 | `/models-3d` | BIM·3D 모델 뷰어 및 협업 |
| 협의도면 | `/coordination` | 공종 간 간섭 검토·협의 이슈 추적 |
| 인허가 | `/permits` | 인허가 접수·진행 단계 추적 |
| 외주 소통 | `/partners` | 협력 설계사·엔지니어링사 소통 |

## 디렉터리 구조

```
src/
├── app/                 # 페이지 (App Router)
│   ├── layout.tsx       # 공통 레이아웃 (사이드바 포함)
│   ├── page.tsx         # 대시보드
│   ├── drawings/        # 도면 업로드
│   ├── models-3d/       # 3D 도면 작업
│   ├── coordination/    # 협의도면
│   ├── permits/         # 인허가
│   └── partners/        # 외주 소통
├── components/          # 공용 UI 컴포넌트
├── lib/                 # 데이터·유틸·설정
│   ├── mock-data.ts     # 개발용 임시 데이터 (→ Supabase 로 대체 예정)
│   ├── supabase.ts      # Supabase 클라이언트 (연동 준비)
│   ├── navigation.ts    # 사이드바 메뉴 정의
│   └── format.ts        # 포맷 유틸
└── types/               # 공통 타입 정의
```

## 현재 상태 (1차)

- ✅ 프로젝트 뼈대 + 사이드바 네비게이션
- ✅ 대시보드 (통계·프로젝트·협의·인허가 요약)
- ✅ 5개 모듈 페이지 UI 시안 (임시 데이터 기반)
- ⏳ Supabase 연동 (DB·Storage·Auth) — 다음 단계

각 모듈 페이지 하단의 **"다음 단계"** 배너에서 구현 예정 기능을 확인할 수 있습니다.

## Supabase 연동 준비

`.env.example` 을 `.env.local` 로 복사한 뒤 Supabase 키를 입력하고,
`src/lib/supabase.ts` 의 `createClient` 주석을 해제하면 됩니다.

```bash
cp .env.example .env.local
npm install @supabase/supabase-js
```
