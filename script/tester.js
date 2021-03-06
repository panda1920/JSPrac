//////////
// tester.js
// some classes and objets to make testing easier for me
//////////

// holds test result of a test case
// reference to test case
class TestResult {
    constructor(testcase) {
        this.testcase = testcase;
        this.isExecuted = false;
        this.executionTime = null;
        this.testPassed = false;
        this.testReturned = null;
    }

    // execute test case through this method
    // so it can do some book-keeping
    recordResultWhileTesting() {
        this.isExecuted = true;
        
        let t1 = Date.now();
        this.testcase.run();
        let t2 = Date.now();

        this.executionTime = t2 - t1;
    }
    pass() {
        this.testPassed = true;
    }
    fail() {
        this.testPassed = false;
    }
    getTestResultString() {
        if (!this.isExecuted) {
            return this.testcase.getTestConditionString() + " is not executed yet";
        }
        else {
            let resultString = this.testcase.getTestConditionString() + " has " + (this.testPassed ? "succeeded!" : "failed!");
            if (!this.testPassed) {
                resultString += " Received " + this.testReturned;
            }
            return resultString;
        }
    }
    getExecutionTimeString() {
        return `Execution time: ${this.executionTime}ms`;
    }
}

// a class to run a specific testcase
class TestCase {
    constructor(func, context, args, expectedVal) {
        this.func = func;
        this.context = context;
        this.args = args;
        this.expectedVal = expectedVal;
        this.result = new TestResult(this);
    }

    // run testcase
    // not to be invoked directly
    run() {
        let isPassed = false;
        try {
            this.result.testReturned = this.func.apply(this.context, this.args);
            isPassed = this.result.testReturned === this.expectedVal;
        }
        catch (e) {console.warn(e.message)};
        isPassed ? this.result.pass() : this.result.fail();
    }
    // run test case through this method so result could do additional book-keeping
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
                msg += result.testPassed ? "succeeded!\n" : "failed!\n";
                msg += result.getExecutionTimeString();
            console.log(msg);
        });
    }
}

// add test case
// 1st argument: function to test
// 2nd argument: the context to run function under
// 3rd argument: args to pass to function
// 4th argument: expected return value
function addTest(func, context, args, returnValue) {
    testRunner.testCases.push(new TestCase(func, context, args, returnValue));
}

// makes a test case that checks if func throws exception
function testThrow(func, context, args, exception) {
    // create a wrapper function around func
    let wrapperThrowTestFunc = (func, context, args, exception) => {
        try {
            func.apply(context, args);
        }
        catch (e) {
            // compare exception type
            return (e instanceof exception.constructor) && (e.message === exception.message);
        }
        // if no exceptino is thrown, return false
        return false;
    };

    addTest(wrapperThrowTestFunc, [func, context, args, exception], true);
}