import AssertionError from "./assertion-error.js";
import TestResult from "./test-result.js";

export default class TestSuite{
	constructor (testSuiteName) {
		this._testSuiteName = testSuiteName||"Test";
		this._sequence = 0;
		this._tests = [];
		this._assert = (() => {
			return {
				equals: (actual, expected) => {
					if (actual !== expected) throw new AssertionError(actual, expected);
				},
				hasEqualProperties: (actual, expected) => {
					if(typeof actual !== "object" || typeof expected !== "object") throw new AssertionError(actual, expected, "target should be 'object'.");
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
						var [key,value] = entry;
						return actual[key] === value;
					})
					;
					if (!check) throw new AssertionError(actual, expected);
				},
				isSubsetOf:(actual, expected) => {
					if(typeof actual !== "object" || typeof expected !== "object") throw new AssertionError(actual, expected, "target should be 'object'.");
					if (
						(actual === null && expected !== null) || (actual !== null && expected === null)
					) throw new AssertionError(actual, expected);
					var entry_actual = Object.entries(actual);
					var entry_expected = Object.entries(expected);
					var check = entry_actual.every(entry => {
						var [key,value] =entry;
						return expected[key] === value;
					})
					;
					if(!check) throw new AssertionError(actual, expected);
				},
				containsOf : (actual, expected) => {
					if(typeof actual !== "object" || typeof expected !== "object") throw new AssertionError(actual, expected, "target should be 'object'.");
					if (
						(actual === null && expected !== null) || (actual !== null && expected === null)
					) throw new AssertionError(actual, expected);
					var entry_actual = Object.entries(actual);
					var entry_expected = Object.entries(expected);
					var check = entry_expected.every(entry => {var [key,value] = entry;
						return actual[key]===value;
					});
					if (!check) throw new AssertionError(actual, expected);
				},
				condition: (predicate) => {
					var result = predicate();
					if (!result) throw new AssertionError(false, true);
				}
			}
		})();
	}
	test (testCode, description) {
		var promise = new Promise(async (testPromiseResolve) => {
			var testId = this._sequence++;
			var result;
			var start = window .performance.now();
			var error =null;
			try {
				await testCode(this._assert);
				result = true;
			} catch (err) {
				result = false;
				err.cause = Object.assign({testCode}, err.cause);
				error = AssertionError.of(err);
			} finally {
				var duration = window.performance.now() -start;
				testPromiseResolve(new TestResult(testId, result, testCode, error, duration, description));
			}
		});
		this._tests.push(promise);
		return promise;
	}
	/**
	 * @returns {Promise<{testSuiteName: string, runs: TestResult[], passed: TestResult[], failed: TestResult[]}>}
	 */
	async result() {
		var ordered = (await Promise.all(this._tests)).slice().sort((testResult1, testResult2) => testResult1.id - testResult2.id);
		return {
			testSuiteName: this._testSuiteName,
			runs: ordered.slice(),
			passed: ordered.filter(testResult => testResult.result),
			failed: ordered.filter(testResult => !testResult.result)
		}
	}
}