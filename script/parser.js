//////////
// Chap 12 excercises
//////////

function skipSpace(string) {
    let nonStringIdx = string.search(/[^\s]/);
    return string.slice(nonStringIdx);
}

testRunner.testCases.push(new TestCase(skipSpace, ["Candy"], "Candy"));
testRunner.testCases.push(new TestCase(skipSpace, ["Some Candy"], "Some Candy"));
testRunner.testCases.push(new TestCase(skipSpace, ["CandyAfterSpace  "], "CandyAfterSpace  "));
testRunner.testCases.push(new TestCase(skipSpace, [" CandySingle"], "CandySingle"));
testRunner.testCases.push(new TestCase(skipSpace, ["  CandyDouble"], "CandyDouble"));

function parseExpression(program) {
    let programTrimmed = skipSpace(program);
    
    let {match, expr} = findPrimitive(programTrimmed);
    
    return parseApply(expr, program.slice(match[0].length));
}
function findPrimitive(program) {
    let match, expr;

    // string
    if (match = /^"([^"]*)"/.exec(program)) {
        expr = {type: "value", value: match[1]};
    }
    // number
    else if (match = /^\d+\b/.exec(program)) {
        expr = {type: "value", value: Number(match[0])};
    }
    // binding
    else if (match = /^[^\s(),#"]+/.exec(program)) {
        expr = {type: "word", name: match[0]};
    }
    else {
        throw new SyntaxError();
    }

    return {match, expr};
}

function findPrimitiveMatch(program) {
    return findPrimitive(program).match[0];
}
function findPrimitiveType(program) {
    return findPrimitive(program).expr.type;
}
function findPrimitiveValue(program) {
    return findPrimitive(program).expr.value;
}
function findPrimitiveName(program) {
    return findPrimitive(program).expr.name;
}

testRunner.testCases.push(new TestCase(findPrimitiveMatch, ["var"], "var"));
testRunner.testCases.push(new TestCase(findPrimitiveType, ["var"], "word"));
testRunner.testCases.push(new TestCase(findPrimitiveMatch, ["\"var\""], "\"var\""));
testRunner.testCases.push(new TestCase(findPrimitiveType, ["\"var\""], "value"));
testRunner.testCases.push(new TestCase(findPrimitiveMatch, ["2216"], "2216"));
testRunner.testCases.push(new TestCase(findPrimitiveType, ["2216"], "value"));
testRunner.testCases.push(new TestCase(findPrimitiveValue, ["2216"], 2216));
testRunner.testCases.push(new TestCase(findPrimitiveMatch, ["BBY2216"], "BBY2216"));
testRunner.testCases.push(new TestCase(findPrimitiveType, ["BBY2216"], "word"));
testRunner.testCases.push(new TestCase(findPrimitiveValue, ["BBY2216"], undefined));
testRunner.testCases.push(new TestCase(findPrimitiveMatch, ["2216AAB"], "2216AAB"));
testRunner.testCases.push(new TestCase(findPrimitiveType, ["2216AAB"], "word"));
testRunner.testCases.push(new TestCase(findPrimitiveValue, ["2216AAB"], undefined));
testRunner.testCases.push(new TestCase(findPrimitiveName, ["if("], "if"));
testRunner.testCases.push(new TestCase(findPrimitiveType, ["if("], "word"));

function parseApply(expression, restProgram) {
    let programTrimmed = skipSpace(restProgram);
    // was not an application
    if (programTrimmed[0] !=="(") {
        return {expr: expression, rest: restProgram};
    }
    // it is an application;
    // now we want to know the arguments to it
    programTrimmed = skipSpace(programTrimmed.slice(1));
    expression = {type: "apply", operator: expression, args: []};

    // start gathering the arguments until we find close bracket
    while (programTrimmed[0] !== ")") {
        // arguments are expressions; needs to be parsed
        let parsed = parseExpression(programTrimmed);
        expression.args.push(parsed.expr);
        programTrimmed = skipSpace(parsed.rest);

        // if we find a comma, consume it and continue the loop
        if (programTrimmed[0] === ",") {
            programTrimmed = skipSpace(programTrimmed.slice(1));
        }
        // if we don't find a closed bracket or comma after an argument
        // it must be some sort of syntax error
        else if (programTrimmed[0] !== ")") {
            throw new SyntaxError("Expected \",\" or \")\"");
        }
    }

    return parseApply(expression, programTrimmed.slice(1));
}

function parse(program) {
    let {expr, rest} = parseExpression(program);
    if (rest.length > 0) {
        throw new SyntaxError("Unexpected text after program");
    }

    return expr;
}

console.log(parse("if(equals(x,5),\"equals\",\"notequals\")"));