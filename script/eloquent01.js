//////////
// Chap 8 excercises
//////////

class MultiplicatorUnitFailure extends Error {};

// Retry
function isLucky(percentage) {
    let someNum = Math.random() * 100; // [0-100)
    return someNum < percentage;
}
function primitiveMultiply(num1, num2) {
    while (true) {
        try {
            if (isLucky(20)) return num1 * num2;
            else throw new MultiplicatorUnitFailure();
        }
        // retry if MultiplecatorUnitFailure was caught
        catch(error) {
            if (! error instanceof MultiplicatorUnitFailure) {
                throw error;
            }
        }
    }
}

addTest(primitiveMultiply, null, [2, 3], 6);

// The locked box
const box = {
    locked: true,
    _content: [],
    
    unlock() {
        this.locked = false;
    },
    lock() {
        this.locked = true;
    },
    get content() {
        if (this.locked) throw new Error("Locked!");
        return this._content;
    }
};

function doNothing() {}
function throwSomething() {throw new Error();}
function withBoxUnlocked(box, func) {
    let isLockedInit = box.locked;
    try {
        box.unlock();
        func();
    }
    catch (e) {}
    if (isLockedInit) box.lock();
}
function withBoxUnlockedTester(initLockState, func) {
    box.locked = initLockState;
    withBoxUnlocked(box, func);
    return box.locked;
}

addTest(withBoxUnlockedTester, null, [true, doNothing], true);
addTest(withBoxUnlockedTester, null, [false, doNothing], false);
addTest(withBoxUnlockedTester, null, [true, throwSomething], true);
addTest(withBoxUnlockedTester, null, [false, throwSomething], false);

// testRunner.run();
// testRunner.printResult();

// chap 14 excercises

function searchTagNames(tagName) {
    // debugger;
    let doc = document.documentElement;

    searchTagNamesImpl = function(node) {
        let childNodes = Array.from(node.childNodes);
        let tags = []

        childNodes.map((childNode) => {
            // if (tagName === childNode.nodeName)
            tags.push(childNode.nodeName);
            let childTags = searchTagNamesImpl(childNode);
            tags = tags.concat(childTags);
        });

        return tags;
    }

    return searchTagNamesImpl(doc);
}

let chapter14_ElementsByTagName = {
    inputId: "tagName",

    getContentFromInput: function(inputId) {
        return document.getElementById(inputId).value;
    },
    
    myGetElementByTagName: function(tagName) {
        let doc = document.documentElement;
    
        // recursive program
        // returns all children of "node" if children's nodeName matches "tagname" arg
        // recurse the same process to each children
        myGetElementByTagNameImpl = (node, tagName) => {
            let childNodes = Array.from(node.childNodes);
            let nodes = [];
    
            childNodes.map( childNode => {
                if (childNode.nodeName.toLowerCase() === tagName) {
                    nodes.push(childNode);
                }
    
                nodes = nodes.concat(myGetElementByTagNameImpl(childNode, tagName));
            });
    
            return nodes;
        }
    
        return myGetElementByTagNameImpl(doc, tagName);
    },

    printElementsByTagNameToConsole: function() {
        let tagName = this.getContentFromInput(this.inputId);
        console.log(this.myGetElementByTagName(tagName));
    }
}