# 세움 Plan OS — 작업 규칙

세움디자인하우징 **설계팀 전용** 워크스페이스 (Next.js 15 + TypeScript + Tailwind + Supabase).

## 배포 / Git 워크플로 (중요)

- **모든 변경은 새 브랜치에서 작업하고, `main` 으로 PR을 열어 자동 머지한다.**
- `main` 에 직접 커밋/푸시하지 않는다. 브랜치는 매 변경마다 새로 만든다 (항상 새 PR).
- 이 절차는 `/ship` 스킬에 정리되어 있다. 변경을 반영할 때 `/ship` 을 따른다.
- Netlify 가 `main` 브랜치를 프로덕션으로 배포한다 (머지 = 배포).

## 데이터

- 세움os 운영 Supabase 를 **읽기 전용**으로 연동한다. 운영 DB 이므로 쓰기(업로드·상태변경)는
  인증/권한(RLS) 확인 후에만 추가한다.
- 환경변수는 `.env.local`(로컬) 과 Netlify 환경변수에 둔다. **절대 커밋하지 않는다.**
- 데이터 접근은 `src/lib/data.ts` 에 모으고, 계약(`contracts`)의 `local_id` 로 다른 테이블을 연결한다.

## 검증

- 변경 후 `npm run build` 또는 `npm run typecheck` 로 확인한 뒤 머지한다.
