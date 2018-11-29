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
        this.testPassed = this.testcase.run();
        let t2 = Date.now();

        this.executionTime = t2 - t1;
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
        let retVal;
        try {
            retVal = func.apply(null, args);
        }
        catch (e) {

        }
        return retVal === this.expectedVal;
    }
    runTest() {
        this.result.recordResultWhileTesting();
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
                msg += `Execution time: ${result.executionTime}ms`;
            console.log(msg);
        });
    }
}
