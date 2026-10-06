/* data/ingredient-info.json에서 자동 생성. 직접 고치지 말고 JSON을 고친 뒤 cd tests && node tools/sync-data.js */
window.INGREDIENT_INFO = {
  "_note": "영수증 OCR용 재료 정보예요. aliases = 영수증 상품명에서 찾을 별칭(공백 없이 2글자 이상), exclude = 그 별칭이 들어 있어도 다른 상품인 경우(예: 사과식초는 사과가 아님), defaultShelfDays = 산 날부터 일반적인 보관 일수(냉장 기준, 새우·만두는 냉동 기준). 영수증에는 유통기한이 없어서 이 값으로 넣고, 사용자가 목록에서 확인·수정해요. 순서는 sample-fridge.json master와 같아요. globalExclude = 줄에 이 단어가 있으면 완제품으로 보고 그 줄 전체를 재료로 치지 않아요(예: 달걀말이김밥, 소금빵). 영수증 OCR은 같은 자리 한 글자의 모음·받침·된소리 차이까지 허용해요(자모 6개 이상 별칭만, js/receipt.js).",
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
        "깐마늘"
      ],
      "exclude": [
        "마늘빵",
        "다진마늘",
        "간마늘",
        "다짐마늘"
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
        "감자튀김",
        "감자전분"
      ],
      "defaultShelfDays": 21
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
    "무": {
      "aliases": [
        "무우",
        "다발무",
        "세척무",
        "월동무",
        "제주무",
        "국산무"
      ],
      "exclude": [
        "무말랭이",
        "무청"
      ],
      "defaultShelfDays": 7
    },
    "오이": {
      "aliases": [
        "오이",
        "백오이",
        "취청오이",
        "다다기오이"
      ],
      "exclude": [
        "오이지",
        "오이피클",
        "오이소박이"
      ],
      "defaultShelfDays": 7
    },
    "파프리카": {
      "aliases": [
        "파프리카",
        "미니파프리카",
        "피망",
        "청피망",
        "홍피망"
      ],
      "exclude": [
        "파프리카가루",
        "파프리카칩"
      ],
      "defaultShelfDays": 10
    },
    "가지": {
      "aliases": [
        "가지",
        "흑가지"
      ],
      "exclude": [
        "여러가지",
        "가지볶음",
        "가지튀김"
      ],
      "defaultShelfDays": 7
    },
    "부추": {
      "aliases": [
        "부추",
        "영양부추",
        "솔부추"
      ],
      "exclude": [
        "부추전",
        "부추김치"
      ],
      "defaultShelfDays": 4
    },
    "배추": {
      "aliases": [
        "배추",
        "알배추",
        "알배기",
        "쌈배추",
        "봄동"
      ],
      "exclude": [
        "양배추",
        "배추김치",
        "포기김치",
        "절임배추김치"
      ],
      "defaultShelfDays": 14
    },
    "시금치": {
      "aliases": [
        "시금치",
        "섬초",
        "포항초"
      ],
      "exclude": [],
      "defaultShelfDays": 4
    },
    "브로콜리": {
      "aliases": [
        "브로콜리",
        "브로컬리"
      ],
      "exclude": [],
      "defaultShelfDays": 7
    },
    "상추": {
      "aliases": [
        "상추",
        "적상추",
        "청상추",
        "꽃상추"
      ],
      "exclude": [],
      "defaultShelfDays": 5
    },
    "청경채": {
      "aliases": [
        "청경채"
      ],
      "exclude": [],
      "defaultShelfDays": 7
    },
    "숙주": {
      "aliases": [
        "숙주",
        "숙주나물"
      ],
      "exclude": [],
      "defaultShelfDays": 3
    },
    "돼지고기": {
      "aliases": [
        "돼지고기",
        "돼지",
        "삼겹살",
        "목살",
        "앞다리",
        "뒷다리",
        "대패삼겹",
        "한돈"
      ],
      "exclude": [
        "돼지바"
      ],
      "defaultShelfDays": 4
    },
    "쇠고기": {
      "aliases": [
        "쇠고기",
        "소고기",
        "한우",
        "국거리",
        "차돌박이",
        "우삼겹"
      ],
      "exclude": [
        "소고기라면",
        "소고기볶음밥",
        "소고기죽",
        "쇠고기라면",
        "쇠고기다시다"
      ],
      "defaultShelfDays": 3
    },
    "닭고기": {
      "aliases": [
        "닭고기",
        "생닭",
        "닭다리",
        "닭날개",
        "닭봉",
        "닭안심",
        "통닭",
        "닭볶음탕용",
        "닭정육"
      ],
      "exclude": [
        "닭가슴살",
        "닭강정",
        "닭꼬치",
        "치킨"
      ],
      "defaultShelfDays": 2
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
        "새우버거",
        "새우탕면",
        "새우탕큰사발"
      ],
      "defaultShelfDays": 30
    },
    "오징어": {
      "aliases": [
        "오징어",
        "생물오징어",
        "손질오징어"
      ],
      "exclude": [
        "오징어채",
        "오징어땅콩",
        "오징어집",
        "진미채",
        "마른오징어",
        "오징어젓",
        "오징어짬뽕"
      ],
      "defaultShelfDays": 2
    },
    "고등어": {
      "aliases": [
        "고등어",
        "자반고등어",
        "순살고등어"
      ],
      "exclude": [
        "고등어조림통조림"
      ],
      "defaultShelfDays": 2
    },
    "계란": {
      "aliases": [
        "계란",
        "달걀",
        "유정란",
        "특란",
        "구운란",
        "맥반석란",
        "훈제란"
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
    "우유": {
      "aliases": [
        "우유",
        "흰우유",
        "저지방우유"
      ],
      "exclude": [
        "우유식빵",
        "딸기우유",
        "바나나우유",
        "초코우유",
        "커피우유",
        "우유푸딩"
      ],
      "defaultShelfDays": 10
    },
    "생크림": {
      "aliases": [
        "생크림",
        "휘핑크림"
      ],
      "exclude": [
        "생크림케이크",
        "생크림빵",
        "생크림롤"
      ],
      "defaultShelfDays": 10
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
    "어묵": {
      "aliases": [
        "어묵",
        "오뎅"
      ],
      "exclude": [],
      "defaultShelfDays": 14
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
    "맛살": {
      "aliases": [
        "맛살",
        "크래미",
        "게맛살"
      ],
      "exclude": [],
      "defaultShelfDays": 14
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
        "김치사발",
        "김치사발면"
      ],
      "defaultShelfDays": 30
    },
    "김": {
      "aliases": [
        "조미김",
        "구운김",
        "재래김",
        "파래김",
        "곱창김",
        "도시락김",
        "김가루",
        "김자반"
      ],
      "exclude": [],
      "defaultShelfDays": 90
    },
    "파스타": {
      "aliases": [
        "파스타",
        "스파게티",
        "펜네",
        "링귀니",
        "푸실리"
      ],
      "exclude": [
        "파스타소스",
        "스파게티소스"
      ],
      "defaultShelfDays": 365
    },
    "소면": {
      "aliases": [
        "소면",
        "중면"
      ],
      "exclude": [],
      "defaultShelfDays": 365
    },
    "우동면": {
      "aliases": [
        "우동면",
        "우동사리",
        "생우동"
      ],
      "exclude": [
        "튀김우동",
        "우동컵"
      ],
      "defaultShelfDays": 30
    },
    "라면": {
      "aliases": [
        "라면",
        "라면사리",
        "신라면",
        "진라면",
        "안성탕면",
        "삼양라면"
      ],
      "exclude": [
        "컵라면",
        "라면스프"
      ],
      "defaultShelfDays": 180
    },
    "당면": {
      "aliases": [
        "당면",
        "자른당면",
        "납작당면"
      ],
      "exclude": [],
      "defaultShelfDays": 365
    },
    "떡": {
      "aliases": [
        "가래떡",
        "떡국떡",
        "떡볶이떡",
        "떡사리",
        "조랭이떡",
        "밀떡",
        "쌀떡"
      ],
      "exclude": [
        "떡갈비",
        "찹쌀떡",
        "떡케이크"
      ],
      "defaultShelfDays": 5
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
    },
    "들기름": {
      "aliases": [
        "들기름"
      ],
      "exclude": [],
      "defaultShelfDays": 90
    },
    "밀가루": {
      "aliases": [
        "밀가루",
        "중력분",
        "박력분",
        "강력분",
        "부침가루",
        "튀김가루"
      ],
      "exclude": [],
      "defaultShelfDays": 180
    },
    "다진마늘": {
      "aliases": [
        "다진마늘",
        "간마늘",
        "다짐마늘"
      ],
      "exclude": [],
      "defaultShelfDays": 30
    },
    "전분": {
      "aliases": [
        "전분",
        "감자전분",
        "옥수수전분",
        "녹말",
        "녹말가루"
      ],
      "exclude": [],
      "defaultShelfDays": 365
    },
    "카레가루": {
      "aliases": [
        "카레가루",
        "카레분",
        "고형카레",
        "바몬드카레",
        "카레여왕"
      ],
      "exclude": [
        "3분카레"
      ],
      "defaultShelfDays": 365
    }
  },
  "globalExclude": [
    "김밥",
    "도시락",
    "과자",
    "스낵",
    "칩",
    "빵",
    "아이스크림",
    "주스",
    "음료"
  ]
};
