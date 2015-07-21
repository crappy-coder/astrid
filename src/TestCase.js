import Event from "./Event";
import { ValueOrDefault } from "./Engine";

var TestCaseStatus = {
	"INVALID": 0,
	"SUCCESS": 1,
	"FAILED": 2
};

class TestCaseEvent extends Event {
	constructor(type, testName, bubbles, cancelable) {
		super(type, bubbles, cancelable);

		this.testName = testName;
	}

	getTestName() {
		return this.testName;
	}
}

Object.assign(TestCaseEvent, {
	TEST_COMPLETED: "testCompleted",
	TEST_FAILED: "testFailed",
	FAILED: "failed",
	COMPLETED: "completed"
});

class TestCase extends EventDispatcher {
	constructor(name, continueOnFailure) {
		super();

		this.tests = [];
		this.name = name;
		this.continueOnFailure = ValueOrDefault(continueOnFailure, true);
		this.reportToConsole = true;
		this.testItemMessage = null;
		this.status = TestCaseStatus.INVALID;
	}

	getStatus() {
		return this.status;
	}

	getTests() {
		return this.tests;
	}

	getContinueOnFailure() {
		return this.continueOnFailure;
	}

	setContinueOnFailure(value) {
		this.continueOnFailure = value;
	}

	getReportToConsole() {
		return this.reportToConsole;
	}

	setReportToConsole(value) {
		this.reportToConsole = value;
	}

	add(name, func /*...*/) {
		var argArr = [];

		for (var i = 2; i < arguments.length; ++i) {
			argArr.push(arguments[i]);
		}

		this.tests.push({name: name, callback: func, args: argArr});
	}

	clear() {
		this.tests = [];
	}

	run() {
		var len = this.tests.length;
		var testItem = null;
		var result = false;
		var resultsTable = [];
		var timeStart = null;
		var timeEnd = null;

		this.status = TestCaseStatus.SUCCESS;

		for (var i = 0; i < len; ++i) {
			testItem = this.tests[i];

			timeStart = new Date();
			result = testItem.callback.apply(this, testItem.args);
			timeEnd = new Date();

			if (!result) {
				resultsTable.push(this.createResultItem(testItem.name, "FAIL", timeEnd - timeStart));

				this.status = TestCaseStatus.FAILED;
				this.dispatchEvent(new TestCaseEvent(TestCaseEvent.TEST_FAILED, testItem.name));

				if (!this.getContinueOnFailure()) {
					break;
				}
			}
			else {
				resultsTable.push(this.createResultItem(testItem.name, "PASS", timeEnd - timeStart));

				this.dispatchEvent(new TestCaseEvent(TestCaseEvent.TEST_COMPLETED, testItem.name));
			}

			this.testItemMessage = null;
		}

		if (this.getReportToConsole() && resultsTable.length > 0) {
			console.table(resultsTable);
		}

		if (this.status == TestCaseStatus.SUCCESS) {
			this.dispatchEvent(new TestCaseEvent(TestCaseEvent.COMPLETED, this.name));
		}
		else {
			this.dispatchEvent(new TestCaseEvent(TestCaseEvent.FAILED, this.name));
		}

		return (this.status == TestCaseStatus.SUCCESS);
	}

	createResultItem(testName, status, time) {
		return {testName: testName, result: status, "executionTime (ms)": time, log: this.testItemMessage};
	}
}

export default TestCase;
