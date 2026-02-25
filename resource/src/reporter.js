import TestSuite from "./test-suite.js";
/**
 * 테스트 결과 리포팅을 위한 베이스 추상 클래스입니다.
*/
class Reporter {
	/**
	 * @returns {number} 느린 테스트를 판단하는 기준 시간 (ms)
	*/
	static get DURATION () {
		return 1000;
	}
	/**
	 * 리포트를 생성합니다. 하위 클래스에서 구현해야 합니다.
	 * @param {TestSuite} testSuite - 결과를 추출할 테스트 스위트 인스턴스
	*/
	static generate(testSuite) {
		throw new Error("not implemented");
	}
}

/**
 * 테스트 결과를 HTML 양식으로 변환하는 리포터 클래스입니다.
 * @extends Reporter
 * @description AI로 생성되고 일부 수정됨.
*/
class HtmlReporter extends Reporter {
	/**
	 * TestSuite 결과를 바탕으로 HTML 리포트 문자열을 생성합니다.
	 * @param {TestSuite} testSuite - 결과를 추출할 테스트 스위트 인스턴스
	 * @returns {Promise<string>} 생성된 HTML 문자열
	*/
	static async generate(testSuite) {
		const testData = await testSuite.result();
		const { testSuiteName, runs, passed, failed } = testData;

		const rows = runs.map(test => {
			//const { actual, expected } = this._parseAssertion(test.message);
			const { actual, expected } = test?.errorInfo?.serialized || {};
			const isSlow = test.duration > 1000;

			return `
				<div class="test-item ${test.result ? 'pass' : 'fail'}">
					<div class="test-header">
					<div>
						<span class="status-badge">${test.result ? 'PASS' : 'FAIL'}</span>
						<span class="test-id">#${test.id}</span>
						<strong class="test-desc">${this._escapeHtml(test.description || 'No description')}</strong>
					</div>
					<span class="duration ${isSlow ? 'slow' : ''}">${test.duration.toFixed(2)}ms</span>
					</div>

					<div class="test-details">
					<div class="label">Test Code:</div>
					<pre><code>${this._escapeHtml(test.testCode.toString())}</code></pre>

					${!test.result ? `
						<div class="error-container">
						<div class="label">Failure Details:</div>
						<table class="diff-table">
							<tr><th>Expected</th><td class="expected">${this._escapeHtml(expected || 'N/A')}</td></tr>
							<tr><th>Actual</th><td class="actual">${this._escapeHtml(actual || 'N/A')}</td></tr>
						</table>
						<div class="full-message">${this._escapeHtml(test.errorInfo.message)}</div>
						</div>
					` : ''}
					</div>
				</div>
				`}).join('')
			;
			return `
		<div class="test-report">
			<style>
			/* 기존 스타일 유지 및 추가 */
			.test-report { font-family: 'Segoe UI', system-ui, sans-serif; max-width: 900px; margin: 20px auto; border: 1px solid #ddd; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.1); }
			.report-header { background: #2d3436; color: white; padding: 25px; }
			.summary-cards { display: flex; gap: 15px; margin-top: 15px; }
			.card { background: rgba(255,255,255,0.1); padding: 10px 20px; border-radius: 8px; text-align: center; }

			.test-item { border-bottom: 1px solid #eee; padding: 20px; }
			.test-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }

			.status-badge { padding: 4px 10px; border-radius: 20px; font-size: 10px; font-weight: bold; color: white; text-transform: uppercase; vertical-align: middle; }
			.pass .status-badge { background: #00b894; }
			.fail .status-badge { background: #d63031; }

			.test-id { color: #b2bec3; font-family: monospace; font-size: 14px; margin: 0 8px; }
			.test-desc { font-size: 16px; color: #2d3436; }

			.duration { font-family: monospace; font-size: 13px; color: #636e72; }
			.duration.slow { color: #e17055; font-weight: bold; }

			.label { font-size: 11px; color: #b2bec3; font-weight: bold; margin-bottom: 5px; text-transform: uppercase; margin-top: 10px; }
			pre { background: #f8f9fa; border-radius: 6px; padding: 12px; font-size: 13px; margin: 0; overflow-x: auto; border: 1px solid #dfe6e9; color: #2d3436; }

			.error-container { margin-top: 15px; background: #fff5f5; border: 1px solid #fab1a0; border-radius: 6px; padding: 15px; }
			.diff-table { width: 100%; border-collapse: collapse; margin-bottom: 10px; font-size: 14px; }
			.diff-table th { text-align: left; width: 100px; color: #636e72; padding: 5px; }
			.diff-table td { font-family: monospace; padding: 5px; border-radius: 3px; }
			.expected { background: #e3fcef; color: #008a52; font-weight: bold; }
			.actual { background: #ffe9e9; color: #bf2600; font-weight: bold; }
			.full-message { font-size: 12px; color: #95a5a6; white-space: pre-wrap; margin-top: 10px; padding-top: 10px; border-top: 1px dashed #fab1a0; }
			</style>

			<div class="report-header">
			<h1 style="margin:0; font-size: 24px;">🧪 ${testSuiteName}</h1>
			<div class="summary-cards">
				<div class="card">Total: <strong>${runs.length}</strong></div>
				<div class="card" style="color: #55efc4">Passed: <strong>${passed.length}</strong></div>
				<div class="card" style="color: #ff7675">Failed: <strong>${failed.length}</strong></div>
			</div>
			</div>
			<div class="report-body">${rows}</div>
		</div>
	`;
	}

	/**
	 * HTML 특수 문자를 이스케이프 처리합니다.
	 * @param {string|*} str - 치환할 문자열
	 * @returns {string} 안전하게 변환된 문자열
	 * @private
	*/
	static _escapeHtml(str) {
		if (!str) return "";
		return str.toString().replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]));
	}
}

/**
 * 테스트 결과를 브라우저 개발자 도구 콘솔에 출력하는 리포터 클래스입니다.
 * @extends Reporter
 * @description AI로 생성되고 일부 수정됨.
*/
class ConsoleReporter extends Reporter {

	/**
	 * 테스트 결과를 콘솔에 포맷팅하여 출력합니다.
	 * @param {TestSuite} testSuite - 결과를 추출할 테스트 스위트 인스턴스
	 * @returns {Promise<void>}
	*/
	static async generate(testSuite) {
		const testData = await testSuite.result();
		const { testSuiteName, runs, passed, failed } = testData;

		console.log(`\n%c 🧪 Test Suite: ${testSuiteName} `, "background: #2d3436; color: #dfe6e9; font-size: 14px; font-weight: bold; padding: 4px; border-radius: 4px;");
		console.log(
			`Summary: %c${passed.length} Passed%c, %c${failed.length} Failed %c(${runs.length} Total)`,
			"color: #2ecc71; font-weight: bold", "color: inherit",
			"color: #e74c3c; font-weight: bold", "color: inherit"
		);

		runs.forEach(test => {
			const { id, result, testCode, errorInfo, duration, description } = test;
			const statusIcon = result ? "✅" : "❌";

			const durationStyle = duration > 100 ? "color: #e67e22; font-weight: bold;" : "color: #95a5a6;";
			const labelStyle = result ? "color: #2ecc71;" : "color: #e74c3c; font-weight: bold;";

			// [아이콘] Test #id: 설명 (소요시간) 형태로 출력
			console.groupCollapsed(
				`${statusIcon} %cTest #${id}: %c${description || 'No description'} %c(${duration.toFixed(2)}ms)`,
				"color: #636e72;", // id 스타일
				labelStyle,        // description 스타일 (성공/실패 색상 적용)
				durationStyle      // 시간 스타일
			);

			console.log("%c[Test Code]", "color: #3498db; font-weight: bold;");
			console.log(testCode);

			if (!result) {
				console.log("%c[Failure Details]", "color: #e67e22; font-weight: bold;");
				this._logDiff(errorInfo);
			}

			console.groupEnd();
		});
		console.log("\n");
	}

	/**
	 * 기대값과 실제값의 차이(Diff)를 콘솔에 출력합니다.
	 * @param {Object} err - AssertionError 또는 에러 정보 객체
	 * @private
	 */
	static _logDiff(err) {
		const {actual, expected} = err?.serialized || {};
		if (actual && expected) {
			console.log(`  Expected: %c${expected}`, "color: #2ecc71; background: #e3fcef; padding: 2px;");
			console.log(`  Actual:   %c${actual}`, "color: #d63031; background: #ffe9e9; padding: 2px;");
		}
		console.error(` ${err.cause.stack}`);
	}
}


export {
	HtmlReporter,
	ConsoleReporter,
	Reporter,
}