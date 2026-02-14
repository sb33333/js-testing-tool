class TestResult {
	constructor (id, result, testCode, errorInfo, duration, description) {
		if(isNaN(id)) throw new Error("id should be numeric value.", {cause:{id}});
		this._id = id;
		this._result = (result ? true: false);
		this._testCode = testCode;
		this._errorInfo = errorInfo;
		this._duration=duration;
		this._description = description;
	}
	// getters
}

class AssertionError extends Error {
	constructor(actual, expected, message, cause) {
		var _actual = actual;
		var _expected = expected;
		var actual_typeof = (typeof actual === "object");
		var expected_typeof  = (typeof expected === "object");
		var actual_serialize = (actual_typeof) ? JSON.stringify(_actual, null, 2) : _actual;
		var expected_serialized = (expected_typeof) ? JSON.stringify (_expected, null, 2) : _expected;
		var _message = message || `actual:::${actual_serialized}\nexpected:::${expected_serialized}`;

		var _cause = {};
		if (cause) _cause = Object.assign(cause);
		_cause = Object.assign(_cause, {
			actual:(actual_typeof)? JSON.parse(actual_serialized):_actual,
			expected: (expected_typeof) ?JSON.parse(expected_serialized):_expected});
			super(_message, {cause: _cause});
			this._actual = _actual;
			this._expected = _expected;
			this._actual_typeof = actual_typeof;
			this._actual_serialized = actual_serialized;
			this._expected_typeof = expected_typeof;
			this._expected_serialized = expected_serialized;
		}

		static of (assertionError) {
			var {actual, expected, message, cause} = assertionError;
			return new AssertionError(actual, expected, message, cause);
		}

		get actual () {return this._actual;}
		get expected() {return this._expected;}
		get serialized () {return {
			actual: this._actual_serialized,
			expected: this._expected_serialized
		}
	}
}

class Testing{
	constructor (testingName) {
		this._testingName = testingName||"Test";
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
	async result() {
		var orderd = (await Promise.all(this._tests)).slice().sort((testResult1, testResult2) => testResult1.id - testResult2.id);
		return {
			testingName: this._testingName,
			runs: orderd.slice(),
			passed: ordered.filter(testResult => testResult.result),
			failed: ordered.filter(testResult => !testResult.result)
		}
	}
}

class Reporter {
	static get DURATION () {
		return 1000;
	}
	static generate(testData) {
		throw new Error("not implemented");
	}
}

class HtmlReporter extends Reporter {
	//...
}

class ConsoleReporter extends Reporter {
	// ...
}