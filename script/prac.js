class Class1 {
    constructor() {
        this.someprop = 2;
    }
}
Class1.prototype.somePFunc = function() {
    console.log(this.someprop);
}

let someclass = new Class1();
someclass.somePFunc();

let someObj = {someprop: 5};
someObj.somePFunc = Class1.prototype.somePFunc;
someObj.somePFunc();

class Class3 {
    constructor() {
        this.someprop = 999;
    }
    somePFunc() {
        console.log(this.someprop);
    }
}
class Class4 extends Class3 {
    constructor() {
        super();
        this.someprop = 2000;
    }
}

let class4 = new Class4();
class4.somePFunc();
console.log(class4);