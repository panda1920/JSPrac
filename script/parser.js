//////////
// Chap 12 excercises
//////////

// slices string until it finds the first non-white space
function skipSpace(string) {
    let nonStringIdx = string.search(/[^\s]/);
    return string.slice(nonStringIdx);
}

addTest(skipSpace, null ["Candy"], "Candy");
addTest(skipSpace, null ["Some Candy"], "Some Candy");
addTest(skipSpace, null ["CandyAfterSpace  "], "CandyAfterSpace  ");
addTest(skipSpace, null [" CandySingle"], "CandySingle");
addTest(skipSpace, null ["  CandyDouble"], "CandyDouble");

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

addTest(findPrimitiveMatch, null ["var"], "var");
addTest(findPrimitiveType, null ["var"], "word");
addTest(findPrimitiveMatch, null ["\"var\""], "\"var\"");
addTest(findPrimitiveType, null ["\"var\""], "value");
addTest(findPrimitiveMatch, null ["2216"], "2216");
addTest(findPrimitiveType, null ["2216"], "value");
addTest(findPrimitiveValue, null ["2216"], 2216);
addTest(findPrimitiveMatch, null ["BBY2216"], "BBY2216");
addTest(findPrimitiveType, null ["BBY2216"], "word");
addTest(findPrimitiveValue, null ["BBY2216"], undefined);
addTest(findPrimitiveMatch, null ["2216AAB"], "2216AAB");
addTest(findPrimitiveType, null ["2216AAB"], "word");
addTest(findPrimitiveValue, null ["2216AAB"], undefined);
addTest(findPrimitiveName, null ["if("], "if");
addTest(findPrimitiveType, null ["if("], "word");

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

// the whole thing is an application of operator "if"
// which has 3 arguments: another applcation equals,
//     which has 2 arguments: value x and value 5
// the sting "equals" and "notequals"
// console.log(parse("if(equals(x,5),\"equals\",\"notequals\")"));

// defines functions which comprises keywords in Egg
let specialForms = {

}
// if
specialForms.if = function(args, scope) {
    if (args.length !== 3) {
        throw new SyntaxError("Wrong number of args to if");
    }
    else if (evaluate(args[0], scope)) {
        return evaluate(args[1], scope);
    }
    else {
        return evaluate(args[2], scope);
    }
}
// while
specialForms.while = function(args, scope) {
    if (args.length !== 2) {
        throw new SynraxError("Wrong number of args to while");
    }
    while(evaluate(args[0], scope) !== false) {
        evaluate(args[1], scope);
    }

    // Egg always expects to return a value
    return false;
}
// do
// evaluate statements from top to bottom
specialForms.do = function(args, scope) {
    let value = false;
    for (let arg of args) {
        value = evaluate(arg, scope);
    }
    // return the value of the last evaluated expression
    return value;
}
// define
// create bindings
specialForms.define = function(args, scope) {
    if (args.length !== 2 || args[1].type !== "word") {
        throw new SyntaxError("Incorrect use of define");
    }
    let value = evaluate(args[1], scope);
    scope[args[0].name] = value;
    return value;
}

// a function that evaluates an expression
// takes an argument,
// and scope object that defines available mapping for name to values
function evaluate(expr, scope) {
    // debugger;
    // process cases where expr is value
    if (expr.type === "value") {
        return expr.value;
    }
    // process cases where expr is word
    else if (expr.type === "word") {
        // look in the scope object to see if word is defined
        if (expr.name in scope) {
            return scope[expr.name];
        }
        else {
            throw new SyntaxError(`Undefined binding: ${expr.name}`);
        }
    }
    // process cases where expr is application
    else if (expr.type === "apply") {
        let {operator, args} = expr;
        // process keywords of Egg
        if ((operator.type === "word") && (operator.name in specialForms)) {
            return specialForms[operator.name](expr.args, scope);
        }
        
        // process function expressions
        let op = evaluate(operator, scope);
        if (typeof op === "function") {
            return op(...args.map(arg => evaluate(arg, scope)));
        }
        else {
            throw new TypeError("Applying a non-function");
        }
    }
}

// some quick function to create primitives
function createValue(value) {
    return {type: "value", value: value};
}
function createWord(word) {
    return {type: "word", name: word};
}
function createApply(operator, ...args) {
    return {type: "apply", operator: createWord(operator), args: args};
}

// evaluate number
addTest(
    evaluate,
    null,
    [
        createValue(12),
        null
    ],
    12
);
// evaluate string
addTest(
    evaluate,
    null,
    [
        createValue("SOMESTRING"),
        null
    ],
    "SOMESTRING"
);

// evaluate some bindings
addTest(
    evaluate,
    null,
    [
        createWord("var1"),
        {
            var1: 13
        }
    ],
    13
);

// check exception throwing when binding does not exist
testThrow(
    evaluate,
    null,
    [
        createWord("someVar"),
        {
            otherVar: 22
        }
    ],
    new SyntaxError("Undefined binding: someVar")
);

// applying a function
// trying to evaluate someFunc(2, 3);
addTest(
    evaluate,
    null,
    [
        createApply(
            "someFunc",
            createValue(2),
            createValue(3)
        ),
        {
            someFunc: function(v1, v2) {
                return v1 * v2;
            }
        }
    ],
    6
);

// testing if
addTest(
    evaluate,
    null,
    [
        createApply(
            "if",
            createValue("false"),
            createValue("true"),
            createValue("false")
        ),
        null
    ],
    "true"
);
// passing wrong number of arguments to if
testThrow(
    evaluate,
    null,
    [
        createApply(
            "if",
            createValue("true"),
            createValue(13)  
        ),
        {
            someFunc: function() { console.log("someFunc!"); }
        }
    ],
    new SyntaxError("Wrong number of args to if")
);

// applying a function that does not exist
testThrow(
    evaluate,
    null,
    [
        createApply(
            "anotherFunc",
            createValue("true"),
            createValue(13)  
        ),
        {
            someFunc: function() { console.log("someFunc!"); }
        }
    ],
    new SyntaxError("Undefined binding: anotherFunc")
)

// applying a non-function
testThrow(
    evaluate,
    null,
    [
        createApply(
            "somevar",
            createValue("ture"),
            createValue("aabbcc")
        ),
        {
            somevar: 13
        }
    ],
    new TypeError("Applying a non-function")
)

// object deconstruction
// let obj = {one: 1, two: 2, three: 3, four: 4};
// let {one, two} = obj;
// console.log(one, two); // outputs 1 2

// let {one, three} = obj;
// console.log(one, three); // outputs 1 3
// ignores properties that was not mentioned

// let {v, v2} = obj;
// console.log(v, v2); // outputs undefined undefined; must declare with the same name as property

// possible to bind property to a desired name
// let {one: v, four: v2} = obj;
// console.log(v, v2); // outputs 1 4

// add function definition capability in Egg
specialForms.fun = function(args, scope) {
    if (args.length === 0) {
        throw new SyntaxError("Function needs a body");
    }

    let funcBodyIdx = args.length - 1
    let funcBody = args[funcBodyIdx];
    let funcParams = args.slice(0, funcBodyIdx);

    // verify funcParams are all words
    funcParams = funcParams.map(param => {
        if (! param.type === "word") {
            throw new SyntaxError("Parameter name must be words");
        }

        return param.name;
    });

    // create function
    return function() {
        // check the number of arguments compared to parameters
        if (funcParams.length !== arguments.length) {
            throw new SyntaxError("Wrong number of arguments");
        }

        // setup local scope
        let localScope = Object.create(scope);
        // add all parameters to localScope
        for (let i = 0; i < arguments.length; ++i) {
            localScope[funcParams[i]] = arguments[i];
        }

        return evaluate(funcBody, localScope);
    };
};

// define glocalScope
let globalScope = {};
for (let operand of ["+", "-", "*", "/", "<", ">"]) {
    globalScope[operand] = new Function("a", "b", `return a ${operand} b`);
}
// add array funcionality
globalScope["array"] = new Function("...args", "return args;");
globalScope["length"] = new Function("array", "if (arguments.length !== 1) throw new SyntaxError('Wrong number of arguments'); let length = array.length; if (length === undefined) throw new SyntaxError('Expecting an array'); return length;");
globalScope["element"] = new Function("array", "n", "if (arguments.length !== 2) throw new SyntaxError('Wrong number of arguments'); let element = array[n]; if (element === undefined) throw new SyntaxError('Expecting an array'); return element;")

testThrow(
    evaluate,
    null,
    [
        createApply("fun"),
        {scope: null}
    ],
    new SyntaxError("Function needs a body")
);


let customFunc = specialForms.fun(
    [
        createWord("param1"),
        createWord("param2"),
        createApply("+", createWord("param1"), createWord("param2"))
    ],          // args
    globalScope // scope
);

addTest(
    customFunc,
    null,
    [5, 6],
    11
);
testThrow(
    customFunc,
    null,
    [8],
    new SyntaxError("Wrong number of arguments")
)
testThrow(
    customFunc,
    null,
    [8, 2, 5],
    new SyntaxError("Wrong number of arguments")
)

addTest(
    globalScope["+"],
    null,
    [5, 6],
    11
);
addTest(
    globalScope["-"],
    null,
    [5, 6],
    -1
);

console.log(
    evaluate(
        createApply("array",
            createValue("6"),
            createValue("7"),
            createValue("8")
        ),
        globalScope
    )
);

addTest(
    globalScope["length"],
    null,
    [[1, 2, 3, 4, 5]],
    5
);
testThrow(
    globalScope["length"],
    null,
    [5],
    new SyntaxError("Expecting an array")
);
testThrow(
    globalScope["length"],
    null,
    [[1, 2, 3, 4, 5], 3],
    new SyntaxError('Wrong number of arguments')
);
addTest(
    globalScope["element"],
    null,
    [[2, 3], 1],
    3
);
testThrow(
    globalScope["element"],
    null,
    [2, 3],
    new SyntaxError("Expecting an array")
);
testThrow(
    globalScope["length"],
    null,
    [[2, 3], 1, 3],
    new SyntaxError('Wrong number of arguments')
);