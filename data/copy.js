/* data/copy.json에서 자동 생성. 직접 고치지 말고 JSON을 고친 뒤 cd tests && node tools/sync-data.js */
window.COPY = {
  "_note": "화면 문구 기준 파일이에요. 코드에 문구를 직접 쓰지 않고 이 파일의 키로 불러와요. {중괄호}는 코드가 채우는 값이에요.",
  "app": {
    "title": "내 냉장고를 부탁해",
    "tagline": "냉장고 속 재료로 오늘 메뉴를 정해 드려요",
    "iconCredits": "아이콘 출처",
    "iconCreditsLine": "\"{iconTitle}\" icon by {author} from Flaticon"
  },
  "badge": {
    "today": "D-day",
    "daysLeft": "D-{n}",
    "expired": "기한 지남"
  },
  "fridge": {
    "title": "내 냉장고",
    "lead": "넣어 둔 재료와 유통기한이 며칠 남았는지 한눈에 볼 수 있어요. 재료는 이 기기에 저장돼요.",
    "summaryUrgent": "3일 안에 먹어야 할 재료가 {n}개 있어요",
    "summaryCalm": "급하게 먹어야 할 재료는 없어요",
    "summaryExpired": "유통기한이 지난 재료가 {n}개 있어요 ({list})",
    "shelfVegetable": "채소 칸",
    "shelfProtein": "단백질 칸",
    "shelfDoor": "문 선반",
    "empty": "냉장고가 비어 있어요. 재료를 넣어 볼까요?",
    "fillSample": "샘플 재료로 채워 보기",
    "hint": "재료를 눌러 고르면, 고른 재료로 만들 수 있는 요리를 추천해 드려요.",
    "addOpen": "재료 넣기",
    "addClose": "재료 넣기 닫기",
    "tabManual": "직접 입력",
    "tabReceipt": "영수증 첨부",
    "listTitle": "냉장고 속 재료",
    "listCount": "{n}개",
    "listEmpty": "아직 넣은 재료가 없어요. 위에서 재료를 골라 넣어 보세요.",
    "expiryLabel": "유통기한",
    "daysLeft": "{n}일 남음",
    "today": "오늘까지예요",
    "expired": "기한이 지났어요",
    "remove": "{name} 빼기",
    "receiptUpload": "장 본 영수증 사진 올리기",
    "receiptChange": "다른 사진으로 바꾸기",
    "receiptPreviewAlt": "올린 영수증 미리보기",
    "receiptScan": "재료 인식하기",
    "receiptDemoNote": "시연용 기능이에요. 지금은 사진과 상관없이 샘플 재료가 담겨요.",
    "receiptDone": "샘플 재료 5개를 냉장고에 넣었어요. 아래 목록에서 유통기한을 확인해 주세요.",
    "receiptTag": "영수증에서 인식",
    "goUrgent": "임박 재료로 추천받기",
    "goPicked": "고른 재료로 추천받기",
    "goPickedCount": "고른 재료로 추천받기 ({n})",
    "summaryUrgentBadge": "임박",
    "summaryCalmBadge": "여유"
  },
  "recipeList": {
    "titleUrgent": "임박한 재료부터 골랐어요",
    "titlePicked": "고른 재료로 만들 수 있어요",
    "leadUrgent": "유통기한이 가장 빨리 오는 재료를 먼저 쓰는 순서예요. 밥, 물, 식용유는 집에 있다고 생각했어요.",
    "leadPicked": "고른 재료 {n}개로 만들 수 있는 요리예요. 밥, 물, 식용유는 집에 있다고 생각했어요.",
    "loading": "재료를 살펴보고 있어요.",
    "empty": "아직 추천할 요리가 없어요. 냉장고에 재료를 더 넣거나 다른 재료를 골라 주세요.",
    "back": "내 냉장고로 돌아가기"
  },
  "card": {
    "minutes": "{n}분",
    "difficulty": {
      "easy": "쉬움",
      "normal": "보통",
      "hard": "어려움"
    },
    "spicy": "매콤해요",
    "new": "NEW",
    "inFridge": "냉장고에 있어요",
    "missing": "{name} 없음",
    "steps": "조리 방법 보기",
    "reasonLabel": "추천 이유",
    "honeyLabel": "다른 유저 꿀조합",
    "helpfulLabel": "도움돼요 {n}",
    "pick": "이걸로 할래요",
    "picked": "오늘의 메뉴예요",
    "reject": "별로예요",
    "cooked": "이 요리로 해 먹었어요",
    "cookedNotice": "{recipe}을(를) 만들었어요. 냉장고에서 뺀 재료: {list}",
    "cookedNoticeSeasoning": " (양념류는 그대로 둬요)",
    "undo": "되돌리기",
    "cookedNone": "없음",
    "cookedDone": "해 먹었어요"
  },
  "reason": {
    "urgent": "임박한 {list}부터 먼저 쓸 수 있어요.",
    "urgentItem": "{name}(D-{n})",
    "calm": "냉장고 재료만으로 {n}분이면 만들 수 있어요.",
    "after": {
      "lack_ingredient": "재료가 적게 들어요",
      "no_spicy": "맵지 않아요",
      "too_long": "{n}분이면 끝나요",
      "too_hard": "과정이 간단해요",
      "want_different": "새로운 조합이에요",
      "recently_ate": "새로운 조합이에요"
    }
  },
  "toast": {
    "picked": "{recipe}로 정했어요. 맛있게 만들어요"
  },
  "today": {
    "title": "오늘의 추천 레시피",
    "lead": "유통기한이 임박한 재료부터 골랐어요"
  },
  "feedback": {
    "back": "뒤로 가기",
    "title": "어떤 점이 마음에 들지 않나요?",
    "lead": "여러 개를 골라도 괜찮아요",
    "tags": {
      "lack_ingredient": "재료가 부족해요",
      "no_spicy": "매운 건 싫어요",
      "too_long": "조리 시간이 너무 길어요",
      "too_hard": "너무 어려워요",
      "want_different": "다른 조합이 보고 싶어요",
      "recently_ate": "최근에 먹었어요"
    },
    "error": "마음에 들지 않는 점을 하나 이상 골라 주세요.",
    "submit": "다시 추천받기",
    "targetMulti": "방금 본 추천 {n}개"
  },
  "rerecommend": {
    "back": "피드백 화면으로 돌아가기",
    "round": "추천 {n}회차",
    "title": "이번엔 이렇게 골라봤어요",
    "lead": "피드백을 반영해 유통기한이 빠른 재료부터 담았어요.",
    "reflectedLabel": "반영한 피드백",
    "section": "새로 추천한 레시피",
    "loading": "피드백을 반영하는 중이에요",
    "relaxed": "조건을 조금 완화해서 추천했어요",
    "fail": "추천을 불러오지 못했어요. 잠시 후 다시 시도해 주세요",
    "retry": "다시 시도",
    "exhausted": "조건에 맞는 새 레시피가 거의 다 나왔어요. 재료를 추가하거나 조건을 바꿔 볼까요?",
    "addIngredient": "재료 추가하기",
    "changeCondition": "조건 바꾸기",
    "again": "다시 피드백 주기",
    "againNote": "마음에 들 때까지 몇 번이든 다시 추천받을 수 있어요",
    "toFridge": "내 냉장고로 돌아가기",
    "prevRecipes": "이전 레시피로 돌아가기",
    "prevSection": "이전에 추천한 레시피",
    "cookedNote": "남은 재료로 다음 메뉴도 골라 볼 수 있어요"
  },
  "changed": {
    "_note": "'달라진 점' 박스 문구. 고른 태그를 order 순서로 놓고, 마지막 태그만 final, 나머지는 and 를 써서 이은 뒤 ending 에 넣어요. want_different와 recently_ate를 같이 고르면 한 번만 써요.",
    "order": [
      "no_spicy",
      "too_long",
      "too_hard",
      "lack_ingredient",
      "want_different",
      "recently_ate"
    ],
    "parts": {
      "no_spicy": {
        "and": "맵지 않고",
        "final": "맵지 않은"
      },
      "too_long": {
        "and": "15분 안에 끝나고",
        "final": "15분 안에 끝나는"
      },
      "too_hard": {
        "and": "쉽고",
        "final": "쉬운"
      },
      "lack_ingredient": {
        "and": "재료 3개 이하로 만들 수 있고",
        "final": "재료 3개 이하로 만들 수 있는"
      },
      "want_different": {
        "and": "방금 본 요리와 종류가 다르고",
        "final": "방금 본 요리와 종류가 다른"
      },
      "recently_ate": {
        "and": "방금 본 요리와 종류가 다르고",
        "final": "방금 본 요리와 종류가 다른"
      }
    },
    "ending": "{parts} 요리로 바꿨어요",
    "examples": [
      "맵지 않은 요리로 바꿨어요",
      "맵지 않고 15분 안에 끝나는 요리로 바꿨어요"
    ]
  }
};
