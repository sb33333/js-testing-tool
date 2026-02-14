export default class TestResult {
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