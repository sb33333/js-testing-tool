"use strict";

import TestSuite from "../src/test-suite.js";
import { HtmlReporter, ConsoleReporter } from "../src/reporter.js";


(async()=>{
	const testSuite = new TestSuite("Example Test Suite");
	testSuite.test(assert => {
		const a = 1 + 1;
		assert.equals(a, 2);
	}, "Simple addition test");

	testSuite.test(assert => {
		const obj1 = { name: "Alice", age: 30 };
		const obj2 = { name: "Alice", age: 30 };
		assert.condition(() => obj1 !== obj2);
		assert.hasEqualProperties(obj1, obj2);
	}, "Object property equality test");

	testSuite.test(assert => {
		assert.equals(1, 2);
	}, "Should fail.");

	testSuite.test(assert => {
		const obj1 = { name: "Alice", age: 30 };
		const obj2 = { name: "Alice", age: 31 };
		assert.hasEqualProperties(obj1, obj2);
	}, "Should fail(Object property equality test)");

	var testResultDiv = document.getElementById("testResult");
	const reportHtml = await HtmlReporter.generate(testSuite);
	testResultDiv.innerHTML = reportHtml;
	ConsoleReporter.generate(testSuite);
})();