export default class AssertionError extends Error {
	constructor(actual, expected, message, cause) {
		var _actual = actual;
		var _expected = expected;
		var actual_typeof = (typeof actual === "object");
		var expected_typeof  = (typeof expected === "object");
		var actual_serialized = (actual_typeof) ? JSON.stringify(_actual, null, 2) : _actual;
		var expected_serialized = (expected_typeof) ? JSON.stringify (_expected, null, 2) : _expected;
		var _message = message || `actual:::${actual_serialized}\nexpected:::${expected_serialized}`;

		var _cause = {};
		if (cause) _cause = Object.assign(cause);
		_cause = Object.assign(
			_cause,
			{
				actual:(actual_typeof)? JSON.parse(actual_serialized):_actual,
				expected: (expected_typeof) ?JSON.parse(expected_serialized):_expected
			}
		);
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
	get serialized () {
		return {
			actual: this._actual_serialized,
			expected: this._expected_serialized
		}
	}
}