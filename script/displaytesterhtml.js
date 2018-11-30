// output testResults to html

function runTestRunner() {
    testRunner.run();
}
function displayResultOnHtml() {
    let resultSpace = document.getElementById("testResult");
    // make a div tag for each testcase and append to #testResult
    testRunner.testCases.forEach(testCase => {
        testresult = testCase.result;

        let testcaseHTML = document.createElement("div");
            testcaseHTML.innerHTML = testresult.getTestResultString();
        resultSpace.appendChild(testcaseHTML);
    });
    testRunner.printResult();
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