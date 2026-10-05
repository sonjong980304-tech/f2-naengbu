# 내 냉장고를 부탁해 · 구현 계획서

- 버전: v0.2 (2026-10-05)
- 기준 자료: 대회 노션 가이드, CLAUDE.md, 기획안·화면설계서 PDF(18p), 통합 시안 v1.3, `data/*.json`
- 마감: **2026-10-08(목) 오전 11시** (남은 시간 약 2.5일)

### 변경 이력

| 버전 | 내용 |
|---|---|
| v0.1 | 첫 작성 |
| v0.2 | 정렬 = 점수 합(기획안 2-2) 확정 · 디자인 기준 = 통합 시안 HTML · 시안을 `index.html`로 교체 · AI 없는 재추천 방식(4장) 추가 · 화면 5 "생성 실패" 상태 삭제 |

---

## 0. 지금 상태

| 구분 | 상태 |
|---|---|
| `index.html` | **통합 시안 v1.3을 그대로 복사**. 화면 1~5가 이미 동작 (데이터·아이콘이 파일 안에 내장, 392KB) |
| 기준 원본 | `docs/reference/내냉부_통합시안_v1.3.html` (고치지 않고 보관) |
| 데이터 | `data/copy.json`, `recipes.json`(131개), `sample-fridge.json`(마스터 57종), `icon-map.json` |
| 아이콘 | `icons/ingredients/` PNG 57개, `CREDITS.txt`, `svg-source/` |
| 규칙 문서 | `CLAUDE.md` (가이드 보완 반영), `docs/plan.md`(이 문서) |
| 없음 | `css/`, `js/`, `js/logic.js`, `data/*.js`, `tests/`, `docs/prompts.md`, `.vercelignore`, Vercel 연결 |

**작업 방식:** 지금 `index.html`이 이미 동작하니까, 이걸 **동작하는 상태 그대로 조금씩 나눠** CLAUDE.md 구조(`css/` · `js/` · `data/*.js` · `logic.js`)로 옮겨요. 한 번 옮길 때마다 화면이 똑같이 동작하는지 확인하고, 그 사이에 정렬 변경·보완 기능을 넣어요. 언제 멈춰도 배포 가능한 상태가 유지돼요.

---

## 1. 가이드 ↔ CLAUDE.md 대조

### 1-1. 일치

- 3~5화면 · 설치 없이 링크 · 1~2분 시연 · 300~400명 동시 접속 → 정적 배포
- 바닐라 HTML/JS, `index.html`은 저장소 루트, main 브랜치만 사용
- 로그인·외부 DB·외부 API 지양, API 키·개인정보·사내 자료 금지
- 최종 링크는 Vercel **Domains 주소**, Claude Artifact 링크는 백업용
- 전원(9명) AI로 기능 1개 이상 구현, 프롬프트 Before→After 기록(PPT P.13)
- 배포 후 시크릿 창 · 휴대폰 · 조원 3명 동시 접속 테스트

### 1-2. CLAUDE.md에 보완한 항목 (가이드에만 있던 것) — 반영 완료

| # | 가이드 내용 | 반영 위치 |
|---|---|---|
| G1 | 배포 링크 최소 10/30(금)까지 유지, 마감 후 수정은 심사 미반영 | 1장, 10장 |
| G2 | PPT P.13 심사위원 실행 가이드(재현 경로 3단계, 제약·미구현) | 8장 |
| G3 | 시연 영상 2분 초과 시 뒷부분 미반영 | 10장 |
| G4 | 작동하지 않는 코드 제출 시 앱 완성도 0점 | 10장 (핵심 흐름 끝까지 실행) |
| G5 | 크로스 피드백(권장, 가점) → P.16 | 8장 |

### 1-3. 상충 · 확인 필요

| # | 내용 | 처리 |
|---|---|---|
| C1 | CLAUDE.md는 docs/·tests/를 "배포 제외"라 하지만 Vercel은 저장소 전체를 올림 | 루트 `.vercelignore` 추가 (완료) |
| C2 | 테스트 도구는 `tests/` 안에만 두는데, push 전 훅은 루트 `package.json`을 찾음 | 훅이 `tests/package.json`을 보고 `tests/`에서 실행하도록 수정 (완료) |
| C3 | Artifact 백업 링크는 파일 하나여야 열림 ↔ CLAUDE.md는 파일 분리 | **추후 논의** |
| C4 | 훅은 내 PC에만 있음 | 조원은 CLAUDE.md 6장대로 각자 수동 실행 |

---

## 2. 기획안 PDF ↔ CLAUDE.md · 시안 대조 — 결정 결과

| # | 항목 | 결정 |
|---|---|---|
| D1 | 카드 정렬 | **점수 합(기획안 2-2)**. 1일↓ 8 / 2~3일 4 / 4~7일 2 / 8일↑ 1점을 더해 높은 순, 같으면 보유 재료 비율 높은 순. 화면 2/3·5 공통. 시안의 유통기한 순은 교체 |
| D1-a | 그다음 동점 | 조리시간 짧은 순 → id 작은 순 (결과가 매번 같도록) — 확정 |
| D2 | 화면 2와 3 | 시안처럼 한 화면(S-02/03) |
| D3 | 대기 시간 | 목록 0.7초, 재추천 0.8초 스켈레톤 (AI 대기 5~8초 아님) |
| D4 | 화면 5 "생성 실패" | **삭제.** 로컬 계산이라 실패 경로가 없음. "조건 완화"·"후보 소진" 상태는 유지 (4장) |
| D5 | 화면 4 추가 입력(맛 방향·조리도구·기타 의견) | 구현 안 함, P.13 "미구현 항목"에 기록 |
| D6 | 거절 레시피 식별 | 이름 → `id` |
| D7 | 디자인 기준 | design.md 대신 **통합 시안 HTML** |

---

## 3. 작업 단계

> 원칙: 화면 하나씩, 기능 하나씩. 잘 되면 push 여부를 묻고 올림. 로직은 TDD.

### Phase 0 · 기반 세팅 (10/5)

1. ~~CLAUDE.md 추가~~ · ~~시안을 index.html로, 원본은 docs/reference/로~~ (완료)
2. ~~`.vercelignore` 추가~~ (완료)
3. `data/*.json` → `data/*.js` 4개 (`window.COPY`, `window.RECIPES`, `window.FRIDGE_DATA`, `window.ICON_MAP`) — Phase 2에서
4. ~~`tests/package.json` + Playwright 설치, push 전 훅 경로 수정~~ (완료, 통과·차단 둘 다 확인)
5. ~~`docs/prompts.md` 양식 생성~~ (완료)
6. 첫 push → Vercel 연결 → Domains 주소 확보

### Phase 1 · `js/logic.js` (TDD) — 완료 (10/5)

로직 테스트 31개 통과, index.html의 추천·재추천이 `window.Logic`을 쓰도록 교체, 화면 5 실패 상태 삭제, 스모크 테스트 3개 통과.

"오늘" 날짜는 고정값 주입. 테스트 먼저 → 실패 확인 → 구현 → 통과.

| 함수 | 근거 | 대표 테스트 |
|---|---|---|
| `daysLeft(expiry, today)` | 1-6 | 같은 날 0, 지난 날 음수, 월말·연말 넘김 |
| `badgeLevel(d)` | 1-6 | 0~3 red, 4~7 orange, 8↑ green, 음수 expired |
| `urgentSet(items, today)` | 2-2(1) | 3일 이하 없으면 가장 빠른 3개 |
| `evaluate(recipe, ctx)` | 2-2(2), 2-3 | 내 재료 / 냉장고에 있음 / 없음, 기한 지난 재료는 없음 취급 |
| `isExposed(e, ctx)` | 2-2(2) | 절반 이상 + 2개 이상, 임박 모드는 임박 재료 1개 이상 |
| `score(e)` · `sortRecipes(list)` | 2-2(3) | **기획안 예시:** 대파 D-2, 두부 D-3, 김치 D-20 → 두부김치 9점으로 맨 위 |
| `passTags(recipe, tags, seenDishTypes)` | 4-2 | 6개 태그 각각 + 조합 |
| `pickDiverse(sorted, n)` | 4장 | 3장 안에서 dishType 중복 회피, 후보가 없으면 중복 허용 |
| `rerecommend(input)` | 4장 | 조건 완화 순서, 후보 소진 판정 |
| `nextSession(session, rejectedIds)` | 4-2, 5-5 | 제외 목록 누적, 회차 +1 |
| `cookedRemoval(e, mode)` | 2-4 | 민트 칩만 빼고 양념류는 남김, 고른 재료 모드는 고른 것만 |
| `buildReason / buildChanged(…, copy)` | 3-3, copy.changed | 문구 순서, want_different+recently_ate는 1회 |

### Phase 2 · index.html 분리 (10/6 오전)

1. `<style>` → `css/app.css`
2. 내장 JSON → `data/*.js` 로 교체, 내장 data URI 아이콘 → `icons/ingredients/*.png` 경로
3. 시안 안의 추천 함수 → `window.Logic` 호출로 교체 (이때 정렬이 점수 합으로 바뀜)
4. 화면 코드 → `js/` 파일로 분리 (화면별 파일)
5. 단계마다 스모크 테스트 통과 + 화면 비교

### Phase 3 · 화면별 점검·보완 (10/6 오후 ~ 10/7 오전)

| 화면 | 점검 기준 |
|---|---|
| S-01 내 냉장고 | 기획안 1-7 체크리스트 11개 |
| S-02/03 추천 레시피 | 2-6 체크리스트 + 3-4 인터랙션 + 3-5 예외 |
| S-04 피드백 | 4-3 인터랙션 4개 |
| S-05 재추천 | 5-4 상태(실패 제외) + 5-5 인터랙션 |

### Phase 4 · 검증 · 배포 (10/7 오후)

1. Playwright 스모크: 열림, 콘솔 에러 0, 375px·1280px 가로 스크롤 없음, 화면 1→2/3→4→5 이동
2. Vercel Domains 주소 → 시크릿 창 · 휴대폰 · 조원 3명 동시 접속
3. 크로스 피드백 반영
4. Artifact 백업 링크 — 추후 논의
5. 10/8 오전: 최종 체크리스트 → 조장 제출

---

## 4. AI 없는 재추천 방식 (조사 결과)

### 4-1. 결론

기획안의 "AI가 레시피를 생성"하는 부분은 추천 시스템 연구에서 오래 쓰여 온 **지식 기반(제약 기반) 추천 + 비평(critiquing) 기반 대화형 재추천**으로 대체할 수 있어요. 레시피 39개처럼 후보가 적고 규칙이 분명할 때는 AI보다 이 방식이 더 맞아요.

| 비교 | AI 생성(기획안) | 규칙 기반(채택) |
|---|---|---|
| 응답 속도 | 5~8초 | 즉시 (0.8초 스켈레톤은 연출) |
| 300~400명 동시 접속 | API 한도·비용·키 보호용 서버 필요 | 정적 파일만, 서버 없음 |
| 결과 | 없는 재료·잘못된 조리법 환각 가능, 검증·재시도 필요 | 팀이 검수한 39개 안에서만 나옴 |
| 설명 | 생성 문장 검증 필요 | 왜 골랐는지 규칙 그대로 설명 가능 |
| 테스트 | 매번 결과가 달라 TDD 어려움 | 같은 입력 → 같은 결과, TDD 가능 |

### 4-2. 근거 자료

| 개념 | 내용 | 우리 앱에 쓰는 곳 |
|---|---|---|
| 비평 기반 추천 (Chen & Pu, 2012) | 사용자가 추천 결과에 "비평(critique)"을 주면 다음 회차에 반영해 더 맞는 결과를 내는 대화형 방식 | 화면 4의 6개 칩 = 비평, 화면 5 = 다음 회차 |
| 지식·제약 기반 추천 (Felfernig & Burke) | 품목 속성과 사용자 조건을 명시적 규칙(제약)으로 걸러 추천. 결과가 없으면 제약을 풀어(relaxation) 대안 제시 | 태그 → 조건 필터, "조건을 조금 완화해서 추천했어요" |
| 유통기한 우선 재료 추천 (가정 내 음식물 쓰레기 연구) | 집에 있는 재료와 유통기한을 보고, 유통기한이 짧은 재료를 먼저 쓰는 레시피를 추천 | 점수 합 정렬(임박 재료일수록 높은 점수) |
| MMR 다양성 재정렬 (Carbonell & Goldstein, 1998) | 관련도가 높으면서 이미 고른 것과 덜 비슷한 항목을 차례로 골라 중복을 줄임 | 3장 안에서 요리 종류(dishType) 겹침 회피 |
| 추천 설명 (Tintarev & Masthoff) | 설명은 투명성·신뢰·의사결정 효율을 높임 | copy.json 템플릿으로 추천 이유·달라진 점 |

### 4-3. 재추천 알고리즘 (화면 5)

```
입력: 냉장고(재료, 남은 일수), 추천 모드, 고른 재료, 피드백 태그, 제외 id 목록, 방금 본 레시피의 dishType

1. 후보 = recipes.json − 제외 id
2. 비평 → 조건 적용
     lack_ingredient : 재료 3개 이하
     no_spicy        : isSpicy = false
     too_long        : 조리시간 15분 이하
     too_hard        : difficulty = easy
     want_different / recently_ate : 방금 본 dishType 제외
3. 노출 조건(2-2): 절반 이상 + 2개 이상 보유, 임박 모드는 임박 재료 1개 이상
4. 점수 합 정렬(2-2) → 동점은 보유 비율 → 조리시간 → id
5. 다양성 고르기: 위에서부터 3장, 이미 고른 카드와 dishType이 같으면 건너뜀
   (같은 종류밖에 없으면 그대로 채움)
6. 결과 0장이면 조건 완화 (아래 순서로 하나씩 풀고 다시 3~5)
     ① 노출 조건 "절반 이상"을 풀고 "2개 이상 보유"만 유지 (시안과 같음)
     ② want_different / recently_ate
     ③ too_long → ④ too_hard → ⑤ lack_ingredient
     no_spicy는 풀지 않음 (맛 거부는 지켜야 하는 조건)
   → 하나라도 풀었으면 "조건을 조금 완화해서 추천했어요"
7. 끝까지 0장이면 "후보 소진" 상태 ([재료 추가하기] / [조건 바꾸기])
8. 추천 이유 = copy.reason 템플릿, 달라진 점 = copy.changed 규칙
```

- 완화 순서(6번)와 동점 처리(4번)는 2026-10-05 확정했어요.
- 별로예요를 누른 레시피 id는 sessionStorage에 누적돼 새로고침해도 다시 나오지 않아요 (기획안 14p 확인 요청 #3 해결).

---

## 5. 보완 · 추가 제안 (평가 기준 기준)

평가: 문제 정의 25 · **앱 완성도·사용성 25** · **AI 활용·개선 과정 25** · 차별성·확장성 15 · 협업·검증 10

| 우선 | 항목 | 이유 | 평가 항목 |
|---|---|---|---|
| 필수 | 정렬을 점수 합으로 교체 | D1 결정 | 완성도 |
| 필수 | 화면 5 "생성 실패" 상태·`?fail` 삭제 | D4 결정 | 완성도 |
| 필수 | 재추천 조건 완화·다양성 고르기 | 4장 | 완성도 |
| 필수 | 심사위원 첫 진입 시 [샘플 재료로 채워 보기]가 눈에 띄게 | 바로 핵심 기능 도달 | 완성도 |
| 필수 | D-day 배지 글자 대비 점검 (기획안 14p 확인 요청 #2) | 접근성 · 야외 시연 | 사용성 |
| 권장 | 링크 공유 미리보기(OG 태그 · 파비콘 · 앱 제목) | 300~400명이 카톡 링크로 접속 | 완성도 |
| 권장 | 재료 PNG 512px → 128px 축소 (1.1MB → 약 150KB 예상) | 동시 접속 · 모바일 데이터 | 완성도 |
| 권장 | 4장 조사 내용을 PPT P.13 "AI 대신 규칙 기반을 고른 이유"로 기록 | 의사결정 근거 = 개선 과정 | AI 활용 |
| 권장 | 기능마다 `docs/prompts.md` 즉시 기록 | P.13 Before→After | AI 활용 |
| 선택 | 자정이 지나면 D-day 다시 계산 | 기획안 1-7 | 완성도 |

---

## 6. 리스크

| 리스크 | 대응 |
|---|---|
| 마감 직전 사용량 한도 | 하루 단위로 분산, 빌드팀 선행 |
| Vercel 긴 주소 제출 실수 | Domains 주소만 사용, 시크릿 창 확인 |
| 같은 파일 동시 수정 충돌 | 화면·파일 단위 분담, 작업 전 공지 |
| 분리 작업 중 화면이 망가짐 | 단계마다 스모크 테스트 + 원본 시안과 화면 비교, 잘 될 때마다 push |
| 조원 초대 미완료(현재 2명) | 나머지 아이디 받는 대로 초대 |

---

## 7. 참고 자료

- Chen, L. & Pu, P. (2012). Critiquing-based recommenders: survey and emerging trends. *User Modeling and User-Adapted Interaction* 22. https://doi.org/10.1007/s11257-011-9108-6
- Felfernig, A. & Burke, R. (2008). Constraint-based recommender systems: technologies and research issues. / Felfernig et al., Constraint-based Recommender Systems (RS Handbook 2015). https://web-ainf.aau.at/pub/jannach/files/BookChapter_Constraint-BasedRS_2015.pdf
- Knowledge-based recommender system (개요). https://en.wikipedia.org/wiki/Knowledge-based_recommender_system
- Carbonell, J. & Goldstein, J. (1998). The use of MMR, diversity-based reranking for reordering documents and producing summaries. SIGIR '98. https://people.eng.unimelb.edu.au/ammoffat/sigir98/abstracts/carbonell.html
- Result Diversification in Search and Recommendation: A Survey. https://arxiv.org/pdf/2212.14464
- Social Recipe Recommendation to Reduce Food Waste. https://www.researchgate.net/publication/261213407_Social_Recipe_Recommendation_to_Reduce_Food_Waste
- RecipeIS — Recipe Recommendation System Based on Recognition of Food Ingredients (Applied Sciences, 2023). https://www.mdpi.com/2076-3417/13/13/7880
- Explanations in recommender systems (Tintarev & Masthoff의 설명 목표 7가지 정리). https://khoury.northeastern.edu/home/vip/teach/DMcourse/6_graph_analysis/notes_slides/collab_filter/Aggrawal_recomm_systems/Recommender_Systems_An_Introduction_Chapter06_Explanations_in_recommender_systems.pdf
