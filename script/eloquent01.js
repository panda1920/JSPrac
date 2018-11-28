//////////
// Utility functions
//////////
function test(func, args, expectedVal) {
    let retVal;
    let msg = `Test of ${func.name}() with args [${args}] has `;
    let exceptionFlag = false;
    
    // run func
    try {
        retVal = func.apply(null, args);
    }
    catch (e) {
        exceptionFlag = true;
    }

    // genereate message
    msg += (retVal === expectedVal) ? "succeeded!" : "failed!";
    msg += exceptionFlag ? " with exception!" : "";

    console.log(msg);
}

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

test(primitiveMultiply, [2, 3], 6); // should output 6

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
    catch (e) {
        if (isLockedInit) box.lock();
    }
}
function withBoxUnlockedTester(initLockState, func) {
    box.locked = initLockState;
    withBoxUnlocked(box, func);
    return box.locked;
}

test(withBoxUnlockedTester, [true, doNothing], true);
test(withBoxUnlockedTester, [false, doNothing], false);
test(withBoxUnlockedTester, [true, throwSomething], true);
test(withBoxUnlockedTester, [false, throwSomething], false);
