/**
 * 단일 테스트 실행 결과를 저장하는 클래스입니다.
 */
export default class TestResult {
	/**
	 * TestResult 인스턴스를 생성합니다.
	 * @param {number} id - 테스트 고유 번호 (순번)
	 * @param {boolean} result - 성공 여부 (true: Pass, false: Fail)
	 * @param {Function} testCode - 실행된 테스트 코드 함수
	 * @param {AssertionError|null} errorInfo - 실패 시 발생한 에러 정보
	 * @param {number} duration - 실행 소요 시간 (ms)
	 * @param {string} description - 테스트에 대한 설명
	 */
	constructor (id, result, testCode, errorInfo, duration, description) {
		if(isNaN(id)) throw new Error("id should be numeric value.", {cause:{id}});
		this._id = id;
		this._result = (result ? true: false);
		this._testCode = testCode;
		this._errorInfo = errorInfo;
		this._duration = duration;
		this._description = description;
	}
	// getters
	get id () {
		return this._id;
	}
	get result () {
		return this._result;
	}
	get testCode () {
		return this._testCode;
	}
	get errorInfo () {
		return this._errorInfo;
	}
	get duration () {
		return this._duration;
	}
	get description () {
		return this._description;
	}
}