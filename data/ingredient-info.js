/* data/ingredient-info.json에서 자동 생성. 직접 고치지 말고 JSON을 고친 뒤 cd tests && node tools/sync-data.js */
window.INGREDIENT_INFO = {
  "_note": "영수증 OCR용 재료 정보예요. aliases = 영수증 상품명에서 찾을 별칭(공백 없이 2글자 이상), exclude = 그 별칭이 들어 있어도 다른 상품인 경우(예: 사과식초는 사과가 아님), defaultShelfDays = 산 날부터 일반적인 보관 일수(냉장 기준, 새우·만두는 냉동 기준). 영수증에는 유통기한이 없어서 이 값으로 넣고, 사용자가 목록에서 확인·수정해요. 순서는 sample-fridge.json master와 같아요.",
  "items": {
    "대파": {
      "aliases": [
        "대파",
        "깐대파",
        "쪽파",
        "실파"
      ],
      "exclude": [],
      "defaultShelfDays": 7
    },
    "양파": {
      "aliases": [
        "양파"
      ],
      "exclude": [
        "양파링",
        "양파즙"
      ],
      "defaultShelfDays": 30
    },
    "마늘": {
      "aliases": [
        "마늘",
        "다진마늘",
        "깐마늘"
      ],
      "exclude": [
        "마늘빵"
      ],
      "defaultShelfDays": 14
    },
    "당근": {
      "aliases": [
        "당근"
      ],
      "exclude": [
        "당근주스"
      ],
      "defaultShelfDays": 14
    },
    "감자": {
      "aliases": [
        "감자"
      ],
      "exclude": [
        "감자칩",
        "감자깡",
        "감자탕",
        "감자튀김"
      ],
      "defaultShelfDays": 21
    },
    "김치": {
      "aliases": [
        "김치",
        "묵은지"
      ],
      "exclude": [
        "김치만두",
        "김치라면",
        "김치찌개",
        "김치볶음밥",
        "김치전",
        "김치사발"
      ],
      "defaultShelfDays": 30
    },
    "애호박": {
      "aliases": [
        "애호박",
        "쥬키니",
        "주키니"
      ],
      "exclude": [],
      "defaultShelfDays": 7
    },
    "버섯": {
      "aliases": [
        "버섯",
        "표고",
        "팽이",
        "새송이",
        "느타리",
        "양송이"
      ],
      "exclude": [
        "양송이수프"
      ],
      "defaultShelfDays": 7
    },
    "사과": {
      "aliases": [
        "사과"
      ],
      "exclude": [
        "사과식초",
        "사과주스",
        "사과잼",
        "사과즙",
        "사과맛"
      ],
      "defaultShelfDays": 21
    },
    "청양고추": {
      "aliases": [
        "청양고추",
        "청양"
      ],
      "exclude": [],
      "defaultShelfDays": 14
    },
    "양배추": {
      "aliases": [
        "양배추"
      ],
      "exclude": [],
      "defaultShelfDays": 21
    },
    "콩나물": {
      "aliases": [
        "콩나물"
      ],
      "exclude": [],
      "defaultShelfDays": 4
    },
    "깻잎": {
      "aliases": [
        "깻잎"
      ],
      "exclude": [],
      "defaultShelfDays": 5
    },
    "토마토": {
      "aliases": [
        "토마토",
        "방울토마토",
        "대추토마토"
      ],
      "exclude": [
        "토마토케첩",
        "토마토소스",
        "토마토주스",
        "토마토파스타"
      ],
      "defaultShelfDays": 7
    },
    "스팸": {
      "aliases": [
        "스팸"
      ],
      "exclude": [],
      "defaultShelfDays": 365
    },
    "참치캔": {
      "aliases": [
        "참치캔",
        "참치"
      ],
      "exclude": [
        "참치김밥",
        "참치마요"
      ],
      "defaultShelfDays": 365
    },
    "계란": {
      "aliases": [
        "계란",
        "달걀",
        "유정란",
        "특란"
      ],
      "exclude": [
        "계란과자",
        "계란빵"
      ],
      "defaultShelfDays": 21
    },
    "두부": {
      "aliases": [
        "두부"
      ],
      "exclude": [
        "두부과자"
      ],
      "defaultShelfDays": 7
    },
    "어묵": {
      "aliases": [
        "어묵",
        "오뎅"
      ],
      "exclude": [],
      "defaultShelfDays": 14
    },
    "돼지고기": {
      "aliases": [
        "돼지고기",
        "돼지",
        "삼겹살",
        "목살",
        "앞다리",
        "뒷다리",
        "대패삼겹"
      ],
      "exclude": [
        "돼지바"
      ],
      "defaultShelfDays": 4
    },
    "닭가슴살": {
      "aliases": [
        "닭가슴살"
      ],
      "exclude": [],
      "defaultShelfDays": 7
    },
    "새우": {
      "aliases": [
        "새우",
        "칵테일새우",
        "흰다리"
      ],
      "exclude": [
        "새우깡",
        "새우젓",
        "새우칩",
        "새우버거"
      ],
      "defaultShelfDays": 30
    },
    "소시지": {
      "aliases": [
        "소시지",
        "소세지",
        "비엔나",
        "프랑크"
      ],
      "exclude": [],
      "defaultShelfDays": 21
    },
    "베이컨": {
      "aliases": [
        "베이컨"
      ],
      "exclude": [],
      "defaultShelfDays": 14
    },
    "치즈": {
      "aliases": [
        "치즈",
        "슬라이스치즈"
      ],
      "exclude": [
        "치즈케이크",
        "치즈볼",
        "치즈라면",
        "치즈스틱"
      ],
      "defaultShelfDays": 30
    },
    "만두": {
      "aliases": [
        "만두",
        "교자"
      ],
      "exclude": [
        "만두피"
      ],
      "defaultShelfDays": 180
    },
    "맛살": {
      "aliases": [
        "맛살",
        "크래미",
        "게맛살"
      ],
      "exclude": [],
      "defaultShelfDays": 14
    },
    "고추장": {
      "aliases": [
        "고추장"
      ],
      "exclude": [],
      "defaultShelfDays": 365
    },
    "간장": {
      "aliases": [
        "간장",
        "진간장",
        "양조간장"
      ],
      "exclude": [
        "간장게장"
      ],
      "defaultShelfDays": 365
    },
    "설탕": {
      "aliases": [
        "설탕",
        "백설탕",
        "흑설탕"
      ],
      "exclude": [
        "무설탕"
      ],
      "defaultShelfDays": 365
    },
    "소금": {
      "aliases": [
        "소금",
        "천일염",
        "맛소금"
      ],
      "exclude": [
        "소금빵"
      ],
      "defaultShelfDays": 365
    },
    "참기름": {
      "aliases": [
        "참기름"
      ],
      "exclude": [],
      "defaultShelfDays": 180
    },
    "마요네즈": {
      "aliases": [
        "마요네즈"
      ],
      "exclude": [],
      "defaultShelfDays": 90
    },
    "케첩": {
      "aliases": [
        "케첩",
        "케찹"
      ],
      "exclude": [],
      "defaultShelfDays": 180
    },
    "된장": {
      "aliases": [
        "된장"
      ],
      "exclude": [
        "된장찌개",
        "된장라면"
      ],
      "defaultShelfDays": 365
    },
    "고춧가루": {
      "aliases": [
        "고춧가루",
        "고추가루"
      ],
      "exclude": [],
      "defaultShelfDays": 365
    },
    "굴소스": {
      "aliases": [
        "굴소스"
      ],
      "exclude": [],
      "defaultShelfDays": 365
    },
    "후추": {
      "aliases": [
        "후추",
        "후춧가루"
      ],
      "exclude": [],
      "defaultShelfDays": 365
    },
    "식초": {
      "aliases": [
        "식초"
      ],
      "exclude": [],
      "defaultShelfDays": 365
    },
    "버터": {
      "aliases": [
        "버터"
      ],
      "exclude": [
        "버터쿠키",
        "땅콩버터",
        "버터와플"
      ],
      "defaultShelfDays": 30
    }
  }
};
