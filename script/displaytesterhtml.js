//////////
// output testResults to html
//////////

// run test cases
function runTestRunner() {
    testRunner.run();
}
// empty element
function emptyElement(element) {
    element.textContent = "";
}
function createTestCaseHtml(result) {
    let testcaseHTML = document.createElement("div");
        testcaseHTML.textContent = result.getTestResultString();
    return testcaseHTML;
}
// display result of each test case
function displayResultOnHtml() {
    let resultSpace = document.getElementById("testResult");
    emptyElement(resultSpace);
    
    // make a div tag for each testcase and append to #testResult
    testRunner.testCases.forEach(testCase => {
        resultSpace.appendChild(createTestCaseHtml(testCase.result));
    });
}
function runTest(evt) {
    runTestRunner();
    displayResultOnHtml();
}

function addEvents() {
    let myButton = document.getElementById("startTest");
    myButton.addEventListener("click", runTest);
}
document.addEventListener("DOMContentLoaded", addEvents);