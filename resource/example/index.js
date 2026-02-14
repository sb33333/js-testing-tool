"use strict";

import TestSuite from "../src/test-suite.js";
import { HtmlReporter, ConsoleReporter } from "../src/reporter.js";

/**
 * 테스트 실행 메인 로직
 * 비동기 테스트(async) 및 리포트 생성을 위해 즉시 실행 함수(IIFE)를 사용합니다.
 */
(async () => {
    // 1. 새로운 테스트 스위트 생성 (테스트 그룹의 이름 설정)
    const testSuite = new TestSuite("Example Test Suite");

    // 2. 개별 테스트 케이스 등록
    // 각 테스트는 assert 객체를 인자로 받아 성공/실패를 판가름합니다.

    testSuite.test(assert => {
        const a = 1 + 1;
        assert.equals(a, 2); // 기본 값 비교 (Pass)
    }, "Simple addition test");

    testSuite.test(assert => {
        const obj1 = { name: "Alice", age: 30 };
        const obj2 = { name: "Alice", age: 30 };

        // condition: 사용자 정의 로직이 true인지 검증 (참조값이 다른지 확인)
        assert.condition(() => obj1 !== obj2);
        // hasEqualProperties: 객체의 구조와 값이 동일한지 깊은 비교 (Pass)
        assert.hasEqualProperties(obj1, obj2);
    }, "Object property equality test");

    // 의도적인 실패 케이스: 에러 발생 시 리포터에 어떻게 찍히는지 확인용
    testSuite.test(assert => {
        assert.equals(1, 2); // 1과 2는 다르므로 Fail
    }, "Should fail.");

    testSuite.test(assert => {
        const obj1 = { name: "Alice", age: 30 };
        const obj2 = { name: "Alice", age: 31 }; // age 값이 다름
        assert.hasEqualProperties(obj1, obj2); // Fail
    }, "Should fail(Object property equality test)");

    // 3. 결과 출력
    const testResultDiv = document.getElementById("testResult");

    // HtmlReporter를 통해 HTML 문자열을 생성하고 화면에 주입합니다.
    const reportHtml = await HtmlReporter.generate(testSuite);
    testResultDiv.innerHTML = reportHtml;

    // ConsoleReporter를 통해 개발자 도구 콘솔에서도 결과를 확인할 수 있게 합니다.
    ConsoleReporter.generate(testSuite);
})();