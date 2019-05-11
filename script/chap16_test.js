//--------------------------------------------------
// test codes for chap16
//--------------------------------------------------

//
// testing level creation
//

let someplan = `
.||v.........................................
.|..........oo.....................@.#.......
.|..........#......................#.........
.|..........########################.........
+++++++++...++++++++++#=...#.................
`;

/*
01234567890123456789012345678901234567890123
*/

let newlevel = new Level(someplan);

function testLevelCreatedProperties(level) {
    return (
        // test properties
        level.height === 5 &&
        level.width  === 45 &&
        level.startActors.length === 10
    );
}
function testLevelCreatedStartActors(level) {
    return (
        level.startActors[0].type === "lava"
    );
}
function testLevelCreatedStaticEntity(level) {
    return (
        level.rows[0][0].type === "empty" &&
        level.rows[0][1].type === "empty" && // square behind active entity is empty
        level.rows[0][3].type !== "wall"
    );
}

addTest(testLevelCreatedProperties, null, [newlevel], true);
addTest(testLevelCreatedStartActors, null, [newlevel], true);
addTest(testLevelCreatedStaticEntity, null, [newlevel], true);

//
// test collision
//

addTest(newlevel.touches, newlevel, [new Vec(0, 0), new Vec(1, 1), "empty"], true);
addTest(newlevel.touches, newlevel, [new Vec(0, 0), new Vec(1, 1), "randomentity"], false);
addTest(newlevel.touches, newlevel, [new Vec(4, 0), new Vec(1, 1), "lava"], false);
// vertical laval is an active entity and it does not appear 
addTest(newlevel.touches, newlevel, [new Vec(0, 1), new Vec(1, 1), "lava"], false);
addTest(newlevel.touches, newlevel, [new Vec(0, 1), new Vec(1, 1), "empty"], true);
// test that position outside bounds are all considered wall
addTest(newlevel.touches, newlevel, [new Vec(-1, -1), new Vec(1, 1), "wall"], true);
addTest(newlevel.touches, newlevel, [new Vec(100, 100), new Vec(1, 1), "wall"], true);
// test for non-integer position
// all surrounding position are examined
addTest(newlevel.touches, newlevel, [new Vec(0.5, 0.5), new Vec(1, 1), "empty"], true);
addTest(newlevel.touches, newlevel, [new Vec(3.5, 15), new Vec(1, 1), "wall"], true);

//
// test overlap
//

// four squares of the topleft corner of new level
let someEntity1 = newlevel.rows[0][0];
let someEntity2 = newlevel.rows[0][1];
let someEntity3 = newlevel.rows[1][0];
let someEntity4 = newlevel.rows[1][1];
// some random player placed on square (1, 1)
// player's height is 1.5, width is 0.8; it must touch entity2 and 4
let dummyPlayer = EntityFactory.createEntity("@", new Vec(1, 1));
addTest(someEntity1.overlap, someEntity1, [dummyPlayer], false);
addTest(someEntity1.overlap, someEntity2, [dummyPlayer], true);
addTest(someEntity1.overlap, someEntity3, [dummyPlayer], false);
addTest(someEntity1.overlap, someEntity4, [dummyPlayer], true);

//
// test collide
//

function testStateAtCollision(gamestate, mapentity, expectedStatus) {
    let newState = mapentity.collide(gamestate);
    return newState.status === expectedStatus;
}
function testCollide_againstLava() {
    let testCollide_gameState = State.start(newlevel);
    let testCollide_lava = testCollide_gameState.actors.filter(actor => actor.type === "lava")[0];

    return testStateAtCollision(testCollide_gameState, testCollide_lava, "lost");
}

function testCollide_againstCoin() {
    let testCollide_gameState = State.start(newlevel);
    let testCollide_coin = testCollide_gameState.actors.filter(actor => actor.type === "coin")[0];

    return testStateAtCollision(testCollide_gameState, testCollide_coin, "playing");
}
function testCollide_againstLastCoin() {
    let testCollide_gameState = State.start(newlevel);
    let testCollide_coin = testCollide_gameState.actors.filter(actor => actor.type === "coin")[0];
    
    // remove all coins in state except what we are using
    let actorsWithoutCoin = testCollide_gameState.actors.filter(actor => actor.type !== "coin");
    testCollide_gameState.actors = [testCollide_coin, ...actorsWithoutCoin];

    return testStateAtCollision(testCollide_gameState, testCollide_coin, "won");
}


addTest(testCollide_againstLava, null, [], true);
addTest(testCollide_againstCoin, null, [], true);
addTest(testCollide_againstLastCoin, null, [], true);

//
// test update methods on entity
//

function testUpdate_coin() {
    let testUpdate_gamestate = State.start(new Level(someplan));
    let coin = testUpdate_gamestate.actors.filter(actor => actor.type === "coin")[0];

    let oldWobble = coin.wobble;
    coin.update(1, testUpdate_gamestate, null);

    return (
        oldWobble + WOBBLE_SPEED === coin.wobble &&
        coin.basepos.y + Math.sin(coin.wobble) * WOBBLE_DIST === coin.pos.y
    );
}
function testUpdate_verticalLava() {
    let level = new Level(someplan);
    let testUpdate_gamestate = State.start(level);
    let vlava = testUpdate_gamestate.actors.filter(actor => actor.type === "lava" && actor.pos.x === 2 && actor.pos.y === 0 )[0];

    vlava.update(1, testUpdate_gamestate, null);

    return vlava.pos.y === 2;
}
function testUpdate_verticalLavaCollide() {
    let level = new Level(someplan);
    let testUpdate_gamestate = State.start(level);
    let vlava = testUpdate_gamestate.actors.filter(actor => actor.type === "lava" && actor.pos.x === 2 && actor.pos.y === 0 )[0];

    // set lava position to the lower edge of level
    vlava.pos = new Vec(2, 4);
    vlava.update(0.1, testUpdate_gamestate, null);

    return (
        vlava.pos.y === 4 - 0.1 * 2 &&
        vlava.speed.y === -2
    )
}
function testUpdate_horizontalLava() {
    let level = new Level(someplan);
    let testUpdate_gamestate = State.start(level);
    let hlava = testUpdate_gamestate.actors.filter(actor => actor.type === "lava" && actor.speed.x > 0 )[0];

    let oldXpos = hlava.pos.x;
    hlava.update(0.1, testUpdate_gamestate, null);

    return (
        hlava.speed.x * 0.1 + oldXpos === hlava.pos.x
    )
}
function testUpdate_horizontalLavaCollide() {
    let level = new Level(someplan);
    let testUpdate_gamestate = State.start(level);
    let hlava = testUpdate_gamestate.actors.filter(actor => actor.type === "lava" && actor.speed.x > 0 )[0];

    // set hlava right next to a wall
    let oldXpos = hlava.pos.x = hlava.pos.x + 3;
    hlava.update(0.1, testUpdate_gamestate, null);

    return (
        hlava.speed.x === -2 &&
        hlava.speed.x * 0.1 + oldXpos === hlava.pos.x
    );
}
function testUpdate_resetLava() {
    let level = new Level(someplan);
    let testUpdate_gamestate = State.start(level);
    let rlava = testUpdate_gamestate.actors.filter(actor => actor.type === "lava" && actor.pos.x === 3 && actor.pos.y === 0 )[0];

    let oldpos = Object.assign({}, rlava.pos);
    rlava.update(0.1, testUpdate_gamestate, null);

    return (
        oldpos.y + 0.1 * rlava.speed.y === rlava.pos.y &&
        oldpos.x === rlava.pos.x
    );
}
function testUpdate_resetLavaReturn() {
    let level = new Level(someplan);
    let testUpdate_gamestate = State.start(level);
    let rlava = testUpdate_gamestate.actors.filter(actor => actor.type === "lava" && actor.pos.x === 3 && actor.pos.y === 0 )[0];

    // relocate rlava to the bottom edge of map
    rlava.pos.y = 4;

    rlava.update(0.1, testUpdate_gamestate, null);

    return (
        rlava.reset.x === rlava.pos.x &&
        rlava.reset.y === rlava.pos.y &&
        rlava.speed.y === 3
    );
}
function testPlayer_right() {
    let level = new Level(someplan);
    let testPlayer_gamestate = State.start(level);
    let player = testPlayer_gamestate.player;
    let keys = {ArrowLeft: false, ArrowRight: true, ArrowUp: false};

    let oldPos = Object.assign({}, player.pos);
    player.update(0.1, testPlayer_gamestate, keys);
    let newPos = Object.assign({}, player.pos);

    return (
        player.speed.x === PLAYER_SPEED_X &&
        newPos.x === oldPos.x + 0.1 * PLAYER_SPEED_X &&
        newPos.y === oldPos.y
    );
}
function testPlayer_rightCollision() {
    let level = new Level(someplan);
    let testPlayer_gamestate = State.start(level);
    let player = testPlayer_gamestate.player;
    let keys = {ArrowLeft: false, ArrowRight: true, ArrowUp: false};

    // set player pos next to a wall, wall directly to player's right
    player.pos.x = 34;
    player.pos.y = 1.5;
    player.update(0.1, testPlayer_gamestate, keys);

    let newPos = Object.assign({}, player.pos);

    return (
        newPos.x === 34 &&
        newPos.y === 1.5 &&
        player.speed.x === 0
    );
}
function testPlayer_left() {
    let level = new Level(someplan);
    let testPlayer_gamestate = State.start(level);
    let player = testPlayer_gamestate.player;
    let keys = {ArrowLeft: true, ArrowRight: false, ArrowUp: false};

    let oldPos = Object.assign({}, player.pos);
    player.update(0.1, testPlayer_gamestate, keys);
    let newPos = Object.assign({}, player.pos);

    return (
        player.speed.x === -PLAYER_SPEED_X &&
        newPos.x === oldPos.x + 0.1 * -PLAYER_SPEED_X &&
        newPos.y === oldPos.y
    );
}
function testPlayer_leftCollision() {
    let level = new Level(someplan);
    let testPlayer_gamestate = State.start(level);
    let player = testPlayer_gamestate.player;
    let keys = {ArrowLeft: true, ArrowRight: false, ArrowUp: false};

    // set player pos next to a wall, wall directly to player's left
    player.pos.x = 13;
    player.pos.y = 1.5;
    player.update(0.1, testPlayer_gamestate, keys);

    let newPos = Object.assign({}, player.pos);

    return (
        newPos.x === 13 &&
        newPos.y === 1.5 &&
        player.speed.x === 0
    );
}
function testPlayer_freeFall() {
    let level = new Level(someplan);
    let testPlayer_gamestate = State.start(level);
    let player = testPlayer_gamestate.player;
    let keys = {ArrowLeft: false, ArrowRight: false, ArrowUp: false};

    // set player position where it is not standing on a wall
    player.pos.x += 1;

    let oldPos = Object.assign({}, player.pos);
    player.update(0.1, testPlayer_gamestate, keys);
    let newPos = Object.assign({}, player.pos);

    return (
        player.speed.y === PLAYER_ACCEL_GRAVITY * 0.1 &&
        newPos.y === oldPos.y + (PLAYER_ACCEL_GRAVITY * 0.1) * 0.1
    );
}
function testPlayer_noFreeFallOnWall() {
    let level = new Level(someplan);
    let testPlayer_gamestate = State.start(level);
    let player = testPlayer_gamestate.player;
    let keys = {ArrowLeft: false, ArrowRight: false, ArrowUp: false};

    let oldPos = Object.assign({}, player.pos);
    player.update(0.1, testPlayer_gamestate, keys);
    let newPos = Object.assign({}, player.pos);

    return (
        player.speed.y === 0 &&
        newPos.y === oldPos.y
    );
}
function testPlayer_noJumpDuringFreeFall() {
    let level = new Level(someplan);
    let testPlayer_gamestate = State.start(level);
    let player = testPlayer_gamestate.player;
    let keys = {ArrowLeft: false, ArrowRight: false, ArrowUp: true};

    // set player position where it is not standing on a wall
    player.pos.x += 1;

    let oldPos = Object.assign({}, player.pos);
    player.update(0.1, testPlayer_gamestate, keys);
    let newPos = Object.assign({}, player.pos);

    return (
        player.speed.y === (PLAYER_ACCEL_GRAVITY * 0.1)  &&
        newPos.y === oldPos.y + (PLAYER_ACCEL_GRAVITY * 0.1) * 0.1
    );
}
function testPlayer_NoFreeFallOnWall() {
    let level = new Level(someplan);
    let testPlayer_gamestate = State.start(level);
    let player = testPlayer_gamestate.player;
    let keys = {ArrowLeft: false, ArrowRight: false, ArrowUp: false};

    let oldPos = Object.assign({}, player.pos);
    player.update(0.1, testPlayer_gamestate, keys);
    let newPos = Object.assign({}, player.pos);

    return (
        player.speed.y === 0  &&
        newPos.y === oldPos.y
    );
}
function testPlayer_jumpDuringNoFreeFall() {
    let level = new Level(someplan);
    let testPlayer_gamestate = State.start(level);
    let player = testPlayer_gamestate.player;
    let keys = {ArrowLeft: false, ArrowRight: false, ArrowUp: true};

    let oldPos = Object.assign({}, player.pos);
    player.update(0.1, testPlayer_gamestate, keys);
    let newPos = Object.assign({}, player.pos);

    return (
        player.speed.y === PLAYER_SPEED_JUMP &&
        newPos.y === oldPos.y
    );
}
function testPlayer_noJumpVerticalCollision() {
    let level = new Level(someplan);
    let testPlayer_gamestate = State.start(level);
    let player = testPlayer_gamestate.player;
    let keys = {ArrowLeft: false, ArrowRight: false, ArrowUp: true};

    // set player to a position where it bumps its head when jump
    player.pos.x += 2;
    player.pos.y -= 1;

    let oldPos = Object.assign({}, player.pos);
    player.update(0.1, testPlayer_gamestate, keys);
    let newPos = Object.assign({}, player.pos);

    return (
        player.speed.y === 0 &&
        newPos.y === oldPos.y
    );
}

/*
    stationary
    freefall
    jump

    stationary > jump > freefall
*/

addTest(testUpdate_coin, null, [], true);
addTest(testUpdate_verticalLava, null, [], true);
addTest(testUpdate_verticalLavaCollide, null, [], true);
addTest(testUpdate_horizontalLava, null, [], true);
addTest(testUpdate_horizontalLavaCollide, null, [], true);
addTest(testUpdate_resetLava, null, [], true);
addTest(testUpdate_resetLavaReturn, null, [], true);
addTest(testPlayer_right, null, [], true);
addTest(testPlayer_rightCollision, null, [], true);
addTest(testPlayer_left, null, [], true);
addTest(testPlayer_leftCollision, null, [], true);
addTest(testPlayer_freeFall, null, [], true);
addTest(testPlayer_noFreeFallOnWall, null, [], true);
addTest(testPlayer_noJumpDuringFreeFall, null, [], true);
addTest(testPlayer_jumpDuringNoFreeFall, null, [], true);
