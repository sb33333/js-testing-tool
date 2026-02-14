/**
 * 테스트 단언(Assertion) 실패 시 발생하는 커스텀 에러 클래스입니다.
 * 실제 값과 기대 값을 저장하고, 이를 직렬화하여 상세한 에러 메시지를 제공합니다.
 * * @extends Error
 */
export default class AssertionError extends Error {
	/**
	 * AssertionError 인스턴스를 생성합니다.
	 * @param {*} actual - 실제 결과값
	 * @param {*} expected - 기대했던 결과값
	 * @param {string} [message] - 출력할 에러 메시지 (생략 시 기본 형식 사용)
	 * @param {Object} [cause] - 에러의 원인이 되는 추가 정보 객체
	 */
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

	/**
	 * 일반 객체나 기존 에러 객체로부터 AssertionError 인스턴스를 생성하는 정적 팩토리 메서드입니다.
	 * @param {Object} assertionError - 에러 정보를 담은 객체
	 * @param {*} assertionError.actual - 실제 값
	 * @param {*} assertionError.expected - 기대 값
	 * @param {string} assertionError.message - 메시지
	 * @param {Object} [assertionError.cause] - 원인 객체
	 * @returns {AssertionError} 새로운 AssertionError 인스턴스
	 */
	static of (assertionError) {
		var {actual, expected, message, cause} = assertionError;
		return new AssertionError(actual, expected, message, cause);
	}

	/** @returns {*} 원래의 실제 값 */
	get actual () {return this._actual;}
	/** @returns {*} 원래의 기대 값 */
	get expected() {return this._expected;}
	/**
	 * * 문자열로 직렬화된 실제 값과 기대 값을 반환합니다.
	 * @returns {{actual: string, expected: string}} 직렬화된 데이터 객체
	 */
	get serialized () {
		return {
			actual: this._actual_serialized,
			expected: this._expected_serialized
		}
	}
}