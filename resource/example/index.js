"use strict";

import TestSuite from "../src/test-suite.js";
import { HtmlReporter, ConsoleReporter } from "../src/reporter.js";

/**
 * 테스트 도구 예제
 */
(async () => {
	// 1. 테스트 그룹의 이름 설정
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

	// 비동기 테스트 케이스: Promise를 반환하는 테스트 코드
	testSuite.test(async (assert) => {
		const delayedValue = await new Promise((resolve) => {
			setTimeout(() => resolve("Success"), 500);
		});
		assert.equals(delayedValue, "Success");
	}, "Promise: 0.5초 대기 후 결과 확인 테스트");

	// 각 테스트 앞에 'await'를 붙이면
	// 해당 테스트가 완전히 끝날 때까지 다음 테스트의 실행을 대기합니다.
	await testSuite.test(async (assert) => {
		console.log("첫 번째 테스트 시작");
		await new Promise(resolve => setTimeout(resolve, 1000));
		assert.equals(1, 1);
		console.log("첫 번째 테스트 종료");
	}, "1초 대기 테스트");

	await testSuite.test(async (assert) => {
		console.log("두 번째 테스트 시작");
		assert.equals(2, 2);
		console.log("두 번째 테스트 종료");
	}, "순차 실행 확인 테스트");

	testSuite.test(assert => {
		fetch("/")
			.then(response => {
				assert.equals(response.status, 200);
			});
	}, "fetch 테스트");

	// 3. 결과 출력
	const testResultDiv = document.getElementById("testResult");

	// HtmlReporter를 통해 HTML 문자열을 생성하고 화면에 주입합니다.
	const reportHtml = await HtmlReporter.generate(testSuite);
	testResultDiv.innerHTML = reportHtml;

	// ConsoleReporter를 통해 개발자 도구 콘솔에서도 결과를 확인할 수 있게 합니다.
	ConsoleReporter.generate(testSuite);
})();