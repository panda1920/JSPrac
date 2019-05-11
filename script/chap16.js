//--------------------------------------------------
// eloquent js chapter 16
// 
// implementing a simple game
// a classic side-scroll where player's job is to acquire coins on the map
//--------------------------------------------------

// size of game entities
const SCALE_SIZE = 20;
// wobble motion of coins on map
const WOBBLE_SPEED = 8;
const WOBBLE_DIST = 0.07;
// speed of player
const PLAYER_SPEED_X = 7;
const PLAYER_SPEED_JUMP = -17;
const PLAYER_ACCEL_GRAVITY = 30;

// represents two dimensional vector
class Vec {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
    // vector addition
    plus(other) {
        return new Vec(this.x + other.x, this.y + other.y);
    }
    // scales vector
    times(factor) {
        return new Vec(this.x * factor, this.y * factor);
    }
}

// factory class
class EntityFactory {
    static createEntity(char, pos) {
        let type = ""
        switch (char) {
            case "@": {
                type = "player";
                return new Player(type, pos);
            }
            case "=": {
                type = "lava";
                return new Lava(type, pos, new Vec(2, 0));
            }
            case "|": {
                type = "lava";
                return new Lava(type, pos, new Vec(0, 2));
            }
            case "v": {
                type = "lava";
                return new Lava(type, pos, new Vec(0, 3), pos);
            }
            case "o": {
                type = "coin";
                return new Coin(type, pos);
            }
            case ".": type = "empty"; break;
            case "+": type = "lava"; break;
            case "#": type = "wall"; break;
            default:  type = "wall"; break;
        }

        return new StaticEntity(type, pos);
    }

    static isDynamicEntity(char) {
        switch(char) {
            case "@":
            case "=":
            case "|":
            case "v":
            case "o":
                return true;
            default:
                return false;
        }
    }
}

// Map entities
class MapEntity {
    constructor(type, pos) {
        this.type = type;
        this.pos = pos;
    }
    // checks if this and otherEntity overlaps one another
    overlap(otherEntity) {
        return (
            this.pos.x + this.size.x > otherEntity.pos.x &&
            this.pos.x < otherEntity.pos.x + otherEntity.size.x &&
            this.pos.y + this.size.y > otherEntity.pos.y &&
            this.pos.y < otherEntity.pos.y + otherEntity.size.y
        );
    }
}
// default size for all map entities
MapEntity.prototype.size = new Vec(1, 1);

class StaticEntity extends MapEntity {
    constructor(type, pos) {
        super(type, pos);
    }
}
class Player extends MapEntity {
    constructor(type, pos) {
        super(type, pos.plus(new Vec(0, -0.5)));
        this.speed = new Vec(0, 0);
        this.size = new Vec(0.8, 1.5);
    }
    update(time, state, keys) {
        // calculate next position
        let nextSpeed = this.calcInitialSpeed(keys, time);
        let nextPos = this.pos.plus(nextSpeed.times(time));

        // determine collision; if collision happens, player cannot move in that direction
        // horizontal collision
        if (state.level.touches(new Vec(nextPos.x, this.pos.y), this.size, "wall")) {
            nextSpeed.x = 0;
        }
        // collision against freefall
        if (state.level.touches(new Vec(this.pos.x, nextPos.y), this.size, "wall")) {
            nextSpeed.y = 0;
        }

        this.pos = this.pos.plus(nextSpeed.times(time));
        
        // deal with jumps
        // happens only when player is not moving vertically
        // only alter speed; pos will be affected from the next time frame
        if (nextSpeed.y === 0 && keys.ArrowUp) {
            nextSpeed.y += PLAYER_SPEED_JUMP;
        }
        this.speed = nextSpeed;
    }
    // calculate speed of player at start of timeframe
    calcInitialSpeed(keys, time) {
        let xspeed = 0;
        let yspeed = this.speed.y + time * PLAYER_ACCEL_GRAVITY;

        if (keys.ArrowLeft)  xspeed -= PLAYER_SPEED_X;
        if (keys.ArrowRight) xspeed += PLAYER_SPEED_X;
        
        return new Vec(xspeed, yspeed);
    }
}
class Lava extends MapEntity {
    constructor(type, pos, speed, reset) {
        super(type, pos);
        this.speed = speed;
        this.reset = reset;
    }
    update(time, state) {
        let nextpos = this.pos.plus(this.speed.times(time));
        // vertical hit-a-wall-check
        if (state.level.touches(new Vec(this.pos.x, nextpos.y), this.size, "wall")) {
            // if there is a reset, do that and return
            if (this.reset) {
                this.pos = this.reset; return;
            }
            // not a reset
            this.speed.y = 0 - this.speed.y;
        }
        // horizontal hit-a-wall-check
        if (state.level.touches(new Vec(nextpos.x, this.pos.y), this.size, "wall")) {
            this.speed.x = 0 - this.speed.x;
        }
        // calculate new position based on renewed speed
        let newpos = this.pos.plus(this.speed.times(time));
        this.pos = newpos;
    }
    // returns new state when player makes collision with this
    collide(state) {
        return new State(state.level, state.actors, "lost");
    }
}
class Coin extends MapEntity {
    constructor(type, pos) {
        let basepos = pos.plus(new Vec(0.2, 0.1));
        super(type, basepos);
        this.basepos = basepos;
        this.wobble = Math.random() * Math.PI * 2;
        this.size = new Vec(0.6, 0.6);
    }
    update(time, state) {
        this.wobble      = this.wobble + time * WOBBLE_SPEED;
        let wobbleOffset = Math.sin(this.wobble) * WOBBLE_DIST;
        this.pos = this.basepos.plus(new Vec(0, wobbleOffset));
    }
    // returns new state when player makes collision with this
    collide(state) {
        let allOtherActors = state.actors.filter(actor => actor !== this);
        // if no more coin, win
        let newStatus = allOtherActors.some(actor => actor.type === "coin") ? state.status : "won";
        return new State(state.level, state.actors, newStatus);
    }
}

// creates a data structure representing a game level from a string
class Level {
    constructor(plan) {
        // keeps track of dynamic map entities
        this.startActors = [];

        // create a grid of static map entity
        let rows = plan.trim().split("\n").map(
            (row, y) => [...(row.trim())].map(
                (char, x) => {
                    // if target square is occpuied by dynamic entity, the square behind it is assumed to be "empty"
                    if (EntityFactory.isDynamicEntity(char)) {
                        this.startActors.push(EntityFactory.createEntity(char, new Vec(x, y)));
                        return EntityFactory.createEntity(".", new Vec(x, y));
                    }
                    else {
                        return EntityFactory.createEntity(char, new Vec(x, y));
                    }
                }
            )
        );

        this.height = rows.length;
        this.width  = rows[0].length;
        this.rows = rows;
    }
    // determines if an entity of a given "pos", "size"
    // touches a static map entity of targetType
    touches(pos, size, targetType) {
        let minX = Math.floor(pos.x);
        let minY = Math.floor(pos.y);
        let maxX = Math.ceil(pos.x + size.x);
        let maxY = Math.ceil(pos.y + size.y);

        // check all position occupied by arguments "pos", "size"
        for (let y = minY; y < maxY; ++y) {
            for (let x = minX; x < maxX; ++x) {
                let posToCheck = new Vec(x, y);
                let entityTypeAtPosToCheck;
                
                // deal with cases where posToCheck is out of bounds
                if (this.isInBounds(posToCheck)) {
                    entityTypeAtPosToCheck = this.rows[posToCheck.y][posToCheck.x].type;
                }
                else {
                    // anything out of bounds assumed to be wall
                    entityTypeAtPosToCheck = "wall";
                }
                // if posToCheck is found to touch targetType, return immediately
                if (entityTypeAtPosToCheck === targetType) return true;
            }
        }

        return false;
    }

    // checks to see if pos is within game level
    isInBounds(pos) {
        return pos.x >= 0 && pos.x < this.width && pos.y >= 0 && pos.y < this.height;
    }
}

// creates html
class HtmlFactory {
    // create an html element and append child to it
    static elt(name, attrs, ...child) {
        let dom = document.createElement(name);
        for (let attr of Object.keys(attrs)) {
            dom.setAttribute(attr, attrs[attr]);
        }
        for (let c of child) {
            dom.appendChild(c);
        }
    
        return dom;
    }
    // converts level into html represented table
    static createHtmlForLevel(level) {
        return this.elt("table", {class: "background", style: `width: ${level.width * SCALE_SIZE}px`},
            ...level.rows.map(row => this.elt("tr", {style: `height: ${SCALE_SIZE}px`},
                ...row.map(entity => 
                    this.elt("td", {class: entity.type})
                )
            ))
        );
    }
    // creates html out of list of actors
    // bunch them up into one div element
    static createHtmlForActors(actors) {
        return this.elt("div", {}, ...actors.map(actor => {

            let actorHtml = this.elt("div", {class: `actor ${actor.type}`});
            actorHtml.style.left = `${actor.pos.x * SCALE_SIZE}px`;
            actorHtml.style.top = `${actor.pos.y * SCALE_SIZE}px`;
            actorHtml.style.width = `${actor.size.x * SCALE_SIZE}px`;
            actorHtml.style.height = `${actor.size.y * SCALE_SIZE}px`;

            return actorHtml;
        }));
    }
}

// displays the gamelevel "level" onto the given "parent" html element
class DomDisplay {
    constructor(parent, level) {
        this.dom = HtmlFactory.elt("div", {class: "game"}, HtmlFactory.createHtmlForLevel(level));
        this.actorLayer = null;
        parent.appendChild(this.dom);
    }
    // destroys game
    clear() {
        this.dom.remove();
    }
     // redraws the game according to the given state
     syncState(state) {
        if (this.actorLayer) this.actorLayer.remove();
        this.actorLayer = HtmlFactory.createHtmlForActors(state.actors);
        this.dom.appendChild(this.actorLayer);
        this.dom.className = `game ${state.status}`;
        this.scrollPlayerIntoView(state);
    }
    scrollPlayerIntoView(state) {

    }
}

// object keeps track of the current game state
class State {
    constructor(level, actors, status) {
        this.level = level;
        this.actors = actors;
        this.status = status;
        this.keys = this.trackKeys(["ArrowLeft", "ArrowRight", "ArrowUp"]);
    }
    // creates a new instance of game state
    static start(level) {
        return new State(level, level.startActors, "playing");
    }
    // returns player entity from actors
    get player() {
        return this.actors.find(a => a.type === "player");
    }
    // update this game's state
    update(time, keys) {
        // TODO: update actors
        // determine new state by examining player collision with lava/coin
    }
    // tracks the keys that are currently pressed down
    // returns an array of boolean values
    trackKeys(keys) {
        let pressedDown = Object.create(null);
        let keyHandler = function(event) {
            if (keys.includes(event.key)) {
                pressedDown[event.key] = event.type === "keydown";
                event.preventDefault();
            }
        }

        window.addEventListener("keydown", keyHandler);
        window.addEventListener("keyup", keyHandler);

        return pressedDown;
    }
}