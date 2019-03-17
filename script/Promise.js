// #####Promise#####
// my attempt to undestand how promise works in JS

console.log("#####Promise START#####");

// create a promise by passing a simple value to resolve()
// this creates a promise that immediately resolves to the value given
// promise can either resolve or reject.
let p = Promise.resolve(20);
// use then() method to register callbacks to be called when promise resolves.
p.then(result => {
    console.log(`p resolved to ${result}`);
    return 15;
}).then(finalResult => {
    console.log(`p's promise resolved to ${finalResult}`)
});
// multiple callbacks can be registered on a promise object
// callbacks return a promise object, which gets passed on to the next callback

// promises that will immediately reject
let pR = Promise.reject(12);
pR.then(result => {
    console.log(`pR resolved to ${result}`);
}).catch(result => { // catch() method regsiters a callback for rejection, as opposed to resolve
    console.log(`pR rejected to ${result}`);
});
// pR rejected to 12
// callback on then() would not be called

// let pRNoHandler = Promise.reject(11);
let pNoHandler = Promise.resolve(() => {console.log("resolve without handlers"); return 2;});
// promises that reject, with no handler, raises an exception
// resolved promises would not do this
// promise would not be excecuted unless then() is invoked.

// creating promise out of constructor  
function timeoutCall(t) {
    return new Promise(resolve => {
        setTimeout(resolve, t);
    });
}
timeoutCall(5000).then(() => {console.log("hi!")});
// timeoutCall(5000);

// is it possible to chain catch() callbacks
// yes it is
let pTwoReject = new Promise(function(resolve, reject) {
    throw new Error("First error thrown");
})
.then(() => {
    console.log("First resolve for pTwoReject");
}, (e) => {
    console.log("First reject for pTwoReject");
    console.log(e.message)
    throw new Error("Second error thrown");
})
.then(() => {
    console.log("Second resolve for pTwoReject");
}, (e) => {
    console.log("Second reject for pTwoReject");
    console.log(e.message)
})

// function signature for callbacks passed to then(), catch()
    // function that takes one optional argument.
    // the result of resolution/rejection would be passed as an argument.
    // When a value is returned, its passed to the next callback registered by then() or catch()
// signagture for callbacks passed to ctor
    // I am seeing callback with two arguments(resolve, reject) being passed to Promise ctor.

let promiseExperiment = new Promise((resolve, reject) => {
    return resolve(111); // calling resolve callback would resolve
}).then((result) => {
    console.log(`promiseExperiment: resolved to ${result}`);
    return 11; // can return a raw value, which would also resolve
}).then((result) => {
    console.log(`promiseExperiment: resolved to ${result}`);
    return Promise.resolve(222); // can return another nested promise, and if that is resolved, so is this promise
// }).then((result) => {
//     console.log(`promiseExperiment: resolved to ${result}`);
//     return reject(333); // calling reject callback would reject
// only works in the callback passed in constructor
}).then(result => {
    console.log(`promiseExperiment: resolved to ${result}`);
    throw new Error("444"); // throwing exception would reject too
}).catch((reason) => {
    console.log(`promiseExperiment: rejected to ${reason}`);
    return Promise.reject(555); // can return another nested promise, and if that is rejected, so is this promise
}).catch(reason => {
    console.log(`promiseExperiment: rejected to ${reason}`);
});


// notes
let nest = {};
nest.readStorage = function (name, callback) {
    // finds information about a certain cache asynchronously by calling callbacks
};
nest.send = function(name, type, msg, callback) {
    // send a msg to another nest with name <name>
    // when a msg is returned from the other nest, callback <callback> is called
};
let defineRequestType = function(type, callback) {
    // defines how to respond to a message type <type>
    // <callback> is called when such message is received
}
let storage = function(nest, name) {
    // creates promise based interface for readStorage function
    return new Promise(resolve => {
        nest.readStorage(name, result => resolve(result));
    });
};
let request = function(nest, target, type, content) {
    // sends request using send() to target nest <target> with promise based interface
    // retries request up to 3 times before it give up and rejects
};
let requestType = function(name, handler) {
    // calls defineRequestType()
    // promise based interface used in callback passed to defineRequestType()
    // <handler> called in promise ctor
};

let availableNeighbors = function(nest) {
    // Uses Promise.all()
    // deals with collection of promsies
    // waits for all promise in the collection to finish resolving
    // and only resolves when all the promises resolve
    
    // promise based interface that returns a list of promises
    // which responded to the "ping" message sent to all its neighbors
};

let everywhere = function(callback) {
    // runs callback() on every nest that exists on the system
}

let broadcastConnections = function (nest, name, exceptFor = Null) {
    // request message type "connection" to all neighbors of nest <nest>
    // except neighbor <exceptFor>
    // request(nest, neighbor, "connections", {name, neighbors: nest.state.connections.get(name)});

    // basically lets neighbors know about the <nest>'s neighbors
};

let findRoute = function(from, to, connections) {
    // finds the next nest to hop to
};

let routeRequest = function (nest, target, type, content) {
    // send request of type <type> if target is immediate neighbor
    // if not, route request of type "route" to the next neighbor
    // using findRoute()
};

let findInRemoteStorage = function(nest, name) {

};

async function checkAsync() {
    console.log("### START checkAsync() ###");

    let somePromise = new Promise((resolve) => {
        console.log("Executing a promise!");
        return resolve(1);
    });
    let someVal = await somePromise.then(result => result);
    console.log("Async promise returned: " + someVal);
    
    somePromise = new Promise((resolve) => {
        console.log("Executing a promise!");
        return resolve(2);
    });
    someVal = await somePromise.then(result => result);
    console.log("Async promise returned: " + someVal);

    console.log("### END checkAsync() ###");
}

checkAsync();
console.log("#####Promise END#####");