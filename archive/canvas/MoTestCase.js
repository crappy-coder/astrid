MoTestCaseStatus = {
	// @PRIVATE
	"INVALID" : 0,
	"SUCCESS" : 1,
	"FAILED" : 2
};

MoTestCaseEvent = Class.create(MoEvent, 
// @PRIVATE
{
	initialize : function($super, type, testName, bubbles, cancelable) {
		$super(type, bubbles, cancelable);

		this.testName = testName;
	},

	getTestName : function() {
		return this.testName;
	}
});

Object.extend(MoTestCaseEvent, 
// @PRIVATE
{
	TEST_COMPLETED : "testCompleted",
	TEST_FAILED : "testFailed",
	FAILED : "failed",
	COMPLETED : "completed"
});

swTestCase = Class.create(MoEventDispatcher, 
// @PRIVATE
{
	initialize : function($super, name, continueOnFailure) {
		$super();

		this.tests = [];
		this.name = name;
		this.continueOnFailure = MoValueOrDefault(continueOnFailure, true);
		this.reportToConsole = true;
		this.testItemMessage = null;
		this.status = MoTestCaseStatus.INVALID;
	},

	getStatus : function() {
		return this.status;
	},

	getTests : function() {
		return this.tests;
	},

	getContinueOnFailure : function() {
		return this.continueOnFailure;
	},

	setContinueOnFailure : function(value) {
		this.continueOnFailure = value;
	},

	getReportToConsole : function() {
		return this.reportToConsole;
	},

	setReportToConsole : function(value) {
		this.reportToConsole = value;
	},

	add : function(name, func /*...*/) {
		var argArr = [];

		for(var i = 2; i < arguments.length; ++i)
			argArr.push(arguments[i]);

		this.tests.push({name:name, callback:func, args:argArr});
	},

	clear : function() {
		this.tests = [];
	},

	run : function() {
		var len = this.tests.length;
		var testItem = null;
		var result = false;
		var resultsTable = [];
		var timeStart = null;
		var timeEnd = null;

		this.status = MoTestCaseStatus.SUCCESS;

		for(var i = 0; i < len; ++i)
		{
			testItem = this.tests[i];
			
			timeStart = new Date();
			result = testItem.callback.apply(this, testItem.args);
			timeEnd = new Date();

			if(!result)
			{
				resultsTable.push(this.createResultItem(testItem.name, "FAIL", timeEnd - timeStart));

				this.status = MoTestCaseStatus.FAILED;
				this.dispatchEvent(new MoTestCaseEvent(MoTestCaseEvent.TEST_FAILED, testItem.name));

				if(!this.getContinueOnFailure())
					break;
			}
			else
			{
				resultsTable.push(this.createResultItem(testItem.name, "PASS", timeEnd - timeStart));

				this.dispatchEvent(new MoTestCaseEvent(MoTestCaseEvent.TEST_COMPLETED, testItem.name));
			}

			this.testItemMessage = null;
		}

		if(this.getReportToConsole() && resultsTable.length > 0)
			console.table(resultsTable);

		if(this.status == MoTestCaseStatus.SUCCESS)
			this.dispatchEvent(new MoTestCaseEvent(MoTestCaseEvent.COMPLETED, this.name));
		else
			this.dispatchEvent(new MoTestCaseEvent(MoTestCaseEvent.FAILED, this.name));

		return (this.status == MoTestCaseStatus.SUCCESS);
	},

	createResultItem : function(testName, status, time) {
		return {testName:testName, result:status, "executionTime (ms)":time, log:this.testItemMessage};
	}
});