# 🚀 js-testing-tool

바닐라 자바스크립트 **유닛 테스트 도구**

---

## 🛠 주요 특징

- **Assertion**: `equals`, `containsOf` 등 테스트 단언문 제공
- **Async**: 비동기 함수(`async/await`) 테스트 케이스 지원
- **Reporting**:
  - **HTML Reporter**: 대시보드 형태의 UI 리포트 생성
  - **Console Reporter**: 브라우저 콘솔을 활용한 로그
- **Debugging**: 실패한 테스트의 실제값(Actual)과 기대값(Expected)을 JSON으로 직렬화하여 상세 비교 제공
- **⚠️ 테스트 순서 보장** (Sequential Execution)
  - `testSuite.test()` 메서드는 **Promise**를 반환합니다. 기본적으로 테스트들은 비동기로 등록되지만, <br>**특정 테스트가 반드시 종료된 후 다음 테스트가 실행되어야 한다면** `await` 키워드를 사용하세요.

```javascript
  // 순서가 중요한 경우 (예: 로그인 후 프로필 조회)
  await suite.test(async (assert) => {
    // 로그인 로직...
  }, "1. 로그인 테스트");

  await suite.test(async (assert) => {
    // 프로필 조회 로직 (로그인이 완료된 상태여야 함)
  }, "2. 프로필 조회 테스트");
  ```
---

## 📂 프로젝트 구조

```text
(project root)
│
├── resource/               # 테스트 도구 소스 코드
│   ├── assertion-error.js
│   ├── reporter.js
│   ├── test-result.js
│   ├── test-suite.js
│   └── example/             # 사용 예제
│       ├── index.html
│       └── index.js
│
└── exec/                    # 샘플 실행을 위한 도구
    ├── resource-server.jar  # 정적 자원 서빙을 위한 즉석 실행 Web 서버
    └── run-web-server.bat   # 웹 서버 실행 배치 파일 (포트: 9999)
```

## 🏃 샘플 실행 방법
제공된 간이 웹 서버를 사용하여 샘플 테스트 결과를 즉시 확인할 수 있습니다.

1) exec 폴더로 이동합니다.
2) run-web-server.bat 파일을 실행합니다.
3) resource-server.jar가 구동되며 9999 포트로 웹 서버가 시작됩니다.
4) 브라우저를 열고 아래 주소로 접속합니다.
  - 주소: http://localhost:9999/example/index.html
5) 화면에 출력되는 HTML 리포트와 브라우저 콘솔(F12) 로그를 확인합니다.
