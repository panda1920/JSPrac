// Constructor function

function Dog(name, age) {
    this.name = name;
    this.age  = age;
}
Dog.prototype.greeting = function() {
    console.log(`My name is ${this.name} and I am ${this.age} years old`);
};

let myDog  = new Dog("puppy", 1);
let hisDog = new Dog("lumpy", 2)

myDog.greeting();
console.log(myDog);
console.log(myDog.constructor); // objects created by constructor will have reference to the very function constructed it inside its prototype chain

hisDog.greeting();
console.log(hisDog);

// If new creates an empty object and runs the constructor in its context,
// Can we mimic it using apply() or call()?
let someObj = {};
console.log("Some obj: ");
console.log(someObj);

Dog.apply(someObj, ["Bob", 22]);
console.log("Some obj after apply(): ");
console.log(someObj);
// someObj.greeting(); // an error; Dog's prototype will have nothing to do with someObj's prototype

// prototypal inheritance
// creates an empty object with prototype reference to the argument's object
let rudeDog = Object.create(new Dog("Zack", 3));

// creating a new property on the object will hide the function with same name on prototype
rudeDog.greeting = function() {
    console.log("You don't need to know who I am");
}

rudeDog.greeting();
console.log(rudeDog);
console.log(rudeDog.name);
console.log(rudeDog.constructor);

// checking undefined is falsey

function funcCheckArg(arg1, arg2, arg3) {
    console.log(arg1);
    console.log(arg2);
    console.log(arg3);
    isTruthy(arg1, "arg1");
    isTruthy(arg2, "arg2");
    isTruthy(arg3, "arg3");
}
function isTruthy(arg, str) {
    if (arg) {
        console.log(`${str} is truthy`);
    }
    else {
        console.log(`${str} is falsey`);
    }
}

funcCheckArg(1);
funcCheckArg(1, 2);
funcCheckArg(1, 2, 3);

// Using greetr
let g = Greetr("Bob", "Marley", "en");
console.log(g.fullName());
console.log(g.greeting());
console.log(g.formalGreeting());

g.greet();
g.greet(true);
g.setLang("es").greet();

$(document).ready(function() {
    // g.updateWithGreeting("#greeting");

    // add click event
    $("#Login").click(function() {
        $("#logindiv").hide();
        g.setLang($("#lang").val());
        g.updateWithGreeting("#greeting", true).log();
    });
});