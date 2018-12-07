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

testRunner.testCases.push(new TestCase(primitiveMultiply, [2, 3], 6));

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

testRunner.testCases.push(new TestCase(withBoxUnlockedTester, [true, doNothing], true));
testRunner.testCases.push(new TestCase(withBoxUnlockedTester, [false, doNothing], false));
testRunner.testCases.push(new TestCase(withBoxUnlockedTester, [true, throwSomething], true));
testRunner.testCases.push(new TestCase(withBoxUnlockedTester, [false, throwSomething], false));

// testRunner.run();
// testRunner.printResult();