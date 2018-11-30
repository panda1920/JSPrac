//////////
// tester.js
// stores things used for testing code
//////////

// holds test result of a test case
// reference to test case
class TestResult {
    constructor(testcase) {
        this.testcase = testcase;
        this.isExecuted = false;
        this.executionTime = null;
        this.testPassed = false;
    }

    // execute test case through this method
    // so it can do some book-keeping irrelevant of the actual test
    recordResultWhileTesting() {
        this.isExecuted = true;
        
        let t1 = Date.now();
        this.testcase.run();
        let t2 = Date.now();

        this.executionTime = t2 - t1;
    }
    testPassed() {
        this.testPassed = true;
    }
    testFailed() {
        this.testPassed = false;
    }
    getTestResultString() {
        return this.testcase.getTestConditionString() + " has " + (this.testPassed ? "succeeded!" : "failed!");
    }
    getExecutionTimeString() {
        return `Execution time: ${this.executionTime}ms`;
    }
}

// a class to run a specific testcase
class TestCase {
    constructor(func, args, expectedVal) {
        this.func = func;
        this.args = args;
        this.expectedVal = expectedVal;
        this.result = new TestResult(this);
    }

    run() {
        let isPassed = false;
        try {
            let retVal = func.apply(null, args);
            isPassed = retVal === this.expectedVal;
        }
        catch (e) {}
        isPassed ? this.result.testPassed() : this.result.testFailed();
    }
    runTest() {
        this.result.recordResultWhileTesting();
    }
    getTestConditionString() {
        return `Test of ${this.func.name}() with args [${this.args}]`;
    }
}

// stores testcases to be run at a later time
let testRunner = {
    testCases: [],

    // run all testcases
    run: function() {
        this.testCases.forEach(testcase => {
            testcase.runTest();
        });
    },
    printResult: function() {
        this.testCases.forEach(testcase => {
            // pass if testcase not run yet
            let result = testcase.result;
            if (!result.isExecuted) return;

            // generate message to print
            let msg = `\nTest of ${testcase.func.name}() with args [${testcase.args}] has `;
                msg += result ? "succeeded!\n" : "failed!\n";
                msg += result.getExecutionTimeString();
            console.log(msg);
        });
    }
}
