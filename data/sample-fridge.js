/* data/sample-fridge.json에서 자동 생성. 직접 고치지 말고 JSON을 고친 뒤 cd tests && node tools/sync-data.js */
window.FRIDGE_DATA = {
  "_note": "daysLeft는 '오늘부터 남은 일수'예요. 앱에서 유통기한 = 오늘 + daysLeft 로 바꿔서 저장하고, D-day는 항상 유통기한 - 오늘로 다시 계산해요. v1.2: 마스터 40종(14종 추가), 샘플 냉장고에 콩나물·양배추·굴소스 추가. v1.4: 샘플 냉장고에 shelfDays(산 날부터 유통기한까지 전체 보관 일수) 추가. 신선도 바 = daysLeft / shelfDays.",
  "master": {
    "야채·과일": [
      "대파",
      "양파",
      "마늘",
      "당근",
      "감자",
      "김치",
      "애호박",
      "버섯",
      "사과",
      "청양고추",
      "양배추",
      "콩나물",
      "깻잎",
      "토마토"
    ],
    "고기·해산물": [
      "스팸",
      "참치캔",
      "계란",
      "두부",
      "어묵",
      "돼지고기",
      "닭가슴살",
      "새우",
      "소시지",
      "베이컨",
      "치즈",
      "만두",
      "맛살"
    ],
    "양념류": [
      "고추장",
      "간장",
      "설탕",
      "소금",
      "참기름",
      "마요네즈",
      "케첩",
      "된장",
      "고춧가루",
      "굴소스",
      "후추",
      "식초",
      "버터"
    ]
  },
  "sampleFridge": [
    {
      "name": "두부",
      "category": "고기·해산물",
      "daysLeft": 1,
      "shelfDays": 7
    },
    {
      "name": "대파",
      "category": "야채·과일",
      "daysLeft": 2,
      "shelfDays": 7
    },
    {
      "name": "콩나물",
      "category": "야채·과일",
      "daysLeft": 2,
      "shelfDays": 5
    },
    {
      "name": "돼지고기",
      "category": "고기·해산물",
      "daysLeft": 3,
      "shelfDays": 5
    },
    {
      "name": "애호박",
      "category": "야채·과일",
      "daysLeft": 5,
      "shelfDays": 10
    },
    {
      "name": "양배추",
      "category": "야채·과일",
      "daysLeft": 6,
      "shelfDays": 21
    },
    {
      "name": "소시지",
      "category": "고기·해산물",
      "daysLeft": 6,
      "shelfDays": 14
    },
    {
      "name": "당근",
      "category": "야채·과일",
      "daysLeft": 9,
      "shelfDays": 14
    },
    {
      "name": "양파",
      "category": "야채·과일",
      "daysLeft": 12,
      "shelfDays": 30
    },
    {
      "name": "계란",
      "category": "고기·해산물",
      "daysLeft": 14,
      "shelfDays": 21
    },
    {
      "name": "김치",
      "category": "야채·과일",
      "daysLeft": 20,
      "shelfDays": 60
    },
    {
      "name": "스팸",
      "category": "고기·해산물",
      "daysLeft": 30,
      "shelfDays": 365
    },
    {
      "name": "참기름",
      "category": "양념류",
      "daysLeft": 60,
      "shelfDays": 180
    },
    {
      "name": "간장",
      "category": "양념류",
      "daysLeft": 90,
      "shelfDays": 365
    },
    {
      "name": "고추장",
      "category": "양념류",
      "daysLeft": 90,
      "shelfDays": 365
    },
    {
      "name": "마요네즈",
      "category": "양념류",
      "daysLeft": 45,
      "shelfDays": 90
    },
    {
      "name": "굴소스",
      "category": "양념류",
      "daysLeft": 120,
      "shelfDays": 365
    }
  ],
  "receiptDemo": {
    "_note": "영수증 시연 버전: 사진 내용과 관계없이 아래 5개가 들어가고 '영수증에서 인식' 태그가 붙어요.",
    "items": [
      {
        "name": "대파",
        "category": "야채·과일",
        "daysLeft": 5,
        "fromReceipt": true
      },
      {
        "name": "두부",
        "category": "고기·해산물",
        "daysLeft": 4,
        "fromReceipt": true
      },
      {
        "name": "계란",
        "category": "고기·해산물",
        "daysLeft": 14,
        "fromReceipt": true
      },
      {
        "name": "스팸",
        "category": "고기·해산물",
        "daysLeft": 30,
        "fromReceipt": true
      },
      {
        "name": "양파",
        "category": "야채·과일",
        "daysLeft": 10,
        "fromReceipt": true
      }
    ]
  },
  "testFridges": {
    "_note": "완료 기준 체크리스트를 확인하기 위한 테스트용 냉장고예요. 시연용이 아니에요.",
    "expiredCase": [
      {
        "name": "두부",
        "category": "고기·해산물",
        "daysLeft": -1
      },
      {
        "name": "대파",
        "category": "야채·과일",
        "daysLeft": 0
      },
      {
        "name": "김치",
        "category": "야채·과일",
        "daysLeft": 20
      }
    ],
    "noImminentCase": [
      {
        "name": "계란",
        "category": "고기·해산물",
        "daysLeft": 14
      },
      {
        "name": "김치",
        "category": "야채·과일",
        "daysLeft": 20
      },
      {
        "name": "스팸",
        "category": "고기·해산물",
        "daysLeft": 30
      },
      {
        "name": "양파",
        "category": "야채·과일",
        "daysLeft": 12
      }
    ],
    "tooFewCase": [
      {
        "name": "계란",
        "category": "고기·해산물",
        "daysLeft": 5
      }
    ]
  }
};
