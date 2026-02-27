import AssertionError from "./assertion-error.js";
import TestResult from "./test-result.js";

/**
 * 테스트 케이스들을 그룹화하고 실행 및 결과 집계를 관리하는 클래스입니다.
 */
export default class TestSuite {

	/**
	 * TestSuite 인스턴스를 생성합니다.
	 * @param {string} [testSuiteName="Test"] - 테스트 그룹 이름
	 */
	constructor(testSuiteName) {
		this._testSuiteName = testSuiteName || "Test";
		this._sequence = 0;
		this._tests = [];
		this._beforeEach = testInfo => {};
		this._afterEach = testInfo => {};
		this._beforeAll = () => {};
		this._beforeAllPromise = Promise.resolve();
		this._afterAll = () => {};
		this._afterAllPromise = Promise.resolve();
		this._isInitialized = false;
		this._isCleanedUp = false;

		/**
		 * 테스트 결과가 기대치와 일치하는지 검증하는 **테스트 단언(Assertion) 객체**입니다.
		 * 각 테스트 케이스 내에서 실제 값(actual)과 기대 값(expected)을 비교하여,
		 * 조건이 충족되지 않을 경우 `AssertionError`를 발생시켜 테스트 실패를 알립니다.
		 * @namespace assert
		 * @property {Function} equals - 두 값의 엄격한 일치(===) 여부 확인
		 * @property {Function} hasEqualProperties - 두 객체의 속성이 동일한지 확인
		 * @property {Function} isSubsetOf - actual이 expected의 부분 집합인지 확인
		 * @property {Function} containsOf - actual이 expected의 속성들을 포함하는지 확인
		 * @property {Function} condition - 사용자 정의 조건(predicate) 충족 여부 확인
		 */
		this._assert = (() => {
			return {
				/**
				 * 두 값이 엄격하게 일치하는지 확인합니다.
				 * @memberof assert
				 * @param {*} actual
				 * @param {*} expected
				 */
				equals: (actual, expected) => {
					if (actual !== expected) throw new AssertionError(actual, expected);
				},
				/**
				 * 두 객체가 동일한 속성과 값을 가지고 있는지 확인합니다.
				 * @memberof assert
				 * @param {*} actual
				 * @param {*} expected
				 */
				hasEqualProperties: (actual, expected) => {
					if (typeof actual !== "object" || typeof expected !== "object") throw new AssertionError(actual, expected, "target should be 'object'.");
					if (
						(actual === null && expected !== null) || (actual !== null && expected === null)
					) throw new AssertionError(actual, expected);
					var entry_actual = Object.entries(actual);
					var entry_expected = Object.entries(expected);
					var check = entry_actual.every(entry => {
						var [key, value] = entry;
						return expected[key] === value;
					}) &&
						entry_expected.every(entry => {
							var [key, value] = entry;
							return actual[key] === value;
						})
						;
					if (!check) throw new AssertionError(actual, expected);
				},
				/**
				 * actual이 expected의 부분 집합인지 확인합니다. actual의 모든 속성과 값이 expected에 존재해야 합니다.
				 * @memberof assert
				 * @param {*} actual
				 * @param {*} expected
				 */
				isSubsetOf: (actual, expected) => {
					if (typeof actual !== "object" || typeof expected !== "object") throw new AssertionError(actual, expected, "target should be 'object'.");
					if (
						(actual === null && expected !== null) || (actual !== null && expected === null)
					) throw new AssertionError(actual, expected);
					var entry_actual = Object.entries(actual);
					var entry_expected = Object.entries(expected);
					var check = entry_actual.every(entry => {
						var [key, value] = entry;
						return expected[key] === value;
					})
						;
					if (!check) throw new AssertionError(actual, expected);
				},
				/**
				 * actual이 expected의 속성들을 포함하는지 확인합니다. expected의 모든 속성과 값이 actual에 존재해야 합니다.
				 * @memberof assert
				 * @param {*} actual
				 * @param {*} expected
				 */
				containsOf: (actual, expected) => {
					if (typeof actual !== "object" || typeof expected !== "object") throw new AssertionError(actual, expected, "target should be 'object'.");
					if (
						(actual === null && expected !== null) || (actual !== null && expected === null)
					) throw new AssertionError(actual, expected);
					var entry_actual = Object.entries(actual);
					var entry_expected = Object.entries(expected);
					var check = entry_expected.every(entry => {
						var [key, value] = entry;
						return actual[key] === value;
					});
					if (!check) throw new AssertionError(actual, expected);
				},
				/**
				 * 사용자 정의 조건을 검증합니다.
				 * @memberof assert
				 * @param {function(): boolean} predicate - 조건을 검증하는 함수
				 */
				condition: (predicate) => {
					var result = predicate();
					if (!result) throw new AssertionError(false, true);
				}
			}
		})();
	}

	/**
	 * 새로운 테스트 케이스를 등록하고 실행합니다.
	 * * **사용 방법:**
	 * 전달받은 `testCode` 콜백 함수 내에서 인자로 주어지는 **`assert` 객체(테스트 단언문)**를
	 * 사용하여 로직의 유효성을 검증해야 합니다. 단언문이 실패하여 에러를 던지면
	 * 해당 테스트는 '실패(fail)'로 기록됩니다.
	 * * @param {Function(Object): (void|Promise<void>)} testCode - 실행할 테스트 로직.
	 * 매개변수로 `this._assert` 객체를 전달받아 테스트 단언을 수행해야 합니다.
	 * @param {string} description - 테스트의 목적이나 기댓값에 대한 설명
	 * @returns {Promise<TestResult>} 테스트 결과 객체를 반환하는 프로미스
	 * * @example
	 * suite.test((assert) => {
	 * const result = add(1, 2);
	 * assert.equals(result, 3); // assert 객체를 사용하여 테스트 진행
	 * }, "1 더하기 2는 3이어야 함");
	 */
	test(testCode, description) {
		this._setup();
		var promise = this._beforeAllPromise.then(() => {
			return new Promise(async (testPromiseResolve) => {
				var testId = this._sequence++;
				var result;
				var start = window.performance.now();
				var error = null;
				var testInfo = {
					testId, start, testCode, description
				}
				try {
					await (async () => this._beforeEach(testInfo))();
					await testCode(this._assert);
					result = true;
				} catch (err) {
					result = false;
					err.cause = Object.assign({ testCode }, err.cause);
	      if (AssertionError.prototype.isPrototypeOf(err)) {
	        error = new AssertionError(err.actual, err.expected, err.message, err);
	      } else {
	        error = new AssertionError(null, null, err.message, err);
	      }
				} finally {
					var end = window.performance.now();
					var duration = end - start;
					testInfo.end = end;
					await (async () => this._afterEach(testInfo))();
					testPromiseResolve(new TestResult(testId, result, testCode, error, duration, description));
				}
			});
		});
		this._tests.push(promise);
		return promise;
	}

	/**
	 * 등록된 모든 테스트의 실행이 완료될 때까지 기다린 후 요약 결과를 반환합니다.
	 * @returns {Promise<{testSuiteName: string, runs: TestResult[], passed: TestResult[], failed: TestResult[]}>}
	 */
	async result() {
		var ordered = (await Promise.all(this._tests)).slice().sort((testResult1, testResult2) => testResult1.id - testResult2.id);
		await this._teardown();
		return {
			testSuiteName: this._testSuiteName,
			runs: ordered.slice(),
			passed: ordered.filter(testResult => testResult.result),
			failed: ordered.filter(testResult => !testResult.result)
		}
	}

	/**
	 * @param {Function} handler
	 */
	set beforeEach (handler) {
		if (typeof handler !== "function") throw new Error("IllegalArgument::: beforeEach handler must be a function");
		this._beforeEach = handler;
	}
	/**
	 * @param {Function} handler
	 */
	set afterEach (handler) {
		if (typeof handler !== "function") throw new Error("IllegalArgument::: afterEach handler must be a function");
		this._afterEach = handler;
	}
	/**
	 * @param {Function} handler
	 */
	set beforeAll (handler) {
		if (typeof handler !== "function") throw new Error("IllegalArgument::: beforeAll handler must be a function");
		if (this._isInitialized) return false;
		this._beforeAll = handler;
		this._isInitialized = false;
		return true;
	}
	/**
	 * @param {Function} handler
	 */
	set afterAll (handler) {
		if (typeof handler !== "function") throw new Error("IllegalArgument::: afterAll handler must be a function");
		if (this._isCleanedUp) return false;
		this._afterAll = handler;
		this._isCleanedUp = false;
		return true;
	}

	_setup () {
		if (this._isInitialized) return;
		this._isInitialized = true;
		this._beforeAllPromise = Promise.resolve(this._beforeAll());

	}
	async _teardown () {
		if (this._isCleanedUp) return;
this._isCleanedUp = true;
		this._afterAllPromise = await Promise.resolve(this._afterAll());
		
	}
}