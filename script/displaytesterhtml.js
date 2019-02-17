//////////
// output testResults to html
//////////

// runTest() related functions ------------------------------------

// event fired when button is pressed
function runTest(evt) {
    runTestRunner();
    createResultHtml();
    createOverallResultHtml();
    displayResult();
}
// run test cases
function runTestRunner() {
    testRunner.run();
}
// create html for testResult
function createResultHtml() {
    let resultSpace = findById("testResult");
    emptyElement(resultSpace);
    
    // make a div tag for each testcase and append to #testResult
    testRunner.testCases.forEach(testCase => {
        resultSpace.appendChild(createTestCaseHtml(testCase.result));
    });
}
// create html for overall result
function createOverallResultHtml() {
    findById("testPercent").textContent = createPassPercentageString(testRunner.testCases);
    findById("testNums").textContent = createTestNumString(testRunner.testCases);
    findById("totalTime").textContent = createTotalTimeString(testRunner.testCases);
}
function createPassPercentageString(testCases) {
    let passCount = 0;
    let failCount = 0;

    testCases.forEach(testCase => {
        testCase.result.testPassed ? passCount++ : failCount++;
    });

    let totalCount  = passCount + failCount;
    let passPercent = passCount / totalCount * 100;

    return `${passPercent}% of tests passed!`;
}
// create text for test numbers
function createTestNumString(testCases) {
    let passCount = 0;
    let failCount = 0;
    testCases.forEach(testCase => {
        testCase.result.testPassed ? passCount++ : failCount++;
    });

    return `Passed Tests: ${passCount}\r\nFailed Tests: ${failCount}`;
}
// create text for total time executed
function createTotalTimeString(testCases) {
    let totalTime = testCases.reduce(
        (accum, testCase) => {
            let executionTime = testCase.result.executionTime;
            if (executionTime === null) excecutionTime = 0;
            return accum + executionTime;
        }, 0
    );

    return `Total Execution time: ${totalTime}ms`;
}
// display the result
function displayResult() {
    let resultSpace = findById("testResult");
    let numTestCase = testRunner.testCases.length;
    
    if (numTestCase === 0)
        resultSpace.style.display = "none;"
    else
        resultSpace.style.display = "block";
}
// empty element
function emptyElement(element) {
    element.textContent = "";
}
// create html element for testcase result
function createTestCaseHtml(result) {
    let text = result.getTestResultString();
    return createDiv(text, null);
}

// Utility functions ------------------------------------

// creates a div element with attribute of choice
function createDiv(text, attributes) {
    let divElement = document.createElement("div");
        divElement.textContent = text;

    for (let property in attributes) {
        divElement.setAttribute(property, attributes[property]);
    }
    return divElement;
}

// find element by id
function findById(idString) {
    return document.getElementById(idString);
}


function initializePage() {
    addEvents();
}
function addEvents() {
    let myButton = document.getElementById("startTest");
    myButton.addEventListener("click", runTest);
}

document.addEventListener("DOMContentLoaded", initializePage);