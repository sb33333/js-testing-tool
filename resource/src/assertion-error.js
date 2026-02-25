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
	 * @param {Error} [nestedError] - 원인 에러
	 */
	constructor(actual, expected, message, cause) {
		var _actual = actual;
		var _expected = expected;
		var actual_typeof = (typeof actual === "object");
		var expected_typeof  = (typeof expected === "object");
		var actual_serialized = (actual_typeof) ? JSON.stringify(_actual, null, 2) : _actual;
		var expected_serialized = (expected_typeof) ? JSON.stringify (_expected, null, 2) : _expected;
		var _message = message || `actual:::${actual_serialized}\nexpected:::${expected_serialized}`;

		super(_message, {cause: nestedError});
		this._actual = _actual;
		this._expected = _expected;
		this._actual_typeof = actual_typeof;
		this._actual_serialized = actual_serialized;
		this._expected_typeof = expected_typeof;
		this._expected_serialized = expected_serialized;
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