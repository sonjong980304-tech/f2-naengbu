# CLAUDE.md · 내 냉장고를 부탁해 (F-2조)

삼일회계법인 2026 Discover 바이브코딩 팀 미션 웹앱이에요.
이 저장소에서 작업하는 모든 Claude Code는 아래 규칙을 따라요.

## 1. 프로젝트

- 냉장고 재료와 유통기한을 바탕으로 먼저 쓸 재료를 알려 주고, 오늘 해 먹을 메뉴를 추천하는 웹앱
- 3~5화면 (S-01 내 냉장고, S-02/03 오늘의 추천 레시피, S-04 피드백 선택, S-05 재추천)
- 설치 없이 링크로 열리고, 1~2분 안에 시연할 수 있을 만큼 가벼워야 함
- 발표 당일 300~400명 동시 접속 → 정적 배포가 기본
- 최종 제출 링크: Vercel Domains 주소 (배포 기록의 긴 주소 아님)
- 마감: 2026-10-08(목) 오전 11시. 마감 후 링크 수정은 심사에 반영되지 않음
- 배포 링크는 최소 2026-10-30(금)까지 내리거나 끊지 않음
- 전체 계획: `docs/plan.md`

## 2. 기술 규칙

- 바닐라 HTML, CSS, JS만 써요. React, Vue 등 프레임워크와 Vite 등 빌드 도구는 쓰지 않아요
- index.html은 저장소 루트에 둬요
- 루트에 package.json을 만들지 않아요 (테스트 도구는 tests/ 폴더 안에만)
- 외부 라이브러리는 CDN으로만 불러와요. 허용 목록:
  - Pretendard: `https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.css`
  - Lucide: `lucide@0.462.0` UMD
  - Noto Serif KR (제목용 명조, Google Fonts): `https://fonts.googleapis.com/css2?family=Noto+Serif+KR:wght@500;600&display=swap`
  - Tesseract.js (영수증 OCR, [재료 인식하기]를 누를 때만 불러옴): `https://cdn.jsdelivr.net/npm/tesseract.js@5.1.1/dist/tesseract.min.js`, worker `.../tesseract.js@5.1.1/dist/worker.min.js`, core `https://cdn.jsdelivr.net/npm/tesseract.js-core@5.1.1`, 한국어 데이터 `https://cdn.jsdelivr.net/npm/@tesseract.js-data/kor@1.0.0/4.0.0_best_int`
- 로그인, 외부 DB(Supabase, Firebase 등), 외부 API 호출은 쓰지 않아요
- 모바일(375~390px)과 PC 화면에서 모두 깨지지 않아야 해요. 기준 폭 390px, 최대 480px 가운데 정렬
- 배포에서 빼는 파일은 루트 `.vercelignore`로 관리해요 (docs/, tests/, CLAUDE.md, icons/svg-source/)

## 3. 기획 자료와의 관계

- 디자인, 문구, 데이터는 팀 자료를 그대로 따라요
  - 우선순위: **`docs/DESIGN.md`**(색·글꼴·모서리·여백·움직임) > **통합 시안 HTML** (`docs/reference/내냉부_통합시안_v1.3.html`, 화면 배치·구성 요소 순서) > 기획안·화면설계서 PDF
  - 스타일은 `css/app.css`의 `:root` 토큰으로만 써요. 색 값을 코드에 직접 쓰지 않아요
  - `data/copy.json`, `data/recipes.json`, `data/sample-fridge.json`, `data/icon-map.json`
- 단, 아래 부분은 이 문서 규칙으로 바꿔서 적용해요
  - 기획안 2p「라이브러리 제약」의 React, Vite, Tailwind, Zustand, Zod, date-fns → 쓰지 않음
  - 시안의 `public/icons/ingredients/` 경로 → `icons/ingredients/`
  - 기획안 14~18p의 AI 생성 재추천 → AI API를 호출하지 않음. 7장의 규칙 기반 재추천으로 `recipes.json`에서 골라요
  - 시안의 화면 5 "생성 실패" 상태와 `?fail` → 쓰지 않음 (로컬 계산이라 실패 경로가 없음)
  - 시안의 카드 정렬(유통기한 순) → 7장의 점수 합 정렬로 바꿈
  - 색·글꼴·모서리는 Claude DESIGN.md 구조에 **신선한 초록 테마**를 입힌 `docs/DESIGN.md`를 따름 (Primary #1E7A4C, 바탕 #F3F8F2). D-day 배지 색(초록·주황·빨강)은 규칙이라 그대로 둠
  - 시작 화면(냉장고 애니메이션)은 탭을 처음 열 때만 보여 주고, 누르면 건너뜀
  - 화면 5에서 새 레시피가 0장이면 "이전에 추천한 레시피" 구역에 바로 앞 단계 카드를 보여 줌
  - 영수증 첨부는 브라우저 안에서 Tesseract.js로 읽어요(사진은 기기 밖으로 보내지 않음, 외부 API 아님). 찾은 글자를 `data/ingredient-info.json`의 별칭으로 마스터 재료와 맞추고(`js/receipt.js`), 유통기한은 재료별 기본 보관 일수로 넣은 뒤 사용자가 목록에서 확인·수정해요. 0개·오류·시간 초과면 [샘플 재료로 넣기 (시연용)]으로 기존 샘플 5개를 넣는 대체 경로를 보여요
  - 꿀조합은 `recipes.json`의 시드 데이터만 써요
  - 기획안 5-6의 맛 방향·조리도구·기타 의견 입력 → 구현하지 않음 (copy.json의 6개 칩만)
- 모든 화면 문구는 `copy.json`에서 불러와요. 코드에 문구를 직접 쓰지 않아요
- 재료 이름은 `sample-fridge.json`의 마스터 40종 표기만 써요
- 화면에 이모지 문자는 쓰지 않아요 (재료는 PNG 아이콘, UI 아이콘은 Lucide)

## 4. 데이터 불러오기와 저장

- JSON 데이터는 fetch를 쓰지 않고 `data/*.js` 파일(window 전역 변수)로 만들어 `<script>`로 불러와요. index.html을 파일로 직접 열어도 동작해야 해요
- 원본은 `data/*.json`이에요. JSON을 고친 뒤 `cd tests && node tools/sync-data.js`로 `data/*.js`를 갱신해요 (`data/*.js`는 직접 고치지 않아요). 둘이 어긋나면 `tests/logic/data-sync.spec.js`가 실패해요
- index.html 안에 데이터를 직접 넣지 않아요. 재료 아이콘은 `icons/ingredients/`의 PNG 경로로 불러와요 (icon-map.json의 basePath)
- 냉장고 재료·유통기한은 localStorage, 재추천 세션(피드백, 제외 목록, 회차)은 sessionStorage에 저장해요
- localStorage, sessionStorage 접근은 try/catch로 감싸고, 실패하면 메모리 저장으로 대체해요 (Claude Artifact 백업 링크에서도 동작하도록)
- D-day는 저장하지 않고 화면을 그릴 때마다 날짜 단위로 다시 계산해요
- 레시피는 `recipes.json`의 `id`로 구분해요 (제외 목록도 id로 저장)

## 5. 보안 규칙 (Public 저장소)

- API 키, 비밀번호, 토큰, 개인정보, 사내 대외비 자료를 코드와 파일에 절대 넣지 않아요
- 실제 영수증 사진이나 개인정보가 담긴 이미지는 올리지 않아요
- push 전에 위 항목이 들어갔는지 점검해요

## 6. 작업 규칙

- 브랜치를 만들지 않고 main에서만 작업해요
- 작업 시작 전에 GitHub에서 최신 내용을 받아와요
- 기능은 한 번에 하나씩 추가하고, 추가할 때마다 동작을 확인해요
- 한 번에 앱 전체를 만들지 않아요. 화면 하나씩 쌓아요
- 잘 동작하는 시점마다 푸시할지 물어본 후 승인하면 main에 올리고, 무엇을 바꿨는지 한 줄로 커밋 메시지를 남겨요
- push 전에 `tests/`의 Playwright 테스트를 실행하고, 실패하면 올리지 않아요
- 충돌이 나면 다른 사람이 작업한 내용은 지우지 말고, 무엇이 겹쳤는지 설명해요
- 같은 파일을 동시에 고치지 않아요. 작업 전 톡방에 "지금 ○○ 작업 중" 한 줄을 남겨요
- 파일 수정이나 명령 실행 전에는 무슨 작업인지 한 줄로 설명해요
- 가입, 로그인, 권한 허용은 직접 하지 않고 사용자에게 단계별로 안내만 해요
- 9명 전원이 AI로 기능을 1개 이상 구현해야 해요. 기능은 화면·컴포넌트 단위로 작게 나눠서, 다른 조원이 맡을 수 있게 해요

## 7. 추천 로직과 테스트 규칙

### 7-1. 로직 위치

- 추천 로직(D-day 계산, 배지 색 구분, 임박 판정, 레시피 노출 조건, 정렬, 피드백 필터와 제외 목록 누적, 해 먹은 재료 처리, 추천 이유 문장 조합)은 `js/logic.js`에 순수 함수로 둬요. DOM, localStorage에 접근하지 않고, 브라우저에서는 `window.Logic`으로 써요

### 7-2. 규칙 기준 (기획안·화면설계서 PDF)

- D-day와 배지: 1-6 (0일 D-day, 1~3일 레드, 4~7일 오렌지, 8일 이상 그린, 지나면 "기한 지남")
- 임박 재료: 2-2(1) (3일 이하, 없으면 가장 빨리 오는 3개)
- 노출 조건: 2-2(2) (필요 재료 절반 이상 + 2개 이상 보유, 임박 모드는 임박 재료 1개 이상). 밥·물·식용유는 있다고 봄
- **정렬: 2-2(3) 점수 합** — 카드에 쓰이는 내 재료마다 남은 일수 1일 이하 8점, 2~3일 4점, 4~7일 2점, 8일 이상 1점을 더해 높은 순. 같으면 보유 재료 비율이 높은 순 → 조리시간 짧은 순 → id 작은 순. 화면 2/3과 화면 5 모두 같은 정렬을 써요
- 피드백 필터: 4-2 (6개 태그), 이미 별로라고 한 레시피는 다시 나오지 않음
- 해 먹은 재료 처리: 2-4 (민트 칩 재료만 빼고 양념류는 남김, 고른 재료 모드는 고른 재료만)

### 7-3. 재추천 방식 (AI 없이)

- 6개 피드백 칩은 "조건"으로 바꿔 후보를 거르는 비평(critiquing) 기반 재추천으로 만들어요
- 거른 결과가 없으면 조건을 하나씩 풀고 "조건을 조금 완화해서 추천했어요"를 보여요. 순서: ① 노출 조건의 "절반 이상"(2개 이상 보유는 유지) ② want_different·recently_ate ③ too_long ④ too_hard ⑤ lack_ingredient. no_spicy는 풀지 않아요
- 풀어도 없거나 남은 후보가 없으면 "후보 소진" 상태를 보여요
- 한 번에 보여 주는 3장은 가능하면 요리 종류(dishType)가 겹치지 않게 골라요
- 추천 이유와 "달라진 점"은 copy.json 템플릿으로 조합해요
- 자세한 순서와 근거: `docs/plan.md` 4장

### 7-4. 테스트

- 로직 함수는 TDD로 만들어요: 실패하는 테스트 먼저 작성 → 실패 확인 → 구현 → 통과 확인
- 위 기준에서 애매한 부분은 추측하지 말고 사용자에게 물어봐요
- 로직 테스트는 "오늘" 날짜를 고정값으로 넣어서, 날짜가 바뀌어도 결과가 같게 해요
- 로직을 고칠 때는 관련 테스트도 함께 고치고, 테스트를 지워서 통과시키지 않아요
- 화면(UI)은 TDD 대상이 아니에요. Playwright 스모크 테스트(열림, 콘솔 에러 없음, 375px·1280px 가로 스크롤 없음, 화면 이동)로만 확인해요

## 8. 기록 규칙 (기획안 PPT용)

기능 구현, 큰 수정, 버그 해결이 끝나면 `docs/prompts.md`에 아래 형식으로 기록해요. (PPT P.13)

```
### [기능/문제 이름]
- 담당자:
- 사용 AI:
- 프롬프트 초안:
- 결과(Before):
- 프롬프트 수정본:
- 수정 이유:
- 결과(After):
- 검증 방법: (Playwright 통과 / 휴대폰 확인 / 시크릿 창 확인 등)
```

아래도 `docs/prompts.md`에 함께 모아 둬요.

- 심사위원 실행 가이드 (PPT P.13): 재현 경로 3단계, 제약·미구현 항목
- 크로스 피드백 (PPT P.16): 받은 날짜·조 / 좋은 점(KEEP) / 막힌 점(ISSUE) / 개선 제안(IMPROVE) / 실제로 바꾼 것

## 9. 폴더 구조

```
/
├── index.html          앱 진입점
├── css/                스타일 (app.css = 디자인 토큰 + 화면 스타일)
├── js/                 화면·기능 코드 (logic.js = 추천 로직 순수 함수)
├── data/               copy, recipes, sample-fridge, icon-map (.json 원본 + .js)
├── icons/              ingredients/ (PNG 40개), svg-source/, CREDITS.txt
├── docs/               DESIGN.md, plan.md, prompts.md, reference/ (통합 시안, 재료 레퍼런스) (배포 제외)
├── tests/              Playwright 로직·스모크 테스트, package.json (배포 제외)
├── .vercelignore       배포 제외 목록
└── CLAUDE.md           이 파일 (배포 제외)
```

## 10. 배포 전 체크

- [ ] Playwright 로직 테스트와 스모크 테스트가 모두 통과한다
- [ ] Vercel 주소에서 핵심 흐름(샘플 채우기 → 추천 → 별로예요 → 재추천)을 끝까지 한 번 실행했다
- [ ] 모바일과 PC 화면에서 깨지지 않는다
- [ ] Vercel Domains 주소가 크롬 시크릿 창과 휴대폰에서 열린다
- [ ] 조원 3명 동시 접속 테스트를 했다
- [ ] 화면 1 맨 아래 "아이콘 출처"에 Flaticon 26개 출처가 나온다
- [ ] 코드에 API 키, 개인정보가 없다
- [ ] 시연 영상이 2분 이내다
- [ ] 배포 링크를 10/30까지 유지한다 (프로젝트 삭제·도메인 변경 금지)
